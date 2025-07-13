import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import { ISODateString } from "next-auth";

export interface Context {
  ctx: {
    session: {
      user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      } & {
        id: string;
      };
      expires: ISODateString;
    };
    prisma: PrismaClient;
  };
}

interface IncomeExpenseBarChartContext extends Context {
  input?: {
    months?: number;
  };
}

export const incomeExpenseBarChart = async (
  context: IncomeExpenseBarChartContext
) => {
  const ctx = context.ctx;
  const input = context.input;
  const userId = ctx.session.user.id;

  const pastTransactions = await ctx.prisma.transaction.findMany({
    where: {
      BankAccount: {
        userId,
        expireDate: null,
      },
      removedDate: null,
      isTransfer: false,
      AND: [
        {
          date: {
            lte: DateTime.now().endOf("month").toJSDate(),
          },
        },
        {
          date: {
            gte: DateTime.now()
              .minus({ months: input && input.months ? input.months : 5 })
              .startOf("month")
              .toJSDate(),
          },
        },
      ],
    },
    orderBy: [{ date: "asc" }],
  });

  if (pastTransactions) {
    const chartData = pastTransactions.reduce((a, b) => {
      const month = DateTime.fromJSDate(b.date).monthLong ?? "Undefined";
      const amount = b.amount.toNumber();
      const indexOfMonth = a.findIndex((val) => val.month === month);
      if (indexOfMonth > -1 && a[indexOfMonth]) {
        if (amount > 0) {
          a[indexOfMonth] = {
            ...a[indexOfMonth],
            income: a[indexOfMonth].income + amount,
          };
        } else {
          a[indexOfMonth] = {
            ...a[indexOfMonth],
            expense: a[indexOfMonth].expense + Math.abs(amount),
          };
        }
      } else {
        if (amount > 0) {
          a.push({
            month: month,
            income: amount,
            expense: 0,
          });
        } else {
          a.push({
            month: month,
            income: 0,
            expense: Math.abs(amount),
          });
        }
      }

      return a;
    }, [] as { month: string; income: number; expense: number }[]);

    return chartData;
  }

  return null;
};
