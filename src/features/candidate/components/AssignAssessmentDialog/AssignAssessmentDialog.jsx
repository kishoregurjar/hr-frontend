"use client";

import { useMemo, useState, useEffect } from "react";
import { ClipboardList, Users, Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { useAssignAssessment } from "../../hooks";

const AssignAssessmentDialog = ({
  open,
  onOpenChange,
  candidates = [],
  preselectedAssessmentId = null,
  defaultAssessmentId = null,
  onAssigned,
  onSuccess,
}) => {
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: assessments = [],
    isLoading,
    isError,
  } = useAssessmentsQuery(undefined, { enabled: Boolean(open) });

  const assignAssessment = useAssignAssessment();

  const availableAssessments = useMemo(() => {
    const list = Array.isArray(assessments) ? [...assessments] : [];

    // Sort so PUBLISHED assessments come first, followed by DRAFT
    return list.sort((a, b) => {
      const aIsPub = String(a?.status || "").toUpperCase() === "PUBLISHED" || String(a?.status || "").toUpperCase() === "ACTIVE";
      const bIsPub = String(b?.status || "").toUpperCase() === "PUBLISHED" || String(b?.status || "").toUpperCase() === "ACTIVE";
      if (aIsPub && !bIsPub) return -1;
      if (!aIsPub && bIsPub) return 1;
      return 0;
    });
  }, [assessments]);

  // Set default selection when dialog opens or preselectedAssessmentId changes
  useEffect(() => {
    if (!open) return;
    const targetId = preselectedAssessmentId || defaultAssessmentId;
    if (targetId) {
      setAssessmentId(String(targetId));
    } else if (availableAssessments.length > 0 && !assessmentId) {
      setAssessmentId(String(availableAssessments[0].id));
    }
  }, [open, availableAssessments, assessmentId, preselectedAssessmentId, defaultAssessmentId]);

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
          toast.success("Assessment assigned and invitation sent successfully!");
          onAssigned?.();
          onSuccess?.();
          handleOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to assign assessment."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl font-sans bg-white">
        {/* ── 1. SIGNATURE EXECUTIVE HEADER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              <ClipboardList className="h-5 w-5 text-blue-300" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black tracking-tight text-white">
                  Assign Assessment
                </DialogTitle>
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  Dispatch
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-300 font-medium leading-relaxed">
                Select a screening test to generate unique assessment tokens for candidates.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── 2. BODY CONTENT ── */}
        <div className="p-6 space-y-5">
          {/* Candidates Summary Pill */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Target Recipients:</span>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-extrabold px-2.5 py-0.5">
              {candidates.length} {candidates.length === 1 ? "Candidate" : "Candidates"} Selected
            </Badge>
          </div>

          {/* Assessment Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Select Assessment Module <span className="text-rose-500">*</span>
            </Label>

            <select
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
              disabled={assignAssessment.isPending}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs transition cursor-pointer"
            >
              {availableAssessments.map((assessment) => {
                const isPub =
                  String(assessment?.status || "").toUpperCase() === "PUBLISHED" ||
                  String(assessment?.status || "").toUpperCase() === "ACTIVE";
                return (
                  <option
                    key={assessment.id}
                    value={String(assessment.id)}
                    className="font-medium text-slate-800 py-1"
                  >
                    {assessment.title} {assessment.durationMinutes ? `(${assessment.durationMinutes}m)` : ""} {isPub ? "• [Published]" : "• [Draft]"}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Recipients List Preview */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Recipients Breakdown
            </Label>

            <div className="max-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200/90 bg-slate-50/50 p-2.5 divide-y divide-slate-100">
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
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>

          {assignAssessment.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs text-rose-700 font-semibold">
                {assignAssessment.error.message || "Unable to assign assessment."}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={assignAssessment.isPending}
              className="h-9 px-4 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              {assignAssessment.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Assign Assessment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAssessmentDialog;
