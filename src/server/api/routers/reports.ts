import { DateTime, Info } from "luxon";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { Decimal } from "@prisma/client/runtime/library";

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

export const reportsRouter = createTRPCRouter({
  getDashboardChartData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const threeMonthsTrans: DashboardTransType[] =
      await ctx.prisma.transaction.findMany({
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
                  .minus({ months: 3 })
                  .startOf("month")
                  .toJSDate(),
              },
            },
          ],
        },
      });

    if (threeMonthsTrans) {
      let labels: string[] = [];
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
});

export const buildDataArray = (
  incomePoints: DashboardTransType[],
  tempLabels: string[]
) => {
  let tempData: { month: string; total: number }[] = [];
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
