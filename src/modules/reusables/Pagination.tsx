import React from "react";

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  setPage,
}) => {
  const paginateArr = () => {
    const arr = [];
    for (let i = 0; i < totalPages; i++) {
      arr.push(i);
    }

    if (totalPages < 6) {
      return arr;
    }

    if (currentPage < 3) {
      return arr.filter((p) => p < 5);
    }

    if (currentPage >= totalPages - 5) {
      return arr.splice(-5);
    }

    if (currentPage >= 3) {
      return arr.filter(
        (p) =>
          (p >= currentPage && p < currentPage + 3) ||
          (p <= currentPage && p > currentPage - 3)
      );
    }

    return [];
  };

  return (
    <div className="join">
      <button
        type="button"
        className="btn join-item"
        onClick={() => setPage(0)}
      >
        {"<<"}
      </button>
      <button
        type="button"
        className="btn join-item"
        onClick={() => setPage((prev) => prev - 1)}
      >
        {"<"}
      </button>
      {paginateArr().map((p) => {
        return (
          <button
            type="button"
            className="btn join-item"
            key={p}
            onClick={() => setPage(p)}
            disabled={p === currentPage}
          >
            {p + 1}
          </button>
        );
      })}
      {currentPage < totalPages - 3 && (
        <>
          <button type="button" className="btn join-item pointer-events-none">
            &hellip;
          </button>
          <button
            type="button"
            className="btn join-item"
            onClick={() => setPage(totalPages - 1)}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        type="button"
        className="btn join-item"
        onClick={() => setPage((prev) => ++prev)}
      >
        {">"}
      </button>
      <button
        type="button"
        className="btn join-item"
        onClick={() => setPage(totalPages - 1)}
      >
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;
