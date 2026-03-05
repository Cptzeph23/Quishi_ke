"use client";
/**
 * FILE:    frontend/src/components/auth/AuthGuard.tsx
 * PURPOSE: Redirect unauthenticated or unauthorised users.
 *          Wrap any protected page: <AuthGuard role="admin">...</AuthGuard>
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { PageSpinner } from "@/components/ui/Spinner";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children:  React.ReactNode;
  role?:     UserRole | UserRole[];   // if set, also checks role
}

export function AuthGuard({ children, role }: AuthGuardProps) {
  const router            = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (role && user) {
      const allowed = Array.isArray(role) ? role : [role];
      if (!allowed.includes(user.role)) {
        // Redirect to their own dashboard
        const fallback =
          user.role === "admin"  ? "/dashboard/admin"  :
          user.role === "agent"  ? "/dashboard/agent"  :
          "/dashboard/client";
        router.replace(fallback);
      }
    }
  }, [isLoading, isAuthenticated, user, role, router]);

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) return null;

  if (role && user) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) return null;
  }

  return <>{children}</>;
}