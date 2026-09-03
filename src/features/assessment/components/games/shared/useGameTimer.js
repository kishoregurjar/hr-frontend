"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export const useGameTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  const formatted = `${minutes > 0 ? `${minutes}:` : ""}${seconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;

  return {
    time,
    minutes,
    seconds,
    milliseconds,
    formatted,
    startTimer,
    stopTimer,
    resetTimer,
  };
};

export default useGameTimer;
