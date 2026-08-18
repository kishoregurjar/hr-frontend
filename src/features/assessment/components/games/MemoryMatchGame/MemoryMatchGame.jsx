"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Brain } from "lucide-react";

const CARD_SYMBOLS = ["🚀", "⚡️", "💡", "🎯", "🎨", "🧩"];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MemoryMatchGame = ({ onComplete }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Initialize deck
  useEffect(() => {
    const deck = shuffleArray([...CARD_SYMBOLS, ...CARD_SYMBOLS]).map((symbol, idx) => ({
      id: idx,
      symbol,
    }));
    setCards(deck);
    setStartTime(Date.now());
  }, []);

  const handleCardClick = (index) => {
    if (
      isChecking ||
      flippedIndexes.includes(index) ||
      matchedIndexes.includes(index) ||
      isFinished
    ) {
      return;
    }

    const newFlipped = [...flippedIndexes, index];
    setFlippedIndexes(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // Match found
        const updatedMatched = [...matchedIndexes, firstIdx, secondIdx];
        setMatchedIndexes(updatedMatched);
        setFlippedIndexes([]);
        setIsChecking(false);

        // Check win condition
        if (updatedMatched.length === cards.length) {
          handleWin(moves + 1);
        }
      } else {
        // Not a match - flip back after 800ms
        setTimeout(() => {
          setFlippedIndexes([]);
          setIsChecking(false);
        }, 800);
      }
    }
  };

  const handleWin = (finalMoves) => {
    setIsFinished(true);
    const durationSeconds = Math.max(1, Math.round((Date.now() - (startTime || Date.now())) / 1000));
    
    // Optimal moves is 6 (6 pairs). Score penalizes extra moves.
    const optimalMoves = 6;
    const extraMoves = Math.max(0, finalMoves - optimalMoves);
    const rawScore = Math.max(40, 100 - extraMoves * 8);

    onComplete?.({
      rawScore,
      normalizedScore: rawScore,
      score: rawScore,
      accuracy: Math.round((optimalMoves / finalMoves) * 100),
      timeTaken: durationSeconds,
      moves: finalMoves,
    });
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Brain className="h-5 w-5 text-primary" />
            Memory Match
          </h2>
          <p className="text-xs text-muted-foreground">Find all matching pairs</p>
        </div>

        <div className="flex gap-4 text-sm font-semibold">
          <div className="rounded-lg bg-muted px-3 py-1.5 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Moves</span>
            <span className="text-primary">{moves}</span>
          </div>
          <div className="rounded-lg bg-muted px-3 py-1.5 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Pairs</span>
            <span className="text-emerald-600">{matchedIndexes.length / 2} / 6</span>
          </div>
        </div>
      </div>

      {/* Finished State */}
      {isFinished ? (
        <div className="py-8 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Memory Challenge Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You cleared all pairs in <span className="font-semibold text-foreground">{moves} moves</span>.
            </p>
          </div>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card, index) => {
            const isFlipped = flippedIndexes.includes(index) || matchedIndexes.includes(index);
            const isMatched = matchedIndexes.includes(index);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(index)}
                disabled={isMatched || isChecking}
                className={`relative flex aspect-square items-center justify-center rounded-xl border text-3xl font-bold transition-all duration-300 transform select-none ${
                  isMatched
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 scale-95 cursor-default"
                    : isFlipped
                    ? "border-primary bg-primary/10 text-primary scale-105 shadow-md"
                    : "border-border bg-muted/60 hover:bg-muted hover:border-primary/50"
                }`}
              >
                {isFlipped ? card.symbol : "❓"}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
