"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axiosClient from "@/lib/api/axiosClient";
import { toast } from "sonner";

export default function useProctoring({
  attemptId = null,
  token = null,
  candidateAccessToken = null,
  isActive = false,
  enableFullscreen = true,
}) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastEventRef = useRef({ type: null, time: 0 });
  const pendingEventsQueueRef = useRef([]);
  const isFlushingRef = useRef(false);

  // Send lightweight event to backend
  const sendProctoringEvent = useCallback(
    async (type, metadata = {}) => {
      if (!type) return;

      const now = Date.now();
      // Spam protection: drop identical event type fired within 1.5 seconds
      if (
        lastEventRef.current.type === type &&
        now - lastEventRef.current.time < 1500
      ) {
        return;
      }
      lastEventRef.current = { type, time: now };

      const eventPayload = {
        type,
        attemptId: attemptId || undefined,
        candidateAssessmentId: attemptId || undefined,
        token: token || undefined,
        invitationToken: token || undefined,
        clientAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          visibilityState:
            typeof document !== "undefined" ? document.visibilityState : "unknown",
          hasFocus: typeof document !== "undefined" ? document.hasFocus() : true,
          screenResolution:
            typeof window !== "undefined"
              ? `${window.screen.width}x${window.screen.height}`
              : "unknown",
        },
      };

      try {
        const headers = {};
        const authToken =
          candidateAccessToken ||
          (typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem("candidate_access_token") ||
              sessionStorage.getItem("candidate_session_token")
            : null);

        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }
        if (token) {
          headers["x-candidate-token"] = token;
          headers["x-invitation-token"] = token;
        }

        const endpoint = attemptId
          ? `/attempts/${attemptId}/proctoring-events`
          : "/attempts/proctoring-events";

        await axiosClient.post(endpoint, eventPayload, { headers });
      } catch (err) {
        // Non-blocking fail-safe: proctoring API failures should never crash or interrupt test
        console.warn("[useProctoring] Notice: Event delivery notice:", err?.message || err);
      }
    },
    [attemptId, token, candidateAccessToken]
  );

  // Request fullscreen utility
  const enterFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return false;
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      sendProctoringEvent("FULLSCREEN_ENTER", { method: "user_triggered" });
      return true;
    } catch (err) {
      console.warn("[useProctoring] Fullscreen request not allowed by browser:", err?.message);
      return false;
    }
  }, [sendProctoringEvent]);

  // Tab switch & visibility monitoring
  useEffect(() => {
    if (!isActive || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => prev + 1);
        toast.warning("Tab Switch Detected", {
          description: "Please stay on the assessment tab. Proctoring log recorded.",
          duration: 4000,
        });
        sendProctoringEvent("TAB_SWITCH", {
          visibilityState: "hidden",
          timestamp: new Date().toISOString(),
        });
      }
    };

    let blurTimeout = null;
    const handleWindowBlur = () => {
      // Debounce window blur to prevent false positives from brief system popups
      blurTimeout = setTimeout(() => {
        if (document.visibilityState === "visible" && !document.hasFocus()) {
          sendProctoringEvent("WINDOW_BLUR", {
            reason: "window_focus_lost",
            timestamp: new Date().toISOString(),
          });
        }
      }, 400);
    };

    const handleWindowFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isActive, sendProctoringEvent]);

  // Fullscreen change monitoring
  useEffect(() => {
    if (!isActive || !enableFullscreen || typeof document === "undefined") return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen) {
        toast.warning("Exited Fullscreen Mode", {
          description: "Click fullscreen icon or re-enter to continue secure compliance.",
          duration: 4000,
        });
        sendProctoringEvent("FULLSCREEN_EXIT", {
          timestamp: new Date().toISOString(),
        });
      } else {
        sendProctoringEvent("FULLSCREEN_ENTER", {
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [isActive, enableFullscreen, sendProctoringEvent]);

  return {
    sendProctoringEvent,
    tabSwitchCount,
    isFullscreen,
    enterFullscreen,
  };
}

