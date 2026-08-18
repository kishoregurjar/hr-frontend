"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Gamepad2,
  HelpCircle,
  Loader2,
  Send,
  Sliders,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { getAssessmentReview } from "../../utils";
import ReviewSectionItem from "./ReviewSectionItem";

const AssessmentReview = ({
  assessment,
  attempt,
  games = [],
  questions = [],
  onBack,
  onReviewSection,
  onSubmit,
  onPublish,
  onSaveDraft,
  isSubmitting = false,
  submitAction = null,
  submitError = null,
  error = null,
  validationErrors = {},
}) => {
  // ── Mode 1: HR Builder Mode (Creating / Editing Assessment) ──────────
  if (onPublish || onSaveDraft) {
    const selectedGames = games.filter((g) =>
      (assessment?.selectedGameIds ?? []).map(String).includes(String(g.id))
    );

    const selectedQuestions = questions.filter((q) =>
      (assessment?.selectedQuestionIds ?? []).map(String).includes(String(q.id))
    );

    const displayError = error || submitError;
    const hasErrors = Object.keys(validationErrors ?? {}).length > 0;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Review & Publish Assessment
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Check your assessment configuration before publishing.
          </p>
        </div>

        {/* Validation Errors Banner */}
        {hasErrors && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 space-y-1">
            <p className="font-semibold text-destructive">
              Please fix the following issues before publishing:
            </p>
            <ul className="list-disc pl-5 text-sm text-destructive">
              {Object.entries(validationErrors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submission Error Banner */}
        {displayError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="font-semibold text-destructive">
              Unable to save assessment
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {displayError.message || "Please try again."}
            </p>
          </div>
        )}

        {/* 1. Basic Details Summary */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-slate-900">1. Basic Information</h3>
            <Badge variant="outline">{assessment?.difficulty ?? "Medium"}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Title</p>
              <p className="mt-1 font-semibold text-slate-900">
                {assessment?.title || "Untitled Assessment"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Duration</p>
              <p className="mt-1 font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {assessment?.durationMinutes ?? assessment?.duration ?? 45} minutes
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Passing Score</p>
              <p className="mt-1 font-semibold text-slate-900">
                {assessment?.passingScore ?? 70}%
              </p>
            </div>
          </div>

          {assessment?.description && (
            <p className="text-xs text-slate-600 border-t pt-3">
              {assessment.description}
            </p>
          )}
        </div>

        {/* 2. Selected Games Summary */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-slate-900">
                2. Cognitive Games ({selectedGames.length})
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Weight: {assessment?.gameWeight ?? 60}%
            </p>
          </div>

          {selectedGames.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No games selected.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                >
                  <p className="text-sm font-semibold text-slate-800">{game.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {game.type || "Cognitive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Selected Questions Summary */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-slate-900">
                3. Multiple Choice Questions ({selectedQuestions.length})
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Weight: {assessment?.quizWeight ?? 40}%
            </p>
          </div>

          {selectedQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No questions selected.</p>
          ) : (
            <div className="space-y-2">
              {selectedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 text-sm"
                >
                  <p className="font-medium text-slate-800 truncate max-w-lg">
                    {idx + 1}. {q.question || q.title}
                  </p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {q.category || "General"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Weightage & Settings Summary */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b pb-3">
            <Sliders className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-slate-900">4. Weightage Breakdown</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Quiz Weight</span>
              <span className="font-bold text-slate-900">{assessment?.quizWeight ?? 40}%</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Game Weight</span>
              <span className="font-bold text-slate-900">{assessment?.gameWeight ?? 60}%</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting && submitAction === "draft" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Draft...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>

            <Button
              type="button"
              onClick={onPublish}
              disabled={isSubmitting}
            >
              {isSubmitting && submitAction === "publish" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Assessment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mode 2: Candidate Attempt Completion Review Mode ─────────────────
  const review = getAssessmentReview({
    assessment,
    attempt,
  });

  const progress =
    review.totalSections > 0
      ? (review.completedSections / review.totalSections) * 100
      : 0;

  const displayError = error || submitError;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Assessment Review
          </p>
          <h1 className="mt-0.5 truncate text-xl font-semibold text-slate-900">
            {assessment.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Review Your Assessment
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Check your progress before submitting the assessment.
          </p>
        </div>

        {/* Completion Progress Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900">Completion</p>
            <p className="text-sm font-semibold tabular-nums text-muted-foreground">
              {review.completedSections} / {review.totalSections} sections
            </p>
          </div>
          <Progress value={progress} className="mt-3 h-2.5" />
        </div>

        {/* Section Review List */}
        <div className="rounded-xl border bg-card px-6 shadow-sm">
          {review.sections.map((item) => (
            <ReviewSectionItem
              key={item.section.id}
              item={item}
              onReview={onReviewSection}
            />
          ))}
        </div>

        {/* Validation Status Banner */}
        {review.isComplete ? (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Ready to submit</p>
              <p className="mt-0.5 text-sm text-green-700">
                All assessment sections are complete.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">Assessment incomplete</p>
              <p className="mt-0.5 text-sm text-amber-700">
                {review.incompleteSections}{" "}
                {review.incompleteSections === 1 ? "section is" : "sections are"}{" "}
                still incomplete.
              </p>
            </div>
          </div>
        )}

        {/* Submission Error Banner */}
        {displayError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
            <p className="font-medium text-destructive">
              Unable to submit assessment
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {displayError.message || "Please try again."}
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>

          <Button type="button" onClick={onSubmit} disabled={!review.isComplete}>
            <Send className="mr-2 h-4 w-4" />
            Submit Assessment
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentReview;
