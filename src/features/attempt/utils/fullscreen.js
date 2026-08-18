export const enterFullscreen = async () => {
  if (typeof document === "undefined") return false;

  if (document.fullscreenElement) {
    return true;
  }

  const element = document.documentElement;
  if (!element || !element.requestFullscreen) {
    return false;
  }

  try {
    await element.requestFullscreen();
    return true;
  } catch {
    return false;
  }
};

export const exitFullscreen = async () => {
  if (typeof document === "undefined") return;

  if (!document.fullscreenElement) {
    return;
  }

  if (document.exitFullscreen) {
    try {
      await document.exitFullscreen();
    } catch {
      // Ignore exit errors
    }
  }
};
