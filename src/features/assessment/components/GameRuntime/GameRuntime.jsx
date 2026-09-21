"use client";

import { useState } from "react";
import { CheckCircle2, Gamepad2, Lock, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleStart = () => {
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

  const handleSkipGame = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to skip this challenge? You will receive 0 marks for this game and proceed to the next challenge."
    );
    if (!isConfirmed) return;

    const skippedResult = {
      score: 0,
      rawScore: 0,
      accuracy: 0,
      moves: 0,
      timeTaken: 0,
      skipped: true,
      status: "SKIPPED",
      completedAt: new Date().toISOString(),
    };

    handleGameComplete(skippedResult);
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

  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-hidden">
      {/* ── Sub-Games Navigation Strip (Strict Sequential Stepper) ── */}
      {games.length > 1 && (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-2 shadow-2xs font-sans mb-1 shrink-0">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5 mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                Cognitive Challenges ({activeGameIndex + 1} of {games.length})
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sequential Round Lock
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {games.map((game, idx) => {
              const res = attempt?.gameResults?.[game.id] || attempt?.gameResults?.[game.slug];
              const isFinished = Boolean(res || (idx === activeGameIndex && completedResult));
              const isSkipped = Boolean(res?.skipped || (idx === activeGameIndex && completedResult?.skipped));
              const isActive = idx === activeGameIndex;

              return (
                <div
                  key={game.id || game.slug || idx}
                  className={`flex items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-lg border text-xs font-bold transition-all select-none ${
                    isActive
                      ? "bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs ring-1 ring-blue-300/60"
                      : isFinished
                      ? isSkipped
                        ? "bg-amber-50/50 border-amber-300/80 text-amber-800"
                        : "bg-emerald-50/50 border-emerald-300/80 text-emerald-800"
                      : "bg-slate-100/50 border-slate-200/60 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-black ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isFinished
                          ? isSkipped
                            ? "bg-amber-600 text-white"
                            : "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate text-[11px]">{game.title || `Game ${idx + 1}`}</span>
                  </div>
                  {isFinished ? (
                    isSkipped ? (
                      <span className="text-[9px] font-extrabold text-amber-600 uppercase">Skip</span>
                    ) : (
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                    )
                  ) : isActive ? (
                    <span className="flex items-center gap-1 text-[8px] font-black text-blue-700 bg-blue-100/90 px-1 py-0.2 rounded uppercase shrink-0">
                      <span className="h-1 w-1 rounded-full bg-blue-600 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <Lock className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                  )}
                </div>
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
          onSkip={handleSkipGame}
        />
      )}

      {gameState === GAME_STATE.PLAYING && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500">
              Round {activeGameIndex + 1}: <strong className="text-slate-800">{currentGame.title}</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSkipGame}
              className="h-8 px-3 text-xs font-bold text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg gap-1.5 cursor-pointer border-slate-200"
            >
              <SkipForward className="h-3.5 w-3.5 text-slate-400" />
              Skip Game
            </Button>
          </div>
          <GameDispatcher section={currentGame} onComplete={handleGameComplete} />
        </div>
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
