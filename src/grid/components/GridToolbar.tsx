import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { Column, Table } from "@tanstack/react-table";
import type { GridDensity, ExportFormat } from "@/grid/types";
import { useGridStore } from "@/grid/store/gridStore";
import { exportTable } from "@/grid/engine/exportEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  Rows2,
  Rows3,
  StretchVertical,
  FileText,
  File as FileJson,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DebouncedInput } from "./DebouncedInput";

const GridSearch = memo(() => {
  const globalFilter = useGridStore((state) => state.globalFilter);
  const setGlobalFilter = useGridStore((state) => state.setGlobalFilter);

  return (
    <DebouncedInput
      debounce={300}
      value={globalFilter}
      onChange={setGlobalFilter}
    />
  );
});

const DENSITY_OPTIONS: {
  label: string;
  value: GridDensity;
  icon: React.ReactNode;
}[] = [
  { label: "Compact", value: "compact", icon: <Rows2 className="size-4" /> },
  { label: "Normal", value: "normal", icon: <Rows3 className="size-4" /> },
  {
    label: "Comfortable",
    value: "comfortable",
    icon: <StretchVertical className="size-4" />,
  },
];

const debounce = 150;

export const GridDensitySelector = memo(() => {
  const density = useGridStore((state) => state.density);
  const setDensity = useGridStore((state) => state.setDensity);

  const [localValue, setLocalValue] = useState<GridDensity>(density);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLocalValue = () => {
      setLocalValue(density);
    };
    updateLocalValue();
  }, [density]);

  // Debounce logic
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDensity(localValue);
    }, debounce);

    return () => {
      window.clearTimeout(timer);
    };
  }, [localValue, setDensity]);

  // Handle clicking outside to close the custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
      >
        <SlidersHorizontal className="size-3.5" />
        {DENSITY_OPTIONS.find((d) => d.value === localValue)?.icon}
        <ChevronDown className="size-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 max-h-80 overflow-y-auto"
      >
        <DropdownMenuLabel>Row Density</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DENSITY_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={(e) => e.preventDefault()}
            role="menuitem"
            onClick={() => {
              setLocalValue(opt.value);
              setIsOpen(false);
            }}
            className={cn(
              "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
              localValue === opt.value &&
                "bg-accent text-accent-foreground font-medium",
            )}
          >
            {opt.icon}
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

interface TableSubComponentProps<TData> {
  hideableColumns: Column<TData, unknown>[];
}

export function GridColumnToggler<TData>({
  hideableColumns,
}: TableSubComponentProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
      >
        <SlidersHorizontal className="size-3.5" />
        Columns
        <ChevronDown className="size-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 max-h-80 overflow-y-auto"
      >
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={col.getIsVisible()}
            autoClose={false}
            onCheckedChange={async (v: boolean) => {
              await new Promise((res) => {
                col.toggleVisibility(v);
                return res;
              });
            }}
            className="text-xs"
            onSelect={(e) => e.preventDefault()}
          >
            {typeof col.columnDef.header === "string"
              ? col.columnDef.header
              : col.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface GridExportProps<TData> {
  table: Table<TData>;
}

// 2. Fixed GridExport
export function GridExportInner<TData>({ table }: GridExportProps<TData>) {
  const handleExport = useCallback(
    (format: ExportFormat) =>
      exportTable(table, { format, filename: "export", selectedOnly: false }),
    [table],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
      >
        <Download className="size-3.5" />
        Export
        <ChevronDown className="size-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Download As</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
          <Table2 className="size-4" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("tsv")} className="gap-2">
          <FileText className="size-4" /> TSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          className="gap-2"
        >
          <FileJson className="size-4" /> JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const GridExport = memo(GridExportInner) as typeof GridExportInner;

// ----------------------------------------------------------------------
// MAIN TOOLBAR COMPONENT
// ----------------------------------------------------------------------

interface GridToolbarProps<TData> {
  table: Table<TData>;
  totalRows: number;
  filteredRows: number;
  selectedCount: number;
  hideableColumns: Column<TData, unknown>[];
}

export function GridToolbar<TData>({
  table,
  totalRows,
  filteredRows,
  hideableColumns,
  selectedCount,
}: GridToolbarProps<TData>) {
  const resetAll = useGridStore((state) => state.resetAll);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-card flex-wrap">
      <GridSearch />
      <Separator orientation="vertical" className="h-5" />

      {/* Row counts */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="tabular-nums font-medium text-foreground">
          {filteredRows.toLocaleString()}
        </span>
        <span>of</span>
        <span className="tabular-nums">{totalRows.toLocaleString()}</span>
        <span>rows</span>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs ml-1">
            {selectedCount} selected
          </Badge>
        )}
      </div>

      <div className="flex-1" />

      {/* Delegated isolated components */}
      <GridDensitySelector />
      <GridColumnToggler hideableColumns={hideableColumns} />
      <GridExport table={table} />

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-muted-foreground"
        onClick={resetAll}
      >
        <RefreshCw className="size-3.5" />
        Reset
      </Button>
    </div>
  );
}
