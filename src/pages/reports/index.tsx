import React, { useEffect, useMemo, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import Head from "next/head";
import { api } from "~/utils/api";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import { DateTime } from "luxon";
import MonthlySpend from "~/modules/reportsPage/MonthlySpend";
import { useRouter } from "next/router";
import SpendByCategory from "~/modules/reportsPage/SpendByCategory";

const Reports: NextPageWithLayout = () => {

  const [report, setReport] = useState('');
  const router = useRouter();
  
  ChartJS.register(ArcElement, Title, Tooltip, Legend);

  const renderReport = () => {
    const type = router.query.type;

    switch(type) {
      case 'monthly': {
        return (<MonthlySpend />);
      }
      case 'byCategory': {
        return (<SpendByCategory />)
      }
      default: {
        return (<>Unable to locate requested report.</>)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      {renderReport()}
    </>
  );
};

Reports.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

Reports.auth = true;

export default Reports;
