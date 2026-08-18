import { ClipboardList, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const CandidateBulkActions = ({
  selectedCount = 0,
  onClear,
  onAssignAssessment,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">
          {selectedCount}{" "}
          {selectedCount === 1 ? "candidate" : "candidates"}{" "}
          selected
        </p>

        <p className="text-sm text-muted-foreground">
          Perform an action on the selected candidates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>

        <Button type="button" onClick={onAssignAssessment}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Assign Assessment
        </Button>
      </div>
    </div>
  );
};

export default CandidateBulkActions;
