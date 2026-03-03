import { prisma } from '$lib/server/prisma';
import { serializeDecimals } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const plans = await prisma.installmentPlan.findMany({
        select: {
            id: true,
            totalAmount: true,
            downPayment: true,
            remainingBalance: true,
            startDate: true,
            status: true,
            createdAt: true,
            customer: {
                select: { id: true, name: true, mobile: true, cnic: true }
            },
            product: {
                select: { id: true, name: true, category: true }
            },
            _count: {
                select: {
                    installments: true
                }
            },
            installments: {
                select: { status: true },
                where: { status: 'PAID' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return { plans: serializeDecimals(plans) };
};
