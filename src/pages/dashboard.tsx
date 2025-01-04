import Head from "next/head";
import React from "react";
import type { NextPageWithLayout } from "./_app";
import Layout from "~/modules/layouts/Layout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { DateTime } from "luxon";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatCurrency } from "~/utils/functions";
import { Skeleton } from "~/components/ui/skeleton";

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter();
  const { data } = useSession();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const {
    data: accounts,
    isLoading: accountLoading,
    isSuccess,
  } = api.accounts.getAllAccounts.useQuery();

  if (!accounts?.length && !accountLoading && isSuccess) {
    return router.push("/newAccount");
  }

  const { data: recentTrans, isLoading } =
    api.transactions.getRecentTransactions.useQuery();

  const { data: chart } = api.charts.getDashboardChartData.useQuery();

  const { data: lineChart, isLoading: lineChartLoading } =
    api.charts.getDashboardLineChartData.useQuery();

  const { data: sumOfSpend, isLoading: spendLoading } =
    api.charts.getDashboardChartData.useQuery({});

  const totalIncome = chart?.datasets[0]?.data.length
    ? Math.floor(
        chart.datasets[0]?.data.reduce((prev, curr) => prev + curr) * 100
      ) / 100
    : 0.0;
  const totalExpenses = chart?.datasets[1]?.data.length
    ? Math.floor(
        chart.datasets[1]?.data.reduce((prev, curr) => prev + curr) * 100
      ) / 100
    : 0.0;
  const totalNet = Math.floor((totalIncome - totalExpenses) * 100) / 100;

  return (
    <>
      <Head>
        <title>Dashboard | {data?.user.name}</title>
      </Head>
      <h1 className="p-5 text-3xl font-bold text-accent">At a Glance</h1>
      <h2 className="px-5 font-bold text-lg">Past 6 Months...</h2>
      <div className="p-3">
        {chart && (
          <ul className="flex justify-center rounded-lg">
            <li className="h-16 p-4 py-5 border-foreground/50 bg-muted border-r flex flex-col justify-center items-center rounded-l-lg">
              <span className="font-bold">Income</span>
              <span>{formatCurrency(totalIncome)}</span>
            </li>
            <li className="h-16 p-4 py-5 border-foreground/50 bg-muted border-r flex flex-col justify-center items-center">
              <span className="font-bold">Expenses</span> {formatCurrency(totalExpenses)}
            </li>
            <li className="h-16 p-4 py-5 bg-muted flex flex-col justify-center items-center rounded-r-lg">
              <span className="font-bold">Net</span> {formatCurrency(totalNet)}
            </li>
          </ul>
        )}
      </div>
      <div className="flex w-full flex-col justify-between gap-5 px-5 md:flex-row">
        <div className="md:w-6/12">
          <div className="py-2">
            <h2 className="pb-2 font-bold">Income vs Expenses</h2>
            {!spendLoading && sumOfSpend && <Bar data={sumOfSpend} />}
            {spendLoading && <Skeleton className="h-32 lg:h-60" />}
          </div>
        </div>
        <div className="md:w-6/12">
          <div className="py-2">
            <h2 className="pb-2 font-bold">Change in Net Worth</h2>
            {!!lineChart && !lineChartLoading && <Line data={lineChart} />}
            {lineChartLoading && <Skeleton className="h-32 lg:h-60" />}
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5">
        <h2 className="pb-2 text-lg font-bold">Most Recent Transactions</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead>Payor/Payee</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading
              ? recentTrans?.map((transaction) => {
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {DateTime.fromJSDate(transaction.date).toFormat(
                          "MM/dd/yy"
                        )}
                      </TableCell>
                      <TableCell>{transaction.accountName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.category}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.thirdParty}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })
              : [...Array(10)].map((item) => {
                  return (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

Dashboard.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

Dashboard.auth = true;

export default Dashboard;
