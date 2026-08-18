import { Skeleton } from "@/components/ui/skeleton";

const AssessmentGridSkeleton = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-lg border p-6"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>

          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};

export default AssessmentGridSkeleton;
