import { useCallback, useState } from "react"
import type { Column } from "@tanstack/react-table"
import type { GridColumnMeta, StockRow } from "@/grid/types"
import { cn } from "@/lib/utils"

interface ColumnFilterCellProps {
  column: Column<StockRow>
  density: "compact" | "normal" | "comfortable"
}

export function ColumnFilterCell({ column, density }: ColumnFilterCellProps) {
  const meta = column.columnDef.meta as GridColumnMeta<StockRow> | undefined
  const filterValue = column.getFilterValue()
  const [rangeMin, setRangeMin] = useState<string>("")
  const [rangeMax, setRangeMax] = useState<string>("")

  const inputH = density === "compact" ? "h-6 text-xs" : density === "comfortable" ? "h-9" : "h-7 text-xs"

  const handleText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      column.setFilterValue(e.target.value || undefined)
    },
    [column]
  )

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      column.setFilterValue(e.target.value || undefined)
    },
    [column]
  )

  const handleRangeMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setRangeMin(val)
      const max = rangeMax
      column.setFilterValue([val === "" ? "" : Number(val), max === "" ? "" : Number(max)] as [number | "", number | ""])
    },
    [column, rangeMax]
  )

  const handleRangeMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setRangeMax(val)
      column.setFilterValue([rangeMin === "" ? "" : Number(rangeMin), val === "" ? "" : Number(val)] as [number | "", number | ""])
    },
    [column, rangeMin]
  )

  if (!meta?.filterable) {
    return <div className={cn("w-full", inputH)} />
  }

  if (meta.filterType === "select" && meta.filterOptions?.length) {
    return (
      <div className="w-full px-1">
        <select
          value={(filterValue as string) ?? ""}
          onChange={handleSelect}
          className={cn(
            "w-full rounded border border-input bg-transparent px-1.5 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors",
            inputH
          )}
        >
          <option value="">All</option>
          {meta.filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (meta.filterType === "range") {
    return (
      <div className="flex gap-0.5 px-1 w-full">
        <input
          type="number"
          placeholder="Min"
          value={rangeMin}
          onChange={handleRangeMin}
          className={cn(
            "w-1/2 rounded border border-input bg-transparent px-1 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors min-w-0",
            inputH
          )}
        />
        <input
          type="number"
          placeholder="Max"
          value={rangeMax}
          onChange={handleRangeMax}
          className={cn(
            "w-1/2 rounded border border-input bg-transparent px-1 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors min-w-0",
            inputH
          )}
        />
      </div>
    )
  }

  return (
    <div className="w-full px-1">
      <input
        type="text"
        placeholder="Filter..."
        value={(filterValue as string) ?? ""}
        onChange={handleText}
        className={cn(
          "w-full rounded border border-input bg-transparent px-1.5 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors",
          inputH
        )}
      />
    </div>
  )
}
