import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  type Table,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  type GroupingState,
  type ExpandedState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import { useGridStore } from "@/grid/store/gridStore";
import { filterFns } from "@/grid/engine/filterFunctions";
import type { GridColumnDef } from "@/grid/types";

interface UseGridTableOptions<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
}

export function useGridTable<TData>({
  data,
  columns,
}: UseGridTableOptions<TData>): Table<TData> {
  const {
    globalFilter,
    columnFilters,
    sorting,
    columnVisibility,
    rowSelection,
    pagination,
    grouping,
    expanded,
    columnOrder,
    setGlobalFilter,
    setColumnFilters,
    setSorting,
    setColumnVisibility,
    setRowSelection,
    setPagination,
    setGrouping,
    setExpanded,
    setColumnOrder,
  } = useGridStore();

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      globalFilter: globalFilter,
      columnFilters: columnFilters,
      sorting: sorting,
      columnVisibility: columnVisibility,
      rowSelection: rowSelection,
      pagination: pagination,
      grouping: grouping,
      expanded: expanded,
      columnOrder: columnOrder,
    },
    getRowId: (row) => (row as { id: string }).id,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    filterFns: {
      globalFuzzy: filterFns.globalFuzzy,
      numberRange: filterFns.numberRange,
      exactMatch: filterFns.exactMatch,
      multiSelect: filterFns.multiSelect,
      contains: filterFns.contains,
      comparison: filterFns.comparison,
    },
    onGlobalFilterChange: (updater) => {
      const val =
        typeof updater === "function" ? updater(globalFilter) : updater;
      setGlobalFilter(val as string);
    },
    onColumnFiltersChange: (updater) => {
      const val =
        typeof updater === "function" ? updater(columnFilters) : updater;
      console.log({
        type: typeof updater === "function",
        columnFilters,
        updater:
          typeof updater === "function" ? updater?.(columnFilters) : updater,
      });

      setColumnFilters(val as ColumnFiltersState);
    },
    onSortingChange: (updater) => {
      const val = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(val as SortingState);
    },
    onColumnVisibilityChange: (updater) => {
      const val =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      setColumnVisibility(val as VisibilityState);
    },
    onRowSelectionChange: (updater) => {
      const val =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(val as RowSelectionState);
    },
    onPaginationChange: (updater) => {
      const val = typeof updater === "function" ? updater(pagination) : updater;
      setPagination(val as PaginationState);
    },
    onGroupingChange: (updater) => {
      const val = typeof updater === "function" ? updater(grouping) : updater;
      setGrouping(val as GroupingState);
    },
    onExpandedChange: (updater) => {
      const val = typeof updater === "function" ? updater(expanded) : updater;
      setExpanded(val as ExpandedState);
    },
    onColumnOrderChange: (updater) => {
      const val =
        typeof updater === "function" ? updater(columnOrder) : updater;
      setColumnOrder(val as ColumnOrderState);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    autoResetPageIndex: false,
    autoResetExpanded: false,
  });

  return table;
}
