"use client";
import { SessionProvider, getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import TopNav from "./TopNav";

const Layout: React.FC<{ children: any }> = ({ children }) => {
  const [checked, setChecked] = useState(false);
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

  return (
    <div className="drawer xl:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <TopNav setChecked={setChecked} />
        <main className="min-h-screen">{children}</main>
        <footer className="footer bg-secondary p-1 text-neutral-content">
          <h1 className="w-full justify-center font-bold">
            Copyright &copy; 2023
          </h1>
        </footer>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu h-full w-80 bg-base-200 p-4 text-base-content">
          {/* Sidebar content here */}
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Layout;
