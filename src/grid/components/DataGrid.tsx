import type { GridColumnDef, StockRow, GridConfig } from "@/grid/types";
import { useGridStore } from "@/grid/store/gridStore";
import { useGridTable } from "@/grid/hooks/useGridTable";
import { GridToolbar } from "@/grid/components/GridToolbar";
import { GridTable } from "@/grid/components/GridTable";
import { GridPagination } from "@/grid/components/GridPagination";
import { GridStatusBar } from "@/grid/components/GridStatusBar";
import { useWorkerSearch } from "../hooks/useWorkerSearch";
import { useMemo } from "react";

interface DataGridProps {
  config: GridConfig<StockRow>;
}

export function DataGrid({ config }: DataGridProps) {
  // const { density } = useGridStore();

  // const table = useGridTable({
  //   data: config.data,
  //   columns: config.columns as GridColumnDef<StockRow>[],
  // });

  // const totalRows = config.data.length;
  // const filteredRows = table.getFilteredRowModel().rows.length;

  const { density, globalFilter, columnVisibility } = useGridStore();

  // ვიღებთ მხოლოდ იმ სვეტების გასაღებებს, რომლებიც Store-ში დამალული (false) არ არის
  const visibleKeys = useMemo(() => {
    return config.columns
      .map((c) => c.accessorKey || c.id)
      .filter((key) => {
        if (!key) return false;
        // თუ სვეტი აშკარად დამალულია (false), ამოვაგდებთ ძებნის სიიდან
        return columnVisibility[key] !== false;
      }) as string[];
  }, [config.columns, columnVisibility]);

  // Worker-ს ვაწვდით მხოლოდ ხილული სვეტების ლისტს
  const { filteredData } = useWorkerSearch(
    config.data,
    globalFilter,
    visibleKeys,
  );

  const table = useGridTable({
    data: globalFilter.length > 0 ? filteredData : config.data,
    columns: config.columns as GridColumnDef<StockRow>[],
  });

  const totalRows = config.data.length;
  const filteredRows = filteredData.length;

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Toolbar */}
      <GridToolbar
        table={table}
        totalRows={totalRows}
        filteredRows={filteredRows}
      />

      {/* Table area */}
      <GridTable
        table={table}
        density={density}
        onRowClick={config.onRowClick}
      />

      {/* Pagination */}
      <GridPagination table={table} />

      {/* Status Bar */}
      <GridStatusBar table={table} />
    </div>
  );
}
