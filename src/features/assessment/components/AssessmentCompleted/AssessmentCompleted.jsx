"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Gamepad2,
  Brain,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AssessmentCompleted({
  assessment,
  attempt,
  submissionResult,
}) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const submittedAt = attempt?.submittedAt
    ? new Date(attempt.submittedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });

  // Extract questions from assessment
  const questions = useMemo(() => {
    if (Array.isArray(assessment?.questions)) return assessment.questions;
    if (Array.isArray(assessment?.sections)) {
      const quizSection = assessment.sections.find((s) => s.type === "quiz");
      return quizSection?.questions || [];
    }
    return [];
  }, [assessment]);

  // Extract flat responses
  const flatResponses = useMemo(() => {
    const raw = attempt?.responses || {};
    const flat = {};
    Object.keys(raw).forEach((key) => {
      const val = raw[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(flat, val);
      } else {
        flat[key] = val;
      }
    });
    return flat;
  }, [attempt?.responses]);

  // Extract cognitive games results
  const gameResultsMap = useMemo(() => {
    return attempt?.gameResults || {};
  }, [attempt?.gameResults]);

  // Normalize games list
  const gamesList = useMemo(() => {
    const rawGames =
      assessment?.games ||
      assessment?.selectedGameIds ||
      (Array.isArray(assessment?.sections)
        ? assessment.sections.find((s) => s.type === "game")?.games
        : []) ||
      [];

    const canonicalName = (key) => {
      const k = String(key || "").toLowerCase();
      if (k.includes("zip") || k.includes("pathfinder")) return "Zip Grid Pathfinder";
      if (k.includes("tango")) return "Tango Spatial Deduction";
      if (k.includes("sudoku")) return "Mini Sudoku 6x6 Challenge";
      if (k.includes("mahjong")) return "Mahjong Tile Match Strategy";
      return key || "Cognitive Challenge";
    };

    const canonicalSlug = (key) => {
      const k = String(key || "").toLowerCase();
      if (k.includes("zip") || k.includes("pathfinder")) return "zip";
      if (k.includes("tango")) return "tango";
      if (k.includes("sudoku")) return "sudoku";
      if (k.includes("mahjong")) return "mahjong";
      return k;
    };

    // If no explicit games in assessment, detect from gameResults
    const sourceGames =
      rawGames.length > 0
        ? rawGames
        : Object.keys(gameResultsMap).map((k) => ({ id: k, slug: k }));

    return sourceGames.map((g, idx) => {
      const slug = canonicalSlug(typeof g === "object" ? g.slug || g.id || g.code : g);
      const title = canonicalName(typeof g === "object" ? g.title || g.name || g.slug || g.id : g);
      const res =
        gameResultsMap[slug] ||
        gameResultsMap[typeof g === "object" ? g.id : g] ||
        gameResultsMap[`game_${slug}`] ||
        null;

      const isSkipped = Boolean(res?.skipped || res?.status === "SKIPPED");
      const isCompleted = Boolean(res && !isSkipped);
      const accuracy = isCompleted ? (res?.accuracy !== undefined ? res.accuracy : 100) : 0;
      const score = isCompleted ? (res?.score !== undefined ? res.score : 100) : 0;
      const timeSpentSecs = Number(res?.timeSpent || res?.timeTaken || 0);

      const formatTime = (secs) => {
        if (!secs) return "0s";
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
      };

      return {
        id: slug || `game-${idx}`,
        title,
        status: isCompleted ? "Completed" : isSkipped ? "Skipped" : "Not Attempted",
        score,
        accuracy: Math.round(accuracy),
        timeFormatted: formatTime(timeSpentSecs),
      };
    });
  }, [assessment, gameResultsMap]);

  // Evaluate Question-by-Question Answer Key
  const evaluatedQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      const qId = String(q.id || q._id || idx);
      const candidateChoice = flatResponses[qId] ?? null;

      // Find options
      const opts = Array.isArray(q.options)
        ? q.options.map((opt) => {
            const optId = String(opt.id || opt.value || opt.label || "");
            const optText = opt.text || opt.content || opt.label || opt.optionText || "";
            const isCorrect = Boolean(
              opt.isCorrect ||
              String(q.correctAnswer) === optId ||
              String(q.correctAnswer) === String(opt.label) ||
              String(q.correctAnswer) === optText
            );
            const isSelected =
              candidateChoice !== null &&
              (String(candidateChoice) === optId ||
                String(candidateChoice) === String(opt.label) ||
                String(candidateChoice) === optText);

            return {
              id: optId,
              text: optText,
              label: opt.label || `Option ${String.fromCharCode(65 + idx)}`,
              isCorrect,
              isSelected,
            };
          })
        : [];

      const correctOpt = opts.find((o) => o.isCorrect);
      const selectedOpt = opts.find((o) => o.isSelected);
      const isAnswered = candidateChoice !== null && candidateChoice !== "";
      const isCorrect = isAnswered && Boolean(selectedOpt && selectedOpt.isCorrect);

      return {
        id: qId,
        number: idx + 1,
        title: q.title || q.question || q.content || `Question ${idx + 1}`,
        explanation: q.explanation || null,
        options: opts,
        isAnswered,
        isCorrect,
        selectedOpt,
        correctOpt,
      };
    });
  }, [questions, flatResponses]);

  // Aggregate stats
  const quizStats = useMemo(() => {
    if (submissionResult?.correctCount !== undefined) {
      return {
        correct: submissionResult.correctCount,
        incorrect: submissionResult.incorrectCount,
        unanswered: submissionResult.unansweredCount,
        total: (submissionResult.correctCount || 0) + (submissionResult.incorrectCount || 0) + (submissionResult.unansweredCount || 0),
        score: submissionResult.finalScore,
        percentage: submissionResult.percentage,
        result: submissionResult.result || (submissionResult.percentage >= 60 ? "PASSED" : "FAILED"),
      };
    }

    const total = evaluatedQuestions.length;
    const correct = evaluatedQuestions.filter((q) => q.isCorrect).length;
    const answered = evaluatedQuestions.filter((q) => q.isAnswered).length;
    const incorrect = answered - correct;
    const unanswered = total - answered;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 100;
    const passingScore = Number(assessment?.passingScore || 60);

    return {
      correct,
      incorrect,
      unanswered,
      total,
      score: correct,
      percentage,
      result: percentage >= passingScore ? "PASSED" : "FAILED",
    };
  }, [submissionResult, evaluatedQuestions, assessment?.passingScore]);

  // Cognitive Games aggregate stats
  const gamesStats = useMemo(() => {
    if (gamesList.length === 0) return null;
    const completedCount = gamesList.filter((g) => g.status === "Completed").length;
    const totalAccuracy = gamesList.reduce((acc, g) => acc + (g.status === "Completed" ? g.accuracy : 0), 0);
    const avgAccuracy = completedCount > 0 ? Math.round(totalAccuracy / completedCount) : 0;
    return {
      total: gamesList.length,
      completed: completedCount,
      avgAccuracy,
    };
  }, [gamesList]);

  // Confidentiality setting check
  const isConfidential = assessment?.showResultToCandidate === false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── 1. HERO SUCCESS BANNER ── */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Trophy Badge */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-indigo-500/15 border border-emerald-200/80 text-emerald-600 shadow-sm relative">
            <Trophy className="h-8 w-8 text-emerald-600" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Assessment Submitted Successfully!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Your responses and cognitive telemetry performance have been securely verified and saved to the recruitment system.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <Clock className="h-3 w-3 text-slate-500" />
            <span>Submitted on {submittedAt}</span>
          </div>

          {/* If recruiter set confidential mode */}
          {isConfidential && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium max-w-md mx-auto text-center">
              <Award className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
              <span>Assessment evaluation is under review by the hiring team. Detailed answer keys are confidential per company policy.</span>
            </div>
          )}
        </div>

        {/* ── 2. PERFORMANCE SCORECARD (If not confidential) ── */}
        {!isConfidential && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Top Stat Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Overall Score */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Quiz Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
                    {quizStats.percentage}%
                  </span>
                  <Badge
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 ${
                      quizStats.result === "PASSED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {quizStats.result}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {quizStats.correct} of {quizStats.total} Questions
                </p>
              </div>

              {/* Correct Answers */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Correct
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                  {quizStats.correct}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Full marks earned</p>
              </div>

              {/* Incorrect Answers */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Incorrect
                </span>
                <p className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">
                  {quizStats.incorrect}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Missed answers</p>
              </div>

              {/* Skipped / Unanswered */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Skipped
                </span>
                <p className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                  {quizStats.unanswered}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Unanswered items</p>
              </div>
            </div>

            {/* ── 3. COGNITIVE GAMES ACCURACY & TELEMETRY BREAKDOWN ── */}
            {gamesStats && gamesList.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Cognitive Games Performance & Accuracy
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Behavioral and spatial reasoning metrics recorded during interactive challenges
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Avg Accuracy: {gamesStats.avgAccuracy}%</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      {gamesStats.completed}/{gamesStats.total} Solved
                    </div>
                  </div>
                </div>

                {/* Game Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {gamesList.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {g.title}
                          </h4>
                          <Badge
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 ${
                              g.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            {g.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {g.timeFormatted}
                          </span>
                          <span>•</span>
                          <span>Score: {g.score}/100</span>
                        </p>
                      </div>

                      {/* Accuracy Pill */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Accuracy
                        </span>
                        <span
                          className={`text-sm font-black font-mono ${
                            g.status === "Completed" ? "text-indigo-600" : "text-slate-400"
                          }`}
                        >
                          {g.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4. QUESTION-BY-QUESTION DETAILED ANSWER KEY ── */}
            {evaluatedQuestions.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Question-by-Question Answer Key
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Detailed review of your chosen answers vs the verified correct solutions
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>{showAnswerKey ? "Collapse Answers" : "Expand Answer Key"}</span>
                    {showAnswerKey ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                {/* Collapsible Answer Key List */}
                {showAnswerKey && (
                  <div className="space-y-3 pt-2">
                    {evaluatedQuestions.map((q) => {
                      const isExpanded = expandedQuestionId === q.id;
                      return (
                        <div
                          key={q.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            q.isCorrect
                              ? "border-emerald-200/80 bg-emerald-50/20"
                              : !q.isAnswered
                              ? "border-amber-200/80 bg-amber-50/20"
                              : "border-rose-200/80 bg-rose-50/20"
                          }`}
                        >
                          {/* Question Row Header */}
                          <div
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                            className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/40 transition"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                  q.isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : !q.isAnswered
                                    ? "bg-amber-500 text-white"
                                    : "bg-rose-600 text-white"
                                }`}
                              >
                                {q.number}
                              </span>

                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                                  {q.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {q.isCorrect ? (
                                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Your Answer: {q.selectedOpt?.text || "Correct"} (+1 Mark)
                                    </span>
                                  ) : !q.isAnswered ? (
                                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      Not Attempted • Correct: {q.correctOpt?.text || "Verified"}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                                      <XCircle className="h-3 w-3" />
                                      Your Answer: {q.selectedOpt?.text || "Incorrect"} • Correct: {q.correctOpt?.text}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-lg text-slate-400"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>

                          {/* Expanded Question Details & Options */}
                          {isExpanded && (
                            <div className="p-4 pt-0 border-t border-slate-100/80 space-y-3 mt-1 text-xs">
                              {/* Full Question Text */}
                              <p className="font-semibold text-slate-800 leading-relaxed pt-3">
                                {q.title}
                              </p>

                              {/* Options List */}
                              <div className="space-y-1.5">
                                {q.options.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition ${
                                      opt.isCorrect
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                        : opt.isSelected
                                        ? "bg-rose-50 border-rose-300 text-rose-950 font-bold"
                                        : "bg-white border-slate-200 text-slate-600"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="h-5 w-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                        {opt.label || opt.id}
                                      </span>
                                      <span>{opt.text}</span>
                                    </div>

                                    <div>
                                      {opt.isCorrect && (
                                        <Badge className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0">
                                          Correct Option
                                        </Badge>
                                      )}
                                      {!opt.isCorrect && opt.isSelected && (
                                        <Badge className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0">
                                          Your Choice
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Explanation */}
                              {q.explanation && (
                                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-950 text-[11px] leading-relaxed">
                                  <strong className="font-bold flex items-center gap-1 text-blue-900 mb-0.5">
                                    <Sparkles className="h-3 w-3 text-blue-600" /> Explanation:
                                  </strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 5. FOOTER NOTICE ── */}
        <div className="text-center pt-2 pb-6">
          <p className="text-xs text-slate-400 font-medium">
            HireQuest Talent Assessment Platform • You may now safely close this browser window.
          </p>
        </div>
      </div>
    </div>
  );
}
