"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import GameSelectionCard from "../GameSelectionCard";

const GameSelectionStep = ({
  games = [],
  selectedGameIds = [],
  onSelectionChange,
  onContinue,
  onBack,
  error,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(selectedGameIds);

  useEffect(() => {
    if (selectedGameIds) {
      setSelectedIds(selectedGameIds);
    }
  }, [selectedGameIds]);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return games;
    }

    return games.filter((game) => {
      const title = game.title?.toLowerCase() ?? "";
      const category = game.category?.toLowerCase() ?? "";

      return (
        title.includes(query) ||
        category.includes(query)
      );
    });
  }, [games, search]);

  const filteredGameIds = useMemo(() => {
    return filteredGames.map((g) => g.id);
  }, [filteredGames]);

  const isAllFilteredSelected =
    filteredGameIds.length > 0 &&
    filteredGameIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = () => {
    const combined = Array.from(new Set([...selectedIds, ...filteredGameIds]));
    setSelectedIds(combined);
    onSelectionChange?.(combined);
  };

  const handleDeselectAll = () => {
    const remaining = selectedIds.filter((id) => !filteredGameIds.includes(id));
    setSelectedIds(remaining);
    onSelectionChange?.(remaining);
  };

  const handleToggle = (gameId) => {
    const updatedIds = selectedIds.includes(gameId)
      ? selectedIds.filter((id) => id !== gameId)
      : [...selectedIds, gameId];

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
          Select Games
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the games you want to include in this assessment.
        </p>
      </div>

      {/* ── Search & Bulk Action Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search games..."
            className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-xs shadow-2xs"
          />
        </div>

        {/* Bulk Selection Actions */}
        {filteredGames.length > 0 && (
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            {!isAllFilteredSelected ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-9 px-3.5 rounded-xl border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 text-xs font-bold gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Select All</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="h-9 px-3.5 rounded-xl border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 text-xs font-bold gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <X className="h-3.5 w-3.5" />
                <span>Deselect All</span>
              </Button>
            )}

            <span className="text-xs font-semibold text-slate-500 pl-1 border-l border-slate-200">
              <strong className="text-slate-900 font-extrabold">{selectedIds.length}</strong> of {games.length} selected
            </span>
          </div>
        )}
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGames.map((game) => (
            <GameSelectionCard
              key={game.id}
              game={game}
              selected={selectedIds.includes(game.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No games found</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try another search term.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <p className="text-xs font-semibold text-slate-500">
          <span className="font-black text-slate-900">{selectedIds.length}</span>{" "}
          {selectedIds.length === 1 ? "game" : "games"}{" "}
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

export default GameSelectionStep;
