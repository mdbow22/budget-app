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
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";

const Reports: NextPageWithLayout = () => {
  const { data: incomeExpenseHistory, isLoading: historyLoading } =
    api.reports.incomeExpenseBarChart.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: pieChartData, isLoading: pieChartLoading } =
    api.reports.monthlyCatSpendPieChart.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
  // const [chartDate, setChartDate] = useState(
  //   DateTime.now().startOf("month").toISO() ??
  //     DateTime.now().startOf("month").toFormat("yyyy-MM-dd")
  // );
  // const dateOptions = useMemo(() => {
  //   const dates: { label: string; value: string | null }[] = [];
  //   for (let i = 0; i < 6; i++) {
  //     const dateTime = DateTime.now().minus({ months: i }).startOf("month");
  //     dates.push({
  //       label: dateTime.toFormat("MM/dd/yyyy"),
  //       value: dateTime.toISO(),
  //     });
  //   }
  //   return dates;
  // }, []);
  // ChartJS.register(ArcElement, Title, Tooltip, Legend);

  // const { data: sumOfSpend, isLoading: spendLoading } =
  //   api.reports.aggregateAccountSpend.useQuery(
  //     { pastMonths: chartDate },
  //     {
  //       refetchOnWindowFocus: false,
  //     }
  //   );

  // const calcAverage = (amounts: number[] | undefined) => {
  //   if (!amounts) {
  //     return;
  //   }

  //   return (
  //     Math.round((amounts.reduce((a, b) => a + b, 0) / amounts.length) * 100) /
  //     100
  //   );
  // };

  const chartData = [
    {
      month: "January",
      income: 14000,
      expense: 8567,
    },
    {
      month: "February",
      income: 13256,
      expense: 4366,
    },
    {
      month: "March",
      income: 15000,
      expense: 5799,
    },
  ];

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
    return ({ ...a, [b.category]: { label: b.category, color: b.fill } })
   }, {} as any);

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <div className="w-1/2 p-5">
        <h2>Income vs Expense</h2>
        {!historyLoading && (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart data={incomeExpenseHistory ?? undefined}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={5} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
      <div className="w-3/4 p-5">
        {!pieChartLoading && (
          <ChartContainer config={pieChartConfig} className="min-h-[250px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie data={pieChartData} dataKey='amount' nameKey='category' innerRadius={100} />
            </PieChart>
          </ChartContainer>
        )}
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
