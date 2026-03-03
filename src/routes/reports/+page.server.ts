import { prisma } from '$lib/server/prisma';
import { serializeDecimals, getPKDate, getPKStartOfDay } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }: { url: URL }) => {
    const type = url.searchParams.get('type') || 'daily';
    const date = url.searchParams.get('date') || getPKDate().toISOString().split('T')[0];

    let reportData = [];
    let summary = { total: 0, count: 0 };

    const startOfDay = getPKStartOfDay(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (type === 'daily') {
        reportData = await prisma.payment.findMany({
            where: {
                paymentDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            select: {
                id: true,
                amount: true,
                method: true,
                createdAt: true,
                installment: {
                    select: {
                        plan: {
                            select: {
                                customer: { select: { name: true } },
                                product: { select: { name: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        summary.total = reportData.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount.toString()), 0);
        summary.count = reportData.length;
    } else if (type === 'defaulters') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        reportData = await prisma.installment.findMany({
            where: {
                dueDate: { lt: today },
                status: { not: 'PAID' }
            },
            select: {
                id: true,
                dueDate: true,
                pendingAmount: true,
                plan: {
                    select: {
                        id: true,
                        customer: { select: { name: true } },
                        product: { select: { name: true } }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        summary.total = reportData.reduce((acc: number, curr: any) => acc + parseFloat(curr.pendingAmount.toString()), 0);
        summary.count = reportData.length;
    }

    return {
        type,
        date,
        reportData: serializeDecimals(reportData),
        summary: serializeDecimals(summary)
    };
};
