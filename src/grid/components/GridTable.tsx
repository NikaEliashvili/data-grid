import { useEffect, useRef } from "react";
import type { Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { GridDensity } from "@/grid/types";
import { Checkbox } from "@/components/ui/checkbox";
import { GridHeaderCell } from "@/grid/components/GridHeaderCell";
import { GridRow } from "@/grid/components/GridRow";
import { ColumnFilterCell } from "@/grid/components/ColumnFilterCell";
import { useColumnDrag } from "@/grid/hooks/useColumnDrag";
import { useGridStore } from "../store/gridStore";
import { cn } from "@/lib/utils";

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
  "use no memo";
  const { draggedId, overId, onDragStart, onDragOver, onDrop, onDragEnd } =
    useColumnDrag(table);
  const scrollRef = useRef<HTMLDivElement>(null);

  const density = useGridStore((state) => state.density);

  const rows = table.getRowModel().rows;

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => DENSITY_HEIGHTS[density],
    overscan: 25, // Sweet spot for high-speed scroll
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [density, rowVirtualizer]);

  return (
    <div
      ref={scrollRef}
      key={`${density}`}
      className="relative overflow-auto flex-1 min-h-0 w-full"
      style={{ willChange: "scroll-position" }}
      role="table"
    >
      <div
        className="flex flex-col border-collapse"
        style={{ width: table.getTotalSize(), minWidth: "100%" }}
      >
        <div className="sticky top-0 z-20 flex flex-col bg-background">
          {/* Header row */}
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="flex border-b border-border w-full"
              role="row"
            >
              {/* Select-all header */}
              <div
                className="bg-muted/50 border-r border-border px-2 py-2 flex items-center justify-center shrink-0"
                style={{ width: 40, flexBasis: 40 }}
                role="columnheader"
              >
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                  aria-label="Select all"
                  className="size-3.5"
                />
              </div>
              {headerGroup.headers
                .filter((h) => h.column.id !== "select")
                .map((header) => (
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
            className="flex border-b-2 border-border bg-muted/20 w-full "
            role="row"
          >
            <div
              className="bg-muted/20 border-r border-border shrink-0"
              style={{ width: 40, flexBasis: 40 }}
              role="columnheader"
            />
            {table
              .getHeaderGroups()[0]
              ?.headers.filter((h) => h.column.id !== "select")
              .map((header) => (
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
          className={cn("relative w-full")}
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
                  key={`${row.id}`}
                  row={row}
                  density={density}
                  isSelected={row.getIsSelected()}
                  onRowClick={onRowClick}
                  columnVisibility={table.getState().columnVisibility}
                  columnOrder={table.getState().columnOrder}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    willChange: "transform",
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
