"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Brain,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
  Clock,
  CheckCircle2,
  Maximize2,
  ShieldAlert,
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
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const currentDiff = effectiveConfig.difficulty || game.difficulty;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ── 1. EXECUTIVE FULL-SCREEN HEADER ── */}
      <header className="h-16 px-5 sm:px-8 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 flex items-center justify-between gap-4 shrink-0 z-20 shadow-2xs">
        {/* Left: Brand & Game Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold gap-1.5 border border-slate-200 cursor-pointer transition shrink-0 shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exit Sandbox</span>
          </Button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-2 truncate">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                  {game.title}
                </h2>
                <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border ${getDifficultyBadgeColor(currentDiff)}`}>
                  {currentDiff}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                <span>{game.category}</span>
                <span>•</span>
                <span className="text-blue-600 font-semibold">{game.skill || "Neuro-Cognitive"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Recruiter Sandbox Tag */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
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
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Rules & Guide</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Restart Puzzle</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleClose}
            className="h-9 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
          >
            <X className="h-3.5 w-3.5 text-rose-600" />
            <span>Close (Esc)</span>
          </Button>
        </div>
      </header>

      {/* ── 2. FULL-SCREEN INTERACTIVE GAME VIEWPORT ── */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Subtle Ambient Light Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

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
      <footer className="h-10 px-6 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Recruiter Evaluation Sandbox • Candidate assessment scores and attempts are not recorded in this mode.</span>
          <span className="sm:hidden">Recruiter Sandbox Mode</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
            ESC
          </kbd>
          <span>to Exit</span>
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
