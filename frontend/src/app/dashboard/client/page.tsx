"use client";
/**
 * FILE:    client/page.tsx
 * PURPOSE: Client dashboard — saved properties grid, quick actions, profile link
 */
import Link from "next/link";
import { Heart, Search, MessageCircle, User } from "lucide-react";
import { Navbar }    from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PropertyCard } from "@/components/property/PropertyCard";

import { Spinner }      from "@/components/ui/Spinner";
import { useSavedProperties } from "@/lib/hooks/useProperties";
import { useAuthStore } from "@/store/authStore";

export default function ClientDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: saved = [], isLoading } = useSavedProperties();

  return (
    <AuthGuard role="client">
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8 space-y-8">

          {/* Header */}
          <div>
            <h1 className="heading-section">
              Welcome back, {user?.full_name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here are your saved properties and quick actions.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Saved properties", value: saved.length, icon: Heart,         color: "bg-red-50    text-red-400"    },
              { label: "Searches today",   value: "—",          icon: Search,        color: "bg-blue-50   text-blue-500"   },
              { label: "AI chats",         value: "—",          icon: MessageCircle, color: "bg-purple-50 text-purple-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5 flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/properties", icon: Search,        iconColor: "bg-brand-50  text-brand-500",  label: "Browse properties",  desc: "Find your next home" },
              { href: "/chatbot",    icon: MessageCircle, iconColor: "bg-purple-50 text-purple-500", label: "AI property search", desc: "Describe what you want" },
              { href: "/dashboard/profile", icon: User,  iconColor: "bg-gray-50   text-gray-500",   label: "Edit profile",       desc: "Update your details" },
            ].map(({ href, icon: Icon, iconColor, label, desc }) => (
              <Link key={href} href={href}
                className="card p-5 flex items-center gap-4 hover:shadow-card-lg transition-shadow group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Saved properties */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                Saved properties
                {saved.length > 0 && (
                  <span className="text-sm font-normal text-gray-400">({saved.length})</span>
                )}
              </h2>
              {saved.length > 0 && (
                <Link href="/properties" className="text-xs text-brand-600 hover:underline font-medium">
                  Browse more →
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : saved.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="font-medium text-gray-600">No saved properties yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Browse listings and tap the ♥ icon to save them here.
                </p>
                <Link href="/properties" className="btn-primary text-sm mt-5 inline-flex">
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