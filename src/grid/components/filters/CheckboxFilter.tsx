import { Checkbox } from "@/components/ui/checkbox";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { cn } from "@/lib/utils";

export function CheckboxFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  // Get the current filter value
  const val = column.getFilterValue() as boolean | undefined;

  // 1. Prevent the React error: Never pass `undefined` to the checked prop.
  // We map `undefined` to Radix's native `"indeterminate"` state.
  const checkedState = val === undefined ? "indeterminate" : val;

  // 2. Strict State Cycle: NEUTRAL -> TRUE -> FALSE -> NEUTRAL
  const handleCheckedChange = () => {
    if (val === undefined) {
      // It was Neutral -> set to Checked
      column.setFilterValue(true);
    } else if (val === true) {
      // It was Checked -> set to Unchecked
      column.setFilterValue(false);
    } else {
      // It was Unchecked -> set back to Neutral (Clear filters)
      column.setFilterValue(undefined);
    }
  };

  return (
    <div className={cn("w-full flex items-center justify-center", densityH)}>
      <Checkbox
        checked={checkedState}
        onCheckedChange={handleCheckedChange}
        // Optional: Add some opacity to make the neutral state even more visually distinct
        className={cn(
          checkedState === "indeterminate" &&
            "bg-muted/50 text-muted-foreground border-dashed",
        )}
      />
    </div>
  );
}
