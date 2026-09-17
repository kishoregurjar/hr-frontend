"use client";

import React from "react";
import { Trophy, ArrowRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
          <Trophy className="h-7 w-7 text-blue-600" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Challenge Completed!
        </h2>

        {message ? (
          <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">
            You successfully solved the assessment puzzle!
          </p>
        )}

        {(score !== undefined || time !== undefined) && (
          <div className="my-5 flex justify-center gap-3">
            {score !== undefined && (
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-2.5 min-w-24">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Score
                </span>
                <span className="text-base font-extrabold text-blue-600">
                  {score}%
                </span>
              </div>
            )}
            {time !== undefined && (
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-2.5 min-w-24">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Time
                </span>
                <span className="text-base font-extrabold text-slate-800">
                  {time}
                </span>
              </div>
            )}
          </div>
        )}

        {children}

        <div className="mt-3 flex flex-col gap-2">
          {onContinue && (
            <Button
              onClick={onContinue}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] gap-1.5"
            >
              <span>Continue Next Section</span>
              <ArrowRight className="h-4 w-4" />
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

