import { PrismaClient } from "@prisma/client";
import { DateTime, Info } from "luxon";
import { ISODateString } from "next-auth";
import { Context } from "./incomeExpenseBarChart";

interface NetWorthChangeLineChartContext extends Context {
  input?: {
    months?: number;
  };
}

export const netWorthCangeLineChart = async (
  context: NetWorthChangeLineChartContext
) => {
  const { ctx, input } = context;
  const userId = ctx.session.user.id;
console.log(input);
  const allAccounts = await ctx.prisma.bankAccount.findMany({
    where: {
      userId,
      expireDate: null,
    },
    select: {
      id: true,
      currBalance: true,
    },
  });

  const totalCurrBal = allAccounts.reduce(
    (prev, curr) => prev + curr.currBalance.toNumber(),
    0
  );
  const currMonth = DateTime.now();
  const totalMonths = input?.months ? input.months : 6;
  const returnInfo: { month: string; balance: number }[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const monthNumber =
       currMonth.month - i <= 0
        ? 11 + (currMonth.month - i)
        : currMonth.month - 1 - i;
    const sumOfTrans = await ctx.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        accountId: {
          in: allAccounts.map((acc) => acc.id),
        },
        removedDate: null,
        isTransfer: false,
        AND: [
          {
            date: {
              lte: DateTime.now().toJSDate(),
            },
          },
          {
            date: {
              gte: DateTime.now()
                .minus({ months: i })
                .startOf("month")
                .toJSDate(),
            },
          },
        ],
      },
    });

    returnInfo[i] = {
      month: Info.months("short")[monthNumber] + " 1st",
      balance: sumOfTrans._sum.amount
        ? totalCurrBal - sumOfTrans._sum?.amount?.toNumber()
        : totalCurrBal - 0,
    };
  }

  returnInfo.unshift({ month: "Now", balance: totalCurrBal });
  return returnInfo.reverse();
};
