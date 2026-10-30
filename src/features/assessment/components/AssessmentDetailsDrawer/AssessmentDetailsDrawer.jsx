"use client";

import Link from "next/link";
import {
  Clock,
  Gamepad2,
  HelpCircle,
  Layers,
  Edit,
  Loader2,
  Trophy,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { getAssessmentSummary } from "../../utils";

const AssessmentDetailsDrawer = ({
  assessment,
  open,
  onOpenChange,
  isLoading,
}) => {
  if (!assessment) return null;

  const { games, quizzes, gameCount, questionCount, totalSections } = getAssessmentSummary(assessment);
  const quizQuestions = Array.isArray(assessment?.questions)
    ? assessment.questions
    : (Array.isArray(quizzes) && quizzes[0]?.questions
        ? quizzes[0].questions
        : (Array.isArray(assessment?.quizzes?.[0]?.questions) ? assessment.quizzes[0].questions : []));

  const cognitiveGames = Array.isArray(assessment?.games)
    ? assessment.games
    : (Array.isArray(assessment?.selectedGameIds)
        ? assessment.selectedGameIds
        : (Array.isArray(assessment?.gameIds) ? assessment.gameIds : []));

  const finalGameCount = gameCount || cognitiveGames.length;
  const finalQuestionCount = questionCount || quizQuestions.length;

  const quizWeight = assessment?.quizWeight ?? (finalGameCount > 0 && finalQuestionCount > 0 ? 40 : (finalQuestionCount > 0 ? 100 : 0));
  const gameWeight = assessment?.gameWeight ?? (finalGameCount > 0 && finalQuestionCount > 0 ? 60 : (finalGameCount > 0 ? 100 : 0));
  const passingScore = assessment?.passingScore ?? 70;
  const duration = assessment?.durationMinutes ?? 60;

  const isPublished =
    String(assessment?.status || "").toUpperCase() === "PUBLISHED" ||
    String(assessment?.status || "").toUpperCase() === "ACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-white/90 bg-white shadow-2xl font-sans">
        {/* ── 1. Top Hero Header (Fixed) ─────────────────────── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-28 w-28 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 pr-8 sm:pr-0">
            <div className="flex items-center gap-4 min-w-0">
              {/* Icon Squircle */}
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-xl shadow-inner border border-white/30">
                <Layers className="h-6 w-6 text-white" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isPublished
                        ? "bg-emerald-400/25 text-emerald-100 border-emerald-300/40"
                        : "bg-amber-400/25 text-amber-100 border-amber-300/40"
                    }`}
                  >
                    {isPublished ? "Published Assessment" : "Draft"}
                  </Badge>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-white/90 font-bold bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                    {totalSections} Sequential Modules
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-xs truncate">
                  {assessment.title || "Untitled Assessment"}
                </h2>

                <p className="text-xs text-white/85 line-clamp-1 font-medium">
                  {assessment.description || "Multi-module hiring assessment combining cognitive games and technical MCQs."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Scrollable Center Content (no-scrollbar) ─────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* ── 4 KPI Meta Badges Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full min-w-0">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>Time Limit</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {duration} Mins
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span>Passing Mark</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-emerald-600">
                {passingScore}%
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <Gamepad2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Cognitive Games</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {finalGameCount} <span className="text-xs font-semibold text-slate-400 font-normal">({gameWeight}%)</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
                <span>MCQ Questions</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {finalQuestionCount} <span className="text-xs font-semibold text-slate-400 font-normal">({quizWeight}%)</span>
              </p>
            </div>
          </div>

          {/* ── Modules Deep Breakdown ── */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-xs font-bold text-slate-600">Loading module configuration...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Module 1: Cognitive Games */}
              <div className="rounded-2xl border border-slate-200/80 p-5 space-y-3.5 bg-white shadow-2xs">
                <div className="flex items-start sm:items-center justify-between border-b border-slate-100 pb-3 flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
                      <Gamepad2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        Module 1: Cognitive & Behavioral Challenges
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate sm:whitespace-normal">
                        Evaluates problem-solving agility, memory recall, and cognitive pattern recognition.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-50 shrink-0 text-indigo-700 border-indigo-200 text-xs font-extrabold self-start sm:self-auto px-2.5 py-0.5 rounded-lg">
                    Weight: {gameWeight}%
                  </Badge>
                </div>

                {cognitiveGames.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No cognitive games configured in this module.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 w-full min-w-0">
                    {cognitiveGames.map((g, idx) => {
                      const gameTitle = g?.game?.name || (typeof g === "object" ? g.title || g.name || "Cognitive Game" : String(g));
                      const gameCategory = typeof g?.category === "string"
                        ? g.category
                        : (g?.category?.name || "Cognitive");
                      const gameDiff = g?.config?.difficulty || g?.difficulty || "Medium";

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 text-xs w-full min-w-0 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="h-6 w-6 shrink-0 rounded-lg bg-indigo-100/80 text-indigo-700 font-extrabold text-[11px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 truncate leading-snug">
                              {gameTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-white border-slate-200 shrink-0">
                              {gameCategory}
                            </Badge>
                            <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 shrink-0 ${
                              String(gameDiff).toLowerCase() === "easy"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : String(gameDiff).toLowerCase() === "hard"
                                ? "bg-rose-50 text-rose-700 border-rose-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            }`}>
                              {gameDiff}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Module 2: Technical & Domain MCQs */}
              <div className="rounded-2xl border border-slate-200/80 p-5 space-y-3.5 bg-white shadow-2xs">
                <div className="flex items-start sm:items-center justify-between border-b border-slate-100 pb-3 flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        Module 2: Technical & Domain MCQ Quiz
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate sm:whitespace-normal">
                        Evaluates core technical concepts, problem resolution, and domain proficiency.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-50 shrink-0 text-purple-700 border-purple-200 text-xs font-extrabold self-start sm:self-auto px-2.5 py-0.5 rounded-lg">
                    Weight: {quizWeight}%
                  </Badge>
                </div>

                {quizQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No technical questions configured in this assessment.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {quizQuestions.map((q, idx) => {
                      const qText = q?.question?.title || q?.title || (typeof q?.question === "string" ? q.question : null) || q?.content || `Question ${idx + 1}`;
                      const qCat = q?.question?.category?.name || (typeof q?.category === "string"
                        ? q.category
                        : (q?.category?.name || q?.categoryName || "General"));
                      const qDiff = q?.question?.difficulty || q?.difficulty || "Medium";
                      return (
                        <div
                          key={q.id || idx}
                          className="flex items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40 text-xs w-full min-w-0 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="h-6 w-6 shrink-0 rounded-lg bg-indigo-100/80 text-indigo-700 font-extrabold text-[11px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <p className="font-bold text-slate-800 truncate leading-snug">
                              {qText}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-white border-slate-200 shrink-0">
                              {qCat}
                            </Badge>
                            <Badge
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 shrink-0 ${
                                String(qDiff).toLowerCase() === "easy"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : String(qDiff).toLowerCase() === "hard"
                                  ? "bg-rose-50 text-rose-700 border-rose-300"
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                              }`}
                            >
                              {qDiff}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Bottom Action Bar (Fixed at Bottom) ───────────────────── */}
        <div className="shrink-0 bg-slate-50/95 backdrop-blur-sm border-t border-slate-200/80 p-4 px-6 flex flex-col sm:flex-row items-center justify-end gap-3 rounded-b-3xl">
          <Link href={`/assessments/${assessment.id}/edit`} className="w-full sm:w-auto">
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/20 transition-all"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit / Modules
            </Button>
          </Link>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsDrawer;
