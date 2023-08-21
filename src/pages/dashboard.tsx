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
} from "chart.js";
import { Bar } from "react-chartjs-2";

const Dashboard: NextPageWithLayout = () => {
  const { data } = useSession();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const { data: recentTrans, isLoading } =
    api.transactions.getRecentTransactions.useQuery();

  const { data: chart, isLoading: chartLoading } =
    api.reports.getDashboardChartData.useQuery();

  const totalIncome = chart?.datasets[0] ? Math.floor(chart.datasets[0]?.data.reduce((prev, curr) => prev + curr) * 100) / 100 : 0.00;
  const totalExpenses = chart?.datasets[1] ? Math.floor(chart.datasets[1]?.data.reduce((prev, curr) => prev + curr) * 100) / 100 : 0.00
  const totalNet = Math.floor((totalIncome - totalExpenses) * 100) / 100;

  return (
    <>
      <Head>
        <title>Dashboard | {data?.user.name}</title>
      </Head>
      <div className="p-5">
        <h2 className="pb-2 text-xl font-bold">Recent Transactions</h2>
        <div className="rounded-lg border border-zinc-300 bg-base-200">
          <table className="table">
            <thead>
              <tr className="border-base-300 text-center text-base text-primary">
                <th>Date</th>
                <th>Account</th>
                <th className="hidden md:table-cell">Category</th>
                <th>Description</th>
                <th className="hidden md:table-cell">Payor/Payee</th>
                <th>Amount</th>
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
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-5">
        <h2 className="pb-2 text-xl font-bold">Income vs Expenses</h2>
        {!chartLoading && chart && <Bar data={chart} options={{ responsive: true }} />}
      </div>
      <div className='px-5 pb-5'>
        {chart && <ul className='flex justify-center gap-10'>
          <li><span className="font-bold">Income:</span> {totalIncome}</li>
          <li><span className="font-bold">Expenses:</span> {totalExpenses}</li>
          <li><span className="font-bold">Net:</span> {totalNet}</li>
        </ul>}
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
