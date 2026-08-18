import { Skeleton } from "@/components/ui/skeleton";

const StatsSkeleton = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-28 rounded-xl"
        />
      ))}
    </div>
  );
};

export default StatsSkeleton;
