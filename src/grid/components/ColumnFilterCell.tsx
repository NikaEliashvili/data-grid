import type { Column } from "@tanstack/react-table";
import type { GridDensity, GridColumnMeta } from "@/grid/types";

// შემოვიტანოთ ცალკეული ფილტრის კომპონენტები
import { TextFilter } from "./filters/TextFilter";
import { SelectFilter } from "./filters/SelectFilter";
import { RangeFilter } from "./filters/RangeFilter";
import { DateFilter } from "./filters/DateFilter";
import { CheckboxFilter } from "./filters/CheckboxFilter";
import { ComparisonFilter } from "./filters/ComparisonFilter";
import { MultiSelectFilter } from "./filters/MultiSelectFilter";

export interface BaseFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  densityH: string;
  meta: GridColumnMeta<TData>;
}

interface ColumnFilterCellProps<TData, TValue> {
  column: Column<TData, TValue>;
  density: GridDensity;
}

export function ColumnFilterCell<TData, TValue>({
  column,
  density,
}: ColumnFilterCellProps<TData, TValue>) {
  const meta = column.columnDef.meta as GridColumnMeta<TData> | undefined;

  if (!meta?.filterable) {
    return <div className="w-full h-7" />; // Placeholder
  }

  // სიმაღლის სტილების გენერაცია სიმჭიდროვის მიხედვით
  const densityH =
    density === "compact"
      ? "h-6 text-xs"
      : density === "comfortable"
        ? "h-9 text-sm"
        : "h-7 text-xs";

  const props = { column, densityH, meta };

  // Factory Switcher
  switch (meta.filterType) {
    case "select":
      return <SelectFilter {...props} />;
    case "range":
      return <RangeFilter {...props} />;
    case "date":
      return <DateFilter {...props} />;
    case "checkbox":
      return <CheckboxFilter {...props} />;
    case "comparison":
      return <ComparisonFilter {...props} />;
    case "multiselect":
      return <MultiSelectFilter {...props} />;
    case "text":
    default:
      return <TextFilter {...props} />;
  }
}
