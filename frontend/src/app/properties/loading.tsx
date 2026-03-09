import { Navbar } from "@/components/layout/Navbar";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="page-container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
        <PropertyGridSkeleton count={8} />
      </main>
    </div>
  );
}