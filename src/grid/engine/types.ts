export type Primitive = string | number | boolean | null | undefined;

export type SearchableKeys<T> = {
  [K in keyof T]: T[K] extends Primitive ? K : never;
}[keyof T];

export type ComparisonFilterState = {
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  value: number | string;
};

// 1. Map out the exact expected value payload for each filter type
export type FilterPayloads = {
  globalFuzzy: string;
  numberRange: [number | "", number | ""];
  exactMatch: string;
  multiSelect: string[];
  contains: string;
  comparison: ComparisonFilterState;
};

// 2. Auto-generate a Discriminated Union for strict type narrowing
export type ColumnFilterDef<T> = {
  [K in keyof FilterPayloads]: {
    id: keyof T; // Strictly tied to the keys of your data generic!
    type: K;
    value: FilterPayloads[K];
  };
}[keyof FilterPayloads];

export type IndexedRow<T> = {
  raw: T;
  searchText: string;
};

// 3. Strict Worker Messages
export type InitMessage<T> = {
  type: "init";
  data: T[];
  keys: SearchableKeys<T>[];
};

export type FilterMessage<T> = {
  type: "filter";
  globalFilter: string;
  columnFilters: ColumnFilterDef<T>[];
};

export type WorkerMessage<T> = InitMessage<T> | FilterMessage<T>;
