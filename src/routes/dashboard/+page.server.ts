import { prisma } from '$lib/server/prisma';
import { ensureInvestmentAccount } from '$lib/server/investment';
import { serializeDecimals, getPKDate, getPKStartOfDay } from '$lib/utils';
import type { PageServerLoad } from './$types';

const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

function getDefaultMonthValue() {
    const pkNow = getPKDate();
    const year = pkNow.getUTCFullYear();
    const month = String(pkNow.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function getMonthRangeInPK(monthValue: string) {
    const [yearStr, monthStr] = monthValue.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    const monthStartUtc = new Date(Date.UTC(year, month - 1, 1) - PK_OFFSET_MS);
    const nextMonthStartUtc = new Date(Date.UTC(year, month, 1) - PK_OFFSET_MS);

    return { monthStartUtc, nextMonthStartUtc };
}

export const load: PageServerLoad = async ({ url }) => {
    try {
        const today = getPKStartOfDay();
        const currentMonthValue = getDefaultMonthValue();
        const {
            monthStartUtc: currentMonthStartUtc,
            nextMonthStartUtc: currentNextMonthStartUtc
        } = getMonthRangeInPK(currentMonthValue);
        const requestedMonth = url.searchParams.get('month') || '';
        const selectedMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth)
            ? requestedMonth
            : getDefaultMonthValue();
        const { monthStartUtc, nextMonthStartUtc } = getMonthRangeInPK(selectedMonth);

        const [
            investmentAccount,
            totalCustomers,
            activePlans,
            totalBalanceResult,
            currentMonthUnpaidInstallments,
            monthlyPaymentsResult,
            monthlyAdvanceCollectionsResult,
            overdueInstallments
        ] = await Promise.all([
            ensureInvestmentAccount(prisma),
            prisma.customer.count(),
            prisma.installmentPlan.count({ where: { status: 'ACTIVE' } }),
            prisma.installmentPlan.aggregate({
                _sum: { remainingBalance: true }
            }),
            prisma.installment.findMany({
                where: {
                    dueDate: { gte: currentMonthStartUtc, lt: currentNextMonthStartUtc },
                    status: { not: 'PAID' }
                },
                select: {
                    id: true,
                    amount: true,
                    pendingAmount: true,
                    status: true,
                    dueDate: true,
                    plan: {
                        select: {
                            id: true,
                            customer: { select: { name: true } },
                            product: { select: { name: true } }
                        }
                    }
                },
                orderBy: { dueDate: 'asc' },
                take: 12
            }),
            prisma.payment.aggregate({
                where: {
                    paymentDate: { gte: monthStartUtc, lt: nextMonthStartUtc }
                },
                _sum: { amount: true }
            }),
            prisma.installmentPlan.aggregate({
                where: {
                    startDate: { gte: monthStartUtc, lt: nextMonthStartUtc },
                    downPayment: { gt: 0 }
                },
                _sum: { downPayment: true }
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
        const totalReceived = investmentAccount?.totalCollected || 0;
        const investmentBalance = investmentAccount?.availableBalance || 0;
        const paymentCollections = Number(monthlyPaymentsResult._sum?.amount || 0);
        const advanceCollections = Number(monthlyAdvanceCollectionsResult._sum?.downPayment || 0);
        const totalCollectedThisMonth = paymentCollections + advanceCollections;
        const [selectedYear, selectedMonthNumber] = selectedMonth.split('-').map(Number);
        const selectedMonthLabel = new Date(Date.UTC(selectedYear, selectedMonthNumber - 1, 1))
            .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return serializeDecimals({
            stats: {
                totalCustomers,
                activePlans,
                totalReceived,
                totalPending,
                investmentBalance,
                totalCollectedThisMonth
            },
            selectedMonth,
            selectedMonthLabel,
            currentMonthUnpaidInstallments,
            overdueInstallments
        });
    } catch (err: any) {
        console.error('DATABASE ERROR IN DASHBOARD LOAD:', err);
        return {
            stats: {
                totalCustomers: 0,
                activePlans: 0,
                totalReceived: 0,
                totalPending: 0,
                investmentBalance: 0,
                totalCollectedThisMonth: 0
            },
            selectedMonth: getDefaultMonthValue(),
            selectedMonthLabel: 'Current Month',
            currentMonthUnpaidInstallments: [],
            overdueInstallments: [],
            dbError: 'Database is currently reaching its limit or starting up. Please refresh in a moment.'
        };
    }
};
