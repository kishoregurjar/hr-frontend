"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateTotalPages } from "@/lib/helpers";
import { games as initialGames } from "../data";

const useGames = () => {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading] = useState(false);
  const pageSize = 9;

  // Reset page when filters or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, status, sortBy]);

  const { paginatedGames, totalPages, totalGames } = useMemo(() => {
    // 1. Filter
    const filtered = initialGames.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "all" || game.difficulty === difficulty;

      const matchesStatus =
        status === "all" || game.status === status;

      return matchesSearch && matchesDifficulty && matchesStatus;
    });

    // 2. Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "duration-asc":
          return a.duration - b.duration;
        case "duration-desc":
          return b.duration - a.duration;
        case "used-desc":
          return b.usedIn - a.usedIn;
        default:
          return 0;
      }
    });

    // 3. Paginate
    const total = sorted.length;
    const totalPagesCount = calculateTotalPages(total, pageSize);
    const sliced = sorted.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    return {
      paginatedGames: sliced,
      totalPages: totalPagesCount,
      totalGames: total,
    };
  }, [search, difficulty, status, sortBy, currentPage]);

  return {
    games: paginatedGames,
    search,
    setSearch,
    difficulty,
    setDifficulty,
    status,
    setStatus,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalGames,
    loading,
  };
};

export default useGames;
