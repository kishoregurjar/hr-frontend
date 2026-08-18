"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useSaveQuizResponse } from "../../hooks";

const QuizRenderer = ({ section, attempt, onComplete }) => {
  const questions = section.questions ?? [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const currentQuestion = questions[currentQuestionIndex];

  const sectionResponses = attempt?.responses?.[section.id] ?? {};
  const selectedOptionId = sectionResponses[currentQuestion.id] ?? "";

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerChange = (optionId) => {
    saveResponse.mutate({
      attemptId: attempt.id,
      sectionId: section.id,
      questionId: currentQuestion.id,
      optionId,
    });
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
    <div className="rounded-xl border bg-card p-6 sm:p-8">
      <div className="border-b pb-5">
        <p className="text-sm font-medium text-muted-foreground">Quiz</p>
        <h2 className="mt-1 text-2xl font-semibold">{section.title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="py-6">
        <h3 className="text-lg font-medium leading-relaxed">
          {currentQuestion.question}
        </h3>

        <RadioGroup
          className="mt-6 space-y-3"
          value={selectedOptionId}
          onValueChange={handleAnswerChange}
          disabled={saveResponse.isPending}
        >
          {currentQuestion.options.map((option) => {
            const optionId = String(option.id ?? option);
            const optionLabel = option.label ?? option.text ?? option;
            const inputId = `${currentQuestion.id}-${optionId}`;

            return (
              <div
                key={optionId}
                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <RadioGroupItem value={optionId} id={inputId} />
                <Label
                  htmlFor={inputId}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {optionLabel}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {saveResponse.isError && (
          <p className="mt-4 text-sm text-destructive">
            Unable to save your answer. Please try again.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstQuestion || saveResponse.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Question
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!selectedOptionId || saveResponse.isPending}
        >
          {isLastQuestion ? "Complete Quiz" : "Next Question"}
          {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default QuizRenderer;
