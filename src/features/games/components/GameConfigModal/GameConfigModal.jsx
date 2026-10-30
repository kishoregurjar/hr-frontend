"use client";

import { useState, useEffect } from "react";
import {
  Settings2,
  Zap,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { useQueryClient } from "@tanstack/react-query";
import { GAMES_QUERY_KEY } from "../../hooks/useGamesQuery";
import { saveCompanyGameConfig, getCompanyGameConfig } from "../../utils/gameConfigStore";
import { updateGameConfig } from "@/lib/api/games";

const GameConfigModal = ({ game, open, onOpenChange, onSave }) => {
  const queryClient = useQueryClient();
  const [difficulty, setDifficulty] = useState("Easy");
  const [duration, setDuration] = useState(10);
  const [passingScore, setPassingScore] = useState(70);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (game) {
      const saved = getCompanyGameConfig(game.slug || game.id || game.code);
      setDifficulty(game.difficulty || saved?.difficulty || "Easy");
      setDuration(game.duration || saved?.duration || 10);
      setPassingScore(game.passingScore || saved?.passingScore || 70);
    }
  }, [game, open]);

  if (!game) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = {
      ...game,
      difficulty,
      duration: Number(duration),
      passingScore: Number(passingScore),
    };

    const targetKey = game.slug || game.code || game.id;

    try {
      const apiResult = await updateGameConfig(targetKey, {
        difficulty,
        duration: Number(duration),
        passingScore: Number(passingScore),
      });

      const finalConfig = apiResult || updated;
      saveCompanyGameConfig(targetKey, finalConfig);
      if (game.slug) saveCompanyGameConfig(game.slug, finalConfig);
      if (game.code) saveCompanyGameConfig(game.code, finalConfig);
      if (game.id) saveCompanyGameConfig(game.id, finalConfig);

      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY });
      onSave?.(finalConfig);
      toast.success("Configuration saved!", {
        description: `${game.title} calibrated with ${difficulty} difficulty.`,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Backend save failed, syncing with local state:", err);
      saveCompanyGameConfig(targetKey, updated);
      if (game.slug) saveCompanyGameConfig(game.slug, updated);
      if (game.code) saveCompanyGameConfig(game.code, updated);
      if (game.id) saveCompanyGameConfig(game.id, updated);
      onSave?.(updated);
      toast.warning("Server sync issue - Saved locally", {
        description: `${game.title} difficulty set to ${difficulty}.`,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyButtonStyle = (lvl) => {
    const isSelected = difficulty === lvl;
    if (!isSelected) {
      return "border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700 hover:border-slate-300";
    }

    switch (lvl) {
      case "Easy":
        return "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 font-bold shadow-2xs";
      case "Medium":
        return "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 font-bold shadow-2xs";
      case "Hard":
        return "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 font-bold shadow-2xs";
      default:
        return "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 font-bold shadow-2xs";
    }
  };

  const getDifficultyIndicator = (lvl) => {
    switch (lvl) {
      case "Easy":
        return "🟢";
      case "Medium":
        return "🟡";
      case "Hard":
        return "🔴";
      default:
        return "⚡";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white">
        {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5 relative z-10 pr-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
              <Settings2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                  Configure Game
                </DialogTitle>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-2xs">
                  <Sparkles className="h-2.5 w-2.5 text-pink-200" />
                  {game.category}
                </span>
              </div>
              <DialogDescription className="text-xs text-white/85 mt-0.5 font-medium">
                Adjust test parameters and cognitive calibration for {game.title}.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── 2. Modal Form Body ── */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Game Benchmark Summary Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Primary Trait</span>
                <span className="font-bold text-slate-800">{game.skill || game.category}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Base Duration</span>
              <span className="font-bold text-indigo-700">~{duration} Mins</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Difficulty Calibration</span>
              <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {["Easy", "Medium", "Hard"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`h-11 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${getDifficultyButtonStyle(lvl)}`}
                >
                  <span className="text-xs">{getDifficultyIndicator(lvl)}</span>
                  <span>{lvl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Passing Score Parameters Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-200/80">
              <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Est. Duration
              </Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full h-8 text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400 font-semibold shrink-0">mins</span>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-200/80">
              <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-slate-400" />
                Pass Target
              </Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Math.min(100, Math.max(1, Number(e.target.value))))}
                  className="w-full h-8 text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400 font-semibold shrink-0">%</span>
              </div>
            </div>
          </div>

          {/* ── 3. Action Footer ── */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GameConfigModal;
