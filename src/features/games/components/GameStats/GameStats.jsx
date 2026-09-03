"use client";

import {
  Gamepad2,
  CheckCircle2,
  Sparkles,
  Brain,
  TrendingUp,
} from "lucide-react";

const GameStats = ({ games = [] }) => {
  const total = games.length;
  const active = games.filter((g) => g.status === "Active").length;
  const draft = games.filter((g) => g.status === "Draft").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* 1. Total Games */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Cognitive Games
          </span>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Gamepad2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {total}
          </p>
          <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Full assessment engine ready
          </p>
        </div>
      </div>

      {/* 2. Active in Assessments */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active in Tests
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {active}
          </p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Live in candidate rounds
          </p>
        </div>
      </div>

      {/* 3. In Draft / Testing */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            In Configuration
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {draft}
          </p>
          <p className="text-xs text-purple-600 font-semibold flex items-center gap-1 mt-1">
            Adaptive calibration
          </p>
        </div>
      </div>

      {/* 4. Calibrated Traits */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Neuro Competencies
          </span>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Brain className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            5 Traits
          </p>
          <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
            PRD Section 15 Calibrated
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
