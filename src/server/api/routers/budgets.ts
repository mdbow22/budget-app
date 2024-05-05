import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DateTime } from "luxon";

export const budgetsRouter = createTRPCRouter({
  getAllBudgets: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.budget.findMany({
        where: {
            userId: ctx.session.user.id,
        },
        select: {
            name: true,
            id: true,
        }
    })
  }),
  getBudgetInfo: protectedProcedure.input(z.object({ id: z.number(), cursor: z.number(), perPage: z.number() }))
    .query(async ({ ctx, input }) => {
        const budget = await ctx.prisma.budget.findFirst({
            where: {
                id: input.id,
            }
        });

        const categories = budget?.categories.split(',').map(c => +c);
        

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
                categories: categories.join(';'),
                userId: ctx.session.user.id,
            }
        });

        return newbudget;
    }),
});

const calcStart = (start: string, reset: string) => {
    const asDateTime = DateTime.fromISO(start);

    switch(reset) {
        case 'weekly': {
            return asDateTime.startOf('week').toJSDate();
        }
        case 'monthly': {
            return asDateTime.startOf('month').toJSDate();
        }
        case 'annually': {
            return asDateTime.startOf('year').toJSDate();
        }
        case 'quarterly': {
            const month = Math.floor(asDateTime.get('month') / 3) *  3;
            asDateTime.set({ month });
            return asDateTime.startOf('month').toJSDate();
        }
        case 'biannually': {
            const month = asDateTime.get('month');
            if(month >= 7) {
                asDateTime.set({month: 7})
                return asDateTime.startOf('month').toJSDate();
            }
            return asDateTime.startOf('year').toJSDate();
        }
        default: {
            return asDateTime.toJSDate();
        }
    }
}