export type Primitive = string | number | boolean | null | undefined | Date;

export type CellValue = Primitive;

export type RowId = string;

export interface GridRow {
  id: RowId;
  [key: string]: CellValue;
}

export type CellEditorType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "checkbox"
  | "custom";

export interface ColumnFormula {
  expression: string;
  dependencies: string[];
}

export interface ColumnStyleRule<TData> {
  condition: (value: CellValue, row: TData) => boolean;
  className: string;
}

export interface GridColumn<TData> {
  id: string;
  accessorKey: keyof TData;
  header: string;

  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;

  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  groupable?: boolean;

  editorType?: CellEditorType;

  formatter?: (value: CellValue) => string;

  formula?: ColumnFormula;

  styleRules?: ColumnStyleRule<TData>[];

  cellRenderer?: (props: { value: CellValue; row: TData }) => React.ReactNode;
}
