import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GridPaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPrev: boolean;
  canNext: boolean;
  filteredRowCount: number;
  totalRows: number;
  setPageSize: (size: number) => void;
  setPageIndex: (index: number) => void;
  previousPage: () => void;
  nextPage: () => void;
}

const PAGE_SIZES = [25, 50, 100, 250, 500];

export const GridPagination = memo(function GridPagination({
  pageIndex,
  pageSize,
  pageCount,
  canPrev,
  canNext,
  filteredRowCount,
  totalRows,
  setPageSize,
  setPageIndex,
  previousPage,
  nextPage,
}: GridPaginationProps) {
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, filteredRowCount);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border-t bg-card text-sm flex-wrap">
      {/* Page size */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground text-nowrap">
          Rows per page{" "}
        </span>

        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            // Translate "all" back to undefined so TanStack knows to stop filtering
            setPageSize(Number(value));
          }}
        >
          <SelectTrigger
            className={cn(
              "w-full rounded border border-input bg-transparent px-2 outline-none focus:ring-1 focus:ring-ring/50 transition-colors ",
              "h-8 w-20 py-0",
            )}
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent align="centerTop">
            <SelectItem value="all">All</SelectItem>
            {[...PAGE_SIZES, totalRows].map((opt) => (
              <SelectItem key={opt.toString()} value={opt.toString()}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row info */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {from.toLocaleString()}-{to.toLocaleString()} of{" "}
        {filteredRowCount.toLocaleString()}
      </span>

      {/* Page nav */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPageIndex(0)}
          disabled={!canPrev}
          className="size-7"
        >
          <ChevronFirst className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={previousPage}
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
              if (p >= 0 && p < pageCount) setPageIndex(p);
            }}
            className="w-12 h-7 rounded border border-input bg-transparent px-1.5 text-xs text-center outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 tabular-nums"
          />
          <span className="text-xs text-muted-foreground">
            of {pageCount.toLocaleString()}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextPage}
          disabled={!canNext}
          className="size-7"
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={!canNext}
          className="size-7"
        >
          <ChevronLast className="size-3.5" />
        </Button>
      </div>
    </div>
  );
});
