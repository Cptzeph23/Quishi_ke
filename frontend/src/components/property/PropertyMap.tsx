"use client";
/**
 * FILE:    frontend/src/components/property/PropertyMap.tsx
 * PURPOSE: Leaflet map embed for a property location. Uses OpenStreetMap tiles
 *          (no API key required). Falls back to a static placeholder if no
 *          coordinates are available.
 */
import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  latitude:  number;
  longitude: number;
  title:     string;
  address:   string;
}

export function PropertyMap({ latitude, longitude, title, address }: PropertyMapProps) {
  const mapRef       = useRef<HTMLDivElement>(null);
  const mapInstance  = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center:          [latitude, longitude],
        zoom:            15,
        scrollWheelZoom: false,
        zoomControl:     true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;max-width:200px">
             <strong style="font-size:13px">${title}</strong>
             <p style="margin:4px 0 0;font-size:12px;color:#666">${address}</p>
           </div>`,
          { maxWidth: 220 }
        )
        .openPopup();

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [latitude, longitude, title, address]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="w-full h-64 rounded-2xl overflow-hidden border border-[#E8E4DC] shadow-card z-0"
        aria-label={`Map showing location of ${title}`}
      />
    </>
  );
}

/** Shown when a property has no coordinates yet */
export function MapPlaceholder({ address }: { address: string }) {
  return (
    <div className="w-full h-48 rounded-2xl border border-[#E8E4DC] bg-gray-50
                    flex flex-col items-center justify-center gap-2 text-gray-400">
      <MapPin size={28} className="text-gray-300" />
      <p className="text-sm font-medium text-gray-500">Location not pinned yet</p>
      <p className="text-xs text-gray-400 max-w-xs text-center">{address}</p>
    </div>
  );
}