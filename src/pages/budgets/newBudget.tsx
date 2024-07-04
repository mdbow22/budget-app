import React, { BaseSyntheticEvent, useReducer, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import Head from "next/head";
import { DateTime } from "luxon";
import { api } from "~/utils/api";

interface FormState {
  name: string;
  categories: number[];
  max: string;
  reset: string;
  start: string;
}

const NewBudget: NextPageWithLayout = () => {
  const { data: categories } = api.misc.getUserCategories.useQuery(undefined, {
    select: (data) => {
      return data.filter((d) => d.type === "debit");
    },
  });

  const sendNewBudget = api.budgets.createBudget.useMutation();

  const initForm: FormState = {
    name: "",
    categories: [],
    max: "0",
    reset: "0",
    start: DateTime.now().toFormat("yyyy-MM-dd"),
  };

  const submit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    sendNewBudget.mutate(form);
  }

  const reducer = (
    state: FormState,
    action: { type: string; payload: { field: string; value: any } }
  ) => {
    switch (action.type) {
      case "setField": {
        return {
          ...state,
          [action.payload.field]: action.payload.value,
        };
      }
      case "categoryUpdate": {
        const newArray = typeof action.payload.value === 'number' && state.categories.includes(action.payload.value)
          ? state.categories.filter((c) => c !== action.payload.value)
          : [...state.categories, action.payload.value];
        return {
          ...state,
          categories: newArray,
        };
      }
      default: {
        return state;
      }
    }
  };

  const [form, dispatch] = useReducer(reducer, initForm);

  return (
    <>
      <Head>
        <title>Create New Budget</title>
      </Head>
      <div className="w-full p-5">
        <h1 className="text-2xl font-bold">New Budget</h1>
        <form noValidate onSubmit={(e) => submit(e)}>
          <div className="grid grid-cols-2 gap-2 w-1/2">
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="label-text">Name of Budget</span>
              </label>
              <input
                id="name"
                type="text"
                className={`input input-bordered input-sm`}
                value={form.name}
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "name", value: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="label-text">
                  Time Period to Cover**
                </span>
              </label>
              <select
                value={form.reset}
                className="select select-bordered select-sm"
                onChange={(e) => dispatch({ type: 'setField', payload: { field: 'reset', value: e.target.value }})}
              >
                <option disabled value={0}>
                  Select a frequency...
                </option>
                <option value={"weekly"}>Weekly</option>
                <option value={"monthly"}>Monthly</option>
                <option value={"quarterly"}>Quarterly</option>
                <option value={"biannually"}>Biannually</option>
                <option value={"annually"}>Annually</option>
              </select>
            </div>
            <div className="form-control md:w-1/3">
              <label className="label" htmlFor="amount">
                <span className="label-text">Dollar Limit</span>
              </label>
              <input
                type="test"
                inputMode="decimal"
                className={`input input-bordered input-sm`}
                value={form.max}
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "max", value: e.target.value },
                  })
                }
                pattern="\d+\.?(\d{1,2})?"
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="categories">
              <span className="label-text">Categories to Track*</span>
            </label>
            <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-5">
              {categories?.map((c) => (
                  <button
                    key={c.id}
                    className={`btn ${
                      form.categories?.includes(c.id)
                        ? "btn-primary"
                        : "btn-outline"
                    } md:btn-sm`}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "categoryUpdate",
                        payload: { field: "categories", value: c.id },
                      })
                    }
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
          <div className="w-full my-3">
            <button type="submit" className="btn btn-primary">Create Budget</button>
          </div>
          <div className="mt-3 text-sm clear-both">
            *Choosing multiple will result in the budget tracking the cumulative
            spend of all selected categories. Create multiple budgets to track
            categories separately.
          </div>
          <div className="mt-3 text-sm">
            **This is when your spend will reset to 0, e.g., you want to track
            how much you&apos;re spending on clothing each month or how much you
            spend on hobbies every quarter.
          </div>
        </form>
      </div>
    </>
  );
};

NewBudget.getLayout = (page: React.ReactNode) => {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

NewBudget.auth = true;

export default NewBudget;
