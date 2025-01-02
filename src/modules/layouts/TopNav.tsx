//import { signOut } from "next-auth/react";
import { Decimal } from "@prisma/client/runtime/library";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/utils/functions";
import NewTransaction from "./NewTransaction";

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
  const [open, setOpen] = useState(false);

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
      <NewTransaction
        accounts={data?.map((d) => ({ id: d.id, name: d.name }))}
        triggerClassName="ml-auto rounded px-3 py-1 hover:bg-foreground/20"
      />
    </nav>
  );
};

export default TopNav;
