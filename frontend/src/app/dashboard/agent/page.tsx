"use client";
/**
 * FILE:    frontend/src/app/dashboard/agent/page.tsx
 * PURPOSE: Agent dashboard — listings table, stats, create/edit/delete
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle, Pencil, Trash2, Eye,
  Building2, CheckCircle, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Navbar }    from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button }    from "@/components/ui/Button";
import { Badge }     from "@/components/ui/Badge";
import { Spinner }   from "@/components/ui/Spinner";
import { propertiesApi } from "@/lib/api/properties";
import { propertyKeys }  from "@/lib/hooks/useProperties";
import { useAuthStore }  from "@/store/authStore";
import { formatPrice, timeAgo, cn } from "@/lib/utils";
import type { PropertySummary } from "@/lib/types";

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string | number;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const router  = useRouter();
  const qc      = useQueryClient();
  const user    = useAuthStore((s) => s.user);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: propertyKeys.list({}),
    queryFn:  () => propertiesApi.list({}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.remove(id),
    onSuccess: () => {
      toast.success("Listing deleted.");
      qc.invalidateQueries({ queryKey: propertyKeys.all });
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to delete. You can only delete your own listings.");
      setDeletingId(null);
    },
  });

  const listings   = data?.results ?? [];
  const available  = listings.filter((p) => p.status === "available").length;
  const totalViews = listings.reduce((s, p) => s + (p.views_count ?? 0), 0);

  return (
    <AuthGuard role="agent">
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="heading-section">Agent Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back, {user?.full_name.split(" ")[0]}. Manage your listings below.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/agent/properties/create")}
              leftIcon={<PlusCircle size={15} />}>
              New listing
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total listings" value={data?.count ?? 0}
              icon={Building2}    color="bg-blue-50 text-blue-500" />
            <StatCard label="Available"       value={available}
              icon={CheckCircle}  color="bg-green-50 text-green-500" />
            <StatCard label="Total views"     value={totalViews.toLocaleString()}
              icon={Eye}          color="bg-pink-50 text-pink-500" />
          </div>

          {/* Listings table */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Your listings</h2>
            <div className="card overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Building2 size={32} className="mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-600">No listings yet</p>
                  <p className="text-sm mt-1">Create your first listing to get started.</p>
                  <Button className="mt-4"
                    onClick={() => router.push("/dashboard/agent/properties/create")}
                    leftIcon={<PlusCircle size={14} />}>
                    Create listing
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {["Property","Type","Price","Status","Views","Listed",""].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                                  text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {listings.map((p: PropertySummary) => (
                        <tr key={p.id}
                          onClick={() => router.push(`/properties/${p.id}`)}
                          className="cursor-pointer hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {p.city}{p.neighborhood ? `, ${p.neighborhood}` : ""}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs capitalize text-gray-600">{p.property_type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(p.price, "KES")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge status={p.status}>{p.status}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Eye size={12} />{p.views_count ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-400">{timeAgo(p.created_at)}</span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => router.push(`/dashboard/agent/properties/${p.id}/edit`)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600
                                           hover:bg-brand-50 transition-colors">
                                <Pencil size={13} />
                              </button>
                              <button
                                disabled={deletingId === p.id}
                                onClick={() => {
                                  if (confirm("Delete this listing? This cannot be undone.")) {
                                    setDeletingId(p.id);
                                    deleteMutation.mutate(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600
                                           hover:bg-red-50 transition-colors disabled:opacity-40">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}