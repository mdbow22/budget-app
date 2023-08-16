"use client";

import React, { useRef, useState } from "react";
import TopNav from "./TopNav";
import { api } from "~/utils/api";
import Link from "next/link";
import NewTransModal from "./NewTransModal";
import SideNav from './SideNav';

const Layout: React.FC<{ children: any }> = ({ children }) => {
  const [checked, setChecked] = useState(false);

//   const { data, isLoading } = api.accounts.getAllAccounts.useQuery({
//     includeBal: true,
//   });
  // if(status === 'loading') {
  //     return (
  //         <>
  //         Loading...
  //         </>
  //     )
  // }

  // if(status === 'unauthenticated') {

  //     router.push('/')

  //     return (<>Redirecting...</>)
  // }
  const newRef = useRef<HTMLDialogElement | null>(null);

  return (
    <div className="drawer xl:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <TopNav setChecked={setChecked} checked={checked} />
        <main className="min-h-screen">{children}</main>
        <NewTransModal ref={newRef} />
        <footer className="footer bg-secondary p-1 text-neutral-content">
          <h1 className="w-full justify-center font-bold">
            Copyright &copy; 2023
          </h1>
        </footer>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          className="drawer-overlay"
          onClick={() => setChecked((prev) => !prev)}
        ></label>
        {/* <ul className="menu menu-lg h-full w-72 bg-base-200 text-base-content">
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <details open>
              <summary>Accounts</summary>
              <ul>
                {!isLoading &&
                  data?.map((account) => {
                    return (
                      <li key={account.id}>
                        <Link
                          href={`/accounts/${account.id}`}
                          className="justify-between text-base"
                        >
                          <div>{account.name}</div>
                          <div>(${account.currBalance})</div>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </details>
          </li>
          <li>
            <a>Budgets</a>
          </li>
          <li>
            <a>Goals</a>
          </li>
          <li className="mt-auto w-full items-center">
            <a
              className="w-full grid-cols-1 text-center"
              onClick={() => newRef.current?.showModal()}
            >
              New Transaction
            </a>
          </li>
        </ul> */}
        <SideNav openModal={() => newRef.current?.showModal()} />
      </div>
    </div>
  );
};

export default Layout;
