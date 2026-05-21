import { useState, useEffect } from "react";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/grid/hooks/useDebounce";

export function RangeFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  const tableValue = column.getFilterValue() as [string, string] | undefined;

  const [min, setMin] = useState(tableValue?.[0] ?? "");
  const [max, setMax] = useState(tableValue?.[1] ?? "");

  // Fix: Track previous prop value during render
  const [prevTableValue, setPrevTableValue] = useState(tableValue);

  if (tableValue !== prevTableValue) {
    setPrevTableValue(tableValue);
    if (tableValue === undefined) {
      setMin("");
      setMax("");
    }
  }

  const debouncedMin = useDebounce(min, 500);
  const debouncedMax = useDebounce(max, 500);

  useEffect(() => {
    const currentMin = tableValue?.[0] ?? "";
    const currentMax = tableValue?.[1] ?? "";

    if (debouncedMin !== currentMin || debouncedMax !== currentMax) {
      column.setFilterValue([debouncedMin, debouncedMax]);
    }
  }, [debouncedMin, debouncedMax, column, tableValue]);

  return (
    <div className="flex gap-0.5 w-full">
      <input
        type="number"
        placeholder="Min"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        className={cn(
          "w-1/2 rounded border border-input bg-transparent px-1 outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors min-w-0 placeholder:text-muted-foreground",
          densityH,
        )}
      />
      <input
        type="number"
        placeholder="Max"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        className={cn(
          "w-1/2 rounded border border-input bg-transparent px-1 outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors min-w-0 placeholder:text-muted-foreground",
          densityH,
        )}
      />
    </div>
  );
}
