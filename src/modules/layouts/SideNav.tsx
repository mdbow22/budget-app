import type { Decimal } from "@prisma/client/runtime/library";
import Link from "next/link";
import React from "react";

export type SideNavProps = {
  openModal: () => void;
  isLoading: boolean;
  data:
    | {
        currBalance: number;
        id: number;
        name: string;
        userId: string;
        type: string;
        initBalance: Decimal;
        createdDate: Date;
        expireDate: Date | null;
      }[]
    | undefined;
};

const SideNav: React.FC<SideNavProps> = ({ openModal, data, isLoading }) => {

  const balance = (rawBal: number) => {
    if (rawBal === 0) {
      return "$0.00";
    }

    const stringBal = Math.floor(Math.abs(rawBal)).toString();
    console.log(stringBal);
    const reversedBal = stringBal.includes(".")
      ? stringBal
          .substring(
            0,
            rawBal
              .toString()
              .split("")
              .findIndex((d) => d === ".") ?? rawBal.toString().length
          )
          .split("")
          .reverse()
      : stringBal.split("").reverse();
    const negative = rawBal < 0;
    const cents = rawBal.toString().includes(".")
      ? rawBal.toString().substring(
          rawBal
            .toString()
            .split("")
            .findIndex((e) => e === ".")
        )
      : ".00";

    const formattedBal = reversedBal
      .map((digit, index) => {
        if ((index + 1) % 3 === 0 && reversedBal.length > 3) {
          return `,${digit}`;
        }
        return digit;
      })
      .reverse()
      .join("");

    return negative ? `($${formattedBal}${cents})` : `$${formattedBal}${cents}`;
  };

  return (
    <ul className="menu menu-lg h-full w-72 bg-base-300 text-base-content">
      <li className="hidden px-6 py-2 text-xl font-bold text-primary lg:grid">
        Balanced Budget
      </li>
      <li>
        <Link href="/dashboard">Dashboard</Link>
      </li>
      <li>
        <details open>
          <summary className='flex justify-between'>
            <div>Accounts</div><div>{!isLoading && data && balance(Math.round(data?.reduce((curr, prev) => curr + prev.currBalance, 0) * 1000) / 1000)}</div>
          </summary>
          <ul>
            {!isLoading &&
              data
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((account) => {
                  return (
                    <li key={account.id}>
                      <Link
                        href={`/accounts/${account.id}`}
                        className="justify-between text-base"
                      >
                        <div>{account.name}</div>
                        <div>{balance(account.currBalance)}</div>
                      </Link>
                    </li>
                  );
                })}
            <li>
              <Link href={`/newAccount`} className="text-base">
                + Add New Account
              </Link>
            </li>
          </ul>
        </details>
      </li>
      <li>
        <Link href={'/reports'}>
          Reports
        </Link>
      </li>
      <li>
        <details>
          <summary className="flex justify-between">
            Budgets
          </summary>
        </details>
        <ul>
          {/* replace once budgets are made */}
          {true && (
            <>
              <li title="Restaurant Spending">
                <Link href="/budgets/id" className="justify-between text-base">
                  Restaurant Spending
                </Link>
              </li>
            </>
          )}
          <li>
            <Link href={'/budgets/newBudget'} className="text-base">
              + Add New Budget
            </Link>
          </li>
        </ul>
      </li>
      <li>
        <a>Goals</a>
      </li>
      <li className="mt-auto w-full items-center">
        <a
          className="w-full grid-cols-1 text-center"
          onClick={() => openModal()}
        >
          New Transaction
        </a>
      </li>
    </ul>
  );
};

export default SideNav;
