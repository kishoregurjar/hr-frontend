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

  const updateProgress = useUpdateAttemptProgress();
  const submitAttempt = useSubmitAttempt();

  const handleReviewSection = (sectionIndex) => {
    updateProgress.mutate(
      {
        attemptId: attempt?.id || attemptId,
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
        attemptId: attempt?.id || attemptId,
        assessment: effectiveAssessment,
      },
      {
        onSuccess: () => {
          setSubmitDialogOpen(false);
        },
      }
    );
  };

  // ── 1. Fast Candidate Loading Check ──────────────────────
  if (attemptLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-600">Loading assessment environment...</p>
        </div>
      </div>
    );
  }

  // ── 2. Error / Missing Attempt ────────────────────────────
  if (attemptError || !attempt) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Assessment session unavailable</h1>
          <p className="mt-2 text-xs text-slate-500">
            This assessment attempt could not be loaded or may have expired. Please use your original invitation link.
          </p>
        </div>
      </div>
    );
  }

  // ── 3. Direct Assessment Resolution from Attempt Context ──
  const assessmentObj = attempt?.assessment || {};

  const rawCandidateQuestions =
    (attempt?.questions?.length ? attempt.questions : null) ||
    (assessmentObj?.questions?.length ? assessmentObj.questions : null) ||
    (assessmentObj?.AssessmentQuestion?.length ? assessmentObj.AssessmentQuestion : null) ||
    (assessmentObj?.AssessmentQuestions?.length ? assessmentObj.AssessmentQuestions : null) ||
    (assessmentObj?.assessmentQuestion?.length ? assessmentObj.assessmentQuestion : null) ||
    (assessmentObj?.assessmentQuestions?.length ? assessmentObj.assessmentQuestions : null) ||
    [];

  const hydratedQuestions = rawCandidateQuestions.map((qItem) => {
    const qObj =
      (typeof qItem === "object" && qItem?.question && typeof qItem.question === "object" ? qItem.question : null) ||
      (typeof qItem === "object" && qItem?.Question && typeof qItem.Question === "object" ? qItem.Question : null) ||
      (typeof qItem === "object" ? qItem : {});

    const resolvedOptions =
      (Array.isArray(qObj?.options) && qObj.options.length > 0 ? qObj.options : null) ||
      (Array.isArray(qItem?.options) && qItem.options.length > 0 ? qItem.options : null) ||
      (Array.isArray(qObj?.Option) && qObj.Option.length > 0 ? qObj.Option : null) ||
      (Array.isArray(qItem?.Option) && qItem.Option.length > 0 ? qItem.Option : null) ||
      (Array.isArray(qObj?.questionOptions) && qObj.questionOptions.length > 0 ? qObj.questionOptions : null) ||
      (Array.isArray(qItem?.questionOptions) && qItem.questionOptions.length > 0 ? qItem.questionOptions : null) ||
      [];

    const questionTitle = String(
      (qObj?.content && qObj.content.trim() && !/^Question\s+\d+$/i.test(qObj.content.trim()) ? qObj.content : null) ||
      (qObj?.title && qObj.title.trim() && !/^Question\s+\d+$/i.test(qObj.title.trim()) ? qObj.title : null) ||
      (qObj?.question && qObj.question.trim() && !/^Question\s+\d+$/i.test(qObj.question.trim()) ? qObj.question : null) ||
      (qItem?.content && qItem.content.trim() && !/^Question\s+\d+$/i.test(qItem.content.trim()) ? qItem.content : null) ||
      (qItem?.title && qItem.title.trim() && !/^Question\s+\d+$/i.test(qItem.title.trim()) ? qItem.title : null) ||
      (qItem?.question && qItem.question.trim() && !/^Question\s+\d+$/i.test(qItem.question.trim()) ? qItem.question : null) ||
      qObj?.content ||
      qObj?.title ||
      qObj?.question ||
      qItem?.content ||
      qItem?.title ||
      qItem?.question ||
      ""
    );

    return {
      ...qObj,
      ...qItem,
      id: String(qObj?.id || qObj?._id || qItem?.id || qItem?._id || qItem?.questionId || ""),
      title: questionTitle,
      question: questionTitle,
      content: qObj?.content || qItem?.content || questionTitle,
      codeSnippet: qObj?.codeSnippet || qItem?.codeSnippet || null,
      explanation: qObj?.explanation || qItem?.explanation || null,
      options: resolvedOptions,
    };
  });

  const effectiveAssessment = {
    id: assessmentObj?.id || attempt?.assessmentId,
    title: assessmentObj?.title || attempt?.assessmentTitle || attempt?.assessment?.title || "Candidate Assessment",
    description: assessmentObj?.description || attempt?.assessmentDescription || attempt?.assessment?.description || "Assessment session in progress.",
    durationMinutes: assessmentObj?.durationMinutes || attempt?.durationMinutes || 60,
    passingScore: assessmentObj?.passingScore || attempt?.passingScore || 70,
    questions: hydratedQuestions,
    games: assessmentObj?.selectedGameIds || assessmentObj?.AssessmentGames || assessmentObj?.games || attempt?.games || [],
  };

  // ── 4. Completed State ──────────────────────────────────────
  if (attempt.status === "Completed") {
    return (
      <AssessmentCompleted assessment={effectiveAssessment} attempt={attempt} />
    );
  }

  // ── 5. Review Mode ──────────────────────────────────────────
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

  // ── 6. Active Assessment Runtime Engine ─────────────────────
  return (
    <AssessmentRuntime
      assessment={effectiveAssessment}
      attempt={attempt}
      onReview={() => setIsReviewing(true)}
    />
  );
};

export default AssessmentAttempt;
