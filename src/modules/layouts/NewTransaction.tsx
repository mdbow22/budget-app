import { DateTime } from "luxon";
import {
  ArrowLeftRight,
  CalendarIcon,
  Minus,
  Plus,
} from "../../../node_modules/lucide-react";
import React, { useCallback, useReducer, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

type TransactionForm = {
  account: string;
  amount: string;
  category: string;
  description: string;
  payorPayee: string;
  date: string | undefined;
  account2?: string;
};

export type TransModalProps = {
  accounts:
    | {
        id: number;
        name: string;
      }[]
    | undefined;
  triggerClassName?: string;
};

const NewTransaction: React.FC<TransModalProps> = ({ accounts }) => {
  const [posNeg, setPosNeg] = useState<"pos" | "neg" | "trans">("neg");
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [filteredCats, setFilteredCats] =
    useState<{ name: string; id: number }[]>();
  const context = api.useContext();
  const { data: categories } = api.misc.getUserCategories.useQuery();
  const { data: thirdParties } =
    api.misc.getUserPayorPayees.useQuery();

  if (categories && !filteredCats) {
    setFilteredCats(
      categories ? categories.filter((cats) => cats.type === "debit") : []
    );
  }

  const newTransaction = api.transactions.insertTransaction.useMutation({
    onSuccess: async () => {
      await context.transactions.getRecentTransactions.invalidate();
      await context.charts.getDashboardChartData.invalidate();
      await context.charts.getDashboardLineChartData.invalidate();
      await context.accounts.getAllAccounts.invalidate();
      await context.transactions.getAccountTransactions.invalidate()
    },
  });

  const initForm = {
    account: "",
    amount: "",
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
    const decRegex = /[^a-zA-Z\\:;\s]+/;

    if (
      !form.account ||
      !form.amount ||
      (form.amount && !decRegex.test(form.amount)) ||
      !form.category ||
      !form.date ||
      (!form.payorPayee && posNeg !== "trans")
    ) {
      return false;
    }

    return true;
  }, [
    form.account,
    form.amount,
    form.category,
    form.date,
    form.payorPayee,
    posNeg,
  ]);

  const submit = (addAnother: boolean) => {
    //return console.log(e.nativeEvent.submitter?.name === 'add-another')
    console.log(addAnother);
    setSubmitted(true);
    const valid = formValid();
    if (!valid) {
      return;
    }

    const submitForm = {
      category: {
        name: form.category,
        categoryId: categories?.find((category) => {
          const type =
            posNeg === "pos" ? "credit" : posNeg === "neg" ? "debit" : "trans";
          return (
            category.name.toLowerCase() === form.category.toLowerCase() &&
            category.type === type
          );
        })?.id,
      },
      date: form.date
        ? DateTime.fromISO(form.date).toJSDate()
        : DateTime.now().toJSDate(),
      accountId: parseInt(form.account),
      accountId2: form.account2?.length ? parseInt(form.account2) : undefined,
      amount:
        posNeg !== "pos" && form.amount ? +form.amount * -1 : +form.amount,
      thirdParty: posNeg === "trans" ? "Account Transfer" : form.payorPayee,
      description: form.description,
      isTransfer: posNeg === "trans",
    };

    newTransaction.mutate(submitForm);
    dispatch({ type: "reset", payload: null });
    if (!addAnother) {
      setOpen(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        dispatch({ type: "reset", payload: null });
        setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="ml-auto rounded px-3 py-1 hover:bg-foreground/20"
        >
          New Transaction
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <form name="newTransaction" noValidate className="w-full py-3">
          <div className="flex w-full items-stretch rounded-lg bg-muted">
            <button
              type="button"
              className={`flex w-1/3 justify-center rounded-l-lg border-r border-foreground/40 p-3 hover:bg-foreground hover:text-muted ${
                posNeg === "pos" && "bg-foreground text-muted"
              }`}
              onClick={() => {
                setPosNeg("pos");
                const filtered = categories
                  ? categories.filter((cats) => cats.type === "credit")
                  : [];
                setFilteredCats(filtered);
              }}
            >
              <Plus />
            </button>
            <button
              type="button"
              className={`flex w-1/3 justify-center border-r border-foreground/40 p-3 hover:bg-foreground hover:text-muted ${
                posNeg === "neg" && "bg-foreground text-muted"
              }`}
              onClick={() => {
                setPosNeg("neg");
                const filtered = categories
                  ? categories.filter((cats) => cats.type === "debit")
                  : [];
                setFilteredCats(filtered);
              }}
            >
              <Minus />
            </button>
            <button
              type="button"
              className={`flex w-1/3 justify-center rounded-r-lg p-3 hover:bg-foreground hover:text-muted ${
                posNeg === "trans" && "bg-foreground text-muted"
              }`}
              onClick={() => {
                setPosNeg("trans");
                const filtered = categories
                  ? categories.filter((cats) => cats.type === "trans")
                  : [];
                setFilteredCats(filtered);
              }}
            >
              <ArrowLeftRight />
            </button>
          </div>
          <div className="mt-3 flex w-full gap-3">
            <div className={`w-full ${submitted && !form.account && 'text-destructive'}`}>
              <Label>{posNeg === "trans" ? "From" : "Account"}</Label>
              <Select
                onValueChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "account", value: e },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    ?.sort((a, b) => a.name.localeCompare(b.name))
                    .map((account) => {
                      return (
                        <SelectItem value={account.id.toString()} key={account.id}>
                          {account.name}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            {posNeg === "trans" && (
              <div className={`w-full ${submitted && !form.account2 && 'text-destructive'}`}>
                <Label>To</Label>
                <Select
                  onValueChange={(e) =>
                    dispatch({
                      type: "setField",
                      payload: { field: "account2", value: e },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      ?.sort((a, b) => a.name.localeCompare(b.name))
                      .map((account) => {
                        return (
                          <SelectItem value={account.id.toString()} key={account.id}>
                            {account.name}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="mt-3 flex w-full gap-3">
            <div className={`w-full ${submitted && !form.date && 'text-destructive'}`}>
              <Label>Date</Label>
              <div className="w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mr-2 flex w-full justify-start"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {form.date &&
                        DateTime.fromISO(form.date).toFormat("MM/dd/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        form.date
                          ? DateTime.fromISO(form.date).toJSDate()
                          : undefined
                      }
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
              </div>
            </div>
            <div className={`w-full ${submitted && !form.amount && 'text-destructive'}`}>
              <Label className="">Amount</Label>
              <Input
                type="text"
                inputMode="decimal"
                pattern="\d+\.?(\d{1,2})?"
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "amount", value: e.target.value },
                  })
                }
                value={form.amount}
              />
            </div>
          </div>
          <div className="mt-3 flex w-full gap-3">
            <div className={`w-full ${submitted && !form.category && 'text-destructive'}`}>
              <Label>Category</Label>
              <Input
                type="text"
                id="category"
                list={
                  posNeg === "pos"
                    ? "posCategories"
                    : posNeg === "trans"
                    ? "transCategories"
                    : "categories"
                }
                value={form.category}
                onChange={(e) =>
                  dispatch({
                    type: "setField",
                    payload: { field: "category", value: e.target.value },
                  })
                }
              />
              <datalist id="categories">
                {categories
                  ?.filter((category) => category.type === "debit")
                  ?.map((cat) => {
                    return <option value={cat.name} key={`cat-${cat.id}`} />;
                  })}
              </datalist>
              <datalist id="posCategories">
                {categories
                  ?.filter((category) => category.type === "credit")
                  ?.map((category) => {
                    return <option value={category.name} key={category.id} />;
                  })}
              </datalist>
              <datalist id="transCategories">
                {categories
                  ?.filter((category) => category.type === "trans")
                  ?.map((category) => {
                    return <option value={category.name} key={category.id} />;
                  })}
              </datalist>
            </div>
            {posNeg !== "trans" && (
              <div className={`w-full ${submitted && !form.payorPayee && 'text-destructive'}`}>
                <Label>Payor/Payee</Label>
                <Input
                  type="text"
                  list="thirdParties"
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      payload: { field: "payorPayee", value: e.target.value },
                    })
                  }
                  value={form.payorPayee}
                />
                <datalist id="thirdParties">
                    {
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
            )}
          </div>
          <div className="mt-3">
            <Label>Description</Label>
            <Input
              type="text"
              value={form.description}
              onChange={(e) =>
                dispatch({
                  type: "setField",
                  payload: { field: "description", value: e.target.value },
                })
              }
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="hover:bg-muted"
            onClick={() => submit(true)}
          >
            Add Another
          </Button>

          <Button type="button" onClick={() => submit(false)}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransaction;
