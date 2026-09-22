"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Clock, HelpCircle, RotateCcw, Undo2, Eraser, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlayModal from "../shared/HowToPlayModal";
import GameWinModal from "../shared/GameWinModal";
import { GAME_RULES } from "../shared/gameRules";
import { useGameTimer } from "../shared/useGameTimer";

const FALLBACK_BOARD = [
  [5, 1, 0, 4, 0, 3],
  [0, 3, 4, 0, 2, 0],
  [0, 0, 5, 6, 0, 0],
  [3, 0, 1, 2, 0, 0],
  [0, 5, 0, 0, 1, 0],
  [1, 2, 0, 5, 4, 0],
];

const FALLBACK_SOLUTION = [
  [5, 1, 2, 4, 6, 3],
  [6, 3, 4, 1, 2, 5],
  [2, 4, 5, 6, 3, 1],
  [3, 6, 1, 2, 5, 4],
  [4, 5, 6, 3, 1, 2],
  [1, 2, 3, 5, 4, 6],
];

const cloneBoard = (grid) => grid.map((row) => [...row]);

export default function SudokuGame({ config = {}, onComplete }) {
  const size = 6;
  const boxRows = 2;
  const boxCols = 3;

  const initialBoard = useMemo(() => {
    const incoming = config?.board || config?.puzzle || config?.initialBoard;
    if (Array.isArray(incoming) && incoming.length === 6) {
      return incoming.map((r) => r.map((v) => Number(v) || 0));
    }
    return FALLBACK_BOARD;
  }, [config]);

  const [board, setBoard] = useState(() => cloneBoard(initialBoard));
  const [notes, setNotes] = useState(() =>
    Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => new Set()))
  );
  const [selected, setSelected] = useState(null); // [r, c]
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cellSize, setCellSize] = useState(52);
  const solvedRef = useRef(false);

  const { formatted, startTimer, stopTimer, time } = useGameTimer();

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  useEffect(() => {
    const handleResize = () => {
      const maxDim = typeof window !== "undefined" ? Math.min(window.innerWidth - 64, 420) : 360;
      const calculated = Math.floor(maxDim / size);
      setCellSize(Math.max(40, Math.min(calculated, 60)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  // Conflict calculation
  const conflictCells = useMemo(() => {
    const conflicts = new Set();

    // Check rows
    for (let r = 0; r < size; r++) {
      const seen = new Map();
      for (let c = 0; c < size; c++) {
        const val = board[r][c];
        if (val > 0) {
          if (seen.has(val)) {
            conflicts.add(`${r}-${c}`);
            conflicts.add(`${r}-${seen.get(val)}`);
          } else {
            seen.set(val, c);
          }
        }
      }
    }

    // Check columns
    for (let c = 0; c < size; c++) {
      const seen = new Map();
      for (let r = 0; r < size; r++) {
        const val = board[r][c];
        if (val > 0) {
          if (seen.has(val)) {
            conflicts.add(`${r}-${c}`);
            conflicts.add(`${seen.get(val)}-${c}`);
          } else {
            seen.set(val, r);
          }
        }
      }
    }

    // Check 2x3 blocks
    for (let br = 0; br < size; br += boxRows) {
      for (let bc = 0; bc < size; bc += boxCols) {
        const seen = new Map();
        for (let r = br; r < br + boxRows; r++) {
          for (let c = bc; c < bc + boxCols; c++) {
            const val = board[r][c];
            if (val > 0) {
              if (seen.has(val)) {
                conflicts.add(`${r}-${c}`);
                conflicts.add(seen.get(val));
              } else {
                seen.set(val, `${r}-${c}`);
              }
            }
          }
        }
      }
    }

    return conflicts;
  }, [board, size, boxRows, boxCols]);

  // Win condition check
  useEffect(() => {
    if (win || solvedRef.current) return;

    const allFilled = board.every((row) => row.every((val) => val >= 1 && val <= 6));
    if (allFilled && conflictCells.size === 0) {
      solvedRef.current = true;
      stopTimer();
      setWin(true);
    }
  }, [board, conflictCells, win, stopTimer]);

  const handleSelectCell = (r, c) => {
    setSelected([r, c]);
  };

  const handleInputNumber = (num) => {
    if (!selected || win) return;
    const [r, c] = selected;

    // Locked initial clues cannot be edited
    if (initialBoard[r][c] !== 0) return;

    if (isNotesMode) {
      setNotes((prev) => {
        const next = prev.map((row) => row.map((s) => new Set(s)));
        const currentSet = next[r][c];
        if (currentSet.has(num)) {
          currentSet.delete(num);
        } else {
          currentSet.add(num);
        }
        return next;
      });
      return;
    }

    setHistory((prev) => [...prev, cloneBoard(board)]);
    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[r][c] = next[r][c] === num ? 0 : num;
      return next;
    });
  };

  const handleErase = () => {
    if (!selected || win) return;
    const [r, c] = selected;
    if (initialBoard[r][c] !== 0) return;

    setHistory((prev) => [...prev, cloneBoard(board)]);
    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[r][c] = 0;
      return next;
    });

    setNotes((prev) => {
      const next = prev.map((row) => row.map((s) => new Set(s)));
      next[r][c].clear();
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0 || win) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBoard(last);
  };

  const handleReset = () => {
    if (win) return;
    setHistory((prev) => [...prev, cloneBoard(board)]);
    setBoard(cloneBoard(initialBoard));
  };

  // Keyboard support (1-6, backspace)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (win) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 6) {
        handleInputNumber(num);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key === "ArrowUp" && selected) {
        setSelected(([r, c]) => [Math.max(0, r - 1), c]);
      } else if (e.key === "ArrowDown" && selected) {
        setSelected(([r, c]) => [Math.min(5, r + 1), c]);
      } else if (e.key === "ArrowLeft" && selected) {
        setSelected(([r, c]) => [r, Math.max(0, c - 1)]);
      } else if (e.key === "ArrowRight" && selected) {
        setSelected(([r, c]) => [r, Math.min(5, c + 1)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const selectedValue = selected ? board[selected[0]][selected[1]] : null;

  const handleContinue = () => {
    const rawScore = 100;
    onComplete?.({
      rawScore,
      score: rawScore,
      normalizedScore: rawScore,
      accuracy: 100,
      timeSpent: time,
      finalState: { board },
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
      </div>

      {/* Main Sudoku 6x6 Grid */}
      <div
        className="rounded-2xl border-2 border-slate-900 bg-card p-1 shadow-xl overflow-hidden"
        style={{ width: size * cellSize + 10 }}
      >
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r][c] !== 0;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isSameNum = selectedValue && val === selectedValue && val > 0;
              const isConflict = conflictCells.has(`${r}-${c}`);

              // Thick 2x3 block borders
              const borderBottom = r === 1 || r === 3 ? "border-b-2 border-b-slate-900 dark:border-b-slate-100" : "border-b border-b-slate-200 dark:border-b-slate-800";
              const borderRight = c === 2 ? "border-r-2 border-r-slate-900 dark:border-r-slate-100" : "border-r border-r-slate-200 dark:border-r-slate-800";

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleSelectCell(r, c)}
                  style={{ width: cellSize, height: cellSize }}
                  className={`relative flex items-center justify-center font-bold text-xl transition-colors cursor-pointer ${borderBottom} ${borderRight} ${
                    isInitial
                      ? "bg-muted/40 text-foreground font-black"
                      : "text-primary font-bold hover:bg-accent/40"
                  } ${isSelected ? "!bg-primary/20 ring-2 ring-primary inset-0 z-10" : ""} ${
                    isSameNum && !isSelected ? "bg-primary/10" : ""
                  } ${isConflict ? "!bg-destructive/20 !text-destructive font-black" : ""}`}
                >
                  {val > 0 ? (
                    val
                  ) : notes[r][c].size > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 text-[9px] font-semibold text-muted-foreground leading-none pointer-events-none">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <span key={n} className="w-2.5 h-2.5 text-center">
                          {notes[r][c].has(n) ? n : ""}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Control Buttons (Notes & Erase) */}
      <div className="mt-4 flex items-center gap-3">
        <Button
          variant={isNotesMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsNotesMode((prev) => !prev)}
          className="rounded-full flex items-center gap-1.5 font-semibold text-xs"
        >
          <Edit3 size={14} />
          {isNotesMode ? "Notes: ON" : "Notes: OFF"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleErase}
          className="rounded-full flex items-center gap-1.5 font-semibold text-xs"
        >
          <Eraser size={14} />
          Erase
        </Button>
      </div>

      {/* Number Keypad 1 to 6 */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleInputNumber(num)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-card text-lg font-black text-foreground shadow-sm hover:border-primary hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Rules Modal */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        rules={GAME_RULES.sudoku}
      />

      {/* Victory Modal */}
      <GameWinModal
        isOpen={win}
        score={100}
        time={formatted}
        message="Masterful! The Mini Sudoku grid is completely and accurately filled!"
        onContinue={handleContinue}
      />
    </div>
  );
}
