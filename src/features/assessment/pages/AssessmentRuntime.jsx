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
import { useQuestionsQuery } from "@/features/question-bank/hooks";

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

  const { data: allDatabaseQuestions = [] } = useQuestionsQuery();

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

  // ── Dynamic Assessment Resolution with Database Hydration ─────────────────
  const rawCandidateQuestions =
    (assessment?.questions?.length ? assessment.questions : null) ||
    (assessment?.AssessmentQuestion?.length ? assessment.AssessmentQuestion : null) ||
    (assessment?.AssessmentQuestions?.length ? assessment.AssessmentQuestions : null) ||
    (assessment?.assessmentQuestion?.length ? assessment.assessmentQuestion : null) ||
    (assessment?.assessmentQuestions?.length ? assessment.assessmentQuestions : null) ||
    (attempt?.questions?.length ? attempt.questions : null) ||
    [];

  const hydratedQuestions = (rawCandidateQuestions.length > 0 ? rawCandidateQuestions : allDatabaseQuestions).map((qItem) => {
    const qObj =
      (typeof qItem === "object" && qItem?.question && typeof qItem.question === "object" ? qItem.question : null) ||
      (typeof qItem === "object" && qItem?.Question && typeof qItem.Question === "object" ? qItem.Question : null) ||
      (typeof qItem === "object" ? qItem : {});

    const targetId = String(
      qObj?.id || qObj?._id || qObj?.questionId || qItem?.questionId || qItem?.id || qItem?._id || ""
    );
    const targetTitle = String(
      qObj?.question || qObj?.title || qItem?.question || qItem?.title || ""
    );

    const match = allDatabaseQuestions.find(
      (q) =>
        (targetId && String(q.id || q._id) === targetId) ||
        (targetTitle && String(q.title || q.question) === targetTitle)
    );

    return match || qObj || qItem;
  });

  const activeAssessment = {
    id: assessment?.id || attempt?.assessmentId,
    title: assessment?.title || attempt?.assessmentTitle || attempt?.assessment?.title || "Candidate Assessment",
    description: assessment?.description || attempt?.assessmentDescription || attempt?.assessment?.description || "Assessment session in progress.",
    durationMinutes: assessment?.durationMinutes || attempt?.durationMinutes || 60,
    passingScore: assessment?.passingScore || attempt?.passingScore || 70,
    questions: hydratedQuestions.length > 0 ? hydratedQuestions : allDatabaseQuestions,
    games: assessment?.selectedGameIds || assessment?.AssessmentGames || assessment?.games || attempt?.games || [],
  };

  if ((attemptError && !attempt) || (!attempt && !activeAssessment)) {
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

  const effectiveAssessment = activeAssessment;

  // ── Completed State ──────────────────────────────────────
  if (attempt.status === "Completed") {
    return (
      <AssessmentCompleted assessment={effectiveAssessment} attempt={attempt} />
    );
  }

  // ── Review Mode ──────────────────────────────────────────
  if (isReviewing) {
    return (
      <>
        <AssessmentReview
          assessment={effectiveAssessment}
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
      assessment={effectiveAssessment}
      attempt={attempt}
      onReview={() => setIsReviewing(true)}
    />
  );
};

export default AssessmentAttempt;
