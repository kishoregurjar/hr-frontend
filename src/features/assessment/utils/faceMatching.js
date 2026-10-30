/**
 * Face Identity Verification & Impersonation Detection Utility
 * Powered by @vladmandic/face-api (128-D Neural Face Descriptors via ResNet-34)
 * with geometric landmark fallback.
 * Runs 100% locally in the browser with zero external API calls or server costs.
 */

// Singleton instance cache
let faceApiPromise = null;
let modelsLoaded = false;
let modelLoadingPromise = null;

/**
 * Dynamically import face-api client-side to prevent SSR Node errors
 */
export async function getFaceApi() {
  if (typeof window === "undefined") return null;
  if (!faceApiPromise) {
    faceApiPromise = import("@vladmandic/face-api");
  }
  return faceApiPromise;
}

/**
 * Pre-load face recognition models from /models/face-api
 */
export async function loadFaceApiModels() {
  if (modelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      const faceapi = await getFaceApi();
      if (!faceapi) return false;

      const MODEL_URL = "/models/face-api";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      return true;
    } catch (err) {
      console.warn("[faceMatching] loadFaceApiModels notice:", err?.message || err);
      return false;
    }
  })();

  return modelLoadingPromise;
}

/**
 * Extract 128-dimensional Neural Face Descriptor from video, image, or canvas
 * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement} input
 * @returns {Promise<Array<number>|null>} 128-D descriptor array or null
 */
export async function extractFaceDescriptor(input) {
  if (!input) return null;

  try {
    const faceapi = await getFaceApi();
    if (!faceapi) return null;

    const ready = await loadFaceApiModels();
    if (!ready) return null;

    // Use TinyFaceDetector (lightweight, runs in real-time on GPU/WebGL)
    const detection = await faceapi
      .detectSingleFace(
        input,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.50 })
      )
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detection || !detection.descriptor) {
      return null;
    }

    return Array.from(detection.descriptor);
  } catch (err) {
    console.warn("[faceMatching] extractFaceDescriptor error:", err?.message || err);
    return null;
  }
}

/**
 * Compare two 128-dimensional Face Descriptors using Euclidean distance
 * @param {Array<number>} baselineDescriptor
 * @param {Array<number>} liveDescriptor
 * @returns {{ isMatch: boolean, similarity: number, distance: number }}
 */
export function compareFaceDescriptors(baselineDescriptor, liveDescriptor) {
  if (
    !Array.isArray(baselineDescriptor) ||
    !Array.isArray(liveDescriptor) ||
    baselineDescriptor.length !== 128 ||
    liveDescriptor.length !== 128
  ) {
    return { isMatch: false, similarity: 0, distance: 1.0 };
  }

  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = baselineDescriptor[i] - liveDescriptor[i];
    sum += diff * diff;
  }
  const distance = Math.sqrt(sum);

  // Benchmarks:
  // Same Person: distance 0.12 - 0.38 -> Similarity: 75% - 95%
  // Different Person: distance 0.65 - 1.25+ -> Similarity: < 35%
  const similarityScore = Math.max(
    0,
    Math.min(100, Math.round((1 - Math.min(distance / 0.85, 1.0)) * 100))
  );

  // Industry Standard Match Threshold for 128D face descriptor: distance < 0.48
  const isMatch = distance < 0.48;

  return {
    isMatch,
    similarity: similarityScore,
    distance: Number(distance.toFixed(3)),
  };
}

// ── MediaPipe Geometric Landmark Utilities (Preserved for Fallback) ──
const LANDMARKS = {
  NOSE_TIP: 1,
  FOREHEAD: 10,
  CHIN: 152,
  RIGHT_EYE_OUTER: 33,
  RIGHT_EYE_INNER: 133,
  LEFT_EYE_INNER: 362,
  LEFT_EYE_OUTER: 263,
  RIGHT_CHEEK: 234,
  LEFT_CHEEK: 454,
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  UPPER_LIP: 0,
  LOWER_LIP: 17,
  NOSE_BRIDGE: 168,
  LEFT_JAW: 172,
  RIGHT_JAW: 397,
  RIGHT_EYEBROW_OUTER: 70,
  LEFT_EYEBROW_OUTER: 300,
};

const dist3D = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export function extractFaceFeatures(landmarks) {
  if (!landmarks || landmarks.length < 400) {
    return null;
  }

  const rightEyeOuter = landmarks[LANDMARKS.RIGHT_EYE_OUTER];
  const leftEyeOuter = landmarks[LANDMARKS.LEFT_EYE_OUTER];

  const eyeSpan = dist3D(rightEyeOuter, leftEyeOuter);
  if (eyeSpan <= 0.001) {
    return null;
  }

  const rightEyeInner = landmarks[LANDMARKS.RIGHT_EYE_INNER];
  const leftEyeInner = landmarks[LANDMARKS.LEFT_EYE_INNER];
  const noseTip = landmarks[LANDMARKS.NOSE_TIP];
  const noseBridge = landmarks[LANDMARKS.NOSE_BRIDGE];
  const chin = landmarks[LANDMARKS.CHIN];
  const forehead = landmarks[LANDMARKS.FOREHEAD];
  const rightCheek = landmarks[LANDMARKS.RIGHT_CHEEK];
  const leftCheek = landmarks[LANDMARKS.LEFT_CHEEK];
  const rightJaw = landmarks[LANDMARKS.RIGHT_JAW];
  const leftJaw = landmarks[LANDMARKS.LEFT_JAW];
  const rightEyebrowOuter = landmarks[LANDMARKS.RIGHT_EYEBROW_OUTER];
  const leftEyebrowOuter = landmarks[LANDMARKS.LEFT_EYEBROW_OUTER];

  const cheekSpan = Math.max(dist3D(rightCheek, leftCheek), 0.001);
  const jawSpan = Math.max(dist3D(rightJaw, leftJaw), 0.001);
  const faceHeight = Math.max(dist3D(forehead, chin), 0.001);
  const noseHeight = Math.max(dist3D(noseBridge, noseTip), 0.001);
  const foreheadToNose = Math.max(dist3D(forehead, noseTip), 0.001);
  const browSpan = Math.max(dist3D(rightEyebrowOuter, leftEyebrowOuter), 0.001);

  return [
    dist3D(rightEyeInner, leftEyeInner) / eyeSpan,
    browSpan / eyeSpan,
    dist3D(rightEyebrowOuter, rightEyeOuter) / eyeSpan,
    dist3D(leftEyebrowOuter, leftEyeOuter) / eyeSpan,
    noseHeight / eyeSpan,
    foreheadToNose / eyeSpan,
    faceHeight / eyeSpan,
    foreheadToNose / faceHeight,
    noseHeight / faceHeight,
    cheekSpan / eyeSpan,
    jawSpan / eyeSpan,
    faceHeight / cheekSpan,
    jawSpan / cheekSpan,
    dist3D(leftEyeOuter, rightCheek) / eyeSpan,
    dist3D(rightEyeOuter, leftCheek) / eyeSpan,
    dist3D(forehead, rightCheek) / eyeSpan,
    dist3D(forehead, leftCheek) / eyeSpan,
  ];
}

export function compareFaceFeatures(baselineFeatures, currentFeatures) {
  if (!Array.isArray(baselineFeatures) || !Array.isArray(currentFeatures)) {
    return { isMatch: false, similarity: 0, distance: 1.0 };
  }

  const length = Math.min(baselineFeatures.length, currentFeatures.length);
  if (length === 0) {
    return { isMatch: false, similarity: 0, distance: 1.0 };
  }

  let totalRelativeDiff = 0;
  for (let i = 0; i < length; i++) {
    const base = baselineFeatures[i];
    const curr = currentFeatures[i];
    const diff = Math.abs(base - curr);
    const denominator = Math.max(Math.abs(base), 0.001);
    totalRelativeDiff += diff / denominator;
  }

  const meanRelativeDiff = totalRelativeDiff / length;
  const similarityScore = Math.max(
    0,
    Math.min(100, Math.round((1 - meanRelativeDiff * 4.8) * 100))
  );

  const isMatch = similarityScore >= 58;

  return {
    isMatch,
    similarity: similarityScore,
    distance: Number(meanRelativeDiff.toFixed(3)),
  };
}

/**
 * Capture a clear base64 snapshot from a live <video> element
 */
export function captureVideoSnapshot(videoElement, maxWidth = 480) {
  if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
    return null;
  }

  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, maxWidth / videoElement.videoWidth);
    canvas.width = Math.round(videoElement.videoWidth * scale);
    canvas.height = Math.round(videoElement.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw frame (mirrored user-facing webcam)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.warn("[faceMatching] Snapshot capture failed:", err);
    return null;
  }
}
