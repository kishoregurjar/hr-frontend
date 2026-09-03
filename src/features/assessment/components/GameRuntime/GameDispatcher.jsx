import PatternMemoryGame from "../games/PatternMemoryGame";
import MemoryMatchGame from "../games/MemoryMatchGame";
import MazeEscapeGame from "../games/MazeEscapeGame";
import ZipGame from "../games/ZipGame";
import TangoGame from "../games/TangoGame";
import SudokuGame from "../games/SudokuGame";
import MahjongGame from "../games/MahjongGame";

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

  return (
    <div className="rounded-xl border p-8 text-center">
      <h2 className="text-xl font-semibold">Game unavailable</h2>
      <p className="mt-2 text-muted-foreground">
        This game type ({section.gameType || section.gameId || section.slug}) is not supported yet.
      </p>
    </div>
  );
};

export default GameDispatcher;
