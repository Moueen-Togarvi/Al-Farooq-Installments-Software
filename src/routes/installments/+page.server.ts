import { prisma } from '$lib/server/prisma';
import { serializeDecimals, getPKDate } from '$lib/utils';
import type { PageServerLoad } from './$types';

const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

export const load: PageServerLoad = async () => {
    const pkNow = getPKDate();
    const currentYear = pkNow.getUTCFullYear();
    const currentMonthIndex = pkNow.getUTCMonth();
    const currentMonthStartUtc = new Date(Date.UTC(currentYear, currentMonthIndex, 1) - PK_OFFSET_MS);
    const nextMonthStartUtc = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 1) - PK_OFFSET_MS);
    const currentMonthStartTs = currentMonthStartUtc.getTime();
    const nextMonthStartTs = nextMonthStartUtc.getTime();

    const plans = await prisma.installmentPlan.findMany({
        select: {
            id: true,
            billNumber: true,
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
            investor: {
                select: { id: true, name: true }
            },
            installments: {
                select: { status: true, dueDate: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const rankedPlans = plans
        .map((plan: any) => {
            const totalInstallmentsCount = plan.installments.length;
            let paidInstallmentsCount = 0;
            let currentMonthUnpaidCount = 0;
            let currentMonthInstallmentsCount = 0;
            let firstCurrentMonthUnpaidDueDate = Number.MAX_SAFE_INTEGER;

            for (const installment of plan.installments) {
                const dueTime = new Date(installment.dueDate).getTime();
                const isCurrentMonth = dueTime >= currentMonthStartTs && dueTime < nextMonthStartTs;

                if (installment.status === 'PAID') {
                    paidInstallmentsCount += 1;
                }

                if (isCurrentMonth) {
                    currentMonthInstallmentsCount += 1;
                    if (installment.status !== 'PAID') {
                        currentMonthUnpaidCount += 1;
                        if (dueTime < firstCurrentMonthUnpaidDueDate) {
                            firstCurrentMonthUnpaidDueDate = dueTime;
                        }
                    }
                }
            }

            const hasCurrentMonthUnpaid = currentMonthUnpaidCount > 0;
            const hasCurrentMonthInstallment = currentMonthInstallmentsCount > 0;
            const currentMonthBucket = hasCurrentMonthUnpaid
                ? 0
                : hasCurrentMonthInstallment
                    ? 2
                    : 1;

            return {
                ...plan,
                paidInstallmentsCount,
                totalInstallmentsCount,
                monthlyUnpaidCount: currentMonthUnpaidCount,
                hasCurrentMonthUnpaid,
                hasCurrentMonthInstallment,
                currentMonthBucket,
                firstCurrentMonthUnpaidDueDate
            };
        })
        .sort((a: any, b: any) => {
            if (a.currentMonthBucket !== b.currentMonthBucket) {
                return a.currentMonthBucket - b.currentMonthBucket;
            }

            if (a.currentMonthBucket === 0 && b.currentMonthBucket === 0) {
                if (a.firstCurrentMonthUnpaidDueDate !== b.firstCurrentMonthUnpaidDueDate) {
                    return a.firstCurrentMonthUnpaidDueDate - b.firstCurrentMonthUnpaidDueDate;
                }
            }

            if (b.monthlyUnpaidCount !== a.monthlyUnpaidCount) {
                return b.monthlyUnpaidCount - a.monthlyUnpaidCount;
            }

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return { plans: serializeDecimals(rankedPlans) };
};
