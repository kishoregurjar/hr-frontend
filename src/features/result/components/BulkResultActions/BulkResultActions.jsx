"use client";

import { UserCheck, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BulkResultActions = ({
  selectedCount,
  onClear,
  onShortlist,
  onReject,
  isUpdating = false,
}) => {
  if (!selectedCount || selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between border-primary/20 bg-primary/5">
      <div>
        <p className="font-semibold text-slate-900">
          {selectedCount} {selectedCount === 1 ? "candidate" : "candidates"} selected
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isUpdating}
          onClick={onClear}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUpdating}
          onClick={onReject}
        >
          <UserX className="mr-2 h-4 w-4 text-destructive" />
          Reject Selected
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isUpdating}
          onClick={onShortlist}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Shortlist Selected
        </Button>
      </div>
    </div>
  );
};

export default BulkResultActions;
