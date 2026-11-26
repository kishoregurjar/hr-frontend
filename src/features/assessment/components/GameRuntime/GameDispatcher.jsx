import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const GameLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[420px] w-full gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <span className="text-xs font-semibold text-slate-500 tracking-wide">
      Loading cognitive challenge...
    </span>
  </div>
);

// Lazy load individual game components on demand (prevents loading all 8 games at once)
const ZipGame = dynamic(() => import("../games/ZipGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const TangoGame = dynamic(() => import("../games/TangoGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const SudokuGame = dynamic(() => import("../games/SudokuGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const MahjongGame = dynamic(() => import("../games/MahjongGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const NQueensGame = dynamic(() => import("../games/NQueensGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const MemoryMatchGame = dynamic(() => import("../games/MemoryMatchGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const MazeEscapeGame = dynamic(() => import("../games/MazeEscapeGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});
const PatternMemoryGame = dynamic(() => import("../games/PatternMemoryGame"), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});

const GameDispatcher = ({ section, onComplete }) => {
  const rawType = String(
    section.slug ??
    section.gameSlug ??
    section.gameType ??
    section.gameId ??
    section.id ??
    section.title ??
    "zip"
  ).toLowerCase();

  // 1. Zip Pathfinder
  if (rawType.includes("zip")) {
    return <ZipGame config={section.config || section.gameData} onComplete={onComplete} />;
  }

  // 2. Tango Spatial Deduction
  if (rawType.includes("tango")) {
    return <TangoGame config={section.config || section.gameData} onComplete={onComplete} />;
  }

  // 3. Mini Sudoku
  if (rawType.includes("sudoku")) {
    return <SudokuGame config={section.config || section.gameData} onComplete={onComplete} />;
  }

  // 4. Mahjong Tile Match
  if (rawType.includes("mahjong")) {
    return <MahjongGame config={section.config || section.gameData} onComplete={onComplete} />;
  }

  // 5. N-Queens Spatial Deduction
  if (rawType.includes("queen")) {
    return <NQueensGame config={section.config || section.gameData} onComplete={onComplete} />;
  }

  // Legacy fallback games
  if (
    rawType.includes("memory-match") ||
    rawType.includes("memory_match") ||
    rawType === "1" ||
    rawType.includes("card_match")
  ) {
    return <MemoryMatchGame config={section.config} onComplete={onComplete} />;
  }

  if (
    rawType.includes("maze-escape") ||
    rawType.includes("maze_escape") ||
    rawType.includes("maze_runner") ||
    rawType === "3"
  ) {
    return <MazeEscapeGame config={section.config} onComplete={onComplete} />;
  }

  if (
    rawType.includes("pattern") ||
    rawType === "2" ||
    rawType.includes("pattern-memory") ||
    rawType.includes("visual-logic")
  ) {
    return <PatternMemoryGame config={section.config} onComplete={onComplete} />;
  }

  // 8. Fail-safe fallback engine
  return <MahjongGame config={section.config || section.gameData} onComplete={onComplete} />;
};

export default GameDispatcher;
