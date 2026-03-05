"use client";
/**
 * FILE:    frontend/src/app/providers.tsx
 * PURPOSE: Client-side provider tree — TanStack Query, auth hydration, toast
 */
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        60_000,   // 1 minute
      retry:            1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1a1a",
              color:      "#fafaf8",
              fontFamily: "var(--font-dm-sans)",
              fontSize:   "14px",
              borderRadius: "12px",
              padding:    "12px 16px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#1a1a1a" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" } },
          }}
        />
      </AuthHydrator>
    </QueryClientProvider>
  );
}