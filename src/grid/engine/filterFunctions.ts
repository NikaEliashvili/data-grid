import { type FilterFn } from "@tanstack/react-table";
import type { ComparisonFilterState, StockRow } from "@/grid/types";
import { rankItem, type RankingInfo } from "@tanstack/match-sorter-utils";

declare module "@tanstack/react-table" {
  interface FilterMeta {
    itemRank: RankingInfo;
    comparison: FilterFn<unknown>;
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
  addMeta({ itemRank });

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
  if (!filterValue?.length) return true;
  const val = String(row.getValue(columnId) ?? "");
  return filterValue.includes(val);
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

export const comparison: FilterFn<StockRow> = (
  row,
  columnId,
  filterValue: ComparisonFilterState,
) => {
  const rowValue = row.getValue(columnId) as number | string;
  const { operator, value } = filterValue;
  console.log("Filter...");

  if (!value) return true; // Don't filter if input is empty

  // Do the actual comparison
  if (operator === "eq") return rowValue == value;
  if (operator === "neq") return rowValue != value;
  if (operator === "gt") return rowValue > value;
  if (operator === "gte") return rowValue >= value;
  if (operator === "lt") return rowValue < value;
  if (operator === "lte") return rowValue <= value;

  return true;
};

comparison.autoRemove = (val: ComparisonFilterState) => {
  return !val || !val.value || val.value.toString().trim() === "";
};

// ─── Filter Function Registry ─────────────────────────────────────────────────
export const filterFns = {
  globalFuzzy: globalFuzzyFilter,
  numberRange: numberRangeFilter,
  exactMatch: exactMatchFilter,
  multiSelect: multiSelectFilter,
  contains: containsFilter,
  comparison,
} as const;

export type FilterFnName = keyof typeof filterFns;
