import {
  CheckCircle2,
  CircleAlert,
  Gamepad2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { SECTION_STATUS } from "../../constants";

const ReviewSectionItem = ({ item, onReview }) => {
  const { section, index, status, label } = item;
  const isComplete = status === SECTION_STATUS.COMPLETED || item.isComplete;
  const isFullyAnswered = item.isFullyAnswered !== false;

  const isQuiz = section.type === "quiz";
  const Icon = isQuiz ? HelpCircle : Gamepad2;

  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50/50 px-2 rounded-xl">
      <div className="flex gap-3.5 items-start">
        <div
          className={`flex-shrink-0 rounded-2xl border p-3 shadow-2xs ${
            isQuiz
              ? "bg-gradient-to-br from-indigo-500/10 to-blue-500/15 border-indigo-200/60 text-indigo-600"
              : "bg-gradient-to-br from-purple-500/10 to-indigo-500/15 border-purple-200/60 text-purple-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Module {index + 1}
            </span>
            <span className="text-[11px] font-medium text-slate-400 capitalize">
              {section.type === "game" ? "Cognitive Challenges" : "Technical Quiz"}
            </span>
          </div>

          <h3 className="mt-1 font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
            {section.title}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-12 sm:pl-0 shrink-0">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
            isComplete
              ? isQuiz && !isFullyAnswered
                ? "bg-blue-50 text-blue-700 border-blue-200/80"
                : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              : "bg-amber-50 text-amber-700 border-amber-200/80"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>
            {isComplete
              ? isQuiz && !isFullyAnswered
                ? "Reviewed"
                : "Completed"
              : "Incomplete"}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onReview?.(index)}
          className="h-9 px-3.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-2xs cursor-pointer gap-1 transition-all"
        >
          <span>Review</span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
        </Button>
      </div>
    </div>
  );
};

export default ReviewSectionItem;
