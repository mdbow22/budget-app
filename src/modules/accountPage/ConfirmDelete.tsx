import type { DeleteTransaction } from "~/pages/accounts/[id]";
import { X } from "../../../node_modules/lucide-react";
import React from "react";
import { Dialog, DialogClose, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { formatCurrency } from "~/utils/functions";

export type ConfirmDeleteProps = {
  close: () => void;
  trans: DeleteTransaction | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  close,
  trans,
  open,
  setOpen,
}) => {
  const deleteTrans = (
    e: React.SyntheticEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    close();
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <DialogContent>
        <h2 className="text-lg font-bold">
          Are you sure you want to delete this transaction?
        </h2>
        <div>
          Paid To/From:{" "}
          {trans?.payorPayee
            ? trans.payorPayee
            : trans?.isTransfer
            ? "Transfer"
            : "N/A"}
          , Date: {trans?.date}, Amount: {trans && formatCurrency(trans.amount)}
        </div>
        <DialogClose asChild>
          <Button
            type="button"
            variant="destructive"
            onClick={(e) => {
              deleteTrans(e);
              setOpen(false);
            }}
          >
            DELETE
          </Button>
        </DialogClose>
      </DialogContent>
      {/* <dialog
          ref={ref}
          id="confirm-delete-modal"
          className="modal modal-bottom md:modal-middle"
        >
            <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
                <X size={20} />
              </button>
            </form>
            <div className='flex flex-col justify-center items-center gap-5'>
                <h2 className='text-lg font-bold'>Are you sure you want to delete this transaction?</h2>
                <div>Paid To/From: {trans?.payorPayee ?? trans?.isTransfer ? 'Transfer' : 'NA'}, Date: {trans?.date}, Amount: {trans?.amount}</div>
            <button type='button' className='btn btn-error' onClick={(e) => deleteTrans(e)}>
                DELETE
            </button>
            </div>
          </div>
        </dialog> */}
    </Dialog>
  );
};

ConfirmDelete.displayName = "ConfirmDelete";

export default ConfirmDelete;
