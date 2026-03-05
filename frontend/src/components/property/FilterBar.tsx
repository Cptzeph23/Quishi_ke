"use client";
/**
 * FILE:    frontend/src/components/property/FilterBar.tsx
 * PURPOSE: Collapsible filter panel for the property listing page.
 *          Syncs with filterStore — changes trigger re-fetch via useProperties.
 */
import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/filterStore";
import { useAmenities } from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/Button";

const PROPERTY_TYPES = [
  { value: "",           label: "Any type"   },
  { value: "apartment",  label: "Apartment"  },
  { value: "house",      label: "House"      },
  { value: "studio",     label: "Studio"     },
  { value: "penthouse",  label: "Penthouse"  },
  { value: "office",     label: "Office"     },
  { value: "land",       label: "Land"       },
];

const BEDROOM_OPTIONS = [
  { value: "",  label: "Any" },
  { value: "1", label: "1"   },
  { value: "2", label: "2"   },
  { value: "3", label: "3"   },
  { value: "4", label: "4+"  },
];

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first"     },
  { value: "created_at",  label: "Oldest first"     },
  { value: "price",       label: "Price: low → high" },
  { value: "-price",      label: "Price: high → low" },
];

export function FilterBar() {
  const [open, setOpen] = useState(false);
  const { filters, setFilters, resetFilters } = useFilterStore();
  const { data: amenities = [] } = useAmenities();

  const activeCount = [
    filters.property_type,
    filters.min_price,
    filters.max_price,
    filters.min_beds,
    filters.city,
    filters.amenities,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden shadow-card">

      {/* Top bar — always visible */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">

        {/* Search by city */}
        <input
          type="text"
          placeholder="Search by city or neighbourhood…"
          value={filters.city ?? ""}
          onChange={(e) => setFilters({ city: e.target.value || undefined })}
          className="input flex-1 min-w-[180px] h-9 text-sm"
        />

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.ordering ?? "-created_at"}
            onChange={(e) => setFilters({ ordering: e.target.value as any })}
            className="input h-9 text-sm pr-8 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-gray-400 pointer-events-none" />
        </div>

        {/* Filters toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          leftIcon={<SlidersHorizontal size={14} />}
          className="gap-2 whitespace-nowrap"
        >
          Filters
          {activeCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-brand-500 text-white
                             text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            leftIcon={<X size={13} />}
            className="text-gray-400 hover:text-red-500"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="border-t border-[#E8E4DC] px-4 py-4 grid grid-cols-2
                        sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">

          {/* Property type */}
          <div>
            <label className="label">Type</label>
            <div className="relative">
              <select
                value={filters.property_type ?? ""}
                onChange={(e) => setFilters({ property_type: e.target.value as any || undefined })}
                className="input text-sm appearance-none cursor-pointer pr-8"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2
                                                text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="label">Bedrooms</label>
            <div className="flex gap-1">
              {BEDROOM_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFilters({ min_beds: o.value ? Number(o.value) : undefined })}
                  className={cn(
                    "flex-1 h-9 rounded-lg text-xs font-medium border transition-colors",
                    (filters.min_beds?.toString() ?? "") === o.value
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min price */}
          <div>
            <label className="label">Min price (KES)</label>
            <input
              type="number"
              placeholder="e.g. 50,000"
              value={filters.min_price ?? ""}
              onChange={(e) => setFilters({ min_price: e.target.value ? Number(e.target.value) : undefined })}
              className="input text-sm"
            />
          </div>

          {/* Max price */}
          <div>
            <label className="label">Max price (KES)</label>
            <input
              type="number"
              placeholder="e.g. 500,000"
              value={filters.max_price ?? ""}
              onChange={(e) => setFilters({ max_price: e.target.value ? Number(e.target.value) : undefined })}
              className="input text-sm"
            />
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-5">
              <label className="label">Amenities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {amenities.map((a) => {
                  const selected = filters.amenities?.includes(String(a.id));
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        const current = filters.amenities?.split(",").filter(Boolean) ?? [];
                        const id = String(a.id);
                        const next = selected
                          ? current.filter((x) => x !== id)
                          : [...current, id];
                        setFilters({ amenities: next.length ? next.join(",") : undefined });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        selected
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                      )}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}