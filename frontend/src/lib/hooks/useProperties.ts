/**
 * FILE:    frontend/src/lib/hooks/useProperties.ts
 * PURPOSE: TanStack Query hooks for property listing, detail, featured, saved
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { propertiesApi } from "@/lib/api/properties";
import { useFilterStore } from "@/store/filterStore";
import type { PropertyFilters } from "@/lib/types";

// ── Keys ──────────────────────────────────────────────────────────────────────
export const propertyKeys = {
  all:      ["properties"]                          as const,
  list:     (f: PropertyFilters) => ["properties", "list",     f] as const,
  detail:   (id: string)         => ["properties", "detail",   id] as const,
  featured: ()                   => ["properties", "featured"]    as const,
  saved:    ()                   => ["properties", "saved"]       as const,
  amenities:()                   => ["amenities"]                 as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────
export function useProperties(filters?: PropertyFilters) {
  const storeFilters = useFilterStore((s) => s.filters);
  const active = filters ?? storeFilters;

  return useQuery({
    queryKey: propertyKeys.list(active),
    queryFn:  () => propertiesApi.list(active),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn:  () => propertiesApi.get(id),
    enabled:  !!id,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: propertyKeys.featured(),
    queryFn:  propertiesApi.featured,
    staleTime: 5 * 60_000,
  });
}

export function useSavedProperties() {
  return useQuery({
    queryKey: propertyKeys.saved(),
    queryFn:  propertiesApi.saved,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: propertyKeys.amenities(),
    queryFn:  propertiesApi.amenities,
    staleTime: Infinity,   // amenities rarely change
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export function useSaveProperty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? propertiesApi.unsave(id) : propertiesApi.save(id),
    onSuccess: (_, { saved }) => {
      toast.success(saved ? "Removed from saved" : "Saved!");
      qc.invalidateQueries({ queryKey: propertyKeys.saved() });
    },
    onError: () => toast.error("Please sign in to save properties."),
  });
}