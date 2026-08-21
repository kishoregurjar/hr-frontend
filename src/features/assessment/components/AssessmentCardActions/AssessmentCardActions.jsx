"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  Copy,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteAssessment, useDuplicateAssessment } from "../../hooks";

const AssessmentCardActions = ({
  assessment,
  onPublish,
  onArchive,
  onRestore,
  isPending = false,
}) => {
  const router = useRouter();
  const deleteMutation = useDeleteAssessment();
  const duplicateMutation = useDuplicateAssessment();

  const normalizedStatus = String(assessment?.status || "").toUpperCase();
  const isArchived = normalizedStatus === "ARCHIVED";
  const isDraft = normalizedStatus === "DRAFT";
  const isPublished = normalizedStatus === "PUBLISHED";

  const handleDuplicate = () => {
    duplicateMutation.mutate(
      { id: assessment.id, payload: { title: `${assessment.title} (Copy)` } },
      {
        onSuccess: () => {
          toast.success("Assessment duplicated successfully!");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to duplicate assessment");
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${assessment.title}"?`)) {
      deleteMutation.mutate(assessment.id, {
        onSuccess: () => {
          toast.success("Assessment deleted successfully!");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to delete assessment");
        },
      });
    }
  };

  const isBusy = isPending || deleteMutation.isPending || duplicateMutation.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isBusy}
          aria-label="Assessment actions"
          className="h-8 w-8 text-slate-500 hover:text-slate-900"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {!isArchived && (
          <DropdownMenuItem
            onClick={() => router.push(`/assessments/${assessment.id}/edit`)}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4 text-slate-600" />
            Edit
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleDuplicate}
          disabled={duplicateMutation.isPending}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4 text-slate-600" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isDraft && (
          <DropdownMenuItem
            onClick={() => onPublish && onPublish(assessment.id)}
            className="cursor-pointer text-blue-600 focus:text-blue-600"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        )}

        {isPublished && (
          <DropdownMenuItem
            onClick={() => onArchive && onArchive(assessment.id)}
            className="cursor-pointer text-amber-600 focus:text-amber-600"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}

        {isArchived && (
          <DropdownMenuItem
            onClick={() => onRestore && onRestore(assessment.id)}
            className="cursor-pointer text-green-600 focus:text-green-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AssessmentCardActions;
