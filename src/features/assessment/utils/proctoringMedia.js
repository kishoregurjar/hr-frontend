/**
 * Proctoring Media Stream Management Utility
 * Safely tracks and terminates all browser webcam/audio hardware streams.
 */

let activeGlobalStream = null;

export const registerActiveMediaStream = (stream) => {
  if (activeGlobalStream && activeGlobalStream !== stream) {
    try {
      activeGlobalStream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
    } catch {}
  }
  activeGlobalStream = stream;
  if (typeof window !== "undefined") {
    window.__hirequest_active_camera_stream = stream;
  }
};

export const stopActiveMediaStream = () => {
  // 1. Terminate module-scoped stream
  if (activeGlobalStream) {
    try {
      activeGlobalStream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
    } catch {}
    activeGlobalStream = null;
  }

  // 2. Terminate window-scoped stream
  if (typeof window !== "undefined") {
    if (window.__hirequest_active_camera_stream) {
      try {
        window.__hirequest_active_camera_stream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
      } catch {}
      window.__hirequest_active_camera_stream = null;
    }

    // 3. Scan DOM for any remaining video elements holding a MediaStream
    try {
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.srcObject && typeof video.srcObject.getTracks === "function") {
          video.srcObject.getTracks().forEach((track) => {
            track.enabled = false;
            track.stop();
          });
          video.srcObject = null;
        }
      });
    } catch {}
  }
};

