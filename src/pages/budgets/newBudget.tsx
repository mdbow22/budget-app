import React, { useReducer, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "~/modules/layouts/Layout";
import Head from "next/head";
import { DateTime } from "luxon";
import { api } from "~/utils/api";

interface FormState {
  name: string;
  categories: number[];
  max: number | string | null;
  reset: string;
  start: string;
}

const NewBudget: NextPageWithLayout = () => {
  const { data: categories } = api.misc.getUserCategories.useQuery(undefined, {
    select: (data) => {
        return data.filter(d => d.type === 'debit')
    }
  });

  const initForm: FormState = {
    name: "",
    categories: [],
    max: null,
    reset: "",
    start: DateTime.now().toFormat("yyy-MM-dd"),
  };

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
        const newArray = state.categories.includes(action.payload.value)
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
      <div className="w-full max-w-7xl p-5">
        <h1 className="text-2xl font-bold">Create New Budget</h1>
        <form noValidate>
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
            <label className="label" htmlFor="categories">
              <span className="label-text">Categories to Track</span>
            </label>
            <div className="flex w-full flex-col justify-around px-5 md:flex-row md:flex-wrap">
              {categories &&
                categories.map((c) => (
                  <button
                    className={`btn ${
                      form.categories?.includes(c.id)
                        ? "btn-primary"
                        : "btn-outline"
                    } my-2 md:btn-sm md:w-[23%]`}
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
