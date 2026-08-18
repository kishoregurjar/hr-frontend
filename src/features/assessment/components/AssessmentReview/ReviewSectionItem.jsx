import {
  CheckCircle2,
  CircleAlert,
  Gamepad2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { SECTION_STATUS } from "../../constants";

const ReviewSectionItem = ({ item, onReview }) => {
  const { section, index, status, label } = item;
  const isComplete = status === SECTION_STATUS.COMPLETED;

  const Icon = section.type === "quiz" ? HelpCircle : Gamepad2;

  return (
    <div className="flex flex-col gap-4 border-b py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 rounded-lg border bg-muted p-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Section {index + 1}
          </p>
          <h3 className="mt-0.5 font-semibold text-slate-900">
            {section.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 pl-14 sm:pl-0">
        <div
          className={`flex items-center gap-1.5 text-sm font-medium ${
            isComplete ? "text-green-600" : "text-amber-600"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <CircleAlert className="h-4 w-4" />
          )}
          {isComplete ? "Completed" : "Incomplete"}
        </div>

        {section.type === "quiz" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReview?.(index)}
          >
            Review
          </Button>
        )}

        {section.type === "game" && !isComplete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReview?.(index)}
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
};


export default ReviewSectionItem;
