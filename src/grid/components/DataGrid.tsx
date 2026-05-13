import { useMemo } from "react";
import type { GridColumnDef, GridConfig } from "@/grid/types";
import { useGridStore } from "@/grid/store/gridStore";
import { useGridTable } from "@/grid/hooks/useGridTable";
import { GridToolbar } from "@/grid/components/GridToolbar";
import { GridTable } from "@/grid/components/GridTable";
import { GridPagination } from "@/grid/components/GridPagination";
import { GridStatusBar } from "@/grid/components/GridStatusBar";
import { useWorkerSearch } from "../hooks/useWorkerSearch";
import type { SearchableKeys, WorkerFilterDef } from "../engine/types";

interface DataGridProps<TData> {
  config: GridConfig<TData>;
}

export function DataGrid<TData>({ config }: DataGridProps<TData>) {
  const globalFilter = useGridStore((state) => state.globalFilter);
  const columnFilters = useGridStore((state) => state.columnFilters);
  const columnVisibility = useGridStore((state) => state.columnVisibility);

  const visibleKeys = useMemo<SearchableKeys<TData>[]>(() => {
    return config.columns.reduce<SearchableKeys<TData>[]>((acc, col) => {
      // Fallback to id if accessorKey isn't present
      const key = col.accessorKey || col.id;

      // Ensure the key exists and the column is not hidden
      if (key && columnVisibility[key] !== false) {
        // We can safely cast this specific string back into our strict union
        // because we control the GridColumnDef schema
        acc.push(key as SearchableKeys<TData>);
      }

      return acc;
    }, []);
  }, [config.columns, columnVisibility]);

  // ─── Map TanStack State to Strict Worker Types ───
  const mappedColumnFilters = useMemo<WorkerFilterDef[]>(() => {
    return columnFilters.map((filter) => {
      const colDef = config.columns.find(
        (c) => c.accessorKey === filter.id || c.id === filter.id,
      );
      const filterType = colDef?.meta?.filterType || "contains";

      return {
        id: filter.id,
        type: filterType,
        value: filter.value,
      } as WorkerFilterDef; // Enforce our strict discriminated union
    });
  }, [columnFilters, config.columns]);

  const { filteredData } = useWorkerSearch(
    config.data,
    globalFilter.toLowerCase(),
    mappedColumnFilters,
    visibleKeys,
  );

  // If filtering, use worker data. Otherwise, slice the first chunk of raw data to prevent initial UI lag.
  const isFiltering = globalFilter.length > 0 || columnFilters.length > 0;
  const tableData = isFiltering ? filteredData : config.data.slice(0, 500);

  const table = useGridTable({
    data: tableData,
    columns: config.columns as GridColumnDef<TData>[],
  });

  const totalRows = config.data.length;
  const filteredRows = isFiltering ? filteredData.length : totalRows;
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const columns = table.getAllLeafColumns();

  const hideableColumns = useMemo(
    () => columns.filter((c) => c.getCanHide()),
    [columns],
  );

  return (
    <div
      className={
        "flex flex-col h-full border border-border rounded-lg bg-background shadow-sm max-h-205 overflow-hidden min-h-125"
      }
    >
      <GridToolbar
        totalRows={totalRows}
        filteredRows={filteredRows}
        hideableColumns={hideableColumns}
        selectedCount={selectedCount}
        table={table}
      />
      <GridTable table={table} onRowClick={config.onRowClick} />
      <GridPagination
        pageIndex={table.getState().pagination.pageIndex}
        pageSize={table.getState().pagination.pageSize}
        pageCount={Math.ceil(
          filteredRows / table.getState().pagination.pageSize,
        )}
        canPrev={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        filteredRowCount={filteredRows}
        totalRows={totalRows}
        setPageSize={table.setPageSize}
        setPageIndex={table.setPageIndex}
        previousPage={table.previousPage}
        nextPage={table.nextPage}
      />
      <GridStatusBar
        filteredRows={table.getFilteredRowModel().rows}
        selectedRows={table.getSelectedRowModel().rows}
      />
    </div>
  );
}
