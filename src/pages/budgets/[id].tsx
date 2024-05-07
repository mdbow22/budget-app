import React, { useMemo, useState } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import TransactionRow from "~/modules/accountPage/TransactionRow";
import { DateTime } from "luxon";
import { Budget } from "@prisma/client";
import { ReturnArray } from "~/server/api/routers/budgets";

export type Transactions = {
  transactions: ReturnArray[];
  start: Date;
  end: Date;
};

const BudgetPage: NextPageWithLayout = () => {
  const [period, setPeriod] = useState<Transactions | undefined>();
  const { query } = useRouter();
  const { data } = api.budgets.getBudgetInfo.useQuery(
    {
      id: parseInt(query.id as string),
      cursor: 1,
      perPage: 25,
    },
    {
      enabled: !!query.id,
      keepPreviousData: true,
      select: (d) => {
        if (!period) {
          setPeriod(d?.pastPeriods[0]);
        }
        return d;
      },
    }
  );

  const periodString = (budget: Budget) => {
    const now = DateTime.now();
    let start = "";
    let end = "";
    switch (budget.reset) {
      case "weekly": {
        start = now.startOf("week").toFormat("MM/dd");
        end = now.endOf("week").toFormat("MM/dd");
        break;
      }
      case "monthly": {
        start = now.startOf("month").toFormat("MM/dd");
        end = now.endOf("month").toFormat("MM/dd");
        break;
      }
      case "quarterly": {
        start = now.startOf("quarter").toFormat("MM/dd");
        end = now.endOf("quarter").toFormat("MM/dd");
        break;
      }
      case "annually": {
        start = now.startOf("year").toFormat("MM/dd");
        end = now.endOf("year").toFormat("MM/dd");
        break;
      }
      case "biannually": {
        if (now.get("month") > 6) {
          const newMonth = now.set({ month: 7 });
          start = newMonth.startOf("month").toFormat("MM/dd");
          end = now.endOf("year").toFormat("MM/dd");
        } else {
          const newMonth = now.set({ month: 6 });
          start = now.startOf("year").toFormat("MM/dd");
          end = newMonth.endOf("quarter").toFormat("MM/dd");
        }
        break;
      }
    }

    return `${start} - ${end}`;
  };

  const totalSpend = useMemo(() => {
    return data && period
      ? Math.abs(
          Math.floor(
            period.transactions.reduce((a, b) => a + b.amount, 0) * 100
          ) / 100
        )
      : 0;
  }, [data, period]);

  const calculateBiggestCat = (period: Transactions) => {
    let places: { [x: string]: number } = {};
    const payorPayees = [
      ...new Set(period.transactions.map((t) => t.PayorPayee?.thirdparty)),
    ];
    payorPayees.forEach((pp) => {
      if (pp && !places[pp]) {
        places[pp] = Math.abs(
          Math.floor(
            period.transactions
              .filter((t) => t.PayorPayee?.thirdparty === pp)
              .reduce((a, b) => a + b.amount, 0) * 100
          ) / 100
        );
      }
    });

    let largest = "";
    Object.keys(places).forEach((pp) => {
      if (
        (places[pp] && places[largest] && places[pp] > places[largest]!) ||
        !largest.length
      ) {
        largest = pp;
      }
    });

    return { largest, amount: places[largest] };
  };

  return (
    <>
      {data && period && (
        <div className="p-5">
          <h1 className="text-2xl font-bold">{data?.budget.name} - <span className="text-xl">${data.budget.max} {data.budget.reset} spend allowed</span></h1>
          <h2 className="mt-5 text-xl font-bold">
            Transactions For Period{" "}
            <select
              className="cursor-pointer bg-transparent"
              value={DateTime.fromJSDate(period.start).toFormat("MM/dd/yyyy")}
              onChange={(e) => {
                const newPeriod = data.pastPeriods.find((p) => {
                  return (
                    `${DateTime.fromJSDate(p.start).toFormat("MM/dd/yyyy")}` ===
                    e.target.value
                  );
                });
                setPeriod(newPeriod);
              }}
            >
              {data.pastPeriods.map((p) => {
                return (
                  <option
                    value={DateTime.fromJSDate(p.start).toFormat("MM/dd/yyyy")}
                  >
                    {DateTime.fromJSDate(p.start).toFormat("MM/dd")} -{" "}
                    {DateTime.fromJSDate(p.end).toFormat("MM/dd")}
                  </option>
                );
              })}
            </select>
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <table className="table table-zebra table-sm">
              <thead>
                <tr className="text-center text-primary">
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payor/Payee</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="border border-base-200">
                {period?.transactions.map((t) => {
                  return <TransactionRow noedit trans={t} />;
                })}
              </tbody>
            </table>
            <div>
              <p>
                Total Spend: ${totalSpend} (
                {Math.floor((totalSpend / data.budget.max) * 100)}% of max)
              </p>
              <p>
                Most Spent at:{" "}
                {calculateBiggestCat(period).largest} ($
                {calculateBiggestCat(period).amount})
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

BudgetPage.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

BudgetPage.auth = true;

export default BudgetPage;
