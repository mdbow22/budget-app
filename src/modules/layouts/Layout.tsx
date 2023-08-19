import React, { useRef, useState } from "react";
import TopNav from "./TopNav";
import NewTransModal from "./NewTransModal";
import SideNav from './SideNav';
import { api } from '~/utils/api';

const Layout: React.FC<{ children: any }> = ({ children }) => {
  const [checked, setChecked] = useState(false);

  const newRef = useRef<HTMLDialogElement | null>(null);
  const { data, isLoading } = api.accounts.getAllAccounts.useQuery({includeBal: false});

  return (
    <div className="drawer xl:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <TopNav setChecked={setChecked} checked={checked} />
        <main className="min-h-screen">{children}</main>
        <NewTransModal ref={newRef} accounts={data?.map(account => ({ id: account.id, name: account.name }))} />
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
        <SideNav openModal={() => newRef.current?.showModal()} isLoading={isLoading} data={data} />
      </div>
    </div>
  );
};

export default Layout;
