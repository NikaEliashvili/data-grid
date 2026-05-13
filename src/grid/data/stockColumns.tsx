import type { GridColumnDef } from "@/grid/types";
import type { StockRow } from "@/grid/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fmt } from "./utils";
import { ChangeCell } from "./ChangeCell";
import { BarCell } from "./BarCell";
import { SignalBadge } from "./SignalBadge";
import { StatusBadge } from "./StatusBadge";
import { filterFns } from "../engine/filterFunctions";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

// If U need select checkbox then u have to add column with id = "checkbox"
// Example:
// {
//   id: "checkbox",
//   enableSorting: false,
//   enableHiding: false,
//   size: 40,
//   header: () => null,
//   cell: () => null,
// }

export const STOCK_COLUMNS: GridColumnDef<StockRow>[] = [
  {
    id: "isActive",
    accessorKey: "isActive",
    enableSorting: false,
    enableHiding: true,
    size: 100,
    header: "Status",
    meta: {
      type: "boolean",
      filterable: true,
      filterType: "checkbox",
      groupable: true,
      minWidth: 100,
    },
    cell: ({ getValue }) => (
      <div className="font-mono font-semibold text-sm tracking-wide flex items-center justify-center w-full ">
        {getValue<string>() ? (
          <Checkbox checked={true} readOnly />
        ) : (
          <Checkbox checked={false} readOnly />
        )}
      </div>
    ),
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
    size: 90,
    meta: {
      type: "string",
      filterable: true,
      filterType: "text",
      groupable: true,
      minWidth: 70,
    },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-sm tracking-wide">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    size: 180,
    meta: {
      type: "string",
      filterable: true,
      filterType: "text",
      minWidth: 120,
    },
    cell: ({ getValue }) => (
      <span className="truncate block max-w-40 text-sm">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "sector",
    header: "Sector",
    size: 160,
    filterFn: filterFns.multiSelect,
    meta: {
      type: "string",
      filterable: true,
      filterType: "multiselect",
      groupable: true,
      minWidth: 100,
      filterOptions: [
        "Technology",
        "Healthcare",
        "Finance",
        "Energy",
        "Consumer Discretionary",
        "Industrials",
        "Materials",
        "Real Estate",
        "Utilities",
        "Communication Services",
      ].map((s) => ({ label: s, value: s })),
    },
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="text-xs font-normal">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: "exchange",
    header: "Exchange",
    size: 90,
    meta: {
      type: "string",
      filterable: true,
      filterType: "select",
      groupable: true,
      minWidth: 70,
      filterOptions: ["NASDAQ", "NYSE", "LSE", "TSX", "ASX", "HKEX"].map(
        (s) => ({ label: s, value: s }),
      ),
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 100,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 80,
      format: (v) => fmt.currency(Number(v)),
      conditions: [
        {
          operator: "gt",
          value: 500,
          className: "text-blue-600 dark:text-blue-400 font-semibold",
        },
        { operator: "lt", value: 20, className: "text-muted-foreground" },
      ],
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums font-medium">
        {fmt.currency(getValue<number>())}
      </span>
    ),
  },
  {
    id: "change",
    accessorFn: (row) => row.change,
    header: "Change",
    filterFn: filterFns.comparison,
    size: 170,
    meta: {
      type: "number",
      filterable: true,
      filterType: "comparison",
      minWidth: 140,
    },
    cell: ({ row }) => (
      <ChangeCell change={row.original.change} pct={row.original.changePct} />
    ),
  },
  {
    accessorKey: "open",
    header: "Open",
    size: 90,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 70,
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{fmt.currency(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "high",
    header: "High",
    size: 90,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 70,
      conditions: [
        {
          operator: "gt",
          value: 500,
          className: "text-emerald-600 dark:text-emerald-400 font-medium",
        },
      ],
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
        {fmt.currency(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "low",
    header: "Low",
    size: 90,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 70,
      conditions: [
        {
          operator: "lt",
          value: 20,
          className: "text-red-600 dark:text-red-400 font-medium",
        },
      ],
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums text-red-600 dark:text-red-400">
        {fmt.currency(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "volume",
    header: "Volume",
    size: 160,
    meta: {
      type: "number",
      filterable: true,
      filterType: "range",
      minWidth: 120,
    },
    cell: ({ getValue }) => (
      <BarCell
        value={getValue<number>()}
        max={50000000}
        colorClass="bg-blue-500"
      />
    ),
  },
  {
    accessorKey: "marketCap",
    header: "Market Cap",
    size: 130,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 100,
      format: (v) => fmt.compact(Number(v)),
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums font-medium">
        {fmt.compact(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "peRatio",
    header: "P/E Ratio",
    size: 90,
    meta: {
      type: "number",
      filterable: true,
      filterType: "range",
      minWidth: 70,
      conditions: [
        {
          operator: "gt",
          value: 50,
          className: "text-red-600 dark:text-red-400 font-medium",
        },
        {
          operator: "lt",
          value: 10,
          className: "text-emerald-600 dark:text-emerald-400 font-medium",
        },
      ],
    },
    cell: ({ getValue, column }) => {
      const val = getValue<number>();
      const conds =
        (column.columnDef.meta as GridColumnDef<StockRow>["meta"])
          ?.conditions ?? [];
      const cls =
        conds.find((c) => {
          if (c.operator === "gt") return val > Number(c.value);
          if (c.operator === "lt") return val < Number(c.value);
          return false;
        })?.className ?? "";
      return <span className={cn("tabular-nums", cls)}>{fmt.number(val)}</span>;
    },
  },
  {
    accessorKey: "eps",
    header: "EPS",
    size: 80,
    meta: {
      type: "number",
      filterable: true,
      filterType: "range",
      minWidth: 60,
      conditions: [
        {
          operator: "lt",
          value: 0,
          className: "text-red-600 dark:text-red-400",
        },
        {
          operator: "gte",
          value: 0,
          className: "text-emerald-600 dark:text-emerald-400",
        },
      ],
    },
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return (
        <span
          className={cn(
            "tabular-nums",
            val < 0
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {fmt.number(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "dividendYield",
    header: "Div Yield",
    size: 90,
    meta: {
      type: "percent",
      filterable: true,
      filterType: "range",
      minWidth: 70,
    },
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return (
        <span
          className={cn(
            "tabular-nums",
            val > 5
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "",
          )}
        >
          {fmt.percent(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "beta",
    header: "Beta",
    size: 70,
    meta: {
      type: "number",
      filterable: true,
      filterType: "range",
      minWidth: 60,
      conditions: [
        {
          operator: "gt",
          value: 2,
          className: "text-red-600 dark:text-red-400 font-semibold",
        },
        {
          operator: "lt",
          value: 0.5,
          className: "text-blue-600 dark:text-blue-400",
        },
      ],
    },
    cell: ({ getValue }) => {
      const val = getValue<number>();
      const cls =
        val > 2
          ? "text-red-600 dark:text-red-400 font-semibold"
          : val < 0.5
            ? "text-blue-600 dark:text-blue-400"
            : "";
      return <span className={cn("tabular-nums", cls)}>{fmt.number(val)}</span>;
    },
  },
  {
    accessorKey: "roe",
    header: "ROE %",
    size: 80,
    meta: {
      type: "percent",
      filterable: true,
      filterType: "range",
      minWidth: 60,
      conditions: [
        {
          operator: "gt",
          value: 20,
          className: "text-emerald-600 dark:text-emerald-400 font-semibold",
        },
        {
          operator: "lt",
          value: 0,
          className: "text-red-600 dark:text-red-400",
        },
      ],
    },
    cell: ({ getValue }) => {
      const val = getValue<number>();
      const cls =
        val > 20
          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
          : val < 0
            ? "text-red-600 dark:text-red-400"
            : "";
      return (
        <span className={cn("tabular-nums", cls)}>{fmt.percent(val)}</span>
      );
    },
  },
  {
    accessorKey: "debtToEquity",
    header: "D/E",
    size: 70,
    meta: {
      type: "number",
      filterable: true,
      filterType: "range",
      minWidth: 60,
      conditions: [
        {
          operator: "gt",
          value: 2,
          className: "text-red-600 dark:text-red-400 font-semibold",
        },
      ],
    },
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return (
        <span
          className={cn(
            "tabular-nums",
            val > 2 ? "text-red-600 dark:text-red-400 font-semibold" : "",
          )}
        >
          {fmt.number(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "signal",
    header: "Signal",
    size: 90,
    meta: {
      type: "badge",
      filterable: true,
      filterType: "select",
      groupable: true,
      minWidth: 70,
      filterOptions: ["buy", "hold", "sell", "neutral"].map((s) => ({
        label: s.toUpperCase(),
        value: s,
      })),
    },
    cell: ({ getValue }) => (
      <SignalBadge value={getValue<StockRow["signal"]>()} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 90,
    meta: {
      type: "badge",
      filterable: true,
      filterType: "select",
      groupable: true,
      minWidth: 70,
      filterOptions: ["active", "halted", "delisted"].map((s) => ({
        label: s.charAt(0).toUpperCase() + s.slice(1),
        value: s,
      })),
    },
    cell: ({ getValue }) => (
      <StatusBadge value={getValue<StockRow["status"]>()} />
    ),
  },
  {
    accessorKey: "week52High",
    header: "52W High",
    size: 95,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 70,
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{fmt.currency(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "week52Low",
    header: "52W Low",
    size: 95,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 70,
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{fmt.currency(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    size: 110,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 80,
    },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{fmt.compact(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "netIncome",
    header: "Net Income",
    size: 110,
    meta: {
      type: "currency",
      filterable: true,
      filterType: "range",
      minWidth: 80,
      conditions: [
        {
          operator: "lt",
          value: 0,
          className: "text-red-600 dark:text-red-400",
        },
        {
          operator: "gte",
          value: 0,
          className: "text-emerald-600 dark:text-emerald-400",
        },
      ],
    },
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return (
        <span
          className={cn(
            "tabular-nums",
            val < 0
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {fmt.compact(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    size: 80,
    meta: {
      type: "string",
      filterable: true,
      filterType: "select",
      groupable: true,
      minWidth: 60,
      filterOptions: ["US", "UK", "CA", "AU", "HK", "JP", "DE", "FR"].map(
        (s) => ({ label: s, value: s }),
      ),
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Updated",
    size: 150,
    meta: { type: "date", filterable: true, filterType: "date", minWidth: 120 },
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(getValue<string>()), "dd/MM/yyyy HH:mm:ss")}
      </span>
    ),
  },
];
