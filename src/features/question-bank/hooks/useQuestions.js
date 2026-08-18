import { useMemo, useState } from "react";

import useQuestionsQuery from "./useQuestionsQuery";

const PAGE_SIZE = 6;

const useQuestions = () => {
  const {
    data: questions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuestionsQuery();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredQuestions = useMemo(() => {
    let data = [...questions];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      data = data.filter((item) =>
        item.question
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }

    if (category !== "all") {
      data = data.filter(
        (item) => item.category === category
      );
    }

    if (difficulty !== "all") {
      data = data.filter(
        (item) => item.difficulty === difficulty
      );
    }

    if (status !== "all") {
      data = data.filter(
        (item) => item.status === status
      );
    }

    switch (sortBy) {
      case "question-asc":
        data.sort((a, b) =>
          a.question.localeCompare(b.question)
        );
        break;

      case "question-desc":
        data.sort((a, b) =>
          b.question.localeCompare(a.question)
        );
        break;

      default:
        break;
    }

    return data;
  }, [
    questions,
    search,
    category,
    difficulty,
    status,
    sortBy,
  ]);

  const totalQuestions = filteredQuestions.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalQuestions / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedQuestions = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredQuestions.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredQuestions, safeCurrentPage]);

  return {
    questions: paginatedQuestions,
    allQuestions: questions,

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

    currentPage: safeCurrentPage,
    setCurrentPage,

    totalPages,
    totalQuestions,
  };
};

export default useQuestions;
