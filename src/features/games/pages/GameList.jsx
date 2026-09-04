"use client";

import { useState } from "react";
import {
  Gamepad2,
  Plus,
  Search,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GameStats, GameCard, GamePreviewModal, GameConfigModal } from "../components";
import { games as initialGames } from "../data";

const GameList = () => {
  const { user } = useAuth();
  const rawName = user?.name || user?.fullName || "Sarah Jenkins";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "Sarah Jenkins";

  const [gamesList, setGamesList] = useState(initialGames);
  const [previewGame, setPreviewGame] = useState(null);
  const [configGame, setConfigGame] = useState(null);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const filteredGames = gamesList
    .filter((game) => {
      const matchSearch =
        !search ||
        game.title.toLowerCase().includes(search.toLowerCase()) ||
        game.description.toLowerCase().includes(search.toLowerCase()) ||
        game.category.toLowerCase().includes(search.toLowerCase());

      const matchDiff =
        difficulty === "all" ||
        game.difficulty.toLowerCase() === difficulty.toLowerCase();

      const matchStatus =
        status === "all" ||
        game.status.toLowerCase() === status.toLowerCase();

      return matchSearch && matchDiff && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.usedIn - a.usedIn;
      if (sortBy === "duration") return a.duration - b.duration;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. SINGLE, CLEAN UNIFIED HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cognitive Games & Simulations
            </h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10.5px] font-extrabold gap-1">
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
              Interactive Tests
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Scientifically calibrated neuro-cognitive games measuring Problem Solving, Memory Recall, and Spatial Reasoning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            New Configuration
          </Button>
        </div>
      </div>

      {/* ── 2. KPI Stat Cards ── */}
      <GameStats games={gamesList} />

      {/* ── 3. Filter & Search Toolbar ── */}
      <div className="rounded-2xl border bg-card p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by game name, cognitive trait, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="popular">Most Used First</option>
            <option value="duration">Shortest Duration</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* ── 4. Games Grid ── */}
      {filteredGames.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <Gamepad2 className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching games found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or filter selections.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setDifficulty("all");
              setStatus("all");
              setSortBy("popular");
            }}
            className="text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPreview={(g) => setPreviewGame(g)}
              onConfigure={(g) => setConfigGame(g)}
            />
          ))}
        </div>
      )}

      {/* ── 5. Modals ── */}
      {previewGame && (
        <GamePreviewModal
          game={previewGame}
          open={Boolean(previewGame)}
          onOpenChange={(open) => {
            if (!open) setPreviewGame(null);
          }}
        />
      )}

      {configGame && (
        <GameConfigModal
          game={configGame}
          open={Boolean(configGame)}
          onOpenChange={(open) => {
            if (!open) setConfigGame(null);
          }}
          onSave={(updated) => {
            setGamesList((prev) =>
              prev.map((g) => (g.id === updated.id ? updated : g))
            );
          }}
        />
      )}
    </div>
  );
};

export default GameList;
