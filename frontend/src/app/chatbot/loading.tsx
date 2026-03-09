import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChatbotLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />
      <main className="flex-1 page-container py-8 flex flex-col">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex-1 bg-white border border-[#E8E4DC] rounded-2xl
                        flex flex-col overflow-hidden">
          <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
            <div className="w-full max-w-sm space-y-2 mt-2">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
            </div>
          </div>
          <div className="border-t border-gray-100 p-4">
            <Skeleton className="h-10 rounded-xl w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}