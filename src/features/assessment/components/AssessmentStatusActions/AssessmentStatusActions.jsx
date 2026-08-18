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
  if (status === ASSESSMENT_STATUS.DRAFT) {
    return (
      <Button
        type="button"
        onClick={onPublish}
        disabled={isPending}
      >
        <Send className="mr-2 h-4 w-4" />
        {isPending ? "Publishing..." : "Publish"}
      </Button>
    );
  }

  if (status === ASSESSMENT_STATUS.PUBLISHED) {
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

  if (status === ASSESSMENT_STATUS.ARCHIVED) {
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
