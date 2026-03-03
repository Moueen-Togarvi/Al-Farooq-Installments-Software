import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Run both queries in PARALLEL — saves ~300ms per load
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
                cashPrice: true, installmentPrice: true,
                durationMonths: true, downPayment: true
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
            const prodDuration = parseInt(product.durationMonths?.toString() || '1');
            durationMonths = prodDuration > 1 ? prodDuration : 12;
        }

        const downPaymentStr = data.get('downPayment') as string;
        let downPayment = parseFloat(downPaymentStr);
        if (isNaN(downPayment)) {
            downPayment = parseFloat(product.downPayment?.toString() || '0');
        }

        const totalAmountStr = data.get('totalAmount') as string;
        let totalAmount = parseFloat(totalAmountStr);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            const prodInstallment = parseFloat(product.installmentPrice?.toString() || '0');
            totalAmount = prodInstallment > 0 ? prodInstallment : parseFloat(product.cashPrice?.toString() || '0');
        }

        const remainingBalance = totalAmount - downPayment;
        const monthlyAmount = durationMonths > 0 ? remainingBalance / durationMonths : 0;
        const startDate = new Date(startDateStr);

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

                // Generate installments
                const installments = [];
                if (customSchedule && Array.isArray(customSchedule) && customSchedule.length > 0) {
                    for (const item of customSchedule) {
                        const dueDate = new Date(item.date);
                        installments.push({
                            planId: plan.id,
                            serialNumber: item.serial,
                            month: dueDate.getMonth() + 1,
                            year: dueDate.getFullYear(),
                            amount: Number(item.amount),
                            pendingAmount: Number(item.amount),
                            status: 'UNPAID',
                            dueDate
                        });
                    }
                } else {
                    const baseMonthlyAmount = Math.floor(remainingBalance / durationMonths);
                    const remainder = remainingBalance - (baseMonthlyAmount * durationMonths);

                    for (let i = 1; i <= durationMonths; i++) {
                        const dueDate = new Date(startDate);
                        dueDate.setMonth(dueDate.getMonth() + i);

                        // Add remainder to the last installment
                        const amount = i === durationMonths
                            ? baseMonthlyAmount + remainder
                            : baseMonthlyAmount;

                        installments.push({
                            planId: plan.id,
                            serialNumber: i,
                            month: dueDate.getMonth() + 1,
                            year: dueDate.getFullYear(),
                            amount: amount,
                            pendingAmount: amount,
                            status: 'UNPAID',
                            dueDate
                        });
                    }
                }

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
