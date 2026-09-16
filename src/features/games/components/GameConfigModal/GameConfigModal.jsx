"use client";

import { useState, useEffect } from "react";
import { Settings2, Clock, Zap, CheckCircle2, Sliders, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { saveCompanyGameConfig, getCompanyGameConfig } from "../../utils/gameConfigStore";

const GameConfigModal = ({ game, open, onOpenChange, onSave }) => {
  const [difficulty, setDifficulty] = useState("Easy");
  const [duration, setDuration] = useState(10);
  const [passingScore, setPassingScore] = useState(70);
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (game) {
      const saved = getCompanyGameConfig(game.slug || game.id || game.code);
      setDifficulty(saved.difficulty || game.difficulty || "Easy");
      setDuration(saved.duration || game.duration || 10);
      setPassingScore(saved.passingScore || game.passingScore || 70);
      setStatus(saved.status || game.status || "Active");
    }
  }, [game, open]);

  if (!game) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...game,
      difficulty,
      duration: Number(duration),
      passingScore: Number(passingScore),
      status,
    };
    saveCompanyGameConfig(game.slug || game.id || game.code, updated);
    onSave?.(updated);
    toast.success("Configuration updated successfully!", {
      description: `${game.title} calibrated with ${difficulty} difficulty (${duration} mins).`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border border-slate-200/90 shadow-2xl font-sans bg-white">
        {/* Light Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center font-bold text-blue-600 shadow-2xs shrink-0">
              <Settings2 className="h-5 w-5 text-blue-600" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black tracking-tight text-slate-900">
                  Configure Game
                </DialogTitle>
                <Badge className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border-blue-200">
                  {game.category}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Adjust test parameters and cognitive calibration for {game.title}.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Difficulty Selection */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Difficulty Calibration
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {["Easy", "Medium", "Hard"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`h-10 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    difficulty === lvl
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Zap className={`h-3.5 w-3.5 ${difficulty === lvl ? "text-blue-600" : "text-slate-400"}`} />
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Time & Passing Score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Duration (Mins)
              </Label>
              <div className="relative">
                <Clock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-10 pl-9.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passingScore" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Target Score (%)
              </Label>
              <div className="relative">
                <Shield className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <Input
                  id="passingScore"
                  type="number"
                  min="10"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="h-10 pl-9.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Module Status
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {["Active", "Draft"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`h-10 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === st
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-2xs ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 ${status === st ? "text-emerald-600" : "text-slate-400"}`} />
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Save Configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GameConfigModal;
