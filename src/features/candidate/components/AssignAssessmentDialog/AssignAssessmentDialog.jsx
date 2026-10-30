"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Users,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
  FileQuestion,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
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
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: assessments = [],
    isLoading,
    isError,
  } = useAssessmentsQuery(undefined, { enabled: Boolean(open) });

  const assignAssessment = useAssignAssessment();

  const [activeCandidates, setActiveCandidates] = useState(candidates);

  useEffect(() => {
    setActiveCandidates(candidates);
  }, [candidates, open]);

  const handleRemoveCandidate = (candidateId) => {
    setActiveCandidates((prev) => prev.filter((c) => String(c.id) !== String(candidateId)));
  };

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
    if (!assessmentId || activeCandidates.length === 0) {
      return;
    }

    const firstCandidate = activeCandidates[0] || {};
    const firstCandidateName = firstCandidate.name || "";
    const nameParts = typeof firstCandidateName === "string" ? firstCandidateName.split(" ") : [];

    const existingCandidateIds = activeCandidates
      .map((c) => c.id)
      .filter(Boolean);

    const adHocCandidates = activeCandidates
      .filter((c) => !c.id)
      .map((c) => {
        const cName = c.name || "";
        const cParts = typeof cName === "string" ? cName.split(" ") : [];
        return {
          email: c.email,
          firstName: c.firstName || cParts[0] || "Candidate",
          lastName: c.lastName || cParts.slice(1).join(" ") || "",
        };
      });

    const mutatePayload = {
      assessmentId,
      email: firstCandidate.email,
      firstName: firstCandidate.firstName || nameParts[0] || "Candidate",
      lastName: firstCandidate.lastName || nameParts.slice(1).join(" ") || "",
    };

    if (existingCandidateIds.length > 0) {
      mutatePayload.candidateIds = existingCandidateIds;
    }
    if (adHocCandidates.length > 0) {
      mutatePayload.candidates = adHocCandidates;
    }

    assignAssessment.mutate(
      mutatePayload,
      {
        onSuccess: () => {
          toast.success("Assessment assigned and invitation sent successfully!");
          onAssigned?.();
          onSuccess?.();
          handleOpenChange(false);
        },
        onError: (err) => {
          const rawMessage =
            err?.response?.data?.message ||
            err?.message ||
            "";

          const isDuplicate =
            err?.response?.status === 409 ||
            err?.status === 409 ||
            err?.response?.data?.code === "CONFLICT" ||
            err?.response?.data?.code === "INVITATION_ALREADY_EXISTS" ||
            err?.code === "CONFLICT" ||
            rawMessage.toLowerCase().includes("already has an active invitation") ||
            rawMessage.toLowerCase().includes("active invitation already exists");

          const errorMessage = isDuplicate
            ? "This candidate already has an active invitation for this assessment."
            : rawMessage || "Failed to assign assessment.";

          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white">
        {/* ── 1. SIGNATURE EXECUTIVE HEADER ── */}
        <div className="bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black tracking-tight text-white">
                  Assign Assessment
                </DialogTitle>
                <span className="text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                  Dispatch
                </span>
              </div>
              <DialogDescription className="text-xs text-white/85 font-medium leading-relaxed">
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
              {activeCandidates.length} {activeCandidates.length === 1 ? "Candidate" : "Candidates"} Selected
            </Badge>
          </div>

          {/* Assessment Dropdown or Empty State CTA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Select Assessment Module <span className="text-rose-500">*</span>
              </Label>
              {availableAssessments.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenChange(false);
                    router.push("/assessments/create");
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>Build New</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 p-3.5 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                <span className="font-medium">Loading configured assessments...</span>
              </div>
            ) : availableAssessments.length === 0 ? (
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50/80 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100/90 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileQuestion className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900">
                      No Assessments Created Yet
                    </h4>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                      You must create at least one assessment test before you can dispatch invites to candidates.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    handleOpenChange(false);
                    router.push("/assessments/create");
                  }}
                  className="w-full h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create Assessment Now</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            ) : (
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
            )}
          </div>

          {/* Recipients List Preview */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Recipients Breakdown
            </Label>

            <div className="max-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200/90 bg-slate-50/50 p-2.5 divide-y divide-slate-100">
              {activeCandidates.map((candidate) => (
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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Ready
                    </span>
                    {activeCandidates.length > 1 && (
                      <button
                        type="button"
                        title="Remove candidate"
                        onClick={() => handleRemoveCandidate(candidate.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-0.5 rounded transition cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {assignAssessment.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs text-rose-700 font-semibold">
                {(() => {
                  const rawMessage =
                    assignAssessment.error?.response?.data?.message ||
                    assignAssessment.error?.message ||
                    "";
                  const isDuplicate =
                    assignAssessment.error?.response?.status === 409 ||
                    assignAssessment.error?.status === 409 ||
                    assignAssessment.error?.response?.data?.code === "CONFLICT" ||
                    assignAssessment.error?.response?.data?.code === "INVITATION_ALREADY_EXISTS" ||
                    assignAssessment.error?.code === "CONFLICT" ||
                    rawMessage.toLowerCase().includes("already has an active invitation") ||
                    rawMessage.toLowerCase().includes("active invitation already exists");

                  if (isDuplicate) {
                    return "This candidate already has an active invitation for this assessment.";
                  }
                  if (rawMessage.toLowerCase().includes("database request validation") || rawMessage.toLowerCase().includes("invalid_query_argument")) {
                    return "Unable to process invitation for one or more selected candidates. Please verify candidate details.";
                  }
                  return rawMessage || "Unable to assign assessment.";
                })()}
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
                availableAssessments.length === 0 ||
                assignAssessment.isPending
              }
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
