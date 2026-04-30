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
  // TanStack uses 'undefined' for an empty filter. Shadcn UI expects a string.
  // We use "all" as our fallback string to represent the cleared state.
  const filterValue = (column.getFilterValue() as string) ?? "all";

  return (
    <div className="w-full px-1">
      <Select
        value={filterValue}
        onValueChange={(value) => {
          // Translate "all" back to undefined so TanStack knows to stop filtering
          column.setFilterValue(value === "all" ? undefined : value);
        }}
      >
        <SelectTrigger
          className={cn(
            "w-full rounded border border-input bg-transparent px-2 outline-none focus:ring-1 focus:ring-ring/50 transition-colors",
            // Remove shadcn's default h-10 to respect your table's density settings
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
