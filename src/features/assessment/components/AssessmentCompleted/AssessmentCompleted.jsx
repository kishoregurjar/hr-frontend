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

  // Extract cognitive games results with real-time session storage fallback
  const gameResultsMap = useMemo(() => {
    let localGames = {};
    if (typeof window !== "undefined") {
      try {
        const attemptId = attempt?.id;
        const candidateAttemptId = sessionStorage.getItem("candidate_attempt_id");
        localGames = JSON.parse(
          (attemptId && sessionStorage.getItem(`candidate_game_results_${attemptId}`)) ||
          (candidateAttemptId && sessionStorage.getItem(`candidate_game_results_${candidateAttemptId}`)) ||
          sessionStorage.getItem("candidate_game_results") ||
          "{}"
        );
      } catch {}
    }

    return {
      ...(attempt?.gameResults || {}),
      ...(submissionResult?.gameResults || {}),
      ...localGames,
    };
  }, [attempt?.gameResults, attempt?.id, submissionResult?.gameResults]);

  // Normalize games list dynamically
  const gamesList = useMemo(() => {
    const rawGames =
      assessment?.games ||
      assessment?.selectedGameIds ||
      (Array.isArray(assessment?.sections)
        ? assessment.sections.find((s) => s.type === "game")?.games
        : []) ||
      [];

    const canonicalName = (key) => {
      const k = String(
        (typeof key === "object"
          ? key?.name || key?.title || key?.game?.name || key?.game?.title || key?.slug || key?.id
          : key) || ""
      ).toLowerCase();
      if (k.includes("zip") || k.includes("pathfinder")) return "Zip Grid Pathfinder";
      if (k.includes("tango")) return "Tango Spatial Deduction";
      if (k.includes("sudoku")) return "Mini Sudoku 6x6 Challenge";
      if (k.includes("mahjong")) return "Mahjong Tile Match Strategy";
      if (k.includes("queen")) return "N-Queens Spatial Deduction";
      return (typeof key === "object" && (key?.title || key?.name)) || key || "Cognitive Challenge";
    };

    const canonicalSlug = (key) => {
      const k = String(
        (typeof key === "object"
          ? key?.slug || key?.game?.slug || key?.game?.code || key?.code || key?.name || key?.title || key?.id
          : key) || ""
      ).toLowerCase();
      if (k.includes("zip") || k.includes("pathfinder")) return "zip";
      if (k.includes("tango")) return "tango";
      if (k.includes("sudoku")) return "sudoku";
      if (k.includes("mahjong")) return "mahjong";
      if (k.includes("queen")) return "nqueens";
      return k;
    };

    // If no explicit games in assessment, detect from gameResults
    const sourceGames =
      rawGames.length > 0
        ? rawGames
        : Object.keys(gameResultsMap).map((k) => ({ id: k, slug: k }));

    return sourceGames.map((g, idx) => {
      const slug = canonicalSlug(g);
      const title = canonicalName(g);
      const rawGId = typeof g === "object" ? g.id : g;
      const rawGameId = typeof g === "object" ? g.gameId : null;

      const res =
        gameResultsMap[slug] ||
        gameResultsMap[`game_${slug}`] ||
        gameResultsMap[`game-${idx + 1}`] ||
        gameResultsMap[`game_${idx + 1}`] ||
        (rawGId ? gameResultsMap[rawGId] : null) ||
        (rawGameId ? gameResultsMap[rawGameId] : null) ||
        null;

      const isSkipped = Boolean(res?.skipped || res?.status === "SKIPPED");
      const isCompleted = Boolean(res && !isSkipped);
      const accuracy = isCompleted
        ? Math.round(res?.accuracy !== undefined ? res.accuracy : (res?.score !== undefined ? res.score : 100))
        : 0;
      const score = isCompleted
        ? Math.round(res?.accuracy !== undefined ? res.accuracy : (res?.score !== undefined ? res.score : 100))
        : 0;

      // Auto-detect and convert milliseconds to seconds if raw value is > 500
      const rawTime = Number(res?.timeSpent || res?.timeTaken || res?.timeSeconds || 0);
      const timeSpentSecs = rawTime > 500 ? Math.round(rawTime / 1000) : Math.round(rawTime);

      const formatTime = (secs) => {
        if (!secs || secs <= 0) return "0s";
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
      };

      return {
        id: slug || `game-${idx}`,
        title,
        status: isCompleted ? "Completed" : isSkipped ? "Skipped" : "Not Attempted",
        score,
        accuracy,
        timeFormatted: formatTime(timeSpentSecs),
      };
    });
  }, [assessment, gameResultsMap]);

  // Aggregate stats computed dynamically
  const quizStats = useMemo(() => {
    if (submissionResult?.correctCount !== undefined) {
      const correct = Number(submissionResult.correctCount || 0);
      const incorrect = Number(submissionResult.incorrectCount || 0);
      const unanswered = Number(submissionResult.unansweredCount || 0);
      const total = correct + incorrect + unanswered;
      const pureQuizPercent = total > 0 ? Math.round((correct / total) * 100) : 0;
      const overallPercent = Math.round(Number(submissionResult.percentage ?? submissionResult.score ?? pureQuizPercent));

      return {
        correct,
        incorrect,
        unanswered,
        total,
        score: submissionResult.score ?? submissionResult.finalScore ?? 0,
        percentage: pureQuizPercent,
        overallPercentage: overallPercent,
        result:
          submissionResult.result ||
          (submissionResult.passed ? "PASSED" : (pureQuizPercent >= 60 || overallPercent >= 60 ? "PASSED" : "FAILED")),
      };
    }

    const total = questions.length;
    const answeredCount = Object.keys(flatResponses).length;
    const unansweredCount = Math.max(0, total - answeredCount);
    const scoreVal = attempt?.score ?? attempt?.percentage ?? 0;
    const passingScore = Number(assessment?.passingScore || 60);
    const percentage = Math.round(Number(scoreVal));
    const approxCorrect = total > 0 ? Math.round((percentage / 100) * total) : 0;
    const approxIncorrect = Math.max(0, answeredCount - approxCorrect);
    const pureQuizPercent = total > 0 ? Math.round((approxCorrect / total) * 100) : percentage;

    return {
      correct: approxCorrect,
      incorrect: approxIncorrect,
      unanswered: unansweredCount,
      total,
      score: scoreVal,
      percentage: pureQuizPercent,
      overallPercentage: percentage,
      result: pureQuizPercent >= passingScore ? "PASSED" : "FAILED",
    };
  }, [submissionResult, questions.length, flatResponses, attempt?.score, attempt?.percentage, assessment?.passingScore]);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full space-y-4">
        {/* ── HERO SUCCESS CARD ── */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5 text-center">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Trophy / Check Badge */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 via-blue-500/10 to-indigo-500/15 border border-emerald-200/90 text-emerald-600 shadow-sm relative">
            <Trophy className="h-10 w-10 text-emerald-600" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Assessment Submitted Successfully!
          </h1>
          <p className="mt-3 text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Thank you for completing the assessment. Your responses and cognitive exercises have been securely recorded and sent to the recruitment team.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Submitted on {submittedAt}</span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 font-medium">
            You may now safely close this browser window.
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            HireQuest Talent Assessment Platform
          </p>
        </div>
      </div>
    </div>
  );
}
