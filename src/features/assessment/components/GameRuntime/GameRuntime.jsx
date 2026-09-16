"use client";

import { useState } from "react";

import GameReady from "./GameReady";
import GameDispatcher from "./GameDispatcher";
import GameCompleted from "./GameCompleted";

import { GAME_STATE } from "../../constants";
import { useSaveGameResult } from "../../hooks";

const GameRuntime = ({ section, attempt, onComplete }) => {
  const existingResult = attempt?.gameResults?.[section.id];
  const [currentSection, setCurrentSection] = useState(section);

  const [completedResult, setCompletedResult] = useState(
    existingResult ?? null
  );

  const [gameState, setGameState] = useState(
    existingResult ? GAME_STATE.COMPLETED : GAME_STATE.READY
  );

  const saveGameResult = useSaveGameResult();

  const handleStart = (selectedSlug) => {
    if (selectedSlug && selectedSlug !== currentSection.slug) {
      setCurrentSection((prev) => ({
        ...prev,
        slug: selectedSlug,
        gameId: selectedSlug,
        gameType: selectedSlug,
      }));
    }
    setGameState(GAME_STATE.PLAYING);
  };

  const handleGameComplete = (result) => {
    saveGameResult.mutate(
      {
        attemptId: attempt.id,
        sectionId: currentSection.id,
        result,
      },
      {
        onSuccess: (updatedAttempt) => {
          setCompletedResult(
            updatedAttempt?.gameResults?.[currentSection.id] ?? result
          );
          setGameState(GAME_STATE.COMPLETED);
        },
      }
    );
  };

  if (gameState === GAME_STATE.READY) {
    return <GameReady section={currentSection} onStart={handleStart} />;
  }

  if (gameState === GAME_STATE.PLAYING) {
    return (
      <GameDispatcher section={currentSection} onComplete={handleGameComplete} />
    );
  }

  return (
    <GameCompleted
      section={section}
      result={completedResult ?? existingResult}
      isSaving={saveGameResult.isPending}
      error={saveGameResult.error}
      onContinue={onComplete}
    />
  );
};

export default GameRuntime;
