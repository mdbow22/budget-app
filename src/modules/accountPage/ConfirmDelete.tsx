import { TransactionRow } from '~/pages/accounts/[id]';
import { X } from '../../../node_modules/lucide-react';
import React from "react";

export type ConfirmDeleteProps = {
  close: () => void;
  trans: TransactionRow | undefined;
};

const ConfirmDelete = React.forwardRef<HTMLDialogElement, ConfirmDeleteProps>(
  ({ close, trans }, ref) => {
    return (
      <>
        <dialog
          ref={ref}
          id="confirm-delete-modal"
          className="modal modal-bottom md:modal-middle"
          onClose={() => close()}
        >
            <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
                <X size={20} />
              </button>
            </form>
            <div className='flex flex-col justify-center items-center gap-5'>
                <h2 className='text-lg font-bold'>Are you sir you want to delete this transaction?</h2>
                <div>Paid To/From: {trans?.payorPayee ?? trans?.isTransfer ? 'Transfer' : 'NA'}, Date: {trans?.date}, Amount: {trans?.amount}</div>
            <button className='btn btn-error' onClick={() => close()}>
                DELETE
            </button>
            </div>
          </div>
        </dialog>
      </>
    );
  }
);

ConfirmDelete.displayName = "ConfirmDelete";

export default ConfirmDelete;
