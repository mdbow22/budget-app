import React, { useRef } from "react";

const NewTransModal = React.forwardRef<HTMLDialogElement, {}>((props, ref) => {

    //const newRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <dialog ref={ref} id="my_modal_3" className="modal">
        <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
            ✕
          </button>
          <h3 className="text-xl font-bold">New Transaction</h3>
          <p className="py-4">Press ESC key or click on ✕ button to close</p>
        </form>
        </div>
      </dialog>
    </>
  );
});

export default NewTransModal;
