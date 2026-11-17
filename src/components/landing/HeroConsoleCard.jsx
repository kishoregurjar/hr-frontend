"use client";

import { CheckCircle2, ShieldCheck, Sparkles, Activity } from "lucide-react";

export default function HeroConsoleCard() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Floating Badge 1 (Top-Right): Anti-Cheat Verified */}
      <div className="absolute -top-4 -right-2 sm:-right-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/10 text-xs font-semibold text-slate-800 transition-transform duration-300 hover:scale-105">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
        <span>Anti-Cheat Verified • 0 Flags</span>
      </div>

      {/* Floating Badge 2 (Bottom-Left): Fast AI Shortlisting */}
      <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/10 text-xs font-semibold text-slate-800 transition-transform duration-300 hover:scale-105">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <span>⚡ Top 1% Match Shortlisted</span>
      </div>

      {/* Main Glassmorphic Console Card (TechTantra Benchmark) */}
      <div className="relative z-10 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.20)] hover:shadow-[0_30px_70px_-15px_rgba(37,99,235,0.28)] transition-all duration-500 space-y-5">
        
        {/* macOS Traffic Dots & Subsystems Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block" />
            <span className="font-mono text-[11px] sm:text-xs text-slate-500 font-medium ml-1.5">
              hirequest_console_v2.4
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md tracking-wider">
              ENTERPRISE AI
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
              CLOUD CORE
            </span>
          </div>
        </div>

        {/* 3 Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-left">
          <div className="space-y-1">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Score
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
              98.4%
            </p>
            <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
              <span>↑</span> Top Percentile
            </p>
          </div>

          <div className="space-y-1 border-x border-slate-100/90 px-2 sm:px-3">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Nodes
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
              5/5
            </p>
            <p className="text-[10px] font-medium text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" /> Games Cleared
            </p>
          </div>

          <div className="space-y-1 pl-1">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Security Index
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              Grade-A
            </p>
            <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
              <span>🛡️</span> 100% Focused
            </p>
          </div>
        </div>

        {/* Digital Engine Stream Header */}
        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
              <span>Digital Engine Stream</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Activity className="h-3 w-3 text-blue-600" />
              <span>Live Telemetry</span>
            </div>
          </div>

          {/* Animated Equalizer/Telemetry Bars */}
          <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-16 pt-2 px-1">
            <div className="w-full bg-blue-200/70 rounded-t-lg h-[45%] transition-all duration-700 hover:h-[70%]" />
            <div className="w-full bg-blue-400/80 rounded-t-lg h-[75%] transition-all duration-700 hover:h-[90%]" />
            <div className="w-full bg-blue-600 rounded-t-lg h-[95%] shadow-sm shadow-blue-500/20" />
            <div className="w-full bg-blue-300/80 rounded-t-lg h-[60%] transition-all duration-700" />
            <div className="w-full bg-blue-500/90 rounded-t-lg h-[80%] transition-all duration-700" />
            <div className="w-full bg-blue-300/70 rounded-t-lg h-[50%] transition-all duration-700" />
            <div className="w-full bg-blue-400/80 rounded-t-lg h-[70%] transition-all duration-700" />
            <div className="w-full bg-blue-600 rounded-t-lg h-[100%] shadow-sm shadow-blue-500/20" />
            <div className="w-full bg-blue-200/80 rounded-t-lg h-[35%] transition-all duration-700" />
          </div>
        </div>

        {/* Bottom Dark Pipeline Bar (TechTantra Inspired) */}
        <div className="bg-slate-900 rounded-2xl py-3 px-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">
              Automated Candidate Pipeline
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Connected
          </span>
        </div>

      </div>
    </div>
  );
}
