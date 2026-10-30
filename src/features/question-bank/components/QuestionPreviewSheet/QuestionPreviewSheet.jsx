"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  Tag,
  FileCheck2,
  Calendar,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { formatDate } from "@/lib/formatters";
import { getQuestionById } from "@/lib/api/questions";

const QuestionPreviewSheet = ({ question }) => {
  const [open, setOpen] = useState(false);
  const qId = question?.id || question?._id;

  const { data: detailData, isLoading } = useQuery({
    queryKey: ["questions", "detail", qId],
    queryFn: () => getQuestionById(qId),
    enabled: open && Boolean(qId),
  });

  const activeQuestion = detailData?.data || question || {};
  const options = Array.isArray(activeQuestion?.options) ? activeQuestion.options : [];

  const difficultyColor =
    activeQuestion.difficulty === "Easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : activeQuestion.difficulty === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-rose-50 text-rose-700 border-rose-300";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl p-0 font-sans bg-slate-50/70 border-l border-slate-200/90 shadow-2xl flex flex-col max-h-screen overflow-hidden">
        {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5 relative z-10 pr-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                  Question Inspector
                </SheetTitle>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-2xs">
                  <Sparkles className="h-2.5 w-2.5 text-pink-200" />
                  Live Preview
                </span>
              </div>
              <SheetDescription className="text-xs text-white/85 mt-0.5 font-medium leading-relaxed">
                Inspect question phrasing, answer choices, and scoring benchmarks.
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* ── 2. Scrollable Body Content (Zero Ugly Scrollbars) ── */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isLoading && (
            <div className="flex items-center justify-center py-3 px-4 text-xs font-semibold text-indigo-700 gap-2 bg-indigo-50 border border-indigo-200/80 rounded-xl shadow-2xs animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Syncing live question details...</span>
            </div>
          )}

          {/* Question Text Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Question Statement
              </p>
              {qId && (
                <span className="text-[10.5px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  ID: {String(qId).slice(-6).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-base font-extrabold text-slate-900 leading-snug">
              {activeQuestion.question || activeQuestion.title || "Untitled Question"}
            </h2>
          </div>

          {/* Taxonomy & Metadata List */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Taxonomy & Configuration
            </h4>

            <div className="divide-y divide-slate-100 text-xs font-medium">
              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Category</span>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200/80 text-xs font-bold px-2.5 py-0.5 shadow-2xs">
                  <Tag className="h-3 w-3 mr-1 text-indigo-600" />
                  {activeQuestion.category || "General"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Difficulty</span>
                <Badge className={`text-xs font-extrabold uppercase px-2.5 py-0.5 shadow-2xs ${difficultyColor}`}>
                  {activeQuestion.difficulty || "Medium"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Question Type</span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase shadow-2xs">
                  {activeQuestion.type || "MCQ"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Status</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold px-2.5 py-0.5 shadow-2xs">
                  {activeQuestion.status || "Active"}
                </Badge>
              </div>

              {Array.isArray(activeQuestion.tags) && activeQuestion.tags.length > 0 && (
                <div className="flex items-start justify-between py-2.5 gap-2">
                  <span className="font-semibold text-slate-600 shrink-0 pt-0.5">Skill Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                    {activeQuestion.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80"
                      >
                        {typeof t === "string" ? t : t?.name || ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Answer Options Section */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Answer Choices ({options.length})
              </p>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                1 Correct Answer Designated
              </span>
            </div>

            {options.length > 0 ? (
              <div className="space-y-2.5">
                {options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const isCorrect = Boolean(option.isCorrect === true || option.is_correct === true);

                  return (
                    <div
                      key={option.id || option.rawId || index}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all text-xs ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-800 hover:bg-slate-50"
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
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 stroke-[2.5]" />
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between text-xs text-slate-500 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="h-3.5 w-3.5" />
              </div>
              <span>Assigned in <strong className="text-slate-800">{question.usedIn ?? 0} assessments</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>Updated {formatDate(question.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* ── 3. Footer ── */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50/70 shrink-0 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-9 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            Close Preview
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuestionPreviewSheet;
