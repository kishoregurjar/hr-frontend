"use client";

import { Button } from "@/components/ui/button";
import { 
  PageHeader, 
  PageToolbar, 
  SearchInput, 
  Pagination, 
  EmptyState, 
  StatsSkeleton, 
} from "@/components/common";
import {
  CategoryFilter,
  DifficultyFilter,
  StatusFilter,
  SortFilter,
  QuestionGrid,
  QuestionStats,
  AddQuestionDialog,
  QuestionGridSkeleton,
} from "../components";
import { useQuestions } from "../hooks";

const QuestionList = () => {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <QuestionGridSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load questions"
        description={
          error?.message ||
          "Something went wrong while loading the question bank."
        }
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    difficulty !== "all" ||
    status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Manage all MCQ questions used in assessments."
      >
        <AddQuestionDialog />
      </PageHeader>

      <QuestionStats questions={allQuestions} />

      <PageToolbar
        leftContent={
          <div className="flex flex-wrap gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search questions..."
            />

            <CategoryFilter
              value={category}
              onChange={setCategory}
            />

            <DifficultyFilter
              value={difficulty}
              onChange={setDifficulty}
            />

            <StatusFilter
              value={status}
              onChange={setStatus}
            />

            <SortFilter
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        }
        rightContent={
          <Button variant="outline">
            Export
          </Button>
        }
      />

      {questions.length > 0 ? (
        <>
          <QuestionGrid questions={questions} />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {questions.length} of {totalQuestions} questions
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title={hasFilters ? "No matching questions" : "No questions yet"}
          description={
            hasFilters
              ? "Try changing your search or filters."
              : "Create your first question to start building the question bank."
          }
          actionLabel={hasFilters ? "Clear Filters" : undefined}
          onAction={
            hasFilters
              ? () => {
                  setSearch("");
                  setCategory("all");
                  setDifficulty("all");
                  setStatus("all");
                  setSortBy("latest");
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default QuestionList;
