"use client";
/**
 * FILE:    frontend/src/components/property/PropertyMap.tsx
 * PURPOSE: Property location map using OpenStreetMap iframe embed.
 *          Zero npm dependencies — no leaflet package required.
 *          Falls back to a placeholder if no coordinates are set.
 */
import { MapPin, ExternalLink } from "lucide-react";

interface PropertyMapProps {
  latitude:  number;
  longitude: number;
  title:     string;
  address:   string;
}

export function PropertyMap({ latitude, longitude, title, address }: PropertyMapProps) {
  const zoom      = 15;
  const bbox      = 0.01; // ~1km bounding box
  const embedUrl  =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${longitude - bbox}%2C${latitude - bbox}%2C${longitude + bbox}%2C${latitude + bbox}` +
    `&layer=mapnik` +
    `&marker=${latitude}%2C${longitude}`;

  const linkUrl =
    `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;

  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[#E8E4DC] shadow-card">
        <iframe
          src={embedUrl}
          title={`Map showing location of ${title}`}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          aria-label={`Map for ${address}`}
        />
      </div>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-brand-600
                   hover:text-brand-700 font-medium transition-colors"
      >
        <ExternalLink size={11} />
        View larger map on OpenStreetMap
      </a>
    </div>
  );
}

/** Shown when a property has no coordinates yet */
export function MapPlaceholder({ address }: { address: string }) {
  return (
    <div className="w-full h-48 rounded-2xl border border-[#E8E4DC] bg-gray-50
                    flex flex-col items-center justify-center gap-2 text-gray-400">
      <MapPin size={28} className="text-gray-300" />
      <p className="text-sm font-medium text-gray-500">Location not pinned yet</p>
      <p className="text-xs text-gray-400 max-w-xs text-center px-4">{address}</p>
    </div>
  );
}