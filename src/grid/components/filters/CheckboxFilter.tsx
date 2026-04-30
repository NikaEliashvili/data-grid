import { Checkbox } from "@/components/ui/checkbox";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { cn } from "@/lib/utils";

export function CheckboxFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  const val = column.getFilterValue() as boolean | undefined;

  return (
    <div className={cn("w-full flex items-center justify-center", densityH)}>
      <Checkbox
        checked={val === undefined ? "indeterminate" : val}
        onCheckedChange={(checked) => {
          // ციკლი: Indeterminate -> True -> False -> Indeterminate
          if (checked === true) column.setFilterValue(true);
          else if (checked === false && val === true)
            column.setFilterValue(false);
          else column.setFilterValue(undefined);
        }}
      />
    </div>
  );
}
