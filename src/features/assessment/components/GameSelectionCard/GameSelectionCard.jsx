"use client";

import { Check, Plus, Gamepad2, Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GameSelectionCard = ({ game, selected, onToggle }) => {
  const difficultyColor =
    game.difficulty === "Easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : game.difficulty === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-rose-50 text-rose-700 border-rose-300";

  return (
    <div
      onClick={() => onToggle(game.id)}
      className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group ${
        selected
          ? "border-blue-600 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-white ring-2 ring-blue-500/20 shadow-sm"
          : "border-slate-200/90 bg-white hover:border-blue-300"
      }`}
    >
      <div className="space-y-3">
        {/* Header row with Game Title and Selected Indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
              selected
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
            }`}>
              <Gamepad2 className="h-4 w-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base leading-snug">
              {game.title}
            </h3>
          </div>

          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
              selected
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-300 bg-slate-50 text-transparent group-hover:border-blue-400"
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
          {game.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {game.category && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10.5px] font-bold px-2 py-0.5">
              {game.category}
            </Badge>
          )}

          {game.difficulty && (
            <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${difficultyColor}`}>
              {game.difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3 border-t border-slate-100/80">
        <Button
          type="button"
          size="sm"
          className={`w-full h-9 rounded-xl font-bold text-xs transition cursor-pointer ${
            selected
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-0"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(game.id);
          }}
        >
          {selected ? (
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Selected
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Select Game
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GameSelectionCard;
