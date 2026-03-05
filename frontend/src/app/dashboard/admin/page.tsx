"use client";
/**
 * FILE:    frontend/src/app/dashboard/admin/page.tsx
 * PURPOSE: Admin dashboard — platform stats, quick links (Phase D full build)
 */
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Spinner } from "@/components/ui/Spinner";
import { analyticsApi } from "@/lib/api/analytics";
import { formatPrice } from "@/lib/utils";
import {
  Building2, Users, Eye, TrendingUp,
  Activity, ShieldCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn:  analyticsApi.dashboard,
  });

  const cards = stats
    ? [
        { icon: Building2,  label: "Total properties",    value: stats.total_properties,     color: "bg-blue-50   text-blue-500"   },
        { icon: Building2,  label: "Available",           value: stats.available_properties, color: "bg-green-50  text-green-500"  },
        { icon: Users,      label: "Total users",         value: stats.total_users,          color: "bg-purple-50 text-purple-500" },
        { icon: Users,      label: "Agents",              value: stats.total_agents,         color: "bg-amber-50  text-amber-500"  },
        { icon: Eye,        label: "Total views",         value: stats.total_views,          color: "bg-pink-50   text-pink-500"   },
        { icon: TrendingUp, label: "Avg. price",          value: formatPrice(stats.avg_price,"KES"), color: "bg-teal-50 text-teal-500" },
        { icon: Activity,   label: "API calls today",     value: stats.api_calls_today,      color: "bg-orange-50 text-orange-500" },
        { icon: Users,      label: "New users this month",value: stats.new_users_this_month, color: "bg-indigo-50 text-indigo-500" },
      ]
    : [];

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8">

          <div className="mb-8">
            <h1 className="heading-section">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Platform overview and analytics.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {cards.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="card p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <p className="font-display text-2xl font-semibold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Admin tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: "http://localhost:8000/admin/",                        icon: ShieldCheck, label: "Django Admin", desc: "Manage all data directly" },
                { href: "http://localhost:8000/api/docs/",                     icon: Activity,    label: "API Docs",     desc: "Swagger UI for all endpoints" },
                { href: "http://localhost:8000/api/v1/analytics/audit-logs/",  icon: Eye,         label: "Audit Logs",   desc: "Review all API activity" },
              ].map(({ href, icon: Icon, label, desc }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="card p-4 flex items-center gap-3 hover:shadow-card-lg transition-shadow">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}