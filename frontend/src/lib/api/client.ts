"use client";
/**
 * FILE:    frontend/src/lib/api/client.ts
 * PURPOSE: Axios instance with automatic silent JWT token refresh.
 *          On 401 → refreshes token → replays original request.
 *          On refresh failure → redirects to /auth/login
 */
"use client";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

const getToken = (key: string) =>
  typeof window !== "undefined" ? localStorage.getItem(key) : null;

const setToken = (key: string, val: string) => {
  if (typeof window !== "undefined") localStorage.setItem(key, val);
};

const removeTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};

// ── Request: attach access token ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: silent refresh on 401 ──────────────────────────────────────────
let isRefreshing = false;
let waitQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function flushQueue(error: unknown, token?: string) {
  waitQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  waitQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) =>
        waitQueue.push({ resolve, reject })
      ).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    const refresh = getToken("refresh_token");
    if (!refresh) {
      isRefreshing = false;
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/auth/token/refresh/`,
        { refresh }
      );
      const newAccess = data.access as string;
      setToken("access_token", newAccess);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      flushQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError);
      removeTokens();
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);