"use client";
/**
 * FILE:    frontend/src/app/dashboard/agent/page.tsx
 * PURPOSE: Agent dashboard — my listings, quick create (Phase D full build)
 */
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Spinner } from "@/components/ui/Spinner";
import { useProperties } from "@/lib/hooks/useProperties";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { PlusCircle, BarChart2 } from "lucide-react";

export default function AgentDashboard() {
  const user = useAuthStore((s) => s.user);
  // Fetch this agent's own listings
  const { data, isLoading } = useProperties({ status: "available" });

  return (
    <AuthGuard role="agent">
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8">

          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="heading-section">Agent Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your property listings.
              </p>
            </div>
            <Link href="/properties" className="btn-primary text-sm gap-2">
              <PlusCircle size={15} />
              New listing
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Active listings",   value: data?.count ?? "—" },
              { label: "Total views",       value: "—" },
              { label: "Enquiries",         value: "—" },
            ].map(({ label, value }) => (
              <div key={label} className="card p-5">
                <p className="font-display text-2xl font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Listings */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-5">Your Listings</h2>
            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : (data?.results ?? []).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart2 size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="font-medium text-gray-600">No listings yet</p>
                <p className="text-sm mt-1">Create your first property listing to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(data?.results ?? []).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}