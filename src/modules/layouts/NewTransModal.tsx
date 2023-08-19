import { DateTime } from 'luxon';
import React, { useCallback, useEffect, useReducer, useState } from "react";
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
  amount: number;
  category: string;
  description: string;
  payorPayee: string;
  date: string | undefined;
};

const NewTransModal = React.forwardRef<HTMLDialogElement, TransModalProps>(
  ({ accounts }, ref) => {
    const [posNeg, setPosNeg] = useState<"pos" | "neg" | null>();
    const [isValid, setIsValid] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [filteredCats, setFilteredCats] = useState<
      { name: string; id: number }[]
    >([]);
    const context = api.useContext();
    const { data: categories } = api.misc.getUserCategories.useQuery();
    const { data: thirdParties, isLoading: partiesLoading } =
      api.misc.getUserPayorPayees.useQuery();

    const newTransaction = api.transactions.insertTransaction.useMutation({
      onSuccess: () => {
        context.transactions.getRecentTransactions.invalidate();
        context.reports.getDashboardChartData.invalidate();
        context.accounts.getAllAccounts.invalidate();
      },
    });

    const initForm = {
      account: 0,
      amount: 0,
      category: "",
      description: "",
      payorPayee: "",
      date: "",
    };

    const reducer = (
      state: TransactionForm,
      action: { type: string; payload: any }
    ) => {
      switch (action.type) {
        case "setField": {
          return {
            ...state,
            [action.payload.field]: action.payload.value,
          };
        }
        case "reset": {
          setSubmitted(false);
          setIsValid(true);
          setPosNeg(null);
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
        !form.payorPayee
      ) {
        return false;
      }

      return true;
    }, [form.account, form.amount, form.category, form.date, form.payorPayee]);

    const submit = (e: any) => {
      e.preventDefault();
      setSubmitted(true);
      setIsValid(true);
      if (!formValid()) {
        return setIsValid(false);
      }
      
      const submitForm = {
        category: {
          name: form.category,
          categoryId: categories?.find(
            (category) =>
              category.name.toLowerCase() === form.category.toLowerCase()
          )?.id,
        },
        date: form.date ? DateTime.fromISO(form.date).toJSDate() : DateTime.now().toJSDate(),
        accountId: form.account,
        amount: posNeg === 'neg' ? form.amount * -1 : form.amount,
        thirdParty: form.payorPayee,
        description: form.description,
        isTransfer: false,
      };

      newTransaction.mutate(submitForm)
      dispatch({ type: 'reset', payload: null})
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
            <h3 className="text-xl font-bold">New Transaction</h3>
            <form name="newTransaction" onSubmit={submit} noValidate>
              <div className="flex w-full justify-between">
                <div className="form-control w-1/2">
                  <label className="label" htmlFor="account-select">
                    <span className="label-text">Account</span>
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
                        payload: { field: "account", value: parseInt(e.target.value) },
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
                <div className="form-control w-1/2 pl-3">
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
              </div>
              <div className="flex h-full w-full items-end justify-between">
                <div className="join">
                  <button
                    type="button"
                    className={`btn join-item btn-sm font-bold ${
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
                    +
                  </button>
                  <button
                    type="button"
                    className={`btn join-item btn-sm font-bold ${
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
                    &ndash;
                  </button>
                </div>
                <div className="form-control w-1/3">
                  <label className="label" htmlFor="amount">
                    <span className="label-text">Amount</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered input-sm ${submitted && !form.amount && 'input-error'}`}
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
                <div className="form-control">
                  <label className="label" htmlFor="category">
                    <span className="label-text">Category</span>
                  </label>
                  <input
                    type="text"
                    id="category"
                    list="categories"
                    className={`select select-bordered select-sm ${submitted && !form.category && 'select-error'}`}
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
              </div>

              <div className="form-control w-full md:w-1/2">
                <label className="label">
                  <span className="label-text">Payor/Payee</span>
                </label>
                <input
                  type="text"
                  className={`select select-bordered select-sm ${submitted && !form.payorPayee && 'select-error'}`}
                  list="payorPayees"
                  value={form.payorPayee}
                  onChange={(e) => dispatch({ type: 'setField', payload: { field: 'payorPayee', value: e.target.value}})}
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
                <button type="submit" className='btn btn-outline btn-sm border-accent text-accent hover:bg-secondary hover:border-secondary'>Add Another</button>
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

export default NewTransModal;
