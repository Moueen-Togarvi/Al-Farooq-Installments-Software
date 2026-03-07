import { prisma } from '$lib/server/prisma';
import { addProductPurchase, InvestmentValidationError } from '$lib/server/investment';
import { fail } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            category: true,
            cashPrice: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
    return { products: serializeDecimals(products) };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const category = data.get('category') as string;
        const cashPrice = parseFloat(data.get('cashPrice') as string);

        if (!name || isNaN(cashPrice) || cashPrice <= 0) {
            return fail(400, { error: 'Missing or invalid fields' });
        }

        try {
            await prisma.$transaction(async (tx: any) => {
                const product = await tx.product.create({
                    data: {
                        name,
                        category,
                        purchasePrice: cashPrice,
                        cashPrice,
                        installmentPrice: cashPrice,
                        downPayment: 0,
                        profit: 0,
                        durationMonths: 12,
                        monthlyAmount: 0
                    }
                });

                await addProductPurchase(tx, {
                    amount: cashPrice,
                    productId: product.id,
                    note: `Stock purchase for ${name}`
                });
            });
        } catch (err: any) {
            // Re-throw SvelteKit redirects and failures
            if (err.status && (err.location || err.data)) throw err;
            if (err instanceof InvestmentValidationError) {
                return fail(400, { error: err.message });
            }

            console.error('PRODUCT CREATE ERROR:');
            console.dir(err, { depth: null });
            return fail(500, { error: 'Failed to create product' });
        }

        return { success: true };
    },

    update: async ({ request, url }) => {
        const id = url.searchParams.get('id');
        if (!id) return fail(400, { error: 'Missing product id' });

        const data = await request.formData();
        const name = data.get('name') as string;
        const category = data.get('category') as string;
        const cashPrice = parseFloat(data.get('cashPrice') as string);

        if (!name || isNaN(cashPrice) || cashPrice <= 0) {
            return fail(400, { error: 'Missing or invalid fields' });
        }

        try {
            await prisma.product.update({
                where: { id },
                data: {
                    name,
                    category,
                    purchasePrice: cashPrice,
                    cashPrice,
                    installmentPrice: cashPrice,
                    profit: 0
                }
            });
        } catch (err: any) {
            console.error(err);
            return fail(500, { error: 'Failed to update product' });
        }

        return { success: true };
    },

    delete: async ({ url }) => {
        const id = url.searchParams.get('id');
        if (!id) return fail(400, { error: 'Missing product id' });

        try {
            await prisma.product.delete({
                where: { id }
            });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'P2003') {
                return fail(400, { error: 'Cannot delete product. It is part of active installment plans.' });
            }
            return fail(500, { error: 'Failed to delete product' });
        }

        return { success: true };
    }
};
