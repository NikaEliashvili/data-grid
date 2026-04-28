import { useRef } from "react";
import type { Table } from "@tanstack/react-table";
import type { StockRow, GridDensity } from "@/grid/types";
import { Checkbox } from "@/components/ui/checkbox";
import { GridHeaderCell } from "@/grid/components/GridHeaderCell";
import { GridRow } from "@/grid/components/GridRow";
import { ColumnFilterCell } from "@/grid/components/ColumnFilterCell";
import { useColumnDrag } from "@/grid/hooks/useColumnDrag";

interface GridTableProps {
  table: Table<StockRow>;
  density: GridDensity;
  onRowClick?: (row: StockRow) => void;
}

export function GridTable({ table, density, onRowClick }: GridTableProps) {
  const { draggedId, overId, onDragStart, onDragOver, onDrop, onDragEnd } =
    useColumnDrag(table);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = table.getRowModel().rows;

  return (
    <div ref={scrollRef} className="relative overflow-auto flex-1 min-h-0">
      <table
        className="w-full border-collapse"
        style={{ minWidth: table.getTotalSize() }}
      >
        <thead className="sticky top-0 z-20">
          {/* Header row */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {/* Select-all header */}
              <th
                className="bg-muted/50 border-r border-border px-2 py-2"
                style={{ width: 40 }}
              >
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                  aria-label="Select all"
                  className="size-3.5"
                />
              </th>
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
            </tr>
          ))}

          {/* Filter row */}
          <tr className="border-b-2 border-border bg-muted/20">
            <th
              className="bg-muted/20 border-r border-border"
              style={{ width: 40 }}
            />
            {table
              .getHeaderGroups()[0]
              ?.headers.filter((h) => h.column.id !== "select")
              .map((header) => (
                <th
                  key={`filter-${header.id}`}
                  className="border-r border-border last:border-r-0 py-1"
                  style={{ width: header.getSize() }}
                >
                  <ColumnFilterCell column={header.column} density={density} />
                </th>
              ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getVisibleLeafColumns().length + 1}
                className="py-16 text-center text-muted-foreground text-sm"
              >
                No results found. Try adjusting your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <GridRow
                key={row.id}
                row={row}
                density={density}
                isSelected={row.getIsSelected()}
                onRowClick={onRowClick}
                columnVisibility={table.getState().columnVisibility}
                columnOrder={table.getState().columnOrder}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
