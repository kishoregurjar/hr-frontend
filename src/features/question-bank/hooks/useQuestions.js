import { useMemo, useState } from "react";

import useQuestionsQuery from "./useQuestionsQuery";

const PAGE_SIZE = 25;

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
        (item.question || item.title || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }

    if (category !== "all") {
      const targetCat = String(category || "").toLowerCase().trim();
      data = data.filter((item) => {
        const itemCat = String(item.category || "").toLowerCase().trim();
        const itemCatName = String(item.categoryName || "").toLowerCase().trim();
        const itemCatId = String(item.categoryId || "").toLowerCase().trim();
        return (
          itemCat === targetCat ||
          itemCatName === targetCat ||
          itemCatId === targetCat
        );
      });
    }

    if (difficulty !== "all") {
      data = data.filter(
        (item) => String(item.difficulty).toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (status !== "all") {
      data = data.filter(
        (item) => String(item.status).toLowerCase() === status.toLowerCase()
      );
    }

    switch (sortBy) {
      case "question-asc":
        data.sort((a, b) =>
          (a.question || "").localeCompare(b.question || "")
        );
        break;

      case "question-desc":
        data.sort((a, b) =>
          (b.question || "").localeCompare(a.question || "")
        );
        break;

      case "latest":
      default:
        data.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return String(b.id || "").localeCompare(String(a.id || ""));
        });
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
