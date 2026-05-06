import { useEffect, useRef, useMemo, useCallback } from "react";
import type { Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { GridDensity } from "@/grid/types";
import { Checkbox } from "@/components/ui/checkbox";
import { GridHeaderCell } from "@/grid/components/GridHeaderCell";
import { GridRow } from "@/grid/components/GridRow";
import { ColumnFilterCell } from "@/grid/components/ColumnFilterCell";
import { useColumnDrag } from "@/grid/hooks/useColumnDrag";
import { useGridStore } from "../store/gridStore";

interface GridTableProps<TData> {
  table: Table<TData>;
  onRowClick?: (row: TData) => void;
}

const DENSITY_HEIGHTS: Record<GridDensity, number> = {
  compact: 36, // h-9
  normal: 48, // h-12
  comfortable: 56, // h-14
};

export function GridTable<TData>({ table, onRowClick }: GridTableProps<TData>) {
  const { draggedId, overId, onDragStart, onDragOver, onDrop, onDragEnd } =
    useColumnDrag(table);
  const scrollRef = useRef<HTMLDivElement>(null);
  const density = useGridStore((state) => state.density);

  // 1. Extract state ONCE outside the render loops
  const rows = table.getRowModel().rows;
  const tableState = table.getState();
  const columnVisibility = tableState.columnVisibility;
  const columnSizing = tableState.columnSizing;
  const columnOrder = tableState.columnOrder;
  const isAllSelected = table.getIsAllPageRowsSelected();
  const totalSize = table.getTotalSize();
  const headerGroups = table.getHeaderGroups();

  // 2. Memoize headers to avoid filtering arrays on every drag frame
  const filteredHeaders = useMemo(() => {
    return headerGroups.map((group) => ({
      ...group,
      headers: group.headers.filter((h) => h.column.id !== "select"),
    }));
  }, [headerGroups]);

  // 3. Memoize Virtualizer config callbacks
  const getScrollElement = useCallback(() => scrollRef.current, []);
  const estimateSize = useCallback(() => DENSITY_HEIGHTS[density], [density]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize,
    overscan: 10,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [density, rowVirtualizer]);

  return (
    <div
      ref={scrollRef}
      className="relative overflow-auto flex-1 min-h-0 w-full"
      style={{ willChange: "scroll-position" }}
      role="table"
    >
      <div
        className="flex flex-col border-collapse"
        style={{ width: totalSize, minWidth: "100%" }}
      >
        <div className="sticky top-0 z-20 flex flex-col bg-background">
          {/* Header row */}
          {filteredHeaders.map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="flex border-b border-border w-full"
              role="row"
            >
              <div
                className="bg-muted/50 border-r border-border px-2 py-2 flex items-center justify-center shrink-0"
                style={{ width: 40, flexBasis: 40 }}
                role="columnheader"
              >
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                  aria-label="Select all"
                  className="size-3.5 rounded"
                />
              </div>
              {headerGroup.headers.map((header) => (
                <GridHeaderCell
                  key={header.id}
                  header={header}
                  draggedId={draggedId}
                  overId={overId}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                />
              ))}
            </div>
          ))}

          {/* Filter row */}
          <div
            className="flex border-b-2 border-border bg-muted/20 w-full"
            role="row"
          >
            <div
              className="bg-muted/20 border-r border-border shrink-0"
              style={{ width: 40, flexBasis: 40 }}
              role="columnheader"
            />
            {filteredHeaders[0]?.headers.map((header) => (
              <div
                key={`filter-${header.id}`}
                className="border-r border-border last:border-r-0 py-1 shrink-0"
                style={{
                  width: header.getSize(),
                  flexBasis: header.getSize(),
                }}
                role="columnheader"
              >
                <ColumnFilterCell column={header.column} density={density} />
              </div>
            ))}
          </div>
        </div>

        {/* Virtualized Body Container */}
        <div
          className="relative w-full"
          style={{ height: rowVirtualizer.getTotalSize() }}
          role="rowgroup"
        >
          {rows.length === 0 ? (
            <div className="py-16 flex items-center justify-center text-muted-foreground text-sm w-full absolute top-0">
              No results found. Try adjusting your filters.
            </div>
          ) : (
            rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <GridRow
                  key={row.id}
                  row={row}
                  density={density}
                  isSelected={row.getIsSelected()}
                  onRowClick={onRowClick}
                  columnSizing={columnSizing}
                  columnVisibility={columnVisibility}
                  columnOrder={columnOrder}
                  // 4. Pass primitives instead of a new style object
                  transformTop={virtualRow.start}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
