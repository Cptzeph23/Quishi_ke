"use client";
/**
 * FILE:    frontend/src/lib/api/auth.ts
 * PURPOSE: Auth API calls — login, register, profile, logout
 */
import { api } from "./client";
import type { AuthResponse, User } from "@/lib/types";

export const authApi = {
  /** Register a new account. Returns tokens + user on success. */
  register: (data: {
    email:     string;
    full_name: string;
    phone?:    string;
    password:  string;
    password2: string;
    role?:     "agent" | "client";
  }) => api.post<AuthResponse>("/auth/register/", data).then((r) => r.data),

  /** Login — returns access token, refresh token, and user object. */
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login/", { email, password }).then((r) => r.data),

  /** Exchange refresh token for a new access token. */
  refresh: (refresh: string) =>
    api.post<{ access: string }>("/auth/token/refresh/", { refresh }).then((r) => r.data),

  /** Blacklist the refresh token (server-side logout). */
  logout: (refresh: string) =>
    api.post("/auth/token/logout/", { refresh }),

  /** Fetch the authenticated user's profile. */
  me: () => api.get<User>("/auth/me/").then((r) => r.data),

  /** Update name / phone / avatar. */
  updateMe: (data: FormData | Partial<User>) =>
    api.patch<User>("/auth/me/", data, {
      headers: data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {},
    }).then((r) => r.data),
};