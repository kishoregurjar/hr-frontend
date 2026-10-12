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

const GameRuntime = ({
  section,
  attempt,
  onComplete,
  onTimeTick,
  onActiveGameChange,
  activeGameIndex: externalGameIndex,
}) => {
  const games =
    Array.isArray(section.games) && section.games.length > 0
      ? section.games
      : [section];

  const getGameResult = (g, idx) => {
    if (!g) return null;
    let sessionResults = {};
    if (typeof window !== "undefined") {
      try {
        sessionResults = JSON.parse(
          sessionStorage.getItem(`candidate_game_results_${attempt?.id}`) ||
          sessionStorage.getItem("candidate_game_results") ||
          "{}"
        );
      } catch {}
    }
    return (
      attempt?.gameResults?.[g.id] ||
      attempt?.gameResults?.[g.slug] ||
      attempt?.gameResults?.[g.gameId] ||
      attempt?.gameResults?.[g.code] ||
      (typeof idx === "number" ? attempt?.gameResults?.[`game-${idx + 1}`] : null) ||
      sessionResults[g.id] ||
      sessionResults[g.slug] ||
      sessionResults[g.gameId] ||
      sessionResults[g.code] ||
      (typeof idx === "number" ? sessionResults[`game-${idx + 1}`] : null) ||
      (games.length === 1 ? attempt?.gameResults?.[section.id] || sessionResults[section.id] : null) ||
      null
    );
  };

  // Find first incomplete game index or start at 0
  const findInitialIndex = () => {
    const idx = games.findIndex((g, i) => !getGameResult(g, i));
    return idx !== -1 ? idx : 0;
  };

  const [activeGameIndex, setActiveGameIndex] = useState(
    typeof externalGameIndex === "number" ? externalGameIndex : findInitialIndex
  );

  useEffect(() => {
    if (typeof externalGameIndex === "number" && externalGameIndex !== activeGameIndex) {
      const targetGame = games[externalGameIndex];
      const targetRes = getGameResult(targetGame, externalGameIndex);
      if (targetRes) {
        const firstIncompleteIdx = games.findIndex((g, i) => !getGameResult(g, i));
        if (firstIncompleteIdx !== -1 && firstIncompleteIdx !== externalGameIndex) {
          setActiveGameIndex(firstIncompleteIdx);
          return;
        }
      }
      setActiveGameIndex(externalGameIndex);
    }
  }, [externalGameIndex]);

  const currentGame = games[activeGameIndex] || games[0];

  useEffect(() => {
    onActiveGameChange?.(activeGameIndex);
  }, [activeGameIndex, onActiveGameChange]);

  const existingResult = getGameResult(currentGame, activeGameIndex);

  const [completedResult, setCompletedResult] = useState(existingResult ?? null);

  const [gameState, setGameState] = useState(
    existingResult ? GAME_STATE.COMPLETED : GAME_STATE.READY
  );

  useEffect(() => {
    if (existingResult) {
      setCompletedResult(existingResult);
      setGameState(GAME_STATE.COMPLETED);
    } else {
      setCompletedResult(null);
      setGameState(GAME_STATE.READY);
    }
  }, [activeGameIndex, existingResult]);

  // 10-Minute Game Countdown State
  const gameDurationSec = (currentGame.durationMinutes || currentGame.duration || 10) * 60;
  const [gameTimeRemaining, setGameTimeRemaining] = useState(gameDurationSec);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const dur = (currentGame.durationMinutes || currentGame.duration || 10) * 60;
    setGameTimeRemaining(dur);
  }, [activeGameIndex, currentGame]);

  const saveGameResult = useSaveGameResult();

  // Handle Game Start
  const handleStart = () => {
    if (existingResult || completedResult) {
      toast.warning("This game challenge has already been completed and locked.");
      return;
    }
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
    if (existingResult) {
      toast.info("This game challenge has already been completed.");
      return;
    }

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const rawSlug = String(currentGame.slug || currentGame.code || currentGame.id || "").toLowerCase();
    const canonicalKey = rawSlug.includes("zip") || rawSlug.includes("path")
      ? "zip"
      : rawSlug.includes("tango")
      ? "tango"
      : rawSlug.includes("sudoku")
      ? "sudoku"
      : rawSlug.includes("mahjong")
      ? "mahjong"
      : rawSlug;

    const saveKey = currentGame.id || currentGame.slug || section.id;
    const timeSpent = Math.max(0, gameDurationSec - gameTimeRemaining);
    const finalResult = {
      ...result,
      gameId: currentGame.id,
      slug: canonicalKey,
      timeTaken: result.timeTaken || timeSpent || result.timeSpent || 60,
      timeSpent: timeSpent || result.timeSpent || result.timeTaken || 60,
    };
    
    // 1. Instant Optimistic UI: Immediately show the completed screen without network lag
    setCompletedResult(finalResult);
    setGameState(GAME_STATE.COMPLETED);

    // 2. Client-side Real-Time Session Storage (Fail-safe persistence)
    if (typeof window !== "undefined") {
      try {
        const attemptId = attempt?.id;
        const candidateAttemptId = sessionStorage.getItem("candidate_attempt_id");
        const storeKeys = [
          attemptId ? `candidate_game_results_${attemptId}` : null,
          candidateAttemptId ? `candidate_game_results_${candidateAttemptId}` : null,
          "candidate_game_results",
        ].filter(Boolean);

        storeKeys.forEach((key) => {
          const existing = JSON.parse(sessionStorage.getItem(key) || "{}");
          existing[saveKey] = finalResult;
          existing[canonicalKey] = finalResult;
          existing[`game-${activeGameIndex + 1}`] = finalResult;
          sessionStorage.setItem(key, JSON.stringify(existing));
        });
      } catch (err) {
        console.warn("[GameRuntime] Session storage persistence notice:", err);
      }
    }

    // 3. Background Auto-Save: Silently synchronize result with backend database
    saveGameResult.mutate(
      {
        attemptId: attempt?.id,
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
        },
        onError: (err) => {
          console.warn("[GameRuntime] Background sync warning:", err?.message);
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
      timeSpent: 0,
      skipped: true,
      status: "SKIPPED",
      completedAt: new Date().toISOString(),
    };

    handleGameComplete(skippedResult);
  };

  const handleNextGame = () => {
    if (activeGameIndex < games.length - 1) {
      const nextIdx = games.findIndex((g, i) => i > activeGameIndex && !getGameResult(g, i));
      if (nextIdx !== -1) {
        const nextGame = games[nextIdx];
        const nextExisting = getGameResult(nextGame, nextIdx);
        setActiveGameIndex(nextIdx);
        setCompletedResult(nextExisting ?? null);
        const nextDuration = (nextGame.durationMinutes || nextGame.duration || 10) * 60;
        setGameTimeRemaining(nextDuration);
        setGameState(nextExisting ? GAME_STATE.COMPLETED : GAME_STATE.READY);
      } else {
        const anyIncompleteIdx = games.findIndex((g, i) => !getGameResult(g, i));
        if (anyIncompleteIdx !== -1) {
          const nextGame = games[anyIncompleteIdx];
          const nextExisting = getGameResult(nextGame, anyIncompleteIdx);
          setActiveGameIndex(anyIncompleteIdx);
          setCompletedResult(nextExisting ?? null);
          const nextDuration = (nextGame.durationMinutes || nextGame.duration || 10) * 60;
          setGameTimeRemaining(nextDuration);
          setGameState(nextExisting ? GAME_STATE.COMPLETED : GAME_STATE.READY);
        } else {
          onComplete?.();
        }
      }
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
                Round {activeGameIndex + 1} of {games.length}: <strong className="text-slate-900">{currentGame.title}</strong>
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
