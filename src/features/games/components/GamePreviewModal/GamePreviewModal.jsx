"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Brain,
  RotateCcw,
  Sparkles,
  X,
  Zap,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GameDispatcher from "@/features/assessment/components/GameRuntime/GameDispatcher";
import { getEffectiveGameRuntimeConfig } from "@/features/games/utils/gameConfigStore";
import HowToPlayModal from "@/features/assessment/components/games/shared/HowToPlayModal";
import { GAME_RULES } from "@/features/assessment/components/games/shared/gameRules";

const GamePreviewModal = ({ game, open, onOpenChange }) => {
  const [mounted, setMounted] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      setRestartKey((prev) => prev + 1);

      // Lock body scroll in full screen mode
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Escape key listener
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open, game, handleClose]);

  // Load configured company game settings
  const effectiveConfig = useMemo(() => {
    if (!game) return {};
    return getEffectiveGameRuntimeConfig(game.slug || game.id, {
      difficulty: game.difficulty,
      duration: game.duration,
      isSandbox: true,
      isPreview: true,
    });
  }, [game, restartKey]);

  // Detect matching rules for instructions guide
  const activeRules = useMemo(() => {
    if (!game) return null;
    const gameKey = String(game.slug || game.id || "").toLowerCase();
    if (gameKey.includes("zip")) return GAME_RULES.zip;
    if (gameKey.includes("tango")) return GAME_RULES.tango;
    if (gameKey.includes("sudoku")) return GAME_RULES.sudoku;
    if (gameKey.includes("mahjong")) return GAME_RULES.mahjong;
    if (gameKey.includes("queen")) return GAME_RULES.nqueens;
    return null;
  }, [game]);

  if (!mounted || !open || !game) return null;

  const handleRestart = () => {
    setRestartKey((prev) => prev + 1);
  };

  const handleGameComplete = () => {
    handleClose();
  };

  const getDifficultyBadgeColor = (diff) => {
    switch (String(diff).toLowerCase()) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  const currentDiff = effectiveConfig.difficulty || game.difficulty;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ── 1. EXECUTIVE FULL-SCREEN HEADER ── */}
      <header className="h-16 px-5 sm:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between gap-4 shrink-0 z-20 shadow-xs">
        {/* Left: Brand & Game Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold gap-2 border border-slate-200 cursor-pointer transition shrink-0 shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exit Sandbox</span>
          </Button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block shrink-0" />

          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4E35E8] to-[#CF2E9F] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-2 truncate">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  {game.title}
                </h2>
                <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border ${getDifficultyBadgeColor(currentDiff)}`}>
                  {currentDiff}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                <span>{game.category}</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-bold flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-pink-500" />
                  {game.skill || "Neuro-Cognitive"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Recruiter Sandbox Tag */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-pink-50/80 border border-indigo-200/80 text-indigo-950 text-xs font-bold shadow-2xs select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
          </span>
          <span>Recruiter Practice Sandbox Mode</span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {activeRules && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRules(true)}
              className="h-9 px-3.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border-slate-200 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Rules & Guide</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border-slate-200 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Restart Puzzle</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleClose}
            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer transition"
          >
            <X className="h-3.5 w-3.5 text-white/90" />
            <span>Close (Esc)</span>
          </Button>
        </div>
      </header>

      {/* ── 2. FULL-SCREEN INTERACTIVE GAME VIEWPORT WITH HIGH-TECH DOT GRID ── */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] bg-slate-50/70 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Subtle Ambient Light Glow behind Puzzle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Game Arena Container */}
        <div className="w-full max-w-5xl flex items-center justify-center relative z-10">
          <GameDispatcher
            key={`${game.slug || game.id}-${restartKey}`}
            section={{
              slug: game.slug || game.id,
              gameSlug: game.slug || game.id,
              gameType: game.slug || game.id,
              title: game.title,
              difficulty: currentDiff,
              config: effectiveConfig,
            }}
            onComplete={handleGameComplete}
          />
        </div>
      </main>

      {/* ── 3. FULL-SCREEN GUIDANCE FOOTER ── */}
      <footer className="h-10 px-6 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Recruiter Evaluation Sandbox • Candidate assessment scores and attempts are not recorded in this mode.</span>
          <span className="sm:hidden">Recruiter Sandbox Mode</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Press</span>
          <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold shadow-2xs">
            ESC
          </kbd>
          <span>to Exit Sandbox</span>
        </div>
      </footer>

      {/* Instructions & Rules Drawer */}
      {activeRules && (
        <HowToPlayModal
          isOpen={showRules}
          onClose={() => setShowRules(false)}
          rules={activeRules}
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GamePreviewModal;
