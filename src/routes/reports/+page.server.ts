import { prisma } from '$lib/server/prisma';
import { serializeDecimals } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }: { url: URL }) => {
    const type = url.searchParams.get('type') || 'daily';
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    let reportData = [];
    let summary = { total: 0, count: 0 };

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    if (type === 'daily') {
        reportData = await prisma.payment.findMany({
            where: {
                paymentDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
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
            include: {
                plan: {
                    include: {
                        customer: true,
                        product: true
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
