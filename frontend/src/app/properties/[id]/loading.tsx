import { Navbar } from "@/components/layout/Navbar";
import { PropertyDetailSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="page-container py-8">
        <Skeleton className="h-4 w-32 mb-6" />
        <PropertyDetailSkeleton />
      </main>
    </div>
  );
}