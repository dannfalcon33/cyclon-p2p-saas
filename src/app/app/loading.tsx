import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1a1f2c]">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[#141822]" />
          <Skeleton className="h-4 w-96 bg-[#141822]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 bg-[#141822]" />
          <Skeleton className="h-10 w-40 bg-[#141822]" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border border-[#1a1f2c] bg-[#0d1017] space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-[#181d2a]" />
              <Skeleton className="h-6 w-6 rounded-md bg-[#181d2a]" />
            </div>
            <Skeleton className="h-8 w-36 bg-[#181d2a]" />
            <Skeleton className="h-3 w-48 bg-[#181d2a]" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-[#1a1f2c] bg-[#0d1017] space-y-4">
          <Skeleton className="h-6 w-48 bg-[#181d2a]" />
          <Skeleton className="h-64 w-full bg-[#181d2a] rounded-lg" />
        </div>
        <div className="p-6 rounded-xl border border-[#1a1f2c] bg-[#0d1017] space-y-4">
          <Skeleton className="h-6 w-36 bg-[#181d2a]" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#181d2a] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
