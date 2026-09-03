import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Loader2,
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
          className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold gap-1 shadow-2xs cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          Preview
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto font-sans bg-slate-50/60 border-l border-slate-200/90 shadow-2xl flex flex-col">
        {/* ── 1. LIGHT SIGNATURE HEADER ── */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Eye className="h-5 w-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Question Inspector
                </SheetTitle>
                <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  Live Preview
                </span>
              </div>
              <SheetDescription className="text-xs text-slate-500 font-medium leading-relaxed">
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
              {activeQuestion.question || activeQuestion.title}
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
                  {activeQuestion.category || "General"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Difficulty</span>
                <Badge className={`text-xs font-extrabold uppercase px-2.5 py-0.5 ${difficultyColor}`}>
                  {activeQuestion.difficulty || "Medium"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Question Type</span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase">
                  {activeQuestion.type || "MCQ"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-slate-600">Status</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold px-2.5 py-0.5">
                  {activeQuestion.status || "Active"}
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
                  const letter = String.fromCharCode(65 + index);
                  const isCorrect = Boolean(option.isCorrect === true || option.is_correct === true);

                  return (
                    <div
                      key={option.id || option.rawId || index}
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
