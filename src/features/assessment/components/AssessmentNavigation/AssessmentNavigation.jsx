import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const AssessmentNavigation = ({
  isFirst,
  isLast,
  onPrevious,
  onNext,
  isUpdating = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst || isUpdating}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <Button
        type="button"
        onClick={onNext}
        disabled={isUpdating}
      >
        {isLast ? (
          <>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Review Assessment
          </>
        ) : (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default AssessmentNavigation;
