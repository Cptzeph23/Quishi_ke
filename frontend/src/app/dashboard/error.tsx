"use client";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorDisplay } from "@/components/ui/ErrorBoundary";

export default function DashboardError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Dashboard unavailable"
        description="We couldn't load your dashboard. Please try again."
      />
    </div>
  );
}