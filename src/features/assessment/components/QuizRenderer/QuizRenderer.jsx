"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, Circle, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useSaveQuizResponse } from "../../hooks";

const QuizRenderer = ({ section, attempt, onComplete }) => {
  const questions = section.questions ?? [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [localSelections, setLocalSelections] = useState({});

  const saveResponse = useSaveQuizResponse();

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [section.id]);

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          This quiz does not contain any questions.
        </p>
        <Button className="mt-4" onClick={onComplete}>
          Continue
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || {};
  const currentOptions =
    Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
      ? currentQuestion.options
      : [
          { id: "opt_A", label: "Option A", text: "Option A" },
          { id: "opt_B", label: "Option B", text: "Option B" },
          { id: "opt_C", label: "Option C", text: "Option C" },
          { id: "opt_D", label: "Option D", text: "Option D" },
        ];

  const sectionResponses = attempt?.responses?.[section.id] ?? {};
  const selectedOptionId =
    localSelections[currentQuestion.id] ??
    sectionResponses[currentQuestion.id] ??
    "";

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Answered count calculation
  const totalAnswered = questions.filter((q) => {
    return localSelections[q.id] || sectionResponses[q.id];
  }).length;

  const handleAnswerChange = (optionId) => {
    if (!currentQuestion?.id) return;
    setLocalSelections((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));

    if (attempt?.id) {
      saveResponse.mutate({
        attemptId: attempt.id,
        sectionId: section.id,
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
        sectionId: section.id,
        questionId: currentQuestion.id,
        optionId: null,
        selectedOptionIds: [],
      });
    }
  };

  const handlePrevious = () => {
    if (isFirstQuestion) return;
    setCurrentQuestionIndex((current) => current - 1);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete?.();
      return;
    }
    setCurrentQuestionIndex((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Question Palette Grid & Header ── */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {section.title || "Technical MCQ Assessment"}
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {totalAnswered} Answered
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Circle className="h-4 w-4 text-slate-400" />
              {questions.length - totalAnswered} Pending
            </span>
          </div>
        </div>

        {/* ── Question Palette Numbers ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <ListOrdered className="h-3.5 w-3.5" />
            Question Navigation Palette:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = Boolean(localSelections[q.id] || sectionResponses[q.id]);

              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 shadow-md shadow-blue-500/20"
                      : isAnswered
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Center Question & Options Box ── */}
      <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold leading-relaxed text-slate-900 whitespace-pre-wrap">
            {currentQuestion.description && currentQuestion.description.includes("\n")
              ? currentQuestion.description
              : currentQuestion.question || currentQuestion.title || "Question"}
          </h3>
        </div>

        <RadioGroup
          className="space-y-3 pt-2"
          value={selectedOptionId}
          onValueChange={handleAnswerChange}
        >
          {currentOptions.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const optionId = String(option.id ?? option.rawId ?? `opt_${letter}`);
            const rawLabel =
              option.optionText ||
              option.text ||
              option.content ||
              (option.label && !/^Option\s+[A-Z]$/i.test(option.label.trim()) ? option.label : null) ||
              option.label ||
              option.title ||
              `Option ${letter}`;
            const inputId = `${currentQuestion.id || "q"}-${optionId}`;
            const isSelected = selectedOptionId === optionId;

            return (
              <div
                key={optionId}
                className={`flex items-start space-x-3.5 rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600/30 text-blue-950 font-medium shadow-sm"
                    : "border-slate-200 bg-background hover:bg-slate-50 text-slate-800"
                }`}
                onClick={() => handleAnswerChange(optionId)}
              >
                <div className="flex items-center gap-2.5 mt-0.5 shrink-0">
                  <RadioGroupItem value={optionId} id={inputId} />
                  <span
                    className={`h-6 w-6 rounded-md font-bold text-xs flex items-center justify-center select-none ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {letter}
                  </span>
                </div>
                <Label
                  htmlFor={inputId}
                  className="flex-1 cursor-pointer font-normal text-sm sm:text-base leading-relaxed pt-0.5"
                >
                  {rawLabel}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* ── 3. Bottom Action Buttons Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="h-10 px-4 text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Previous
            </Button>

            {selectedOptionId && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearAnswer}
                className="h-10 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Clear Answer
              </Button>
            )}
          </div>

          <Button
            type="button"
            onClick={handleNext}
            className="h-10 px-6 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
          >
            {isLastQuestion ? "Complete Quiz" : "Save & Next"}
            {!isLastQuestion && <ArrowRight className="ml-1.5 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizRenderer;
