import React, { useRef, useState } from "react";
import TopNav from "./TopNav";
import NewTransModal from "./NewTransModal";
import SideNav from "./SideNav";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import BottomNav from "./BottomNav";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const newRef = useRef<HTMLDialogElement | null>(null);
  const { data, isLoading, isSuccess } = api.accounts.getAllAccounts.useQuery();

  if (!data && !isLoading && isSuccess) {
    return router.push("/newAccount");
  }

  return (
    <>
      <TopNav data={data} isLoading={isLoading} />
      <main className="min-h-screen max-w-7xl mx-auto">{children}</main>
      <NewTransModal
        ref={newRef}
        accounts={data?.map((account) => ({
          id: account.id,
          name: account.name,
        }))}
      />
      <footer className="footer bg-secondary p-1 text-neutral-content mb-16">
        <h1 className="w-full justify-center font-bold">
          Copyright &copy; 2023
        </h1>
      </footer>
      <BottomNav isLoading={isLoading} data={data} />
    </>
  );
};

export default Layout;
