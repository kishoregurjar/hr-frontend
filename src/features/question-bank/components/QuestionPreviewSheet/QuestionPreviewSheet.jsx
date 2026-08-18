"use client";

import {
  CheckCircle2,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { StatusBadge } from "@/components/common";
import { formatDate } from "@/lib/formatters";

const QuestionPreviewSheet = ({ question }) => {
  const options = question.options ?? [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-w-[100px] flex-1"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            Question Preview
          </SheetTitle>

          <SheetDescription>
            Preview the question exactly as it is
            configured in the question bank.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">

          {/* Question */}
          <section className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Question
            </p>

            <h2 className="text-xl font-semibold leading-relaxed">
              {question.question}
            </h2>
          </section>

          {/* Metadata */}
          <section className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Category
              </p>

              <p className="mt-1 text-sm font-medium">
                {question.category}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Difficulty
              </p>

              <p className="mt-1 text-sm font-medium">
                {question.difficulty}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Type
              </p>

              <p className="mt-1 text-sm font-medium">
                {question.type}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Status
              </p>

              <div className="mt-1">
                <StatusBadge status={question.status} />
              </div>
            </div>
          </section>

          {/* Options */}
          <section className="space-y-3">
            <h3 className="font-semibold">
              Answer Options
            </h3>

            {options.length > 0 ? (
              <div className="space-y-3">
                {options.map((option, index) => {
                  const isCorrect =
                    option.id === question.correctAnswer;

                  return (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 rounded-lg border p-4 ${
                        isCorrect
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>

                      <p className="flex-1 text-sm">
                        {option.text}
                      </p>

                      {isCorrect && (
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <CheckCircle2 className="h-4 w-4" />
                          Correct
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No answer options available.
              </p>
            )}
          </section>

          {/* Additional Info */}
          <section className="grid grid-cols-2 gap-4 border-t pt-6">
            <div>
              <p className="text-xs text-muted-foreground">
                Used In
              </p>

              <p className="mt-1 font-medium">
                {question.usedIn ?? 0} assessments
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Last Updated
              </p>

              <p className="mt-1 font-medium">
                {formatDate(question.updatedAt)}
              </p>
            </div>
          </section>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuestionPreviewSheet;
