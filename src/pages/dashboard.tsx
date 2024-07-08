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
  const { data: accounts, isLoading: accountLoading, isSuccess } = api.accounts.getAllAccounts.useQuery();

  if(!accounts?.length && !accountLoading && isSuccess ) {
    return router.push('/newAccount');
  }

  const { data: recentTrans, isLoading } =
    api.transactions.getRecentTransactions.useQuery();

  const { data: chart } =
    api.charts.getDashboardChartData.useQuery();

  const { data: lineChart, isLoading: lineChartLoading } =
    api.charts.getDashboardLineChartData.useQuery();

  const { data: sumOfSpend, isLoading: spendLoading } = api.charts.getDashboardChartData.useQuery({})

  const totalIncome = chart?.datasets[0] && chart?.datasets[0].data.length
    ? Math.floor(
        chart.datasets[0]?.data.reduce((prev, curr) => prev + curr) * 100
      ) / 100
    : 0.0;
  const totalExpenses = chart?.datasets[1] && chart?.datasets[1].data.length
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
      <div className="flex w-full flex-col justify-between gap-5 px-5 md:flex-row">
        <div className="md:w-6/12">
          <div className="py-5">
            <h2 className="pb-2 text-xl font-bold">Income vs Expenses</h2>
            {!spendLoading && sumOfSpend && (
              <Bar
                data={sumOfSpend}
              />
            )}
          </div>
        </div>
        <div className="md:w-6/12">
          <div className="py-5">
            <h2 className="pb-2 text-xl font-bold">Change in Net Worth</h2>
            {!!lineChart && !lineChartLoading && (
              <Line
                data={lineChart}
              />
            )}
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        {chart && (
          <ul className="flex justify-center gap-10">
            <li>
              <span className="font-bold">Income:</span> {totalIncome}
            </li>
            <li>
              <span className="font-bold">Expenses:</span> {totalExpenses}
            </li>
            <li>
              <span className="font-bold">Net:</span> {totalNet}
            </li>
          </ul>
        )}
      </div>
      <div className="px-5 pb-5">
        <h2 className="pb-2 text-xl font-bold">Recent Transactions</h2>
        <div className="rounded-lg border border-zinc-300 bg-base-200">
          <table className="table table-sm">
            <thead>
              <tr className="border-base-300 text-center text-primary">
                <th>Date</th>
                <th>Account</th>
                <th className="hidden md:table-cell">Category</th>
                <th>Description</th>
                <th className="hidden md:table-cell">Payor/Payee</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                recentTrans?.map((transaction) => {
                  return (
                    <tr key={`trans-${transaction.id}`} className="text-center">
                      <td>
                        {DateTime.fromJSDate(transaction.date).toFormat(
                          "MM/dd/yy"
                        )}
                      </td>
                      <td>{transaction.accountName}</td>
                      <td className="hidden md:table-cell">
                        {transaction.category}
                      </td>
                      <td>{transaction.description}</td>
                      <td className="hidden md:table-cell">
                        {transaction.thirdParty
                          ? transaction.thirdParty
                          : transaction.isTransfer
                          ? "Account Transfer"
                          : ""}
                      </td>
                      <td className="text-right">
                        {!transaction.amount.toString().includes(".")
                          ? transaction.amount.toString().concat(".00")
                          : transaction.amount}
                      </td>
                      <td className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-4 w-4 float-right"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                          />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
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
