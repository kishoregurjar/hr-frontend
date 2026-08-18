"use client";

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

import { useStartAssessment } from "@/features/attempt/hooks";
import { enterFullscreen } from "@/features/attempt/utils";

import {
  AssessmentCompleted,
  AssessmentPreStart,
  AssessmentUnavailable,
} from "../components";
import {
  useAssignmentAttemptQuery,
  useInvitationQuery,
} from "../hooks";
import { validateAssessmentStart } from "../utils";

const AssessmentInvitation = ({ token }) => {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useInvitationQuery(token);

  const assignmentId = data?.assignment?.id;
  const { data: existingAttempt } = useAssignmentAttemptQuery(assignmentId);

  const startAssessmentMutation = useStartAssessment(token);

  const handleStart = async () => {
    await enterFullscreen().catch(() => {});

    startAssessmentMutation.mutate(undefined, {
      onSuccess: ({ attempt }) => {
        router.push(`/assessment/attempt/${attempt.id}`);
      },
    });
  };

  // ── 1. Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground font-medium">
          Loading assessment details...
        </p>
      </div>
    );
  }

  // ── 2. Error / Missing Data ──────────────────────────────
  if (isError || !data) {
    return (
      <AssessmentUnavailable
        title="Invitation Unavailable"
        message={
          error?.message ||
          "This assessment invitation link is invalid or unavailable."
        }
      />
    );
  }

  const { assignment, assessment } = data;

  // ── 3. Completed State ──────────────────────────────────────
  if (assignment?.status === "Completed") {
    return <AssessmentCompleted />;
  }

  // ── 4. Expired State ────────────────────────────────────────
  if (assignment?.isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Assessment Link Expired
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This assessment invitation link has expired. Please contact the hiring team to request a new invitation link.
          </p>
        </div>
      </div>
    );
  }

  // ── 5. Invited State — Validation & Pre-Start ──────────────
  if (assignment?.status === "Invited") {
    const validation = validateAssessmentStart({ assignment, assessment });

    if (!validation.valid) {
      return <AssessmentUnavailable message={validation.message} />;
    }

    return (
      <>
        <AssessmentPreStart
          assessment={assessment}
          isStarting={startAssessmentMutation.isPending}
          onStart={handleStart}
        />

        {startAssessmentMutation.isError && (
          <div className="mx-auto mb-10 max-w-3xl px-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">
                {startAssessmentMutation.error?.message ||
                  "Unable to start assessment. Please try again."}
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── 6. Fallback / Resume State ─────────────────────────────
  if (existingAttempt) {
    router.push(`/assessment/attempt/${existingAttempt.id}`);
  }

  return (
    <AssessmentPreStart
      assessment={assessment}
      isStarting={startAssessmentMutation.isPending}
      onStart={handleStart}
    />
  );
};

export default AssessmentInvitation;
