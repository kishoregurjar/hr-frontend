"use client";

import { motion } from "framer-motion";
import {
  Tag,
  Layers,
  Clock3,
  Calendar,
  Layers2,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { EditQuestionDialog, DeleteQuestionDialog, QuestionPreviewSheet } from "..";

const QuestionCard = ({ question }) => {
  const difficultyColor =
    question.difficulty === "Easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : question.difficulty === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-rose-50 text-rose-700 border-rose-300";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <div className="h-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
        <div className="space-y-3.5">
          {/* Header row with Status & Difficulty */}
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10.5px] font-bold gap-1 px-2.5 py-0.5">
              <Tag className="h-3 w-3 text-blue-600" />
              {question.category || "General"}
            </Badge>

            <div className="flex items-center gap-1.5">
              <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${difficultyColor}`}>
                {question.difficulty || "Medium"}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-extrabold uppercase px-2 py-0.5">
                {question.status || "Active"}
              </Badge>
            </div>
          </div>

          {/* Question Title */}
          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {question.question}
          </h3>

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 pt-1">
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/70 text-[11px]">
              <Layers className="h-3 w-3 text-slate-400" />
              {question.type || "MCQ"}
            </span>

            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/70 text-[11px]">
              <FileCheck2 className="h-3 w-3 text-slate-400" />
              Used in {question.usedIn || 0} tests
            </span>
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Updated {formatDate(question.updatedAt)}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <QuestionPreviewSheet question={question} />
            <EditQuestionDialog question={question} />
            <DeleteQuestionDialog question={question} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
