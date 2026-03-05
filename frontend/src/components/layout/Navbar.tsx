"use client";
/**
 * FILE:    frontend/src/components/layout/Navbar.tsx
 * PURPOSE: Sticky top navigation — auth state, role-based links, mobile menu
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2, Menu, X, LogOut, LayoutDashboard,
  User, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/chatbot",    label: "AI Search"  },
];

export function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const dashboardHref =
    user?.role === "admin"  ? "/dashboard/admin"  :
    user?.role === "agent"  ? "/dashboard/agent"  :
    "/dashboard/client";

  async function handleLogout() {
    await logout();
    toast.success("Signed out successfully");
    router.push("/");
    setProfileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E8E4DC]">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                            group-hover:bg-brand-600 transition-colors">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-gray-900 text-lg leading-none">
              Smart<span className="text-brand-500">Realty</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "text-brand-600 bg-brand-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             text-sm font-medium text-gray-700
                             hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center
                                  justify-center text-brand-700 text-xs font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={cn(
                    "transition-transform", profileOpen && "rotate-180"
                  )} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-52 card py-1 shadow-card-lg z-50
                                  animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={14} />
                      Dashboard
                    </Link>
                    <Link
                      href="/auth/me"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50 transition-colors"
                    >
                      <User size={14} />
                      Profile
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                                   text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E4DC] bg-[#FAFAF8] px-4 py-4
                        flex flex-col gap-1 animate-fade-in">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-brand-600 bg-brand-50"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Sign in
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                  className="btn-primary text-sm mt-1">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}