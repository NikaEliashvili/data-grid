import { cn } from "@/lib/utils";
import type { BaseFilterProps } from "../ColumnFilterCell";

export function DateFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  return (
    <div className="w-full px-1">
      <input
        type="date"
        value={(column.getFilterValue() as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className={cn(
          "w-full rounded border border-input bg-transparent px-1.5 outline-none focus:border-ring focus:ring-1 focus:ring-ring/50",
          densityH,
        )}
      />
    </div>
  );
}
