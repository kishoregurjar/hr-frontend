import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AssessmentCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-24" />
          ))}
        </div>

        <Skeleton className="h-4 w-32" />

        <div className="flex justify-between border-t pt-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentCardSkeleton;
