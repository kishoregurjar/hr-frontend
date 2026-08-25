"use client";

import {
  HelpCircle,
  CheckCircle2,
  FileEdit,
  FolderTree,
} from "lucide-react";
import { QUESTION_STATUS } from "../../constants";

const QuestionStats = ({ questions = [] }) => {
  const total = questions.length;

  const active = questions.filter(
    (q) =>
      q.status === QUESTION_STATUS.ACTIVE ||
      String(q.status || "").toUpperCase() === "ACTIVE" ||
      String(q.status || "").toUpperCase() === "PUBLISHED"
  ).length;

  const draft = questions.filter(
    (q) =>
      q.status === QUESTION_STATUS.DRAFT ||
      String(q.status || "").toUpperCase() === "DRAFT"
  ).length;

  const categories = new Set(
    questions.map((q) => q.category).filter(Boolean)
  ).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 font-sans">
      {/* ── Card 1: Total Questions ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Questions
          </span>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <HelpCircle className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {total}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            MCQ and problem items
          </p>
        </div>
      </div>

      {/* ── Card 2: Active Questions ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active in Tests
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {active}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ready for assessments
          </p>
        </div>
      </div>

      {/* ── Card 3: Draft Questions ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Draft Questions
          </span>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <FileEdit className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {draft}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Under preparation
          </p>
        </div>
      </div>

      {/* ── Card 4: Categories ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Skill Categories
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FolderTree className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {categories}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Domain skill groupings
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionStats;
