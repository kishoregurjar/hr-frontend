"use client";

import { useMemo, useState, useEffect } from "react";
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
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { useAssignAssessment } from "../../hooks";

const AssignAssessmentDialog = ({
  open,
  onOpenChange,
  candidates = [],
  onAssigned,
  onSuccess,
}) => {
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: assessments = [],
    isLoading,
    isError,
  } = useAssessmentsQuery();

  const assignAssessment = useAssignAssessment();

  const availableAssessments = useMemo(() => {
    const list = Array.isArray(assessments) ? assessments : [];

    const published = list.filter((assessment) => {
      const s = String(assessment?.status || "").toLowerCase();
      return s === "published" || s === "active";
    });

    return published.length > 0 ? published : list;
  }, [assessments]);

  // Set default selection when dialog opens
  useEffect(() => {
    if (open && availableAssessments.length > 0 && !assessmentId) {
      setAssessmentId(String(availableAssessments[0].id));
    }
  }, [open, availableAssessments, assessmentId]);

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

    const firstCandidate = candidates[0] || {};
    const firstCandidateName = firstCandidate.name || "";
    const nameParts = typeof firstCandidateName === "string" ? firstCandidateName.split(" ") : [];

    assignAssessment.mutate(
      {
        assessmentId,
        candidateIds: candidates.map((candidate) => candidate.id),
        email: firstCandidate.email,
        firstName: firstCandidate.firstName || nameParts[0] || "Candidate",
        lastName: firstCandidate.lastName || nameParts.slice(1).join(" ") || "",
        candidates: candidates.map((c) => {
          const cName = c.name || "";
          const cParts = typeof cName === "string" ? cName.split(" ") : [];
          return {
            candidateId: c.id,
            email: c.email,
            firstName: c.firstName || cParts[0] || "Candidate",
            lastName: c.lastName || cParts.slice(1).join(" ") || "",
          };
        }),
      },
      {
        onSuccess: () => {
          onAssigned?.();
          onSuccess?.();
          handleOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl font-sans">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Assign Assessment
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Choose a multi-module screening assessment for the selected candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Candidates count badge */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Selected Candidates:</span>
            <span className="text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              {candidates.length} {candidates.length === 1 ? "Candidate" : "Candidates"}
            </span>
          </div>

          {/* Assessment Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Assessment
            </Label>

            <select
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
              disabled={assignAssessment.isPending}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs cursor-pointer"
            >
              {availableAssessments.map((assessment) => (
                <option
                  key={assessment.id}
                  value={String(assessment.id)}
                  className="font-medium text-slate-800 py-1"
                >
                  {assessment.title} {assessment.durationMinutes ? `(${assessment.durationMinutes}m)` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Candidate List preview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recipients
            </Label>

            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200/90 bg-slate-50/40 p-2.5 divide-y divide-slate-100">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between gap-4 py-1.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {candidate.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {candidate.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>

          {assignAssessment.error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-3">
              <p className="text-xs text-destructive font-medium">
                {assignAssessment.error.message || "Unable to assign assessment."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={assignAssessment.isPending}
              className="h-10 px-5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
              className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 gap-1.5"
            >
              <ClipboardList className="h-4 w-4" />
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
