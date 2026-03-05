"use client";
/**
 * FILE:    frontend/src/store/authStore.ts
 * PURPOSE: Global auth state — uses zustand persist middleware for SSR-safe
 *          localStorage access. No manual localStorage calls anywhere.
 */
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;

  login:   (email: string, password: string) => Promise<void>;
  logout:  () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isLoading:       true,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await authApi.login(email, password);
        set({
          user:            data.user,
          accessToken:     data.access,
          refreshToken:    data.refresh,
          isAuthenticated: true,
          isLoading:       false,
        });
        // Also keep in localStorage for the axios interceptor
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token",  data.access);
          localStorage.setItem("refresh_token", data.refresh);
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try { await authApi.logout(refreshToken); } catch { /* ignore */ }
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        set({
          user:            null,
          accessToken:     null,
          refreshToken:    null,
          isAuthenticated: false,
          isLoading:       false,
        });
      },

      hydrate: async () => {
        // Sync persisted tokens to localStorage for the axios interceptor
        const { accessToken, refreshToken } = get();
        if (typeof window !== "undefined") {
          if (accessToken)  localStorage.setItem("access_token",  accessToken);
          if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
        }

        if (!accessToken) {
          set({ isLoading: false });
          return;
        }

        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token expired and refresh failed — clear everything
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          set({
            user:            null,
            accessToken:     null,
            refreshToken:    null,
            isAuthenticated: false,
            isLoading:       false,
          });
        }
      },
    }),
    {
      name:    "smartrealty-auth",
      storage: createJSONStorage(() =>
        // Safe SSR fallback — returns a no-op storage on the server
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem:    () => null,
              setItem:    () => {},
              removeItem: () => {},
            }
      ),
      // Only persist tokens — not loading state
      partialize: (s) => ({
        accessToken:  s.accessToken,
        refreshToken: s.refreshToken,
        user:         s.user,
      }),
    }
  )
);