"use client";

import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuestionsQuery } from "@/features/question-bank/hooks";

const QuestionSelectionSection = ({ selectedQuestionIds = [], onSelectionChange }) => {
  const { data: mockQuestions = [] } = useQuestionsQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = mockQuestions.filter((q) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleQuestionSelection = (id) => {
    const updatedIds = selectedQuestionIds.includes(id)
      ? selectedQuestionIds.filter((item) => item !== id)
      : [...selectedQuestionIds, id];
    if (onSelectionChange) {
      onSelectionChange(updatedIds);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Select Questions</h2>
          <p className="text-sm text-muted-foreground">
            Choose which questions from the Question Bank to include in this assessment.
          </p>
        </div>

        {/* Selected Counter Badge */}
        <Badge variant="secondary" className="self-start sm:self-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200">
          <CheckCircle className="h-3.5 w-3.5" />
          {selectedQuestionIds.length} Selected
        </Badge>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Input
          placeholder="Search questions by text or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Questions list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {filteredQuestions.length === 0 ? (
          <p className="text-center py-6 text-sm text-muted-foreground">
            No questions match your search.
          </p>
        ) : (
          filteredQuestions.map((q) => {
            const isSelected = selectedQuestionIds.includes(q.id);
            return (
              <div
                key={q.id}
                onClick={() => toggleQuestionSelection(q.id)}
                className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20"
                    : "border-slate-200 bg-white hover:bg-slate-50/50"
                }`}
              >
                {/* Custom Checkbox indicator */}
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-slate-900 leading-snug">{q.question}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-slate-600">{q.category}</span>
                    <span>•</span>
                    <span
                      className={`font-medium ${
                        q.difficulty === "Easy"
                          ? "text-green-600"
                          : q.difficulty === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionSelectionSection;
