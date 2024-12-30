import React, { useState } from "react";
import type { DeleteTransaction } from "~/pages/accounts/[id]";
import type { Transaction, PayorPayee, Category } from "@prisma/client";
import { Pencil, Save, X } from "../../../node_modules/lucide-react";
import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/functions";
import { TableCell, TableRow } from "~/components/ui/table";
import { DateTime } from "luxon";

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

const TransactionRowNew: React.FC<TransactionRowProps> = ({
  trans,
  setTransToDel,
  modalRef,
  noedit,
}) => {
  return (
    <TableRow>
      <TableCell>
        {DateTime.fromJSDate(trans.date).toFormat("MM/dd/yy")}
      </TableCell>
      <TableCell>{trans.Category?.name}</TableCell>
      <TableCell className="hidden md:table-cell">{trans.description}</TableCell>
      <TableCell>{trans.PayorPayee?.thirdparty}</TableCell>
      <TableCell>{formatCurrency(trans.amount)}</TableCell>
      <TableCell>
        {!noedit && setTransToDel && modalRef && (
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
        )}
      </TableCell>
    </TableRow>
  );
};

export default TransactionRowNew;
