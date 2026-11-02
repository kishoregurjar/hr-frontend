"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clock,
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  Gamepad2,
  CheckCircle2,
  RotateCw,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Video,
  Camera,
  X,
  Wifi,
  Monitor,
  Mic,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendCandidateOtp, verifyCandidateOtp } from "@/lib/api/attempts";
import {
  extractFaceFeatures,
  captureVideoSnapshot,
  extractFaceDescriptor,
  loadFaceApiModels,
} from "../../utils/faceMatching";

export default function AssessmentPreStart({
  token = "",
  assessment = {},
  candidate = {},
  isStarting = false,
  onStart,
}) {
  // ── Unified 3-Step Assessment-First Flow ─────────────────────────
  // Step 1: Assessment Details
  // Step 2: Candidate Verification (Triggers OTP Modal)
  // Step 3: Before You Start (Rules + System Check + Identity Photo)
  const [step, setStep] = useState(1);

  // Candidate Data State
  const [candidateName, setCandidateName] = useState(
    candidate?.name || candidate?.fullName || ""
  );
  const [email, setEmail] = useState(
    candidate?.email || candidate?.candidateEmail || ""
  );
  const [mobileNumber, setMobileNumber] = useState(
    candidate?.phone || candidate?.mobileNumber || ""
  );
  const [experience, setExperience] = useState(
    candidate?.experience || "0-1 Years (Entry Level)"
  );
  const [accepted, setAccepted] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [candidateAccessToken, setCandidateAccessToken] = useState("");
  const [devHint, setDevHint] = useState("");
  const otpInputRefs = useRef([]);

  // System Readiness & Identity Verification State
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [prestartCameraActive, setPrestartCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [micDetected, setMicDetected] = useState(true);

  const prestartVideoRef = useRef(null);
  const prestartStreamRef = useRef(null);
  const prestartLandmarkerRef = useRef(null);

  // Sync candidate prop if loaded asynchronously
  useEffect(() => {
    if (candidate?.name && !candidateName) setCandidateName(candidate.name);
    if (candidate?.email && !email) setEmail(candidate.email);
    if (candidate?.phone && !mobileNumber) setMobileNumber(candidate.phone);
  }, [candidate]);

  // Online status monitoring
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Assessment Information Extraction
  const durationMinutes =
    assessment?.durationMinutes ??
    assessment?.duration ??
    assessment?.timeLimit ??
    60;

  const totalQuestions =
    (Array.isArray(assessment?.questions) ? assessment.questions.length : null) ??
    (Array.isArray(assessment?.AssessmentQuestions) ? assessment.AssessmentQuestions.length : null) ??
    (Array.isArray(assessment?.assessmentQuestions) ? assessment.assessmentQuestions.length : null) ??
    (Array.isArray(assessment?.selectedQuestionIds) ? assessment.selectedQuestionIds.length : null) ??
    (Array.isArray(assessment?.questionIds) ? assessment.questionIds.length : null) ??
    assessment?.questionCount ??
    assessment?.totalQuestions ??
    0;

  const totalGames =
    (Array.isArray(assessment?.games) ? assessment.games.length : null) ??
    (Array.isArray(assessment?.selectedGameIds) ? assessment.selectedGameIds.length : null) ??
    (Array.isArray(assessment?.AssessmentGames) ? assessment.AssessmentGames.length : null) ??
    (Array.isArray(assessment?.assessmentGames) ? assessment.assessmentGames.length : null) ??
    (Array.isArray(assessment?.gameIds) ? assessment.gameIds.length : null) ??
    assessment?.gameCount ??
    assessment?.totalGames ??
    0;

  const companyName =
    assessment?.companyName ||
    assessment?.company?.name ||
    assessment?.createdBy?.company?.name ||
    assessment?.createdBy?.companyMembers?.[0]?.company?.name ||
    candidate?.companyName ||
    candidate?.company?.name ||
    "Facebook Company";

  const companyLogo =
    assessment?.companyLogo ||
    assessment?.company?.logoUrl ||
    assessment?.createdBy?.company?.logoUrl ||
    assessment?.createdBy?.companyMembers?.[0]?.company?.logoUrl ||
    candidate?.companyLogo ||
    null;

  const assessmentTitle = assessment?.title || "Assessment Evaluation";
  const assessmentDescription =
    assessment?.description ||
    assessment?.about ||
    "Technical skill, problem-solving, and cognitive aptitude assessment.";

  // Monogram initials for fallback logo
  const monogram =
    companyName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HQ";

  // Parse skill topics cleanly
  const topicsList = assessmentDescription
    .split(/[,•|\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 30)
    .slice(0, 5);

  // ── Handle Send OTP ─────────────────────────────────────────────
  const handleSendOtp = async (targetEmail = email) => {
    const cleanEmail = (targetEmail || "").trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");

    setIsSendingOtp(true);
    setOtpError("");
    try {
      const res = await sendCandidateOtp({
        email: cleanEmail,
        invitationToken: token,
      });

      setCountdown(30);
      setOtpDigits(["", "", "", "", "", ""]);
      if (res?.devOtp) {
        setDevHint(res.devOtp);
      }
      toast.success(res?.message || `Verification code sent to ${cleanEmail}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
      return true;
    } catch (err) {
      toast.error(err?.message || "Failed to send verification code. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Handle OTP Digit Input ──────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newDigits.every((d) => d.length === 1)) {
      triggerVerifyWithDigits(newDigits);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
      triggerVerifyWithDigits(digits);
    }
  };

  const triggerVerifyWithDigits = async (digits) => {
    const fullOtp = digits.join("");
    if (fullOtp.length !== 6) return;

    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      const res = await verifyCandidateOtp({
        email: email.trim(),
        otp: fullOtp,
        invitationToken: token,
      });

      setIsEmailVerified(true);
      const tokenVal =
        res?.candidateAccessToken ||
        res?.candidateSessionToken ||
        res?.sessionToken ||
        res?.token ||
        res?.data?.candidateAccessToken ||
        res?.data?.candidateSessionToken;

      if (tokenVal) {
        setCandidateAccessToken(tokenVal);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("candidateSessionToken", tokenVal);
          sessionStorage.setItem("candidateAccessToken", tokenVal);
          localStorage.setItem("candidateSessionToken", tokenVal);
          localStorage.setItem("candidateAccessToken", tokenVal);
        }
      }
      toast.success("Email verified successfully");
      setIsOtpModalOpen(false);
      setStep(3); // Direct transition to Rules & System Check
    } catch (err) {
      setOtpError(err?.message || "Invalid verification code. Please check and try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ── Candidate Verification Submission (Triggers OTP Modal) ─────
  const handleProceedToOtp = async () => {
    if (!candidateName.trim()) {
      setNameError("Please enter your full name.");
      return;
    }
    setNameError("");

    if (!email.trim() || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");

    if (isEmailVerified) {
      setStep(3);
      return;
    }

    const sent = await handleSendOtp(email);
    if (sent) {
      setIsOtpModalOpen(true);
    }
  };

  // ── Pre-Start Camera Clean-up ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (prestartStreamRef.current) {
        prestartStreamRef.current.getTracks().forEach((t) => t.stop());
        prestartStreamRef.current = null;
      }
      if (prestartLandmarkerRef.current) {
        try {
          prestartLandmarkerRef.current.close();
        } catch {}
        prestartLandmarkerRef.current = null;
      }
    };
  }, []);

  // Ensure stream is continuously attached to prestart video element
  useEffect(() => {
    if (prestartCameraActive && prestartStreamRef.current && prestartVideoRef.current) {
      prestartVideoRef.current.srcObject = prestartStreamRef.current;
      prestartVideoRef.current.play().catch(() => {});
    }
  }, [prestartCameraActive]);

  const handleStartPrestartCamera = async () => {
    setIsCameraStarting(true);
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });

      prestartStreamRef.current = stream;
      setPrestartCameraActive(true);

      if (prestartVideoRef.current) {
        prestartVideoRef.current.srcObject = stream;
        prestartVideoRef.current.play().catch(() => {});
      }

      // Pre-load Neural Face Recognition models in background
      loadFaceApiModels().catch(() => {});

      // Initialize FaceLandmarker fallback
      if (!prestartLandmarkerRef.current) {
        try {
          const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
          let filesetResolver;
          try {
            filesetResolver = await FilesetResolver.forVisionTasks("/wasm");
          } catch {
            filesetResolver = await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
          }
          let landmarker;
          try {
            landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
              baseOptions: {
                modelAssetPath: "/models/face_landmarker.task",
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numFaces: 2,
            });
          } catch {
            landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
              baseOptions: {
                modelAssetPath: "/models/face_landmarker.task",
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numFaces: 2,
            });
          }
          prestartLandmarkerRef.current = landmarker;
        } catch (mErr) {
          console.warn("[AssessmentPreStart] FaceLandmarker notice:", mErr?.message || mErr);
        }
      }
    } catch (cErr) {
      console.warn("[AssessmentPreStart] Camera start error:", cErr);
      setCameraError("Camera access denied or unavailable. Please allow camera permissions.");
      toast.error("Camera access denied. Please allow permissions in your browser.");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const handleCaptureVerificationPhoto = async () => {
    const video = prestartVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Camera is initializing. Please wait a moment.");
      return;
    }

    setIsCapturingPhoto(true);

    try {
      const photoDataUrl = captureVideoSnapshot(video, 480);
      if (!photoDataUrl) {
        toast.error("Failed to capture image snapshot. Please try again.");
        setIsCapturingPhoto(false);
        return;
      }

      // 1. Extract 128-D Neural Face Descriptor (@vladmandic/face-api)
      let descriptor = null;
      try {
        descriptor = await extractFaceDescriptor(video);
      } catch (dErr) {
        console.warn("[AssessmentPreStart] Face descriptor extraction notice:", dErr);
      }

      // 2. Extract geometric fallback landmarks (MediaPipe)
      let features = null;
      try {
        if (prestartLandmarkerRef.current) {
          const results = prestartLandmarkerRef.current.detectForVideo(video, performance.now());
          const faces = results?.faceLandmarks || [];
          if (faces.length > 0) {
            features = extractFaceFeatures(faces[0]);
          }
        }
      } catch (fErr) {
        console.warn("[AssessmentPreStart] Landmark fallback notice:", fErr);
      }

      if (!descriptor && !features) {
        toast.error("No face detected clearly. Please face the camera directly and try again.");
        setIsCapturingPhoto(false);
        return;
      }

      // Lock neural descriptor and baseline features in storages for live proctoring
      if (descriptor && descriptor.length === 128) {
        const descJson = JSON.stringify(descriptor);
        sessionStorage.setItem("candidate_face_descriptor", descJson);
        localStorage.setItem("candidate_face_descriptor", descJson);
      }
      if (features) {
        const featuresJson = JSON.stringify(features);
        sessionStorage.setItem("candidate_face_baseline", featuresJson);
        localStorage.setItem("candidate_face_baseline", featuresJson);
      }
      sessionStorage.setItem("candidate_photo_url", photoDataUrl);
      localStorage.setItem("candidate_photo_url", photoDataUrl);

      // Stop webcam stream now that snapshot is taken
      if (prestartStreamRef.current) {
        prestartStreamRef.current.getTracks().forEach((t) => t.stop());
        prestartStreamRef.current = null;
      }
      setPrestartCameraActive(false);

      setCapturedPhoto(photoDataUrl);
      setPhotoVerified(true);
      toast.success("Identity verification photo captured successfully");
    } catch (err) {
      console.warn("Capture error:", err);
      toast.error("Photo capture error. Please try again.");
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoVerified(false);
    try {
      sessionStorage.removeItem("candidate_face_descriptor");
      sessionStorage.removeItem("candidate_face_baseline");
      sessionStorage.removeItem("candidate_photo_url");
      localStorage.removeItem("candidate_face_descriptor");
      localStorage.removeItem("candidate_face_baseline");
      localStorage.removeItem("candidate_photo_url");
    } catch {}
    handleStartPrestartCamera();
  };

  // ── Final Start Assessment Handler ─────────────────────────────
  const handleStartClick = async () => {
    if (!candidateName.trim()) {
      setNameError("Please enter your full name.");
      setStep(2);
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please complete email verification before starting.");
      setStep(2);
      return;
    }

    if (!photoVerified) {
      toast.error("Please complete identity photo verification before starting.");
      return;
    }

    if (!accepted) {
      toast.error("Please accept the assessment rules and honor code to proceed.");
      return;
    }

    onStart?.({
      name: candidateName.trim(),
      email: email.trim(),
      phone: mobileNumber.trim(),
      experience,
      candidateAccessToken,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-200">
      {/* ── Top Minimal Assessment Header ────────────────────────── */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-8 w-auto max-w-[120px] object-contain rounded"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center tracking-wider">
                {monogram}
              </div>
            )}
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-none">
              {companyName}
            </span>
          </div>

          {/* Minimal Flow Indicator */}
          <div className="text-xs font-medium text-slate-500">
            {step === 1 && "Step 1 of 3 · Assessment Details"}
            {step === 2 && "Step 2 of 3 · Candidate Verification"}
            {step === 3 && "Step 3 of 3 · Before You Start"}
          </div>
        </div>
      </header>

      {/* ── Main Step Content Container ──────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* ════════════════════════════════════════════════════════
              STEP 1: ASSESSMENT DETAILS
             ════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Candidate Assessment
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  {assessmentTitle}
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {assessmentDescription}
                </p>
              </div>

              {/* Assessment Summary Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    Duration
                  </span>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {durationMinutes} minutes
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Questions
                  </span>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {totalQuestions} {totalQuestions === 1 ? "Question" : "Questions"}
                  </p>
                </div>

                {totalGames > 0 && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Gamepad2 className="h-3.5 w-3.5 text-slate-500" />
                      Challenges
                    </span>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {totalGames} Cognitive {totalGames === 1 ? "Game" : "Games"}
                    </p>
                  </div>
                )}
              </div>

              {/* Topics / Competencies */}
              {topicsList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Topics Covered
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topicsList.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Informational Note */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  Your assessment timer will only start after you complete system verification and click <strong>Start Assessment</strong>. Please ensure you are in a quiet room with stable connectivity.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              STEP 2: CANDIDATE VERIFICATION
             ════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Identity Confirmation
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  Candidate Verification
                </h1>
                <p className="text-sm text-slate-600 mt-1.5">
                  Confirm your details before proceeding to the system readiness check.
                </p>
              </div>

              {/* Candidate Information Form */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => {
                        setCandidateName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      placeholder="e.g. Rohit Panchal"
                      className={`w-full h-10 px-3 text-xs bg-white rounded-lg border ${
                        nameError ? "border-rose-500" : "border-slate-300"
                      } focus:outline-none focus:border-slate-900 text-slate-900`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">
                      {nameError}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      Email Address
                    </label>
                    {isEmailVerified ? (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Requires OTP verification
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled={isEmailVerified}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="e.g. candidate@example.com"
                    className={`w-full h-10 px-3 text-xs bg-white rounded-lg border ${
                      emailError ? "border-rose-500" : "border-slate-300"
                    } ${isEmailVerified ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "text-slate-900"} focus:outline-none focus:border-slate-900`}
                  />
                  {emailError && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full h-10 px-3 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900"
                  >
                    <option value="0-1 Years (Entry Level)">0–1 Years (Entry Level)</option>
                    <option value="1-3 Years (Associate)">1–3 Years (Associate)</option>
                    <option value="3-5 Years (Mid-Senior)">3–5 Years (Mid-Senior)</option>
                    <option value="5+ Years (Senior / Lead)">5+ Years (Senior / Lead)</option>
                  </select>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-10 px-4 text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  <span>Back</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleProceedToOtp}
                  disabled={isSendingOtp}
                  className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg cursor-pointer"
                >
                  {isSendingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <span>{isEmailVerified ? "Continue" : "Continue to Verification"}</span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              STEP 3: BEFORE YOU START (Rules + System Check)
             ════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Readiness & Guidelines
                </p>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  Before You Start
                </h1>
                <p className="text-sm text-slate-600 mt-1.5">
                  Complete your system check and review the testing rules below.
                </p>
              </div>

              {/* Two Column Section: Left Rules & Checks, Right Camera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left: Concise Rules & System Check */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                      Assessment Rules
                    </h2>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-900 shrink-0 mt-0.5" />
                        <span>Camera access is required during the assessment.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-900 shrink-0 mt-0.5" />
                        <span>Fullscreen mode is required. Exiting fullscreen may be recorded.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-900 shrink-0 mt-0.5" />
                        <span>Switching tabs or leaving the window is monitored as a violation.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-900 shrink-0 mt-0.5" />
                        <span>Answers and game progress are autosaved continuously.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-900 shrink-0 mt-0.5" />
                        <span>Strict single attempt. Re-attempts are barred once submitted.</span>
                      </li>
                    </ul>
                  </div>

                  {/* System Readiness Checks */}
                  <div className="pt-2 border-t border-slate-100">
                    <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                      System Status
                    </h2>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Video className="h-3.5 w-3.5 text-slate-500" />
                          Camera
                        </span>
                        {photoVerified ? (
                          <span className="font-medium text-emerald-600">✓ Ready</span>
                        ) : prestartCameraActive ? (
                          <span className="font-medium text-slate-700">Photo pending</span>
                        ) : (
                          <span className="font-medium text-slate-500">Access required</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Mic className="h-3.5 w-3.5 text-slate-500" />
                          Microphone
                        </span>
                        <span className="font-medium text-emerald-600">✓ Ready</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Wifi className="h-3.5 w-3.5 text-slate-500" />
                          Internet
                        </span>
                        {isOnline ? (
                          <span className="font-medium text-emerald-600">✓ Connected</span>
                        ) : (
                          <span className="font-medium text-rose-600">✕ Disconnected</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Monitor className="h-3.5 w-3.5 text-slate-500" />
                          Browser
                        </span>
                        <span className="font-medium text-emerald-600">✓ Supported</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Camera Check & Identity Verification */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-900 mb-2.5 self-start">
                    Identity Verification
                  </span>

                  {/* Camera Frame */}
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-300 flex items-center justify-center">
                    {/* Permanent hidden video element for continuous stream attachment */}
                    <video
                      ref={prestartVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-opacity duration-200 ${
                        prestartCameraActive && !capturedPhoto ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                      }`}
                      style={{ transform: "scaleX(-1)" }}
                    />

                    {capturedPhoto ? (
                      <div className="relative w-full h-full">
                        <img
                          src={capturedPhoto}
                          alt="Verification Photo"
                          className="w-full h-full object-cover"
                          style={{ transform: "scaleX(-1)" }}
                        />
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                          ✓ Verified
                        </div>
                      </div>
                    ) : !prestartCameraActive ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Camera className="h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-xs text-slate-300 mb-3">
                          Camera access is required for verification.
                        </p>
                        <Button
                          type="button"
                          onClick={handleStartPrestartCamera}
                          disabled={isCameraStarting}
                          className="h-8 px-3 text-xs bg-white text-slate-900 hover:bg-slate-100 font-medium rounded cursor-pointer"
                        >
                          {isCameraStarting ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Connecting...
                            </span>
                          ) : (
                            <span>Enable Camera</span>
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* Camera Controls */}
                  <div className="w-full mt-3">
                    {capturedPhoto ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Photo Captured
                        </span>
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                        >
                          Retake Photo
                        </button>
                      </div>
                    ) : prestartCameraActive ? (
                      <Button
                        type="button"
                        onClick={handleCaptureVerificationPhoto}
                        disabled={isCapturingPhoto}
                        className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium rounded cursor-pointer"
                      >
                        {isCapturingPhoto ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Verifying Face...
                          </span>
                        ) : (
                          <span>Capture Verification Photo</span>
                        )}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Honor Code & Guidelines Acceptance */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-normal">
                    I agree to the assessment rules, affirm that all responses will be my own authentic work, and accept proctoring monitoring.
                  </span>
                </label>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-10 px-4 text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  <span>Back</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleStartClick}
                  disabled={!accepted || !photoVerified || isStarting}
                  className="h-10 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs rounded-lg cursor-pointer transition-colors"
                >
                  {isStarting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Starting Assessment...
                    </span>
                  ) : (
                    <span>Start Assessment</span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Minimal Footer ───────────────────────────────────────── */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Secure Candidate Assessment Platform
      </footer>

      {/* ════════════════════════════════════════════════════════════
          OTP VERIFICATION CENTERED MODAL
         ════════════════════════════════════════════════════════════ */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 sm:p-7 text-left">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verify Your Email
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Enter the 6-digit verification code sent to{" "}
                <strong className="text-slate-900">{email}</strong>
              </p>
            </div>

            {/* OTP 6-Digit Input Row */}
            <div className="my-6">
              <div
                className="flex items-center justify-between gap-2"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-mono font-bold text-slate-900 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs text-rose-600 font-medium mt-2">
                  {otpError}
                </p>
              )}

              {devHint && (
                <p className="text-[11px] text-slate-400 mt-2">
                  Development Code: {devHint}
                </p>
              )}
            </div>

            {/* Resend Cooldown Text */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
              <span>Didn't receive the code?</span>
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp(email)}
                  disabled={isSendingOtp}
                  className="font-medium text-slate-900 hover:underline cursor-pointer"
                >
                  {isSendingOtp ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOtpModalOpen(false)}
                className="h-9 px-4 text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => triggerVerifyWithDigits(otpDigits)}
                disabled={isVerifyingOtp || otpDigits.some((d) => !d)}
                className="h-9 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs rounded-lg cursor-pointer transition-colors"
              >
                {isVerifyingOtp ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
