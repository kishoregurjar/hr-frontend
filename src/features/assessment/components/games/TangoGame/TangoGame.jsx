"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlayModal from "../shared/HowToPlayModal";
import GameWinModal from "../shared/GameWinModal";
import { GAME_RULES } from "../shared/gameRules";
import { useGameTimer } from "../shared/useGameTimer";

const TANGO_PUZZLES = {
  easy: {
    size: 4,
    initial: {
      "0-0": "O",
      "1-3": "O",
      "2-1": "X",
      "3-0": "O",
      "3-3": "X",
    },
    constraints: [
      { a: "2-0", b: "2-1", type: "equal" },
      { a: "1-1", b: "1-2", type: "not-equal" },
      { a: "3-1", b: "3-2", type: "not-equal" },
    ],
  },
  medium: {
    size: 6,
    initial: {
      "0-4": "X",
      "0-5": "X",
      "1-1": "X",
      "1-2": "O",
      "1-5": "O",
      "2-1": "O",
      "3-4": "X",
      "4-0": "X",
      "4-3": "X",
      "4-4": "X",
      "5-0": "O",
      "5-1": "O",
    },
    constraints: [
      { a: "0-0", b: "0-1", type: "not-equal" },
      { a: "0-0", b: "1-0", type: "not-equal" },
      { a: "1-3", b: "1-4", type: "not-equal" },
      { a: "1-4", b: "2-4", type: "equal" },
      { a: "3-1", b: "4-1", type: "not-equal" },
      { a: "4-2", b: "4-1", type: "equal" },
      { a: "5-5", b: "4-5", type: "not-equal" },
      { a: "5-5", b: "5-4", type: "not-equal" },
    ],
  },
  hard: {
    size: 8,
    initial: {
      "0-0": "O",
      "0-3": "X",
      "0-6": "O",
      "1-1": "O",
      "1-4": "O",
      "1-7": "O",
      "2-2": "X",
      "2-5": "O",
      "3-0": "X",
      "3-3": "X",
      "3-6": "X",
      "4-1": "O",
      "4-4": "O",
      "4-7": "X",
      "5-2": "O",
      "5-5": "O",
      "6-0": "X",
      "6-3": "O",
      "6-6": "O",
      "7-2": "O",
      "7-4": "X",
      "7-7": "O",
    },
    constraints: [
      { a: "0-3", b: "0-4", type: "equal" },
      { a: "0-4", b: "0-5", type: "not-equal" },
      { a: "0-0", b: "1-0", type: "not-equal" },
      { a: "1-3", b: "1-4", type: "equal" },
      { a: "2-1", b: "2-2", type: "equal" },
      { a: "3-1", b: "3-2", type: "equal" },
      { a: "3-3", b: "4-3", type: "equal" },
      { a: "4-0", b: "4-1", type: "equal" },
      { a: "5-0", b: "5-1", type: "equal" },
      { a: "5-6", b: "6-6", type: "not-equal" },
      { a: "6-7", b: "7-7", type: "not-equal" },
      { a: "7-3", b: "7-4", type: "equal" },
      { a: "7-6", b: "7-7", type: "not-equal" },
    ],
  },
};

function badgePos(a, b, cellSize) {
  const [r1, c1] = String(a).split("-").map(Number);
  const [r2, c2] = String(b).split("-").map(Number);
  const isHorizontal = r1 === r2;

  if (isHorizontal) {
    return {
      left: (Math.min(c1, c2) + 1) * cellSize,
      top: r1 * cellSize + cellSize / 2,
    };
  }

  return {
    left: c1 * cellSize + cellSize / 2,
    top: (Math.min(r1, r2) + 1) * cellSize,
  };
}

function validateTangoGrid(grid, size, constraints) {
  const bad = new Set();
  const messages = [];

  const addMessage = (msg) => {
    if (!messages.includes(msg)) messages.push(msg);
  };

  const half = Math.floor(size / 2);

  // 1. Row/Col counts check
  for (let r = 0; r < size; r++) {
    let sunCount = 0;
    let moonCount = 0;
    for (let c = 0; c < size; c++) {
      const v = grid[`${r}-${c}`];
      if (v === "O") sunCount++;
      if (v === "X") moonCount++;
    }
    if (sunCount > half) {
      for (let c = 0; c < size; c++) if (grid[`${r}-${c}`] === "O") bad.add(`${r}-${c}`);
      addMessage(`Row ${r + 1} has too many Suns (> ${half})`);
    }
    if (moonCount > half) {
      for (let c = 0; c < size; c++) if (grid[`${r}-${c}`] === "X") bad.add(`${r}-${c}`);
      addMessage(`Row ${r + 1} has too many Moons (> ${half})`);
    }
  }

  for (let c = 0; c < size; c++) {
    let sunCount = 0;
    let moonCount = 0;
    for (let r = 0; r < size; r++) {
      const v = grid[`${r}-${c}`];
      if (v === "O") sunCount++;
      if (v === "X") moonCount++;
    }
    if (sunCount > half) {
      for (let r = 0; r < size; r++) if (grid[`${r}-${c}`] === "O") bad.add(`${r}-${c}`);
      addMessage(`Column ${c + 1} has too many Suns (> ${half})`);
    }
    if (moonCount > half) {
      for (let r = 0; r < size; r++) if (grid[`${r}-${c}`] === "X") bad.add(`${r}-${c}`);
      addMessage(`Column ${c + 1} has too many Moons (> ${half})`);
    }
  }

  // 2. No three identical symbols adjacent rule
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 2; c++) {
      const a = grid[`${r}-${c}`];
      const b = grid[`${r}-${c + 1}`];
      const d = grid[`${r}-${c + 2}`];
      if (a && a === b && b === d) {
        bad.add(`${r}-${c}`);
        bad.add(`${r}-${c + 1}`);
        bad.add(`${r}-${c + 2}`);
        addMessage(`Three consecutive identical symbols in row ${r + 1}`);
      }
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 2; r++) {
      const a = grid[`${r}-${c}`];
      const b = grid[`${r + 1}-${c}`];
      const d = grid[`${r + 2}-${c}`];
      if (a && a === b && b === d) {
        bad.add(`${r}-${c}`);
        bad.add(`${r + 1}-${c}`);
        bad.add(`${r + 2}-${c}`);
        addMessage(`Three consecutive identical symbols in col ${c + 1}`);
      }
    }
  }

  // 3. Relational constraints rule
  for (const rule of constraints || []) {
    const A = grid[rule.a];
    const B = grid[rule.b];
    if (!A || !B) continue;

    if (rule.type === "equal" && A !== B) {
      bad.add(rule.a);
      bad.add(rule.b);
      addMessage(`🟰 rule broken: cells must match`);
    }
    if (rule.type === "not-equal" && A === B) {
      bad.add(rule.a);
      bad.add(rule.b);
      addMessage(`✖️ rule broken: cells must differ`);
    }
  }

  return { bad, messages };
}

export default function TangoGame({ config = {}, onComplete }) {
  const diff = String(config?.difficulty || "medium").toLowerCase();
  const puzzle = TANGO_PUZZLES[diff] || TANGO_PUZZLES.medium;
  const size = Number(config?.size || puzzle.size) || 6;
  const initial = config?.initial || puzzle.initial;
  const constraints = config?.constraints || puzzle.constraints;
  const half = Math.floor(size / 2);

  const [grid, setGrid] = useState(() => ({ ...(initial || {}) }));
  const [history, setHistory] = useState([]);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cellSize, setCellSize] = useState(54);
  const solvedRef = useRef(false);
  const violationsRef = useRef(0);
  const prevBadSizeRef = useRef(0);

  const { formatted, startTimer, stopTimer, resetTimer, time } = useGameTimer();

  const handleSandboxRestart = () => {
    setWin(false);
    solvedRef.current = false;
    violationsRef.current = 0;
    prevBadSizeRef.current = 0;
    setGrid({ ...(initial || {}) });
    setHistory([]);
    resetTimer();
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  useEffect(() => {
    const handleResize = () => {
      const maxDim = typeof window !== "undefined" ? Math.min(window.innerWidth - 64, 460) : 380;
      const calculated = Math.floor(maxDim / size);
      setCellSize(Math.max(42, Math.min(calculated, 64)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const { bad, messages } = useMemo(() => {
    return validateTangoGrid(grid, size, constraints);
  }, [grid, size, constraints]);

  // Check Win condition
  useEffect(() => {
    if (win || solvedRef.current) return;

    const totalCells = size * size;
    const filledCount = Object.keys(grid).filter((k) => grid[k] === "X" || grid[k] === "O").length;

    if (filledCount === totalCells && bad.size === 0 && messages.length === 0) {
      solvedRef.current = true;
      stopTimer();
      setWin(true);
    }
  }, [grid, bad, messages, size, win, stopTimer]);

  const handleCellClick = (key) => {
    if (initial[key] || win || solvedRef.current) return;

    const currentVal = grid[key] || "";
    // Cycle: Empty -> "O" (Sun) -> "X" (Moon) -> Empty
    const nextVal = currentVal === "" ? "O" : currentVal === "O" ? "X" : "";

    setHistory((prev) => [...prev, { ...grid }]);
    setGrid((prev) => {
      const updated = { ...prev };
      if (nextVal) {
        updated[key] = nextVal;
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

  const handleUndo = () => {
    if (history.length === 0 || win) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setGrid(last);
  };

  const handleReset = () => {
    if (win) return;
    setHistory((prev) => [...prev, { ...grid }]);
    setGrid({ ...(initial || {}) });
  };

  useEffect(() => {
    if (bad.size > prevBadSizeRef.current) {
      violationsRef.current += 1;
    }
    prevBadSizeRef.current = bad.size;
  }, [bad.size]);

  const handleContinue = () => {
    const rawScore = 100;
    const computedAccuracy = Math.max(
      50,
      Math.round(100 - violationsRef.current * 5)
    );

    onComplete?.({
      rawScore,
      score: rawScore,
      normalizedScore: rawScore,
      accuracy: computedAccuracy,
      timeSpent: time,
      violations: violationsRef.current,
      finalState: { grid },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center select-none py-2 px-3">
      {/* Top Header Controls Toolbar */}
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 rounded-full font-bold text-xs bg-white hover:bg-slate-50 border-slate-200 shadow-2xs text-slate-700 cursor-pointer"
          >
            <HelpCircle size={14} className="text-indigo-600" />
            How to play
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={history.length === 0 || win}
            title="Undo"
            className="h-8 w-8 rounded-full bg-white hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer disabled:opacity-40"
          >
            <Undo2 size={14} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={win}
            title="Reset"
            className="h-8 w-8 rounded-full bg-white hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer disabled:opacity-40"
          >
            <RotateCcw size={14} />
          </Button>
        </div>
      </div>

      {/* Legend and Balance Guide */}
      <div className="mb-5 inline-flex items-center justify-center gap-3.5 bg-white/95 backdrop-blur border border-slate-200 px-4 py-1.5 rounded-full shadow-2xs text-xs font-bold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="text-base drop-shadow-xs">🟡</span> Sun (O)
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-base drop-shadow-xs">🌙</span> Moon (X)
        </div>
        <span className="text-slate-300">•</span>
        <div className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-indigo-700 font-extrabold text-[11px]">
          Equal {half} & {half} per line
        </div>
      </div>

      {/* Board Container */}
      <div
        className="relative mx-auto rounded-3xl border-2 border-slate-800 bg-white p-1 shadow-xl ring-4 ring-slate-100/80"
        style={{ width: size * cellSize + 10, height: size * cellSize + 10 }}
      >
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
        >
          {Array.from({ length: size * size }).map((_, i) => {
            const r = Math.floor(i / size);
            const c = i % size;
            const key = `${r}-${c}`;
            const isInitial = Boolean(initial[key]);
            const val = grid[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellClick(key)}
                style={{ width: cellSize, height: cellSize }}
                className={`relative flex items-center justify-center border border-slate-200 text-2xl transition-all font-bold select-none rounded-md ${
                  isInitial
                    ? "bg-slate-100/90 text-foreground cursor-not-allowed"
                    : "hover:bg-indigo-50/40 active:scale-95 bg-white cursor-pointer"
                }`}
              >
                {val === "O" && <span className="drop-shadow-xs">🟡</span>}
                {val === "X" && <span className="drop-shadow-xs">🌙</span>}
              </button>
            );
          })}
        </div>

        {/* Constraint Badges */}
        {constraints.map((rule, idx) => {
          const pos = badgePos(rule.a, rule.b, cellSize);
          return (
            <div
              key={idx}
              className={`absolute pointer-events-none z-20 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-black shadow-md border ${
                rule.type === "equal"
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "bg-rose-500 text-white border-rose-600"
              }`}
              style={{ left: pos.left + 5, top: pos.top + 5 }}
            >
              {rule.type === "equal" ? "=" : "×"}
            </div>
          );
        })}
      </div>

      {/* Rules Modal */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        rules={GAME_RULES.tango}
      />

      {/* Victory Modal */}
      <GameWinModal
        isOpen={win}
        score={100}
        time={formatted}
        isSandbox={Boolean(config?.isSandbox || config?.isPreview)}
        message="Bravo! All rows, columns and constraints have been flawlessly balanced!"
        onContinue={handleContinue}
        onRestart={handleSandboxRestart}
      />
    </div>
  );
}
