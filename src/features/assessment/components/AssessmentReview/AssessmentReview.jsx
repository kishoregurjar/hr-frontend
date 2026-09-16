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
  Sparkles,
  Trophy,
  Save,
  Check,
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
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Review & Publish Assessment
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
              Review the module configurations, question pool, and grading settings before saving.
            </p>
          </div>

          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold gap-1 px-3 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Ready to Publish
          </Badge>
        </div>

        {/* Validation Errors Banner */}
        {hasErrors && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-1 text-rose-700 text-xs">
            <p className="font-bold flex items-center gap-1.5">
              <TriangleAlert className="h-4 w-4 text-rose-600" />
              Please resolve the following issues before creating:
            </p>
            <ul className="list-disc pl-6 space-y-0.5 font-medium">
              {Object.entries(validationErrors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submission Error Banner */}
        {displayError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs">
            <p className="font-bold">Unable to save assessment</p>
            <p className="mt-0.5 font-medium">{displayError.message || "Please try again."}</p>
          </div>
        )}

        {/* 1. Basic Details Summary */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              1. Assessment Overview
            </h3>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
              {assessment?.difficulty ?? "Medium"}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Assessment Title</p>
              <p className="mt-1 font-extrabold text-slate-900 text-sm">
                {assessment?.title || "Untitled Assessment"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Allocated Time</p>
              <p className="mt-1 font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                {assessment?.durationMinutes ?? assessment?.duration ?? 45} mins
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Passing Benchmark</p>
              <p className="mt-1 font-extrabold text-emerald-600 text-sm flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                {assessment?.passingScore ?? 70}%
              </p>
            </div>
          </div>

          {assessment?.description && (
            <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
              {assessment.description}
            </p>
          )}
        </div>

        {/* 2. Selected Games Summary */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                2. Cognitive Games ({selectedGames.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Module Weight: <strong className="text-slate-900">{assessment?.gameWeight ?? 60}%</strong>
            </span>
          </div>

          {selectedGames.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No cognitive games selected.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                      <Gamepad2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-slate-900">{game.title}</span>
                  </div>
                  <Badge className="bg-white text-indigo-700 border-indigo-200 text-[10px] font-bold">
                    {game.type || "Cognitive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Selected Questions Summary */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                3. Technical & MCQ Questions ({selectedQuestions.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Module Weight: <strong className="text-slate-900">{assessment?.quizWeight ?? 40}%</strong>
            </span>
          </div>

          {selectedQuestions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No questions selected.</p>
          ) : (
            <div className="space-y-2">
              {selectedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs"
                >
                  <p className="font-bold text-slate-800 truncate max-w-xl">
                    <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                    {q.question || q.title}
                  </p>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold shrink-0 ml-2">
                    {q.category || "General"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Weightage Breakdown */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">4. Weightage & Scoring Breakdown</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-600">Technical Quiz Weight</span>
              <span className="font-black text-slate-900 text-sm">{assessment?.quizWeight ?? 40}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-600">Cognitive Game Weight</span>
              <span className="font-black text-slate-900 text-sm">{assessment?.gameWeight ?? 60}%</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Settings
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {isSubmitting && submitAction === "draft" ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                  Saving Draft...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5 text-slate-500" />
                  Save as Draft
                </span>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onPublish}
              disabled={isSubmitting}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {isSubmitting && submitAction === "publish" ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing Assessment...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Publish Assessment
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mode 2: Candidate Attempt Completion Review Mode ─────────────────
  const review = getAssessmentReview({ assessment, attempt });
  const progress = review.totalSections > 0 ? (review.completedSections / review.totalSections) * 100 : 0;
  const displayError = error || submitError;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <header className="sticky top-0 z-20 border-b bg-white shadow-2xs">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assessment Review</p>
            <h1 className="truncate text-lg font-extrabold text-slate-900">{assessment.title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-sm text-slate-900">Total Completion</p>
            <p className="text-xs font-bold text-slate-500">
              {review.completedSections} / {review.totalSections} sections
            </p>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-6 shadow-2xs">
          {review.sections.map((item) => (
            <ReviewSectionItem key={item.section.id} item={item} onReview={onReviewSection} />
          ))}
        </div>

        {displayError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs">
            <p className="font-bold">Unable to submit assessment</p>
            <p className="mt-0.5 font-medium">{displayError.message || "Please try again."}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="rounded-xl border-slate-200 text-xs font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>

          <Button type="button" onClick={onSubmit} disabled={!review.isComplete} className="rounded-xl bg-blue-600 text-white text-xs font-bold">
            <Send className="mr-2 h-4 w-4" />
            Submit Assessment
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentReview;
