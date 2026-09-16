"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Clock, HelpCircle, RotateCcw, Undo2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlayModal from "../shared/HowToPlayModal";
import GameWinModal from "../shared/GameWinModal";
import { GAME_RULES } from "../shared/gameRules";
import { useGameTimer } from "../shared/useGameTimer";

// PRNG and guaranteed solvable Hamiltonian path generator matching minderWorld
function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function allCells(size) {
  const cells = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      cells.push(`${row}-${col}`);
    }
  }
  return cells;
}

function getNeighbors(cell, size) {
  const [row, col] = cell.split("-").map(Number);
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]
    .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
    .map(([r, c]) => `${r}-${c}`);
}

function onwardDegree(cell, visited, size) {
  let degree = 0;
  for (const next of getNeighbors(cell, size)) {
    if (!visited.has(next)) degree += 1;
  }
  return degree;
}

function buildSnakePath(size) {
  const path = [];
  for (let row = size - 1; row >= 0; row--) {
    const cols =
      (size - 1 - row) % 2 === 0
        ? Array.from({ length: size }, (_, i) => i)
        : Array.from({ length: size }, (_, i) => size - 1 - i);

    for (const col of cols) {
      path.push(`${row}-${col}`);
    }
  }
  return path;
}

function generateHamiltonianPath(size, seed = 331680) {
  const total = size * size;
  const maxAttempts = 12;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rng = makeRng(seed + attempt * 97);
    const starts = shuffle(allCells(size), rng);

    for (const start of starts.slice(0, 10)) {
      const path = [start];
      const visited = new Set(path);

      const walk = () => {
        if (path.length === total) return true;

        const current = path[path.length - 1];
        const options = getNeighbors(current, size).filter((cell) => !visited.has(cell));

        if (options.length === 0) return false;

        const ranked = options
          .map((cell) => ({
            cell,
            degree: onwardDegree(cell, visited, size),
            bias: rng(),
          }))
          .sort((a, b) => {
            if (a.degree !== b.degree) return a.degree - b.degree;
            return a.bias - b.bias;
          });

        for (const { cell } of ranked) {
          visited.add(cell);
          path.push(cell);
          if (walk()) return true;
          path.pop();
          visited.delete(cell);
        }

        return false;
      };

      if (walk()) return path;
    }
  }

  return buildSnakePath(size);
}

function getTurnIndexes(path) {
  const turns = [];
  for (let i = 1; i < path.length - 1; i++) {
    const [pr, pc] = path[i - 1].split("-").map(Number);
    const [cr, cc] = path[i].split("-").map(Number);
    const [nr, nc] = path[i + 1].split("-").map(Number);
    const prevDir = `${cr - pr},${cc - pc}`;
    const nextDir = `${nr - cr},${nc - cc}`;
    if (prevDir !== nextDir) turns.push(i);
  }
  return turns;
}

function buildClueIndexes(path, clueCount, rng) {
  const total = path.length;
  const selected = new Set([0, total - 1]);
  const turnIndexes = shuffle(getTurnIndexes(path), rng);

  for (const index of turnIndexes) {
    if (selected.size >= clueCount) break;
    selected.add(index);
  }

  const spacing = Math.max(3, Math.floor(total / Math.max(4, clueCount)));
  for (let index = spacing; index < total - 1 && selected.size < clueCount; index += spacing) {
    selected.add(index);
  }

  if (selected.size < clueCount) {
    const remaining = shuffle(
      Array.from({ length: total - 2 }, (_, index) => index + 1).filter((index) => !selected.has(index)),
      rng
    );

    for (const index of remaining) {
      if (selected.size >= clueCount) break;
      selected.add(index);
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

function buildZipNumbers(path, clueCount, seed = 331680) {
  const numbers = {};
  for (const cell of path) numbers[cell] = " ";

  const rng = makeRng(seed ^ 0x51f15);
  const clueIndexes = buildClueIndexes(path, clueCount, rng);
  clueIndexes.forEach((index, clueNumber) => {
    numbers[path[index]] = clueNumber + 1;
  });

  return numbers;
}

function buildWalls(path, size, wallCount, seed = 764201) {
  const pathEdges = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    pathEdges.add([path[i], path[i + 1]].sort().join("|"));
  }

  const allEdges = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (row < size - 1) {
        allEdges.push([`${row}-${col}`, `${row + 1}-${col}`].sort().join("|"));
      }
      if (col < size - 1) {
        allEdges.push([`${row}-${col}`, `${row}-${col + 1}`].sort().join("|"));
      }
    }
  }

  const safeEdges = allEdges.filter((edge) => !pathEdges.has(edge));
  return shuffle(safeEdges, makeRng(seed)).slice(0, wallCount);
}

export default function ZipGame({ config = {}, onComplete }) {
  const diff = String(config?.difficulty || "easy").toLowerCase();
  const defaultSize = diff === "easy" ? 5 : diff === "hard" ? 8 : 6;
  const size = Number(config?.size) || defaultSize;
  const clueCount = Number(config?.clueCount) || (size <= 5 ? 6 : size === 6 ? 8 : 11);
  const wallCount = Number(config?.wallCount) || (size <= 5 ? 6 : size === 6 ? 12 : 24);

  // Generate 100% mathematically guaranteed solvable puzzle with actual Hamiltonian solution
  const generatedPuzzle = useMemo(() => {
    if (config?.numbers && config?.solutionPath && config?.walls) {
      return {
        numbers: config.numbers,
        solutionPath: config.solutionPath,
        walls: config.walls,
      };
    }
    const seed = 331680;
    const solPath = generateHamiltonianPath(size, seed);
    const nums = buildZipNumbers(solPath, clueCount, seed);
    const w = buildWalls(solPath, size, wallCount, seed + 99);
    return {
      numbers: nums,
      solutionPath: solPath,
      walls: w,
    };
  }, [config, size, clueCount, wallCount]);

  const numbers = generatedPuzzle.numbers;
  const solutionPath = generatedPuzzle.solutionPath;
  const wallsList = generatedPuzzle.walls;

  const walls = useMemo(() => new Set(wallsList), [wallsList]);

  const hasWall = useCallback(
    (cellA, cellB) => {
      const edge = [cellA, cellB].sort().join("|");
      return walls.has(edge);
    },
    [walls]
  );

  const startCell = useMemo(() => {
    const found = Object.entries(numbers).find(([, val]) => Number(val) === 1);
    return found ? found[0] : (solutionPath?.[0] ?? "0-0");
  }, [numbers, solutionPath]);

  const lastNumber = useMemo(() => {
    const vals = Object.values(numbers).filter((v) => typeof v === "number");
    return vals.length ? Math.max(...vals) : clueCount;
  }, [numbers, clueCount]);

  const [path, setPath] = useState([startCell]);
  const [current, setCurrent] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cellSize, setCellSize] = useState(48);
  const [lastMoveError, setLastMoveError] = useState("");
  const solvedRef = useRef(false);

  const { formatted, startTimer, stopTimer, time } = useGameTimer();

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  useEffect(() => {
    const handleResize = () => {
      const maxDim = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
      const calculated = Math.floor(maxDim / size);
      setCellSize(Math.max(34, Math.min(calculated, 54)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const getPoint = (cell) => {
    const [r, c] = String(cell).split("-").map(Number);
    return {
      x: c * cellSize + cellSize / 2,
      y: r * cellSize + cellSize / 2,
    };
  };

  const getCurrentFromPath = (nextPath) => {
    for (let i = nextPath.length - 1; i >= 0; i--) {
      if (typeof numbers[nextPath[i]] === "number") {
        return numbers[nextPath[i]];
      }
    }
    return 1;
  };

  const checkPathError = (nextPath) => {
    let expected = 1;
    for (let i = 0; i < nextPath.length; i++) {
      const num = numbers[nextPath[i]];
      if (typeof num === "number") {
        if (num !== expected) return true;
        expected += 1;
      }
    }
    return false;
  };

  const triggerWin = (solvedPath) => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    stopTimer();
    setWin(true);
  };

  const handleContinue = () => {
    const rawScore = 100;
    onComplete?.({
      rawScore,
      score: rawScore,
      normalizedScore: rawScore,
      accuracy: 100,
      timeSpent: time,
      cellsVisited: path.length,
      finalState: { path },
    });
  };

  const move = (cell, options = {}) => {
    const { allowRewind = true } = options;
    if (win || solvedRef.current) return;

    setLastMoveError("");

    // Rewind logic when moving back into existing path
    if (path.includes(cell)) {
      if (!allowRewind) return;
      const index = path.indexOf(cell);
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      setCurrent(getCurrentFromPath(newPath));
      setError(checkPathError(newPath));
      setHint(null);
      return;
    }

    const last = path[path.length - 1];
    const [lr, lc] = String(last).split("-").map(Number);
    const [tr, tc] = String(cell).split("-").map(Number);

    if ((lr === tr && lc !== tc) || (lc === tc && lr !== tr)) {
      const isHoriz = lr === tr;
      const diff = isHoriz ? tc - lc : tr - lr;
      const dir = diff > 0 ? 1 : -1;
      let currPath = [...path];
      let localCurr = current;
      let aborted = false;

      for (
        let c = (isHoriz ? lc : lr) + dir;
        dir > 0 ? c <= (isHoriz ? tc : tr) : c >= (isHoriz ? tc : tr);
        c += dir
      ) {
        const step = isHoriz ? `${lr}-${c}` : `${c}-${lc}`;

        if (currPath.length > 1 && step === currPath[currPath.length - 2]) {
          currPath.pop();
          localCurr = getCurrentFromPath(currPath);
          continue;
        }

        if (hasWall(currPath[currPath.length - 1], step)) {
          aborted = true;
          break;
        }

        if (currPath.includes(step)) {
          aborted = true;
          break;
        }

        currPath.push(step);
        const next = numbers[step];
        if (typeof next === "number") {
          if (next !== localCurr + 1) {
            setError(true);
            break;
          }
          localCurr = next;
          setError(false);
        }
      }

      if (!aborted) {
        setPath(currPath);
        setCurrent(localCurr);
        const hasErr = checkPathError(currPath);
        setError(hasErr);
        setHint(null);

        // Check win condition
        if (
          currPath.length === size * size &&
          !hasErr &&
          numbers[currPath[currPath.length - 1]] === lastNumber
        ) {
          triggerWin(currPath);
        }
      }
    }
  };

  const handleUndo = () => {
    if (path.length <= 1 || win) return;
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setCurrent(getCurrentFromPath(newPath));
    setError(checkPathError(newPath));
    setHint(null);
  };

  const handleReset = () => {
    setPath([startCell]);
    setCurrent(1);
    setError(false);
    setHint(null);
    setLastMoveError("");
    solvedRef.current = false;
  };

  const showHint = () => {
    if (win || !Array.isArray(solutionPath) || solutionPath.length === 0 || hintsLeft <= 0) return;

    setError(false);
    let newPath = [...path];

    // Align with ground truth solution path
    while (newPath.length > 0) {
      let valid = true;
      for (let i = 0; i < newPath.length; i++) {
        if (newPath[i] !== solutionPath[i]) {
          valid = false;
          break;
        }
      }
      if (valid) break;
      newPath.pop();
    }

    if (newPath.length === 0) newPath = [startCell];

    setPath(newPath);
    setCurrent(getCurrentFromPath(newPath));
    setLastMoveError("");

    const nextStep = solutionPath[newPath.length];
    if (nextStep) {
      setHint({ from: newPath[newPath.length - 1], to: nextStep });
      setHintsLeft((prev) => prev - 1);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center select-none py-2 px-3">
      {/* Top Controls Bar */}
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
            size="sm"
            onClick={showHint}
            disabled={hintsLeft <= 0 || win}
            className="flex items-center gap-1.5 rounded-full font-medium"
          >
            <Lightbulb size={15} className="text-orange-500" />
            Hint ({hintsLeft})
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={path.length <= 1 || win}
            title="Undo"
            className="h-9 w-9 rounded-full"
          >
            <Undo2 size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={path.length <= 1 || win}
            title="Reset path"
            className="h-9 w-9 rounded-full"
          >
            <RotateCcw size={16} />
          </Button>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 shadow-sm">
          <Clock size={15} className="text-orange-500" />
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            {formatted}
          </span>
        </div>
      </div>

      {/* Target Checkpoint Badge */}
      <div className="mb-3 text-center bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-2xl py-2 px-6 mx-auto shadow-xs">
        <p className="text-[10px] font-black tracking-widest text-orange-600 dark:text-orange-400 uppercase">
          Target Checkpoint
        </p>
        <p className="text-2xl font-black text-foreground">{lastNumber}</p>
      </div>

      {/* Error / Status Text */}
      <div className="text-center min-h-5 mb-2 text-xs font-semibold">
        {error && <span className="text-destructive">Oops! Follow checkpoints in numeric order.</span>}
        {!error && current === lastNumber && path.length !== size * size && (
          <span className="text-destructive">Please cover all cells to complete the path!</span>
        )}
        {lastMoveError && <span className="text-destructive">{lastMoveError}</span>}
      </div>

      {/* Main Grid Board with Exact minderWorld SVG & Div Overlay */}
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border-2 border-slate-900 dark:border-slate-700 bg-card shadow-xl touch-none"
        onMouseUp={() => setDragging(false)}
        onTouchEnd={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        style={{ width: size * cellSize, height: size * cellSize }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 z-0"
          width={size * cellSize}
          height={size * cellSize}
        >
          {/* Inner Grid Lines */}
          {Array.from({ length: size - 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i + 1) * cellSize}
              x2={size * cellSize}
              y2={(i + 1) * cellSize}
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
          ))}
          {Array.from({ length: size - 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * cellSize}
              y1={0}
              x2={(i + 1) * cellSize}
              y2={size * cellSize}
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
          ))}

          {/* User Path Line */}
          {path.slice(1).map((cell, i) => {
            const A = getPoint(path[i]);
            const B = getPoint(cell);
            return (
              <line
                key={`path-${i}`}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={error ? "#ef4444" : "#ff7a00"}
                strokeWidth={cellSize * 0.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Maze Wall Barriers */}
          {Array.from(walls).map((w, i) => {
            const [c1, c2] = w.split("|");
            const p1 = getPoint(c1);
            const p2 = getPoint(c2);
            const isVert = p1.y === p2.y;

            const wx1 = isVert ? (p1.x + p2.x) / 2 : p1.x - cellSize / 2;
            const wy1 = isVert ? p1.y - cellSize / 2 : (p1.y + p2.y) / 2;
            const wx2 = isVert ? (p1.x + p2.x) / 2 : p1.x + cellSize / 2;
            const wy2 = isVert ? p1.y + cellSize / 2 : (p1.y + p2.y) / 2;

            return (
              <line
                key={`wall-${i}`}
                x1={wx1}
                y1={wy1}
                x2={wx2}
                y2={wy2}
                stroke="#0f172a"
                strokeWidth="5.5"
                strokeLinecap="square"
              />
            );
          })}

          {/* Hint Overlay */}
          {hint &&
            (() => {
              const A = getPoint(hint.from);
              const B = getPoint(hint.to);
              return (
                <g>
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={B.x}
                    y2={B.y}
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray="6 6"
                    className="animate-pulse"
                  />
                  <circle cx={B.x} cy={B.y} r="7" fill="#f59e0b" />
                </g>
              );
            })()}
        </svg>

        {/* Interactive Cells */}
        <div
          className="relative z-10 grid"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
        >
          {Array.from({ length: size * size }).map((_, i) => {
            const r = Math.floor(i / size);
            const c = i % size;
            const key = `${r}-${c}`;
            const num = numbers[key];
            const isPath = path.includes(key);

            return (
              <div
                key={key}
                data-key={key}
                onMouseDown={() => {
                  setDragging(true);
                  move(key, { allowRewind: true });
                }}
                onMouseEnter={() => {
                  if (dragging) move(key, { allowRewind: false });
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setDragging(true);
                  move(key, { allowRewind: true });
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const el = document.elementFromPoint(touch.clientX, touch.clientY);
                  const targetKey = el?.getAttribute("data-key");
                  if (targetKey) move(targetKey, { allowRewind: false });
                }}
                style={{ width: cellSize, height: cellSize }}
                className="flex cursor-pointer items-center justify-center select-none"
              >
                {typeof num === "number" && (
                  <div
                    className="flex select-none items-center justify-center rounded-full font-black shadow-xs transition-all"
                    style={{
                      width: cellSize * 0.65,
                      height: cellSize * 0.65,
                      fontSize: cellSize * 0.35,
                      backgroundColor: isPath
                        ? error
                          ? "#ef4444"
                          : "#ff7a00"
                        : "#f1f5f9",
                      color: isPath ? "#ffffff" : "#1e293b",
                    }}
                  >
                    {num}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Footer */}
      <div className="mt-3 text-center text-xs font-semibold text-muted-foreground">
        Path length: <span className="text-foreground">{path.length}</span> / {size * size}
      </div>

      {/* Rules Modal */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        rules={GAME_RULES.zip}
      />

      {/* Win Completion Modal */}
      <GameWinModal
        isOpen={win}
        score={100}
        time={formatted}
        message="Phenomenal! You successfully traversed the complete Zip grid in flawless order!"
        onContinue={handleContinue}
      />
    </div>
  );
}
