import Head from "next/head";
import React, { ReactElement, useMemo } from "react";
import { NextPageWithLayout } from "./_app";
import Layout from "~/modules/layouts/Layout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { DateTime, Info } from "luxon";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

const Dashboard: NextPageWithLayout = () => {
  const { data } = useSession();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const { data: recentTrans, isLoading } =
    api.transactions.getRecentTransactions.useQuery();

    const labels = useMemo(() => {
        let tempLabels: string[] = [];
        if(recentTrans) {
            recentTrans.forEach(trans => {
                const month = DateTime.fromJSDate(trans.date).monthShort;
                if(month && !tempLabels.includes(month)) {
                    tempLabels.push(month);
                }
            })
        }

        return tempLabels.reverse();
    }, [recentTrans])

    const income = useMemo(() => {

        let tempLabels: string[] = [];
        if(recentTrans) {
            recentTrans.reverse().forEach(trans => {
                const month = DateTime.fromJSDate(trans.date).monthShort;
                if(month && !tempLabels.includes(month)) {
                    tempLabels.push(month);
                }
            })
        }

        const incomePoints = recentTrans?.filter(trans => trans.amount > 0 && !trans.isTransfer);
        let tempData: { month: string, total: number }[] = [];
        incomePoints?.forEach(trans => {
            const month = DateTime.fromJSDate(trans.date).month.toString();
            if(month && tempData.map((d) => d.month).includes(month)) {
                tempData[tempData.map(d => d.month).indexOf(month)]!.total += trans.amount;
            } else if(month) {
                tempData.push({
                    month: month.toString(),
                    total: trans.amount,
                })
            }
        })
        const months = Info.months('numeric').map((month) => ({
            name: Info.months('short')[parseInt(month) - 1],
            number: month,
        }));
        console.log(months);
        tempLabels.forEach((label) => {
            const missingMonth = months.filter(month => month.name === label)[0];
            if(missingMonth && !tempData.map(d => d.month).includes(missingMonth.number)) {
                tempData.push({
                    month: missingMonth.number,
                    total: 0,
                })
            }
        })

        return tempData.sort((a, b) => parseInt(a.month) - parseInt(b.month));

    }, [recentTrans])

    const expenses = useMemo(() => {

        let tempLabels: string[] = [];
        if(recentTrans) {
            recentTrans.reverse().forEach(trans => {
                const month = DateTime.fromJSDate(trans.date).monthShort;
                if(month && !tempLabels.includes(month)) {
                    tempLabels.push(month);
                }
            })
        }

        const incomePoints = recentTrans?.filter(trans => trans.amount < 0 && !trans.isTransfer);
        let tempData: { month: string, total: number }[] = [];
        incomePoints?.forEach(trans => {
            const month = DateTime.fromJSDate(trans.date).month.toString();
            if(month && tempData.map((d) => d.month).includes(month)) {
                tempData[tempData.map(d => d.month).indexOf(month)]!.total += trans.amount;
            } else if(month) {
                tempData.push({
                    month: month.toString(),
                    total: trans.amount,
                })
            }
        })
        const months = Info.months('numeric').map((month) => ({
            name: Info.months('short')[parseInt(month) - 1],
            number: month,
        }));
        console.log(months);
        tempLabels.forEach((label) => {
            const missingMonth = months.filter(month => month.name === label)[0];
            if(missingMonth && !tempData.map(d => d.month).includes(missingMonth.number)) {
                tempData.push({
                    month: missingMonth.number,
                    total: 0,
                })
            }
        })

        return tempData.sort((a, b) => parseInt(a.month) - parseInt(b.month));

    }, [recentTrans])

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Income',
                data: income.map(d => d.total),
                backgroundColor: '#5F955F',
            },
            {
                label: 'Expenses',
                data: expenses.map(d => Math.abs(d.total)),
                backgroundColor: '#f87272',
            }
        ]
    }

  return (
    <>
      <Head>
        <title>Dashboard | {data?.user.name}</title>
      </Head>
      <div className="p-5">
        <h2 className="pb-2 text-xl font-bold">Recent Transactions</h2>
        <div className="rounded-lg border border-zinc-300 bg-base-200">
          <table className="table">
            <thead>
              <tr className="border-base-300 text-primary text-center text-base">
                <th>Date</th>
                <th>Account</th>
                <th className="hidden md:table-cell">Category</th>
                <th>Description</th>
                <th className="hidden md:table-cell">Payor/Payee</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                recentTrans?.map((transaction) => {
                  return (
                    <tr key={`trans-${transaction.id}`} className='text-center'>
                      <td>
                        {DateTime.fromJSDate(transaction.date).toFormat(
                          "MM/dd/yy"
                        )}
                      </td>
                      <td>{transaction.accountName}</td>
                      <td className="hidden md:table-cell">
                        {transaction.category}
                      </td>
                      <td>{transaction.description}</td>
                      <td className="hidden md:table-cell">
                        {transaction.thirdParty}
                      </td>
                      <td className="text-right">
                        {!transaction.amount.toString().includes(".")
                          ? transaction.amount.toString().concat(".00")
                          : transaction.amount}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
      </div>
      <div className='p-5'>
      <h2 className="pb-2 text-xl font-bold">Income vs Expenses</h2>
      <Bar data={chartData} />
        </div>
    </>
  );
};

Dashboard.getLayout = (page: ReactElement) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

Dashboard.auth = true;

export default Dashboard;
