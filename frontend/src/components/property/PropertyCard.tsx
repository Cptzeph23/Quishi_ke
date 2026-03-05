"use client";
/**
 * FILE:    frontend/src/components/property/PropertyCard.tsx
 * PURPOSE: Property summary card for listing grids
 */
import Image from "next/image";
import Link from "next/link";
import { Heart, Bed, Bath, Maximize2, MapPin } from "lucide-react";
import { cn, formatPrice, formatArea, statusBadgeClass, capitalize } from "@/lib/utils";
import { useSaveProperty } from "@/lib/hooks/useProperties";
import type { PropertySummary } from "@/lib/types";

interface PropertyCardProps {
  property:  PropertySummary;
  isSaved?:  boolean;
  className?: string;
}

export function PropertyCard({ property, isSaved = false, className }: PropertyCardProps) {
  const { mutate: toggleSave, isPending } = useSaveProperty();

  return (
    <article
      className={cn(
        "card-hover group flex flex-col",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {property.primary_image ? (
          <Image
            src={property.primary_image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-4xl">🏠</span>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Status badge */}
        <span className={cn(
          "badge absolute top-3 left-3 capitalize backdrop-blur-sm bg-white/90",
          statusBadgeClass(property.status)
        )}>
          {property.status}
        </span>

        {/* Save button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSave({ id: property.id, saved: isSaved });
          }}
          disabled={isPending}
          aria-label={isSaved ? "Unsave property" : "Save property"}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
            "backdrop-blur-sm transition-all duration-200",
            isSaved
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500"
          )}
        >
          <Heart size={14} className={isSaved ? "fill-current" : ""} />
        </button>

        {/* Featured ribbon */}
        {property.is_featured && (
          <span className="absolute bottom-3 left-3 text-xs font-semibold px-2 py-1
                           rounded-md bg-amber-400/95 text-amber-900">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <Link href={`/properties/${property.id}`} className="flex flex-col flex-1 p-4">
        {/* Type + Price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
            {property.property_type}
          </span>
          <div className="text-right shrink-0">
            <p className="text-base font-semibold text-gray-900 leading-tight">
              {formatPrice(property.price, "KES")}
            </p>
            {property.price_per_sqm && (
              <p className="text-xs text-gray-400">
                {formatPrice(property.price_per_sqm, "KES")}/m²
              </p>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5
                       line-clamp-2 group-hover:text-brand-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-auto flex items-center gap-4 pt-3 border-t border-gray-100
                        text-xs text-gray-500">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={12} />
              {property.bedrooms} {property.bedrooms === 1 ? "bed" : "beds"}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath size={12} />
            {property.bathrooms} {property.bathrooms === 1 ? "bath" : "baths"}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={12} />
            {formatArea(property.area_sqm)}
          </span>
        </div>
      </Link>
    </article>
  );
}