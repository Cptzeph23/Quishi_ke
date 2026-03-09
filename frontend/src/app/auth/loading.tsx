import { Skeleton } from "@/components/ui/Skeleton";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      <div className="hidden lg:block lg:w-1/2 bg-gray-900" />
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="max-w-sm w-full mx-auto lg:mx-0 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}