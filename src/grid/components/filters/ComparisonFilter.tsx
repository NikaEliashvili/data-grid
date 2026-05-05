// components/filters/ComparisonFilter.tsx
import { useCallback, useMemo } from "react";
import type { BaseFilterProps } from "../ColumnFilterCell";
import type { ComparisonFilterState, FilterOperator } from "@/grid/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const filterValue = useMemo(
    () =>
      (column.getFilterValue() as ComparisonFilterState) || {
        operator: "eq",
        value: "",
      },
    [column],
  );

  const setOperator = useCallback(
    (op: FilterOperator) => {
      column.setFilterValue({ ...filterValue, operator: op });
    },
    [column, filterValue],
  );

  const setValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      column.setFilterValue({ ...filterValue, value: e.target.value });
    },
    [column, filterValue],
  );

  const currentOp =
    OPERATORS.find((o) => o.value === filterValue.operator) || OPERATORS[0];

  return (
    <div
      className={cn(
        "flex w-full rounded border border-input bg-transparent overflow-hidden focus-within:ring-1 focus-within:ring-ring/50",
        densityH,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="h-full px-2 rounded-none border-r border-input text-xs hover:bg-muted font-mono"
          >
            {currentOp.icon}
          </Button>
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
        value={filterValue.value}
        onChange={setValue}
        className="flex-1 bg-transparent px-2 outline-none min-w-0 text-xs"
      />
    </div>
  );
}
