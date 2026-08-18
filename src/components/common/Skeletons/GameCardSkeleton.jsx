import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const GameCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>

      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-24" />

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        <Skeleton className="h-4 w-32" />
      </CardContent>

      <CardFooter className="gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
};

export default GameCardSkeleton;
