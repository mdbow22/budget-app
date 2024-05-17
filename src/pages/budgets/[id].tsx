import React, { useEffect, useMemo, useState } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import TransactionRow from "~/modules/accountPage/TransactionRow";
import { DateTime } from "luxon";
import { Budget } from "@prisma/client";
import { ReturnArray } from "~/server/api/routers/budgets";
import { Filter } from "../../../node_modules/lucide-react";

export interface TransArray extends ReturnArray {
  thirdparty: string | undefined;
}

export type Transactions = {
  transactions: TransArray[];
  start: Date;
  end: Date;
};

const BudgetPage: NextPageWithLayout = () => {
  const [period, setPeriod] = useState<Transactions | undefined>();
  const [filters, setFilters] = useState<
    { column: string; value: string | number }[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
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
        const newData = {
          ...d,
          pastPeriods: d?.pastPeriods.map((p) => ({
            ...p,
            transactions: p.transactions.map((t) => ({
              ...t,
              thirdparty: t.PayorPayee?.thirdparty,
            })),
          })),
        };
        if (!period) {
          setPeriod(newData?.pastPeriods?.[0]);
        }
        if (!filterOptions.length) {
          setFilterOptions(
            [
              ...new Set(
                newData?.pastPeriods?.[0]?.transactions
                  .map((t) => t.PayorPayee?.thirdparty)
                  .filter((t) => t !== null && t !== undefined)
              ),
            ].sort((a, b) => a.localeCompare(b))
          );
        }
        return newData;
      },
    }
  );

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

  useEffect(() => {
    if (filters.length) {
      setPeriod((prev) => {
        const foundPeriod = data?.pastPeriods?.find(
          (f) =>
            prev?.start &&
            prev?.end &&
            DateTime.fromJSDate(f.start).equals(
              DateTime.fromJSDate(prev?.start)
            )
        );
        const transactions = foundPeriod?.transactions.filter((t) => {
          let keep = false;
          filters.forEach((f) => {
            if (f.value) {
              console.log("filter value: ", f.value);
              console.log("transaction: ", t[f.column as keyof TransArray]);
              keep = f.value === t[f.column as keyof TransArray];
            }
          });
          return keep;
        });
        console.log(transactions);
        return prev
          ? {
              ...prev,
              transactions: transactions ?? prev.transactions,
            }
          : undefined;
      });
    } else {
      setPeriod((prev) =>
        prev
          ? data?.pastPeriods?.find(
              (f) =>
                prev?.start &&
                prev?.end &&
                DateTime.fromJSDate(f.start).equals(
                  DateTime.fromJSDate(prev?.start)
                )
            )
          : undefined
      );
    }
  }, [filters, setPeriod]);

  return (
    <>
      {data && period && (
        <div className="p-5">
          <h1 className="text-2xl font-bold">
            {data?.budget?.name} -{" "}
            <span className="text-xl">
              ${data.budget?.max} {data.budget?.reset} spend allowed
            </span>
          </h1>
          <h2 className="mt-5 text-xl font-bold">
            Transactions For Period{" "}
            <select
              className="cursor-pointer bg-transparent"
              value={DateTime.fromJSDate(period.start).toFormat("MM/dd/yyyy")}
              onChange={(e) => {
                const newPeriod = data.pastPeriods?.find((p) => {
                  return (
                    `${DateTime.fromJSDate(p.start).toFormat("MM/dd/yyyy")}` ===
                    e.target.value
                  );
                });
                setPeriod(newPeriod);
                setFilters([]);
                setFilterOptions(
                  [
                    ...new Set(
                      newPeriod?.transactions
                        .map((t) => t.PayorPayee?.thirdparty)
                        .filter((t) => t !== null && t !== undefined)
                    ),
                  ].sort((a, b) => a.localeCompare(b))
                );
              }}
            >
              {data.pastPeriods?.map((p) => {
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
          <div className="flex w-full flex-row items-end gap-3">
            <div className="pt-2">
              <Filter size={20} />
            </div>
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <select
                className="select select-bordered select-xs"
                value={
                  filters?.find((f) => f.column === "description")?.value ?? "0"
                }
                onChange={(e) =>
                  setFilters((prev) => {
                   const filtered = prev.filter(i => i.column !== 'description')
                    filtered.push({ column: "description", value: e.target.value });
                    return filtered;
                })
                }
              >
                <option disabled value="0">
                  Select one...
                </option>
                {[
                  ...new Set(
                    period.transactions
                      .map((t) => t.description)
                      .filter((t) => t !== null)
                  ),
                ]
                  .sort((a, b) => a.localeCompare(b))
                  .map((cat) => {
                    return (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    );
                  })}
              </select>
            </div> */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Payor/Payee</span>
              </label>
              <select
                className="select select-bordered select-xs"
                value={
                  filters?.find((f) => f.column === "thirdparty")?.value ?? "0"
                }
                onChange={(e) =>
                  setFilters((prev) => {
                    const filtered = prev.filter(
                      (i) => i.column !== "thirdparty"
                    );
                    filtered.push({
                      column: "thirdparty",
                      value: e.target.value,
                    });
                    return filtered;
                  })
                }
              >
                <option disabled value="0">
                  Select one...
                </option>
                {filterOptions.map((cat) => {
                  return (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <div className="">&nbsp;</div>
              <button
                className="btn btn-xs"
                type="button"
                onClick={() => setFilters([])}
              >
                Clear
              </button>
            </div>
          </div>
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
                {period?.transactions
                  .sort((a, b) =>
                    DateTime.fromJSDate(a.date) < DateTime.fromJSDate(b.date)
                      ? 1
                      : -1
                  )
                  .map((t) => {
                    return <TransactionRow noedit trans={t} />;
                  })}
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="text-right">{totalSpend}</td>
                </tr>
              </tbody>
            </table>
            <div>
              <p>
                Total Spend: ${totalSpend} (
                {!!data.budget?.max &&
                  Math.floor((totalSpend / data.budget?.max) * 100)}
                % of max)
              </p>
              <p>
                Most Spent at: {calculateBiggestCat(period).largest} ($
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
