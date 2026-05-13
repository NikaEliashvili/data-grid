import { type FilterFn } from "@tanstack/react-table";
import type { ComparisonFilterState, StockRow } from "@/grid/types";
import { rankItem, type RankingInfo } from "@tanstack/match-sorter-utils";

declare module "@tanstack/react-table" {
  interface FilterMeta {
    itemRank: RankingInfo;
    comparison?: FilterFn<unknown>;
  }
}

// ─── Global Fuzzy Filter ──────────────────────────────────────────────────────
export const globalFuzzyFilter: FilterFn<StockRow> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  // rankItem აფასებს დამთხვევის ხარისხს
  const itemRank = rankItem(row.getValue(columnId), value);

  // ვინახავთ მეტამონაცემებს, რომ მერე სორტირებისას გამოვიყენოთ
  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

globalFuzzyFilter.autoRemove = (val: unknown) =>
  !val || (val as string).length === 0;

// ─── Number Range Filter ──────────────────────────────────────────────────────
export const numberRangeFilter: FilterFn<StockRow> = (
  row,
  columnId,
  filterValue: [number | "", number | ""],
) => {
  const val = row.getValue<number>(columnId);
  const [min, max] = filterValue;
  if (min !== "" && val < min) return false;
  if (max !== "" && val > max) return false;
  return true;
};
numberRangeFilter.autoRemove = (val: unknown) => {
  const v = val as [number | "", number | ""];
  return v == null || (v[0] === "" && v[1] === "");
};

// ─── Exact Match Filter ───────────────────────────────────────────────────────
export const exactMatchFilter: FilterFn<StockRow> = (
  row,
  columnId,
  filterValue: string,
) => {
  const val = String(row.getValue(columnId) ?? "");
  return val === filterValue;
};
exactMatchFilter.autoRemove = (val: unknown) =>
  !val || (val as string).length === 0;

// ─── Multi-Select Filter ──────────────────────────────────────────────────────
export const multiSelectFilter: FilterFn<StockRow> = (
  row,
  columnId,
  filterValue: string[],
) => {
  // 1. If nothing is selected in the dropdown, let all rows pass
  if (!filterValue?.length) return true;

  const rawValue = row.getValue(columnId);

  // 2. Scenario A: If your cell data is an Array (e.g., tags: ["value_1", "value_2"])
  if (Array.isArray(rawValue)) {
    // OR Logic: Return true if AT LEAST ONE selected filter is found in the cell's array
    return rawValue.some((item) => filterValue.includes(String(item)));
  }

  // 3. Scenario B: If your cell data is a primitive (string or number)
  const stringValue = String(rawValue ?? "");

  // OR Logic: Return true if the cell's string contains AT LEAST ONE of the selected filters.
  // We use .some() so it stops checking and returns true as soon as it finds a single match.
  return filterValue.some((filterItem) => stringValue.includes(filterItem));
};

multiSelectFilter.autoRemove = (val: unknown) =>
  !val || (val as string[]).length === 0;

// ─── Contains Filter (default for text) ──────────────────────────────────────
export const containsFilter: FilterFn<StockRow> = (
  row,
  columnId,
  filterValue: string,
) => {
  if (!filterValue) return true;
  const val = String(row.getValue(columnId) ?? "").toLowerCase();
  return val.includes(filterValue.toLowerCase());
};
containsFilter.autoRemove = (val: unknown) =>
  !val || (val as string).length === 0;

export const comparisonFilter: FilterFn<StockRow> = (
  row,
  columnId,
  filterValue: ComparisonFilterState,
) => {
  const rowValue = row.getValue(columnId);
  const { operator, value } = filterValue || {};
  console.log({ rowValue, filterValue });

  // 1. Don't filter if input is empty (let all rows pass)
  if (value === undefined || value === null || value === "") return true;

  // 2. Parse to numbers to prevent lexicographical bugs (e.g. "9" > "100")
  const numRowValue = Number(rowValue);
  const numFilterValue = Number(value);

  // Check if both values are valid numbers
  const isNumeric = !isNaN(numRowValue) && !isNaN(numFilterValue);

  // If numeric, compare as numbers. If text, compare as lowercase strings.
  const finalRowVal = isNumeric ? numRowValue : String(rowValue).toLowerCase();
  const finalFilterVal = isNumeric
    ? numFilterValue
    : String(value).toLowerCase();

  // 3. Do the actual comparison
  switch (operator) {
    case "eq":
      return finalRowVal == finalFilterVal;
    case "neq":
      return finalRowVal != finalFilterVal;
    case "gt":
      return finalRowVal > finalFilterVal;
    case "gte":
      return finalRowVal >= finalFilterVal;
    case "lt":
      return finalRowVal < finalFilterVal;
    case "lte":
      return finalRowVal <= finalFilterVal;
    default:
      return true;
  }
};

// FIX: Prevent TanStack from destroying the operator state.
// We only auto-remove the filter object entirely if the value is empty
// AND the user hasn't selected a custom operator.
comparisonFilter.autoRemove = (val: ComparisonFilterState) => {
  if (!val) return true;
  return (val.value === "" || val.value == null) && val.operator === "eq";
};

// ─── Filter Function Registry ─────────────────────────────────────────────────
export const filterFns = {
  globalFuzzy: globalFuzzyFilter,
  numberRange: numberRangeFilter,
  exactMatch: exactMatchFilter,
  multiSelect: multiSelectFilter,
  contains: containsFilter,
  comparison: comparisonFilter,
} as const;

export type FilterFnName = keyof typeof filterFns;
