import { Skeleton } from "@/components/ui/skeleton";

export default function MasterLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#261f18]">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[#1f1913]" />
          <Skeleton className="h-4 w-96 bg-[#1f1913]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 bg-[#1f1913]" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border border-[#261f18] bg-[#140e0a] space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-[#231b14]" />
              <Skeleton className="h-6 w-6 rounded-md bg-[#231b14]" />
            </div>
            <Skeleton className="h-8 w-36 bg-[#231b14]" />
            <Skeleton className="h-3 w-48 bg-[#231b14]" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="p-6 rounded-xl border border-[#261f18] bg-[#140e0a] space-y-4">
        <Skeleton className="h-6 w-48 bg-[#231b14]" />
        <Skeleton className="h-72 w-full bg-[#231b14] rounded-lg" />
      </div>
    </div>
  );
}
