//import { signOut } from "next-auth/react";
import { Decimal } from "@prisma/client/runtime/library";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/utils/functions";

const TopNav: React.FC<{
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
}> = ({ data }) => {
  return (
    <nav className="hidden h-14 w-full items-center bg-muted px-4 py-2 shadow shadow-zinc-400/30 lg:flex">
      <h2 className="text-2xl font-bold text-accent">Balanced Budget</h2>
      <Separator orientation="vertical" className="mx-4 bg-foreground" />
      <div className="flex items-center justify-start gap-8">
        <div className="rounded px-3 py-1 text-lg font-bold text-foreground hover:bg-foreground/20">
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded px-3 py-1 text-lg font-bold text-foreground hover:bg-foreground/20">
            Accounts
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-0">
            {data?.map((account) => {
              return (
                <DropdownMenuLabel
                  key={account.id}
                  className=" text-md hover:bg-foreground/20"
                >
                  <Link href={`/accounts/${account.id}`}>
                    <div>{account.name}</div>
                    <div>{formatCurrency(account.currBalance)}</div>
                  </Link>
                </DropdownMenuLabel>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="rounded px-3 py-1 text-lg font-bold text-foreground hover:bg-foreground/20">
          Reports
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded px-3 py-1 text-lg font-bold text-foreground hover:bg-foreground/20">
            Settings
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-0">
            <DropdownMenuLabel className="text-md hover:bg-foreground/20">
              <a
                className="cursor-pointer"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </a>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <button
        type="button"
        className="ml-auto rounded px-3 py-1 hover:bg-foreground/20"
      >
        New Transaction
      </button>
      {/* <div className="flex h-full items-center">
        <label
          className="btn btn-ghost drawer-button btn-sm rounded-full h-12"
          htmlFor="my-drawer"
          onClick={() => setChecked((prev) => !prev)}
        >
          {checked ?
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        
          :
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>}
        </label>
      </div> */}
    </nav>
  );
};

export default TopNav;
