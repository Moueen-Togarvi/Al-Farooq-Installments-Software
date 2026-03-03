import { prisma } from '$lib/server/prisma';
import { serializeDecimals, getPKStartOfDay } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const today = getPKStartOfDay();
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);

        const [
            totalCustomers,
            activePlans,
            totalBalanceResult,
            todayDue,
            totalPaymentsResult,
            overdueInstallments
        ] = await Promise.all([
            prisma.customer.count(),
            prisma.installmentPlan.count({ where: { status: 'ACTIVE' } }),
            prisma.installmentPlan.aggregate({
                _sum: { remainingBalance: true }
            }),
            prisma.installment.findMany({
                where: {
                    dueDate: { gte: today, lt: tomorrow }
                },
                select: {
                    id: true, amount: true, status: true, dueDate: true,
                    plan: {
                        select: {
                            id: true,
                            customer: { select: { name: true } },
                            product: { select: { name: true } }
                        }
                    }
                }
            }),
            prisma.payment.aggregate({
                _sum: { amount: true }
            }),
            prisma.installment.findMany({
                where: {
                    dueDate: { lt: today },
                    status: { not: 'PAID' }
                },
                select: {
                    id: true, pendingAmount: true, dueDate: true,
                    plan: {
                        select: {
                            id: true,
                            customer: { select: { name: true } },
                            product: { select: { name: true } }
                        }
                    }
                },
                take: 5,
                orderBy: { dueDate: 'asc' }
            })
        ]);

        const totalPending = totalBalanceResult._sum?.remainingBalance || 0;
        const totalReceived = totalPaymentsResult._sum?.amount || 0;

        return serializeDecimals({
            stats: { totalCustomers, activePlans, totalReceived, totalPending },
            todayDue,
            overdueInstallments
        });
    } catch (err: any) {
        console.error('DATABASE ERROR IN DASHBOARD LOAD:', err);
        return {
            stats: { totalCustomers: 0, activePlans: 0, totalReceived: 0, totalPending: 0 },
            todayDue: [],
            overdueInstallments: [],
            dbError: 'Database is currently reaching its limit or starting up. Please refresh in a moment.'
        };
    }
};
