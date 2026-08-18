import PatternMemoryGame from "../games/PatternMemoryGame";
import MemoryMatchGame from "../games/MemoryMatchGame";
import MazeEscapeGame from "../games/MazeEscapeGame";

const GameDispatcher = ({ section, onComplete }) => {
  const rawType = String(section.gameType ?? section.gameId ?? "pattern-memory").toLowerCase();

  if (
    rawType.includes("memory-match") ||
    rawType.includes("memory_match") ||
    rawType === "1" ||
    rawType.includes("memory match")
  ) {
    return <MemoryMatchGame config={section.config} onComplete={onComplete} />;
  }

  if (
    rawType.includes("maze-escape") ||
    rawType.includes("maze_escape") ||
    rawType === "3" ||
    rawType.includes("maze escape")
  ) {
    return <MazeEscapeGame config={section.config} onComplete={onComplete} />;
  }

  if (
    rawType.includes("pattern") ||
    rawType === "2" ||
    rawType.includes("pattern-memory")
  ) {
    return <PatternMemoryGame config={section.config} onComplete={onComplete} />;
  }

  return (
    <div className="rounded-xl border p-8 text-center">
      <h2 className="text-xl font-semibold">Game unavailable</h2>
      <p className="mt-2 text-muted-foreground">
        This game type ({section.gameType || section.gameId}) is not supported yet.
      </p>
    </div>
  );
};

export default GameDispatcher;

