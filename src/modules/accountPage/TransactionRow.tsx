import React, { useReducer, useState } from "react";
import type { DeleteTransaction } from "~/pages/accounts/[id]";
import { DateTime } from "luxon";
import type { Transaction, PayorPayee, Category } from "@prisma/client";
import { Pencil, Save, X } from "../../../node_modules/lucide-react";
import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/functions";

export type TransactionRowProps = {
  trans: Omit<Transaction, "amount"> & {
    amount: number;
    PayorPayee: PayorPayee | null;
    Category: Category | null;
  };
  setTransToDel?: React.Dispatch<
    React.SetStateAction<DeleteTransaction | undefined>
  >;
  modalRef?: React.RefObject<HTMLDialogElement>;
  noedit?: boolean;
};

export type EditTransFormType = {
  amount: number;
  thirdParty: string | undefined;
  category: string | undefined;
  date: Date | null;
  description: string | null;
  id: number;
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  trans,
  setTransToDel,
  modalRef,
  noedit,
}) => {
  const [isEdit, setIsEdit] = useState<number>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryContext = api.useContext();
  const { data: categories } = api.misc.getUserCategories.useQuery();
  const { data: thirdParties, isLoading: partiesLoading } =
    api.misc.getUserPayorPayees.useQuery();
  const updateMutation = api.transactions.editTransaction.useMutation({
    onSuccess: async () => {
      await queryContext.transactions.getAccountTransactions.invalidate();
      await queryContext.accounts.getAllAccounts.invalidate();
      setLoading(false);
      setIsEdit(undefined);
    },
  });

  const initFormState = {
    amount: trans.amount,
    thirdParty: trans.PayorPayee?.thirdparty,
    category: trans.Category?.name,
    date: trans.date,
    description: trans.description,
    id: trans.id,
  };

  const reducer = (
    state: EditTransFormType,
    action: {
      type: string;
      payload: { field: string; value: string | number | undefined } | null;
    }
  ) => {
    switch (action.type) {
      case "initialize": {
        const state = initFormState;
        return state;
      }
      case "setField": {
        if (!action.payload) {
          return state;
        }
        return {
          ...state,
          [action.payload?.field]:
            action.payload.field === "date" && action.payload.value
              ? DateTime.fromISO(action.payload.value as string).toJSDate()
              : action.payload.value,
        };
      }
      default:
        return state;
    }
  };

  const [editedTrans, dispatch] = useReducer(reducer, initFormState);

  const updateTransaction = () => {
    setSubmitted(true);
    if (
      editedTrans.amount === 0 ||
      !editedTrans.amount ||
      !editedTrans.date ||
      !editedTrans.description
    ) {
      return;
    }

    setLoading(true);

    const submitForm = {
      id: editedTrans.id,
      amount: +editedTrans.amount,
      description: editedTrans.description ?? "",
      date: editedTrans.date,
      category: {
        id: categories?.find(
          (category) =>
            category.name.toLowerCase() === editedTrans.category?.toLowerCase()
        )?.id,
        name: editedTrans.category,
      },
      payorPayee: {
        thirdParty: editedTrans.thirdParty,
        id: thirdParties?.find(
          (thirdParty) =>
            thirdParty.thirdparty.toLowerCase() ===
            editedTrans.thirdParty?.toLowerCase()
        )?.id,
      },
    };

    updateMutation.mutate(submitForm);
  };

  return (
    <tr className="hover" key={`trans-${trans.id}`}>
      {loading ? (
        <td colSpan={6} className="border text-center">
          <div className="loading loading-dots loading-sm text-center"></div>
        </td>
      ) : (
        <>
          <td>
            {!!isEdit ? (
              <input
                type="date"
                id="date"
                className={`input input-bordered input-xs ${
                  submitted && !editedTrans.date ? "input-error" : ""
                }`}
                value={
                  editedTrans.date
                    ? DateTime.fromJSDate(editedTrans.date).toFormat(
                        "yyyy-MM-dd"
                      )
                    : undefined
                }
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "date", value: e.target.value },
                  })
                }
              />
            ) : (
              DateTime.fromJSDate(trans.date).toFormat("MM/dd/yyyy")
            )}
          </td>
          <td>
            {!!isEdit ? (
              <>
                <input
                  type="text"
                  id="category"
                  list="categories"
                  className={`select select-bordered select-xs`}
                  value={editedTrans.category}
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      payload: { field: "category", value: e.target.value },
                    })
                  }
                />
                <datalist id="categories">
                  {categories
                    ?.filter((cat) =>
                      editedTrans.amount > 0
                        ? cat.type === "credit"
                        : cat.type === "debit"
                    )
                    .map((cat) => {
                      return <option value={cat.name} key={`cat-${cat.id}`} />;
                    })}
                </datalist>
              </>
            ) : (
              trans.Category?.name
            )}
          </td>
          <td>
            {!!isEdit ? (
              <input
                type="text"
                id="description"
                className={`input input-bordered input-xs`}
                value={editedTrans.description ?? undefined}
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "description", value: e.target.value },
                  })
                }
              />
            ) : (
              trans.description
            )}
          </td>
          <td>
            {!!isEdit ? (
              <>
                <input
                  type="text"
                  id="payorPayee"
                  list="thirdParties"
                  className={`select select-bordered select-xs`}
                  value={editedTrans.thirdParty}
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      payload: { field: "thirdParty", value: e.target.value },
                    })
                  }
                />
                <datalist id="thirdParties">
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
              </>
            ) : (
              trans.PayorPayee?.thirdparty
            )}
          </td>
          <td className="text-right">
            {!!isEdit ? (
              <input
                type="test"
                inputMode="decimal"
                className={`input input-bordered input-xs ${
                  submitted && (editedTrans.amount === 0 || !editedTrans.amount)
                    ? "input-error"
                    : ""
                } ${loading && "loading loading-dots"}`}
                value={editedTrans.amount}
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "amount", value: e.target.value },
                  })
                }
                pattern="\d+\.?(\d{1,2})?"
              />
            ) : 
              formatCurrency(trans.amount)
            }
          </td>
          <td className="text-right">
            {isEdit !== trans.id && !noedit && (
              <div className="tooltip tooltip-accent" data-tip="Edit">
                <button
                  onClick={() => {
                    setIsEdit(trans.id);
                    dispatch({ type: "initialize", payload: null });
                  }}
                >
                  <Pencil size={18} />
                </button>
              </div>
            )}
            {isEdit === trans.id && (
              <div className="tooltip tooltip-accent" data-tip="Save">
                <button onClick={() => updateTransaction()}>
                  <Save size={18} />
                </button>
              </div>
            )}
            {!noedit && setTransToDel && modalRef && (
              <div className="tooltip tooltip-accent" data-tip="Delete">
                <button
                  onClick={() => {
                    setTransToDel({
                      id: trans.id,
                      amount: trans.amount,
                      payorPayee: trans.PayorPayee?.thirdparty,
                      date: DateTime.fromJSDate(trans.date).toFormat(
                        "MM/dd/yyyy"
                      ),
                      isTransfer: trans.isTransfer,
                    });
                    modalRef.current?.showModal();
                  }}
                  className="pl-3"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </td>
        </>
      )}
    </tr>
  );
};

export default TransactionRow;
