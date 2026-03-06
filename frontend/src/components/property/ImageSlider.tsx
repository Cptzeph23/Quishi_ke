"use client";
/**
 * FILE:    frontend/src/components/property/ImageSlider.tsx
 * PURPOSE: Full-featured image slider — auto-advances every 4s, arrow nav,
 *          dot indicators, thumbnail strip, keyboard support.
 */
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/lib/types";

interface ImageSliderProps {
  images:      PropertyImage[];
  title:       string;
  autoPlay?:   boolean;
  interval?:   number; // ms, default 4000
  className?:  string;
  /** Extra overlay content (badges, buttons) rendered top-left / top-right */
  overlayLeft?:  React.ReactNode;
  overlayRight?: React.ReactNode;
}

export function ImageSlider({
  images,
  title,
  autoPlay  = true,
  interval  = 4000,
  className,
  overlayLeft,
  overlayRight,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const total = images.length;

  const prev = useCallback(() =>
    setCurrent((i) => (i - 1 + total) % total), [total]);

  const next = useCallback(() =>
    setCurrent((i) => (i + 1) % total), [total]);

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || paused || total <= 1) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [autoPlay, paused, next, interval, total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  if (total === 0) {
    return (
      <div className={cn(
        "relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 shadow-card",
        "flex items-center justify-center",
        className
      )}>
        <span className="text-7xl">🏠</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main slider */}
      <div
        className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shadow-card group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Images — crossfade */}
        {images.map((img, i) => (
          <div
            key={img.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <Image
              src={img.image}
              alt={img.alt_text || title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>
        ))}

        {/* Gradient overlay bottom — for dots legibility */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t
                        from-black/50 to-transparent z-20 pointer-events-none" />

        {/* Overlay slots */}
        {overlayLeft && (
          <div className="absolute top-4 left-4 z-30 flex gap-2">{overlayLeft}</div>
        )}
        {overlayRight && (
          <div className="absolute top-4 right-4 z-30 flex gap-2">{overlayRight}</div>
        )}

        {/* Arrow buttons — visible on hover */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30
                         w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                         flex items-center justify-center text-white
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-black/60"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30
                         w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                         flex items-center justify-center text-white
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-black/60"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30
                          flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}

        {/* Image counter badge */}
        {total > 1 && (
          <div className="absolute bottom-4 right-4 z-30 px-2.5 py-1 rounded-full
                          bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
            {current + 1} / {total}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0",
                "border-2 transition-all duration-150",
                i === current
                  ? "border-brand-500 opacity-100 scale-105 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-90"
              )}
            >
              <Image
                src={img.thumbnail || img.image}
                alt={img.alt_text || ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}