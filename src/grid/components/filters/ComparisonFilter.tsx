import { useState, useEffect } from "react";
import type { BaseFilterProps } from "../ColumnFilterCell";
import type { FilterOperator } from "@/grid/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/grid/hooks/useDebounce";

const OPERATORS: { value: FilterOperator; label: string; icon: string }[] = [
  { value: "eq", label: "Equals", icon: "=" },
  { value: "neq", label: "Does not equal", icon: "≠" },
  { value: "gt", label: "Greater than", icon: ">" },
  { value: "gte", label: "Greater or equal", icon: "≥" },
  { value: "lt", label: "Less than", icon: "<" },
  { value: "lte", label: "Less or equal", icon: "≤" },
];

export function ComparisonFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  // 1. Extract the raw state from TanStack
  const rawFilter = column.getFilterValue();

  // Safety net: Just in case an array is still stuck in your state from the previous crash
  const filterObj = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter;

  // 2. Extract strictly primitive strings. This kills the infinite loop.
  const currentOp = filterObj?.operator ?? "eq";
  const currentVal = filterObj?.value ?? "";

  // Local state for the UI
  const [operator, setOperator] = useState<FilterOperator>(currentOp);
  const [value, setValue] = useState<string | number>(currentVal);

  const debouncedValue = useDebounce(value, 300);

  // Sync external filter clears from TanStack down to our local state
  const [prevTableVal, setPrevTableVal] = useState(currentVal);
  const [prevTableOp, setPrevTableOp] = useState(currentOp);

  if (currentVal !== prevTableVal || currentOp !== prevTableOp) {
    setPrevTableVal(currentVal);
    setPrevTableOp(currentOp);

    // If someone hit a global "Clear All Filters" button
    if (!filterObj) {
      setOperator("eq");
      setValue("");
    }
  }

  // Push local state up to TanStack Table safely
  useEffect(() => {
    const isDefault = !debouncedValue && operator === "eq";

    if (isDefault) {
      // Clean up TanStack state if the input is completely empty
      if (currentVal !== "" || currentOp !== "eq") {
        column.setFilterValue(undefined);
      }
    } else {
      // Only push an update if our local primitives differ from TanStack's current primitives
      if (debouncedValue !== currentVal || operator !== currentOp) {
        column.setFilterValue([{ operator, value: debouncedValue }]);
      }
    }
  }, [debouncedValue, operator, currentVal, currentOp, column]);

  const currentOpIcon =
    OPERATORS.find((o) => o.value === operator) || OPERATORS[0];

  return (
    <div
      className={cn(
        "flex w-full rounded border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring/50",
        densityH,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          variant="ghost"
          className="h-full px-2 rounded-none border-r border-input text-xs hover:bg-muted font-mono outline-none"
        >
          {currentOpIcon.icon}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {OPERATORS.map((op) => (
            <DropdownMenuItem
              key={op.value}
              onClick={() => setOperator(op.value)}
              className="flex gap-2 text-xs cursor-pointer"
            >
              <span className="font-mono w-4 text-center">{op.icon}</span>
              {op.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="text"
        placeholder="Filter..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-transparent px-2 outline-none min-w-0 text-xs"
      />
    </div>
  );
}
