import { Navbar } from "@/components/layout/Navbar";
import { StatsSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="page-container py-8 space-y-8">
        <div className="space-y-1">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <StatsSkeleton count={4} />
        <TableSkeleton rows={6} />
      </main>
    </div>
  );
}