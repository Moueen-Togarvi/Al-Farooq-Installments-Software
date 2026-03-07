import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { serializeDecimals } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

function normalizeCnic(value: string) {
    return value.replace(/\D/g, '');
}

export const load: PageServerLoad = async () => {
    const customers = await prisma.customer.findMany({
        select: {
            id: true,
            name: true,
            cnic: true,
            mobile: true,
            address: true,
            status: true,
            referenceName: true,
            _count: {
                select: { plans: { where: { status: 'ACTIVE' } } }
            }
        },
        orderBy: [
            { status: 'asc' },
            { createdAt: 'desc' }
        ]
    });
    return { customers: serializeDecimals(customers) };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const name = (data.get('name') as string || '').trim();
        const cnic = normalizeCnic((data.get('cnic') as string || '').trim());
        const mobile = (data.get('mobile') as string || '').trim();
        const address = (data.get('address') as string || '').trim();
        const referenceName = (data.get('referenceName') as string || '').trim();

        if (!name || !cnic || !mobile || !address) {
            return fail(400, { error: 'Missing required fields' });
        }
        if (cnic.length !== 13) {
            return fail(400, { error: 'CNIC must contain exactly 13 digits' });
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

    update: async ({ request, url }) => {
        const id = url.searchParams.get('id');
        if (!id) return fail(400, { error: 'Missing customer id' });

        const data = await request.formData();
        const name = (data.get('name') as string || '').trim();
        const cnic = normalizeCnic((data.get('cnic') as string || '').trim());
        const mobile = (data.get('mobile') as string || '').trim();
        const address = (data.get('address') as string || '').trim();
        const referenceName = (data.get('referenceName') as string || '').trim();
        const status = data.get('status') as string;

        if (!name || !cnic || !mobile || !address) {
            return fail(400, { error: 'Missing required fields' });
        }
        if (cnic.length !== 13) {
            return fail(400, { error: 'CNIC must contain exactly 13 digits' });
        }

        try {
            if (status === 'CLOSED') {
                await prisma.$transaction(async (tx: any) => {
                    await tx.installmentPlan.deleteMany({
                        where: { customerId: id }
                    });

                    await tx.customer.update({
                        where: { id },
                        data: {
                            name,
                            cnic,
                            mobile,
                            address,
                            referenceName: referenceName || null,
                            status: 'CLOSED'
                        }
                    });
                });
            } else {
                await prisma.customer.update({
                    where: { id },
                    data: {
                        name,
                        cnic,
                        mobile,
                        address,
                        referenceName: referenceName || null,
                        status: status || undefined
                    }
                });
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'P2002') return fail(400, { error: 'CNIC already exists' });
            return fail(500, { error: 'Failed to update customer' });
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
        } catch (err: any) {
            console.error(err);
            if (err.code === 'P2003') {
                return fail(400, { error: 'Cannot delete customer. Active sale records exist.' });
            }
            return fail(500, { error: 'Failed to delete customer' });
        }

        return { success: true };
    }
};
