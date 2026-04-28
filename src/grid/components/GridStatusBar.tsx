import type { Table } from "@tanstack/react-table"
import type { StockRow } from "@/grid/types"

interface GridStatusBarProps {
  table: Table<StockRow>
}

export function GridStatusBar({ table }: GridStatusBarProps) {
  const selected = table.getSelectedRowModel().rows
  const selectedCount = selected.length

  const totalPrice = selectedCount > 0
    ? selected.reduce((sum, row) => sum + row.original.price, 0)
    : table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.price, 0)

  const avgPrice = totalPrice / Math.max(1, selectedCount || table.getFilteredRowModel().rows.length)

  const items = [
    { label: selectedCount > 0 ? "Selected" : "Filtered", value: (selectedCount || table.getFilteredRowModel().rows.length).toLocaleString() },
    { label: "Avg Price", value: `$${avgPrice.toFixed(2)}` },
    { label: "Total", value: `$${totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  ]

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span>{item.label}:</span>
          <span className="font-medium text-foreground tabular-nums">{item.value}</span>
        </div>
      ))}
      <div className="flex-1" />
      <span className="opacity-50">DataGrid v1.0 — Step 1</span>
    </div>
  )
}
