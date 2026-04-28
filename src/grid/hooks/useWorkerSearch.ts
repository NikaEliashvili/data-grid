import { useState, useEffect, useRef } from "react";
import type { StockRow } from "@/grid/types";

export function useWorkerSearch(
  initialData: StockRow[],
  searchTerm: string,
  keys: string[],
) {
  const [filteredData, setFilteredData] = useState<StockRow[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);

  // ვინახავთ Worker-ის რეფერენსს
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // ვაინიციალიზებთ Worker-ს Vite-ის სპეციფიკური სინტაქსით (?worker)
    workerRef.current = new Worker(
      new URL("../engine/search.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (event) => {
      setFilteredData(event.data);
      setIsSearching(false);
    };

    return () => {
      workerRef.current?.terminate(); // ვასუფთავებთ მეხსიერებას კომპონენტის მოშლისას
    };
  }, []);

  useEffect(() => {
    if (workerRef.current && searchTerm.length > 0) {
      setIsSearching(true);
      // ვაგზავნით მონაცემებს Worker-ში
      workerRef.current.postMessage({ data: initialData, searchTerm, keys });
    }
  }, [initialData, keys, searchTerm]);

  return { filteredData, isSearching };
}
