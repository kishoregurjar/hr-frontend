"use client";

import { useRouter } from "next/navigation";
import {
  Archive,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ASSESSMENT_STATUS } from "../../constants";

const AssessmentCardActions = ({
  assessment,
  onPublish,
  onArchive,
  onRestore,
  isPending = false,
}) => {
  const router = useRouter();

  const isArchived =
    assessment.status === ASSESSMENT_STATUS.ARCHIVED;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Assessment actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {!isArchived && (
          <DropdownMenuItem
            onClick={() =>
              router.push(`/assessments/${assessment.id}/edit`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}

        {assessment.status === ASSESSMENT_STATUS.DRAFT && (
          <DropdownMenuItem
            onClick={() => onPublish(assessment.id)}
          >
            <Send className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        )}

        {assessment.status === ASSESSMENT_STATUS.PUBLISHED && (
          <DropdownMenuItem
            onClick={() => onArchive(assessment.id)}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}

        {isArchived && (
          <DropdownMenuItem
            onClick={() => onRestore(assessment.id)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AssessmentCardActions;
