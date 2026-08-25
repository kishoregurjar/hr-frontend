"use client";

import { Archive, RotateCcw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ASSESSMENT_STATUS } from "../../constants";

const AssessmentStatusActions = ({
  status,
  onPublish,
  onArchive,
  onRestore,
  isPending = false,
}) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "DRAFT") {
    return (
      <Button
        type="button"
        onClick={onPublish}
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-sm"
      >
        <Send className="mr-2 h-4 w-4" />
        {isPending ? "Publishing..." : "Publish Assessment"}
      </Button>
    );
  }

  if (normalized === "PUBLISHED") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onArchive}
        disabled={isPending}
      >
        <Archive className="mr-2 h-4 w-4" />
        {isPending ? "Archiving..." : "Archive"}
      </Button>
    );
  }

  if (normalized === "ARCHIVED") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onRestore}
        disabled={isPending}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        {isPending ? "Restoring..." : "Restore"}
      </Button>
    );
  }

  return null;
};

export default AssessmentStatusActions;
