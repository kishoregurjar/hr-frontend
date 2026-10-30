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
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    const selectedGameIdsList = assessment?.selectedGameIds || assessment?.games || [];
    const selectedGamesMap = new Map();
    selectedGameIdsList.forEach(g => {
      if (typeof g === "object" && g !== null) {
        const id = g.id || g.gameId || g._id;
        if (id) selectedGamesMap.set(String(id), g);
      } else if (g) {
        selectedGamesMap.set(String(g), { id: g });
      }
    });

    const selectedGames = games
      .filter((g) => selectedGamesMap.has(String(g.id)))
      .map((g) => {
        const selectedGameData = selectedGamesMap.get(String(g.id));
        const assessmentDifficulty = selectedGameData?.config?.difficulty || selectedGameData?.difficulty;
        return {
          ...g,
          difficulty: assessmentDifficulty || g.difficulty
        };
      });

    const selectedQuestions = questions.filter((q) =>
      (assessment?.selectedQuestionIds ?? []).map(String).includes(String(q.id))
    );

    const hasErrors = Object.keys(validationErrors ?? {}).length > 0;

    return (
      <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Review & Publish Assessment
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
              Review module configurations, questions pool, and grading settings before saving.
            </p>
          </div>

          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold gap-1 px-3 py-1 self-start sm:self-center">
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

        {/* 1. Basic Details Summary */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              1. Assessment Overview
            </h3>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
              {assessment?.difficulty || selectedGames[0]?.difficulty || "Standard"}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Assessment Title</p>
              <p className="mt-1 font-extrabold text-slate-900 text-sm">
                {assessment?.title || "Untitled Assessment"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Allocated Time</p>
              <p className="mt-1 font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-600" />
                {assessment?.durationMinutes ?? assessment?.duration ?? 45} mins
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Passing Benchmark</p>
              <p className="mt-1 font-extrabold text-emerald-600 text-sm flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                {assessment?.passingScore ?? 70}%
              </p>
            </div>
          </div>

          {assessment?.description && (
            <p className="text-xs text-slate-600 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
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
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-white text-indigo-700 border-indigo-200 text-[10px] font-bold">
                      {game.type || "Cognitive"}
                    </Badge>
                    {game.difficulty && (
                      <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                        String(game.difficulty).toLowerCase() === "easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : String(game.difficulty).toLowerCase() === "hard"
                          ? "bg-rose-50 text-rose-700 border-rose-300"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                      }`}>
                        {game.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Selected Questions Summary */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-600" />
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
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {selectedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs"
                >
                  <p className="font-bold text-slate-800 truncate max-w-xl">
                    <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                    {q.question || q.title}
                  </p>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold shrink-0 ml-2">
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
            <Sliders className="h-4 w-4 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900">4. Weightage & Scoring Breakdown</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <span className="font-semibold text-slate-600">Technical Quiz Weight</span>
              <span className="font-black text-slate-900 text-sm">{assessment?.quizWeight ?? 40}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <span className="font-semibold text-slate-600">Cognitive Game Weight</span>
              <span className="font-black text-slate-900 text-sm">{assessment?.gameWeight ?? 60}%</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Settings
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5 shadow-2xs transition-all cursor-pointer"
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
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#4E35E8] to-[#CF2E9F] hover:opacity-95 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer"
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                  Submission Ready
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Assessment Review
                </p>
              </div>
              <h1 className="truncate text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {assessment.title || "Online Assessment"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Session Verified & Auto-Saved
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 py-8">
        {/* Total Completion Progress Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <p className="font-black text-sm sm:text-base text-slate-900">Total Completion</p>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                {Math.round(progress)}% Finished
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              {review.completedSections} / {review.totalSections} sections completed
            </p>
          </div>

          {/* Custom Emerald-Teal Gradient Progress Bar */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 text-[11px] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Total Modules: <strong>{review.totalSections}</strong>
            </span>
            {review.totalUnansweredQuestions > 0 ? (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-800 text-[11px] shadow-2xs">
                <TriangleAlert className="h-3 w-3 text-amber-600 shrink-0" />
                {review.totalUnansweredQuestions} Unanswered / Skipped Questions
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-800 text-[11px] shadow-2xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                All Question Items Completed
              </span>
            )}
          </div>
        </div>

        {/* Modules List Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs divide-y divide-slate-100">
          <div className="pb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Module Summary & Status
            </h2>
            <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">Click review to inspect or update any section</span>
          </div>
          {review.sections.map((item) => (
            <ReviewSectionItem key={item.section.id} item={item} onReview={onReviewSection} />
          ))}
        </div>

        {/* Candidate Pre-Submission Reassurance Notice */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>Submission Notice</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Once you click <strong>Submit Assessment</strong>, your test attempt will be finalized and submitted to the evaluation team. You will not be able to return or change any responses after submission.
          </p>
        </div>

        {displayError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs">
            <p className="font-bold flex items-center gap-1.5">
              <TriangleAlert className="h-4 w-4 text-rose-600" />
              Unable to submit assessment
            </p>
            <p className="mt-0.5 font-medium">{displayError.message || "Please check your network connection and try again."}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Assessment
          </Button>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Test...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Assessment</span>
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentReview;
