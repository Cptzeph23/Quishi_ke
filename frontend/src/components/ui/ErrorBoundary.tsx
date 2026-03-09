"use client";
/**
 * FILE:    frontend/src/components/ui/ErrorBoundary.tsx
 * PURPOSE: Reusable error UI used by all route error.tsx files
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorDisplayProps {
  error:  Error & { digest?: string };
  reset:  () => void;
  title?: string;
  description?: string;
}

export function ErrorDisplay({
  error,
  reset,
  title       = "Something went wrong",
  description = "An unexpected error occurred. You can try again or go back.",
}: ErrorDisplayProps) {
  useEffect(() => {
    // Log to console in dev — swap for Sentry in production
    console.error("[ErrorBoundary]", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} leftIcon={<RefreshCw size={14} />}>
            Try again
          </Button>
          <Button variant="secondary" onClick={() => router.back()}
            leftIcon={<ArrowLeft size={14} />}>
            Go back
          </Button>
          <Button variant="ghost" onClick={() => router.push("/")}
            leftIcon={<Home size={14} />}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}