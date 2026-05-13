import { useState, useEffect } from "react";
import type { BaseFilterProps } from "../ColumnFilterCell";
import type { ComparisonFilterState, FilterOperator } from "@/grid/types";
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

const DEFAULT_FILTER: ComparisonFilterState = {
  operator: "eq",
  value: "",
};

export function ComparisonFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  const rawTableValue = column.getFilterValue() as
    | ComparisonFilterState
    | undefined;
  const [prevRawTableValue, setPrevRawTableValue] = useState(rawTableValue);
  const tableValue =
    (column.getFilterValue() as ComparisonFilterState) || DEFAULT_FILTER;

  // Local state
  const [operator, setOperator] = useState<FilterOperator>(tableValue.operator);
  const [value, setValue] = useState(tableValue.value);

  // Only debounce the typed value
  const debouncedValue = useDebounce(value, 300);

  if (rawTableValue !== prevRawTableValue) {
    setPrevRawTableValue(rawTableValue);
    if (!rawTableValue) {
      setOperator("eq");
      setValue("");
    }
  }

  // Push updates
  useEffect(() => {
    if (
      debouncedValue !== tableValue.value ||
      operator !== tableValue.operator
    ) {
      column.setFilterValue({ operator, value: debouncedValue });
    }
  }, [debouncedValue, operator, column, tableValue]);

  const currentOp = OPERATORS.find((o) => o.value === operator) || OPERATORS[0];

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
          {currentOp.icon}
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
