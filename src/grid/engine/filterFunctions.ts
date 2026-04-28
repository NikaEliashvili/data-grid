import { type FilterFn } from "@tanstack/react-table";
import type { StockRow } from "@/grid/types";
import { rankItem, type RankingInfo } from "@tanstack/match-sorter-utils";

declare module "@tanstack/react-table" {
  interface FilterMeta {
    itemRank: RankingInfo;
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

// ─── Filter Function Registry ─────────────────────────────────────────────────
export const filterFns = {
  globalFuzzy: globalFuzzyFilter,
  numberRange: numberRangeFilter,
  exactMatch: exactMatchFilter,
  multiSelect: multiSelectFilter,
  contains: containsFilter,
} as const;

export type FilterFnName = keyof typeof filterFns;
