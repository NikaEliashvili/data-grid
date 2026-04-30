import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface GridPaginationProps<TData> {
  table: Table<TData>;
  totalRows: number;
}

const PAGE_SIZES = [25, 50, 100, 250, 500];

export function GridPagination<TData>({
  table,
  totalRows,
}: GridPaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();
  const from = pageIndex * pageSize + 1;
  const to = Math.min(
    (pageIndex + 1) * pageSize,
    table.getFilteredRowModel().rows.length,
  );
  const total = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border-t bg-card text-sm flex-wrap">
      {/* Page size */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="h-7 rounded border border-input bg-transparent px-2 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
        >
          {[...PAGE_SIZES, totalRows].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Row info */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {from.toLocaleString()}–{to.toLocaleString()} of{" "}
        {total.toLocaleString()}
      </span>

      {/* Page nav */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrev}
          className="size-7"
        >
          <ChevronFirst className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!canPrev}
          className="size-7"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        <div className="flex items-center gap-1.5 px-2">
          <span className="text-xs text-muted-foreground">Page</span>
          <input
            type="number"
            min={1}
            max={pageCount}
            value={pageIndex + 1}
            onChange={(e) => {
              const p = Number(e.target.value) - 1;
              if (p >= 0 && p < pageCount) table.setPageIndex(p);
            }}
            className="w-12 h-7 rounded border border-input bg-transparent px-1.5 text-xs text-center outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 tabular-nums"
          />
          <span className="text-xs text-muted-foreground">
            of {pageCount.toLocaleString()}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!canNext}
          className="size-7"
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNext}
          className="size-7"
        >
          <ChevronLast className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
