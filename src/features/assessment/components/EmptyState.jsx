import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-xl font-semibold">
        No Assessments Found
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You haven't created any assessments yet. Start by creating your first assessment.
      </p>
      <Button className="mt-6">
        Create Assessment
      </Button>
    </div>
  );
};

export default EmptyState;
