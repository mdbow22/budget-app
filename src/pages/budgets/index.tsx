import React from "react";
import Head from "next/head";
import { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { useSession } from "next-auth/react";

const Budgets: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Budgets</title>
      </Head>
      <h1 className="p-5 text-3xl font-bold text-accent">Budgets</h1>
      <div className="mx-4 mb-4 border">
        <h2 className="text-2xl font-bold">Current Budgets</h2>
        <ol>
            <li>Budget A</li>
        </ol>
      </div>
      <div className="mx-4 mb-4">
        <h2 className="text-2xl font-bold">Create New Budget</h2>
      </div>
    </>
  );
};

Budgets.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

Budgets.auth = true;

export default Budgets;
