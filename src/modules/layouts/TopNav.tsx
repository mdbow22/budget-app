//import { signOut } from "next-auth/react";
import React from "react";

const TopNav: React.FC<{
    checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ checked, setChecked }) => {
  return (
    <nav className="hidden lg:flex xl:flex h-14 w-full items-center justify-between bg-base-200 px-4 shadow shadow-zinc-600/30 lg:hidden">
      <h2 className="text-xl font-bold text-primary">Brand Name Here</h2>
      <div className="flex h-full items-center">
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
      </div>
    </nav>
  );
};

export default TopNav;
