import { signOut } from "next-auth/react";
import React from "react";

const TopNav: React.FC<{
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setChecked }) => {
  return (
    <nav className="flex h-10 w-full items-center justify-between bg-base-200 px-4 shadow shadow-zinc-600/30 lg:hidden">
      <h2 className="text-xl font-bold text-primary">Brand Name Here</h2>
      <div className="flex h-full items-center">
        <label
          className="btn btn-sm btn-primary drawer-button rounded-full"
          htmlFor="my-drawer"
          onClick={() => setChecked((prev) => !prev)}
        >
        X
        </label>
      </div>
    </nav>
  );
};

export default TopNav;
