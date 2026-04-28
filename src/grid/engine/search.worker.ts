import { matchSorter } from "match-sorter";
import type { StockRow } from "@/grid/types";

// Worker უსმენს შეტყობინებებს მთავარი ნაკადიდან
self.onmessage = (
  event: MessageEvent<{ data: StockRow[]; searchTerm: string; keys: string[] }>,
) => {
  const { data, searchTerm, keys } = event.data;

  if (!searchTerm) {
    self.postMessage(data);
    return;
  }

  // matchSorter არის იდეალური Worker-ში გამოსაყენებლად.
  // ის გადაურბენს მთლიან ობიექტს და დააბრუნებს გაფილტრულ/დალაგებულ მასივს.
  // keys მასივში მიუთითე ის ველები, რომლებშიც გინდა ძებნა მოხდეს.
  const filteredData = matchSorter(data, searchTerm.toLowerCase(), {
    keys: keys || ["name", "symbol", "industry", "sector"], // ჩაანაცვლე შენი რეალური ველებით
  });

  // ვაბრუნებთ გაფილტრულ მონაცემებს მთავარ ნაკადში
  self.postMessage(filteredData);
};
