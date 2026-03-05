"use client";
/**
 * FILE:    agent/page.tsx
 * PURPOSE: Agent dashboard — listings table with edit/delete, stats strip, quick create
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Eye, Building2, TrendingUp, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Navbar }    from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { StatCard }  from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { Button }    from "@/components/ui/Button";
import { Badge }     from "@/components/ui/Badge";
import { propertiesApi } from "@/lib/api/properties";
import { propertyKeys }  from "@/lib/hooks/useProperties";
import { useAuthStore }  from "@/store/authStore";
import { formatPrice, timeAgo } from "@/lib/utils";
import type { PropertySummary } from "@/lib/types";

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

  const listings = data?.results ?? [];
  const available = listings.filter((p) => p.status === "available").length;
  const totalViews = listings.reduce((s, p) => s + (p.views_count ?? 0), 0);

  const columns = [
    {
      key: "title", header: "Property",
      render: (p: PropertySummary) => (
        <div>
          <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{p.city}{p.neighborhood ? `, ${p.neighborhood}` : ""}</p>
        </div>
      ),
    },
    {
      key: "type", header: "Type", width: "w-28",
      render: (p: PropertySummary) => (
        <span className="text-xs capitalize text-gray-600">{p.property_type}</span>
      ),
    },
    {
      key: "price", header: "Price", width: "w-36",
      render: (p: PropertySummary) => (
        <span className="text-sm font-medium text-gray-900">{formatPrice(p.price, "KES")}</span>
      ),
    },
    {
      key: "status", header: "Status", width: "w-28",
      render: (p: PropertySummary) => <Badge status={p.status}>{p.status}</Badge>,
    },
    {
      key: "views", header: "Views", width: "w-20",
      render: (p: PropertySummary) => (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Eye size={12} />{p.views_count ?? 0}
        </span>
      ),
    },
    {
      key: "date", header: "Listed", width: "w-28",
      render: (p: PropertySummary) => (
        <span className="text-xs text-gray-400">{timeAgo(p.created_at)}</span>
      ),
    },
    {
      key: "actions", header: "", width: "w-24",
      render: (p: PropertySummary) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/dashboard/agent/properties/${p.id}/edit`)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Pencil size={13} />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this listing? This cannot be undone.")) {
                setDeletingId(p.id);
                deleteMutation.mutate(p.id);
              }
            }}
            disabled={deletingId === p.id}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

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
            <Button onClick={() => router.push("/dashboard/agent/properties/create")}
              leftIcon={<PlusCircle size={15} />}>
              New listing
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Total listings"  value={data?.count ?? 0}   icon={Building2}  color="bg-blue-50 text-blue-500" />
            <StatCard label="Available"        value={available}           icon={CheckCircle} color="bg-green-50 text-green-500" />
            <StatCard label="Total views"      value={totalViews.toLocaleString()} icon={Eye} color="bg-pink-50 text-pink-500" />
          </div>

          {/* Listings table */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Your listings</h2>
            <DataTable
              columns={columns}
              data={listings}
              isLoading={isLoading}
              rowKey={(p) => p.id}
              emptyMessage="No listings yet. Create your first one!"
              onRowClick={(p) => router.push(`/properties/${p.id}`)}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}