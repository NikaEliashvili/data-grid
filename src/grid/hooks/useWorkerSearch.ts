import { useState, useEffect, useRef } from "react";
import type { SearchableKeys, WorkerFilterDef } from "../engine/types";

export function useWorkerSearch<TData>(
  initialData: TData[],
  globalFilter: string,
  columnFilters: WorkerFilterDef[],
  keys: SearchableKeys<TData>[],
) {
  const [filteredData, setFilteredData] = useState<TData[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../engine/search.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (event: MessageEvent<TData[]>) => {
      setFilteredData(event.data);
      setIsSearching(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Send initial dataset
  useEffect(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({
      type: "init",
      data: initialData,
      keys,
    });
  }, [initialData, keys]);

  // Dispatch search query whenever filters change
  useEffect(() => {
    if (!workerRef.current) return;
    setIsSearching(true);

    workerRef.current.postMessage({
      type: "filter",
      globalFilter,
      columnFilters,
    });
  }, [globalFilter, columnFilters]); // Depend on BOTH global and column filters

  return { filteredData, isSearching };
}
