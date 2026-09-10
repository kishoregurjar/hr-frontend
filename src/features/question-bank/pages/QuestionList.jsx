"use client";

import { useState, useMemo } from "react";
import {
  HelpCircle,
  Plus,
  FolderTree,
  Search,
  Sparkles,
  ChevronDown,
  Filter,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";

import {
  CategoryFilter,
  DifficultyFilter,
  StatusFilter,
  SortFilter,
  QuestionGrid,
  QuestionTableView,
  QuestionStats,
  AddQuestionDialog,
  ManageCategoriesDialog,
  QuestionGridSkeleton,
} from "../components";
import { useQuestions } from "../hooks";

const QuestionList = () => {
  const { user } = useAuth();
  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "HR Manager";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || "HR Manager";
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";

  const [viewMode, setViewMode] = useState("table");

  const {
    questions,
    allQuestions,
    isLoading,
    isError,
    error,
    refetch,
    search,
    setSearch,
    category,
    setCategory,
    difficulty,
    setDifficulty,
    status,
    setStatus,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalQuestions,
  } = useQuestions();

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    difficulty !== "all" ||
    status !== "all";

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. SINGLE, CLEAN UNIFIED HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage all MCQ questions, coding items, and problem-solving puzzles used in assessments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action Dialogs */}
          <ManageCategoriesDialog />
          <AddQuestionDialog />
        </div>
      </div>

      {/* ── 2. KPI Stat Cards ── */}
      <QuestionStats questions={allQuestions} />

      {/* ── 3. Filters & Search Toolbar + View Switcher ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by title, code snippet, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition"
          />
        </div>

        {/* Filter Dropdowns & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <CategoryFilter value={category} onChange={setCategory} />
          <DifficultyFilter value={difficulty} onChange={setDifficulty} />
          <StatusFilter value={status} onChange={setStatus} />
          <SortFilter value={sortBy} onChange={setSortBy} />

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 ml-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table Row View"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Questions Content (Table or Grid) / Empty State ── */}
      {isLoading ? (
        <QuestionGridSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <h3 className="font-bold text-destructive">Unable to load questions</h3>
          <p className="text-xs text-muted-foreground mt-1">{error?.message || "Failed to load questions from database."}</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
            <HelpCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {hasFilters ? "No matching questions found" : "No questions in Question Bank yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {hasFilters
                ? "Try adjusting your search keywords or filter criteria."
                : "Create your first MCQ question or import question sets to use inside candidate assessments."}
            </p>
          </div>
          {!hasFilters && (
            <div className="pt-2">
              <AddQuestionDialog />
            </div>
          )}
        </div>
      ) : viewMode === "table" ? (
        <QuestionTableView questions={questions} />
      ) : (
        <QuestionGrid
          questions={questions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default QuestionList;
