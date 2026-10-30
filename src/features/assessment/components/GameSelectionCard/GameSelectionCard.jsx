"use client";

import { Check, Plus, Gamepad2, ChevronDown, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getGameDurationForDifficulty,
  formatDurationDisplay,
} from "@/features/games/utils/gameTimers";

const GameSelectionCard = ({ game, selected, onToggle, difficulty, onDifficultyChange }) => {
  const currentDiff = difficulty || game.difficulty?.toUpperCase() || "EASY";
  const diffLabel = currentDiff.charAt(0).toUpperCase() + currentDiff.slice(1).toLowerCase();
  const currentDuration = getGameDurationForDifficulty(game.id || game.slug, currentDiff);
  const durationLabel = formatDurationDisplay(currentDuration);

  const difficultyColor =
    currentDiff === "EASY"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : currentDiff === "MEDIUM"
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-rose-50 text-rose-700 border-rose-300";

  return (
    <div
      onClick={() => onToggle(game.id)}
      className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group ${
        selected
          ? "border-indigo-600 bg-gradient-to-br from-indigo-50/50 via-purple-50/25 to-white ring-2 ring-indigo-500/20 shadow-sm"
          : "border-slate-200/90 bg-white hover:border-indigo-300"
      }`}
    >
      <div className="space-y-3">
        {/* Header row with Game Title and Selected Indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                selected
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
              {game.title}
            </h3>
          </div>

          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
              selected
                ? "bg-indigo-600 text-white shadow-xs"
                : "border border-slate-300 bg-slate-50 text-transparent group-hover:border-indigo-400"
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
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10.5px] font-bold px-2 py-0.5">
              {game.category}
            </Badge>
          )}

          {selected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div 
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition hover:opacity-80 border ${difficultyColor}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {diffLabel}
                  <ChevronDown className="h-3 w-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-slate-200 font-sans">
                {["EASY", "MEDIUM", "HARD"].map((lvl) => {
                  const lvlDuration = getGameDurationForDifficulty(game.id || game.slug, lvl);
                  const isCurrent = lvl === currentDiff;
                  return (
                    <DropdownMenuItem
                      key={lvl}
                      className="text-xs font-bold rounded-lg cursor-pointer flex items-center justify-between"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDifficultyChange?.(lvl);
                      }}
                    >
                      <span className={isCurrent ? "text-indigo-600" : "text-slate-700"}>
                        {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {formatDurationDisplay(lvlDuration)}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${difficultyColor}`}>
              {diffLabel}
            </Badge>
          )}

          {/* Calibrated Dynamic Challenge Time Badge */}
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 text-slate-400" />
            {durationLabel}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3 border-t border-slate-100/80">
        <Button
          type="button"
          size="sm"
          className={`w-full h-9 rounded-xl font-bold text-xs transition cursor-pointer ${
            selected
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20"
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
