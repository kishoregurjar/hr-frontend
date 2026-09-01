"use client";

import { useState, useEffect } from "react";
import {
  Gamepad2,
  Brain,
  Zap,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Settings2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminGames, toggleGameStatus } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const list = await getAdminGames();
        setGames(list);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleToggleStatus = async (gameId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, status: nextStatus } : g))
    );
    await toggleGameStatus(gameId, nextStatus);
  };

  return (
    <>
      <AdminHeader
        title="Global Cognitive Games Engine"
        subtitle="Minders World Game Catalog & Cognitive Skill Competency Matrix (PRD Section 15)"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* ── Overview Banner ── */}
        <div className="rounded-2xl border bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <h2 className="font-extrabold text-lg text-white">
                Cognitive Competency Mapping
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Every game is calibrated to measure specific cognitive traits: Logical Reasoning, Problem Solving, Processing Speed, Memory Recall, and Spatial Orientation.
            </p>
          </div>

          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-xs font-semibold shrink-0">
            {games.filter((g) => g.status === "ACTIVE").length} Active Global Games
          </Badge>
        </div>

        {/* ── Games Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between transition-all ${
                game.status === "ACTIVE"
                  ? "hover:shadow-md hover:border-blue-500/40"
                  : "opacity-60 bg-slate-100/50"
              }`}
            >
              <div className="space-y-4">
                {/* Game Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-base shadow-sm">
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Avg. {game.averagePlayTime} • {game.assessmentsUsedIn} assessments
                      </p>
                    </div>
                  </div>

                  <Badge
                    className={
                      game.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {game.status}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {game.description}
                </p>

                {/* Measured Skills Chips */}
                <div className="space-y-1.5 pt-2 border-t">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Measured Competencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {game.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-[10px] font-semibold bg-slate-100 text-slate-800"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedGame(game)}
                  className="text-xs font-semibold gap-1.5 h-8 flex-1"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  Skill Weightage
                </Button>

                <Button
                  size="sm"
                  variant={game.status === "ACTIVE" ? "destructive" : "default"}
                  onClick={() => handleToggleStatus(game.id, game.status)}
                  className="text-xs font-semibold h-8"
                >
                  {game.status === "ACTIVE" ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Skill Weightage Modal ── */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedGame.name} — Competency Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Calibrate skill scoring weightages for this cognitive game.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-muted-foreground hover:text-slate-900 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {selectedGame.skills.map((skill, index) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{skill}</span>
                      <span className="text-blue-600">
                        {index === 0 ? "50%" : index === 1 ? "30%" : "20%"} Weight
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      defaultValue={index === 0 ? 50 : index === 1 ? 30 : 20}
                      className="w-full accent-blue-600"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedGame(null)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedGame(null)}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Calibration
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
