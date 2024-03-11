import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DateTime } from "luxon";

export const reportsRouter = createTRPCRouter({
  aggregateAccountSpend: protectedProcedure
    .input(
      z.object({
        accountId: z.number().optional(),
        pastMonths: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const sumOfSpend = await ctx.prisma.transaction.groupBy({
        _sum: {
          amount: true,
        },
        where: {
          isTransfer: false,
          amount: {
            lt: 0,
          },
          accountId: input.accountId,
          date: {
            gte: input.pastMonths
              ? DateTime.fromISO(input.pastMonths).toJSDate()
              : DateTime.now().startOf("month").toJSDate(),
            lte: input.pastMonths
              ? DateTime.fromISO(input.pastMonths).endOf("month").toJSDate()
              : DateTime.now().endOf("month").toJSDate(),
          },
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
      const sumWithCatName = sumOfSpend
        .map((t) => {
          const catName = categoryNames.find((c) => c.id === t.categoryId);

          return {
            ...t,
            name: catName?.name,
          };
        })
        .sort((a, b) =>
          a._sum.amount && b._sum.amount
            ? a._sum.amount?.comparedTo(b._sum.amount)
            : 0
        );

      const chartData = {
        labels: sumWithCatName.map((c) => c.name),
        datasets: [
          {
            label: "Total Amount",
            data: sumWithCatName.flatMap((c) =>
              c._sum.amount ? [Math.abs(c._sum.amount.toNumber())] : []
            ),
            backgroundColor: sumWithCatName.map((c) => {
              const randomNum = () =>
                Math.floor(Math.random() * (235 - 52 + 1) + 52);
              return `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;
            }),
          },
        ],
      };

      return chartData;
    }),
});
