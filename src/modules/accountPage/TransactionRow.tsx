import React, { useState } from "react";
import { DeleteTransaction } from "~/pages/accounts/[id]";
import { DateTime } from "luxon";
import { Transaction, PayorPayee, Category } from "@prisma/client";
import { Pencil, Save, X } from "../../../node_modules/lucide-react";

export type TransactionRow = {
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

const TransactionRow: React.FC<TransactionRow> = ({
  trans,
  setTransToDel,
  modalRef,
}) => {
  const [isEdit, setIsEdit] = useState<number>();

  const updateTransaction = (trans: any) => {
    console.log("SAVED");
    setIsEdit(undefined);
  };

  return (
    <tr className="hover" key={`trans-${trans.id}`}>
      <td>{DateTime.fromJSDate(trans.date).toFormat("MM/dd/yyyy")}</td>
      <td>{trans.Category?.name}</td>
      <td>{trans.description}</td>
      <td>{trans.PayorPayee?.thirdparty}</td>
      <td className="text-right">
        {!trans.amount.toString().includes(".")
          ? trans.amount.toString().concat(".00")
          : trans.amount}
      </td>
      <td className="text-right">
        {isEdit !== trans.id && (
          <div className="tooltip tooltip-accent" data-tip="Edit">
            <button onClick={() => setIsEdit(trans.id)}>
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
