import { useCallback } from "react";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { cn } from "@/lib/utils";

export function RangeFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  // Read directly from the table state, treating them as strings
  const filterValue = column.getFilterValue() as [string, string] | undefined;
  const min = filterValue?.[0] ?? "";
  const max = filterValue?.[1] ?? "";

  const handleRangeMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Use the functional update pattern so we don't need 'max' in the dependency array
      column.setFilterValue((old: [string, string] | undefined) => [
        val,
        old?.[1] ?? "",
      ]);
    },
    [column], // Perfectly stable dependencies!
  );

  const handleRangeMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Use the functional update pattern so we don't need 'min' in the dependency array
      column.setFilterValue((old: [string, string] | undefined) => [
        old?.[0] ?? "",
        val,
      ]);
    },
    [column], // Perfectly stable dependencies!
  );

  return (
    <div className="flex gap-0.5 px-1 w-full">
      <input
        type="number"
        placeholder="Min"
        value={min}
        onChange={handleRangeMin}
        className={cn(
          "w-1/2 rounded border border-input bg-transparent px-1 outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors min-w-0 placeholder:text-muted-foreground",
          densityH,
        )}
      />
      <input
        type="number"
        placeholder="Max"
        value={max}
        onChange={handleRangeMax}
        className={cn(
          "w-1/2 rounded border border-input bg-transparent px-1 outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors min-w-0 placeholder:text-muted-foreground",
          densityH,
        )}
      />
    </div>
  );
}
