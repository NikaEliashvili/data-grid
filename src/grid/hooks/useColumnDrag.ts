import { useState, useCallback, useRef } from "react"
import type { Table } from "@tanstack/react-table"

export function useColumnDrag<TData>(table: Table<TData>) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const dragOriginOrder = useRef<string[]>([])

  const onDragStart = useCallback(
    (columnId: string) => {
      setDraggedId(columnId)
      dragOriginOrder.current = table.getState().columnOrder.length
        ? table.getState().columnOrder
        : table.getAllLeafColumns().map((c) => c.id)
    },
    [table]
  )

  const onDragOver = useCallback((columnId: string) => {
    setOverId(columnId)
  }, [])

  const onDrop = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) {
        setDraggedId(null)
        setOverId(null)
        return
      }
      const order = [...dragOriginOrder.current]
      const fromIdx = order.indexOf(draggedId)
      const toIdx = order.indexOf(targetId)
      if (fromIdx === -1 || toIdx === -1) return
      order.splice(fromIdx, 1)
      order.splice(toIdx, 0, draggedId)
      table.setColumnOrder(order)
      setDraggedId(null)
      setOverId(null)
    },
    [draggedId, table]
  )

  const onDragEnd = useCallback(() => {
    setDraggedId(null)
    setOverId(null)
  }, [])

  return { draggedId, overId, onDragStart, onDragOver, onDrop, onDragEnd }
}
