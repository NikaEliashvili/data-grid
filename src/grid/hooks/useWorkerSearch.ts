import { useState, useEffect, useRef } from "react";
import type { SearchableKeys, WorkerFilterDef } from "../engine/types";

const WORKER_COUNT =
  typeof navigator !== "undefined" && navigator.hardwareConcurrency
    ? Math.min(navigator.hardwareConcurrency, 8)
    : 4;

export function useWorkerSearch<TData>(
  initialData: TData[],
  globalFilter: string,
  columnFilters: WorkerFilterDef[],
  keys: SearchableKeys<TData>[],
) {
  const [filteredData, setFilteredData] = useState<TData[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);

  const workersRef = useRef<Worker[]>([]);
  const queryIdRef = useRef<number>(0);

  // Initialize Worker Pool (Already excellent: correctly terminates on unmount)
  useEffect(() => {
    const workers = Array.from(
      { length: WORKER_COUNT },
      () =>
        new Worker(new URL("../engine/search.worker.ts", import.meta.url), {
          type: "module",
        }),
    );

    workersRef.current = workers;

    return () => {
      workers.forEach((worker) => worker.terminate());
      workersRef.current = [];
    };
  }, []);

  // Chunk and distribute initial dataset
  useEffect(() => {
    if (!workersRef.current.length || !initialData.length) return;

    const chunkSize = Math.ceil(initialData.length / WORKER_COUNT);

    workersRef.current.forEach((worker, index) => {
      const chunk = initialData.slice(
        index * chunkSize,
        (index + 1) * chunkSize,
      );
      worker.postMessage({
        type: "init",
        data: chunk,
        keys,
      });
    });

    setFilteredData(initialData);
  }, [initialData, keys]);

  // Dispatch search query to all workers
  useEffect(() => {
    if (!workersRef.current.length) return;

    // 1. Create a flag to track if this specific effect run is still valid
    let isMounted = true;
    setIsSearching(true);

    const currentQueryId = ++queryIdRef.current;

    let pendingWorkers = WORKER_COUNT;
    let accumulatedResults: TData[] = [];

    const handleMessage = (event: MessageEvent) => {
      // 2. Bail out immediately if this effect has been cleaned up
      if (!isMounted) return;

      const { type, queryId, data } = event.data;

      if (type !== "filter_result" || queryId !== currentQueryId) return;

      accumulatedResults = accumulatedResults.concat(data);
      pendingWorkers--;

      if (pendingWorkers === 0) {
        setFilteredData(accumulatedResults);
        setIsSearching(false);
      }
    };

    workersRef.current.forEach((worker) => {
      worker.onmessage = handleMessage;
      worker.postMessage({
        type: "filter",
        queryId: currentQueryId,
        globalFilter,
        columnFilters,
      });
    });

    // 3. The Cleanup Function
    return () => {
      // Mark this effect as stale so any late-arriving messages are ignored
      isMounted = false;

      // Nullify the onmessage handler to immediately release the closure
      // to the Garbage Collector, preventing memory buildup on rapid typing
      workersRef.current.forEach((worker) => {
        worker.onmessage = null;
      });
    };
  }, [globalFilter, columnFilters]);

  return { filteredData, isSearching };
}
