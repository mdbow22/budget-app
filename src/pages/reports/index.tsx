import React, { useMemo, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import Head from "next/head";
import { api } from "~/utils/api";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
//import { Pie } from "react-chartjs-2";
import { DateTime } from "luxon";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { formatCurrency } from "~/utils/functions";
import { netWorthCangeLineChart } from "~/server/api/controllers/reports/netWorthChangeLineChart";

const Reports: NextPageWithLayout = () => {
  const [barChartMonths, setBarChartMonths] = useState(5);
  const [lineChartMonths, setLineChartMonths] = useState(6);
  const { data: incomeExpenseHistory, isLoading: historyLoading } =
    api.reports.incomeExpenseBarChart.useQuery(
      { months: barChartMonths },
      {
        refetchOnWindowFocus: false,
      }
    );

  const barChartData = incomeExpenseHistory?.map((dat) => ({
    ...dat,
    month: dat.month.slice(0, 3),
  }));

  const totals = incomeExpenseHistory?.reduce(
    (a, b) => {
      return {
        income: a.income + b.income,
        expense: a.expense + b.expense,
      };
    },
    { income: 0, expense: 0 }
  );

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--accent))",
    },
    expense: {
      label: "Expenses",
      color: "hsl(var(--destructive))",
    },
  } satisfies ChartConfig;

  const { data: netWrothLineChartData, isLoading: netWorthLoading } =
    api.reports.netWorthChangeLineChart.useQuery(
      { months: lineChartMonths },
      { refetchOnWindowFocus: false }
    );

  const lineChartConfig = {
    balance: {
      label: "Balance",
      color: "hsl(var(--accent))",
    },
  } satisfies ChartConfig;

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <div className="mt-5">
        <div className="w-full py-5">
          <div className="mb-4 flex items-end gap-4">
            <h2 className="w-full text-2xl font-bold">Income vs Expense</h2>
            <div>
              <Select onValueChange={(e) => setBarChartMonths(parseInt(e))}>
                <SelectTrigger>
                  {barChartMonths + 1} month history
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">3 month history</SelectItem>
                  <SelectItem value="5">6 month history</SelectItem>
                  <SelectItem value="11">12 month history</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!historyLoading && (
            <ChartContainer
              config={chartConfig}
              className="max-h-[500px] min-h-[200px] w-full"
            >
              <BarChart data={barChartData ?? undefined}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={5} />
                <YAxis axisLine={false} tickLine={false} tickCount={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
        <div>
          {totals && (
            <ul className="flex justify-center rounded-lg">
              <li className="flex h-16 flex-col items-center justify-center rounded-l-lg border-r border-foreground/50 bg-muted p-4 py-5">
                <span className="font-bold">Income</span>
                <span>{formatCurrency(totals.income)}</span>
              </li>
              <li className="flex h-16 flex-col items-center justify-center border-r border-foreground/50 bg-muted p-4 py-5">
                <span className="font-bold">Expenses</span>{" "}
                {formatCurrency(totals.expense)}
              </li>
              <li className="flex h-16 flex-col items-center justify-center rounded-r-lg bg-muted p-4 py-5">
                <span className="font-bold">Net</span>{" "}
                {formatCurrency(totals.income - totals.expense)}
              </li>
            </ul>
          )}
        </div>
        <div className="w-full py-5">
          <div className="mb-4 flex items-end gap-4">
            <h2 className="w-full text-2xl font-bold">Change in Net Worth</h2>
            <div>
              <Select onValueChange={(e) => setBarChartMonths(parseInt(e))}>
                <SelectTrigger>
                  {barChartMonths + 1} month history
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">3 month history</SelectItem>
                  <SelectItem value="5">6 month history</SelectItem>
                  <SelectItem value="11">12 month history</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="w-full py-5">
          <ChartContainer config={lineChartConfig}
            className="max-h-[500px] min-h-[200px] w-full"
          >
            <LineChart data={netWrothLineChartData ?? undefined}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={4} />
              <YAxis axisLine={false} tickCount={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="balance"
                dot={{
                  fill: "var(--color-balance)",
                }}
                type="natural"
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
};

Reports.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

Reports.auth = true;

export default Reports;
