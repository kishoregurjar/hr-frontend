"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

// Suppress internal C++/WASM "INFO: Created TensorFlow Lite..." messages from popping Next.js dev overlay
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const firstArg = args[0] ? String(args[0]) : "";
    if (
      firstArg.includes("Created TensorFlow Lite") ||
      firstArg.includes("XNNPACK delegate") ||
      firstArg.includes("INFO: Created") ||
      firstArg.includes("GL_INVALID_ENUM")
    ) {
      // Suppress WASM internal info messages
      return;
    }
    return originalConsoleError.apply(console, args);
  };
}

/**
 * Client-Side Face & Head Pose Proctoring Tracker
 * Uses Google MediaPipe Face Landmarker via WASM / WebGL.
 * Runs 100% locally in browser without video streaming.
 * Highly responsive & instant reaction (< 200ms).
 */
export default function useFaceTracker({
  videoRef,
  isActive = false,
  onViolation = null,
  checkIntervalMs = 150, // Runs ~6-7 times per second (instant real-time detection)
}) {
  const [trackerStatus, setTrackerStatus] = useState("INITIALIZING"); // INITIALIZING | READY | ERROR
  const [currentWarning, setCurrentWarning] = useState(null);
  const [warningCount, setWarningCount] = useState(0);

  const landmarkerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const intervalIdRef = useRef(null);
  const lastVideoTimestampRef = useRef(0);

  // Instant response counters
  const violationDurationRef = useRef({
    noFaceMs: 0,
    multipleFacesMs: 0,
    lookingAwayMs: 0,
  });

  const lastAlertTimestampRef = useRef({
    noFace: 0,
    multipleFaces: 0,
    lookingAway: 0,
  });

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      if (typeof window === "undefined") return;

      try {
        setTrackerStatus("INITIALIZING");
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        if (!isMounted) return;

        // Try local WASM first, fallback to CDN
        let filesetResolver;
        try {
          filesetResolver = await FilesetResolver.forVisionTasks("/wasm");
        } catch (_wasmErr) {
          filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );
        }

        if (!isMounted) return;

        // Create landmarker with GPU delegate first, fallback to CPU
        let landmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "/models/face_landmarker.task",
              delegate: "GPU",
            },
            outputFaceBlendshapes: false,
            runningMode: "VIDEO",
            numFaces: 2,
          });
        } catch (_gpuErr) {
          landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "/models/face_landmarker.task",
              delegate: "CPU",
            },
            outputFaceBlendshapes: false,
            runningMode: "VIDEO",
            numFaces: 2,
          });
        }

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setTrackerStatus("READY");
        }
      } catch (err) {
        console.warn("[useFaceTracker] MediaPipe init notice:", err?.message || err);
        if (isMounted) {
          setTrackerStatus("ERROR");
        }
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {}
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Frame processing loop (Instant Reaction)
  const processFrame = useCallback(() => {
    const landmarker = landmarkerRef.current;
    const video = videoRef?.current;

    if (!landmarker || !video || !isActive || isProcessingRef.current) {
      return;
    }

    // Ensure video element has rendered actual frames with valid dimensions
    if (
      video.readyState < 2 ||
      video.paused ||
      video.ended ||
      !video.videoWidth ||
      !video.videoHeight ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // Timestamp must be strictly monotonically increasing
      let now = performance.now();
      if (now <= lastVideoTimestampRef.current) {
        now = lastVideoTimestampRef.current + 1;
      }
      lastVideoTimestampRef.current = now;

      const results = landmarker.detectForVideo(video, now);
      const faceCount = results.faceLandmarks ? results.faceLandmarks.length : 0;
      const nowTs = Date.now();

      // ── CASE 1: NO FACE DETECTED ─────────────────────────────
      if (faceCount === 0) {
        violationDurationRef.current.noFaceMs += checkIntervalMs;
        violationDurationRef.current.multipleFacesMs = 0;
        violationDurationRef.current.lookingAwayMs = 0;

        // Instant response (>= 300ms)
        if (violationDurationRef.current.noFaceMs >= 300) {
          setCurrentWarning("Face not detected. Please stay in front of camera.");

          if (nowTs - lastAlertTimestampRef.current.noFace > 3500) {
            lastAlertTimestampRef.current.noFace = nowTs;
            setWarningCount((c) => c + 1);
            toast.error("Proctoring Alert: Face Not Visible", {
              description: "Please stay seated in front of your camera. Proctoring log recorded.",
              duration: 3500,
            });
            onViolation?.("FACE_NOT_DETECTED", {
              reason: "candidate_absent_or_hidden",
              timestamp: new Date().toISOString(),
            });
          }
        }
        isProcessingRef.current = false;
        return;
      }

      // ── CASE 2: MULTIPLE FACES DETECTED ─────────────────────
      if (faceCount > 1) {
        violationDurationRef.current.multipleFacesMs += checkIntervalMs;
        violationDurationRef.current.noFaceMs = 0;
        violationDurationRef.current.lookingAwayMs = 0;

        // Instant response (>= 300ms)
        if (violationDurationRef.current.multipleFacesMs >= 300) {
          setCurrentWarning("Multiple faces detected! Only candidate is allowed.");

          if (nowTs - lastAlertTimestampRef.current.multipleFaces > 3500) {
            lastAlertTimestampRef.current.multipleFaces = nowTs;
            setWarningCount((c) => c + 1);
            toast.error("Proctoring Alert: Multiple Faces", {
              description: "Only candidate is permitted in the assessment room.",
              duration: 3500,
            });
            onViolation?.("MULTIPLE_FACES_DETECTED", {
              detectedFaceCount: faceCount,
              timestamp: new Date().toISOString(),
            });
          }
        }
        isProcessingRef.current = false;
        return;
      }

      // ── CASE 3: SINGLE CANDIDATE FACE - HEAD POSE & GAZE ───
      violationDurationRef.current.noFaceMs = 0;
      violationDurationRef.current.multipleFacesMs = 0;

      const landmarks = results.faceLandmarks[0];
      if (landmarks && landmarks.length > 263) {
        const nose = landmarks[1];
        const rightEye = landmarks[33];
        const leftEye = landmarks[263];
        const forehead = landmarks[10];
        const chin = landmarks[152];

        // Horizontal Yaw: distance between nose and midpoint of eyes
        const eyeMidX = (leftEye.x + rightEye.x) / 2;
        const eyeSpan = Math.abs(leftEye.x - rightEye.x);
        const yawRatio = eyeSpan > 0 ? (nose.x - eyeMidX) / eyeSpan : 0;

        // Vertical Pitch: distance of nose relative to face height
        const faceHeight = Math.abs(chin.y - forehead.y);
        const noseToChin = Math.abs(chin.y - nose.y);
        const pitchRatio = faceHeight > 0 ? noseToChin / faceHeight : 0.4;

        // Sharp Responsive Thresholds:
        // Normal gaze: yawRatio ~ -0.15 to +0.15
        // Looking Right: yawRatio > 0.22
        // Looking Left: yawRatio < -0.22
        // Looking Down at desk/phone: pitchRatio < 0.27
        // Looking Up at ceiling: pitchRatio > 0.52
        const isLookingLeft = yawRatio < -0.22;
        const isLookingRight = yawRatio > 0.22;
        const isLookingDown = pitchRatio < 0.27;
        const isLookingUp = pitchRatio > 0.52;

        if (isLookingLeft || isLookingRight || isLookingDown || isLookingUp) {
          violationDurationRef.current.lookingAwayMs += checkIntervalMs;

          // Instant trigger (>= 150ms)
          if (violationDurationRef.current.lookingAwayMs >= 150) {
            const direction = isLookingLeft
              ? "left"
              : isLookingRight
              ? "right"
              : isLookingDown
              ? "down"
              : "up";

            setCurrentWarning(
              isLookingDown
                ? "Looking down detected. Please keep eyes on screen."
                : isLookingUp
                ? "Looking up detected. Please keep eyes on screen."
                : `Looking ${direction} detected. Please face the screen.`
            );

            if (nowTs - lastAlertTimestampRef.current.lookingAway > 3000) {
              lastAlertTimestampRef.current.lookingAway = nowTs;
              setWarningCount((c) => c + 1);
              toast.warning("Proctoring Alert: Looking Away", {
                description: `Candidate is looking away from the screen (${direction}). Recorded in proctoring audit.`,
                duration: 3000,
              });
              onViolation?.("LOOKING_AWAY", {
                direction,
                yawRatio: Number(yawRatio.toFixed(3)),
                pitchRatio: Number(pitchRatio.toFixed(3)),
                timestamp: new Date().toISOString(),
              });
            }
          }
        } else {
          // Normal: looking straight at screen
          violationDurationRef.current.lookingAwayMs = 0;
          setCurrentWarning(null);
        }
      }
    } catch (_detectErr) {
      // Non-blocking fail-safe
    } finally {
      isProcessingRef.current = false;
    }
  }, [isActive, onViolation, checkIntervalMs, videoRef]);

  // Periodic frame analyzer running at 150ms for instant reaction
  useEffect(() => {
    if (!isActive || trackerStatus !== "READY") {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      return;
    }

    intervalIdRef.current = setInterval(processFrame, checkIntervalMs);

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [isActive, trackerStatus, processFrame, checkIntervalMs]);

  return {
    trackerStatus, // "INITIALIZING" | "READY" | "ERROR"
    currentWarning,
    warningCount,
  };
}
