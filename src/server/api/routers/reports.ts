import { DateTime, Info } from "luxon";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

export type DashboardTransType = {
  id: number;
  accountId: number;
  amount: Decimal;
  date: Date;
  categoryId: number | null;
  description: string | null;
  payorPayee: number | null;
  isTransfer: boolean;
  createdDate: Date;
  removedDate: Date | null;
};

export type LineChartData = {
  labels: string[];
  datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      cubicInterpolationMode: 'default' | 'monotone' | undefined;
      tension: number;
  }[];
}

export const reportsRouter = createTRPCRouter({
  getDashboardLineChartData: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const allAccounts = await ctx.prisma.bankAccount.findMany({
        where: {
          userId,
          expireDate: null,
        },
        select: {
          id: true,
          currBalance: true,
        }
      });

      const totalCurrBal = allAccounts.reduce((prev, curr) => prev + curr.currBalance.toNumber(), 0);

      const labels: string[] = [];
      const balances = [];
      const currMonth = DateTime.now();
      for(let i = 0; i < 6; i++) {
        labels[i] = Info.months('short')[currMonth.month - 1 - i] + ' 1st' ?? '';

        const sumOfTrans = await ctx.prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            accountId: {
              in: allAccounts.map(acc => acc.id),
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
          }
        })

        balances[i] = sumOfTrans._sum.amount ? totalCurrBal - sumOfTrans._sum?.amount?.toNumber() : totalCurrBal - 0;
      }

      labels.unshift('Now');
      balances.unshift(totalCurrBal);

      const chartData: LineChartData = {
        labels: labels.reverse(),
        datasets: [
          {
            label: 'Combined Accounts',
            data: balances.reverse(),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132)',
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
        ]
      };

      return chartData;

    }),
  getDashboardChartData: protectedProcedure
    .input(
      z
        .object({
          accountId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const bankAccountWhere = input?.accountId
        ? {
            userId,
            id: input.accountId,
          }
        : {
            userId,
            expireDate: null,
          };

      const threeMonthsTrans: DashboardTransType[] =
        await ctx.prisma.transaction.findMany({
          where: {
            BankAccount: bankAccountWhere,
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
                    .minus({ months: 5 })
                    .startOf("month")
                    .toJSDate(),
                },
              },
            ],
          },
          orderBy: [
            {
              date: 'asc'
            }
          ]
        });

      if (threeMonthsTrans) {
        const labels: string[] = [];
        threeMonthsTrans.forEach((trans) => {
          const month = DateTime.fromJSDate(trans.date).monthShort;
          if (month && !labels.includes(month)) {
            labels.push(month);
          }
        });

        const incomePoints = threeMonthsTrans.filter(
          (trans) => trans.amount.toNumber() > 0
        );
        const expensePoints = threeMonthsTrans.filter(
          (trans) => trans.amount.toNumber() < 0
        );

        const chartData = {
          labels: labels,
          datasets: [
            {
              label: "Income",
              data: buildDataArray(incomePoints, labels),
              backgroundColor: "#5F955F",
            },
            {
              label: "Expenses",
              data: buildDataArray(expensePoints, labels),
              backgroundColor: "#f87272",
            },
          ],
        };

        return chartData;
      }

      return null;
    }),
  getAccountLineChart: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {

      const account = await ctx.prisma.bankAccount.findFirst({
        where: {
          id: input.accountId,
          userId: ctx.session.user.id,
        },
        include: {
          transactions: {
            where: {
              AND: [
                {
                  date: {
                    lte: DateTime.now().endOf("month").toJSDate(),
                  },
                },
                {
                  date: {
                    gte: DateTime.now()
                      .minus({ months: 5 })
                      .startOf("month")
                      .toJSDate(),
                  },
                },
              ],
            },
            orderBy: [
              {
                date: 'asc'
              }
            ]
          },
        },
      });

      if (account) {
        const labels: string[] = [];
        account.transactions.forEach((trans) => {
          const month = DateTime.fromJSDate(trans.date).monthShort;
          if (month && !labels.includes(month)) {
            labels.push(month);
          }
        });
        
        const currBal = account.currBalance.toNumber();

        const baseData: number[] = [];
        labels.forEach((label, i) => {
          baseData[i] = currBal - account.transactions
          .filter(
            (trans) =>
              DateTime.fromJSDate(trans.date) > DateTime.now().startOf("month").minus({months: i})
          ).reduce((total, curr) => total + curr.amount.toNumber(), 0)
        })

        labels.push('now');
        baseData.unshift(currBal);

        const chartData: LineChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Dataset 1',
              data: baseData.reverse(),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              cubicInterpolationMode: 'monotone',
              tension: 0.4,
            },
          ]
        };

        return chartData;
      }

      return null;
    }),
});

export const buildDataArray = (
  incomePoints: DashboardTransType[],
  tempLabels: string[]
) => {
  const tempData: { month: string; total: number }[] = [];
  incomePoints?.forEach((trans) => {
    const month = DateTime.fromJSDate(trans.date).month.toString();
    if (month && tempData.map((d) => d.month).includes(month)) {
      tempData[tempData.map((d) => d.month).indexOf(month)]!.total +=
        trans.amount.toNumber();
    } else if (month) {
      tempData.push({
        month: month.toString(),
        total: trans.amount.toNumber(),
      });
    }
  });
  const months = Info.months("numeric").map((month) => ({
    name: Info.months("short")[parseInt(month) - 1],
    number: month,
  }));

  tempLabels.forEach((label) => {
    const missingMonth = months.filter((month) => month.name === label)[0];
    if (
      missingMonth &&
      !tempData.map((d) => d.month).includes(missingMonth.number)
    ) {
      tempData.push({
        month: missingMonth.number,
        total: 0,
      });
    }
  });

  return tempData
    .sort((a, b) => parseInt(a.month) - parseInt(b.month))
    .map((trans) => Math.abs(trans.total));
};
