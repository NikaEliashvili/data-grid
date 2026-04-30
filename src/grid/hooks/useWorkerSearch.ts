import { useState, useEffect, useRef } from "react";

export function useWorkerSearch<TData>(
  initialData: TData[],
  searchTerm: string,
  keys: string[],
) {
  const [filteredData, setFilteredData] = useState<TData[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  // init worker once
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../engine/search.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (event) => {
      setFilteredData(event.data);
      setIsSearching(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // send dataset once (or when it actually changes)
  useEffect(() => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({
      type: "init",
      data: initialData,
      keys,
    });
  }, [initialData, keys]);

  // search (debounced)
  useEffect(() => {
    if (!workerRef.current) return;

    setIsSearching(true);

    workerRef.current.postMessage({
      type: "search",
      searchTerm: searchTerm,
    });
  }, [searchTerm]);

  return { filteredData, isSearching };
}
