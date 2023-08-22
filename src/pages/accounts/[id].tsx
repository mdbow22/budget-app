import React, { useState } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import { DateTime } from 'luxon';

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
            <h1 className="text-2xl font-bold">
              {transactions.accountOwner.name}
            </h1>
            <table className='table table-zebra table-sm'>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Payor/Payee</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.transactions.map(trans => {
                        return (
                            <tr>
                                <td>{DateTime.fromJSDate(trans.date).toFormat('MM/dd/yyyy')}</td>
                                <td>{trans.Category?.name}</td>
                                <td>{trans.description}</td>
                                <td>{trans.PayorPayee?.thirdparty}</td>
                                <td>{trans.amount}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className='flex justify-center mt-5'>
            <div className='join'>
                <button type='button' className='join-item btn' onClick={() => setPage(prev => prev - 1)}>{'<<'}</button>
                <button type='button' className='join-item btn'>Page {page + 1} / {transactions.totalPageCount}</button>
                <button type='button' className='join-item btn' onClick={() => setPage(prev => ++prev)}>{'>>'}</button>
            </div>
            </div>
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
