"use client";
/**
 * FILE:    frontend/src/components/ui/Skeleton.tsx
 * PURPOSE: Animated skeleton placeholders for loading states
 */
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "animate-pulse rounded-xl bg-gray-100",
      className
    )} />
  );
}

/** Full property card skeleton */
export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Property grid skeleton — matches the listing page */
export function PropertyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Property detail page skeleton */
export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="aspect-[16/9] rounded-2xl w-full" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
          <div className="card space-y-2 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/** Dashboard stats row skeleton */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(count, 4)} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/60">
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}