"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GameDispatcher from "@/features/assessment/components/GameRuntime/GameDispatcher";

const GamePreviewModal = ({ game, open, onOpenChange }) => {
  const [restartKey, setRestartKey] = useState(0);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    if (open) {
      setRestartKey((prev) => prev + 1);
      setGameResult(null);
    }
  }, [open, game]);

  if (!game) return null;

  const handleRestart = () => {
    setRestartKey((prev) => prev + 1);
    setGameResult(null);
    toast.info("Game restarted in test preview mode.");
  };

  const handleGameComplete = (result) => {
    setGameResult(result || { completed: true });
    toast.success("Game completed in test sandbox!", {
      description: `Score recorded: ${result?.score ?? 100} points.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border border-slate-200/90 shadow-2xl font-sans bg-slate-50/70 max-h-[92vh] flex flex-col">
        {/* ── 1. Top Executive Preview Header ── */}
        <div className="p-4 sm:p-5 px-6 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  {game.title}
                </DialogTitle>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-extrabold uppercase px-2 py-0.5">
                  Sandbox Preview
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                <span>{game.category}</span>
                <span>•</span>
                <span className="font-semibold text-blue-600">{game.skill || "Cognitive Evaluation"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="h-8.5 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              Restart
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8.5 w-8.5 p-0 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── 2. Live Interactive Game Viewport ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
          {gameResult && (
            <div className="w-full max-w-md mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Challenge Completed!
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Test run successful. Score: {gameResult.score ?? 100} pts
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleRestart}
                className="h-7.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Play Again
              </Button>
            </div>
          )}

          <div className="w-full flex items-center justify-center">
            <GameDispatcher
              key={`${game.slug || game.id}-${restartKey}`}
              section={{
                slug: game.slug || game.id,
                gameSlug: game.slug || game.id,
                gameType: game.slug || game.id,
                title: game.title,
                difficulty: game.difficulty,
                config: {
                  difficulty: game.difficulty,
                  duration: game.duration,
                },
              }}
              onComplete={handleGameComplete}
            />
          </div>
        </div>

        {/* ── 3. Bottom Sandbox Guidance Footer ── */}
        <div className="p-3 px-6 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Interactive Recruiter Test Mode — No test results will be published.</span>
          </div>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Exit Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamePreviewModal;
