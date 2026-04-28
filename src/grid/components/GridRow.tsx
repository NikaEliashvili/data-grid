import { memo } from "react";
import type {
  ColumnOrderState,
  Row,
  VisibilityState,
} from "@tanstack/react-table";
import type { StockRow, GridDensity } from "@/grid/types";
import { flexRender } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface GridRowProps {
  row: Row<StockRow>;
  density: GridDensity;
  isSelected: boolean;
  onRowClick?: (row: StockRow) => void;
  // 2. დაამატე ეს ორი პროპი memo-ს ქეშის გასატეხად
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
}

const DENSITY_CLASS: Record<GridDensity, string> = {
  compact: "h-7",
  normal: "h-9",
  comfortable: "h-12",
};

const DENSITY_CELL_CLASS: Record<GridDensity, string> = {
  compact: "py-0.5 px-2",
  normal: "py-1.5 px-2",
  comfortable: "py-2.5 px-2",
};

export const GridRow = memo(function GridRow({
  row,
  density,
  isSelected,
  onRowClick,
  // 3. მიიღე პროპები (არ არის სავალდებულო მათი სადმე ჩასმა JSX-ში)
  columnVisibility,
  columnOrder,
}: GridRowProps) {
  if (row.getIsGrouped()) {
    return (
      <tr
        key={`${columnVisibility}-${columnOrder}`}
        className={cn(
          "border-b border-border bg-muted/30 hover:bg-muted/50 transition-all",
          DENSITY_CLASS[density],
        )}
      >
        {row.getVisibleCells().map((cell) => {
          if (cell.getIsGrouped()) {
            return (
              <td
                key={cell.id}
                colSpan={row.getVisibleCells().length}
                className={cn(
                  "px-2 font-semibold text-sm",
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
              </td>
            );
          }
          return null;
        })}
      </tr>
    );
  }

  return (
    <tr
      className={cn(
        "border-b border-border transition-colors cursor-default",
        "hover:bg-accent/50",
        isSelected && "bg-primary/5 dark:bg-primary/10",
        DENSITY_CLASS[density],
      )}
      onClick={() => onRowClick?.(row.original)}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.id.endsWith("_select")) {
          return (
            <td
              key={cell.id}
              className={cn("px-2 sticky-col", DENSITY_CELL_CLASS[density])}
              style={{ width: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
                aria-label="Select row"
                className="size-3.5"
              />
            </td>
          );
        }

        if (cell.getIsAggregated()) {
          return (
            <td
              key={cell.id}
              className={cn(
                "text-xs text-muted-foreground",
                DENSITY_CELL_CLASS[density],
              )}
            >
              {flexRender(
                cell.column.columnDef.aggregatedCell ??
                  cell.column.columnDef.cell,
                cell.getContext(),
              )}
            </td>
          );
        }

        if (cell.getIsPlaceholder()) {
          return <td key={cell.id} />;
        }

        return (
          <td
            key={cell.id}
            className={cn(
              "text-sm border-r border-border/50 last:border-r-0 overflow-hidden",
              DENSITY_CELL_CLASS[density],
            )}
            style={{ maxWidth: cell.column.getSize() }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
});
