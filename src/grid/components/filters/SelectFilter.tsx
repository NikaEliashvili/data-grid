import { cn } from "@/lib/utils";
import type { BaseFilterProps } from "../ColumnFilterCell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectFilter<TData, TValue>({
  column,
  densityH,
  meta,
}: BaseFilterProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? "all";

  return (
    <div className="w-full">
      <Select
        value={filterValue}
        onValueChange={(value) => {
          column.setFilterValue(value === "all" ? undefined : value);
        }}
      >
        <SelectTrigger
          className={cn(
            "w-full rounded border border-input bg-transparent px-2 outline-none focus:ring-1 focus:ring-ring/50 transition-colors py-0",
            "h-auto py-0",
            densityH,
          )}
        >
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">All</SelectItem>
          {meta.filterOptions?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
