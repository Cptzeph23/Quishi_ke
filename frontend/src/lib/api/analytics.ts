"use client";
/**
 * FILE:    frontend/src/lib/api/analytics.ts
 * PURPOSE: Admin analytics — dashboard stats, property charts, audit log
 */
import { api } from "./client";
import type { DashboardStats, PropertyStats, Paginated, AuditLogEntry } from "@/lib/types";

export const analyticsApi = {
  dashboard: () =>
    api.get<DashboardStats>("/analytics/dashboard/").then((r) => r.data),

  propertyStats: () =>
    api.get<PropertyStats>("/analytics/properties/").then((r) => r.data),

  auditLogs: (params?: {
    method?:      string;
    path?:        string;
    status_code?: number;
    page?:        number;
  }) =>
    api.get<Paginated<AuditLogEntry>>("/analytics/audit-logs/", { params })
       .then((r) => r.data),
};