import { useCallback } from "react";
import type { Table } from "@tanstack/react-table";
import type { StockRow, GridDensity, ExportFormat } from "@/grid/types";
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

interface GridToolbarProps {
  table: Table<StockRow>;
  totalRows: number;
  filteredRows: number;
}

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

export function GridToolbar({
  table,
  totalRows,
  filteredRows,
}: GridToolbarProps) {
  const { globalFilter, setGlobalFilter, density, setDensity, resetAll } =
    useGridStore();

  const handleExport = useCallback(
    (format: ExportFormat) => {
      exportTable(table, { format, filename: "stocks", selectedOnly: false });
    },
    [table],
  );

  const selectedCount = Object.keys(table.getState().rowSelection).length;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-card flex-wrap">
      {/* Search */}
      <DebouncedInput
        debounce={300}
        value={globalFilter}
        onChange={setGlobalFilter}
      />

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

      {/* Density */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            {DENSITY_OPTIONS.find((d) => d.value === density)?.icon}
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Row Density</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DENSITY_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setDensity(opt.value)}
              className={cn("gap-2", density === opt.value && "bg-accent")}
            >
              {opt.icon}
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Column Visibility */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
          {table
            .getAllLeafColumns()
            .filter((c) => c.getCanHide())
            .map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={(v) => col.toggleVisibility(v)}
                className="text-xs"
              >
                {typeof col.columnDef.header === "string"
                  ? col.columnDef.header
                  : col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Download className="size-3.5" />
            Export
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Download As</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleExport("csv")}
            className="gap-2"
          >
            <Table2 className="size-4" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("tsv")}
            className="gap-2"
          >
            <FileText className="size-4" />
            TSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("json")}
            className="gap-2"
          >
            <FileJson className="size-4" />
            JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
