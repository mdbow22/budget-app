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
import ConfirmDelete from "~/modules/accountPage/ConfirmDelete";
import { formatCurrency } from "~/utils/functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import TransactionRowNew from "~/modules/accountPage/TransactionRowNew";
import { Skeleton } from "~/components/ui/skeleton";

export type DeleteTransaction = {
  id: number;
  amount: number;
  payorPayee: string | undefined;
  date: string;
  isTransfer: boolean;
};

const AccountPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const [page, setPage] = useState(0);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [transToDel, setTransToDel] = useState<DeleteTransaction>();
  const [open, setOpen] = useState(false);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Title
  );
  const context = api.useContext();
  const { data: transactions, isLoading } =
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

  const handleModalOpen = (trans: DeleteTransaction) => {
    setOpen(true);
    setTransToDel(trans);
  };

  const deleteMutation = api.transactions.deleteTransaction.useMutation({
    onSuccess: async () => {
      await context.accounts.getAllAccounts.invalidate();
      await context.transactions.getAccountTransactions.refetch();
    },
  });

  const deleteTransaction = () => {
    const trans = transactions?.transactions.find(
      (t) => t.id === transToDel?.id
    );

    if (!trans) {
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
      {isLoading && (
        <>
          <div className="p-5">
            <div className="mb-5">
              <h1 className="text-3xl font-bold text-accent">
                <Skeleton className="h-10 w-1/2 md:w-1/4" />
              </h1>
              <div className="mt-2">
                <Skeleton className="h-4 w-1/3 md:w-1/6" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Payor/Payee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(15)].map(i => {
                  return (<TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>)
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {transactions && !isLoading && (
        <>
          <Head>
            <title>Account | {transactions.accountOwner.name}</title>
          </Head>
          <div className="p-5">
            <div className="mb-5">
              <h1 className="text-3xl font-bold text-accent">
                {transactions.accountOwner.name}
              </h1>
              <div className="font-bold">
                {formatCurrency(transactions.accountOwner.currBalance)}
              </div>
            </div>
            {/* <div className="w-full md:w-1/2">
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
            </div> */}
            {/* <table className="table table-zebra table-sm mt-5">
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
            </table> */}

            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Payor/Payee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.transactions.map((trans) => {
                  return (
                    <TransactionRowNew
                      key={trans.id}
                      trans={trans}
                      handleModalOpen={handleModalOpen}
                    />
                  );
                })}
              </TableBody>
            </Table>
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
          <ConfirmDelete
            close={() => deleteTransaction()}
            trans={transToDel}
            open={open}
            setOpen={setOpen}
          />
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
