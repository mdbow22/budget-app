import { createTRPCRouter, protectedProcedure } from '../trpc';

export const transactionsRouter = createTRPCRouter({
    getRecentTransactions: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const userTransactions = await ctx.prisma.transaction.findMany({
                skip: 0,
                take: 10,
                where: {
                    BankAccount: {
                        userId: userId,
                    },
                    removedDate: null,
                },
                include: {
                    BankAccount: {
                        select: {
                            name: true,
                        }
                    },
                    Category: {
                        select: {
                            name: true,
                        }
                    },
                    PayorPayee: {
                        select: {
                            thirdparty: true,
                        }
                    }
                },
                orderBy: {
                    date: 'desc',
                }
            });

            return userTransactions.map(transaction => ({
                id: transaction.id,
                accountId: transaction.accountId,
                accountName: transaction.BankAccount.name,
                amount: transaction.amount.toNumber(),
                date: transaction.date,
                categoryId: transaction.categoryId,
                category: transaction.Category?.name,
                thirdParty: transaction.PayorPayee?.thirdparty,
                description: transaction.description,
                createdDate: transaction.createdDate,
                isTransfer: transaction.isTransfer,
            }));
        })
})