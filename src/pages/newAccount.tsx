import React, { useReducer, useState } from "react";
import type { NextPageWithLayout } from "./_app";
import Layout from "~/modules/layouts/Layout";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";

export type AccountState = {
  name: string;
  type: string;
  startBal: number;
};

const NewAccount: NextPageWithLayout = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const demoData = api.accounts.createDemoData.useMutation({
    onSuccess: async () => {
      await router.push("/dashboard");
    },
  });
  const options = [
    {
      name: "Checking",
      value: "checking",
    },
    {
      name: "Credit Card",
      value: "credit",
    },
    {
      name: "Savings",
      value: "savings",
    },
  ];
  const initAccountState = {
    name: "",
    type: "na",
    startBal: 0,
  };

  const reducer = (
    state: AccountState,
    action: { type: string; payload: string }
  ) => {
    if (action.type.length) {
      return {
        ...state,
        [action.type]: action.payload,
      };
    }

    return state;
  };

  const [form, dispatch] = useReducer(reducer, initAccountState);

  return (
    <div className="p-5">
      <h1 className=" text-3xl font-bold text-accent">Create New Account</h1>
      <ul className="mt-5 sm:w-full lg:w-1/2">
        <li>
          <Label>
            <h2 className="text-xl font-bold">What kind of account is it?</h2>
          </Label>
          <div>
            <Select
              onValueChange={(e) => dispatch({ type: "type", payload: e })}
              value={form.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select one..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => {
                  return (
                    <SelectItem value={option.value} key={option.value}>
                      {option.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </li>
        <li className='mt-3'>
          <Label className="pb-2">
            <h2 className="text-xl font-bold">Account Name <span className="font-normal text-sm">(20 character max)</span></h2>
          </Label>
          <div className="flex w-full gap-3">
            <Input
              type="text"
              onChange={(e) =>
                dispatch({ type: "name", payload: e.target.value })
              }
              value={form.name}
              maxLength={20}
            />
          </div>
        </li>
        <li className='mt-3'>
          <Label>
            <h2 className="text-xl font-bold">Starting Balance</h2>
          </Label>
          <Input
            type="number"
            value={form.startBal}
            onChange={(e) =>
              dispatch({ type: "startBal", payload: e.target.value })
            }
          />
          <div>*</div>
        </li>
      </ul>
      <section className="mt-10">
        <h3 className="text-lg font-bold mb-2">
          Just want to see how the app works?
        </h3>
        <Button className="bg-accent"
          onClick={() =>
            session?.user?.id ? demoData.mutate({ id: session?.user.id }) : null
          }
        >
          Create Demo Data
        </Button>
      </section>
    </div>
  );
};

NewAccount.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

NewAccount.auth = true;

export default NewAccount;
