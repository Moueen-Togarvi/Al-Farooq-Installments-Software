export const MAIN_INVESTMENT_ACCOUNT_ID = 'MAIN';

export class InvestmentValidationError extends Error {}

function toNumber(value: any) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    if (typeof value.toNumber === 'function') return value.toNumber();
    return Number(value.toString?.() ?? 0);
}

export async function ensureInvestmentAccount(db: any) {
    return db.investmentAccount.upsert({
        where: { id: MAIN_INVESTMENT_ACCOUNT_ID },
        update: {},
        create: { id: MAIN_INVESTMENT_ACCOUNT_ID }
    });
}

export async function addInvestorDeposit(
    db: any,
    input: { investorId: string; amount: number; note?: string | null }
) {
    if (input.amount <= 0) {
        throw new InvestmentValidationError('Deposit amount must be greater than zero');
    }

    await ensureInvestmentAccount(db);

    await Promise.all([
        db.investmentAccount.update({
            where: { id: MAIN_INVESTMENT_ACCOUNT_ID },
            data: {
                availableBalance: { increment: input.amount },
                totalDeposited: { increment: input.amount }
            }
        }),
        db.investmentTransaction.create({
            data: {
                accountId: MAIN_INVESTMENT_ACCOUNT_ID,
                investorId: input.investorId,
                type: 'INVESTOR_DEPOSIT',
                amount: input.amount,
                note: input.note || 'Investor deposit'
            }
        })
    ]);
}

export async function addInstallmentCollection(
    db: any,
    input: {
        amount: number;
        investorId?: string | null;
        planId?: string | null;
        note?: string | null;
        collectedAt?: Date | null;
    }
) {
    if (input.amount <= 0) {
        throw new InvestmentValidationError('Collection amount must be greater than zero');
    }

    await ensureInvestmentAccount(db);

    const transactionData: any = {
        accountId: MAIN_INVESTMENT_ACCOUNT_ID,
        investorId: input.investorId || null,
        planId: input.planId || null,
        type: 'INSTALLMENT_COLLECTION',
        amount: input.amount,
        note: input.note || 'Installment collection received'
    };

    if (input.collectedAt) {
        transactionData.createdAt = input.collectedAt;
    }

    await Promise.all([
        db.investmentAccount.update({
            where: { id: MAIN_INVESTMENT_ACCOUNT_ID },
            data: {
                availableBalance: { increment: input.amount },
                totalCollected: { increment: input.amount }
            }
        }),
        db.investmentTransaction.create({
            data: transactionData
        })
    ]);
}

export async function addProductPurchase(
    db: any,
    input: { amount: number; productId?: string | null; note?: string | null }
) {
    if (input.amount <= 0) {
        throw new InvestmentValidationError('Product amount must be greater than zero');
    }

    const account = await ensureInvestmentAccount(db);
    const available = toNumber(account.availableBalance);

    if (available + 0.01 < input.amount) {
        throw new InvestmentValidationError('Insufficient investment balance. Add investor funds first.');
    }

    await Promise.all([
        db.investmentAccount.update({
            where: { id: MAIN_INVESTMENT_ACCOUNT_ID },
            data: {
                availableBalance: { decrement: input.amount },
                totalSpent: { increment: input.amount }
            }
        }),
        db.investmentTransaction.create({
            data: {
                accountId: MAIN_INVESTMENT_ACCOUNT_ID,
                productId: input.productId || null,
                type: 'PRODUCT_PURCHASE',
                amount: input.amount,
                note: input.note || 'Product amount allocated from investment'
            }
        })
    ]);
}
