"use client";
/**
 * FILE:    frontend/src/lib/utils/index.ts
 * PURPOSE: Shared utilities — className merging, formatting, helpers
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely — use everywhere instead of raw className strings. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a numeric price as currency string. */
export function formatPrice(
  price: string | number,
  currency = "USD"
): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style:                 "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format area in square metres with thousands separator. */
export function formatArea(sqm: string | number): string {
  const n = typeof sqm === "string" ? parseFloat(sqm) : sqm;
  return `${n.toLocaleString()} m²`;
}

/** Human-readable relative time — "3 days ago", "just now", etc. */
export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units: [string, number][] = [
    ["year",   31_536_000],
    ["month",   2_592_000],
    ["day",        86_400],
    ["hour",        3_600],
    ["minute",         60],
  ];
  for (const [label, threshold] of units) {
    const count = Math.floor(seconds / threshold);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/** Tailwind classes for each property status badge. */
export function statusBadgeClass(status: string): string {
  return {
    available:   "text-emerald-700 bg-emerald-50 border-emerald-200",
    rented:      "text-amber-700   bg-amber-50   border-amber-200",
    sold:        "text-red-700     bg-red-50     border-red-200",
    maintenance: "text-gray-600   bg-gray-100   border-gray-200",
  }[status] ?? "text-gray-600 bg-gray-100 border-gray-200";
}

/** Tailwind classes for HTTP method badges in the audit log. */
export function methodBadgeClass(method: string): string {
  return {
    GET:    "text-blue-700   bg-blue-50",
    POST:   "text-green-700  bg-green-50",
    PATCH:  "text-amber-700  bg-amber-50",
    PUT:    "text-amber-700  bg-amber-50",
    DELETE: "text-red-700    bg-red-50",
  }[method.toUpperCase()] ?? "text-gray-600 bg-gray-100";
}

/** Truncate a string to a max length, appending ellipsis. */
export function truncate(str: string, max = 120): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Capitalise the first letter of a string. */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Build a query string from a flat object (undefined values omitted). */
export function buildQueryString(params: Record<string, unknown>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}