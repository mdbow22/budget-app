import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { Decimal } from '@prisma/client/runtime/library';

export type AccountOptBal = {
    id: number;
    name: string | null;
    userId: string;
    type: string;
    initBalance: Decimal;
    createdDate: Date;
    expireDate: Date | null;
    balance?: number | null; 
}

export const accountsRouter = createTRPCRouter({
    getAllAccounts: protectedProcedure
        .input(z.object({
            includeBal: z.boolean(),
        }))
        .query(async ({ input, ctx }) => {
            
            const allAccounts: AccountOptBal[] = await ctx.prisma.bankAccount.findMany({
                where: {
                    userId: ctx.session.user.id,
                }
            });

            if(input.includeBal && allAccounts.length) {

                const accountsWithBal = await Promise.all(allAccounts.map(async (account) => {
                    const sumOfTrans = await ctx.prisma.transaction.aggregate({
                        _sum: {
                            amount: true,
                        },
                        where: {
                            accountId: account.id,
                        }
                    });

                    return ({
                        ...account,
                        balance: sumOfTrans._sum.amount ? account.initBalance.plus(sumOfTrans._sum.amount).toNumber() : null,
                    })
                }))

                return accountsWithBal;
            } else {
                return allAccounts;
            }
        }),
    
})