"use client";
/**
 * FILE:    frontend/src/store/authStore.ts
 * PURPOSE: Global auth state with zustand persist.
 *          Also writes a "smartrealty-auth" cookie so Next.js middleware
 *          can read auth state server-side without a Node.js API.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";
import { authApi } from "@/lib/api/auth";

// ── Cookie helpers (Edge-compatible) ─────────────────────────────────────────

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function syncCookie(state: Partial<AuthState>) {
  // Write a compact version of auth state to cookie for middleware
  const payload = {
    accessToken: state.accessToken ?? null,
    user:        state.user ? { role: state.user.role, id: state.user.id } : null,
  };
  if (payload.accessToken) {
    setCookie("smartrealty-auth", JSON.stringify({ state: payload }));
  } else {
    deleteCookie("smartrealty-auth");
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

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
        const next = {
          user:            data.user,
          accessToken:     data.access,
          refreshToken:    data.refresh,
          isAuthenticated: true,
          isLoading:       false,
        };
        set(next);
        syncCookie(next);
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
        deleteCookie("smartrealty-auth");
        set({
          user:            null,
          accessToken:     null,
          refreshToken:    null,
          isAuthenticated: false,
          isLoading:       false,
        });
      },

      hydrate: async () => {
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
          const next = { user, isAuthenticated: true, isLoading: false };
          set(next);
          syncCookie({ ...next, accessToken });
        } catch {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          deleteCookie("smartrealty-auth");
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
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (s) => ({
        accessToken:  s.accessToken,
        refreshToken: s.refreshToken,
        user:         s.user,
      }),
    }
  )
);