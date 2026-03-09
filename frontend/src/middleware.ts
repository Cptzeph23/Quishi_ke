/**
 * FILE:    frontend/src/middleware.ts
 * PURPOSE: Next.js Edge Middleware — server-side route protection.
 *
 * Strategy:
 *   - Reads the zustand-persist cookie ("smartrealty-auth") on every request.
 *   - Unauthenticated users hitting protected routes → redirect to /auth/login.
 *   - Authenticated users hitting /auth/* → redirect to their dashboard.
 *   - Role-based protection: /dashboard/admin → admin only, /dashboard/agent → agent only.
 *   - Public routes pass through with no token check.
 *
 * NOTE: The middleware runs on the Edge runtime (no Node APIs).
 *       It only reads the token presence/role from the persisted store cookie —
 *       it does NOT verify the JWT signature (that is Django's job on every API call).
 */
import { NextRequest, NextResponse } from "next/server";

// ── Route config ──────────────────────────────────────────────────────────────

const PUBLIC_ROUTES = [
  "/",
  "/properties",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/admin":  ["admin"],
  "/dashboard/agent":  ["agent", "admin"],
  "/dashboard/client": ["client", "admin"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStoredAuth(req: NextRequest): { accessToken?: string; user?: { role?: string } } | null {
  try {
    const raw = req.cookies.get("smartrealty-auth")?.value;
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw));
    // Zustand persist wraps state in { state: { ... } }
    return parsed?.state ?? parsed ?? null;
  } catch {
    return null;
  }
}

function dashboardForRole(role?: string): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "agent") return "/dashboard/agent";
  return "/dashboard/client";
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static assets, API routes, Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const auth = getStoredAuth(req);
  const isLoggedIn = !!auth?.accessToken;
  const role = auth?.user?.role;

  // ── Redirect authenticated users away from auth pages ──
  if (isLoggedIn && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(
      new URL(dashboardForRole(role), req.url)
    );
  }

  // ── Allow public routes without auth ──
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ── Require auth for all other routes ──
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based access for specific dashboard prefixes ──
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(role ?? "")) {
        // Authenticated but wrong role → redirect to own dashboard
        return NextResponse.redirect(
          new URL(dashboardForRole(role), req.url)
        );
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files and Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};