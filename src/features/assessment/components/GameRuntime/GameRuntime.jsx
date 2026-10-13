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
  moduleTimeRemaining,
}) => {
  const games =
    Array.isArray(section.games) && section.games.length > 0
      ? section.games
      : [section];

  const getGameKey = (g, idx) =>
    String(g?.slug || g?.id || g?.code || (typeof idx === "number" ? `game-${idx + 1}` : "game-0")).toLowerCase();

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
    const rawSlug = String(g.slug || g.code || g.id || "").toLowerCase();
    const canonSlug = rawSlug.includes("zip") || rawSlug.includes("path")
      ? "zip"
      : rawSlug.includes("tango")
      ? "tango"
      : rawSlug.includes("sudoku")
      ? "sudoku"
      : rawSlug.includes("mahjong")
      ? "mahjong"
      : rawSlug;

    return (
      attempt?.gameResults?.[g.id] ||
      attempt?.gameResults?.[g.slug] ||
      attempt?.gameResults?.[canonSlug] ||
      attempt?.gameResults?.[g.gameId] ||
      attempt?.gameResults?.[g.code] ||
      (typeof idx === "number" ? attempt?.gameResults?.[`game-${idx + 1}`] : null) ||
      sessionResults[g.id] ||
      sessionResults[g.slug] ||
      sessionResults[canonSlug] ||
      sessionResults[g.gameId] ||
      sessionResults[g.code] ||
      (typeof idx === "number" ? sessionResults[`game-${idx + 1}`] : null) ||
      (games.length === 1 ? attempt?.gameResults?.[section.id] || sessionResults[section.id] : null) ||
      null
    );
  };

  const getStoredGameStatuses = () => {
    if (typeof window !== "undefined" && attempt?.id) {
      try {
        const stored = sessionStorage.getItem(`candidate_game_statuses_${attempt.id}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {};
  };

  const [startedGameKeys, setStartedGameKeys] = useState(() => {
    const statuses = getStoredGameStatuses();
    return new Set(
      Object.keys(statuses).filter((k) => statuses[k] === GAME_STATE.PLAYING)
    );
  });

  const isGameStarted = (g, idx) => {
    if (!g) return false;
    const gKey = getGameKey(g, idx);
    const rawSlug = String(g.slug || g.code || g.id || "").toLowerCase();
    return (
      startedGameKeys.has(gKey) ||
      startedGameKeys.has(rawSlug) ||
      (typeof idx === "number" && startedGameKeys.has(`game-${idx + 1}`))
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

  useEffect(() => {
    setCompletedResult(existingResult ?? null);
  }, [activeGameIndex, existingResult]);

  const gameState = existingResult
    ? GAME_STATE.COMPLETED
    : isGameStarted(currentGame, activeGameIndex)
    ? GAME_STATE.PLAYING
    : GAME_STATE.READY;

  // ── Module-Level Pooled Countdown State ──
  // Shared across ALL games in Module 1 (e.g. 40 Mins total)
  const moduleDurationSec = (section.durationMinutes || 40) * 60;

  const getCalculatedRemaining = () => {
    if (typeof moduleTimeRemaining === "number") {
      return Math.max(0, moduleTimeRemaining);
    }
    if (attempt?.startedAt) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
      return Math.max(0, moduleDurationSec - elapsed);
    }
    return moduleDurationSec;
  };

  const [moduleTimeLeft, setModuleTimeLeft] = useState(getCalculatedRemaining);

  useEffect(() => {
    if (typeof moduleTimeRemaining === "number") {
      setModuleTimeLeft(Math.max(0, moduleTimeRemaining));
    }
  }, [moduleTimeRemaining]);

  // Per-game duration and timer tracking
  const gameDurationSec = (currentGame.durationMinutes || currentGame.duration || 10) * 60;
  const [gameTimeRemaining, setGameTimeRemaining] = useState(gameDurationSec);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const dur = (currentGame.durationMinutes || currentGame.duration || 10) * 60;
    setGameTimeRemaining(dur);
  }, [activeGameIndex, currentGame]);

  const saveGameResult = useSaveGameResult();

  // Handle Game Start: Begins active gameplay; does NOT reset the pooled module timer!
  const handleStart = () => {
    const isThisGameCompleted = Boolean(
      getGameResult(currentGame, activeGameIndex) ||
      (completedResult && (
        completedResult.gameId === currentGame.id ||
        completedResult.slug === currentGame.slug ||
        completedResult.gameIndex === activeGameIndex
      ))
    );

    if (isThisGameCompleted) {
      toast.warning("This game challenge has already been completed and locked.");
      return;
    }
    setGameTimeRemaining(gameDurationSec);

    const gKey = getGameKey(currentGame, activeGameIndex);
    const rawSlug = String(currentGame.slug || currentGame.code || currentGame.id || "").toLowerCase();
    const idxKey = `game-${activeGameIndex + 1}`;

    setStartedGameKeys((prev) => {
      const next = new Set(prev);
      next.add(gKey);
      next.add(rawSlug);
      next.add(idxKey);
      return next;
    });

    if (typeof window !== "undefined" && attempt?.id) {
      try {
        const statuses = getStoredGameStatuses();
        statuses[gKey] = GAME_STATE.PLAYING;
        statuses[rawSlug] = GAME_STATE.PLAYING;
        statuses[idxKey] = GAME_STATE.PLAYING;
        sessionStorage.setItem(`candidate_game_statuses_${attempt.id}`, JSON.stringify(statuses));
      } catch {}
    }
  };

  // Continuous Module Timer sync effect
  useEffect(() => {
    if (typeof moduleTimeRemaining === "number") {
      setModuleTimeLeft(Math.max(0, moduleTimeRemaining));
      if (moduleTimeRemaining <= 0) {
        handleTimeExpired();
      }
      return;
    }

    const timer = setInterval(() => {
      setModuleTimeLeft((prev) => {
        const nextVal = getCalculatedRemaining();
        if (nextVal <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        onTimeTick?.(nextVal);
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt?.startedAt, section.durationMinutes, moduleTimeRemaining]);

  // Timeout handler when the pooled module duration (40 mins) expires
  const handleTimeExpired = () => {
    toast.warning("Cognitive Games module time has completed! Transitioning to Technical Quiz.");
    if (gameState === GAME_STATE.PLAYING) {
      const timeoutResult = {
        score: 30, // Partial baseline score for attempted moves
        rawScore: 30,
        accuracy: 30,
        moves: 0,
        timeTaken: 60,
        timedOut: true,
        status: "TIMED_OUT",
        completedAt: new Date().toISOString(),
      };
      handleGameComplete(timeoutResult, currentGame, activeGameIndex);
    }
    onComplete?.();
  };

  const handleGameComplete = (result, targetGame = currentGame, targetIdx = activeGameIndex) => {
    if (getGameResult(targetGame, targetIdx)) {
      toast.info("This game challenge has already been completed.");
      return;
    }

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const rawSlug = String(targetGame.slug || targetGame.code || targetGame.id || "").toLowerCase();
    const canonicalKey = rawSlug.includes("zip") || rawSlug.includes("path")
      ? "zip"
      : rawSlug.includes("tango")
      ? "tango"
      : rawSlug.includes("sudoku")
      ? "sudoku"
      : rawSlug.includes("mahjong")
      ? "mahjong"
      : rawSlug;

    const gKey = getGameKey(targetGame, targetIdx);
    const saveKey = targetGame.id || targetGame.slug || section.id;
    const timeSpent = Math.max(0, gameDurationSec - gameTimeRemaining);
    const completedGameIdx = targetIdx;
    const finalResult = {
      ...result,
      gameId: targetGame.id,
      slug: canonicalKey,
      gameIndex: completedGameIdx,
      timeTaken: result.timeTaken || timeSpent || result.timeSpent || 60,
      timeSpent: timeSpent || result.timeSpent || result.timeTaken || 60,
    };

    // Remove finished game from active/started tracking
    setStartedGameKeys((prev) => {
      const next = new Set(prev);
      next.delete(gKey);
      next.delete(rawSlug);
      next.delete(`game-${targetIdx + 1}`);
      return next;
    });

    // 1. Instant Optimistic UI: Immediately show the completed screen without network lag
    setCompletedResult(finalResult);

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
          existing[`game-${targetIdx + 1}`] = finalResult;
          sessionStorage.setItem(key, JSON.stringify(existing));
        });

        if (attemptId) {
          const statuses = JSON.parse(sessionStorage.getItem(`candidate_game_statuses_${attemptId}`) || "{}");
          delete statuses[gKey];
          delete statuses[rawSlug];
          delete statuses[`game-${targetIdx + 1}`];
          sessionStorage.setItem(`candidate_game_statuses_${attemptId}`, JSON.stringify(statuses));
        }
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
            updatedAttempt?.gameResults?.[canonicalKey] ||
            updatedAttempt?.gameResults?.[targetGame.slug] ||
            finalResult;

          // Crucial fix: Only set completedResult if candidate is still viewing this completed game
          setActiveGameIndex((currentIdx) => {
            if (currentIdx === completedGameIdx) {
              setCompletedResult(res);
            }
            return currentIdx;
          });
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

    handleGameComplete(skippedResult, currentGame, activeGameIndex);
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
      } else {
        const anyIncompleteIdx = games.findIndex((g, i) => !getGameResult(g, i));
        if (anyIncompleteIdx !== -1) {
          const nextGame = games[anyIncompleteIdx];
          const nextExisting = getGameResult(nextGame, anyIncompleteIdx);
          setActiveGameIndex(anyIncompleteIdx);
          setCompletedResult(nextExisting ?? null);
          const nextDuration = (nextGame.durationMinutes || nextGame.duration || 10) * 60;
          setGameTimeRemaining(nextDuration);
        } else {
          onComplete?.();
        }
      }
    } else {
      const anyIncompleteIdx = games.findIndex((g, i) => !getGameResult(g, i));
      if (anyIncompleteIdx !== -1) {
        const nextGame = games[anyIncompleteIdx];
        const nextExisting = getGameResult(nextGame, anyIncompleteIdx);
        setActiveGameIndex(anyIncompleteIdx);
        setCompletedResult(nextExisting ?? null);
        const nextDuration = (nextGame.durationMinutes || nextGame.duration || 10) * 60;
        setGameTimeRemaining(nextDuration);
      } else {
        onComplete?.();
      }
    }
  };

  // Format MM:SS for countdown timer
  const effectiveSeconds = typeof moduleTimeRemaining === "number" ? Math.max(0, moduleTimeRemaining) : moduleTimeLeft;
  const isLowTime = effectiveSeconds <= 5 * 60; // Critical when < 5 mins left in module

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

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

      {/* ── Active Gameplay Stage (Top bar + dispatchers for all started games) ── */}
      <div className={gameState === GAME_STATE.PLAYING ? "space-y-3" : "hidden"}>
        {/* Active Game Top Bar with Shared Module Countdown Clock */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-100/70 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Game {activeGameIndex + 1} of {games.length}: <strong className="text-slate-900">{currentGame.title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Module Countdown Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-black tracking-wider transition-all ${
                isLowTime
                  ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse shadow-xs"
                  : "bg-white border-slate-200 text-blue-700 shadow-2xs"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(effectiveSeconds)} Module Time</span>
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

        {/* Dispatcher Container: Keeps all started games mounted, displays active one */}
        {games.map((g, idx) => {
          const isStarted = isGameStarted(g, idx);
          const isCompleted = Boolean(getGameResult(g, idx));
          if (!isStarted || isCompleted) return null;

          const isCurrent = idx === activeGameIndex;

          return (
            <div
              key={g.id || g.slug || `game-${idx}`}
              className={isCurrent ? "block" : "hidden"}
            >
              <GameDispatcher
                section={g}
                onComplete={(result) => handleGameComplete(result, g, idx)}
              />
            </div>
          );
        })}
      </div>

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
