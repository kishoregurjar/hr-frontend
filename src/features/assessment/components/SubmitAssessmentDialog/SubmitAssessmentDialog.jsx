"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

const SubmitAssessmentDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  unansweredCount = 0,
}) => {
  const hasUnanswered = Number(unansweredCount) > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl p-6">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {hasUnanswered && (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle className="h-4 w-4" />
              </div>
            )}
            <AlertDialogTitle className="text-base font-extrabold text-slate-900">
              {hasUnanswered
                ? "Submit With Unanswered Questions?"
                : "Submit Assessment?"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-slate-600 pt-2 leading-relaxed">
            {hasUnanswered ? (
              <span>
                You currently have <strong className="text-slate-900">{unansweredCount} unanswered / skipped</strong> {unansweredCount === 1 ? "question" : "questions"}. Skipped items will be scored as <strong className="text-slate-900">0 marks</strong>. Once submitted, answers cannot be edited.
              </span>
            ) : (
              <span>
                Once submitted, you cannot change your answers or game results. Make sure you have reviewed everything before continuing.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            {hasUnanswered ? "Review Questions" : "Cancel"}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting...
              </span>
            ) : (
              <span>{hasUnanswered ? "Yes, Submit Anyway" : "Submit Assessment"}</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubmitAssessmentDialog;
