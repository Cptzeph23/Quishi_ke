"use client";
/**
 * FILE:    frontend/src/app/properties/page.tsx
 * PURPOSE: Main property listing page — filter bar, results grid, pagination
 */
import { Navbar } from "@/components/layout/Navbar";
import { FilterBar } from "@/components/property/FilterBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useProperties } from "@/lib/hooks/useProperties";
import { useFilterStore } from "@/store/filterStore";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import type { Metadata } from "next";

export default function PropertiesPage() {
  const { filters, setPage } = useFilterStore();
  const { data, isLoading, isError } = useProperties();

  const totalPages = data ? Math.ceil(data.count / 20) : 0;
  const currentPage = filters.page ?? 1;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="page-container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="heading-section">
            {data?.count != null
              ? `${data.count.toLocaleString()} Properties`
              : "Browse Properties"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Verified listings across Nairobi — updated daily.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <FilterBar />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-24 text-center">
            <SearchX size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Something went wrong.</p>
            <p className="text-gray-400 text-sm mt-1">Please try again later.</p>
          </div>
        ) : data?.results.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <SearchX size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-700 font-medium font-display text-lg">No properties found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters or searching a different area.
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data?.results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  leftIcon={<ChevronLeft size={14} />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-brand-500 text-white"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 7 && (
                    <span className="px-2 text-gray-400 text-sm">…</span>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  rightIcon={<ChevronRight size={14} />}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}