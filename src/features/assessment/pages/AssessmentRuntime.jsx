"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

import {
  AssessmentCompleted,
  AssessmentReview,
  AssessmentRuntime,
  SubmitAssessmentDialog,
} from "../components";
import {
  useAttemptQuery,
  useAssessmentQuery,
  useSubmitAttempt,
  useUpdateAttemptProgress,
} from "../hooks";

const AssessmentAttempt = ({ attemptId }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const {
    data: attempt,
    isLoading: attemptLoading,
    isError: attemptError,
  } = useAttemptQuery(attemptId);

  const {
    data: assessment,
    isLoading: assessmentLoading,
    isError: assessmentError,
  } = useAssessmentQuery(attempt?.assessmentId);

  const updateProgress = useUpdateAttemptProgress();
  const submitAttempt = useSubmitAttempt();

  const handleReviewSection = (sectionIndex) => {
    updateProgress.mutate(
      {
        attemptId: attempt.id,
        currentSection: sectionIndex,
      },
      {
        onSuccess: () => {
          setIsReviewing(false);
        },
      }
    );
  };

  const handleSubmit = () => {
    submitAttempt.mutate(
      {
        attemptId: attempt.id,
        assessment,
      },
      {
        onSuccess: () => {
          setSubmitDialogOpen(false);
        },
      }
    );
  };

  // ── Loading ──────────────────────────────────────────────
  if (attemptLoading || assessmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (attemptError || assessmentError || !attempt || !assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold">Assessment unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This assessment attempt could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  // ── Completed State ──────────────────────────────────────
  if (attempt.status === "Completed") {
    return (
      <AssessmentCompleted assessment={assessment} attempt={attempt} />
    );
  }

  // ── Review Mode ──────────────────────────────────────────
  if (isReviewing) {
    return (
      <>
        <AssessmentReview
          assessment={assessment}
          attempt={attempt}
          onBack={() => setIsReviewing(false)}
          onReviewSection={handleReviewSection}
          onSubmit={() => setSubmitDialogOpen(true)}
          submitError={submitAttempt.error}
        />

        <SubmitAssessmentDialog
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
          onConfirm={handleSubmit}
          isSubmitting={submitAttempt.isPending}
        />
      </>
    );
  }

  // ── Runtime Engine ───────────────────────────────────────
  return (
    <AssessmentRuntime
      assessment={assessment}
      attempt={attempt}
      onReview={() => setIsReviewing(true)}
    />
  );
};

export default AssessmentAttempt;
