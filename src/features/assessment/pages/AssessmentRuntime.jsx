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
  const activeAssessment = assessment || {
    id: attempt?.assessmentId || "cmtjpcxzw0001vd0glu1856",
    title: "Full Stack Developer Assessment - React & Node.js",
    description: "Comprehensive hiring assessment evaluating candidate proficiency in React frontend development, Node.js backend APIs, database design, and cognitive problem-solving logic.",
    durationMinutes: attempt?.durationMinutes || 60,
    passingScore: 70,
    sections: [
      {
        id: "sec-game-zip",
        title: "Module 1: Zip Grid Pathfinder",
        type: "game",
        gameId: "zip",
        slug: "zip",
        weight: 25,
      },
      {
        id: "sec-game-tango",
        title: "Module 2: Tango Spatial Deduction",
        type: "game",
        gameId: "tango",
        slug: "tango",
        weight: 25,
      },
      {
        id: "sec-game-sudoku",
        title: "Module 3: Mini Sudoku 6x6 Challenge",
        type: "game",
        gameId: "sudoku",
        slug: "sudoku",
        weight: 25,
      },
      {
        id: "sec-game-mahjong",
        title: "Module 4: Mahjong Tile Match Strategy",
        type: "game",
        gameId: "mahjong",
        slug: "mahjong",
        weight: 25,
      },
    ],
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
