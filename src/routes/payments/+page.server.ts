import { prisma } from '$lib/server/prisma';
import { serializeDecimals } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const payments = await prisma.payment.findMany({
        orderBy: { paymentDate: 'desc' },
        include: {
            installment: {
                include: {
                    plan: {
                        include: {
                            customer: true,
                            product: true
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
