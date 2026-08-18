"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useInvitationQuery,
  useStartAttempt,
} from "@/features/assessment/hooks";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

const CandidateInvitation = ({ token }) => {
  const router = useRouter();

  const {
    data: invitation,
    isLoading,
    isError,
    error,
  } = useInvitationQuery(token);

  const startAttempt = useStartAttempt();

  const handleStart = () => {
    if (!invitation) return;

    const { assignment, assessment } = invitation;

    startAttempt.mutate(
      {
        assignmentId: assignment.id,
        candidateId: assignment.candidateId,
        assessmentId: assessment.id,
      },
      {
        onSuccess: (attempt) => {
          router.push(`/assessment/attempt/${attempt.id}`);
        },
      }
    );
  };

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Validating your invitation...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Invitation Unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error?.message ||
              "This assessment link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  const { assignment, candidate, assessment } = invitation;

  const alreadyStarted =
    assignment.status === "In Progress" ||
    assignment.status === "Completed";

  // ── Landing Page ─────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-2xl shadow-md">
            H
          </div>
          <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
            HireQuest
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="border-b bg-slate-50 px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assessment Invitation
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 leading-tight">
              {assessment.title}
            </h1>
            {assessment.description && (
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {assessment.description}
              </p>
            )}
          </div>

          {/* Card Body */}
          <div className="px-8 py-6 space-y-6">
            {/* Candidate greeting */}
            <p className="text-sm text-slate-600">
              Hi{" "}
              <span className="font-semibold text-slate-900">
                {candidate.name}
              </span>
              , you have been invited to take this assessment.
            </p>

            {/* Assessment Info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                icon={Clock}
                label="Duration"
                value={`${assessment.duration ?? "--"} minutes`}
              />
              <InfoRow
                icon={FileText}
                label="Passing Score"
                value={`${assessment.passingScore ?? "--"}%`}
              />
              <InfoRow
                icon={CheckCircle2}
                label="Attempts Allowed"
                value={assessment.attemptsAllowed ?? 1}
              />
              <InfoRow
                icon={CheckCircle2}
                label="Status"
                value={assignment.status}
              />
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Instructions
              </p>
              <ul className="space-y-1 text-sm text-blue-800 list-disc list-inside">
                <li>Ensure you have a stable internet connection.</li>
                <li>Do not refresh or close the browser during the test.</li>
                <li>Once started, the timer cannot be paused.</li>
                {assessment.shuffleQuestions && (
                  <li>Questions will appear in random order.</li>
                )}
              </ul>
            </div>

            {/* Already Completed Warning */}
            {alreadyStarted && assignment.status === "Completed" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800 font-medium">
                  You have already completed this assessment.
                </p>
              </div>
            )}

            {/* CTA */}
            <Button
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
              onClick={handleStart}
              disabled={
                startAttempt.isPending ||
                assignment.status === "Completed"
              }
            >
              {startAttempt.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : alreadyStarted && assignment.status !== "Completed" ? (
                <>
                  Continue Assessment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : assignment.status === "Completed" ? (
                "Assessment Completed"
              ) : (
                <>
                  Start Assessment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {startAttempt.isError && (
              <p className="text-sm text-destructive text-center font-medium">
                {startAttempt.error?.message ||
                  "Failed to start. Please try again."}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by HireQuest — Game-Based Hiring Platform
        </p>
      </div>
    </div>
  );
};

export default CandidateInvitation;
