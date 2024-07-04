import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DateTime } from "luxon";
import type { Category, PayorPayee, Transaction } from "@prisma/client";

export interface ReturnArray extends Omit<Transaction, 'amount'> {
  Category: Category | null;
  PayorPayee: PayorPayee | null;
  amount: number;
}

export const budgetsRouter = createTRPCRouter({
  getAllBudgets: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.budget.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        name: true,
        id: true,
      },
    });
  }),
  getBudgetInfo: protectedProcedure
    .input(
      z.object({ id: z.number(), cursor: z.number(), perPage: z.number() })
    )
    .query(async ({ ctx, input }) => {
      const budget = await ctx.prisma.budget.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!budget) {
        return null;
      }

      const categories = budget.categories.split(",").map((c) => +c);
      const now = DateTime.now();
      const periodStart = calcStart(now.toISODate()!, budget.reset);
      let pastPeriods = [];
      for (let i = 0; i < 6; i++) {
        switch (budget.reset) {
          case "weekly": {
            const start = DateTime.fromJSDate(periodStart)
              .minus({ weeks: i })
              .toJSDate();
            const end = DateTime.fromJSDate(start).endOf("week").toJSDate();
            pastPeriods.push({ start, end })
            break;
          }
          case "monthly": {
            const start = DateTime.fromJSDate(periodStart)
              .minus({ months: i })
              .toJSDate();
            const end = DateTime.fromJSDate(start).endOf("month").toJSDate();
            pastPeriods.push({ start, end });
            break;
          }
          case "quarterly": {
            const start = DateTime.fromJSDate(periodStart)
              .minus({ quarters: i })
              .toJSDate();
            const end = DateTime.fromJSDate(start).endOf("quarter").toJSDate();
            pastPeriods.push({ start, end });
            break;
          }
        }
      }
      const transactions = await ctx.prisma.bankAccount.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          transactions: {
            where: {
              isTransfer: false,
              removedDate: null,
              categoryId: {
                in: categories,
              },
              date: {
                gte: pastPeriods[5]?.start,
              },
            },
            include: {
              Category: true,
              PayorPayee: true,
            },
          },
        },
      });

      pastPeriods = pastPeriods.map((p) => {
        let transForPeriod: ReturnArray[] = [];
        const startAsDT = DateTime.fromJSDate(p.start);
        const endAsDT = DateTime.fromJSDate(p.end);
        transactions.forEach((a) => {
          if (a.transactions) {
            transForPeriod = [
              ...transForPeriod,
              ...a.transactions.filter(
                (t) =>
                  DateTime.fromJSDate(t.date) >= startAsDT &&
                  DateTime.fromJSDate(t.date) <= endAsDT
              ).map(t => ({ ...t, amount: t.amount.toNumber() })),
            ];
          }
        });
        return {
          ...p,
          transactions: transForPeriod,
        };
      });

    //   let returnArray: ReturnArray[] = [];
    //   transactions.forEach((a) => {
    //     if (a.transactions) {
    //       returnArray = [...returnArray, ...a.transactions];
    //     }
    //   });

      return {
        // transactions: returnArray
        //   .map((t) => ({
        //     ...t,
        //     amount: t.amount.toNumber(),
        //   }))
        //   .sort((a, b) =>
        //     DateTime.fromJSDate(a.date) < DateTime.fromJSDate(b.date) ? 1 : -1
        //   ),
        budget: budget,
        pastPeriods,
      };
    }),
  createBudget: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        reset: z.string(),
        categories: z.array(z.number()),
        max: z.string(),
        start: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, reset, categories, max, start } = input;

      const trueStart = calcStart(start, reset);

      const newbudget = await ctx.prisma.budget.create({
        data: {
          name,
          max: +max,
          reset,
          start: trueStart,
          categories: categories.join(";"),
          userId: ctx.session.user.id,
          lastResetDate: trueStart,
        },
      });

      return newbudget;
    }),
});

const calcStart = (start: string, reset: string) => {
  let asDateTime = DateTime.fromISO(start);

  switch (reset) {
    case "weekly": {
      return asDateTime.startOf("week").toJSDate();
    }
    case "monthly": {
      return asDateTime.startOf("month").toJSDate();
    }
    case "annually": {
      return asDateTime.startOf("year").toJSDate();
    }
    case "quarterly": {
      return asDateTime.startOf("quarter").toJSDate();
    }
    case "biannually": {
      const month = asDateTime.get("month");
      if (month >= 7) {
        asDateTime = asDateTime.set({ month: 7 });
        return asDateTime.startOf("month").toJSDate();
      }
      return asDateTime.startOf("year").toJSDate();
    }
    default: {
      return asDateTime.toJSDate();
    }
  }
};
