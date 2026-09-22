"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import QuestionSelectionCard from "../QuestionSelectionCard";

const PAGE_SIZE = 6;

const QuestionSelectionStep = ({
  questions = [],
  selectedQuestionIds = [],
  selectedGameIds = [],
  onSelectionChange,
  onBack,
  onContinue,
  error,
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(selectedQuestionIds);

  const categories = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((q) => q?.category?.name || q?.category || q?.categoryName)
          .filter(Boolean)
      ),
    ].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions.filter((q) => {
      const qId = q.id || q._id;
      const qText = (q.title || q.question || q.text || "").toLowerCase();
      const qCategory = (q.category?.name || q.category || q.categoryName || "").toLowerCase();
      const qDiff = (q.difficulty || "").toLowerCase();

      const matchesSearch = !query || qText.includes(query);
      const matchesCategory =
        category === "all" || qCategory === category.toLowerCase();
      const matchesDifficulty =
        difficulty === "all" || qDiff === difficulty.toLowerCase();
      const matchesSelected = !showOnlySelected || selectedIds.includes(qId);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesSelected;
    });
  }, [questions, search, category, difficulty, showOnlySelected, selectedIds]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));

  // Safe paginated slice
  const paginatedQuestions = useMemo(() => {
    const validPage = Math.min(currentPage, totalPages);
    const startIndex = (validPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQuestions, currentPage, totalPages]);

  const handleToggle = (questionId) => {
    const updatedIds = selectedIds.includes(questionId)
      ? selectedIds.filter((id) => id !== questionId)
      : [...selectedIds, questionId];

    setSelectedIds(updatedIds);
    onSelectionChange?.(updatedIds);
  };

  const handleContinue = () => {
    onSelectionChange?.(selectedIds);
    onContinue(selectedIds);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Select Questions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose questions from your question bank for this assessment.
        </p>
      </div>

      {selectedGameIds.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary font-medium">
          💡 Questions are optional since you have already selected Cognitive Games in Step 2.
        </div>
      )}

      {/* Search + Filters + Selected Toggle */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search questions..."
            className="pl-9 rounded-xl border-slate-200 text-xs h-10"
          />
        </div>

        <Select
          value={category}
          onValueChange={(val) => {
            setCategory(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Categories
            </SelectItem>

            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficulty}
          onValueChange={(val) => {
            setDifficulty(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Difficulties
            </SelectItem>

            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        {/* Show Selected Toggle Button */}
        <Button
          type="button"
          variant={showOnlySelected ? "default" : "outline"}
          onClick={() => {
            setShowOnlySelected((prev) => !prev);
            setCurrentPage(1);
          }}
          className={`h-10 px-3.5 rounded-xl text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
            showOnlySelected
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
              : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-current" />
          <span>Selected ({selectedIds.length})</span>
        </Button>
      </div>

      {/* Question List & Pagination */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3">
            {paginatedQuestions.map((question) => (
              <QuestionSelectionCard
                key={question.id || question._id}
                question={question}
                selected={selectedIds.includes(question.id || question._id)}
                onToggle={handleToggle}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>–
                <span className="font-bold text-slate-700">{Math.min(currentPage * PAGE_SIZE, filteredQuestions.length)}</span> of{" "}
                <span className="font-bold text-slate-700">{filteredQuestions.length}</span> questions
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                            : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-2">
          <p className="font-bold text-sm text-slate-800">No questions found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {showOnlySelected
              ? "You haven't selected any questions yet. Switch filter or toggle back to browse all."
              : "Try changing your search keywords, difficulty, or category filter."}
          </p>
          {showOnlySelected && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOnlySelected(false)}
              className="mt-2 text-xs rounded-xl h-8"
            >
              Show All Questions
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-500">
          <span className="font-black text-slate-900">{selectedIds.length}</span>{" "}
          {selectedIds.length === 1
            ? "question"
            : "questions"}{" "}
          selected
        </p>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionStep;
