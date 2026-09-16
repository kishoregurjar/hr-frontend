"use client";

import { useState } from "react";
import { CheckCircle2, Gamepad2 } from "lucide-react";

import GameReady from "./GameReady";
import GameDispatcher from "./GameDispatcher";
import GameCompleted from "./GameCompleted";

import { GAME_STATE } from "../../constants";
import { useSaveGameResult } from "../../hooks";

const GameRuntime = ({ section, attempt, onComplete }) => {
  const games =
    Array.isArray(section.games) && section.games.length > 0
      ? section.games
      : [section];

  // Find first incomplete game index or start at 0
  const findInitialIndex = () => {
    const idx = games.findIndex((g) => {
      const res =
        attempt?.gameResults?.[g.id] ||
        attempt?.gameResults?.[g.slug];
      return !res;
    });
    return idx !== -1 ? idx : 0;
  };

  const [activeGameIndex, setActiveGameIndex] = useState(findInitialIndex);
  const currentGame = games[activeGameIndex] || games[0];

  const existingResult =
    attempt?.gameResults?.[currentGame.id] ||
    attempt?.gameResults?.[currentGame.slug] ||
    (games.length === 1 ? attempt?.gameResults?.[section.id] : null);

  const [completedResult, setCompletedResult] = useState(existingResult ?? null);

  const [gameState, setGameState] = useState(
    existingResult ? GAME_STATE.COMPLETED : GAME_STATE.READY
  );

  const saveGameResult = useSaveGameResult();

  const handleStart = (selectedSlug) => {
    setGameState(GAME_STATE.PLAYING);
  };

  const handleGameComplete = (result) => {
    const saveKey = currentGame.id || currentGame.slug || section.id;
    
    saveGameResult.mutate(
      {
        attemptId: attempt.id,
        sectionId: saveKey,
        result,
      },
      {
        onSuccess: (updatedAttempt) => {
          const res =
            updatedAttempt?.gameResults?.[saveKey] ||
            updatedAttempt?.gameResults?.[currentGame.slug] ||
            result;

          setCompletedResult(res);
          setGameState(GAME_STATE.COMPLETED);
        },
      }
    );
  };

  const handleNextGame = () => {
    if (activeGameIndex < games.length - 1) {
      const nextIdx = activeGameIndex + 1;
      const nextGame = games[nextIdx];
      const nextExisting =
        attempt?.gameResults?.[nextGame.id] ||
        attempt?.gameResults?.[nextGame.slug];

      setActiveGameIndex(nextIdx);
      setCompletedResult(nextExisting ?? null);
      setGameState(nextExisting ? GAME_STATE.COMPLETED : GAME_STATE.READY);
    } else {
      onComplete?.();
    }
  };

  const handleSelectGame = (idx) => {
    if (idx === activeGameIndex) return;
    const targetGame = games[idx];
    const targetResult =
      attempt?.gameResults?.[targetGame.id] ||
      attempt?.gameResults?.[targetGame.slug];

    setActiveGameIndex(idx);
    setCompletedResult(targetResult ?? null);
    setGameState(targetResult ? GAME_STATE.COMPLETED : GAME_STATE.READY);
  };

  return (
    <div className="space-y-6">
      {/* ── Sub-Games Navigation Strip (when multiple games in Module 1) ── */}
      {games.length > 1 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5 px-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                Cognitive Challenges ({activeGameIndex + 1} of {games.length})
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Module 1 Sequence
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {games.map((game, idx) => {
              const isFinished = Boolean(
                attempt?.gameResults?.[game.id] ||
                attempt?.gameResults?.[game.slug] ||
                (idx === activeGameIndex && completedResult)
              );
              const isActive = idx === activeGameIndex;

              return (
                <button
                  key={game.id || game.slug || idx}
                  type="button"
                  onClick={() => handleSelectGame(idx)}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-left border transition-all text-xs font-bold cursor-pointer ${
                    isActive
                      ? "bg-blue-50/80 border-blue-300 text-blue-800 shadow-2xs"
                      : isFinished
                      ? "bg-emerald-50/40 border-emerald-200/80 text-emerald-800 hover:bg-emerald-50"
                      : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white border text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span className="truncate">{game.title || `Game ${idx + 1}`}</span>
                  </div>
                  {isFinished && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Active Game Stage ── */}
      {gameState === GAME_STATE.READY && (
        <GameReady
          section={currentGame}
          gameIndex={activeGameIndex}
          totalGames={games.length}
          onStart={handleStart}
        />
      )}

      {gameState === GAME_STATE.PLAYING && (
        <GameDispatcher section={currentGame} onComplete={handleGameComplete} />
      )}

      {gameState === GAME_STATE.COMPLETED && (
        <GameCompleted
          section={section}
          currentGame={currentGame}
          gameIndex={activeGameIndex}
          totalGames={games.length}
          nextGame={activeGameIndex < games.length - 1 ? games[activeGameIndex + 1] : null}
          isLastGame={activeGameIndex === games.length - 1}
          result={completedResult ?? existingResult}
          isSaving={saveGameResult.isPending}
          error={saveGameResult.error}
          onNextGame={handleNextGame}
          onContinue={onComplete}
        />
      )}
    </div>
  );
};

export default GameRuntime;
