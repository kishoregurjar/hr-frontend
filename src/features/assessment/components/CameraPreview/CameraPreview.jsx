"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Video,
  VideoOff,
  AlertCircle,
  RefreshCw,
  Minimize2,
  Maximize2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerActiveMediaStream, stopActiveMediaStream } from "../../utils";
import useFaceTracker from "../../hooks/useFaceTracker";

export default function CameraPreview({
  stream: initialStream = null,
  onEvent = null,
  onStreamReady = null,
  className = "",
  docked = false,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(initialStream);
  const [stream, setStream] = useState(initialStream);
  const [cameraStatus, setCameraStatus] = useState(
    initialStream ? "ACTIVE" : "REQUESTING"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // AI Face & Gaze Anti-Cheating Tracker (MediaPipe)
  const { trackerStatus, currentWarning, warningCount } = useFaceTracker({
    videoRef,
    isActive: cameraStatus === "ACTIVE",
    onViolation: onEvent,
    checkIntervalMs: 150,
  });

  // Safely attach stream to video element
  const attachStreamToVideo = useCallback((mediaStream) => {
    if (videoRef.current && mediaStream) {
      try {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((_err) => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      } catch (err) {
        console.warn("[CameraPreview] Error setting srcObject:", err);
      }
    }
  }, []);

  // Initialize or request media stream
  const startCamera = useCallback(async (isRetry = false) => {
    if (streamRef.current && streamRef.current.active) {
      const activeTracks = streamRef.current.getVideoTracks().filter(
        (t) => t.readyState === "live"
      );
      if (activeTracks.length > 0) {
        setCameraStatus("ACTIVE");
        attachStreamToVideo(streamRef.current);
        return streamRef.current;
      }
    }

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setCameraStatus("ERROR");
      setErrorMessage("Camera access is not supported by your browser.");
      onEvent?.("CAMERA_PERMISSION_DENIED", { reason: "unsupported_browser" });
      return null;
    }

    try {
      setCameraStatus("REQUESTING");
      setIsReconnecting(true);
      setErrorMessage("");

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      registerActiveMediaStream(mediaStream);
      setStream(mediaStream);
      setCameraStatus("ACTIVE");
      setIsReconnecting(false);
      attachStreamToVideo(mediaStream);
      onStreamReady?.(mediaStream);

      if (isRetry) {
        onEvent?.("CAMERA_RECONNECTED", { timestamp: new Date().toISOString() });
      } else {
        onEvent?.("CAMERA_STARTED", { timestamp: new Date().toISOString() });
      }

      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const handleTrackEnded = () => {
          setCameraStatus("DISCONNECTED");
          setErrorMessage(
            "Camera disconnected. Please reconnect your camera to continue secure monitoring."
          );
          onEvent?.("CAMERA_DISCONNECTED", {
            timestamp: new Date().toISOString(),
            reason: "hardware_disconnect",
          });
        };
        videoTrack.addEventListener("ended", handleTrackEnded);
      }

      return mediaStream;
    } catch (err) {
      setIsReconnecting(false);
      console.warn("[CameraPreview] getUserMedia error:", err);

      let friendlyMsg = "Camera access error. Please verify device permissions.";
      let eventType = "CAMERA_PERMISSION_DENIED";

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        friendlyMsg =
          "Camera permission was denied. Please allow camera access in your browser settings to continue.";
        eventType = "CAMERA_PERMISSION_DENIED";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        friendlyMsg = "No webcam detected on your device. Please connect a working camera.";
        eventType = "CAMERA_DISCONNECTED";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        friendlyMsg =
          "Camera is currently being used by another application (e.g. Zoom, Meet, Teams). Please close it and retry.";
        eventType = "CAMERA_DISCONNECTED";
      }

      setCameraStatus(eventType === "CAMERA_PERMISSION_DENIED" ? "DENIED" : "ERROR");
      setErrorMessage(friendlyMsg);
      onEvent?.(eventType, {
        errorName: err.name,
        errorMessage: err.message,
        timestamp: new Date().toISOString(),
      });
      return null;
    }
  }, [attachStreamToVideo, onEvent, onStreamReady]);

  // Handle incoming stream prop updates
  useEffect(() => {
    if (initialStream && initialStream !== streamRef.current) {
      streamRef.current = initialStream;
      registerActiveMediaStream(initialStream);
      setStream(initialStream);
      setCameraStatus("ACTIVE");
      attachStreamToVideo(initialStream);
    } else if (!streamRef.current) {
      startCamera(false);
    }
  }, [initialStream, attachStreamToVideo, startCamera]);

  // Clean up all tracks strictly when unmounting
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      stopActiveMediaStream();
    };
  }, []);

  // Shared status overlay component
  const renderStatusOverlay = () => {
    if (cameraStatus === "ACTIVE") return null;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2.5 text-center bg-slate-950/90 z-10">
        {cameraStatus === "REQUESTING" ? (
          <div className="flex flex-col items-center gap-1.5">
            <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />
            <span className="text-[10px] font-bold text-slate-300">
              Connecting Camera...
            </span>
          </div>
        ) : cameraStatus === "DISCONNECTED" ? (
          <div className="flex flex-col items-center gap-1">
            <VideoOff className="h-5 w-5 text-amber-400" />
            <span className="text-[9.5px] font-bold text-amber-200 leading-tight">
              Camera Disconnected
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => startCamera(true)}
              disabled={isReconnecting}
              className="h-6 px-2 text-[9.5px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg mt-1 gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isReconnecting ? "animate-spin" : ""}`} />
              <span>Reconnect</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span className="text-[9px] font-bold text-rose-200 leading-tight">
              Camera Blocked
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => startCamera(true)}
              disabled={isReconnecting}
              className="h-6 px-2 text-[9.5px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg mt-1 gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isReconnecting ? "animate-spin" : ""}`} />
              <span>Retry</span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ── 1. DOCKED VARIANT (Passport Size Frame for Right Sidebar) ──
  if (docked) {
    return (
      <div className={`w-full select-none ${className}`} aria-label="Proctoring Live Camera Feed">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs flex flex-col items-center">
          {/* Top Row: Live Indicator & Proctoring Status */}
          <div className="w-full flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              {cameraStatus === "ACTIVE" ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                    LIVE
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    {cameraStatus}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                  <AlertTriangle size={10} className="text-rose-600" />
                  <span>{warningCount} Warnings</span>
                </span>
              )}
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <Video size={11} className="text-emerald-600" />
                <span>Proctoring Feed</span>
              </div>
            </div>
          </div>

          {/* Centered Passport-Size Video Frame (135px width × 165px height, 3:4 ratio) */}
          <div className={`relative w-[140px] h-[170px] rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-slate-950 shadow-inner mx-auto ${
            currentWarning ? "border-rose-500 ring-2 ring-rose-400/50" : "border-slate-800"
          }`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                cameraStatus === "ACTIVE" ? "opacity-100" : "opacity-0"
              }`}
              style={{ transform: "scaleX(-1)" }}
            />
            {renderStatusOverlay()}
          </div>

          {currentWarning ? (
            <div className="mt-2 px-1 py-1 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center gap-1 text-[9.5px] text-rose-700 font-bold animate-pulse text-center leading-tight">
              <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600" />
              <span>{currentWarning}</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium text-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Candidate Live Monitoring</span>
            </div>
          )}
        </div>

        {/* Disconnect/Error Alert */}
        {errorMessage && cameraStatus !== "ACTIVE" && (
          <div className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-xl text-[10px] text-amber-900 shadow-xs flex items-start gap-1.5 leading-snug">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // ── 2. FLOATING VARIANT (Review Mode / Standalone) ──
  return (
    <div
      className={`fixed top-4 right-4 z-50 select-none transition-all duration-300 ${
        isMinimized ? "w-28 sm:w-32" : "w-40 sm:w-48"
      } ${className}`}
      style={{ filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.18))" }}
      aria-label="Proctoring Live Camera Feed"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800/80 bg-slate-950 text-white shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-1.5">
            {cameraStatus === "ACTIVE" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-300">
                  LIVE
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-300">
                  {cameraStatus}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="text-slate-300 hover:text-white p-0.5 rounded transition-colors"
            title={isMinimized ? "Expand Camera" : "Minimize Camera"}
          >
            {isMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
          </button>
        </div>

        <div className={`relative bg-slate-900 transition-all ${isMinimized ? "h-20" : "h-28 sm:h-36"}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraStatus === "ACTIVE" ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: "scaleX(-1)" }}
          />
          {renderStatusOverlay()}
        </div>

        {!isMinimized && (
          <div className="bg-slate-900/90 px-2.5 py-1 flex items-center justify-between border-t border-slate-800 text-[8.5px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <Video size={10} className="text-emerald-400" />
              <span>Proctoring Feed</span>
            </span>
            <span className="text-[8px] text-slate-400">Secure</span>
          </div>
        )}
      </div>

      {errorMessage && cameraStatus !== "ACTIVE" && (
        <div className="mt-1.5 p-2 bg-amber-950/95 border border-amber-600/50 rounded-xl text-[10px] text-amber-200 shadow-xl backdrop-blur-md flex items-start gap-1.5 leading-snug animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-100">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
