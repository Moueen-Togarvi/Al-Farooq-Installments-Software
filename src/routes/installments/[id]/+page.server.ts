import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
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
                    orderBy: { serialNumber: 'asc' },
                    include: {
                        payments: true
                    }
                }
            }
        });

        if (!plan) {
            return fail(404, { error: 'Plan not found' } as any);
        }

        return { plan: serializeDecimals(plan) };
    } catch (err: any) {
        console.error('DATABASE ERROR IN LEDGER LOAD:', err);
        return fail(500, { error: 'Database is currently unreachable. Please try again in a moment.' } as any);
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
                    include: { plan: true }
                });

                if (!installment) throw new Error('Installment not found');

                // Record payment
                const payment = await tx.payment.create({
                    data: {
                        installmentId,
                        amount,
                        method,
                        paymentDate: paymentDateObj
                    }
                });

                console.log(`Payment recorded: ${payment.id} for installment ${installmentId}`);

                // Update installment with robust decimal handling
                const currentReceived = parseFloat(installment.receivedAmount.toString());
                const totalDue = parseFloat(installment.amount.toString());
                const newReceived = currentReceived + amount;

                let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PARTIAL';
                if (newReceived >= totalDue - 0.01) { // Floating point safety
                    status = 'PAID';
                } else if (newReceived <= 0) {
                    status = 'UNPAID';
                }

                await tx.installment.update({
                    where: { id: installmentId },
                    data: {
                        receivedAmount: newReceived,
                        pendingAmount: Math.max(0, totalDue - newReceived),
                        status,
                        paymentDate: status === 'PAID' ? paymentDateObj : installment.paymentDate
                    }
                });

                // Update plan balance
                await tx.installmentPlan.update({
                    where: { id: installment.planId },
                    data: {
                        remainingBalance: {
                            decrement: amount
                        }
                    }
                });

                // Check if all installments are paid to close the plan
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
                    console.log(`Plan ${installment.planId} closed.`);
                }
            });
        } catch (err: any) {
            console.error('PAYMENT ERROR:', err);
            return fail(500, { error: err.message || 'Failed to record payment' });
        }

        return { success: true };
    }
};
