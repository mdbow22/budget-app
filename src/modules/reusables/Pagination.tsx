import React from "react";
import { ChevronLeft, ChevronRight } from "../../../node_modules/lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

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

    if (totalPages < 4) {
      return arr;
    }

    if (currentPage < 3) {
      return arr.filter((p) => p < 3);
    }

    if (currentPage >= totalPages - 3) {
      return arr.splice(-3);
    }

    if (currentPage >= 3) {
      return arr.filter(
        (p) =>
          (p >= currentPage && p < currentPage + 2) ||
          (p <= currentPage && p > currentPage - 2)
      );
    }

    return [];
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        className="flex items-center px-2 py-1"
        onClick={() => currentPage !== 0 ? setPage((prev) => prev - 1) : null}
      ><ChevronLeft size={18} /> Prev
      </button>

      {paginateArr().map((p) => {
        return (
          <button
            type="button"
            className={`px-2 py-1 ${p === currentPage && 'border border-foreground rounded-lg'}`}
            key={p}
            onClick={() => setPage(p)}
            disabled={p === currentPage}
          >
            {p + 1}
          </button>
        );
      })}
      {currentPage < totalPages - 3 && (<>... 
        <button type="button" onClick={() => setPage(totalPages - 1)} className="px-2 py-1">
          {totalPages}
        </button>
        </>
      )}
      <button
        type="button"
        className="flex items-center"
        onClick={() => currentPage !== totalPages - 1 ? setPage((prev) => ++prev) : null}
      >
        Next <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
