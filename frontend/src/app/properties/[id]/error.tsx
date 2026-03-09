"use client";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorDisplay } from "@/components/ui/ErrorBoundary";

export default function PropertyDetailError({
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
        title="Could not load property"
        description="This listing may have been removed or there was a network issue."
      />
    </div>
  );
}