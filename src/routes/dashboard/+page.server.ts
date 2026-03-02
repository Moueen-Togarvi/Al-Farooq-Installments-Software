import { prisma } from '$lib/server/prisma';
import { serializeDecimals } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [
            totalCustomers,
            activePlans,
            totalBalanceResult,
            todayDue,
            totalPaymentsResult
        ] = await Promise.all([
            prisma.customer.count(),
            prisma.installmentPlan.count({ where: { status: 'ACTIVE' } }),
            prisma.installmentPlan.aggregate({
                _sum: { remainingBalance: true }
            }),
            prisma.installment.findMany({
                where: {
                    dueDate: {
                        gte: today,
                        lt: tomorrow
                    }
                },
                include: {
                    plan: {
                        include: {
                            customer: true,
                            product: true
                        }
                    }
                }
            }),
            prisma.payment.aggregate({
                _sum: { amount: true }
            })
        ]);

        const totalPending = totalBalanceResult._sum?.remainingBalance || 0;
        const totalReceived = totalPaymentsResult._sum?.amount || 0;

        // Fetch some overdue customers (simplified: due date in the past and not paid)
        const overdueInstallments = await prisma.installment.findMany({
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
            take: 5,
            orderBy: { dueDate: 'asc' }
        });

        return serializeDecimals({
            stats: {
                totalCustomers,
                activePlans,
                totalReceived,
                totalPending
            },
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
