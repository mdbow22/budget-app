import React, { useState } from "react";
import {
  PieChart,
  Home,
  List,
  Settings,
} from "../../../node_modules/lucide-react";
import type { Decimal } from "@prisma/client/runtime/library";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatCurrency } from "~/utils/functions";
import NewTransaction from "./NewTransaction";

export interface BottomNavProps {
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
}

const BottomNav: React.FC<BottomNavProps> = ({ data }) => {
  const router = useRouter();
  const [showAccounts, setShowAccounts] = useState(false);

  const linkClick = (route?: string) => {
    setShowAccounts(false);
    if (route) {
      router.push(route).catch((err) => console.error('redirect failed: ', err));
    }
  };

  return (
    <>
      <section
        className={`fixed bottom-0 left-0 mb-16 w-full bg-muted p-2 pt-3 lg:hidden ${
          showAccounts ? "h-auto opacity-100" : "h-0 opacity-0"
        } text-foreground transition-all duration-200`}
      >
        <ul className="flex flex-col gap-3">
          <li className="flex justify-between px-1">
            <button
              type="button"
              className="rounded-lg border border-foreground/20 px-2 py-1"
            >
              Create Account
            </button>
            <NewTransaction
              accounts={data?.map((d) => ({ id: d.id, name: d.name }))}
              triggerClassName="rounded-lg border border-foreground/20 px-2 py-1"
            />
          </li>

          {data?.map((account) => {
            return (
              <li className="px-2" key={account.id}>
                <Link
                  href={`/accounts/${account.id}`}
                  className="flex justify-between"
                  onClick={() => {
                    linkClick();
                  }}
                >
                  <h3 className="text-xl font-bold ">{account.name}</h3>
                  <span className="text-lg font-bold">
                    {formatCurrency(account.currBalance)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <nav className="fixed bottom-0 left-0 grid h-16 w-full grid-cols-4 justify-around bg-muted p-3 text-accent lg:hidden">
        <button
          className="flex justify-center"
          onClick={() => {
            linkClick("/dashboard");
          }}
        >
          <Home size={36} />
        </button>
        {/* <Separator orientation='vertical' className='bg-foreground' /> */}
        <button className={`flex justify-center`}>
          <PieChart size={36} />
        </button>
        {/* <Separator orientation='vertical' className='bg-foreground' /> */}
        <button
          className={`flex justify-center ${showAccounts && "text-foreground"}`}
          onClick={() => setShowAccounts((prev) => !prev)}
        >
          <List size={36} />
        </button>
        {/* <Separator orientation='vertical' className='bg-foreground' /> */}
        <button className="flex justify-center">
          <Settings size={36} />
        </button>
      </nav>
    </>
  );
};

export default BottomNav;
