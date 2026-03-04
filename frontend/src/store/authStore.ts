/**
 * FILE:    frontend/src/store/authStore.ts
 * PURPOSE: Global auth state via Zustand.
 *          Call hydrate() once on app mount to restore session from localStorage.
 */
import { create } from "zustand";
import type { User } from "@/lib/types";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;

  /** Login with email + password — stores tokens, sets user. */
  login:   (email: string, password: string) => Promise<void>;

  /** Blacklist refresh token + clear local storage. */
  logout:  () => Promise<void>;

  /** Re-hydrate session from localStorage (call once at app root). */
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isLoading:       true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh);
    }
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    const refresh = typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;
    if (refresh) {
      try { await authApi.logout(refresh); } catch { /* ignore */ }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      set({ isLoading: false });
    }
  },
}));