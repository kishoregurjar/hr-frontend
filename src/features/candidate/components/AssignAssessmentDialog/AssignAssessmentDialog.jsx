"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssessmentsQuery } from "@/features/assessment/hooks";

import { useAssignAssessment } from "../../hooks";

const AssignAssessmentDialog = ({
  open,
  onOpenChange,
  candidates = [],
  onAssigned,
}) => {
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: assessments = [],
    isLoading,
    isError,
  } = useAssessmentsQuery();

  const assignAssessment = useAssignAssessment();

  const availableAssessments = useMemo(() => {
    return assessments.filter(
      (assessment) => assessment.status === "Published"
    );
  }, [assessments]);

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setAssessmentId("");
      assignAssessment.reset();
    }
  };

  const handleAssign = () => {
    if (!assessmentId) {
      return;
    }

    assignAssessment.mutate(
      {
        assessmentId,
        candidateIds: candidates.map((candidate) => candidate.id),
      },
      {
        onSuccess: () => {
          onAssigned?.();
          handleOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Assessment</DialogTitle>
          <DialogDescription>
            Choose an assessment for the selected candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <p className="font-medium">
              {candidates.length}{" "}
              {candidates.length === 1 ? "candidate" : "candidates"}{" "}
              selected
            </p>
          </div>

          <div className="space-y-2">
            <Label>Assessment</Label>

            <Select
              value={assessmentId}
              onValueChange={setAssessmentId}
              disabled={isLoading || assignAssessment.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose assessment" />
              </SelectTrigger>

              <SelectContent>
                {availableAssessments.map((assessment) => (
                  <SelectItem
                    key={assessment.id}
                    value={String(assessment.id)}
                  >
                    {assessment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoading && (
              <p className="text-sm text-muted-foreground">
                Loading assessments...
              </p>
            )}

            {isError && (
              <p className="text-sm text-destructive font-medium">
                Unable to load assessments.
              </p>
            )}

            {!isLoading && !isError && availableAssessments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No published assessments available.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Candidates</Label>

            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {candidate.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {assignAssessment.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
              <p className="text-sm text-destructive font-medium">
                {assignAssessment.error.message ||
                  "Unable to assign assessment."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={assignAssessment.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleAssign}
              disabled={
                !assessmentId ||
                candidates.length === 0 ||
                assignAssessment.isPending
              }
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {assignAssessment.isPending
                ? "Assigning..."
                : "Assign Assessment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAssessmentDialog;
