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
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
  BulkQuestionImportDialog,
  ManageCategoriesDialog,
  QuestionGridSkeleton,
  BulkDeleteDialog,
} from "../components";
import { useQuestions, useBulkDeleteQuestions } from "../hooks";

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteAllMode, setIsDeleteAllMode] = useState(false);

  const bulkDeleteMutation = useBulkDeleteQuestions();

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
    pageSize,
    setPageSize,
    totalPages,
    totalQuestions,
  } = useQuestions();

  const startIndex = totalQuestions === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalQuestions);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    difficulty !== "all" ||
    status !== "all";

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const pageIds = (questions || []).map((q) => q.id).filter(Boolean);
    const allPageSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteAllMode(false);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleOpenDeleteAll = () => {
    setIsDeleteAllMode(true);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const deletingCount = selectedIds.length;
    const isAll = isDeleteAllMode;

    bulkDeleteMutation.mutate(
      { ids: selectedIds, all: isDeleteAllMode },
      {
        onSuccess: (res) => {
          setSelectedIds([]);
          setIsBulkDeleteDialogOpen(false);
          const msg =
            res?.message ||
            (isAll
              ? "All questions deleted successfully!"
              : `${deletingCount} question(s) deleted successfully!`);
          toast.success(msg);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message || err?.message || "Failed to delete questions."
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. TOP ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Question Repository</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {totalQuestions || allQuestions.length} {(totalQuestions || allQuestions.length) === 1 ? "question" : "questions"} in bank
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <ManageCategoriesDialog />
          <BulkQuestionImportDialog />
          <AddQuestionDialog />
          {(totalQuestions > 0 || allQuestions.length > 0) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenDeleteAll}
              className="h-9 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs font-bold gap-1.5 cursor-pointer shadow-2xs transition"
              title="Delete all questions in bank"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete All</span>
            </Button>
          )}
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

        {/* Filter Dropdowns & View Mode Toggle: 2 cols on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <CategoryFilter value={category} onChange={setCategory} />
          <DifficultyFilter value={difficulty} onChange={setDifficulty} />
          <StatusFilter value={status} onChange={setStatus} />
          <SortFilter value={sortBy} onChange={setSortBy} />

          {/* View Mode Toggle */}
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center sm:justify-start rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 sm:ml-1">
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

      {/* ── 3.5 Bulk Action Bar (When items selected) ── */}
      {selectedIds.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-xs">
              {selectedIds.length}
            </span>
            <span className="font-extrabold text-slate-800">
              {selectedIds.length} {selectedIds.length === 1 ? "question" : "questions"} selected
            </span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleOpenDeleteSelected}
              className="h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      )}

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
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <BulkQuestionImportDialog />
              <AddQuestionDialog />
            </div>
          )}
        </div>
      ) : viewMode === "table" ? (
        <QuestionTableView
          questions={questions}
          currentPage={currentPage}
          pageSize={pageSize}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAllVisible}
          allSelected={questions.length > 0 && questions.every((q) => selectedIds.includes(q.id))}
          isIndeterminate={
            questions.some((q) => selectedIds.includes(q.id)) &&
            !questions.every((q) => selectedIds.includes(q.id))
          }
        />
      ) : (
        <QuestionGrid
          questions={questions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{startIndex}–{endIndex}</strong> of{" "}
              <strong className="text-slate-800">{totalQuestions}</strong> questions
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-slate-300">•</span>
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs rounded-xl border-slate-200 font-bold cursor-pointer"
            >
              Previous
            </Button>

            {/* Numeric Page Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-xs shadow-blue-500/30"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs rounded-xl border-slate-200 font-bold cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── 5. Bulk / All Delete Confirmation Modal ── */}
      <BulkDeleteDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        count={isDeleteAllMode ? (totalQuestions || allQuestions.length) : selectedIds.length}
        isAll={isDeleteAllMode}
        onConfirm={handleConfirmDelete}
        isPending={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default QuestionList;
