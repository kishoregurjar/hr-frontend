"use client";

import React from "react";
import { Trophy, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GameWinModal({
  isOpen,
  score,
  time,
  message,
  metaText,
  onContinue,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in-0 duration-200">
      <div className="w-full max-w-sm rounded-3xl border border-amber-500/20 bg-card p-7 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-3xl shadow-lg shadow-amber-500/25">
          🏆
        </div>

        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Challenge Completed!
        </h2>

        {message ? (
          <p className="mt-2 text-sm text-muted-foreground font-medium">{message}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            You successfully solved the assessment puzzle!
          </p>
        )}

        {(score !== undefined || time !== undefined) && (
          <div className="my-6 flex justify-center gap-3">
            {score !== undefined && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 min-w-24">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Score
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {score}%
                </span>
              </div>
            )}
            {time !== undefined && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 px-5 py-2.5 min-w-24">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Time
                </span>
                <span className="text-lg font-black text-primary">{time}</span>
              </div>
            )}
          </div>
        )}

        {children}

        <div className="mt-4 flex flex-col gap-2">
          {onContinue && (
            <Button
              onClick={onContinue}
              className="w-full font-bold uppercase tracking-wider py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20"
            >
              Continue Next Section
            </Button>
          )}
        </div>

        {metaText && (
          <p className="mt-4 text-xs text-muted-foreground">{metaText}</p>
        )}
      </div>
    </div>
  );
}
