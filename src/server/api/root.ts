import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { accountsRouter } from './routers/accounts';
import { transactionsRouter } from './routers/transactions';
import { miscRouter } from './routers/misc';
import { reportsRouter } from "./routers/reports";
import { budgetsRouter } from "./routers/budgets";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  accounts: accountsRouter,
  transactions: transactionsRouter,
  misc: miscRouter,
  reports: reportsRouter,
  budgets: budgetsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
