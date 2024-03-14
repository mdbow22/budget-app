import React, { useMemo, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import Head from "next/head";
import { api } from "~/utils/api";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import { DateTime } from "luxon";

const Reports: NextPageWithLayout = () => {
  const [chartDate, setChartDate] = useState(
    DateTime.now().startOf("month").toISO() ??
      DateTime.now().startOf("month").toFormat("yyyy-MM-dd")
  );
  const dateOptions = useMemo(() => {
    const dates: { label: string; value: string | null }[] = [];
    for (let i = 0; i < 6; i++) {
      const dateTime = DateTime.now().minus({ months: i }).startOf("month");
      dates.push({
        label: dateTime.toFormat("MM/dd/yyyy"),
        value: dateTime.toISO(),
      });
    }
    return dates;
  }, []);
  ChartJS.register(ArcElement, Title, Tooltip, Legend);

  const { data: sumOfSpend, isLoading: spendLoading } =
    api.reports.aggregateAccountSpend.useQuery(
      { pastMonths: chartDate },
      {
        refetchOnWindowFocus: false,
      }
    );

  const calcAverage = (amounts: number[] | undefined) => {
    if (!amounts) {
      return;
    }

    return (
      Math.round((amounts.reduce((a, b) => a + b, 0) / amounts.length) * 100) /
      100
    );
  };

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <div className="w-full p-5">
        <div className="flex gap-10">
          <h1 className="pb-5 text-2xl font-bold">Monthly Spend by Category</h1>
          <select className={`select select-bordered select-sm`} onChange={(e) => setChartDate(e.target.value)}>
            {dateOptions.map((d) => {
              return (
                <option value={d.value ?? undefined} key={d.value}>
                  {d.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex gap-10">
          <div className="w-full lg:max-w-md">
            {!spendLoading && sumOfSpend && (
              <Pie data={sumOfSpend} className="h-full w-full" />
            )}
          </div>
          <div className="w-full">
            <h2 className="text-xl font-bold">Summary:</h2>
            <ul>
              <li>
                Total Spend: $
                {!!sumOfSpend?.datasets[0]?.data &&
                  Math.floor(
                    sumOfSpend?.datasets[0]?.data.reduce((a, b) => a + b, 0) *
                      100
                  ) / 100}
              </li>
              <li>
                Largest Category: {sumOfSpend?.labels[0]} ($
                {sumOfSpend?.datasets[0]?.data[0]})
              </li>
              <li>
                Smallest Category:{" "}
                {sumOfSpend?.labels[sumOfSpend?.labels.length - 1]} ($
                {sumOfSpend?.datasets[0]?.data[sumOfSpend?.labels.length - 1]})
              </li>
              <li>
                Average Spend: ${calcAverage(sumOfSpend?.datasets[0]?.data)}
              </li>
            </ul>
          </div>
        </div>
      </div>
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
