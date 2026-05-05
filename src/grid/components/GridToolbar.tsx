import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Table } from "@tanstack/react-table";
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
export function GridDensitySelector() {
  const density = useGridStore((state) => state.density);
  const setDensity = useGridStore((state) => state.setDensity);

  const [localValue, setLocalValue] = useState<GridDensity>(density);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {DENSITY_OPTIONS.find((d) => d.value === localValue)?.icon}
        <ChevronDown
          className={cn(
            "size-3 opacity-50 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 w-40 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
          role="menu"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Row Density
          </div>

          <div className="h-px bg-border my-1 -mx-1" />

          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="menuitem"
              type="button"
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// const GridDensitySelector = memo(() => {
//   const density = useGridStore((state) => state.density);
//   const setDensity = useGridStore((state) => state.setDensity);
//   const [localValue, setLocalValue] = useState<GridDensity>(density);

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       setDensity(localValue);
//     }, debounce);

//     return () => {
//       window.clearTimeout(timer);
//     };
//   }, [localValue, setDensity]);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
//           {DENSITY_OPTIONS.find((d) => d.value === localValue)?.icon}
//           <ChevronDown className="size-3 opacity-50" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuLabel>Row Density</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {DENSITY_OPTIONS.map((opt) => (
//           <DropdownMenuItem
//             key={opt.value}
//             onClick={() => setLocalValue(opt.value)}
//             className={cn("gap-2", density === opt.value && "bg-accent")}
//           >
//             {opt.icon}
//             {opt.label}
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// });

interface TableSubComponentProps<TData> {
  table: Table<TData>;
}

export function GridColumnToggler<TData>({
  table,
}: TableSubComponentProps<TData>) {
  const hideableColumns = useMemo(
    () => table.getAllLeafColumns().filter((c) => c.getCanHide()),
    [table],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <SlidersHorizontal className="size-3.5" />
          Columns
          <ChevronDown className="size-3 opacity-50" />
        </Button>
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
            onCheckedChange={(v: boolean) => col.toggleVisibility(v)}
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

// 2. Fixed GridExport
export function GridExport<TData>({ table }: TableSubComponentProps<TData>) {
  const handleExport = useCallback(
    (format: ExportFormat) =>
      exportTable(table, { format, filename: "export", selectedOnly: false }),
    [table],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="size-3.5" />
          Export
          <ChevronDown className="size-3 opacity-50" />
        </Button>
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

// ----------------------------------------------------------------------
// MAIN TOOLBAR COMPONENT
// ----------------------------------------------------------------------

interface GridToolbarProps<TData> {
  table: Table<TData>;
  totalRows: number;
  filteredRows: number;
}

export function GridToolbar<TData>({
  table,
  totalRows,
  filteredRows,
}: GridToolbarProps<TData>) {
  const resetAll = useGridStore((state) => state.resetAll);
  const selectedCount = Object.keys(table.getState().rowSelection).length;

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
      <GridColumnToggler table={table} />
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
