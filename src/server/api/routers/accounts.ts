import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Decimal, DefaultArgs } from "@prisma/client/runtime/library";
import type { Prisma, PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker';

export type AccountOptBal = {
  id: number;
  name: string | null;
  userId: string;
  type: string;
  initBalance: Decimal;
  createdDate: Date;
  expireDate: Date | null;
  balance?: number | null;
};

export const accountsRouter = createTRPCRouter({
  getAllAccounts: protectedProcedure.query(async ({ ctx }) => {
    const allAccounts = await ctx.prisma.bankAccount.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return allAccounts.map((account) => ({
      ...account,
      currBalance: account.currBalance.toNumber(),
    }));
  }),
  createAccount: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        initBalance: z.number(),
      })
    )
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
            },
          },
          currBalance: input.initBalance,
        },
      });

      return newAccount;
    }),
  createDemoData: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transactions = await generateTransactions(ctx.prisma, input.id);
      return ({ transactionsMade: transactions.count });
    }),
});

export const generateTransactions = async (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  userId: string,
) => {

    const categories = await prisma.category.findMany({
        where: {
            custom: null,
        }
    });
    const initBalances = [
        Math.floor((Math.random() * (10 ** (4 + 2)))) / 100,
        Math.floor((Math.random() * (10 ** (4 + 2)))) / 100
    ]
    const accounts = await prisma.bankAccount.createMany({
        data: [
            {
                name: 'Checking',
                userId,
                type: 'checking',
                initBalance: initBalances[0],
                currBalance: initBalances[0],
                createdDate: new Date(),
            },
            {
                name: 'Savings',
                userId,
                type: 'savings',
                initBalance: initBalances[1],
                currBalance: initBalances[1],
                createdDate: new Date(),
            }
        ]
    })

    const accountsMade = await prisma.bankAccount.findMany({
        where: {
            userId,
        }
    })
    const start = new Date('2024-01-01T00:00:00.000Z');
    const end = new Date();
    const transactions: {
        amount: number;
        description: string;
        accountId: number;
        categoryId: number | undefined;
        date: Date;

    }[] = [];

    for(let i = 0; i < 25; i++) {
        const digits = Math.floor((Math.random() * 3) + 1);
        const amount = Math.floor((Math.random() * (10 ** (digits + 2)))) / 100;
        const account = i < 13 ? accountsMade[0]?.id : accountsMade[1]?.id;
        const category = categories.filter(c => c.type === 'credit')?.[Math.floor(Math.random() * categories.length)]?.id;
        if(account) {
            transactions.push({
                amount,
                description: faker.commerce.product(),
                accountId: account,
                categoryId: category,
                date: new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
            })
        }
        
        
    }

    for(let i = 0; i < 25; i++) {
        const digits = Math.floor((Math.random() * 3) + 1);
        const amount = (Math.floor((Math.random() * (10 ** (digits + 2)))) / 100) * -1;
        const account = i < 13 ? accountsMade[0]?.id : accountsMade[1]?.id;
        const category = categories.filter(c => c.type === 'debit')?.[Math.floor(Math.random() * categories.length)]?.id;
        if(account) {
            transactions.push({
                amount,
                description: faker.commerce.product(),
                accountId: account,
                categoryId: category,
                date: new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
            })
        }
        
    }

    const newTransactions = await prisma.transaction.createMany({
        data: transactions,
    })

    return newTransactions;
};
