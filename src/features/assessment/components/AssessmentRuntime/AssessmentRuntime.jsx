"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Bookmark,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Send,
  Gamepad2,
  FileQuestion,
  HelpCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { buildRuntimeSections } from "../../utils";
import { useUpdateAttemptProgress, useSaveQuizResponse } from "../../hooks";
import GameRuntime from "../GameRuntime";
import { formatRemainingTime, getRemainingTime } from "@/features/attempt/utils";

const AssessmentRuntime = ({ assessment, attempt, onReview }) => {
  const sections = useMemo(() => buildRuntimeSections(assessment), [assessment]);
  const updateProgress = useUpdateAttemptProgress();
  const saveResponse = useSaveQuizResponse();

  // Active section & question indices
  const [currentSectionIndex, setCurrentSectionIndex] = useState(() =>
    Math.min(Math.max(attempt?.currentSection ?? 0, 0), Math.max(sections.length - 1, 0))
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Local answer selections & review tracking
  const [localSelections, setLocalSelections] = useState({});
  const [reviewQuestions, setReviewQuestions] = useState(() => new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(() => new Set(["0-0"]));

  // Live Timer Countdown
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingTime({
      startedAt: attempt?.startedAt,
      durationMinutes: assessment?.durationMinutes || 60,
    })
  );

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return getRemainingTime({
          startedAt: attempt?.startedAt,
          durationMinutes: assessment?.durationMinutes || 60,
        });
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [attempt?.startedAt, assessment?.durationMinutes]);

  const currentSection = sections[currentSectionIndex] || sections[0] || {};
  const isQuizSection = currentSection?.type === "quiz";
  const questions = currentSection?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || {};

  // Track visited questions whenever active question changes
  useEffect(() => {
    if (isQuizSection && currentQuestion?.id) {
      setVisitedQuestions((prev) => new Set([...prev, `${currentSectionIndex}-${currentQuestionIndex}`]));
    }
  }, [currentSectionIndex, currentQuestionIndex, isQuizSection, currentQuestion?.id]);

  // Answer state resolution
  const sectionResponses = attempt?.responses?.[currentSection.id] ?? {};
  const selectedOptionId =
    localSelections[currentQuestion.id] ??
    sectionResponses[currentQuestion.id] ??
    "";

  const isMarkedForReview = reviewQuestions.has(currentQuestion.id);

  // Options resolution
  const currentOptions =
    Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
      ? currentQuestion.options
      : [
          { id: "opt_A", label: "Option A", text: "Option A" },
          { id: "opt_B", label: "Option B", text: "Option B" },
          { id: "opt_C", label: "Option C", text: "Option C" },
          { id: "opt_D", label: "Option D", text: "Option D" },
        ];

  // Navigation handlers
  const handleAnswerChange = (optionId) => {
    if (!currentQuestion?.id) return;
    setLocalSelections((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));

    if (attempt?.id) {
      saveResponse.mutate({
        attemptId: attempt.id,
        sectionId: currentSection.id,
        questionId: currentQuestion.id,
        optionId,
        selectedOptionIds: [optionId],
      });
    }
  };

  const handleClearAnswer = () => {
    if (!currentQuestion?.id) return;
    setLocalSelections((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });

    if (attempt?.id) {
      saveResponse.mutate({
        attemptId: attempt.id,
        sectionId: currentSection.id,
        questionId: currentQuestion.id,
        optionId: null,
        selectedOptionIds: [],
      });
    }
  };

  const handleToggleReview = () => {
    if (!currentQuestion?.id) return;
    setReviewQuestions((prev) => {
      const copy = new Set(prev);
      if (copy.has(currentQuestion.id)) {
        copy.delete(currentQuestion.id);
      } else {
        copy.add(currentQuestion.id);
      }
      return copy;
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(Math.max((prevSection?.questions?.length || 1) - 1, 0));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      onReview?.();
    }
  };

  const jumpToQuestion = (secIdx, qIdx) => {
    setCurrentSectionIndex(secIdx);
    setCurrentQuestionIndex(qIdx);
    updateProgress.mutate({
      attemptId: attempt.id,
      currentSection: secIdx,
    });
  };

  // Timer values calculation for 3 distinct digital boxes
  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");
  const isTimeCritical = remainingSeconds <= 5 * 60;

  // Empty assessment fallback
  if (sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="mx-auto max-w-md text-center rounded-2xl bg-white p-8 border shadow-sm">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Assessment Unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">
            This assessment does not contain any active questions or game modules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      {/* ── 1. Top Header Bar (CBT Style) ── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Online Test - {assessment.title || "Assessment"}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400">Section:</span>
              <span className="text-blue-600 font-bold">{currentSection.title || `Section ${currentSectionIndex + 1}`}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReview}
              className="text-xs font-semibold h-8 border-slate-300 hover:bg-slate-50"
            >
              Overview & Submit
            </Button>
          </div>
        </div>
      </header>

      {/* ── 2. Main 2-Column Split Workspace ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT PANEL: Question & Options Workspace (70%) ── */}
        <section className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[620px] p-6 sm:p-8">
          {isQuizSection ? (
            <div className="space-y-6">
              {/* Question Header & Title */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {currentSection.title || "Section"} - Question {currentQuestionIndex + 1}
                  </h2>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Marks: +1.0 / -0.0
                  </span>
                </div>

                {/* Question Body */}
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed whitespace-pre-wrap font-medium pt-2">
                  {(() => {
                    const q = currentQuestion;
                    return (
                      (q.content && q.content.trim() && !/^Question\s+\d+$/i.test(q.content.trim()) ? q.content.trim() : null) ||
                      (q.question && q.question.trim() && !/^Question\s+\d+$/i.test(q.question.trim()) ? q.question.trim() : null) ||
                      (q.title && q.title.trim() && !/^Question\s+\d+$/i.test(q.title.trim()) ? q.title.trim() : null) ||
                      q.content ||
                      q.question ||
                      q.title ||
                      `Question ${currentQuestionIndex + 1}`
                    );
                  })()}
                </p>

                {/* Code Snippet if applicable */}
                {currentQuestion.codeSnippet && (
                  <div className="mt-3.5 rounded-xl bg-slate-950 p-4 border border-slate-800 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre">
                      <code>{currentQuestion.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Options List (A, B, C, D) */}
              <RadioGroup
                className="space-y-3.5 pt-1"
                value={selectedOptionId}
                onValueChange={handleAnswerChange}
              >
                {currentOptions.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const optionId = String(option.id ?? option.rawId ?? `opt_${letter}`);
                  const rawLabel =
                    (option.optionText && String(option.optionText).trim() ? String(option.optionText).trim() : null) ||
                    (option.text && String(option.text).trim() ? String(option.text).trim() : null) ||
                    (option.content && String(option.content).trim() ? String(option.content).trim() : null) ||
                    (option.value && String(option.value).trim() ? String(option.value).trim() : null) ||
                    option.label ||
                    `Option ${letter}`;
                  const inputId = `q-${currentQuestion.id || currentQuestionIndex}-${optionId}`;
                  const isSelected = selectedOptionId === optionId;

                  return (
                    <div
                      key={optionId}
                      onClick={() => handleAnswerChange(optionId)}
                      className={`flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/40 text-slate-900 shadow-xs"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 mt-0.5 shrink-0">
                        <div
                          className={`h-6 w-6 rounded-md border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-[11px] font-bold text-slate-500">{letter}</span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-slate-700">{letter}.</span>
                      </div>

                      <Label
                        htmlFor={inputId}
                        className="flex-1 cursor-pointer font-normal text-sm sm:text-base leading-relaxed text-slate-900 pt-0.5"
                      >
                        {rawLabel}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ) : (
            /* Game Section View */
            <div className="flex-1">
              <GameRuntime
                key={currentSection.id || `game-${currentSection.slug}`}
                section={currentSection}
                attempt={attempt}
                onComplete={handleNextQuestion}
              />
            </div>
          )}

          {/* ── Bottom Action & Navigation Footer ── */}
          <div className="mt-8 border-t border-slate-200 pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isQuizSection && (
                  <>
                    <Button
                      type="button"
                      onClick={handleToggleReview}
                      className={`h-10 px-4 text-xs font-bold transition-all ${
                        isMarkedForReview
                          ? "bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
                          : "bg-[#8b0000] hover:bg-[#700000] text-white shadow-sm"
                      }`}
                    >
                      <Bookmark className="mr-1.5 h-3.5 w-3.5 fill-current" />
                      {isMarkedForReview ? "Unmark Review" : "Mark for review"}
                    </Button>

                    {selectedOptionId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearAnswer}
                        className="h-10 px-3 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-300"
                      >
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Clear
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  onClick={handlePreviousQuestion}
                  disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                  className="h-10 px-5 font-bold text-xs bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm disabled:opacity-40"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  type="button"
                  onClick={handleNextQuestion}
                  className="h-10 px-6 font-bold text-xs bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm"
                >
                  {currentQuestionIndex === questions.length - 1 && currentSectionIndex === sections.length - 1
                    ? "Review Test"
                    : "Next"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  onClick={onReview}
                  className="h-10 px-6 font-bold text-xs bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Submit Test
                </Button>
              </div>
            </div>

            {/* ── Legend Footer (Exact Screenshot Colors) ── */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#2563eb]" />
                Current
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-slate-200 border border-slate-300" />
                Not Attempted
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#16a34a]" />
                Answered
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#ea580c]" />
                Not Answered
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#8b0000]" />
                Review
              </span>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL: Timer Clock & Question Palettes (30%) ── */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* ── 1. Digital Time Left Box ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Time Left
            </span>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className={`p-2.5 rounded-xl border ${isTimeCritical ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                <span className={`block text-2xl sm:text-3xl font-black font-mono tracking-tight ${isTimeCritical ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>
                  {hours}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hours</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${isTimeCritical ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                <span className={`block text-2xl sm:text-3xl font-black font-mono tracking-tight ${isTimeCritical ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>
                  {minutes}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minutes</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${isTimeCritical ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                <span className={`block text-2xl sm:text-3xl font-black font-mono tracking-tight ${isTimeCritical ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>
                  {seconds}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seconds</span>
              </div>
            </div>
          </div>

          {/* ── 2. Categorized Section Palettes (Quant, Verbal, Games, etc.) ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
            {sections.map((sec, sIdx) => {
              const secQuestions = sec.questions || [];
              const isSectionActive = sIdx === currentSectionIndex;

              if (sec.type === "game") {
                return (
                  <div key={sec.id || sIdx} className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200 font-bold text-xs text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Gamepad2 className="h-4 w-4 text-purple-600" />
                        {sec.title || `Cognitive Game ${sIdx + 1}`}
                      </span>
                      <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Interactive
                      </span>
                    </div>

                    <Button
                      type="button"
                      onClick={() => jumpToQuestion(sIdx, 0)}
                      className={`w-full h-11 font-bold text-xs justify-between rounded-xl transition-all ${
                        isSectionActive
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                      }`}
                    >
                      <span>Play {sec.title || "Game Module"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }

              return (
                <div key={sec.id || sIdx} className="space-y-3">
                  {/* Section Title Pill (Quant, Verbal, etc.) */}
                  <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200 font-extrabold text-xs text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      {sec.title || `Section ${sIdx + 1}`}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {secQuestions.length} Items
                    </span>
                  </div>

                  {/* Question Number Matrix Grid [1][2][3][4]... */}
                  <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
                    {secQuestions.map((q, qIdx) => {
                      const isCurrent = sIdx === currentSectionIndex && qIdx === currentQuestionIndex;
                      const hasAnswer = Boolean(localSelections[q.id] || attempt?.responses?.[sec.id]?.[q.id]);
                      const isReview = reviewQuestions.has(q.id);
                      const isVisited = visitedQuestions.has(`${sIdx}-${qIdx}`);

                      // Color computation matching screenshot CBT standards
                      let badgeStyle = "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"; // Not attempted
                      if (isCurrent) {
                        badgeStyle = "bg-[#2563eb] text-white ring-2 ring-blue-500 ring-offset-1 font-black shadow-sm"; // Blue Current
                      } else if (isReview) {
                        badgeStyle = "bg-[#8b0000] text-white hover:bg-[#700000] font-bold"; // Maroon Review
                      } else if (hasAnswer) {
                        badgeStyle = "bg-[#16a34a] text-white hover:bg-[#15803d] font-bold"; // Green Answered
                      } else if (isVisited) {
                        badgeStyle = "bg-[#ea580c] text-white hover:bg-[#c2410c] font-bold"; // Orange Not Answered
                      }

                      return (
                        <button
                          key={q.id || qIdx}
                          type="button"
                          onClick={() => jumpToQuestion(sIdx, qIdx)}
                          className={`h-9 w-full rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${badgeStyle}`}
                          title={`Question ${qIdx + 1}`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AssessmentRuntime;
