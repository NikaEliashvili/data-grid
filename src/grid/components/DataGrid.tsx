import { useMemo } from "react";
import type { GridColumnDef, GridConfig } from "@/grid/types";
import { useGridStore } from "@/grid/store/gridStore";
import { useGridTable } from "@/grid/hooks/useGridTable";
import { GridToolbar } from "@/grid/components/GridToolbar";
import { GridTable } from "@/grid/components/GridTable";
import { GridPagination } from "@/grid/components/GridPagination";
import { GridStatusBar } from "@/grid/components/GridStatusBar";
import { useWorkerSearch } from "../hooks/useWorkerSearch";

interface DataGridProps<TData> {
  config: GridConfig<TData>;
}

export function DataGrid<TData>({ config }: DataGridProps<TData>) {
  const globalFilter = useGridStore((state) => state.globalFilter);
  const columnVisibility = useGridStore((state) => state.columnVisibility);

  const visibleKeys = useMemo(() => {
    return config.columns
      .map((c) => c.accessorKey || c.id)
      .filter((key) => {
        if (!key) return false;
        return columnVisibility[key] !== false;
      }) as string[];
  }, [config.columns, columnVisibility]);

  const { filteredData } = useWorkerSearch(
    config.data,
    globalFilter.toLowerCase(),
    visibleKeys,
  );

  const tableData = globalFilter.length > 0 ? filteredData : config.data;

  // useGridTable now receives completely stable references
  const table = useGridTable({
    data: tableData,
    columns: config.columns as GridColumnDef<TData>[],
  });

  const totalRows = config.data.length;
  const filteredRows = tableData.length;
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const columns = table.getAllLeafColumns();
  const hideableColumns = useMemo(
    () => columns.filter((c) => c.getCanHide()),
    [columns],
  );

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-background shadow-sm max-h-205 overflow-hidden min-h-125">
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
        pageCount={table.getPageCount()}
        canPrev={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        filteredRowCount={table.getFilteredRowModel().rows.length}
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
