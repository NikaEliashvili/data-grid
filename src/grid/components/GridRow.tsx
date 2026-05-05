import type {
  ColumnOrderState,
  Row,
  VisibilityState,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { GridDensity } from "@/grid/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface GridRowProps<TData> {
  row: Row<TData>;
  density: GridDensity;
  isSelected: boolean;
  onRowClick?: (row: TData) => void;
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
  style?: React.CSSProperties; // Needed for Virtualizer Absolute Positioning
}

const DENSITY_CLASS: Record<GridDensity, string> = {
  compact: "h-9",
  normal: "h-12",
  comfortable: "h-14",
};

const DENSITY_CELL_CLASS: Record<GridDensity, string> = {
  compact: "py-1 px-2",
  normal: "py-2 px-2",
  comfortable: "py-3 px-2",
};

export function GridRow<TData>({
  row,
  density,
  isSelected,
  onRowClick,
  style,
}: GridRowProps<TData>) {
  if (row.getIsGrouped()) {
    return (
      <div
        role="row"
        style={style}
        key={`${row.index}`}
        className={cn(
          "flex items-center w-full border-b border-border bg-muted/30 hover:bg-muted/50 transition-all",
          DENSITY_CLASS[density],
        )}
      >
        {row.getVisibleCells().map((cell) => {
          if (cell.getIsGrouped()) {
            return (
              <div
                key={cell.id}
                role="cell"
                className={cn(
                  "flex-1 px-2 font-semibold text-sm flex items-center",
                  DENSITY_CELL_CLASS[density],
                )}
              >
                <button
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  onClick={row.getToggleExpandedHandler()}
                >
                  <ChevronRight
                    className={cn(
                      "size-4 transition-transform",
                      row.getIsExpanded() && "rotate-90",
                    )}
                  />
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  <span className="text-muted-foreground font-normal text-xs ml-1">
                    ({row.subRows.length})
                  </span>
                </button>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div
      role="row"
      key={`${row.index}`}
      style={style}
      className={cn(
        "flex w-full border-b border-border transition-colors cursor-default items-center",
        "hover:bg-accent/50",
        isSelected && "bg-primary/5 dark:bg-primary/10",
        DENSITY_CLASS[density],
      )}
      onClick={() => onRowClick?.(row.original)}
    >
      {row.getVisibleCells().map((cell) => {
        const isSelectColumn =
          cell.column.id === "select" || cell.id.endsWith("_select");

        if (isSelectColumn) {
          return (
            <div
              key={cell.id}
              role="cell"
              className={cn(
                "flex items-center justify-center shrink-0 px-2 sticky left-0 ",
                DENSITY_CELL_CLASS[density],
              )}
              style={{ width: 40, flexBasis: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
                aria-label="Select row"
                className="size-3.5 rounded"
              />
            </div>
          );
        }

        if (cell.getIsPlaceholder()) {
          return <div key={cell.id} role="cell" />;
        }

        return (
          <div
            key={cell.id}
            role="cell"
            className={cn(
              "flex items-center text-sm border-r border-border/50 last:border-r-0 overflow-hidden shrink-0",
              DENSITY_CELL_CLASS[density],
            )}
            style={{
              width: cell.column.getSize(),
              flexBasis: cell.column.getSize(),
            }}
          >
            {cell.getIsAggregated()
              ? flexRender(
                  cell.column.columnDef.aggregatedCell ??
                    cell.column.columnDef.cell,
                  cell.getContext(),
                )
              : flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        );
      })}
    </div>
  );
}
