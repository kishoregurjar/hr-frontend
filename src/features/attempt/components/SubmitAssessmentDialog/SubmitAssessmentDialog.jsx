"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubmitAssessmentDialog = ({
  open,
  totalItems = 0,
  answeredCount = 0,
  unansweredItems = [],
  isSubmitting,
  onClose,
  onReview,
  onConfirm,
}) => {
  if (!open) {
    return null;
  }

  const unansweredCount = unansweredItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border space-y-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              unansweredCount > 0
                ? "bg-amber-100 text-amber-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {unansweredCount > 0 ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {unansweredCount > 0
                ? "Submit assessment with unanswered items?"
                : "Submit assessment?"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Please review your completion status before final submission.
            </p>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-muted/40 p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{totalItems}</p>
          </div>

          <div className="rounded-xl border bg-green-50/50 p-3 text-center border-green-200">
            <p className="text-xs text-green-700 font-medium uppercase tracking-wider">
              Answered
            </p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {answeredCount}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3 text-center ${
              unansweredCount > 0
                ? "bg-amber-50/50 border-amber-200"
                : "bg-muted/40"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wider ${
                unansweredCount > 0 ? "text-amber-700" : "text-muted-foreground"
              }`}
            >
              Unanswered
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                unansweredCount > 0 ? "text-amber-700" : "text-slate-800"
              }`}
            >
              {unansweredCount}
            </p>
          </div>
        </div>

        {unansweredCount > 0 ? (
          <p className="text-sm text-slate-600">
            You have <span className="font-semibold text-amber-700">{unansweredCount} unanswered items</span>. You can review them before submitting, or submit the assessment as it is.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Great job! You have answered all <span className="font-semibold text-slate-900">{totalItems} items</span>. After submission, you will not be able to change your responses.
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>

          {unansweredCount > 0 && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onReview}
            >
              Review Unanswered
            </Button>
          )}

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting
              ? "Submitting..."
              : unansweredCount > 0
              ? "Submit Anyway"
              : "Submit Assessment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssessmentDialog;
