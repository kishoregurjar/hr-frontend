"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Gamepad2, Lock, SkipForward, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import GameReady from "./GameReady";
import GameDispatcher from "./GameDispatcher";
import GameCompleted from "./GameCompleted";

import { GAME_STATE } from "../../constants";
import { useSaveGameResult } from "../../hooks";

const DEFAULT_GAME_TIME_SECONDS = 10 * 60; // 10 Minutes per game

const GameRuntime = ({ section, attempt, onComplete, onTimeTick }) => {
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

  // 10-Minute Game Countdown State
  const gameDurationSec = (currentGame.durationMinutes || currentGame.duration || 10) * 60;
  const [gameTimeRemaining, setGameTimeRemaining] = useState(gameDurationSec);
  const timerIntervalRef = useRef(null);

  const saveGameResult = useSaveGameResult();

  // Handle Game Start
  const handleStart = () => {
    setGameTimeRemaining(gameDurationSec);
    setGameState(GAME_STATE.PLAYING);
  };

  // Game Countdown Timer effect
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING) {
      timerIntervalRef.current = setInterval(() => {
        setGameTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleTimeExpired();
            return 0;
          }
          const nextVal = prev - 1;
          onTimeTick?.(nextVal);
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState, activeGameIndex]);

  // Timeout handler when 10 minutes expire
  const handleTimeExpired = () => {
    toast.warning(`Time's up for ${currentGame.title}! Auto-saving your challenge result.`);
    const timeoutResult = {
      score: 30, // Partial baseline score for attempted moves
      rawScore: 30,
      accuracy: 30,
      moves: 0,
      timeTaken: gameDurationSec,
      timedOut: true,
      status: "TIMED_OUT",
      completedAt: new Date().toISOString(),
    };
    handleGameComplete(timeoutResult);
  };

  const handleGameComplete = (result) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const saveKey = currentGame.id || currentGame.slug || section.id;
    const timeSpent = gameDurationSec - gameTimeRemaining;
    const finalResult = {
      ...result,
      timeTaken: result.timeTaken || timeSpent || 60,
    };
    
    saveGameResult.mutate(
      {
        attemptId: attempt.id,
        sectionId: saveKey,
        result: finalResult,
      },
      {
        onSuccess: (updatedAttempt) => {
          const res =
            updatedAttempt?.gameResults?.[saveKey] ||
            updatedAttempt?.gameResults?.[currentGame.slug] ||
            finalResult;

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

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

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
      const nextDuration = (nextGame.durationMinutes || nextGame.duration || 10) * 60;
      setGameTimeRemaining(nextDuration);
      setGameState(nextExisting ? GAME_STATE.COMPLETED : GAME_STATE.READY);
    } else {
      onComplete?.();
    }
  };

  // Format MM:SS for countdown timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isLowTime = gameTimeRemaining <= 60;

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
              Sequential Round Lock (10 Min Each)
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
        <div className="space-y-3">
          {/* Active Game Top Bar with 10-Minute Countdown Clock */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-100/70 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Round {activeGameIndex + 1}: <strong className="text-slate-900">{currentGame.title}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Challenge Countdown Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-black tracking-wider transition-all ${
                  isLowTime
                    ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse shadow-xs"
                    : "bg-white border-slate-200 text-blue-700 shadow-2xs"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(gameTimeRemaining)} Left</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSkipGame}
                className="h-7 px-2.5 text-xs font-bold text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg gap-1 cursor-pointer border-slate-200"
              >
                <SkipForward className="h-3 w-3 text-slate-400" />
                Skip
              </Button>
            </div>
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

