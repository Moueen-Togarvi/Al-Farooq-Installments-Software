import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const customers = await prisma.customer.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' }
    });
    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' }
    });

    return { customers, products };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const customerId = data.get('customerId') as string;
        const productId = data.get('productId') as string;
        const startDateStr = data.get('startDate') as string;
        const durationMonths = parseInt(data.get('durationMonths') as string);
        const downPayment = parseFloat(data.get('downPayment') as string);

        if (!customerId || !productId || !startDateStr || isNaN(durationMonths)) {
            return fail(400, { error: 'Missing required fields' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return fail(400, { error: 'Product not found' });
        }

        const totalAmount = parseFloat(product.installmentPrice.toString());
        const remainingBalance = totalAmount - downPayment;
        const monthlyAmount = remainingBalance / durationMonths;
        const startDate = new Date(startDateStr);

        try {
            await prisma.$transaction(async (tx: any) => {
                const plan = await tx.installmentPlan.create({
                    data: {
                        customerId,
                        productId,
                        totalAmount,
                        remainingBalance,
                        startDate,
                        status: 'ACTIVE'
                    }
                });

                // Generate installments
                const installments = [];
                for (let i = 1; i <= durationMonths; i++) {
                    const dueDate = new Date(startDate);
                    dueDate.setMonth(dueDate.getMonth() + i);

                    installments.push({
                        planId: plan.id,
                        serialNumber: i,
                        month: dueDate.getMonth() + 1,
                        year: dueDate.getFullYear(),
                        amount: monthlyAmount,
                        pendingAmount: monthlyAmount,
                        status: 'UNPAID',
                        dueDate
                    });
                }

                await tx.installment.createMany({
                    data: installments
                });
            });
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to create installment plan' });
        }

        throw redirect(303, '/installments');
    }
};
