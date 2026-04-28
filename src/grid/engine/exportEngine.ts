import type { Table } from "@tanstack/react-table"
import type { ExportOptions, CellPrimitive } from "@/grid/types"

export function exportTable<TData>(
  table: Table<TData>,
  options: ExportOptions
): void {
  const { format, filename = "export", selectedOnly = false, includeHidden = false } = options

  const columns = table.getAllLeafColumns().filter((col) => {
    if (col.id === "select" || col.id === "actions") return false
    if (!includeHidden && !col.getIsVisible()) return false
    return true
  })

  const rows = selectedOnly
    ? table.getSelectedRowModel().rows
    : table.getFilteredRowModel().rows

  const headers = columns.map((c) => String(c.columnDef.header ?? c.id))

  const body = rows.map((row) =>
    columns.map((col) => {
      const val = row.getValue<CellPrimitive>(col.id)
      return val == null ? "" : val
    })
  )

  switch (format) {
    case "csv":
      downloadText(toCSV(headers, body), `${filename}.csv`, "text/csv")
      break
    case "tsv":
      downloadText(toTSV(headers, body), `${filename}.tsv`, "text/tab-separated-values")
      break
    case "json":
      downloadText(toJSON(headers, body), `${filename}.json`, "application/json")
      break
  }
}

function toCSV(headers: string[], rows: CellPrimitive[][]): string {
  const escape = (v: CellPrimitive) => {
    const s = String(v ?? "")
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n")
}

function toTSV(headers: string[], rows: CellPrimitive[][]): string {
  return [headers.join("\t"), ...rows.map((r) => r.map((v) => String(v ?? "")).join("\t"))].join("\n")
}

function toJSON(headers: string[], rows: CellPrimitive[][]): string {
  const data = rows.map((r) =>
    Object.fromEntries(r.map((val, i) => [headers[i], val]))
  )
  return JSON.stringify(data, null, 2)
}

function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
