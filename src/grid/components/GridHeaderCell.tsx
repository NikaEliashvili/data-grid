import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ChevronsUpDown, GripVertical } from "lucide-react";

interface GridHeaderCellProps<TData, TValue> {
  header: Header<TData, TValue>;
  draggedId: string | null;
  overId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}

export function GridHeaderCell<TData, TValue>({
  header,
  draggedId,
  overId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: GridHeaderCellProps<TData, TValue>) {
  const { column } = header;
  const canSort = column.getCanSort();
  const sorted = column.getIsSorted();
  const isDragging = draggedId === column.id;
  const isOver = overId === column.id && draggedId !== column.id;

  return (
    <div
      role="columnheader"
      className={cn(
        "relative flex shrink-0 select-none border-r border-border last:border-r-0 bg-muted/50",
        "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
        isOver && "bg-accent/60",
        isDragging && "opacity-40",
        column.getIsResizing() && "pointer-events-none",
      )}
      style={{ width: header.getSize(), flexBasis: header.getSize() }}
      draggable={!header.isPlaceholder && column.id !== "checkbox"}
      onDragStart={() => onDragStart(column.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(column.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(column.id);
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-2 w-full",
          canSort && "cursor-pointer hover:text-foreground transition-colors",
        )}
        onClick={canSort ? column.getToggleSortingHandler() : undefined}
      >
        {column.id !== "checkbox" && (
          <GripVertical className="size-3 shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing mr-0.5" />
        )}

        <span className="truncate flex-1">
          {header.isPlaceholder
            ? null
            : flexRender(column.columnDef.header, header.getContext())}
        </span>

        {canSort && (
          <span className="shrink-0 flex items-center justify-center">
            {sorted === "asc" ? (
              <ArrowUp className="size-3 text-primary" />
            ) : sorted === "desc" ? (
              <ArrowDown className="size-3 text-primary" />
            ) : (
              <ChevronsUpDown className="size-3 opacity-30" />
            )}
          </span>
        )}
      </div>

      {column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
            "hover:bg-primary/50 transition-colors z-10",
            column.getIsResizing() && "bg-primary",
          )}
        />
      )}
    </div>
  );
}
