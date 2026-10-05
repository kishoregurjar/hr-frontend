"use client";

import React from "react";
import { Trophy, ArrowRight, RotateCcw, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GameWinModal({
  isOpen,
  score,
  time,
  message,
  metaText,
  onContinue,
  onRestart,
  continueText,
  isSandbox = false,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 text-center shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Trophy Header Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-600/15 border border-blue-200/60 text-blue-600 shadow-sm shadow-blue-500/10 relative">
          <Trophy className="h-8 w-8 text-blue-600" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          {isSandbox ? "Puzzle Solved!" : "Challenge Completed!"}
        </h2>

        {message ? (
          <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">
            {isSandbox
              ? "You successfully solved this preview challenge!"
              : "You successfully solved the assessment puzzle!"}
          </p>
        )}

        {(score !== undefined || time !== undefined) && (
          <div className="my-5 flex justify-center gap-3">
            {!isSandbox && score !== undefined && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50/60 to-slate-50/60 border border-blue-100/80 px-5 py-2.5 min-w-24 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Score
                </span>
                <span className="text-lg font-black text-blue-600">
                  {score}%
                </span>
              </div>
            )}
            {time !== undefined && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/80 px-6 py-2.5 min-w-28 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Time
                </span>
                <span className="text-lg font-black text-slate-800 font-mono tracking-tight">
                  {time}
                </span>
              </div>
            )}
          </div>
        )}

        {children}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2.5">
          {onContinue && (
            <Button
              onClick={onContinue}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] gap-2 cursor-pointer flex items-center justify-center"
            >
              <span>{continueText || (isSandbox ? "Done" : "Continue Next Section")}</span>
              {isSandbox ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          )}

          {isSandbox && onRestart && (
            <Button
              type="button"
              variant="outline"
              onClick={onRestart}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase tracking-wider gap-2 cursor-pointer shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center"
            >
              <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
              <span>Play Again</span>
            </Button>
          )}
        </div>

        {metaText && (
          <p className="mt-3 text-xs text-slate-400 font-medium">{metaText}</p>
        )}
      </div>
    </div>
  );
}

