"use client";

import { useEffect } from "react";

const useAttemptAutosave = ({
  attempt,
  responses,
  currentItemIndex,
  onSave,
  delay = 1200,
  enabled = true,
}) => {
  useEffect(() => {
    if (!enabled || !attempt?.id) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSave({
        attemptId: attempt.id,
        responses,
        currentItemIndex,
      });
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [attempt?.id, responses, currentItemIndex, delay, enabled, onSave]);
};

export default useAttemptAutosave;
