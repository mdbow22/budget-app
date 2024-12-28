import React, { useRef, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
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
import ConfirmDelete from '~/modules/accountPage/ConfirmDelete';
import TransactionRow from '~/modules/accountPage/TransactionRow';
import { balance } from "~/utils/functions";

export type DeleteTransaction = {
  id: number;
  amount: number;
  payorPayee: string | undefined;
  date: string;
  isTransfer: boolean;
}

const AccountPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const [page, setPage] = useState(0);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [transToDel, setTransToDel] = useState<DeleteTransaction>();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Title
  );
  const context = api.useContext();
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

  const { data: chartData } =
    api.charts.getAccountLineChart.useQuery(
      {
        accountId: parseInt(query.id as string),
      },
      {
        enabled: !!query.id,
      }
    );

  const deleteMutation = api.transactions.deleteTransaction.useMutation({
    onSuccess: async () => {
      await context.accounts.getAllAccounts.invalidate();
      await context.charts.getAccountLineChart.invalidate();
      await context.transactions.getAccountTransactions.refetch();
    },
  });

  const deleteTransaction = () => {

    const trans = transactions?.transactions.find(t => t.id === transToDel?.id)

    if(!trans) {
      return null;
    }

    deleteMutation.mutate({
      account: parseInt(query.id as string),
      trans: {
        id: trans.id,
        amount: trans.amount,
        date: trans.date,
        isTransfer: trans.isTransfer,
      },
    });
    modalRef.current?.close();
    setTransToDel(undefined);
  };

  return (
    <>
      {transactions && chartData && (
        <>
          <Head>
            <title>Account | {transactions.accountOwner.name}</title>
          </Head>
          <div className="p-5">
            <div className="">
              <h1 className="text-3xl font-bold text-accent">
                {transactions.accountOwner.name}
              </h1>
              <div className="font-bold">{balance(transactions.accountOwner.currBalance)}</div>
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
                    <TransactionRow modalRef={modalRef} trans={trans} setTransToDel={setTransToDel} key={`${trans.id-trans.amount}`} />
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
          <ConfirmDelete close={() => deleteTransaction()} trans={transToDel} ref={modalRef} />
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
