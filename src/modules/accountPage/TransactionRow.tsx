import React, { useReducer, useState } from "react";
import { DeleteTransaction } from "~/pages/accounts/[id]";
import { DateTime } from "luxon";
import { Transaction, PayorPayee, Category } from "@prisma/client";
import { Pencil, Save, X } from "../../../node_modules/lucide-react";

export type TransactionRowProps = {
  trans: Omit<Transaction, "amount"> & {
    amount: number;
    PayorPayee: PayorPayee | null;
    Category: Category | null;
  };
  setTransToDel: React.Dispatch<
    React.SetStateAction<DeleteTransaction | undefined>
  >;
  modalRef: React.RefObject<HTMLDialogElement>;
};

export type EditTransFormType = {
  date: Date;
  category: string | undefined;
  description: string | null;
  thirdParty: string | undefined;
  amount: number;
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  trans,
  setTransToDel,
  modalRef,
}) => {
  const [isEdit, setIsEdit] = useState<number>();

  const updateTransaction = (trans: TransactionRowProps["trans"]) => {
    console.log("SAVED");
    setIsEdit(undefined);
  };

  const initFormState = {
    amount: trans.amount,
    thirdParty: trans.PayorPayee?.thirdparty,
    category: trans.Category?.name,
    date: trans.date,
    description: trans.description,
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
        let state = initFormState;
        return state;
      }
      case "setField": {
        if (!action.payload) {
          return state;
        }
        return {
          ...state,
          [action.payload?.field]:
            action.payload.field === "date"
              ? DateTime.fromISO(action.payload.field).toJSDate()
              : action.payload.value,
        };
      }
      default:
        return state;
    }
  };

  const [editedTrans, dispatch] = useReducer(reducer, initFormState);

  return (
    <tr className="hover" key={`trans-${trans.id}`}>
      <td>
        {!!isEdit ? (
          <input
            type="date"
            id="date"
            className={`input input-bordered input-xs`}
            value={DateTime.fromJSDate(editedTrans.date).toFormat("yyyy-MM-dd")}
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
        ) : (
          trans.PayorPayee?.thirdparty
        )}
      </td>
      <td className="text-right">
        {!!isEdit ? (
          <input
            type="test"
            inputMode="decimal"
            className={`input input-bordered input-xs`}
            value={editedTrans.amount}
            onChange={(e) =>
              dispatch({
                type: "setField",
                payload: { field: "amount", value: e.target.value },
              })
            }
            pattern="\d+\.?(\d{1,2})?"
          />
        ) : !trans.amount.toString().includes(".") ? (
          trans.amount.toString().concat(".00")
        ) : (
          trans.amount
        )}
      </td>
      <td className="text-right">
        {isEdit !== trans.id && (
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
            <button onClick={() => updateTransaction(trans)}>
              <Save size={18} />
            </button>
          </div>
        )}
        <div className="tooltip tooltip-accent" data-tip="Delete">
          <button
            onClick={() => {
              setTransToDel({
                id: trans.id,
                amount: trans.amount,
                payorPayee: trans.PayorPayee?.thirdparty,
                date: DateTime.fromJSDate(trans.date).toFormat("MM/dd/yyyy"),
                isTransfer: trans.isTransfer,
              });
              modalRef.current?.showModal();
            }}
            className="pl-3"
          >
            <X size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;
