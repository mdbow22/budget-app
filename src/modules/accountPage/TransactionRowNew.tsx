import React, { useReducer, useState } from "react";
import type { DeleteTransaction } from "~/pages/accounts/[id]";
import type { Transaction, PayorPayee, Category } from "@prisma/client";
import {
  CalendarIcon,
  Loader2,
  Pencil,
  Save,
  X,
} from "../../../node_modules/lucide-react";
import { formatCurrency } from "~/utils/functions";
import { TableCell, TableRow } from "~/components/ui/table";
import { DateTime } from "luxon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/utils/api";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";

export type TransactionRowProps = {
  trans: Omit<Transaction, "amount"> & {
    amount: number;
    PayorPayee: PayorPayee | null;
    Category: Category | null;
  };
  handleModalOpen: (trans: DeleteTransaction) => void;
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
  handleModalOpen,
  noedit,
}) => {
  const [editMode, setEditMode] = useState(false);
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
      await queryContext.charts.getAccountLineChart.invalidate();
      setEditMode(false);
      setLoading(false);
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
    setLoading(true);
    if (
      editedTrans.amount === 0 ||
      !editedTrans.amount ||
      !editedTrans.date ||
      !editedTrans.description
    ) {
      return;
    }

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
    <TableRow>
      <TableCell>
        {editMode ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="mr-2 flex w-full justify-start"
              >
                <CalendarIcon className="h-4 w-4" />
                {editedTrans.date &&
                  DateTime.fromJSDate(editedTrans.date).toFormat("MM/dd/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={editedTrans.date ?? undefined}
                onSelect={(e) =>
                  dispatch({
                    type: "setField",
                    payload: {
                      field: "date",
                      value: e
                        ? DateTime.fromJSDate(e).toFormat("yyyy-MM-dd")
                        : undefined,
                    },
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : (
          DateTime.fromJSDate(trans.date).toFormat("MM/dd/yy")
        )}
      </TableCell>
      <TableCell>{trans.Category?.name}</TableCell>
      <TableCell className="hidden md:table-cell">
        {editMode ? (
          <Input
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
      </TableCell>
      <TableCell>{trans.PayorPayee?.thirdparty}</TableCell>
      <TableCell className="w-28 text-right ">
        {editMode ? (
          <Input
            type="text"
            inputMode="decimal"
            className="w-full"
            value={editedTrans.amount}
            onChange={(e) =>
              dispatch({
                type: "setField",
                payload: { field: "amount", value: e.target.value },
              })
            }
          />
        ) : (
          formatCurrency(trans.amount)
        )}
      </TableCell>
      <TableCell>
        {!editMode && (
          <button
            onClick={() => {
              setEditMode(true);
              dispatch({ type: "initialize", payload: null });
            }}
          >
            <Pencil size={18} />
          </button>
        )}
        {editMode && (
          <button onClick={() => updateTransaction()}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
          </button>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  const transToDel = {
                    id: trans.id,
                    amount: trans.amount,
                    payorPayee: trans.PayorPayee?.thirdparty,
                    date: DateTime.fromJSDate(trans.date).toFormat(
                      "MM/dd/yyyy"
                    ),
                    isTransfer: trans.isTransfer,
                  };
                  handleModalOpen(transToDel);
                }}
                className="pl-3"
              >
                <X size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
};

export default TransactionRowNew;
