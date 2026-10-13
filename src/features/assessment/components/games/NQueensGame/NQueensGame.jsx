"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { HelpCircle, RotateCcw, Undo2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlayModal from "../shared/HowToPlayModal";
import GameWinModal from "../shared/GameWinModal";
import { GAME_RULES } from "../shared/gameRules";

// ── Curated Authentic LinkedIn Queens Palette ──
// High contrast, rich saturation matching the original game
const REGION_COLORS = [
  "#b59fe4", // 0: Rich Lavender / Purple
  "#fbb87d", // 1: Warm Apricot / Peach
  "#82bafc", // 2: Vibrant Sky Blue
  "#a8dda0", // 3: Sage Green
  "#dfe2e6", // 4: Soft Slate Grey
  "#fc755c", // 5: Coral Red / Salmon
  "#e2f28b", // 6: Soft Lime / Lemon Yellow
  "#f9b4d0", // 7: Rose Pink
  "#7fe3d2", // 8: Seafoam Teal
  "#fed7aa", // 9: Warm Amber
];

// Fallback authentic LinkedIn Queens puzzles with 100% verified N color regions
const FALLBACK_PUZZLES = {
  easy: {
    size: 6,
    targetQueens: 6,
    regions: [
      [0, 0, 0, 1, 1, 2],
      [0, 0, 1, 1, 1, 2],
      [3, 3, 4, 1, 2, 2],
      [3, 3, 4, 4, 2, 2],
      [3, 4, 4, 4, 5, 5],
      [3, 4, 4, 5, 5, 5],
    ],
    solution: [
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 5 },
      { row: 3, col: 0 },
      { row: 4, col: 2 },
      { row: 5, col: 4 },
    ],
  },
  medium: {
    size: 8,
    targetQueens: 8,
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2],
      [3, 0, 0, 4, 4, 1, 2, 2],
      [3, 3, 4, 4, 4, 5, 5, 2],
      [3, 3, 4, 4, 5, 5, 5, 5],
      [6, 3, 7, 7, 5, 5, 5, 5],
      [6, 6, 7, 7, 7, 7, 5, 5],
      [6, 6, 6, 7, 7, 7, 7, 7],
    ],
    solution: [
      { row: 0, col: 2 },
      { row: 1, col: 5 },
      { row: 2, col: 7 },
      { row: 3, col: 0 },
      { row: 4, col: 3 },
      { row: 5, col: 6 },
      { row: 6, col: 1 },
      { row: 7, col: 4 },
    ],
  },
  hard: {
    size: 9,
    targetQueens: 9,
    regions: [
      [0, 0, 0, 1, 1, 2, 2, 2, 3],
      [0, 0, 1, 1, 1, 2, 2, 3, 3],
      [4, 0, 1, 1, 2, 2, 3, 3, 3],
      [4, 4, 5, 1, 2, 6, 3, 3, 3],
      [4, 4, 5, 5, 6, 6, 7, 7, 8],
      [4, 5, 5, 5, 6, 6, 7, 7, 8],
      [4, 5, 5, 6, 6, 6, 7, 7, 8],
      [4, 5, 6, 6, 7, 7, 7, 7, 8],
      [4, 6, 6, 7, 7, 7, 8, 8, 8],
    ],
    solution: [
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 5 },
      { row: 3, col: 7 },
      { row: 4, col: 0 },
      { row: 5, col: 2 },
      { row: 6, col: 4 },
      { row: 7, col: 6 },
      { row: 8, col: 8 },
    ],
  },
};

/**
 * Premium 3D Golden Crown (Taj) Piece with Jewels & Drop-Shadow
 * Matches the physical token feel of LinkedIn Queens
 */
const GoldenCrownPiece = ({ isConflicted, size = 28 }) => {
  return (
    <div
      className={`relative flex items-center justify-center transition-transform select-none ${
        isConflicted ? "animate-bounce" : "scale-100"
      }`}
      style={{
        width: size,
        height: size,
        filter: isConflicted
          ? "drop-shadow(0 2px 4px rgba(225, 29, 72, 0.7))"
          : "drop-shadow(0 2.5px 2px rgba(0, 0, 0, 0.38))",
      }}
    >
      <svg
        viewBox="0 0 24 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="lqGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="lqRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="35%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>

        {/* Crown Main Body with 3 Peaks and Arched Base */}
        <path
          d="M2.5 15.5 L4.2 6.5 L8.5 10.5 L12 4 L15.5 10.5 L19.8 6.5 L21.5 15.5 Q12 17.2 2.5 15.5 Z"
          fill={isConflicted ? "url(#lqRedGrad)" : "url(#lqGoldGrad)"}
          stroke={isConflicted ? "#881337" : "#854d0e"}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Lower Rim / Band for Depth */}
        <path
          d="M2.8 15.2 Q12 16.8 21.2 15.2 L21.5 16.6 Q12 18.2 2.5 16.6 Z"
          fill={isConflicted ? "#9f1239" : "#b45309"}
        />

        {/* 3 Golden Jewels / Pearls at the Tips */}
        {/* Left Tip Pearl */}
        <circle
          cx="4.2"
          cy="6.2"
          r="1.4"
          fill={isConflicted ? "#ffe4e6" : "#fef08a"}
          stroke={isConflicted ? "#881337" : "#854d0e"}
          strokeWidth="0.8"
        />
        {/* Center Tip Tall Pearl */}
        <circle
          cx="12"
          cy="3.8"
          r="1.6"
          fill={isConflicted ? "#ffe4e6" : "#fef08a"}
          stroke={isConflicted ? "#881337" : "#854d0e"}
          strokeWidth="0.8"
        />
        {/* Right Tip Pearl */}
        <circle
          cx="19.8"
          cy="6.2"
          r="1.4"
          fill={isConflicted ? "#ffe4e6" : "#fef08a"}
          stroke={isConflicted ? "#881337" : "#854d0e"}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
};

export default function NQueensGame({ config = {}, onComplete }) {
  const diff = String(config?.difficulty || "medium").toLowerCase();
  const preset = FALLBACK_PUZZLES[diff] || FALLBACK_PUZZLES.medium;

  const size = Number(config?.puzzle?.size || config?.size || preset.size);
  const targetQueens = Number(config?.puzzle?.targetQueens || config?.targetQueens || size);

  const regions = useMemo(() => {
    if (Array.isArray(config?.puzzle?.regions) && config.puzzle.regions.length === size) {
      return config.puzzle.regions;
    }
    if (Array.isArray(config?.regions) && config.regions.length === size) {
      return config.regions;
    }
    return preset.regions;
  }, [config, preset, size]);

  // INITIAL STATE IS 100% EMPTY (Zero crowns pre-filled)
  // cell state: null | "X" | "Q"
  const [board, setBoard] = useState(() => config?.board || {});
  const [history, setHistory] = useState([]);
  const [movesCount, setMovesCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [win, setWin] = useState(false);

  // Silent time tracker for result scoring (no visible timer on screen in preview)
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);

  // Only reset if the puzzle identity or difficulty actually changes (prevents wiping in-progress progress on parent re-renders/navigation)
  const puzzleKey = config?.id || config?.puzzleId || config?.difficulty || "default";
  const prevPuzzleKeyRef = useRef(puzzleKey);

  useEffect(() => {
    if (prevPuzzleKeyRef.current !== puzzleKey) {
      prevPuzzleKeyRef.current = puzzleKey;
      setBoard(config?.board || {});
      setHistory([]);
      setMovesCount(0);
      setWin(false);
      completedRef.current = false;
      startTimeRef.current = Date.now();
    }
  }, [puzzleKey, config?.board]);

  // Dynamic cell sizing: perfectly crisp 1:1 square
  const cellSize = size <= 6 ? 62 : size === 7 ? 56 : size === 8 ? 52 : 46;
  const boardDimension = size * cellSize;

  // List of placed queens
  const placedQueens = useMemo(() => {
    const list = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[`${r},${c}`] === "Q") {
          list.push({ row: r, col: c, region: regions[r]?.[c] ?? 0, key: `${r},${c}` });
        }
      }
    }
    return list;
  }, [board, size, regions]);

  // Real-time Conflict Detection (LinkedIn Queens Rules)
  // Conflict if:
  //  1. More than 1 queen in same row
  //  2. More than 1 queen in same col
  //  3. More than 1 queen in same color region
  //  4. Two queens touch each other in any of 8 surrounding cells (Chebyshev dist <= 1)
  const conflictingKeys = useMemo(() => {
    const conflicts = new Set();
    const queens = placedQueens;

    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];

        const sameRow = q1.row === q2.row;
        const sameCol = q1.col === q2.col;
        const sameRegion = q1.region === q2.region;
        const isTouching = Math.abs(q1.row - q2.row) <= 1 && Math.abs(q1.col - q2.col) <= 1;

        if (sameRow || sameCol || sameRegion || isTouching) {
          conflicts.add(q1.key);
          conflicts.add(q2.key);
        }
      }
    }

    return conflicts;
  }, [placedQueens]);

  const conflictsCount = conflictingKeys.size;
  const isSolved = placedQueens.length === targetQueens && conflictsCount === 0;

  // Handle Win
  useEffect(() => {
    if (isSolved && !win && !completedRef.current) {
      completedRef.current = true;
      setWin(true);
    }
  }, [isSolved, win]);

  // Cycle: Empty -> "X" -> "Q" -> Empty
  const handleCellClick = (r, c) => {
    if (win) return;
    const key = `${r},${c}`;
    const current = board[key];

    setHistory((prev) => [...prev, { ...board }]);

    setBoard((prev) => {
      const next = { ...prev };
      if (!current) {
        next[key] = "X";
      } else if (current === "X") {
        next[key] = "Q";
      } else {
        delete next[key];
      }
      return next;
    });

    setMovesCount((m) => m + 1);
  };

  // Right-click shortcut: Toggle "Q" directly
  const handleCellContextMenu = (e, r, c) => {
    e.preventDefault();
    if (win) return;
    const key = `${r},${c}`;
    const current = board[key];

    setHistory((prev) => [...prev, { ...board }]);

    setBoard((prev) => {
      const next = { ...prev };
      if (current === "Q") {
        delete next[key];
      } else {
        next[key] = "Q";
      }
      return next;
    });

    setMovesCount((m) => m + 1);
  };

  const handleUndo = () => {
    if (history.length === 0 || win) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const handleReset = () => {
    if (win) return;
    setBoard({});
    setHistory([]);
    setMovesCount(0);
  };

  const handleSandboxRestart = () => {
    setBoard({});
    setHistory([]);
    setMovesCount(0);
    setWin(false);
    completedRef.current = false;
    startTimeRef.current = Date.now();
  };

  const handleContinue = () => {
    const elapsedSec = Math.max(Math.floor((Date.now() - startTimeRef.current) / 1000), 1);
    const score = 100;

    onComplete?.({
      score,
      rawScore: score,
      accuracy: 100,
      moves: movesCount,
      timeTaken: elapsedSec,
      timeSpent: elapsedSec,
      queens: placedQueens.map((q) => ({ row: q.row, col: q.col })),
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    });
  };

  // ── Calculate Continuous Sharp Black Region Dividing Lines ──
  // Drawn via SVG overlay to guarantee razor-sharp 90-degree corners with zero roundness
  const { horizontalLines, verticalLines } = useMemo(() => {
    const hLines = [];
    const vLines = [];

    // Horizontal borders between row r and row r + 1
    for (let r = 0; r < size - 1; r++) {
      let startCol = null;
      for (let c = 0; c < size; c++) {
        const isDiff = (regions[r]?.[c] ?? 0) !== (regions[r + 1]?.[c] ?? 0);
        if (isDiff) {
          if (startCol === null) startCol = c;
        } else {
          if (startCol !== null) {
            hLines.push({
              x1: startCol * cellSize,
              y: (r + 1) * cellSize,
              x2: c * cellSize,
            });
            startCol = null;
          }
        }
      }
      if (startCol !== null) {
        hLines.push({
          x1: startCol * cellSize,
          y: (r + 1) * cellSize,
          x2: size * cellSize,
        });
      }
    }

    // Vertical borders between col c and col c + 1
    for (let c = 0; c < size - 1; c++) {
      let startRow = null;
      for (let r = 0; r < size; r++) {
        const isDiff = (regions[r]?.[c] ?? 0) !== (regions[r]?.[c + 1] ?? 0);
        if (isDiff) {
          if (startRow === null) startRow = r;
        } else {
          if (startRow !== null) {
            vLines.push({
              x: (c + 1) * cellSize,
              y1: startRow * cellSize,
              y2: r * cellSize,
            });
            startRow = null;
          }
        }
      }
      if (startRow !== null) {
        vLines.push({
          x: (c + 1) * cellSize,
          y1: startRow * cellSize,
          y2: size * cellSize,
        });
      }
    }

    return { horizontalLines: hLines, verticalLines: vLines };
  }, [regions, size, cellSize]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center select-none py-2 px-3 font-sans">
      {/* ── 1. Top Header Controls (Matching Tango / Zip / Sudoku) ── */}
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {/* How to play Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 rounded-full font-medium text-xs cursor-pointer"
          >
            <HelpCircle size={15} />
            How to play
          </Button>

          {/* Undo Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={history.length === 0 || win}
            title="Undo"
            className="h-9 w-9 rounded-full cursor-pointer disabled:opacity-40"
          >
            <Undo2 size={16} />
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={win || Object.keys(board).length === 0}
            title="Reset"
            className="h-9 w-9 rounded-full cursor-pointer disabled:opacity-40"
          >
            <RotateCcw size={16} />
          </Button>
        </div>

        {/* Live Queens Counter / Status */}
        <div className="flex items-center gap-2">
          {conflictsCount > 0 ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <ShieldAlert size={13} /> {conflictsCount} In Attack
            </span>
          ) : placedQueens.length === targetQueens ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={13} /> All Safe!
            </span>
          ) : (
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5">
              <span>👑</span>
              <span>
                {placedQueens.length} / {targetQueens} Queens
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Authentically Styled LinkedIn Queens Board ── */}
      {/* Sharp square outer frame with thick solid black border */}
      <div
        className="relative mx-auto rounded-none border-[3.5px] border-black bg-black p-0 shadow-xl overflow-hidden"
        style={{
          width: boardDimension,
          height: boardDimension,
        }}
      >
        {/* Cell Grid */}
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
        >
          {Array.from({ length: size * size }).map((_, i) => {
            const r = Math.floor(i / size);
            const c = i % size;
            const key = `${r},${c}`;
            const regId = regions[r]?.[c] ?? 0;
            const cellVal = board[key];
            const isQueen = cellVal === "Q";
            const isCross = cellVal === "X";
            const isConflicted = isQueen && conflictingKeys.has(key);
            const bgColor = REGION_COLORS[regId % REGION_COLORS.length];

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleCellContextMenu(e, r, c)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: isConflicted ? "#fee2e2" : bgColor,
                }}
                className={`relative flex items-center justify-center select-none cursor-pointer rounded-none border-b border-r border-black/35 hover:brightness-95 active:brightness-90 p-0 m-0 focus:outline-none transition-colors ${
                  isConflicted ? "ring-2 ring-rose-500 ring-inset" : ""
                }`}
                aria-label={`Row ${r + 1}, Col ${c + 1}, Region ${regId + 1}`}
              >
                {/* Cross Mark "✕" */}
                {isCross && (
                  <span className="text-slate-800/60 font-black text-sm select-none leading-none pointer-events-none scale-100">
                    ✕
                  </span>
                )}

                {/* 3D Golden Crown "👑" (Taj) */}
                {isQueen && (
                  <GoldenCrownPiece
                    isConflicted={isConflicted}
                    size={Math.round(cellSize * 0.52)}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 3. Razor-Sharp Black Region Dividing SVG Overlay ── */}
        <svg
          className="absolute inset-0 pointer-events-none z-10 overflow-visible"
          width={boardDimension}
          height={boardDimension}
          viewBox={`0 0 ${boardDimension} ${boardDimension}`}
        >
          {/* Horizontal Region Borders */}
          {horizontalLines.map((line, idx) => (
            <line
              key={`h-${idx}`}
              x1={line.x1}
              y1={line.y}
              x2={line.x2}
              y2={line.y}
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="square"
            />
          ))}

          {/* Vertical Region Borders */}
          {verticalLines.map((line, idx) => (
            <line
              key={`v-${idx}`}
              x1={line.x}
              y1={line.y1}
              x2={line.x}
              y2={line.y2}
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="square"
            />
          ))}
        </svg>
      </div>

      {/* ── 4. Quick Tap Hint Subtext ── */}
      <div className="mt-3 text-center text-xs font-medium text-slate-400">
        Tap once to place <span className="font-bold text-slate-600">✕</span>, tap twice for{" "}
        <span className="font-bold text-slate-600">👑</span>
      </div>

      {/* ── 5. Standard How To Play Modal (Exact same as Tango / Zip / Sudoku) ── */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        rules={GAME_RULES.nqueens}
      />

      {/* ── 6. Standard Win Victory Modal (Exact same as Tango / Zip / Sudoku) ── */}
      <GameWinModal
        isOpen={win}
        score={100}
        time="Completed"
        isSandbox={Boolean(config?.isSandbox || config?.isPreview)}
        message={`Outstanding! You successfully placed all ${targetQueens} Queens with exactly one in each row, column, and color region!`}
        onContinue={handleContinue}
        onRestart={handleSandboxRestart}
      />
    </div>
  );
}
