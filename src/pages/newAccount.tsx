import React, { useReducer, useState } from "react";
import type { NextPageWithLayout } from "./_app";
import Layout from "~/modules/layouts/Layout";

export type AccountState = {
  name: string;
  type: string;
  startBal: number;
};

const NewAccount: NextPageWithLayout = () => {
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
  const [step, setStep] = useState(1);
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
      <h1 className="text-2xl font-bold">Let&apos;s make a new account!</h1>
      <ul className="steps steps-vertical mt-10">
        <li className={`step ${step >= 1 && "step-primary"} justify-start`}>
          <div className="form-control">
            <label className="label">
              <h2 className="text-xl font-bold text-primary">
                What do you want to call the account?
              </h2>
            </label>
            <div className="flex w-full gap-3">
              <input
                type="text"
                className="input input-bordered input-sm"
                onChange={(e) =>
                  dispatch({ type: "name", payload: e.target.value })
                }
                value={form.name}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm border"
                onClick={() => setStep(2)}
                disabled={!form.name?.length || step !== 1}
              >
                Next
              </button>
            </div>
          </div>
        </li>
        <li
          className={`step ${
            step >= 2 ? "step-primary text-primary" : "text-base-300"
          }`}
        >
          <div className="form-control">
            <label className="label">
              <h2 className="text-xl font-bold">What kind of account is it?</h2>
            </label>
            <div className="flex w-full gap-3">
              <select
                id="account-type"
                className={`select select-bordered select-sm text-black`}
                onChange={(e) =>
                  dispatch({ type: "type", payload: e.target.value })
                }
                disabled={step !== 2}
                value={form.type}
              >
                <option disabled value={"na"}>
                  Select one...
                </option>
                {options.map((option) => {
                  return (
                    <option value={option.value} key={option.value}>
                      {option.name}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                className="btn btn-primary btn-sm border"
                onClick={() => setStep(3)}
                disabled={step !== 2}
              >
                Next
              </button>
            </div>
          </div>
        </li>
        <li
          className={`step ${
            step >= 3 ? "step-primary text-primary" : "text-base-300"
          }`}
        >
          <div className="form-control">
            <label className="label">
              <h2 className="text-xl font-bold">
                What&apos;s the starting balance?
              </h2>
            </label>
            <input
            className="input input-bordered input-sm"
              type="number"
              value={form.startBal}
              onChange={(e) =>
                dispatch({ type: "startBal", payload: e.target.value })
              }
            />
          </div>
        </li>
      </ul>
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
