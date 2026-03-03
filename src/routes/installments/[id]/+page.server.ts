import { prisma } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const plan = await prisma.installmentPlan.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                product: true,
                installments: {
                    orderBy: { serialNumber: 'asc' }
                    // Removed payments: true — huge performance win
                }
            }
        });

        if (!plan) {
            error(404, { message: 'Plan not found' });
        }

        return { plan: serializeDecimals(plan) };
    } catch (err: any) {
        if (err.status) throw err; // Re-throw SvelteKit errors
        console.error('DATABASE ERROR IN LEDGER LOAD:', err);
        error(500, { message: 'Database is currently unreachable.' });
    }
};

export const actions: Actions = {
    recordPayment: async ({ request }) => {
        const data = await request.formData();
        const installmentId = data.get('installmentId') as string;
        const amount = parseFloat(data.get('amount') as string);
        const method = data.get('method') as string || 'CASH';
        const paymentDateStr = data.get('paymentDate') as string;
        const paymentDateObj = paymentDateStr ? new Date(paymentDateStr) : new Date();

        if (!installmentId || isNaN(amount)) {
            return fail(400, { error: 'Missing or invalid fields' });
        }

        try {
            await prisma.$transaction(async (tx: any) => {
                const installment = await tx.installment.findUnique({
                    where: { id: installmentId },
                    select: {
                        id: true,
                        planId: true,
                        amount: true,
                        receivedAmount: true,
                        status: true,
                        paymentDate: true
                    }
                });

                if (!installment) throw new Error('Installment not found');

                const currentReceived = parseFloat(installment.receivedAmount.toString());
                const totalDue = parseFloat(installment.amount.toString());
                const newReceived = currentReceived + amount;

                let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PARTIAL';
                if (newReceived >= totalDue - 0.01) {
                    status = 'PAID';
                } else if (newReceived <= 0) {
                    status = 'UNPAID';
                }

                // Batch updates
                await Promise.all([
                    tx.payment.create({
                        data: {
                            installmentId,
                            amount,
                            method,
                            paymentDate: paymentDateObj
                        }
                    }),
                    tx.installment.update({
                        where: { id: installmentId },
                        data: {
                            receivedAmount: newReceived,
                            pendingAmount: Math.max(0, totalDue - newReceived),
                            status,
                            paymentDate: status === 'PAID' ? paymentDateObj : installment.paymentDate
                        }
                    }),
                    tx.installmentPlan.update({
                        where: { id: installment.planId },
                        data: {
                            remainingBalance: {
                                decrement: amount
                            }
                        }
                    })
                ]);

                // Efficiently check if we should close the plan
                // Only check if current installment just became PAID
                if (status === 'PAID') {
                    const remainingIncomplete = await tx.installment.count({
                        where: {
                            planId: installment.planId,
                            status: { not: 'PAID' }
                        }
                    });

                    if (remainingIncomplete === 0) {
                        await tx.installmentPlan.update({
                            where: { id: installment.planId },
                            data: { status: 'CLOSED' }
                        });
                    }
                }
            });
        } catch (err: any) {
            console.error('PAYMENT ERROR:', err);
            return fail(500, { error: err.message || 'Failed to record payment' });
        }

        return { success: true };
    }
};
