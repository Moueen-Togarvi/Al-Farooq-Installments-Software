import { prisma } from '$lib/server/prisma';
import { serializeDecimals } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const payments = await prisma.payment.findMany({
        orderBy: { paymentDate: 'desc' },
        take: 200,
        select: {
            id: true,
            amount: true,
            method: true,
            paymentDate: true,
            installment: {
                select: {
                    month: true,
                    year: true,
                    serialNumber: true,
                    planId: true,
                    plan: {
                        select: {
                            id: true,
                            customer: { select: { name: true } },
                            product: { select: { name: true } }
                        }
                    }
                }
            }
        }
    });

    return {
        payments: serializeDecimals(payments)
    };
};
