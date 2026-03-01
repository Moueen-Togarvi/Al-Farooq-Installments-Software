import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return { products };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const category = data.get('category') as string;
        const purchasePrice = parseFloat(data.get('purchasePrice') as string);
        const cashPrice = parseFloat(data.get('cashPrice') as string);
        const installmentPrice = parseFloat(data.get('installmentPrice') as string);
        const downPayment = parseFloat(data.get('downPayment') as string);
        const durationMonths = parseInt(data.get('durationMonths') as string);

        if (!name || isNaN(purchasePrice) || isNaN(cashPrice) || isNaN(installmentPrice)) {
            return fail(400, { error: 'Missing or invalid fields' });
        }

        const profit = installmentPrice - purchasePrice;
        const monthlyAmount = (installmentPrice - downPayment) / durationMonths;

        try {
            await prisma.product.create({
                data: {
                    name,
                    category,
                    purchasePrice,
                    cashPrice,
                    installmentPrice,
                    downPayment,
                    profit,
                    durationMonths,
                    monthlyAmount
                }
            });
        } catch (err: any) {
            // Re-throw SvelteKit redirects and failures
            if (err.status && (err.location || err.data)) throw err;

            console.error('PRODUCT CREATE ERROR:');
            console.dir(err, { depth: null });
            return fail(500, { error: 'Failed to create product' });
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
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to delete product' });
        }

        return { success: true };
    }
};
