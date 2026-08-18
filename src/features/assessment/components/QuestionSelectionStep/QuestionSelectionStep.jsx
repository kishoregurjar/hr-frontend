"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

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

const QuestionSelectionStep = ({
  questions = [],
  selectedQuestionIds = [],
  onSelectionChange,
  onBack,
  onContinue,
  error,
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedIds, setSelectedIds] = useState(selectedQuestionIds);

  const categories = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) => question.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !query ||
        question.question?.toLowerCase().includes(query);

      const matchesCategory =
        category === "all" || question.category === category;

      const matchesDifficulty =
        difficulty === "all" || question.difficulty === difficulty;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty
      );
    });
  }, [questions, search, category, difficulty]);

  const handleToggle = (questionId) => {
    const updatedIds = selectedIds.includes(questionId)
      ? selectedIds.filter((id) => id !== questionId)
      : [...selectedIds, questionId];

    setSelectedIds(updatedIds);
    onSelectionChange?.(updatedIds);
  };

  const handleContinue = () => {
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

      {/* Search + Filters */}
      <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions..."
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
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

        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger>
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
      </div>

      {/* Question List */}
      {filteredQuestions.length > 0 ? (
        <div className="grid gap-3">
          {filteredQuestions.map((question) => (
            <QuestionSelectionCard
              key={question.id}
              question={question}
              selected={selectedIds.includes(question.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No questions found</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">
          {selectedIds.length}{" "}
          {selectedIds.length === 1
            ? "question"
            : "questions"}{" "}
          selected
        </p>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionStep;
