import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  GroupingState,
  ExpandedState,
} from "@tanstack/react-table";

// ─── Cell Value Types ─────────────────────────────────────────────────────────
export type CellPrimitive = string | number | boolean | null;

export type CellValueType =
  | "string"
  | "number"
  | "currency"
  | "percent"
  | "date"
  | "boolean"
  | "badge";

// ─── Conditional Styling ──────────────────────────────────────────────────────
export type StyleConditionOperator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "between";

export interface StyleCondition {
  operator: StyleConditionOperator;
  value: CellPrimitive;
  value2?: CellPrimitive; // for "between"
  className: string;
  style?: React.CSSProperties;
}

// ─── Column Meta ──────────────────────────────────────────────────────────────
export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

export interface ComparisonFilterState {
  operator: FilterOperator;
  value: string | number;
}

export interface GridColumnMeta<TData> {
  type: CellValueType;
  filterable?: boolean;
  filterType?:
    | "text"
    | "select"
    | "range"
    | "date"
    | "multiselect"
    | "comparison"
    | "checkbox";
  filterOptions?: { label: string; value: string | number }[];
  editable?: boolean;
  pinned?: "left" | "right" | false;
  conditions?: StyleCondition[];
  format?: (value: CellPrimitive, row: TData) => string;
  aggregate?: "sum" | "avg" | "min" | "max" | "count" | "none";
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  groupable?: boolean;
}

// ─── Column Definition (extended) ────────────────────────────────────────────
export type GridColumnDef<TData> = ColumnDef<TData> & {
  meta?: GridColumnMeta<TData>;
  accessorKey?: string;
};

// ─── Grid Config ──────────────────────────────────────────────────────────────
export interface GridConfig<TData> {
  columns: GridColumnDef<TData>[];
  data: TData[];
  enableRowSelection?: boolean;
  enableGlobalFilter?: boolean;
  enableGrouping?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  density?: GridDensity;
  theme?: "light" | "dark" | "system";
  rowIdKey?: keyof TData & string;
  onRowClick?: (row: TData) => void;
  onCellEdit?: (rowId: string, columnId: string, value: CellPrimitive) => void;
}

// ─── Grid State ───────────────────────────────────────────────────────────────
export type GridDensity = "compact" | "normal" | "comfortable";

export interface GridState {
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
  grouping: GroupingState;
  expanded: ExpandedState;
  columnOrder: string[];
  density: GridDensity;
  sidebarOpen: boolean;
}

// ─── Grid Actions ─────────────────────────────────────────────────────────────
export interface GridActions {
  setGlobalFilter: (value: string) => void;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  setSorting: (sorting: SortingState) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: RowSelectionState) => void;
  setPagination: (pagination: PaginationState) => void;
  setGrouping: (grouping: GroupingState) => void;
  setExpanded: (expanded: ExpandedState) => void;
  setColumnOrder: (order: string[]) => void;
  setDensity: (density: GridDensity) => void;
  toggleSidebar: () => void;
  resetAll: () => void;
}

export type GridStore = GridState & GridActions;

// ─── Formula Engine ───────────────────────────────────────────────────────────
export type FormulaFn<TData> = (row: TData, allRows: TData[]) => CellPrimitive;

export interface FormulaDefinition<TData> {
  columnId: string;
  fn: FormulaFn<TData>;
}

// ─── Export Options ───────────────────────────────────────────────────────────
export type ExportFormat = "csv" | "json" | "tsv";

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHidden?: boolean;
  selectedOnly?: boolean;
}

// ─── Filter Descriptor ────────────────────────────────────────────────────────
export interface ColumnFilterDescriptor {
  id: string;
  value: ColumnFilterValue;
}

export type ColumnFilterValue =
  | string
  | number
  | boolean
  | [number, number] // range
  | [string, string] // date range
  | string[]; // multi-select

// ─── Stock Data (mock dataset type) ──────────────────────────────────────────
export interface StockRow {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  beta: number;
  week52High: number;
  week52Low: number;
  avgVolume: number;
  revenue: number;
  netIncome: number;
  debtToEquity: number;
  roe: number;
  country: string;
  currency: string;
  lastUpdated: string;
  status: "active" | "halted" | "delisted";
  signal: "buy" | "hold" | "sell" | "neutral";
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
export interface DragState {
  draggingColumnId: string | null;
  overColumnId: string | null;
}

// ─── Cell Editor ──────────────────────────────────────────────────────────────
export interface ActiveEditor {
  rowId: string;
  columnId: string;
  initialValue: CellPrimitive;
}

// ─── Find & Replace ───────────────────────────────────────────────────────────
export interface FindState {
  query: string;
  replaceQuery: string;
  matchCase: boolean;
  matchWholeWord: boolean;
  currentIndex: number;
  totalMatches: number;
}

export type FilterFnName =
  | "globalFuzzy"
  | "numberRange"
  | "exactMatch"
  | "multiSelect"
  | "contains"
  | "comparison";

export type ColumnFilterState = {
  id: string; // The column key
  type: FilterFnName;
  value: unknown;
};

export type FilterMessage = {
  type: "filter";
  globalFilter: string;
  columnFilters: ColumnFilterState[];
};

export type InitMessage<T> = {
  type: "init";
  data: T[];
  searchableKeys: string[];
};

export type WorkerMessage<T> = InitMessage<T> | FilterMessage;
