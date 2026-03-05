"use client";
/**
 * FILE:    frontend/src/app/dashboard/admin/page.tsx
 * PURPOSE: Admin dashboard — live platform stats, property breakdowns,
 *          user management table, audit log viewer.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Users, Eye, TrendingUp, Activity,
  ShieldCheck, FileText, ChevronLeft, ChevronRight,
  ExternalLink, RefreshCw,
} from "lucide-react";
import { Navbar }     from "@/components/layout/Navbar";
import { AuthGuard }  from "@/components/auth/AuthGuard";
import { StatCard }   from "@/components/dashboard/StatCard";
import { DataTable }  from "@/components/dashboard/DataTable";
import { Button }     from "@/components/ui/Button";
import { Spinner }    from "@/components/ui/Spinner";
import { analyticsApi } from "@/lib/api/analytics";
import { formatPrice, timeAgo, cn } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/types";

type Tab = "overview" | "properties" | "audit";

export default function AdminDashboard() {
  const [tab,       setTab]       = useState<Tab>("overview");
  const [auditPage, setAuditPage] = useState(1);

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn:  analyticsApi.dashboard,
  });

  const { data: propStats, isLoading: propLoading } = useQuery({
    queryKey: ["analytics", "properties"],
    queryFn:  analyticsApi.propertyStats,
    enabled:  tab === "properties",
  });

  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ["analytics", "audit", auditPage],
    queryFn:  () => analyticsApi.auditLogs({ page: auditPage }),
    enabled:  tab === "audit",
  });

  const totalAuditPages = audit ? Math.ceil(audit.count / 20) : 0;

  const statCards = stats ? [
    { label: "Total properties",     value: stats.total_properties,                 icon: Building2,  color: "bg-blue-50   text-blue-500"   },
    { label: "Available",            value: stats.available_properties,             icon: Building2,  color: "bg-green-50  text-green-500"  },
    { label: "Total users",          value: stats.total_users,                      icon: Users,      color: "bg-purple-50 text-purple-500" },
    { label: "Agents",               value: stats.total_agents,                     icon: Users,      color: "bg-amber-50  text-amber-500"  },
    { label: "Total views",          value: stats.total_views.toLocaleString(),     icon: Eye,        color: "bg-pink-50   text-pink-500"   },
    { label: "Average price",        value: formatPrice(stats.avg_price, "KES"),    icon: TrendingUp, color: "bg-teal-50   text-teal-500"   },
    { label: "API calls today",      value: stats.api_calls_today,                  icon: Activity,   color: "bg-orange-50 text-orange-500" },
    { label: "New users this month", value: stats.new_users_this_month,             icon: Users,      color: "bg-indigo-50 text-indigo-500" },
  ] : [];

  const auditColumns = [
    { key: "method", header: "Method", width: "w-20",
      render: (r: AuditLogEntry) => (
        <span className={cn("badge text-xs",
          r.method === "GET"    && "bg-blue-50  text-blue-600  border-blue-100",
          r.method === "POST"   && "bg-green-50 text-green-600 border-green-100",
          r.method === "PATCH"  && "bg-amber-50 text-amber-600 border-amber-100",
          r.method === "DELETE" && "bg-red-50   text-red-600   border-red-100",
        )}>{r.method}</span>
      ),
    },
    { key: "path", header: "Path",
      render: (r: AuditLogEntry) => (
        <span className="font-mono text-xs text-gray-600 truncate max-w-xs block">{r.path}</span>
      ),
    },
    { key: "status", header: "Status", width: "w-20",
      render: (r: AuditLogEntry) => (
        <span className={cn("badge text-xs",
          r.status_code < 300 && "bg-green-50 text-green-600 border-green-100",
          r.status_code >= 400 && "bg-red-50 text-red-600 border-red-100",
        )}>{r.status_code}</span>
      ),
    },
    { key: "user", header: "User",
      render: (r: AuditLogEntry) => (
        <span className="text-xs text-gray-500">{r.user ?? "anonymous"}</span>
      ),
    },
    { key: "duration", header: "Duration", width: "w-24",
      render: (r: AuditLogEntry) => (
        <span className="text-xs text-gray-400">{r.duration_ms != null ? `${r.duration_ms}ms` : "—"}</span>
      ),
    },
    { key: "time", header: "Time", width: "w-32",
      render: (r: AuditLogEntry) => (
        <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
      ),
    },
  ];

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="heading-section">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Platform overview and management.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw size={13} />}>Refresh</Button>
              <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={13} />}>Django Admin</Button>
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {(["overview","properties","audit"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors -mb-px",
                  tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
                )}>
                {t === "audit" ? "Audit log" : t}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            statsLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {statCards.map(({ label, value, icon, color }) => (
                    <StatCard key={label} label={label} value={value} icon={icon} color={color} />
                  ))}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-4">Quick links</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { href: "http://localhost:8000/admin/",     icon: ShieldCheck, label: "Django Admin", desc: "Full data management" },
                      { href: "http://localhost:8000/api/docs/",  icon: FileText,    label: "API Docs",     desc: "Swagger UI" },
                      { href: "http://localhost:8000/api/redoc/", icon: FileText,    label: "API Redoc",    desc: "ReDoc reference" },
                    ].map(({ href, icon: Icon, label, desc }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        className="card p-4 flex items-center gap-3 hover:shadow-card-lg transition-shadow group">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                          <Icon size={16} className="text-gray-500 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <ExternalLink size={13} className="text-gray-300 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )
          )}

          {/* Properties breakdown */}
          {tab === "properties" && (
            propLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            : propStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { title: "By type",   rows: propStats.by_type,   labelKey: "property_type", color: "bg-brand-500" },
                  { title: "By status", rows: propStats.by_status, labelKey: "status",         color: "bg-green-500" },
                  { title: "By city",   rows: propStats.by_city.slice(0,8), labelKey: "city",  color: "bg-teal-500"  },
                ].map(({ title, rows, labelKey, color }) => (
                  <div key={title} className="card p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm">{title}</h3>
                    <div className="space-y-3">
                      {(rows as any[]).map((row) => {
                        const max = Math.max(...(rows as any[]).map((r) => r.count));
                        return (
                          <div key={row[labelKey]}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="capitalize text-gray-700">{row[labelKey]}</span>
                              <span className="text-gray-400">{row.count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all", color)}
                                style={{ width: `${(row.count / max) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null
          )}

          {/* Audit log */}
          {tab === "audit" && (
            <div className="space-y-4">
              <DataTable columns={auditColumns} data={audit?.results ?? []}
                isLoading={auditLoading} rowKey={(r) => r.id}
                emptyMessage="No audit log entries found." />
              {totalAuditPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" disabled={auditPage <= 1}
                    onClick={() => setAuditPage((p) => p - 1)} leftIcon={<ChevronLeft size={13} />}>Previous</Button>
                  <span className="text-xs text-gray-500">Page {auditPage} of {totalAuditPages}</span>
                  <Button variant="secondary" size="sm" disabled={auditPage >= totalAuditPages}
                    onClick={() => setAuditPage((p) => p + 1)} rightIcon={<ChevronRight size={13} />}>Next</Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}