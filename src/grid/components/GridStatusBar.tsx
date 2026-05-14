import { memo, useMemo } from "react";
import type { Row } from "@tanstack/react-table";

// Note: If you are making this a generic library, calculating "price" should be passed
// as an external prop/function. For now, we assume TData has a price property.
interface GridStatusBarProps<TData> {
  selectedRows: Row<TData>[];
  filteredRows: Row<TData>[];
}

function GridStatusBarInner<TData>({
  selectedRows,
  filteredRows,
}: GridStatusBarProps<TData>) {
  // const selectedRows = table.getSelectedRowModel().rows;
  // const filteredRows = table.getFilteredRowModel().rows;

  const selectedCount = selectedRows.length;
  const activeRows = selectedCount > 0 ? selectedRows : filteredRows;
  const activeCount = activeRows.length;

  // MAGIC: Memoize the 100k loop!
  const { totalPrice, avgPrice } = useMemo(() => {
    if (activeCount === 0) return { totalPrice: 0, avgPrice: 0 };

    // Using 'any' cast here just to bypass TS for the dynamic price key,
    // ideally TData should extend { price: number }
    const total = activeRows.reduce(
      (sum, row) => sum + ((row.original as { price: number }).price || 0),
      0,
    );

    return {
      totalPrice: total,
      avgPrice: total / activeCount,
    };
  }, [activeRows, activeCount]);

  const items = [
    {
      label: selectedCount > 0 ? "Selected" : "Filtered",
      value: activeCount.toLocaleString(),
    },
    { label: "Avg Price", value: `$${avgPrice.toFixed(2)}` },
    {
      label: "Total",
      value: `$${totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    },
  ];

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span>{item.label}:</span>
          <span className="font-medium text-foreground tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
      <div className="flex-1" />
      <span className="opacity-50">DataGrid v1.0</span>
    </div>
  );
}

// Block useless re-renders
export const GridStatusBar = memo(
  GridStatusBarInner,
) as typeof GridStatusBarInner;
