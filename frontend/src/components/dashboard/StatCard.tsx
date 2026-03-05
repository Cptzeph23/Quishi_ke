"use client";
/**
 * FILE:    StatCard.tsx
 * PURPOSE: Reusable metric card — icon, value, label, optional trend badge
 */
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label:      string;
  value:      string | number;
  icon:       LucideIcon;
  color?:     string;
  trend?:     { value: number; label: string };
  className?: string;
}

export function StatCard({
  label, value, icon: Icon,
  color = "bg-brand-50 text-brand-500",
  trend, className,
}: StatCardProps) {
  return (
    <div className={cn("card p-5 flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend.value >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}