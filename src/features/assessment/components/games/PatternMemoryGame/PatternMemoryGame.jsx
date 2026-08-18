"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy } from "lucide-react";

const ROUNDS_DATA = [
  {
    round: 1,
    pattern: [7, 2, 9],
    options: [
      [7, 2, 9],
      [2, 7, 9],
      [9, 2, 7],
    ],
  },
  {
    round: 2,
    pattern: [4, 8, 1, 5],
    options: [
      [4, 8, 1, 5],
      [8, 4, 5, 1],
      [4, 1, 8, 5],
    ],
  },
  {
    round: 3,
    pattern: [3, 9, 6, 2, 8],
    options: [
      [3, 9, 6, 2, 8],
      [3, 6, 9, 8, 2],
      [9, 3, 6, 2, 8],
    ],
  },
];

const PatternMemoryGame = ({ onComplete }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState("memorize"); // "memorize" | "answer" | "complete"
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const roundData = ROUNDS_DATA[currentRound];

  // Memorize timer countdown
  useEffect(() => {
    if (phase !== "memorize") return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase("answer");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentRound]);

  const handleAnswer = (selectedPattern) => {
    const isCorrect = selectedPattern.join("-") === roundData.pattern.join("-");
    const roundScore = isCorrect ? 33.33 : 0;
    const newScore = Math.round(score + roundScore);
    const newCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;

    setScore(newScore);
    setCorrectAnswers(newCorrect);

    if (currentRound + 1 < ROUNDS_DATA.length) {
      setCurrentRound((r) => r + 1);
      setPhase("memorize");
    } else {
      setPhase("complete");
      const finalScore = Math.min(100, Math.round((newCorrect / ROUNDS_DATA.length) * 100));
      onComplete?.({
        rawScore: finalScore,
        normalizedScore: finalScore,
        score: finalScore,
        accuracy: finalScore,
        roundsCompleted: ROUNDS_DATA.length,
      });
    }
  };

  if (phase === "complete") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Pattern Challenge Complete!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Score: <span className="font-semibold text-foreground">{score}%</span> ({correctAnswers}/{ROUNDS_DATA.length} Rounds Correct)
        </p>
      </div>
    );
  }

  if (phase === "memorize") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Round {currentRound + 1} of {ROUNDS_DATA.length}
          </span>
          <span className="text-xs text-muted-foreground">Hiding in {countdown}s...</span>
        </div>

        <p className="text-sm font-medium text-muted-foreground">
          Memorize this sequence
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {roundData.pattern.map((number, index) => (
            <div
              key={index}
              className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/10 text-2xl font-bold text-primary shadow-sm"
            >
              {number}
            </div>
          ))}
        </div>

        <Button className="mt-8 w-full" onClick={() => setPhase("answer")}>
          Ready / Hide Now
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Round {currentRound + 1} of {ROUNDS_DATA.length}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Pattern Memory
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold">Which pattern did you see?</h2>
        <p className="mt-1 text-xs text-muted-foreground">Select the exact sequence</p>
      </div>

      <div className="mt-6 space-y-3">
        {roundData.options.map((option, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            className="w-full py-5 text-lg tracking-widest font-mono hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => handleAnswer(option)}
          >
            {option.join("  ")}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PatternMemoryGame;

