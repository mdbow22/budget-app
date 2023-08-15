import { DateTime } from "luxon";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";

export const transactionsRouter = createTRPCRouter({
  getRecentTransactions: protectedProcedure.query(async ({ ctx }) => {
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
          },
        },
        Category: {
          select: {
            name: true,
          },
        },
        PayorPayee: {
          select: {
            thirdparty: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return userTransactions.map((transaction) => ({
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
  }),
  getAccountTransactions: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        page: z.number(),
        perPage: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      //make sure user owns account
      const accountOwner = await ctx.prisma.bankAccount.findFirst({
        where: {
          id: input.accountId,
          userId: userId,
        },
      });

      if (!accountOwner) {
        throw new Error("Unauthorized Access to Account");
      }

      const transactions = await ctx.prisma.transaction.findMany({
        skip: input.page * input.perPage,
        take: input.perPage,
        where: {
          accountId: input.accountId,
          removedDate: null,
        },
        include: {
          PayorPayee: true,
          Category: true,
        },
      });

      const totalPageCount = await ctx.prisma.transaction.count({
        where: {
          accountId: input.accountId,
          removedDate: null,
        },
      });

      return { transactions, totalPageCount };
    }),
  insertTransaction: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        amount: z.number(),
        date: z.date(),
        category: z.object({
          name: z.string(),
          categoryId: z.number().optional(),
        }),
        thirdParty: z.string(),
        description: z.string(),
        isTransfer: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const categoryWhere = input.category.categoryId
        ? {
            connect: {
              id: input.category.categoryId,
            },
          }
        : {
            create: {
              name: input.category.name,
              type: input.amount > 0 ? "credit" : "debit",
              User: {
                connect: {
                  id: userId,
                },
              },
            },
          };

      const payorPayeeWhere = input.isTransfer
        ? undefined
        : {
            connectOrCreate: {
              where: {
                thirdparty_userId: {
                  userId: userId,
                  thirdparty: input.thirdParty,
                },
              },
              create: {
                thirdparty: input.thirdParty,
                User: {
                  connect: {
                    id: userId,
                  },
                },
              },
            },
          };

      //get current account balance so it can be updated
      const accountBal = await ctx.prisma.bankAccount.findUnique({
        where: {
          id: input.accountId,
        },
        select: {
          currBalance: true,
        },
      });

      const newTransaction = await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          bankAccounts: {
            update: {
              where: {
                id: input.accountId,
              },
              data: {
                currBalance: accountBal
                  ? accountBal.currBalance.toNumber() + input.amount
                  : input.amount,
                transactions: {
                  create: {
                    amount: input.amount,
                    description: input.description,
                    isTransfer: input.isTransfer ?? false,
                    date: input.date,
                    PayorPayee: payorPayeeWhere,
                    Category: categoryWhere,
                  },
                },
              },
            },
          },
        },
        select: {
          bankAccounts: {
            where: {
              id: input.accountId,
            },
            select: {
              currBalance: true,
              transactions: {
                where: {
                  createdDate: DateTime.now().toJSDate(),
                },
              },
            },
          },
        },
      });

      return newTransaction.bankAccounts[0]?.transactions[0];
    }),
});
