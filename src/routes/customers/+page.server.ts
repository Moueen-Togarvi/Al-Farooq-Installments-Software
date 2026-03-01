import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return { customers };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const cnic = data.get('cnic') as string;
        const mobile = data.get('mobile') as string;
        const address = data.get('address') as string;
        const referenceName = data.get('referenceName') as string;

        if (!name || !cnic || !mobile || !address) {
            return fail(400, { error: 'Missing required fields' });
        }

        try {
            await prisma.customer.create({
                data: {
                    name,
                    cnic,
                    mobile,
                    address,
                    referenceName: referenceName || null,
                    status: 'ACTIVE'
                }
            });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'P2002') {
                return fail(400, { error: 'CNIC already exists' });
            }
            return fail(500, { error: 'Failed to create customer' });
        }

        return { success: true };
    },

    delete: async ({ url }) => {
        const id = url.searchParams.get('id');
        if (!id) return fail(400, { error: 'Missing customer id' });

        try {
            await prisma.customer.delete({
                where: { id }
            });
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to delete customer' });
        }

        return { success: true };
    }
};
