"use client";

import {
  HelpCircle,
  CheckCircle2,
  FileEdit,
  FolderTree,
} from "lucide-react";
import { QUESTION_STATUS } from "../../constants";

const QuestionStats = ({ questions = [] }) => {
  const visible = questions.filter(
    (q) => String(q.status || "").toUpperCase() !== "ARCHIVED"
  );
  const total = visible.length;

  const active = visible.filter(
    (q) =>
      q.status === QUESTION_STATUS.ACTIVE ||
      String(q.status || "").toUpperCase() === "ACTIVE" ||
      String(q.status || "").toUpperCase() === "PUBLISHED"
  ).length;

  const draft = visible.filter(
    (q) =>
      q.status === QUESTION_STATUS.DRAFT ||
      String(q.status || "").toUpperCase() === "DRAFT"
  ).length;

  const categories = new Set(
    visible.map((q) => q.category).filter(Boolean)
  ).size;

  const cardBaseStyle =
    "rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-4 select-none";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 font-sans">
      {/* ── Card 1: Total Questions ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL QUESTIONS
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <HelpCircle className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {total}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            MCQ and problem items
          </p>
        </div>
      </div>

      {/* ── Card 2: Active Questions ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            ACTIVE IN TESTS
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {active}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Ready for assessments
          </p>
        </div>
      </div>

      {/* ── Card 3: Draft Questions ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            DRAFT QUESTIONS
          </span>
          <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <FileEdit className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {draft}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Under preparation
          </p>
        </div>
      </div>

      {/* ── Card 4: Categories ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            SKILL DOMAINS
          </span>
          <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
            <FolderTree className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {categories}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Domain skill groupings
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionStats;
