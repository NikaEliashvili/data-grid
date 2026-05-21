import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { GridStore, GridDensity } from "@/grid/types";
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  GroupingState,
  ExpandedState,
} from "@tanstack/react-table";

const DEFAULT_PAGE_SIZE = 50;

const initialState = {
  globalFilter: "",
  columnFilters: [] as ColumnFiltersState,
  sorting: [] as SortingState,
  columnVisibility: {} as VisibilityState,
  rowSelection: {} as RowSelectionState,
  pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE } as PaginationState,
  grouping: [] as GroupingState,
  expanded: {} as ExpandedState,
  columnOrder: [] as string[],
  density: "comfortable" as GridDensity,
};

export const useGridStore = create<GridStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setGlobalFilter: (value) =>
      set((prev) => ({
        globalFilter: value,
        pagination: { ...prev.pagination, pageIndex: 0 },
      })),

    setColumnFilters: (filters) => {
      return set((prev) => ({
        columnFilters: filters,
        pagination: { ...prev.pagination, pageIndex: 0 },
      }));
    },

    setSorting: (sorting) => set({ sorting }),

    setColumnVisibility: (visibility) => set({ columnVisibility: visibility }),

    setRowSelection: (selection) => set({ rowSelection: selection }),

    setPagination: (pagination) => set({ pagination }),

    setGrouping: (grouping) => set({ grouping }),

    setExpanded: (expanded) => set({ expanded }),

    setColumnOrder: (order) => set({ columnOrder: order }),

    setDensity: (density) => set({ density }),

    resetAll: () => set({ ...initialState }),
  })),
);
