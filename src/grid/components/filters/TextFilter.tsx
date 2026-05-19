import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { useDebounce } from "@/grid/hooks/useDebounce";

export function TextFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  const tableValue = column.getFilterValue() as string | undefined;

  const [value, setValue] = useState(tableValue ?? "");

  // 1. Track the previous table value to avoid useEffect cascading renders
  const [prevTableValue, setPrevTableValue] = useState(tableValue);

  // 2. React-recommended "Derived State" update during render
  if (tableValue !== prevTableValue) {
    setPrevTableValue(tableValue);
    if (tableValue === undefined) {
      setValue(""); // Clear local state if table filters are cleared externally
    }
  }

  const debouncedValue = useDebounce(value, 500);

  // Push to table (This is fine in useEffect because it updates an external store, not local state)
  useEffect(() => {
    if (debouncedValue !== (tableValue ?? "")) {
      column.setFilterValue(debouncedValue || undefined);
    }
  }, [debouncedValue, column, tableValue]);

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Filter..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          "w-full rounded border border-input bg-transparent px-1.5 outline-none focus:border-ring focus:ring-1 focus:ring-ring/50",
          densityH,
        )}
      />
    </div>
  );
}
