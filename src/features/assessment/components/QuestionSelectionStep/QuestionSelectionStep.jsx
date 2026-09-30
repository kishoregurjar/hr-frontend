"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Minus,
  X,
  Sparkles,
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

const DEFAULT_PAGE_SIZE = 10;

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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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

  const effectivePageSize = pageSize === "all" ? Math.max(1, filteredQuestions.length) : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / effectivePageSize));

  // Safe paginated slice
  const paginatedQuestions = useMemo(() => {
    if (pageSize === "all") return filteredQuestions;
    const validPage = Math.min(currentPage, totalPages);
    const startIndex = (validPage - 1) * effectivePageSize;
    return filteredQuestions.slice(startIndex, startIndex + effectivePageSize);
  }, [filteredQuestions, currentPage, totalPages, pageSize, effectivePageSize]);

  // ID arrays for selection logic
  const pageIds = useMemo(
    () => paginatedQuestions.map((q) => q.id || q._id),
    [paginatedQuestions]
  );
  const filteredIds = useMemo(
    () => filteredQuestions.map((q) => q.id || q._id),
    [filteredQuestions]
  );

  const selectedOnPageCount = useMemo(
    () => pageIds.filter((id) => selectedIds.includes(id)).length,
    [pageIds, selectedIds]
  );
  const isAllOnPageSelected = pageIds.length > 0 && selectedOnPageCount === pageIds.length;
  const isSomeOnPageSelected = selectedOnPageCount > 0 && !isAllOnPageSelected;

  const selectedFilteredCount = useMemo(
    () => filteredIds.filter((id) => selectedIds.includes(id)).length,
    [filteredIds, selectedIds]
  );
  const isAllFilteredSelected = filteredIds.length > 0 && selectedFilteredCount === filteredIds.length;

  const handleToggle = (questionId) => {
    const updatedIds = selectedIds.includes(questionId)
      ? selectedIds.filter((id) => id !== questionId)
      : [...selectedIds, questionId];

    setSelectedIds(updatedIds);
    onSelectionChange?.(updatedIds);
  };

  // Toggle selection for all questions on current page
  const handleToggleSelectPage = () => {
    let updatedIds;
    if (isAllOnPageSelected) {
      updatedIds = selectedIds.filter((id) => !pageIds.includes(id));
    } else {
      updatedIds = Array.from(new Set([...selectedIds, ...pageIds]));
    }
    setSelectedIds(updatedIds);
    onSelectionChange?.(updatedIds);
  };

  // Select all questions in the filtered view
  const handleSelectAllFiltered = () => {
    const updatedIds = Array.from(new Set([...selectedIds, ...filteredIds]));
    setSelectedIds(updatedIds);
    onSelectionChange?.(updatedIds);
  };

  // Deselect all questions in the filtered view
  const handleDeselectAllFiltered = () => {
    const updatedIds = selectedIds.filter((id) => !filteredIds.includes(id));
    setSelectedIds(updatedIds);
    onSelectionChange?.(updatedIds);
  };

  // Clear entire selection
  const handleClearAll = () => {
    setSelectedIds([]);
    onSelectionChange?.([]);
  };

  const handleContinue = () => {
    onSelectionChange?.(selectedIds);
    onContinue(selectedIds);
  };

  return (
    <div className="space-y-5">
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

      {/* ── Action Toolbar: Master Select & Per Page ── */}
      {filteredQuestions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90">
          <div className="flex items-center flex-wrap gap-2">
            {/* Master Page Checkbox */}
            <button
              type="button"
              onClick={handleToggleSelectPage}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isAllOnPageSelected || isSomeOnPageSelected
                  ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
              }`}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                  isAllOnPageSelected || isSomeOnPageSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isAllOnPageSelected && <Check className="h-3 w-3 stroke-[3]" />}
                {isSomeOnPageSelected && <Minus className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>
                {isAllOnPageSelected
                  ? `Deselect Page (${pageIds.length})`
                  : `Select Page (${pageIds.length})`}
              </span>
            </button>

            {/* Select All Filtered Button */}
            {!isAllFilteredSelected && filteredQuestions.length > pageIds.length && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllFiltered}
                className="h-8 px-3 rounded-xl border-blue-200 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 text-xs font-bold cursor-pointer shadow-2xs"
              >
                <span>Select All {filteredQuestions.length} Questions</span>
              </Button>
            )}

            {/* Clear All Selected */}
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Selection</span>
              </Button>
            )}
          </div>

          {/* Right: Selected Count & Page Size Dropdown */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-600">
              <span className="font-extrabold text-blue-600">{selectedIds.length}</span> of {questions.length} selected
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400">Rows:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(val === "all" ? "all" : Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[72px] text-xs font-bold rounded-lg border-slate-200 bg-white px-2 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* ── Smart Gmail/HackerRank Banner ── */}
      {isAllOnPageSelected && filteredQuestions.length > pageIds.length && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 text-xs text-blue-900 animate-in fade-in-50 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              All <strong className="font-extrabold text-blue-950">{pageIds.length}</strong> questions on this page are selected.
              {!isAllFilteredSelected ? (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="ml-1 font-extrabold text-blue-600 underline underline-offset-2 hover:text-blue-900 cursor-pointer"
                >
                  Select all {filteredQuestions.length} questions in this view?
                </button>
              ) : (
                <span className="ml-1 font-bold text-emerald-700">
                  (All {filteredQuestions.length} questions are currently selected)
                </span>
              )}
            </span>
          </div>

          {isAllFilteredSelected && (
            <button
              type="button"
              onClick={handleDeselectAllFiltered}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer shrink-0"
            >
              Deselect All {filteredQuestions.length}
            </button>
          )}
        </div>
      )}

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
          {pageSize !== "all" && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * effectivePageSize + 1}</span>–
                <span className="font-bold text-slate-700">{Math.min(currentPage * effectivePageSize, filteredQuestions.length)}</span> of{" "}
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
