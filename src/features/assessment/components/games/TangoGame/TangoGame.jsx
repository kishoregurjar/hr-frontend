"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Clock, HelpCircle, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlayModal from "../shared/HowToPlayModal";
import GameWinModal from "../shared/GameWinModal";
import { GAME_RULES } from "../shared/gameRules";
import { useGameTimer } from "../shared/useGameTimer";

const DEFAULT_TANGO_DATA = {
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
  const half = Math.floor(size / 2);
  const seenMessages = new Set();

  const addMessage = (text) => {
    if (!seenMessages.has(text)) {
      seenMessages.add(text);
      messages.push({ text });
    }
  };

  // Row validation
  for (let r = 0; r < size; r++) {
    const keys = Array.from({ length: size }, (_, c) => `${r}-${c}`);
    for (let i = 0; i <= size - 3; i++) {
      const a = grid[keys[i]];
      const b = grid[keys[i + 1]];
      const c = grid[keys[i + 2]];
      if (a && a === b && b === c) {
        bad.add(keys[i]);
        bad.add(keys[i + 1]);
        bad.add(keys[i + 2]);
        const sym = a === "X" ? "🌙" : "🟡";
        addMessage(`3 ${sym} in row ${r + 1} not allowed`);
      }
    }

    let xCount = 0;
    let oCount = 0;
    for (const key of keys) {
      if (grid[key] === "X") xCount += 1;
      if (grid[key] === "O") oCount += 1;
    }
    if (xCount > half || oCount > half) {
      for (const key of keys) {
        if (grid[key]) bad.add(key);
      }
      if (xCount > half) addMessage(`Max ${half} 🌙 per row`);
      if (oCount > half) addMessage(`Max ${half} 🟡 per row`);
    }
  }

  // Column validation
  for (let c = 0; c < size; c++) {
    const keys = Array.from({ length: size }, (_, r) => `${r}-${c}`);
    for (let i = 0; i <= size - 3; i++) {
      const a = grid[keys[i]];
      const b = grid[keys[i + 1]];
      const d = grid[keys[i + 2]];
      if (a && a === b && b === d) {
        bad.add(keys[i]);
        bad.add(keys[i + 1]);
        bad.add(keys[i + 2]);
        const sym = a === "X" ? "🌙" : "🟡";
        addMessage(`3 ${sym} in column ${c + 1} not allowed`);
      }
    }

    let xCount = 0;
    let oCount = 0;
    for (const key of keys) {
      if (grid[key] === "X") xCount += 1;
      if (grid[key] === "O") oCount += 1;
    }
    if (xCount > half || oCount > half) {
      for (const key of keys) {
        if (grid[key]) bad.add(key);
      }
      if (xCount > half) addMessage(`Max ${half} 🌙 per column`);
      if (oCount > half) addMessage(`Max ${half} 🟡 per column`);
    }
  }

  // Constraints validation
  for (const rule of constraints) {
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
  const size = Number(config?.size || DEFAULT_TANGO_DATA.size) || 6;
  const initial = config?.initial || DEFAULT_TANGO_DATA.initial;
  const constraints = config?.constraints || DEFAULT_TANGO_DATA.constraints;

  const [grid, setGrid] = useState(() => ({ ...(initial || {}) }));
  const [history, setHistory] = useState([]);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cellSize, setCellSize] = useState(54);
  const solvedRef = useRef(false);

  const { formatted, startTimer, stopTimer, time } = useGameTimer();

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

  const handleContinue = () => {
    const rawScore = 100;
    onComplete?.({
      rawScore,
      score: rawScore,
      normalizedScore: rawScore,
      accuracy: 100,
      timeSpent: time,
      finalState: { grid },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center select-none py-2 px-3">
      {/* Top Header Controls */}
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 rounded-full font-medium"
          >
            <HelpCircle size={15} />
            How to play
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={history.length === 0 || win}
            title="Undo"
            className="h-9 w-9 rounded-full"
          >
            <Undo2 size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={win}
            title="Reset"
            className="h-9 w-9 rounded-full"
          >
            <RotateCcw size={16} />
          </Button>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 shadow-sm">
          <Clock size={15} className="text-amber-500" />
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            {formatted}
          </span>
        </div>
      </div>

      {/* Legend and Balance Guide */}
      <div className="mb-4 flex items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🟡</span> Sun (O)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🌙</span> Moon (X)
        </div>
        <div>
          Equal 3 & 3 per line
        </div>
      </div>

      {/* Error / Feedback Banner */}
      {messages.length > 0 && (
        <div className="mb-3 w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-xs font-semibold text-destructive animate-in fade-in duration-200">
          {messages[0].text}
        </div>
      )}

      {/* Board Container */}
      <div
        className="relative mx-auto rounded-2xl border-2 border-slate-900 bg-card p-1 shadow-xl"
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
            const isBad = bad.has(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellClick(key)}
                style={{ width: cellSize, height: cellSize }}
                className={`relative flex items-center justify-center border border-slate-200 dark:border-slate-800 text-2xl transition-all cursor-pointer font-bold ${
                  isInitial
                    ? "bg-muted/60 text-foreground cursor-not-allowed"
                    : "hover:bg-accent/40 active:scale-95"
                } ${isBad ? "bg-destructive/15 border-destructive/50" : ""}`}
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
        message="Bravo! All rows, columns and constraints have been flawlessly balanced!"
        onContinue={handleContinue}
      />
    </div>
  );
}
