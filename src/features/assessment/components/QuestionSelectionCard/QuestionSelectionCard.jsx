"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const QuestionSelectionCard = ({ question, selected, onToggle }) => {
  const qId = question.id || question._id;
  const qTitle = question.title || question.question || question.text || "Untitled Question";
  const qCategory = question.category?.name || question.category || question.categoryName || "General";

  const difficultyColor =
    question.difficulty === "Easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : question.difficulty === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-rose-50 text-rose-700 border-rose-300";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(qId)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(qId);
        }
      }}
      className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex items-start gap-4 shadow-2xs hover:shadow-md group ${
        selected
          ? "border-indigo-600 bg-gradient-to-r from-indigo-50/50 via-purple-50/20 to-white ring-2 ring-indigo-500/20 shadow-sm"
          : "border-slate-200/90 bg-white hover:border-indigo-300"
      }`}
    >
      {/* Checkbox Squircle */}
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
          selected
            ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
            : "border-slate-300 bg-slate-50 text-transparent group-hover:border-indigo-400"
        }`}
      >
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
          {qTitle}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10.5px] font-bold px-2 py-0.5">
            {qCategory}
          </Badge>

          <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${difficultyColor}`}>
            {question.difficulty || "Medium"}
          </Badge>

          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-extrabold uppercase px-2 py-0.5">
            {question.type || "MCQ"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionCard;
