"use client";
/**
 * FILE:    frontend/src/app/dashboard/client/page.tsx
 * PURPOSE: Client dashboard — saved properties, chat history (Phase D full build)
 */
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Spinner } from "@/components/ui/Spinner";
import { useSavedProperties } from "@/lib/hooks/useProperties";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Heart, Search, MessageCircle } from "lucide-react";

export default function ClientDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: saved = [], isLoading } = useSavedProperties();

  return (
    <AuthGuard role="client">
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="heading-section">
              Welcome back, {user?.full_name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here are your saved properties and recent activity.
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <Link href="/properties"
              className="card p-5 flex items-center gap-4 hover:shadow-card-lg
                         transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center
                              justify-center group-hover:bg-brand-100 transition-colors">
                <Search size={18} className="text-brand-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Browse Properties</p>
                <p className="text-xs text-gray-400 mt-0.5">Find your next home</p>
              </div>
            </Link>
            <Link href="/chatbot"
              className="card p-5 flex items-center gap-4 hover:shadow-card-lg
                         transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center
                              justify-center group-hover:bg-purple-100 transition-colors">
                <MessageCircle size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">AI Property Search</p>
                <p className="text-xs text-gray-400 mt-0.5">Describe what you want</p>
              </div>
            </Link>
          </div>

          {/* Saved properties */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Heart size={18} className="text-red-400" />
              <h2 className="font-semibold text-gray-900">
                Saved Properties
                {saved.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({saved.length})
                  </span>
                )}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : saved.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Heart size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="font-medium text-gray-600">No saved properties yet</p>
                <p className="text-sm mt-1">
                  Browse listings and click the heart icon to save properties.
                </p>
                <Link href="/properties"
                  className="btn-primary text-sm mt-4 inline-flex">
                  Browse properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {saved.map((p) => (
                  <PropertyCard key={p.id} property={p} isSaved />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}