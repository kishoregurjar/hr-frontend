"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, ArrowLeft, ArrowRight, CheckCircle2, X, Clock, Gamepad2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import GameSelectionCard from "../GameSelectionCard";
import {
  getGameDurationForDifficulty,
  formatDurationDisplay,
} from "@/features/games/utils/gameTimers";

const GameSelectionStep = ({
  games = [],
  selectedGameIds = [],
  onSelectionChange,
  onContinue,
  onBack,
  error,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [gameConfigs, setGameConfigs] = useState({});

  useEffect(() => {
    if (selectedGameIds) {
      const ids = [];
      const configs = {};
      selectedGameIds.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          const id = item.gameId || item.id;
          if (id) {
            ids.push(id);
            if (item.config) configs[id] = item.config;
          }
        } else if (item) {
          ids.push(item);
        }
      });
      setSelectedIds(ids);
      setGameConfigs(configs);
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

  const totalSelectedTime = useMemo(() => {
    return selectedIds.reduce((sum, id) => {
      const diff = gameConfigs[id]?.difficulty || games.find((g) => g.id === id)?.difficulty?.toUpperCase() || "EASY";
      return sum + getGameDurationForDifficulty(id, diff);
    }, 0);
  }, [selectedIds, gameConfigs, games]);

  const emitChange = (ids, configs) => {
    const payload = ids.map((id) => {
      const defaultDiff = games.find((g) => g.id === id)?.difficulty?.toUpperCase() || "EASY";
      const userConfig = configs[id] || { difficulty: defaultDiff };
      const duration = getGameDurationForDifficulty(id, userConfig.difficulty);
      return {
        id,
        config: {
          ...userConfig,
          duration,
        },
      };
    });
    onSelectionChange?.(payload);
  };

  const handleSelectAll = () => {
    const combined = Array.from(new Set([...selectedIds, ...filteredGameIds]));
    setSelectedIds(combined);
    emitChange(combined, gameConfigs);
  };

  const handleDeselectAll = () => {
    const remaining = selectedIds.filter((id) => !filteredGameIds.includes(id));
    setSelectedIds(remaining);
    emitChange(remaining, gameConfigs);
  };

  const handleToggle = (gameId) => {
    const updatedIds = selectedIds.includes(gameId)
      ? selectedIds.filter((id) => id !== gameId)
      : [...selectedIds, gameId];

    setSelectedIds(updatedIds);
    emitChange(updatedIds, gameConfigs);
  };

  const handleDifficultyChange = (gameId, difficulty) => {
    const nextConfigs = {
      ...gameConfigs,
      [gameId]: { ...gameConfigs[gameId], difficulty },
    };
    setGameConfigs(nextConfigs);
    
    // Auto-select if not already selected
    let nextIds = selectedIds;
    if (!selectedIds.includes(gameId)) {
      nextIds = [...selectedIds, gameId];
      setSelectedIds(nextIds);
    }
    
    emitChange(nextIds, nextConfigs);
  };

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-indigo-600" />
          Select Cognitive Games
        </h2>

        <p className="mt-0.5 text-xs text-slate-500 font-medium">
          Choose the interactive cognitive games you want to include in this assessment.
        </p>
      </div>

      {/* ── Search & Bulk Action Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cognitive games by title or domain..."
            className="pl-9 h-10 rounded-xl bg-slate-50/60 border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
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
                className="h-9 px-3.5 rounded-xl border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
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
              difficulty={gameConfigs[game.id]?.difficulty}
              onDifficultyChange={(diff) => handleDifficultyChange(game.id, diff)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-1">
          <p className="font-bold text-sm text-slate-800">No games found</p>
          <p className="text-xs text-slate-500">
            Try another search keyword.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>
            <strong className="font-black text-slate-900">{selectedIds.length}</strong>{" "}
            {selectedIds.length === 1 ? "game" : "games"} selected
          </span>
          {selectedIds.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
              <Clock className="h-3 w-3 text-indigo-600" />
              ~{formatDurationDisplay(totalSelectedTime)} total challenge time
            </span>
          )}
        </div>

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
            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <span>Continue to Questions</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameSelectionStep;
