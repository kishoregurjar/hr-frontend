"use client";

import { useEffect, useRef, useState } from "react";
import { INTEGRITY_EVENT } from "../constants";

const useAssessmentIntegrity = ({ attemptId, enabled = true, onEvent }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);

  const enabledRef = useRef(enabled);
  const onEventRef = useRef(onEvent);
  const wasFullscreenRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // 1. Tab visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!enabledRef.current || !attemptId) {
        return;
      }

      if (document.visibilityState === "hidden") {
        onEventRef.current?.({
          attemptId,
          type: INTEGRITY_EVENT.TAB_HIDDEN,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptId]);

  // 2. Window blur tracking
  useEffect(() => {
    const handleWindowBlur = () => {
      if (!enabledRef.current || !attemptId) {
        return;
      }

      onEventRef.current?.({
        attemptId,
        type: INTEGRITY_EVENT.WINDOW_BLUR,
      });
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [attemptId]);

  // 3. Fullscreen state & exit tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!enabledRef.current || !attemptId) {
        return;
      }

      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);

      if (active) {
        setHasEnteredFullscreen(true);
        wasFullscreenRef.current = true;
        onEventRef.current?.({
          attemptId,
          type: INTEGRITY_EVENT.FULLSCREEN_ENTERED,
        });
        return;
      }

      if (wasFullscreenRef.current) {
        wasFullscreenRef.current = false;
        onEventRef.current?.({
          attemptId,
          type: INTEGRITY_EVENT.FULLSCREEN_EXIT,
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [attemptId]);

  return {
    isFullscreen,
    hasEnteredFullscreen,
  };
};

export default useAssessmentIntegrity;
