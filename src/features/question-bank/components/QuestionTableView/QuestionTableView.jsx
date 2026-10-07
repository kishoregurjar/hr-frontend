"use client";

import { useState } from "react";
import {
  Tag,
  Layers,
  FileCheck2,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { EditQuestionDialog, DeleteQuestionDialog, QuestionPreviewSheet } from "..";

const QuestionTableView = ({
  questions = [],
  currentPage = 1,
  pageSize = 10,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  allSelected = false,
  isIndeterminate = false,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs font-sans">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="py-3.5 px-3 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                title="Select all on this page"
              />
            </th>
            <th className="py-3.5 px-3 w-12 text-center">#</th>
            <th className="py-3.5 px-4 min-w-[320px]">Question & Details</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4 text-center">Difficulty</th>
            <th className="py-3.5 px-4 text-center">Type</th>
            <th className="py-3.5 px-4 text-center">Usage</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
          {questions.map((question, index) => {
            const isSelected = selectedIds.includes(question.id);
            const serialNumber = (currentPage - 1) * pageSize + index + 1;
            const difficultyColor =
              question.difficulty === "Easy"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : question.difficulty === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-rose-50 text-rose-700 border-rose-300";

            return (
              <tr
                key={question.id || index}
                className={`transition-colors group ${
                  isSelected
                    ? "bg-blue-50/60 hover:bg-blue-50/80"
                    : "hover:bg-slate-50/80"
                }`}
              >
                {/* Selection Checkbox */}
                <td className="py-3.5 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect?.(question.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                  />
                </td>

                {/* Index Column */}
                <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                  {serialNumber}
                </td>

                {/* Question Title & Options count */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                      {question.question}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{question.options?.length || 4} Multiple Choices</span>
                      <span>•</span>
                      <span>Updated {formatDate(question.updatedAt)}</span>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10.5px] font-bold gap-1 px-2.5 py-0.5 whitespace-nowrap">
                    <Tag className="h-2.5 w-2.5 text-blue-600" />
                    {question.category || "General"}
                  </Badge>
                </td>

                {/* Difficulty */}
                <td className="py-3.5 px-4 text-center">
                  <Badge
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 whitespace-nowrap ${difficultyColor}`}
                  >
                    {question.difficulty || "Medium"}
                  </Badge>
                </td>

                {/* Type */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10.5px] font-bold uppercase whitespace-nowrap">
                    {question.type || "MCQ"}
                  </span>
                </td>

                {/* Usage Count */}
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[11.5px] font-semibold text-slate-500 whitespace-nowrap">
                    {question.usedIn || 0} tests
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 shrink-0">
                    <QuestionPreviewSheet question={question} />
                    <EditQuestionDialog question={question} />
                    <DeleteQuestionDialog question={question} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTableView;
