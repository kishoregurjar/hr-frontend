"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

// 6x6 Maze layout: 0 = path, 1 = wall, 2 = goal
const MAZE_GRID = [
  [0, 0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 2],
];

const GRID_SIZE = 6;
const OPTIMAL_MOVES = 10;

const MazeEscapeGame = ({ onComplete }) => {
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const movePlayer = useCallback(
    (dr, dc) => {
      if (isFinished) return;

      const newR = playerPos.r + dr;
      const newC = playerPos.c + dc;

      // Boundary & Wall check
      if (
        newR >= 0 &&
        newR < GRID_SIZE &&
        newC >= 0 &&
        newC < GRID_SIZE &&
        MAZE_GRID[newR][newC] !== 1
      ) {
        setPlayerPos({ r: newR, c: newC });
        const nextMoves = moves + 1;
        setMoves(nextMoves);

        // Win check (Goal is at position [5, 5])
        if (MAZE_GRID[newR][newC] === 2) {
          setIsFinished(true);
          const durationSeconds = Math.max(1, Math.round((Date.now() - (startTime || Date.now())) / 1000));
          const extraMoves = Math.max(0, nextMoves - OPTIMAL_MOVES);
          const rawScore = Math.max(40, 100 - extraMoves * 7);

          onComplete?.({
            rawScore,
            normalizedScore: rawScore,
            score: rawScore,
            accuracy: Math.round((OPTIMAL_MOVES / nextMoves) * 100),
            timeTaken: durationSeconds,
            moves: nextMoves,
          });
        }
      }
    },
    [playerPos, moves, isFinished, startTime, onComplete]
  );

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "KeyW"].includes(e.code)) movePlayer(-1, 0);
      else if (["ArrowDown", "KeyS"].includes(e.code)) movePlayer(1, 0);
      else if (["ArrowLeft", "KeyA"].includes(e.code)) movePlayer(0, -1);
      else if (["ArrowRight", "KeyD"].includes(e.code)) movePlayer(0, 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Compass className="h-5 w-5 text-primary" />
            Maze Escape
          </h2>
          <p className="text-xs text-muted-foreground">Navigate to the exit (🏁)</p>
        </div>

        <div className="flex gap-4 text-sm font-semibold">
          <div className="rounded-lg bg-muted px-3 py-1.5 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Moves</span>
            <span className="text-primary">{moves}</span>
          </div>
        </div>
      </div>

      {isFinished ? (
        <div className="py-8 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Maze Escaped!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You reached the goal in <span className="font-semibold text-foreground">{moves} steps</span>.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid Canvas */}
          <div className="mx-auto grid grid-cols-6 gap-1.5 max-w-[320px] rounded-xl border bg-muted/40 p-2">
            {MAZE_GRID.map((row, r) =>
              row.map((cell, c) => {
                const isPlayer = playerPos.r === r && playerPos.c === c;
                const isWall = cell === 1;
                const isGoal = cell === 2;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square flex items-center justify-center rounded-lg text-lg transition-all ${
                      isPlayer
                        ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                        : isWall
                        ? "bg-muted-foreground/30 border border-muted-foreground/20"
                        : isGoal
                        ? "bg-emerald-500/20 text-emerald-600 font-bold border border-emerald-500/40"
                        : "bg-background border border-border/50"
                    }`}
                  >
                    {isPlayer ? "🧑‍💻" : isGoal ? "🏁" : isWall ? "🧱" : ""}
                  </div>
                );
              })
            )}
          </div>

          {/* D-Pad Controls */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => movePlayer(-1, 0)}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => movePlayer(0, -1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => movePlayer(1, 0)}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => movePlayer(0, 1)}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Use Arrow Keys or WASD</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MazeEscapeGame;
