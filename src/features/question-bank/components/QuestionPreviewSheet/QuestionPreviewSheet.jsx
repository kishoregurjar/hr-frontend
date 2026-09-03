"use client";

import {
  CheckCircle2,
  Eye,
  Tag,
  Layers,
  FileCheck2,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { formatDate } from "@/lib/formatters";

const QuestionPreviewSheet = ({ question }) => {
  const options = question.options ?? [];

  const difficultyColor =
    question.difficulty === "Easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : question.difficulty === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-rose-50 text-rose-700 border-rose-300";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold gap-1 shadow-2xs cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          Preview
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto font-sans bg-slate-50/60 border-l border-slate-200/90 shadow-2xl flex flex-col">
        {/* ── 1. SIGNATURE EXECUTIVE HEADER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              <Eye className="h-5 w-5 text-blue-300" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-black tracking-tight text-white">
                  Question Inspector
                </SheetTitle>
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  Live Preview
                </span>
              </div>
              <SheetDescription className="text-xs text-slate-300 font-medium leading-relaxed">
                Inspect question phrasing, answer choices, and scoring benchmarks.
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* ── 2. SCROLLABLE BODY CONTENT ── */}
        <div className="p-6 space-y-6 flex-1">
          {/* Question Text Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Question Statement
            </p>
            <h2 className="text-base font-extrabold text-slate-900 leading-snug">
              {question.question}
            </h2>
          </div>

          {/* Taxonomy & Metadata List */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Taxonomy & Configuration
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Category</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-2.5 py-0.5">
                  <Tag className="h-2.5 w-2.5 mr-1 text-blue-600" />
                  {question.category || "General"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Difficulty</span>
                <Badge className={`text-xs font-extrabold uppercase px-2.5 py-0.5 ${difficultyColor}`}>
                  {question.difficulty || "Medium"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Question Type</span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase">
                  {question.type || "MCQ"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Status</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold px-2.5 py-0.5">
                  {question.status || "Active"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Answer Options Section */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Answer Choices ({options.length})
              </p>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                1 Correct Answer Designated
              </span>
            </div>

            {options.length > 0 ? (
              <div className="space-y-2.5">
                {options.map((option, index) => {
                  const isCorrect = Boolean(
                    option.isCorrect === true ||
                    (question.correctAnswer && (option.id === question.correctAnswer || option.rawId === question.correctAnswer))
                  );
                  const letter = String.fromCharCode(65 + index);

                  return (
                    <div
                      key={option.id || index}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all text-xs ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-800"
                      }`}
                    >
                      {/* Option Letter Squircle */}
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-black text-xs transition-colors ${
                          isCorrect
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600"
                        }`}
                      >
                        {letter}
                      </div>

                      <p className="flex-1 font-bold pt-1 leading-snug">
                        {option.text || option.optionText || `Option ${letter}`}
                      </p>

                      {isCorrect && (
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                          Correct Answer
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No options registered for this question.</p>
            )}
          </div>

          {/* Usage & Audit Timestamp */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Assigned in <strong>{question.usedIn ?? 0} assessments</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Updated {formatDate(question.updatedAt)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuestionPreviewSheet;
