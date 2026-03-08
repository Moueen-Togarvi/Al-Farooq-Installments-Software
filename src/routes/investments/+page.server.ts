import { prisma } from '$lib/server/prisma';
import { addInvestorDeposit, ensureInvestmentAccount, InvestmentValidationError } from '$lib/server/investment';
import { fail } from '@sveltejs/kit';
import { serializeDecimals, getPKDate } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const load: PageServerLoad = async () => {
    const pkNow = getPKDate();
    const currentYear = pkNow.getUTCFullYear();
    const currentMonthIndex = pkNow.getUTCMonth();
    const currentMonthStartUtc = new Date(Date.UTC(currentYear, currentMonthIndex, 1) - PK_OFFSET_MS);
    const nextMonthStartUtc = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 1) - PK_OFFSET_MS);

    const [account, investors, transactions, currentMonthInstallments, deposits, collections] = await Promise.all([
        ensureInvestmentAccount(prisma),
        prisma.investor.findMany({
            select: {
                id: true,
                name: true,
                mobile: true,
                status: true,
                createdAt: true,
                _count: {
                    select: { plans: { where: { status: 'ACTIVE' } } }
                }
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'desc' }
            ]
        }),
        prisma.investmentTransaction.findMany({
            take: 120,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                amount: true,
                note: true,
                createdAt: true,
                investor: {
                    select: { id: true, name: true }
                },
                plan: {
                    select: {
                        id: true,
                        billNumber: true,
                        customer: { select: { name: true } }
                    }
                },
                product: {
                    select: { id: true, name: true }
                }
            }
        }),
        prisma.installment.findMany({
            where: {
                dueDate: { gte: currentMonthStartUtc, lt: nextMonthStartUtc }
            },
            orderBy: { dueDate: 'asc' },
            take: 120,
            select: {
                id: true,
                status: true,
                amount: true,
                receivedAmount: true,
                pendingAmount: true,
                dueDate: true,
                paymentDate: true,
                plan: {
                    select: {
                        id: true,
                        billNumber: true,
                        customer: { select: { name: true } },
                        product: { select: { name: true } },
                        investor: { select: { id: true, name: true } }
                    }
                }
            }
        }),
        prisma.investmentTransaction.groupBy({
            by: ['investorId'],
            where: {
                investorId: { not: null },
                type: 'INVESTOR_DEPOSIT'
            },
            _sum: { amount: true }
        }),
        prisma.investmentTransaction.groupBy({
            by: ['investorId'],
            where: {
                investorId: { not: null },
                type: 'INSTALLMENT_COLLECTION'
            },
            _sum: { amount: true }
        })
    ]);

    const depositedByInvestor = new Map<string, number>(
        deposits.map((item: any) => [String(item.investorId), Number(item._sum.amount || 0)])
    );
    const collectedByInvestor = new Map<string, number>(
        collections.map((item: any) => [String(item.investorId), Number(item._sum.amount || 0)])
    );

    const investorStats = investors.map((investor: any) => {
        const totalDeposited = roundCurrency(Number(depositedByInvestor.get(investor.id) ?? 0));
        const totalCollected = roundCurrency(Number(collectedByInvestor.get(investor.id) ?? 0));
        return {
            ...investor,
            totalDeposited,
            totalCollected,
            totalContribution: roundCurrency(totalDeposited + totalCollected)
        };
    });

    const sortedCurrentMonthInstallments = currentMonthInstallments.sort((a: any, b: any) => {
        const aIsUnpaid = a.status !== 'PAID';
        const bIsUnpaid = b.status !== 'PAID';

        if (aIsUnpaid !== bIsUnpaid) {
            return Number(bIsUnpaid) - Number(aIsUnpaid);
        }

        if (aIsUnpaid && bIsUnpaid) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        const aPaymentTime = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const bPaymentTime = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return bPaymentTime - aPaymentTime;
    });

    return serializeDecimals({
        account,
        investors: investorStats,
        transactions,
        currentMonthInstallments: sortedCurrentMonthInstallments
    });
};

export const actions: Actions = {
    createInvestor: async ({ request }) => {
        const data = await request.formData();
        const name = (data.get('name') as string || '').trim();
        const mobile = (data.get('mobile') as string || '').trim();

        if (!name) {
            return fail(400, { error: 'Investor name is required' });
        }

        try {
            await prisma.investor.create({
                data: {
                    name,
                    mobile: mobile || null,
                    status: 'ACTIVE'
                }
            });
        } catch (err: any) {
            console.error('INVESTOR CREATE ERROR:', err);
            return fail(500, { error: 'Failed to create investor' });
        }

        return { success: true };
    },

    addFunds: async ({ request }) => {
        const data = await request.formData();
        const investorId = (data.get('investorId') as string || '').trim();
        const note = (data.get('note') as string || '').trim();
        const amount = roundCurrency(Number(data.get('amount') || 0));

        if (!investorId || Number.isNaN(amount) || amount <= 0) {
            return fail(400, { error: 'Investor and valid deposit amount are required' });
        }

        try {
            await prisma.$transaction(async (tx: any) => {
                const investor = await tx.investor.findUnique({
                    where: { id: investorId },
                    select: { id: true, status: true }
                });

                if (!investor || investor.status !== 'ACTIVE') {
                    throw new InvestmentValidationError('Selected investor is invalid or inactive');
                }

                await addInvestorDeposit(tx, {
                    investorId,
                    amount,
                    note
                });
            });
        } catch (err: any) {
            if (err instanceof InvestmentValidationError) {
                return fail(400, { error: err.message });
            }

            console.error('INVESTOR DEPOSIT ERROR:', err);
            return fail(500, { error: 'Failed to add investor funds' });
        }

        return { success: true };
    }
};
