"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Gamepad2,
  Search,
  Zap,
  RefreshCw,
  Loader2,
  Sparkles,
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
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

  // Scroll & Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

  const { data: rawGames = [], isLoading, isError, refetch, isFetching } = useGamesQuery();
  const { data: assessments = [] } = useAssessmentsQuery();

  const [previewGame, setPreviewGame] = useState(null);
  const [configGame, setConfigGame] = useState(null);
  const [configVersion, setConfigVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Canonical slug helper to accurately match game across various IDs, codes, slugs, and titles
  const getCanonicalSlug = (input) => {
    if (!input) return "";
    const str = String(
      typeof input === "object"
        ? [
            input.slug,
            input.code,
            input.game?.code,
            input.game?.slug,
            input.game?.name,
            input.name,
            input.title,
            input.gameId,
            input.id,
          ]
            .filter(Boolean)
            .join(" ")
        : input
    ).toLowerCase().trim();

    if (str.includes("zip") || str.includes("pathfinder")) return "zip";
    if (str.includes("tango")) return "tango";
    if (str.includes("sudoku")) return "sudoku";
    if (str.includes("mahjong")) return "mahjong";
    if (str.includes("queen")) return "nqueens";
    return "";
  };

  // Map of raw/database IDs to canonical slugs
  const idToCanonical = useMemo(() => {
    const map = new Map();
    if (Array.isArray(rawGames)) {
      rawGames.forEach((g) => {
        const canonical = getCanonicalSlug(g);
        if (canonical) {
          if (g.id) map.set(String(g.id).toLowerCase(), canonical);
          if (g.code) map.set(String(g.code).toLowerCase(), canonical);
          if (g.slug) map.set(String(g.slug).toLowerCase(), canonical);
          if (g.name) map.set(String(g.name).toLowerCase(), canonical);
          if (g.title) map.set(String(g.title).toLowerCase(), canonical);
        }
      });
    }
    return map;
  }, [rawGames]);

  // Dynamic live game usage map calculated accurately from company assessments
  const gameUsageMap = useMemo(() => {
    const map = {};
    const safeAssessments = Array.isArray(assessments)
      ? assessments
      : Array.isArray(assessments?.items)
      ? assessments.items
      : Array.isArray(assessments?.data)
      ? assessments.data
      : [];

    safeAssessments.forEach((assessment) => {
      const rawRefs = [
        ...(Array.isArray(assessment.games) ? assessment.games : []),
        ...(Array.isArray(assessment.AssessmentGames) ? assessment.AssessmentGames : []),
        ...(Array.isArray(assessment.assessmentGames) ? assessment.assessmentGames : []),
        ...(Array.isArray(assessment.selectedGameIds) ? assessment.selectedGameIds : []),
        ...(Array.isArray(assessment.gameIds) ? assessment.gameIds : []),
      ];

      const gamesInAssessment = new Set();

      rawRefs.forEach((item) => {
        if (!item) return;

        let canonical = getCanonicalSlug(item);

        if (!canonical) {
          const rawId = String(
            (typeof item === "object" ? item.gameId || item.id || item.code : item) || ""
          ).toLowerCase().trim();
          canonical = idToCanonical.get(rawId) || "";
        }

        if (canonical) {
          gamesInAssessment.add(canonical);
        }
      });

      gamesInAssessment.forEach((canonicalKey) => {
        map[canonicalKey] = (map[canonicalKey] || 0) + 1;
      });
    });

    return map;
  }, [assessments, idToCanonical]);

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
      const isGloballyActive =
        game.isActive !== undefined
          ? Boolean(game.isActive)
          : game.status !== undefined
          ? game.status === "ACTIVE" || game.status === "Active"
          : true;
      const isActive = isGloballyActive;
      const statusText = isActive ? "Active" : "Inactive";
      const skill = game.skill || "Logical Problem Solving";

      const canonicalKey = getCanonicalSlug(game);
      const slugKey = String(slug || id).toLowerCase();
      const titleKey = String(title).toLowerCase();
      const usedIn =
        (canonicalKey && gameUsageMap[canonicalKey] !== undefined ? gameUsageMap[canonicalKey] : undefined) ??
        gameUsageMap[slugKey] ??
        gameUsageMap[titleKey] ??
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

  const activeGamesCount = useMemo(() => {
    return gamesList.filter((g) => g.status === "Active").length;
  }, [gamesList]);

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

  // ── Parallax Scroll Handler ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far background: decorative rings & ambient orbs inside hero banner (0.58x counter-lag)
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Content: Title, subtitle, badge (0.42x counter-lag)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-sans"
    >
      {/* ── Layer 1 & 2: 3D Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-36 md:pb-40 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        {/* Far Background: Rotating Ambient Orbs & Concentric Rings */}
        <div
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Glowing Ambient Radial Glow */}
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />

          {/* Concentric 3D Rings */}
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />

          {/* Floating Subtle Shimmer Sparks */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Midground: Hero Content (0.42x Parallax Speed) */}
        <div
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-4 relative z-10 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="space-y-1">
            {/* Company Tag */}
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/75 drop-shadow-xs">
              {companyName}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Cognitive Games
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Scientifically calibrated cognitive challenges, spatial reasoning, problem solving, and focus assessments
            </p>
          </div>

          {/* Engine Banner & Top Actions Row */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Interactive Engine:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    {activeGamesCount} Active Assessment Simulations
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-xs h-8 px-3 gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold rounded-xl shadow-xs cursor-pointer transition-all"
                title="Refresh Games"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-white" : ""}`} />
                <span>Refresh Games</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Main Foreground Content (-mt-20 to overlap hero) ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 -mt-20 md:-mt-24 pb-16 space-y-6">
        {/* KPI Stats */}
        <GameStats games={gamesList} />

        {/* ── 2. Filter & Search Toolbar ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-sans">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by game name, cognitive trait, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
            />
          </div>

          {/* Filters & Refresh */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
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
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="popular">Most Used First</option>
              <option value="duration">Shortest Duration</option>
              <option value="name">Alphabetical</option>
            </select>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Refresh Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-10 px-3 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
              title="Refresh Games"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* ── 3. Games Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse space-y-4"
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
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
            <Gamepad2 className="h-12 w-12 text-indigo-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {gamesList.length === 0 ? "No games configured yet" : "No matching games found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                className="text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50"
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
      </div>

      {/* ── 4. Modals ── */}
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
