import type { ComparisonFilterState } from "../types";

// ─── 1. Strict Discriminated Union ───
export type WorkerFilterDef =
  | { type: "text"; id: string; value: string }
  | { type: "select"; id: string; value: string } // Assuming select is a single exact match
  | { type: "multiselect"; id: string; value: string[] }
  | { type: "range"; id: string; value: [number | "", number | ""] }
  | { type: "comparison"; id: string; value: ComparisonFilterState[] }
  | { type: "date"; id: string; value: string }
  | { type: "checkbox"; id: string; value: boolean | "indeterminate" };

type Primitive = string | number | boolean | null | undefined | Date;

// ─── 2. Enforced String Keys ───
export type SearchableKeys<T> = Extract<
  {
    [K in keyof T]-?: T[K] extends Primitive ? K : never;
  }[keyof T],
  string
>;

export type IndexedRow<T> = {
  raw: T;
  searchText: string;
};

// ─── 3. Message Payloads ───
export type InitMessage<T> = {
  type: "init";
  data: T[];
  keys: SearchableKeys<T>[];
};

export type FilterMessage = {
  type: "filter";
  globalFilter: string;
  columnFilters: WorkerFilterDef[];
};

export type WorkerMessage<T> = InitMessage<T> | FilterMessage;
