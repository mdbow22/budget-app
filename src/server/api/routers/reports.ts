import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { incomeExpenseBarChart } from "../controllers/reports/incomeExpenseBarChart";
import { monthlySpendPieChart } from "../controllers/reports/monthlySpendPieChart";
import { netWorthCangeLineChart } from "../controllers/reports/netWorthChangeLineChart";

export const reportsRouter = createTRPCRouter({
    incomeExpenseBarChart: protectedProcedure.input(z.object({ months: z.number().optional() }).optional()).query(incomeExpenseBarChart),
    monthlyCatSpendPieChart: protectedProcedure.input(z.object({ month: z.string().optional() }).optional()).query(monthlySpendPieChart),
    netWorthChangeLineChart: protectedProcedure.input(z.object({ months: z.number().optional()}).optional()).query(netWorthCangeLineChart),
});
