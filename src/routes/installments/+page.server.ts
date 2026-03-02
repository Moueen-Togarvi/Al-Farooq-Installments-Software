import { prisma } from '$lib/server/prisma';
import { serializeDecimals } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const plans = await prisma.installmentPlan.findMany({
        include: {
            customer: true,
            product: true,
            installments: {
                select: { status: true },
                orderBy: { serialNumber: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return { plans: serializeDecimals(plans) };
};
