import React, { useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import { DateTime } from "luxon";
import Pagination from '~/modules/reusables/Pagination';

const AccountPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const [page, setPage] = useState(0);

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

  return (
    <>
      {transactions && (
        <>
          <Head>
            <title>Account | {transactions.accountOwner.name}</title>
          </Head>
          <div className="p-5">
            <div className='flex justify-between items-end'>
            <h1 className="text-2xl font-bold">
              {transactions.accountOwner.name}
            </h1>
            </div>
            <table className="table table-zebra table-sm mt-5">
              <thead>
                <tr className='text-center text-primary'>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payor/Payee</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className='border border-base-200'>
                {transactions.transactions.map((trans) => {
                  return (
                    <tr className='hover' key={`trans-${trans.id}`}>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {transactions.totalPageCount > 1 && 
            <div className="mt-5 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={transactions.totalPageCount}
                setPage={setPage}
              />
            </div>
            }
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
