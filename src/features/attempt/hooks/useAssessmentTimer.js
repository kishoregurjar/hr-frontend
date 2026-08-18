"use client";

import { useEffect, useState } from "react";
import { getRemainingTime } from "../utils";

const useAssessmentTimer = ({ startedAt, durationMinutes, enabled = true }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingTime({ startedAt, durationMinutes })
  );

  useEffect(() => {
    if (!enabled || !startedAt || !durationMinutes) {
      return;
    }

    const updateTime = () => {
      setRemainingSeconds(
        getRemainingTime({ startedAt, durationMinutes })
      );
    };

    updateTime();

    const intervalId = window.setInterval(updateTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt, durationMinutes, enabled]);

  return {
    remainingSeconds,
    isExpired: remainingSeconds <= 0,
  };
};

export default useAssessmentTimer;
