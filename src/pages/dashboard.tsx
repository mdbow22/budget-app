import Head from "next/head";
import React from "react";
import type { NextPageWithLayout } from "./_app";
import Layout from "~/modules/layouts/Layout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { DateTime } from "luxon";
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
import Link from "next/link";
import { Button } from "~/components/ui/button";
import CategorySpendPieChart from "~/modules/dashboard/CategorySpendPieChart";

const Dashboard: NextPageWithLayout = () => {
  const { data } = useSession();

  
  const {
    data: accounts,
    isLoading: accountLoading,
    isSuccess,
  } = api.accounts.getAllAccounts.useQuery();

  

  const { data: recentTrans, isLoading } =
    api.transactions.getRecentTransactions.useQuery();

  if (!accounts?.length && !accountLoading && isSuccess) {
    return <>
      <h2 className="text-center text-xl font-bold mt-10">You have 0 Accounts Set Up</h2>
      <div className="w-full flex justify-center">
        <Link as="child" href="/newAccount"><Button className="mt-3 bg-accent">Create New Account</Button></Link>
      </div>
    </>
  }

  return (
    <>
      <Head>
        <title>Dashboard | {data?.user.name}</title>
      </Head>

      <h1 className="p-5 text-3xl font-bold text-accent">At a Glance</h1>
      <div className="mx-4 mb-4 md:w-[calc(50%-1rem)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>Account</TableHead>
              <TableHead className="text-center">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!accountLoading &&
              accounts?.map((account) => {
                return (
                  <TableRow key={account.id}>
                    <TableCell className="w-2/3 md:w-3/4">
                      <Link href={`/accounts/${account.id}`}>
                        {account.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(account.currBalance)}
                    </TableCell>
                  </TableRow>
                );
              })}
            <TableRow>
              <TableCell className="w-2/3 font-bold md:w-3/4">Net</TableCell>
              <TableCell className="text-center font-bold">
                {accounts &&
                  formatCurrency(
                    accounts.reduce((a, b) => a + b.currBalance, 0)
                  )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className=" w-full  px-5 md:flex-row">
        <CategorySpendPieChart />
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
                    <TableRow key={item}>
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
