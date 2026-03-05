"use client";
/**
 * FILE:    frontend/src/app/page.tsx
 * PURPOSE: Home page — hero, featured listings, platform stats
 */
import Link from "next/link";
import { Search, ArrowRight, Building2, Users, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Spinner } from "@/components/ui/Spinner";
import { useFeaturedProperties } from "@/lib/hooks/useProperties";
import { useFilterStore } from "@/store/filterStore";

const STATS = [
  { icon: Building2, value: "10,000+", label: "Active listings" },
  { icon: Users,     value: "5,000+",  label: "Happy clients"   },
  { icon: Star,      value: "500+",    label: "Verified agents" },
  { icon: MapPin,    value: "20+",     label: "Neighbourhoods"  },
];

const PROPERTY_TYPES = [
  { emoji: "🏢", label: "Apartment", value: "apartment" },
  { emoji: "🏠", label: "House",     value: "house"     },
  { emoji: "🏙️", label: "Studio",    value: "studio"    },
  { emoji: "🏰", label: "Penthouse", value: "penthouse" },
  { emoji: "💼", label: "Office",    value: "office"    },
  { emoji: "🌿", label: "Land",      value: "land"      },
];

export default function HomePage() {
  const router     = useRouter();
  const [query, setQuery] = useState("");
  const { setFilters } = useFilterStore();
  const { data: featured = [], isLoading } = useFeaturedProperties();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters({ city: query || undefined });
    router.push("/properties");
  }

  function handleTypeClick(type: string) {
    setFilters({ property_type: type as any });
    router.push("/properties");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 50%, rgba(79,110,247,0.25) 0%, transparent 60%)," +
              "radial-gradient(ellipse at 20% 80%, rgba(164,184,251,0.15) 0%, transparent 50%)",
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative page-container py-20 sm:py-28">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-white/10 border border-white/15 text-white/70 text-xs mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              New listings added daily
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold
                           text-white leading-[1.1] mb-5">
              Find your perfect<br />
              <span className="text-brand-400">space in Nairobi.</span>
            </h1>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg">
              Thousands of verified properties — apartments, houses, offices and more.
              Powered by AI to find exactly what you need.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city or neighbourhood…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white text-gray-900
                             placeholder-gray-400 text-sm focus:outline-none
                             focus:ring-2 focus:ring-brand-400 shadow-sm"
                />
              </div>
              <button type="submit"
                className="h-12 px-6 rounded-xl bg-brand-500 text-white font-medium text-sm
                           hover:bg-brand-600 transition-colors shadow-sm whitespace-nowrap">
                Search
              </button>
            </form>

            {/* Quick type links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {PROPERTY_TYPES.map(({ emoji, label, value }) => (
                <button
                  key={value}
                  onClick={() => handleTypeClick(value)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15
                             text-white/70 text-xs hover:bg-white/20 hover:text-white
                             transition-colors flex items-center gap-1.5"
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E8E4DC]">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center
                                justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-500" />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ─────────────────────────────────────── */}
      <section className="page-container py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="heading-section">Featured Properties</h2>
            <p className="text-gray-500 text-sm mt-1">
              Hand-picked listings from our best agents.
            </p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1 text-sm font-medium text-brand-600
                       hover:text-brand-700 transition-colors whitespace-nowrap"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No featured properties yet.</p>
            <Link href="/properties" className="text-brand-600 text-sm mt-2 inline-block">
              Browse all listings →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.slice(0, 8).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* ── AI CTA ────────────────────────────────────────────────── */}
      <section className="page-container pb-14">
        <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, #4f6ef7 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-lg">
            <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">
              AI-Powered Search
            </p>
            <h2 className="font-display text-3xl font-semibold text-white mb-3">
              Describe what you want.<br />We'll find it.
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Tell our AI exactly what you're looking for in plain English.
              It will extract your requirements and surface the most relevant listings instantly.
            </p>
            <Link
              href="/chatbot"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-brand-500 text-white font-medium text-sm
                         hover:bg-brand-600 transition-colors shadow-sm"
            >
              Try AI Search <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DC] bg-white">
        <div className="page-container py-8 flex flex-col sm:flex-row items-center
                        justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <Building2 size={12} className="text-white" />
            </div>
            <span className="font-medium text-gray-600">SmartRealty</span>
          </div>
          <p>© {new Date().getFullYear()} SmartRealty. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/properties" className="hover:text-gray-600 transition-colors">Properties</Link>
            <Link href="/chatbot"    className="hover:text-gray-600 transition-colors">AI Search</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}