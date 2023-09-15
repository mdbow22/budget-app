import { DateTime } from "luxon";
import React, { useCallback, useReducer, useState } from "react";
import { api } from "~/utils/api";

export type TransModalProps = {
  accounts:
    | {
        id: number;
        name: string;
      }[]
    | undefined;
};

type TransactionForm = {
  account: number;
  amount: number | undefined;
  category: string;
  description: string;
  payorPayee: string;
  date: string | undefined;
  account2?: number;
};

const NewTransModal = React.forwardRef<HTMLDialogElement, TransModalProps>(
  ({ accounts }, ref) => {
    const [posNeg, setPosNeg] = useState<"pos" | "neg" | "trans">("neg");
    const [submitted, setSubmitted] = useState(false);
    const [filteredCats, setFilteredCats] = useState<
      { name: string; id: number }[]
    >([]);
    const context = api.useContext();
    const { data: categories } = api.misc.getUserCategories.useQuery();
    const { data: thirdParties, isLoading: partiesLoading } =
      api.misc.getUserPayorPayees.useQuery();

    const newTransaction = api.transactions.insertTransaction.useMutation({
      onSuccess: async () => {
        await context.transactions.getRecentTransactions.invalidate();
        await context.reports.getDashboardChartData.invalidate();
        await context.accounts.getAllAccounts.invalidate();
      },
    });

    const initForm = {
      account: 0,
      amount: undefined,
      category: "",
      description: "",
      payorPayee: "",
      date: "",
      account2: undefined,
    };

    const reducer = (
      state: TransactionForm,
      action: {
        type: string;
        payload: { field: string; value: string | number | undefined } | null;
      }
    ) => {
      switch (action.type) {
        case "setField": {
          if (action.payload?.field) {
            return {
              ...state,
              [action.payload.field]: action.payload?.value,
            };
          }

          return state;
        }
        case "reset": {
          setSubmitted(false);
          setPosNeg("neg");
          return initForm;
        }
        default: {
          return state;
        }
      }
    };

    const [form, dispatch] = useReducer(reducer, initForm);

    const formValid = useCallback(() => {
      if (
        !form.account ||
        !form.amount ||
        !form.category ||
        !form.date ||
        (!form.payorPayee && posNeg !== 'trans')
      ) {
        return false;
      }

      return true;
    }, [form.account, form.amount, form.category, form.date, form.payorPayee, posNeg]);

    const submit = (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      setSubmitted(true);
      if (!formValid()) {
        return;
      }

      const submitForm = {
        category: {
          name: form.category,
          categoryId: categories?.find(
            (category) =>
              category.name.toLowerCase() === form.category.toLowerCase()
          )?.id,
        },
        date: form.date
          ? DateTime.fromISO(form.date).toJSDate()
          : DateTime.now().toJSDate(),
        accountId: form.account,
        accountId2: form.account2,
        amount: posNeg !== 'pos' && form.amount ? form.amount * -1 : form.amount ? form.amount : 0,
        thirdParty: posNeg === 'trans' ? 'Account Transfer' : form.payorPayee,
        description: form.description,
        isTransfer: posNeg === 'trans',
      };

      newTransaction.mutate(submitForm);
      dispatch({ type: "reset", payload: null });
    };

    // useEffect(() => {
    //   if(submitted) {
    //     setIsValid(formValid())
    //   }
    // }, [setIsValid, formValid])

    return (
      <>
        <dialog
          ref={ref}
          id="my_modal_3"
          className="modal modal-bottom md:modal-middle"
          onClose={() => dispatch({ type: "reset", payload: null })}
        >
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="pb-3 text-xl font-bold">New Transaction</h3>
            <form
              name="newTransaction"
              onSubmit={submit}
              noValidate
              className="w-full"
            >
              <div className="join flex w-full">
                <button
                  type="button"
                  className={`btn join-item btn-sm h-10 w-1/3 font-bold ${
                    posNeg === "pos" && "bg-secondary"
                  }`}
                  onClick={() => {
                    setPosNeg("pos");
                    setFilteredCats(
                      categories
                        ? categories.filter((cats) => cats.type === "credit")
                        : []
                    );
                  }}
                >
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
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`btn join-item btn-sm h-10 w-1/3 font-bold ${
                    posNeg === "neg" && "bg-secondary"
                  }`}
                  onClick={() => {
                    setPosNeg("neg");
                    setFilteredCats(
                      categories
                        ? categories.filter((cats) => cats.type === "debit")
                        : []
                    );
                  }}
                >
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
                      d="M19.5 12h-15"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`btn join-item btn-sm h-10 w-1/3 font-bold ${
                    posNeg === "trans" && "bg-secondary"
                  }`}
                  onClick={() => {
                    setPosNeg("trans");
                    setFilteredCats(
                      categories
                        ? categories.filter((cats) => cats.type === "debit")
                        : []
                    );
                  }}
                >
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
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full md:flex md:flex-shrink md:justify-between md:gap-5">
                <div className="form-control w-full">
                  <label className="label" htmlFor="account-select">
                    <span className="label-text">
                      {posNeg === "trans" ? "From" : "Account"}
                    </span>
                  </label>
                  <select
                    id="account-select"
                    defaultValue={0}
                    className={`select select-bordered select-sm ${
                      submitted && !form.account && "select-error"
                    }`}
                    value={
                      accounts?.find((account) => account.id === form.account)
                        ?.id ?? 0
                    }
                    onChange={(e) =>
                      dispatch({
                        type: "setField",
                        payload: {
                          field: "account",
                          value: parseInt(e.target.value),
                        },
                      })
                    }
                  >
                    <option disabled value={0}>
                      Select an account...
                    </option>
                    {accounts?.sort((a, b) => a.name.localeCompare(b.name)).map((account) => {
                      return (
                        <option value={account?.id} key={account?.id}>
                          {account.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {posNeg === "trans" && (
                  <div className="form-control w-full">
                    <label className="label" htmlFor="account-select">
                      <span className="label-text">To</span>
                    </label>
                    <select
                      id="account-select"
                      defaultValue={0}
                      className={`select select-bordered select-sm ${
                        submitted && !form.account && "select-error"
                      }`}
                      value={
                        accounts?.find((account) => account.id === form.account2)
                          ?.id ?? 0
                      }
                      onChange={(e) =>
                        dispatch({
                          type: "setField",
                          payload: {
                            field: "account2",
                            value: parseInt(e.target.value),
                          },
                        })
                      }
                    >
                      <option disabled value={0}>
                        Select an account...
                      </option>
                      {accounts?.map((account) => {
                        return (
                          <option value={account?.id} key={account?.id}>
                            {account.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
              <div className="w-full md:flex md:flex-shrink md:justify-between md:gap-5">
                <div className="form-control w-full md:w-1/2">
                  <label className="label" htmlFor="date">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    className={`input input-bordered input-sm ${
                      submitted && !form.date && "input-error"
                    }`}
                    value={form.date}
                    onChange={(e) =>
                      dispatch({
                        type: "setField",
                        payload: { field: "date", value: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-control md:w-1/2">
                  <label className="label" htmlFor="amount">
                    <span className="label-text">Amount</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered input-sm ${
                      submitted && !form.amount && "input-error"
                    }`}
                    value={form.amount}
                    onChange={(e) =>
                      dispatch({
                        type: "setField",
                        payload: { field: "amount", value: +e.target.value },
                      })
                    }
                    min={0}
                  />
                </div>
              </div>
              <div className="w-full md:flex md:flex-shrink md:justify-between md:gap-5">
                <div className="form-control w-full">
                  <label className="label" htmlFor="category">
                    <span className="label-text">Category</span>
                  </label>
                  <input
                    type="text"
                    id="category"
                    list="categories"
                    className={`select select-bordered select-sm ${
                      submitted && !form.category && "select-error"
                    }`}
                    value={form.category}
                    onChange={(e) =>
                      dispatch({
                        type: "setField",
                        payload: { field: "category", value: e.target.value },
                      })
                    }
                  />
                  <datalist id="categories">
                    {filteredCats.map((cat) => {
                      return <option value={cat.name} key={`cat-${cat.id}`} />;
                    })}
                    {/* <option value={"Hobbies"} />
                    <option value={"Entertainment"} /> */}
                  </datalist>
                </div>
                {posNeg !== 'trans' && <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Payor/Payee</span>
                  </label>
                  <input
                    type="text"
                    className={`select select-bordered select-sm ${
                      submitted && !form.payorPayee && "select-error"
                    }`}
                    list="payorPayees"
                    value={form.payorPayee}
                    onChange={(e) =>
                      dispatch({
                        type: "setField",
                        payload: { field: "payorPayee", value: e.target.value },
                      })
                    }
                  />
                  <datalist id="payorPayees">
                    {!partiesLoading &&
                      thirdParties?.map((party) => {
                        return (
                          <option
                            value={party.thirdparty}
                            key={`party-${party.id}`}
                          />
                        );
                      })}
                  </datalist>
                </div>}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      payload: { field: "description", value: e.target.value },
                    })
                  }
                  value={form.description}
                />
              </div>
              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-outline btn-sm border-accent text-accent hover:border-secondary hover:bg-secondary"
                >
                  Add Another
                </button>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Add
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </>
    );
  }
);

NewTransModal.displayName = "NewTransModal";

export default NewTransModal;
