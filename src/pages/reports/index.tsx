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

const Reports: NextPageWithLayout = () => {
  const [barChartMonths, setBarChartMonths] = useState(5);
  const { data: incomeExpenseHistory, isLoading: historyLoading } =
    api.reports.incomeExpenseBarChart.useQuery(
      { months: barChartMonths },
      {
        refetchOnWindowFocus: false,
      }
    );

  const { data: pieChartData, isLoading: pieChartLoading } =
    api.reports.monthlyCatSpendPieChart.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const totalSpend = pieChartData?.reduce((a, b) => {
    return a + b.amount;
  }, 0);
  const barChartData = incomeExpenseHistory?.map((dat) => ({
    ...dat,
    month: dat.month.slice(0, 3),
  }));

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

  const pieChartConfig = pieChartData?.reduce((a, b) => {
    return { ...a, [b.category]: { label: b.category, color: b.fill } };
  }, {} as any);

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <div className="mt-5">
        <div className="w-full py-5">
          <div className="flex items-end gap-4">
            <h2 className="w-full">Income vs Expense</h2>
            <Select onValueChange={(e) => setBarChartMonths(parseInt(e))}>
              <SelectTrigger>{barChartMonths + 1} month history</SelectTrigger>
              <SelectContent>
                <SelectItem value="2">3 month history</SelectItem>
                <SelectItem value="5">6 month history</SelectItem>
                <SelectItem value="11">12 month history</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!historyLoading && (
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full max-h-[500px]"
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
        <div className="w-1/2 p-5">
          <h2>Monthly Spend by Category</h2>
          {!pieChartLoading && (
            <ChartContainer config={pieChartConfig} className="min-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                {/* <ChartLegend content={<ChartLegendContent nameKey='category'
                className="translate-x-1/2 flex-wrap gap-2 *:basis-1/4 *:justify-center w-1/2"
              />} /> */}
                <Pie
                  data={pieChartData}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={80}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {"$" + totalSpend?.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Spent
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
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
