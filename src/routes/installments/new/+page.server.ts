import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function generateInstallments(planId: string, startDate: Date, durationMonths: number, totalAmount: number) {
    const installments = [];
    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / durationMonths);
    const remainderCents = totalCents - (baseCents * durationMonths);

    for (let i = 1; i <= durationMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const amountCents = i === durationMonths
            ? baseCents + remainderCents
            : baseCents;
        const amount = amountCents / 100;

        installments.push({
            planId,
            serialNumber: i,
            month: dueDate.getMonth() + 1,
            year: dueDate.getFullYear(),
            amount,
            pendingAmount: amount,
            status: 'UNPAID',
            dueDate
        });
    }

    return installments;
}

export const load: PageServerLoad = async () => {
    const [customers, products] = await Promise.all([
        prisma.customer.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true, name: true, cnic: true, mobile: true, address: true
            },
            orderBy: { name: 'asc' }
        }),
        prisma.product.findMany({
            select: {
                id: true, name: true, category: true,
                cashPrice: true
            },
            orderBy: { name: 'asc' }
        })
    ]);

    return {
        customers: serializeDecimals(customers),
        products: serializeDecimals(products)
    };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const customerId = data.get('customerId') as string;
        const productId = data.get('productId') as string;
        const startDateStr = data.get('startDate') as string;

        if (!customerId || !productId || !startDateStr) {
            return fail(400, { error: 'Missing required fields' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return fail(400, { error: 'Product not found' });
        }

        const customScheduleStr = data.get('customSchedule') as string;
        let customSchedule: any[] | null = null;
        if (customScheduleStr) {
            try {
                customSchedule = JSON.parse(customScheduleStr);
            } catch (e) { }
        }

        const durationMonthsStr = data.get('durationMonths') as string;
        let durationMonths = parseInt(durationMonthsStr);
        if (isNaN(durationMonths) || durationMonths < 1) {
            durationMonths = 12;
        }

        const downPaymentStr = data.get('downPayment') as string;
        let downPayment = parseFloat(downPaymentStr);
        if (isNaN(downPayment)) {
            downPayment = 0;
        }
        downPayment = roundCurrency(downPayment);

        const installmentPercentageStr = data.get('installmentPercentage') as string;
        let installmentPercentage = parseFloat(installmentPercentageStr);
        if (isNaN(installmentPercentage)) {
            installmentPercentage = 0;
        }
        installmentPercentage = roundCurrency(installmentPercentage);

        const sellingPrice = roundCurrency(parseFloat(product.cashPrice?.toString() || '0'));
        if (sellingPrice <= 0) {
            return fail(400, { error: 'Selected product has no valid selling price' });
        }

        if (downPayment < 0) {
            return fail(400, { error: 'Advance payment cannot be negative' });
        }

        if (installmentPercentage < 0) {
            return fail(400, { error: 'Installment percentage cannot be negative' });
        }

        if (downPayment >= sellingPrice) {
            return fail(400, { error: 'Advance payment must be less than the selling price' });
        }

        const balanceAfterAdvance = roundCurrency(sellingPrice - downPayment);
        const installmentCharge = roundCurrency((balanceAfterAdvance * installmentPercentage) / 100);
        const remainingBalance = roundCurrency(balanceAfterAdvance + installmentCharge);
        const totalAmount = roundCurrency(downPayment + remainingBalance);
        const startDate = new Date(startDateStr);

        if (Number.isNaN(startDate.getTime())) {
            return fail(400, { error: 'Invalid agreement date' });
        }

        if (remainingBalance <= 0) {
            return fail(400, { error: 'Remaining balance must be greater than zero' });
        }

        const normalizedSchedule = customSchedule && Array.isArray(customSchedule)
            ? customSchedule.map((item, index) => {
                const dueDate = new Date(item?.date);
                const amount = roundCurrency(Number(item?.amount));
                const serialNumber = Number(item?.serial) || (index + 1);

                return {
                    serialNumber,
                    dueDate,
                    amount
                };
            })
            : null;

        if (normalizedSchedule && normalizedSchedule.length > 0) {
            const scheduledTotal = roundCurrency(
                normalizedSchedule.reduce((sum, item) => sum + item.amount, 0)
            );

            if (normalizedSchedule.some((item) => Number.isNaN(item.dueDate.getTime()) || item.amount <= 0)) {
                return fail(400, { error: 'Each installment must have a valid date and amount' });
            }

            if (Math.abs(scheduledTotal - remainingBalance) > 0.01) {
                return fail(400, { error: 'Installment schedule must match the remaining balance' });
            }
        }

        try {
            await prisma.$transaction(async (tx: any) => {
                const plan = await tx.installmentPlan.create({
                    data: {
                        customerId,
                        productId,
                        totalAmount,
                        downPayment,
                        remainingBalance,
                        startDate,
                        status: 'ACTIVE'
                    }
                });

                const installments = normalizedSchedule && normalizedSchedule.length > 0
                    ? normalizedSchedule.map((item) => ({
                        planId: plan.id,
                        serialNumber: item.serialNumber,
                        month: item.dueDate.getMonth() + 1,
                        year: item.dueDate.getFullYear(),
                        amount: item.amount,
                        pendingAmount: item.amount,
                        status: 'UNPAID',
                        dueDate: item.dueDate
                    }))
                    : generateInstallments(plan.id, startDate, durationMonths, remainingBalance);

                await tx.installment.createMany({
                    data: installments
                });
            });
        } catch (err: any) {
            // Re-throw SvelteKit redirects and failures
            if (err.status && (err.location || err.data)) throw err;

            console.error(err);
            return fail(500, { error: 'Failed to create installment plan' });
        }

        throw redirect(303, '/installments');
    }
};
