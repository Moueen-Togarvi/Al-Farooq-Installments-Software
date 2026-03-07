import { prisma } from '$lib/server/prisma';
import { addInstallmentCollection } from '$lib/server/investment';
import { error, fail } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

const CURRENCY_EPSILON = 0.01;
const TRANSACTION_TIMEOUT_MS = 20000;
const TRANSACTION_MAX_WAIT_MS = 10000;

class PaymentValidationError extends Error {}

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getInstallmentStatus(receivedAmount: number, pendingAmount: number): 'PAID' | 'PARTIAL' | 'UNPAID' {
    if (pendingAmount <= CURRENCY_EPSILON) {
        return 'PAID';
    }

    if (receivedAmount > CURRENCY_EPSILON) {
        return 'PARTIAL';
    }

    return 'UNPAID';
}

function buildCarryForwardAdjustments(installments: any[], carryDifference: number) {
    let remainingCarry = roundCurrency(carryDifference);
    const adjustments = [];

    for (const installment of installments) {
        const receivedAmount = roundCurrency(parseFloat(installment.receivedAmount.toString()));
        const currentAmount = roundCurrency(parseFloat(installment.amount.toString()));
        let nextAmount = currentAmount;

        if (remainingCarry > CURRENCY_EPSILON) {
            nextAmount = roundCurrency(currentAmount + remainingCarry);
            remainingCarry = 0;
        } else if (remainingCarry < -CURRENCY_EPSILON) {
            const maxReduction = roundCurrency(Math.max(0, currentAmount - receivedAmount));
            const appliedReduction = Math.min(Math.abs(remainingCarry), maxReduction);

            nextAmount = roundCurrency(currentAmount - appliedReduction);
            remainingCarry = roundCurrency(remainingCarry + appliedReduction);
        }

        const nextPending = roundCurrency(Math.max(0, nextAmount - receivedAmount));
        const nextStatus = getInstallmentStatus(receivedAmount, nextPending);

        adjustments.push({
            id: installment.id,
            amount: nextAmount,
            pendingAmount: nextPending,
            status: nextStatus,
            paymentDate: nextStatus === 'PAID' ? installment.paymentDate : null
        });
    }

    return {
        adjustments,
        remainingCarry
    };
}

function normalizeInstallmentSchedule(installments: any[]) {
    const normalized = installments.map((installment) => ({
        ...installment,
        amount: roundCurrency(parseFloat(installment.amount.toString())),
        receivedAmount: roundCurrency(parseFloat(installment.receivedAmount.toString())),
        pendingAmount: roundCurrency(Math.max(0, parseFloat(installment.pendingAmount.toString()))),
        paymentDate: installment.paymentDate ?? null
    }));

    for (let index = 0; index < normalized.length; index++) {
        const currentInstallment = normalized[index];

        currentInstallment.pendingAmount = roundCurrency(
            Math.max(0, currentInstallment.amount - currentInstallment.receivedAmount)
        );
        currentInstallment.status = getInstallmentStatus(
            currentInstallment.receivedAmount,
            currentInstallment.pendingAmount
        );
        currentInstallment.paymentDate = currentInstallment.status === 'PAID'
            ? currentInstallment.paymentDate
            : null;

        if (
            currentInstallment.receivedAmount <= CURRENCY_EPSILON ||
            Math.abs(currentInstallment.receivedAmount - currentInstallment.amount) <= CURRENCY_EPSILON
        ) {
            continue;
        }

        const laterInstallments = normalized.slice(index + 1);
        if (laterInstallments.length === 0) {
            continue;
        }

        const carryDifference = roundCurrency(currentInstallment.amount - currentInstallment.receivedAmount);
        currentInstallment.amount = currentInstallment.receivedAmount;
        currentInstallment.pendingAmount = 0;
        currentInstallment.status = 'PAID';

        const { adjustments } = buildCarryForwardAdjustments(laterInstallments, carryDifference);

        adjustments.forEach((adjustment, adjustmentIndex) => {
            const targetInstallment = normalized[index + 1 + adjustmentIndex];
            targetInstallment.amount = adjustment.amount;
            targetInstallment.pendingAmount = adjustment.pendingAmount;
            targetInstallment.status = adjustment.status;
            targetInstallment.paymentDate = adjustment.paymentDate;
        });
    }

    return normalized;
}

function datesMatch(left: Date | string | null | undefined, right: Date | string | null | undefined) {
    if (!left && !right) {
        return true;
    }

    if (!left || !right) {
        return false;
    }

    return new Date(left).getTime() === new Date(right).getTime();
}

function installmentNeedsRepair(rawInstallment: any, normalizedInstallment: any) {
    const rawAmount = roundCurrency(parseFloat(rawInstallment.amount.toString()));
    const rawPending = roundCurrency(parseFloat(rawInstallment.pendingAmount.toString()));

    return (
        Math.abs(rawAmount - normalizedInstallment.amount) > CURRENCY_EPSILON ||
        Math.abs(rawPending - normalizedInstallment.pendingAmount) > CURRENCY_EPSILON ||
        rawInstallment.status !== normalizedInstallment.status ||
        !datesMatch(rawInstallment.paymentDate, normalizedInstallment.paymentDate)
    );
}

export const load: PageServerLoad = async ({ params }) => {
    try {
        const plan = await prisma.installmentPlan.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                product: true,
                investor: true,
                installments: {
                    orderBy: { serialNumber: 'asc' }
                    // Removed payments: true — huge performance win
                }
            }
        });

        if (!plan) {
            throw error(404, { message: 'Plan not found' });
        }

        const normalizedInstallments = normalizeInstallmentSchedule(plan.installments);
        const normalizedPlan = {
            ...plan,
            installments: normalizedInstallments,
            remainingBalance: roundCurrency(
                normalizedInstallments.reduce(
                    (sum: number, installment: any) => sum + installment.pendingAmount,
                    0
                )
            )
        };

        return { plan: serializeDecimals(normalizedPlan) };
    } catch (err: any) {
        if (err.status) throw err; // Re-throw SvelteKit errors
        console.error('DATABASE ERROR IN LEDGER LOAD:', err);
        throw error(500, { message: 'Database is currently unreachable.' });
    }
};

export const actions: Actions = {
    recalculateSchedule: async ({ params }) => {
        try {
            await prisma.$transaction(async (tx: any) => {
                const plan = await tx.installmentPlan.findUnique({
                    where: { id: params.id },
                    include: {
                        installments: {
                            orderBy: { serialNumber: 'asc' }
                        }
                    }
                });

                if (!plan) {
                    throw new PaymentValidationError('Plan not found');
                }

                const normalizedInstallments = normalizeInstallmentSchedule(plan.installments);
                const writeOperations = [];

                for (const [index, installment] of plan.installments.entries()) {
                    const normalizedInstallment = normalizedInstallments[index];

                    if (!installmentNeedsRepair(installment, normalizedInstallment)) {
                        continue;
                    }

                    writeOperations.push(
                        tx.installment.update({
                            where: { id: installment.id },
                            data: {
                                amount: normalizedInstallment.amount,
                                pendingAmount: normalizedInstallment.pendingAmount,
                                status: normalizedInstallment.status,
                                paymentDate: normalizedInstallment.paymentDate
                            }
                        })
                    );
                }

                const remainingBalance = roundCurrency(
                    normalizedInstallments.reduce(
                        (sum: number, installment: any) => sum + installment.pendingAmount,
                        0
                    )
                );

                writeOperations.push(
                    tx.installmentPlan.update({
                        where: { id: plan.id },
                        data: {
                            remainingBalance,
                            status: remainingBalance <= CURRENCY_EPSILON ? 'CLOSED' : 'ACTIVE'
                        }
                    })
                );

                await Promise.all(writeOperations);
            }, {
                timeout: TRANSACTION_TIMEOUT_MS,
                maxWait: TRANSACTION_MAX_WAIT_MS
            });
        } catch (err: any) {
            if (err instanceof PaymentValidationError) {
                return fail(400, { error: err.message });
            }

            console.error('RECALCULATE SCHEDULE ERROR:', err);
            return fail(500, { error: err.message || 'Failed to recalculate schedule' });
        }

        return { success: true };
    },
    recordPayment: async ({ request }) => {
        const data = await request.formData();
        const installmentId = data.get('installmentId') as string;
        const amount = roundCurrency(parseFloat(data.get('amount') as string));
        const method = data.get('method') as string || 'CASH';
        const paymentDateStr = data.get('paymentDate') as string;
        const paymentDateObj = paymentDateStr ? new Date(paymentDateStr) : new Date();

        if (!installmentId || Number.isNaN(amount) || amount <= 0) {
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
                        pendingAmount: true,
                        status: true,
                        paymentDate: true,
                        serialNumber: true,
                        plan: {
                            select: {
                                investorId: true,
                                billNumber: true
                            }
                        }
                    }
                });

                if (!installment) throw new PaymentValidationError('Installment not found');

                const planInstallments = await tx.installment.findMany({
                    where: { planId: installment.planId },
                    orderBy: { serialNumber: 'asc' },
                    select: {
                        id: true,
                        serialNumber: true,
                        amount: true,
                        receivedAmount: true,
                        pendingAmount: true,
                        status: true,
                        paymentDate: true
                    }
                });

                const currentIndex = planInstallments.findIndex((item: any) => item.id === installmentId);
                if (currentIndex === -1) {
                    throw new PaymentValidationError('Installment not found in plan');
                }

                const normalizedPlanInstallments = normalizeInstallmentSchedule(planInstallments);
                const currentInstallment = normalizedPlanInstallments[currentIndex];

                if (currentInstallment.status === 'PAID') {
                    throw new PaymentValidationError('Installment is already settled');
                }

                const currentPending = currentInstallment.pendingAmount;
                const currentReceived = currentInstallment.receivedAmount;
                const currentAmount = currentInstallment.amount;
                const planPendingTotal = roundCurrency(
                    normalizedPlanInstallments.reduce(
                        (sum: number, item: any) => sum + item.pendingAmount,
                        0
                    )
                );

                if (amount > planPendingTotal + CURRENCY_EPSILON) {
                    throw new PaymentValidationError('Payment amount is greater than the remaining plan balance');
                }

                const newReceived = roundCurrency(currentReceived + amount);
                const remainingAfterPayment = roundCurrency(planPendingTotal - amount);
                const futureOpenInstallments = normalizedPlanInstallments
                    .slice(currentIndex + 1)
                    .filter((item: any) => item.status !== 'PAID');
                const shouldReschedule =
                    futureOpenInstallments.length > 0 &&
                    Math.abs(newReceived - currentAmount) > CURRENCY_EPSILON;

                if (!shouldReschedule && amount > currentPending + CURRENCY_EPSILON) {
                    throw new PaymentValidationError('Payment amount is greater than the selected installment balance');
                }

                const activeUpdateIds = new Set<string>([installmentId]);
                if (shouldReschedule) {
                    futureOpenInstallments.forEach((futureInstallment: any) => {
                        activeUpdateIds.add(futureInstallment.id);
                    });
                }

                const writeOperations = [
                    tx.payment.create({
                        data: {
                            installmentId,
                            amount,
                            method,
                            paymentDate: paymentDateObj
                        }
                    })
                ];

                normalizedPlanInstallments.forEach((normalizedInstallment: any, index: number) => {
                    const rawInstallment = planInstallments[index];

                    if (
                        activeUpdateIds.has(rawInstallment.id) ||
                        !installmentNeedsRepair(rawInstallment, normalizedInstallment)
                    ) {
                        return;
                    }

                    writeOperations.push(
                        tx.installment.update({
                            where: { id: rawInstallment.id },
                            data: {
                                amount: normalizedInstallment.amount,
                                pendingAmount: normalizedInstallment.pendingAmount,
                                status: normalizedInstallment.status,
                                paymentDate: normalizedInstallment.paymentDate
                            }
                        })
                    );
                });

                if (shouldReschedule) {
                    const carryDifference = roundCurrency(currentAmount - newReceived);
                    const { adjustments: futureAdjustments, remainingCarry } = buildCarryForwardAdjustments(
                        futureOpenInstallments,
                        carryDifference
                    );

                    if (Math.abs(remainingCarry) > CURRENCY_EPSILON) {
                        throw new PaymentValidationError('Unable to carry the payment difference into the next installments');
                    }

                    writeOperations.push(
                        tx.installment.update({
                            where: { id: installmentId },
                            data: {
                                amount: newReceived,
                                receivedAmount: newReceived,
                                pendingAmount: 0,
                                status: 'PAID',
                                paymentDate: paymentDateObj
                            }
                        })
                    );

                    for (const futureInstallment of futureAdjustments) {
                        writeOperations.push(
                            tx.installment.update({
                                where: { id: futureInstallment.id },
                                data: {
                                    amount: futureInstallment.amount,
                                    pendingAmount: futureInstallment.pendingAmount,
                                    status: futureInstallment.status,
                                    paymentDate: futureInstallment.paymentDate
                                }
                            })
                        );
                    }
                } else {
                    const nextPending = roundCurrency(Math.max(0, currentAmount - newReceived));
                    const nextStatus = getInstallmentStatus(newReceived, nextPending);

                    writeOperations.push(
                        tx.installment.update({
                            where: { id: installmentId },
                            data: {
                                amount: currentAmount,
                                receivedAmount: newReceived,
                                pendingAmount: nextPending,
                                status: nextStatus,
                                paymentDate: nextStatus === 'PAID' ? paymentDateObj : installment.paymentDate
                            }
                        })
                    );
                }

                writeOperations.push(
                    tx.installmentPlan.update({
                        where: { id: installment.planId },
                        data: {
                            remainingBalance: remainingAfterPayment,
                            status: remainingAfterPayment <= CURRENCY_EPSILON ? 'CLOSED' : 'ACTIVE'
                        }
                    })
                );

                await Promise.all(writeOperations);

                if (remainingAfterPayment <= CURRENCY_EPSILON) {
                    await tx.installment.updateMany({
                        where: {
                            planId: installment.planId,
                            status: { not: 'PAID' }
                        },
                        data: {
                            pendingAmount: 0,
                            status: 'PAID'
                        }
                    });
                }

                await addInstallmentCollection(tx, {
                    amount,
                    investorId: installment.plan?.investorId || null,
                    planId: installment.planId,
                    note: `Installment payment for bill #${String(installment.plan?.billNumber || 0).padStart(3, '0')}`,
                    collectedAt: paymentDateObj
                });
            }, {
                timeout: TRANSACTION_TIMEOUT_MS,
                maxWait: TRANSACTION_MAX_WAIT_MS
            });
        } catch (err: any) {
            if (err instanceof PaymentValidationError) {
                return fail(400, { error: err.message });
            }

            console.error('PAYMENT ERROR:', err);
            return fail(500, { error: err.message || 'Failed to record payment' });
        }

        return { success: true };
    }
};
