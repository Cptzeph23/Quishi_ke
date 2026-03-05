/**
 * FILE:    frontend/src/app/not-found.tsx
 * PURPOSE: Global 404 page
 */
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4">
      <p className="font-display text-8xl font-semibold text-[#E8E4DC] select-none">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">
        Page not found
      </h1>
      <p className="mt-2 text-gray-500 text-center max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 btn-primary gap-2"
      >
        <Home size={16} />
        Back to home
      </Link>
    </div>
  );
}