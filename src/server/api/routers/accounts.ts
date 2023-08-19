import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import type { Decimal } from '@prisma/client/runtime/library';

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
        .query(async ({ ctx }) => {
            
            const allAccounts = await ctx.prisma.bankAccount.findMany({
                where: {
                    userId: ctx.session.user.id,
                }
            });
                return allAccounts.map(account => ({ ...account, currBalance: account.currBalance.toNumber()}));
        }),
    createAccount: protectedProcedure
        .input(z.object({
            name: z.string(),
            type: z.string(),
            initBalance: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const newAccount = await ctx.prisma.bankAccount.create({
                data: {
                    name: input.name,
                    type: input.type,
                    initBalance: input.initBalance,
                    User: {
                        connect: {
                            id: userId,
                        }
                    },
                    currBalance: input.initBalance,
                }
            })

            return newAccount;
        }),
})