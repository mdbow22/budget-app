import React, { useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import { DateTime } from "luxon";
import Pagination from "~/modules/reusables/Pagination";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";

const AccountPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const [page, setPage] = useState(0);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Title
  );

  const { data: transactions } =
    api.transactions.getAccountTransactions.useQuery(
      {
        accountId: parseInt(query.id as string),
        cursor: page,
        perPage: 25,
      },
      {
        enabled: !!query.id,
        keepPreviousData: true,
      }
    );

  const { data: chartData, isLoading: chartLoading } =
    api.reports.getAccountLineChart.useQuery(
      {
        accountId: parseInt(query.id as string),
      },
      {
        enabled: !!query.id,
      }
    );

  return (
    <>
      {transactions && chartData && (
        <>
          <Head>
            <title>Account | {transactions.accountOwner.name}</title>
          </Head>
          <div className="p-5">
            <div className="flex items-end justify-between">
              <h1 className="text-2xl font-bold">
                {transactions.accountOwner.name}
              </h1>
            </div>
            <div className="w-full md:w-1/2">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    //legend: { display: false },
                    title: {
                      display: true,
                      text: "Change in Net Worth",
                    },
                  },
                }}
              />
            </div>
            <table className="table table-zebra table-sm mt-5">
              <thead>
                <tr className="text-center text-primary">
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payor/Payee</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="border border-base-200">
                {transactions.transactions.map((trans) => {
                  return (
                    <tr className="hover" key={`trans-${trans.id}`}>
                      <td>
                        {DateTime.fromJSDate(trans.date).toFormat("MM/dd/yyyy")}
                      </td>
                      <td>{trans.Category?.name}</td>
                      <td>{trans.description}</td>
                      <td>{trans.PayorPayee?.thirdparty}</td>
                      <td className="text-right">
                        {!trans.amount.toString().includes(".")
                          ? trans.amount.toString().concat(".00")
                          : trans.amount}
                      </td>
                      <td className="text-right">
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
            {transactions.totalPageCount > 1 && (
              <div className="mt-5 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={transactions.totalPageCount}
                  setPage={setPage}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

AccountPage.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

AccountPage.auth = true;

export default AccountPage;
