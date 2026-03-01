import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
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
        throw fail(404, { error: 'Plan not found' });
    }

    return { plan: serializeDecimals(plan) };
};

export const actions: Actions = {
    recordPayment: async ({ request }) => {
        const data = await request.formData();
        const installmentId = data.get('installmentId') as string;
        const amount = parseFloat(data.get('amount') as string);
        const method = data.get('method') as string || 'CASH';

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
                await tx.payment.create({
                    data: {
                        installmentId,
                        amount,
                        method,
                        paymentDate: new Date()
                    }
                });

                // Update installment
                const newReceived = parseFloat(installment.receivedAmount.toString()) + amount;
                const totalDue = parseFloat(installment.amount.toString());
                let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PARTIAL';

                if (newReceived >= totalDue) {
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
                        paymentDate: status === 'PAID' ? new Date() : installment.paymentDate
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
                }
            });
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to record payment' });
        }

        return { success: true };
    }
};
