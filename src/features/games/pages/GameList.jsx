"use client";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  PageHeader,
  PageToolbar,
  Pagination,
  SearchInput,
  GameCardSkeleton,
  StatsSkeleton,
} from "@/components/common";

import {
  DifficultyFilter,
  GameGrid,
  GameStats,
  SortFilter,
  StatusFilter,
} from "../components";
import { useGames } from "../hooks";
import { games as allGames } from "../data";

const GameList = () => {
  const {
    games,
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
  } = useGames();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        description="Manage game configurations used in assessments."
      >
        <Button>Create Configuration</Button>
      </PageHeader>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <GameStats games={allGames} />
      )}

      <PageToolbar
        leftContent={
          <div className="flex flex-wrap gap-3">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
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

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      ) : games.length === 0 ? (
        <EmptyState
          title="No games found"
          description="Try changing your search keyword or filters."
          actionLabel="Clear Search"
          onAction={() => {
            setSearch("");
            setDifficulty("all");
            setStatus("all");
            setSortBy("name-asc");
          }}
        />
      ) : (
        <>
          <GameGrid games={games} />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {games.length} of {totalGames} games
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GameList;
