import { DateTime } from "luxon";
import { Context } from "./incomeExpenseBarChart";

export interface MonthlySpendPieChartType extends Context {
    input?: {
        month?: string;
    }
}

export const monthlySpendPieChart = async (context: MonthlySpendPieChartType) => {
    const ctx = context.ctx;
    const input = context.input;
    const user = ctx.session.user.id;

    const month = input?.month ? DateTime.fromISO(input.month).startOf('month').toJSDate() : DateTime.now().startOf('month').toJSDate();

    const accounts = await ctx.prisma.bankAccount.findMany({
        where: {
            userId: user,
        },
        select: {
            id: true,
        }
    })

    console.log(month);
    console.log(accounts);

    const sumOfSpend = await ctx.prisma.transaction.groupBy({
        _sum: {
          amount: true,
        },
        where: {
          isTransfer: false,
          amount: {
            lt: 0,
          },
          accountId: {
            in: accounts.map(a => a.id),
          },
          date: {
            gte: month,
            lte: DateTime.fromJSDate(month).endOf('month').toJSDate(),
          },
          removedDate: null,
        },
        by: ["categoryId"],
        orderBy: {
          categoryId: "asc",
        },
      });

      const categories = sumOfSpend.flatMap((s) =>
        !!s.categoryId ? [s.categoryId] : []
      );
      const categoryNames = await ctx.prisma.category.findMany({
        where: {
          id: {
            in: categories,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const sumWithCatName = sumOfSpend.map(t => {
        const category = categoryNames.find(c => c.id === t.categoryId)

        return ({
            ...t,
            name: category?.name ?? '',
        });
      }).sort((a, b) =>
        a._sum.amount && b._sum.amount
          ? a._sum.amount?.comparedTo(b._sum.amount)
          : 0
      );

      const colors = generateColors(sumWithCatName.length);

      const chartData = sumWithCatName.map((cat, i) => {

        const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52)

        return ({
            category: cat.name,
            amount: cat._sum.amount ? Math.abs(cat._sum.amount.toNumber()) : 0,
            fill: colors[i],
        })
      })

      return chartData;
}

const generateColors = (amount: number) => {
  const colors: string[] = [];
  const delta = Math.trunc(360 / amount);
  for(let i = 0; i < amount; i++) {
    const hue = i * delta;
    colors.push(`hsla(${hue},80%,50%,1.0)`)
  }

  //shuffle array
  for(let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = colors[i];
    if(colors[j]) {
      colors[i] = colors[j];
      colors[j] = temp as string;
    }
  }

  return colors;
}