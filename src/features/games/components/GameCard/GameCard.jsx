"use client";

import {
  Brain,
  Clock,
  BarChart3,
  Play,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GameCard = ({ game, onPreview, onConfigure }) => {
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:shadow-lg hover:border-blue-300/80 transition-all flex flex-col justify-between space-y-5 font-sans group">
      {/* ── Top Header ── */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                {game.title}
              </h3>
              <span className="text-[11px] font-semibold text-blue-600 mt-0.5 inline-block">
                {game.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className={`text-[10.5px] font-bold ${getDifficultyColor(game.difficulty)}`}
            >
              {game.difficulty}
            </Badge>
            <Badge
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                game.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              {game.status}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {game.description}
        </p>
      </div>

      {/* ── Middle Meta Info ── */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        {/* Core Skill Pill */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Primary Skill:
          </span>
          <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80 text-[11px]">
            {game.skill || game.category}
          </span>
        </div>

        {/* Duration & Usage Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{game.duration} Mins</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-700">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{game.usedIn} Assessments</span>
          </div>
        </div>
      </div>

      {/* ── Actions Footer ── */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPreview?.(game)}
          className="flex-1 h-9 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
        >
          <Play className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
          Test Preview
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => onConfigure?.(game)}
          className="flex-1 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm shadow-blue-500/25 cursor-pointer transition"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configure
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
