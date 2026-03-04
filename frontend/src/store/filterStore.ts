/**
 * FILE:    frontend/src/store/filterStore.ts
 * PURPOSE: Global property search filter state.
 *          FilterBar component writes here; PropertyList reads from here.
 */
import { create } from "zustand";
import type { PropertyFilters } from "@/lib/types";

interface FilterState {
  filters: PropertyFilters;

  /** Merge partial updates (always resets page to 1). */
  setFilters:   (f: Partial<PropertyFilters>) => void;

  /** Set page without resetting other filters. */
  setPage:      (page: number) => void;

  /** Reset to defaults. */
  resetFilters: () => void;
}

const DEFAULTS: PropertyFilters = {
  status:   "available",
  ordering: "-created_at",
  page:     1,
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: { ...DEFAULTS },

  setFilters: (f) =>
    set((s) => ({ filters: { ...s.filters, ...f, page: 1 } })),

  setPage: (page) =>
    set((s) => ({ filters: { ...s.filters, page } })),

  resetFilters: () =>
    set({ filters: { ...DEFAULTS } }),
}));