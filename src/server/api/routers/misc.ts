import { createTRPCRouter, protectedProcedure } from "../trpc";

export const miscRouter = createTRPCRouter({
  getUserCategories: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const usersCategories = await ctx.prisma.category.findMany({
      where: {
        OR: [
          {
            custom: userId,
          },
          {
            custom: null,
          },
        ],
        removedDate: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return usersCategories.sort((a, b) => a.name.localeCompare(b.name));
  }),
  getUserPayorPayees: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const usersPayorPayees = await ctx.prisma.payorPayee.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        thirdparty: true,
      },
    });

    return usersPayorPayees.sort((a, b) => a.thirdparty.localeCompare(b.thirdparty));
  }),
});
