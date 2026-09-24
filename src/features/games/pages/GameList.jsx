"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Gamepad2,
  Plus,
  Search,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GameStats, GameCard, GamePreviewModal, GameConfigModal } from "../components";
import { useGamesQuery } from "../hooks";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { getCompanyGameConfig } from "../utils/gameConfigStore";

const GameList = () => {
  const { user } = useAuth();
  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "HR Manager";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || "HR Manager";

  const { data: rawGames = [], isLoading, isError, refetch, isFetching } = useGamesQuery();
  const { data: assessments = [] } = useAssessmentsQuery();

  const [previewGame, setPreviewGame] = useState(null);
  const [configGame, setConfigGame] = useState(null);
  const [configVersion, setConfigVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Dynamic live game usage map calculated from company assessments
  const gameUsageMap = useMemo(() => {
    const map = {};
    if (Array.isArray(assessments)) {
      assessments.forEach((assessment) => {
        const gameList =
          assessment.selectedGameIds ||
          assessment.games ||
          assessment.AssessmentGames ||
          assessment.assessmentGames ||
          [];
        gameList.forEach((g) => {
          const gameKey = String(
            typeof g === "object" ? g.slug || g.gameId || g.id || g.code || g.title : g
          ).toLowerCase();
          map[gameKey] = (map[gameKey] || 0) + 1;
        });
      });
    }
    return map;
  }, [assessments]);

  useEffect(() => {
    const handleGameStatusChange = () => {
      try {
        refetch();
      } catch (err) {
        console.error("Refetch error on game status change:", err);
      }
    };

    let bc = null;
    if (typeof window !== "undefined") {
      window.addEventListener("gameStatusChanged", handleGameStatusChange);
      window.addEventListener("GAME_STATUS_UPDATED", handleGameStatusChange);
      try {
        bc = new BroadcastChannel("hirequest_realtime");
        bc.onmessage = (event) => {
          if (
            event.data?.type === "GAME_STATUS_CHANGED" ||
            event.data?.type === "GAME_STATUS_UPDATED"
          ) {
            handleGameStatusChange();
          }
        };
      } catch {}
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("gameStatusChanged", handleGameStatusChange);
        window.removeEventListener("GAME_STATUS_UPDATED", handleGameStatusChange);
      }
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
    };
  }, [refetch]);

  // Normalize games from backend API + merge company calibration
  const gamesList = useMemo(() => {
    if (!Array.isArray(rawGames)) return [];

    return rawGames.map((game, index) => {
      const id = String(game.id || game.slug || game.code || `game-${index + 1}`);
      const slug = game.slug || id;
      const savedConfig = getCompanyGameConfig(slug || id || game.code);

      const title = game.title || game.name || "Cognitive Game";
      const description = game.description || "Interactive cognitive assessment simulation.";
      const category = game.category || "Cognitive Reasoning";
      const difficulty = savedConfig?.difficulty || game.difficulty || "Easy";
      const duration = savedConfig?.duration || game.duration || 6;
      const isGloballyActive = game.isActive !== undefined ? Boolean(game.isActive) : game.status === "ACTIVE";
      const isCompanyActive =
        game.isCompanyActive !== undefined
          ? Boolean(game.isCompanyActive)
          : game.companyStatus !== undefined && game.companyStatus !== null
          ? (game.companyStatus === "Active" || game.companyStatus === "ACTIVE")
          : savedConfig?.status
          ? savedConfig.status === "Active"
          : true;
      const isActive = isGloballyActive && isCompanyActive;
      const statusText = isActive ? "Active" : "Inactive";
      const skill = game.skill || "Logical Problem Solving";

      const slugKey = String(slug || id).toLowerCase();
      const titleKey = String(title).toLowerCase();
      const usedIn =
        gameUsageMap[slugKey] ||
        gameUsageMap[titleKey] ||
        (game.usedIn !== undefined ? game.usedIn : game.assessmentsUsedIn || 0);

      return {
        ...game,
        id,
        slug,
        title,
        name: game.name || title,
        description,
        category,
        difficulty,
        duration,
        isActive,
        status: statusText,
        skill,
        usedIn,
      };
    });
  }, [rawGames, gameUsageMap, configVersion]);

  const filteredGames = useMemo(() => {
    return gamesList
      .filter((game) => {
        const matchSearch =
          !search ||
          game.title.toLowerCase().includes(search.toLowerCase()) ||
          game.description.toLowerCase().includes(search.toLowerCase()) ||
          game.category.toLowerCase().includes(search.toLowerCase()) ||
          game.skill.toLowerCase().includes(search.toLowerCase());

        const matchDiff =
          difficulty === "all" ||
          game.difficulty.toLowerCase() === difficulty.toLowerCase();

        const matchStatus =
          status === "all" ||
          game.status.toLowerCase() === status.toLowerCase();

        return matchSearch && matchDiff && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return (b.usedIn || 0) - (a.usedIn || 0);
        if (sortBy === "duration") return (a.duration || 0) - (b.duration || 0);
        return a.title.localeCompare(b.title);
      });
  }, [gamesList, search, difficulty, status, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. TOP ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10.5px] font-extrabold gap-1">
            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
            Company Game Modules
          </Badge>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {gamesList.length} cognitive {gamesList.length === 1 ? "game" : "games"} configured
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
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
            <option value="inactive">Inactive</option>
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-12 bg-slate-100 rounded w-full" />
              <div className="h-8 bg-slate-100 rounded w-full mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <Gamepad2 className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {gamesList.length === 0 ? "No games configured yet" : "No matching games found"}
          </h3>
          <p className="text-xs text-slate-500">
            {gamesList.length === 0
              ? "Games configured by Super Admin will appear here dynamically."
              : "Try adjusting your search terms or filter selections."}
          </p>
          {gamesList.length > 0 && (
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
          )}
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
          onSave={() => {
            setConfigVersion((v) => v + 1);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default GameList;
