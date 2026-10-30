"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clock,
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  KeyRound,
  RotateCw,
  Loader2,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Check,
  Layers,
  AlertCircle,
  Video,
  AlertTriangle,
  RefreshCw,
  Camera,
  UserCheck,
  ScanFace,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sendCandidateOtp, verifyCandidateOtp } from "@/lib/api/attempts";
import {
  extractFaceFeatures,
  captureVideoSnapshot,
  extractFaceDescriptor,
  loadFaceApiModels,
} from "../../utils/faceMatching";

const AssessmentPreStart = ({
  token = "",
  assessment = {},
  candidate = {},
  isStarting = false,
  onStart,
}) => {
  // ── 4 Dedicated Steps: 1: Company Info, 2: Candidate Profile, 3: OTP Security, 4: Rules & Start ──
  const [step, setStep] = useState(1);

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
    candidate?.experience || "0-1 Years (Fresher)"
  );
  const [accepted, setAccepted] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // ── OTP Verification State ──────────────────────────────────────
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [candidateAccessToken, setCandidateAccessToken] = useState("");
  const [devHint, setDevHint] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [prestartCameraActive, setPrestartCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const prestartVideoRef = useRef(null);
  const prestartStreamRef = useRef(null);
  const prestartLandmarkerRef = useRef(null);

  const otpInputRefs = useRef([]);

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Sync candidate prop if loaded asynchronously
  useEffect(() => {
    if (candidate?.name && !candidateName) setCandidateName(candidate.name);
    if (candidate?.email && !email) setEmail(candidate.email);
    if (candidate?.phone && !mobileNumber) setMobileNumber(candidate.phone);
  }, [candidate]);

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

  const jobPosition = assessment?.title || "Assessment";
  const aboutDescription =
    assessment?.description ||
    assessment?.about ||
    "Official candidate skill & cognitive aptitude evaluation.";

  // Monogram initials for fallback logo
  const monogram = companyName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "FC";

  // Parse skill tags if present in description or comma-separated
  const skillChips = aboutDescription
    .split(/[,•|]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 25)
    .slice(0, 6);

  // ── Handle Send OTP ─────────────────────────────────────────────
  const handleSendOtp = async (targetEmail = email) => {
    const cleanEmail = (targetEmail || "").trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setEmailError("Please provide a valid email address.");
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

      setOtpSent(true);
      setCountdown(60);
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
      toast.success("Email verified successfully!");
      setStep(4);
    } catch (err) {
      setOtpError(err?.message || "Invalid verification code. Please check and try again.");
      toast.error(err?.message || "Verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    await triggerVerifyWithDigits(otpDigits);
  };

  // ── Step Transitions ───────────────────────────────────────────
  const handleStep1ToStep2 = () => {
    setStep(2);
  };

  const handleStep2ToStep3 = async () => {
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
      setStep(4);
      return;
    }

    setStep(3);
    if (!otpSent) {
      await handleSendOtp(email);
    }
  };

  const handleStep3ToStep4 = () => {
    if (!isEmailVerified) {
      toast.error("Please complete the OTP verification to proceed.");
      return;
    }
    setStep(4);
  };


  // ── Pre-Start Camera Clean-up ──
  useEffect(() => {
    return () => {
      if (prestartStreamRef.current) {
        prestartStreamRef.current.getTracks().forEach((t) => t.stop());
        prestartStreamRef.current = null;
      }
      if (prestartLandmarkerRef.current) {
        try { prestartLandmarkerRef.current.close(); } catch {}
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

      // Initialize FaceLandmarker
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
          } catch (_gpu) {
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
        toast.error("No face detected clearly! Please look directly at the camera and try again.");
        setIsCapturingPhoto(false);
        return;
      }

      // Lock neural descriptor and baseline features in both storages
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
      toast.success("✓ Candidate identity registered & photo saved!");
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

  const handleStartClick = async () => {
    if (!candidateName.trim()) {
      setNameError("Please enter your full name.");
      setStep(2);
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email address before starting.");
      setStep(3);
      return;
    }

    if (!accepted) {
      toast.error("Please accept the assessment guidelines & honor code.");
      return;
    }

    setCameraError("");
    setIsRequestingCamera(true);

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsRequestingCamera(false);

      onStart?.({
        name: candidateName.trim(),
        email: email.trim(),
        phone: mobileNumber.trim(),
        experience,
        candidateAccessToken,
      });
    } catch (err) {
      setIsRequestingCamera(false);
      console.warn("[AssessmentPreStart] Camera access verification notice:", err);
      let errorMsg =
        "Webcam access is required for proctored testing. Please enable camera access to start.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg =
          "Camera permission was blocked. Please click the camera/lock icon in your browser address bar, set Camera to 'Allow', and click 'Retry Camera Access'.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No webcam detected on your device. Please connect a working camera and retry.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg =
          "Your camera is in use by another application (Zoom, Teams, Meet). Please close it and retry.";
      }
      setCameraError(errorMsg);
      toast.error("Camera Access Required", { description: errorMsg });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 font-sans text-slate-900 flex flex-col items-center py-8 sm:py-12 px-4 sm:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Outer Full-Width Container ── */}
      <div className="w-full max-w-4xl space-y-6 relative z-10">
        {/* ── 1. Top Header: Branded High-Trust Employer Header ── */}
        <header className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-14 w-14 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4E35E8] to-[#CF2E9F] text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20 shrink-0 tracking-wider">
                {monogram}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex-wrap">
                <span className="text-slate-800 font-extrabold">{companyName}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  VERIFIED EMPLOYER
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-400 font-semibold hidden sm:inline">Secure Proctored Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {jobPosition}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl self-start sm:self-auto shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Official Candidate Screening</span>
          </div>
        </header>

        {/* ── 2. Stepper Progress Bar (Connected Modern SaaS Pills) ── */}
        <nav aria-label="Progress" className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap sm:flex-wrap">
          {/* Step 1: Company Info */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              step === 1
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : step > 1
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/60"
                : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-black ${
                step === 1
                  ? "bg-white text-indigo-700"
                  : step > 1
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {step > 1 ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : "1"}
            </span>
            <span>Company Info</span>
          </button>

          {/* Step 2: Candidate Profile */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              step === 2
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : step > 2
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/60"
                : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-black ${
                step === 2
                  ? "bg-white text-indigo-700"
                  : step > 2
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {step > 2 ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : "2"}
            </span>
            <span>Candidate Profile</span>
          </button>

          {/* Step 3: OTP Security */}
          <button
            type="button"
            onClick={() => candidateName && email && setStep(3)}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              step === 3
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : isEmailVerified
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/60"
                : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50"
            }`}
          >
            {isEmailVerified ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <span
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-black ${
                  step === 3
                    ? "bg-white text-indigo-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                3
              </span>
            )}
            <span>OTP Security</span>
          </button>

          {/* Step 4: Rules & Start */}
          <button
            type="button"
            onClick={() => isEmailVerified && setStep(4)}
            disabled={!isEmailVerified}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
              step === 4
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white text-slate-600 border border-slate-200/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <span
              className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-black ${
                step === 4
                  ? "bg-white text-indigo-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              4
            </span>
            <span>Rules & Start</span>
          </button>
        </nav>

        {/* ── 3. Step Content Card Container ── */}
        <main className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-9 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-7">
          {/* ══════════════════════════════════════════════════════════════
              STEP 1: COMPANY INFO & WELCOME
             ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-2xs shrink-0 mt-0.5">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Step 1: Welcome to {companyName}
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    You've been selected to complete the evaluation for{" "}
                    <strong className="text-indigo-700 font-bold">{jobPosition}</strong>.
                  </p>
                </div>
              </div>

              {/* 3 Metric Cards with Refined Visual Hierarchy */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Duration Card */}
                <div className="flex items-center gap-4 rounded-2xl border border-amber-200/80 p-4.5 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 shadow-2xs">
                  <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-800/80 uppercase tracking-wider block">
                      Total Duration
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {durationMinutes} Minutes
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Timed Test Session
                    </span>
                  </div>
                </div>

                {/* Technical Questions Card */}
                <div className="flex items-center gap-4 rounded-2xl border border-indigo-200/80 p-4.5 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 shadow-2xs">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-800/80 uppercase tracking-wider block">
                      Technical Questions
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {totalQuestions} {totalQuestions === 1 ? "MCQ" : "MCQs"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Single-Choice Domain Items
                    </span>
                  </div>
                </div>

                {/* Cognitive Games Card */}
                <div className="flex items-center gap-4 rounded-2xl border border-purple-200/80 p-4.5 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/20 shadow-2xs">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4E35E8] to-[#CF2E9F] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                    <Gamepad2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-purple-800/80 uppercase tracking-wider block">
                      Cognitive Modules
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {totalGames} {totalGames === 1 ? "Game" : "Games"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Neuro-Aptitude Puzzles
                    </span>
                  </div>
                </div>
              </div>

              {/* ABOUT THIS ASSESSMENT Box with Dynamic Chips */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    About This Assessment
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Evaluation Blueprint</span>
                </div>

                {skillChips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {skillChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold bg-white text-indigo-700 border border-indigo-200/80 px-2.5 py-1 rounded-xl shadow-2xs"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                  {aboutDescription}
                </p>
              </div>

              {/* Candidate Anxiety Reducer Note */}
              <div className="flex items-center gap-3 p-3.5 px-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-indigo-950 text-xs font-medium shadow-2xs">
                <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Candidate Note:</strong> Your assessment timer will <strong>NOT</strong> start until you complete profile verification and accept the honor code in Step 4.
                </span>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleStep1ToStep2}
                  className="h-11 px-7 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all gap-2 cursor-pointer"
                >
                  <span>Continue to Candidate Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 2: CANDIDATE PROFILE FORM
             ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-2xs shrink-0 mt-0.5">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Step 2: Candidate Profile Details
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    Confirm your personal details and contact info for {companyName}'s hiring records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={candidateName}
                      onChange={(e) => {
                        setCandidateName(e.target.value);
                        setNameError("");
                      }}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    />
                  </div>
                  {nameError && <p className="text-xs font-semibold text-rose-600">{nameError}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="candidate@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        setIsEmailVerified(false);
                      }}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    />
                  </div>
                  {emailError && <p className="text-xs font-semibold text-rose-600">{emailError}</p>}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile / Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. +1 555-0123"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Experience Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs cursor-pointer"
                    >
                      <option value="0-1 Years (Fresher / Student)">0-1 Years (Fresher / Student)</option>
                      <option value="1-3 Years (Junior)">1-3 Years (Junior Professional)</option>
                      <option value="3-5 Years (Mid-Level)">3-5 Years (Mid-Level Developer)</option>
                      <option value="5+ Years (Senior)">5+ Years (Senior Engineer)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-11 px-6 font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Company Info
                </Button>

                <Button
                  type="button"
                  onClick={handleStep2ToStep3}
                  className="h-11 px-7 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all gap-2 cursor-pointer"
                >
                  <span>Proceed to OTP Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3: EMAIL OTP VERIFICATION
             ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Step 3 Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-2xs shrink-0 mt-0.5">
                    <KeyRound className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Step 3: Email OTP Verification
                    </h2>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">
                      A 6-digit passcode has been dispatched to authenticate your candidate identity.
                    </p>
                  </div>
                </div>

                {/* OTP Gate Badge */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0 mt-1 shadow-2xs">
                  <Lock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>OTP Security Gate</span>
                </div>
              </div>

              {/* OTP Passcode Card */}
              <div className="rounded-3xl border border-indigo-200/90 bg-indigo-50/30 p-6 sm:p-8 space-y-5 shadow-2xs">
                {/* Header row inside card */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Lock className="h-4 w-4 text-indigo-600" />
                    <span>ENTER 6-DIGIT PASSCODE</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Sent to <strong className="text-slate-900 font-bold">{email}</strong>
                  </div>
                </div>

                {/* Inputs & Verify Button Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 max-w-full" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`h-12 w-10 sm:h-13 sm:w-12 text-center text-xl sm:text-2xl font-black rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${
                          digit
                            ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs"
                            : "border-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otpDigits.some((d) => !d)}
                    className="w-full sm:w-auto h-12 sm:h-13 px-7 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </Button>
                </div>

                {/* Error & Dev Hint */}
                {otpError && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}

                {devHint && (
                  <p className="text-xs font-mono text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200 inline-block">
                    Dev Code: <strong>{devHint}</strong>
                  </p>
                )}

                {/* Footer row: Didn't receive? / Resend OTP */}
                <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs">
                  <span className="font-medium text-slate-500">
                    Didn't receive the passcode?
                  </span>

                  {countdown > 0 ? (
                    <span className="font-semibold text-slate-500">
                      Resend OTP in <strong className="text-indigo-700">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(email)}
                      disabled={isSendingOtp}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-11 px-6 font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Profile
                </Button>

                <Button
                  type="button"
                  onClick={handleStep3ToStep4}
                  disabled={!isEmailVerified}
                  className={`h-11 px-7 font-bold text-xs rounded-xl shadow-md transition-all gap-2 cursor-pointer ${
                    isEmailVerified
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                      : "bg-indigo-300 text-white cursor-not-allowed"
                  }`}
                >
                  <span>Continue to Rules & Start</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 4: RULES & FINAL LAUNCH
             ══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-2xs shrink-0 mt-0.5">
                  <Lock className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Step 4: Rules & System Readiness
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    Please review the proctoring guidelines before launching the test.
                  </p>
                </div>
              </div>

              {/* Guidelines Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="rounded-2xl border border-indigo-200 p-4.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/40 space-y-1.5 sm:col-span-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                      <Video className="h-4 w-4 text-indigo-600" />
                      <span>Live Webcam Proctoring Active</span>
                    </div>
                    <Badge className="text-[10px] bg-indigo-100 text-indigo-800 border-indigo-200 uppercase font-black px-2 py-0.5 rounded-full shadow-2xs">
                      Required
                    </Badge>
                  </div>
                  <p className="text-xs text-indigo-900/80 leading-relaxed pl-6 font-medium">
                    A non-intrusive live camera preview will be displayed during the test for candidate verification. No webcam video is recorded or stored on the server.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 p-4 bg-slate-50/60 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Fullscreen Proctoring</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6 font-medium">
                    Test will run in secure fullscreen mode. Do not minimize or switch tabs.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 p-4 bg-slate-50/60 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Real-time Autosave</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6 font-medium">
                    Answers and game scores are encrypted and autosaved in real-time.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 p-4 bg-slate-50/60 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Strict Single Attempt</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6 font-medium">
                    Once submitted, re-attempts are strictly barred as per hiring policy.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 p-4 bg-slate-50/60 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Stable Internet Connection</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6 font-medium">
                    Ensure an uninterrupted network connection during the entire {durationMinutes} mins.
                  </p>
                </div>
              </div>

                            {/* Candidate Identity Photo Capture Card */}
              <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <ScanFace className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Candidate Identity Verification</span>
                        {photoVerified && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold px-2 py-0.5">
                            ✓ Photo Registered
                          </Badge>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Capture a live photo before starting. Real-time proctoring verifies your identity continuously.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Video / Snapshot Preview Box */}
                  <div className="relative w-48 h-36 sm:w-52 sm:h-40 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-inner shrink-0 flex flex-col items-center justify-center">
                    {/* Always keep video element in DOM so ref & stream stay bound */}
                    <video
                      ref={prestartVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover scale-x-[-1] ${
                        !capturedPhoto && prestartCameraActive ? "block" : "hidden"
                      }`}
                    />

                    {capturedPhoto && (
                      <img
                        src={capturedPhoto}
                        alt="Verified Candidate Snapshot"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {!capturedPhoto && !prestartCameraActive && (
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-1.5">
                          <Camera className="h-5 w-5 text-slate-400" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-300">Camera Off</span>
                        <span className="text-[9.5px] text-slate-500 mt-0.5">Click button to open</span>
                      </div>
                    )}

                    {/* Overlay indicator */}
                    <div className="absolute top-2 left-2 z-10">
                      {capturedPhoto ? (
                        <span className="flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>SAVED</span>
                        </span>
                      ) : prestartCameraActive ? (
                        <span className="flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>LIVE</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
                    {photoVerified ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          <span>Identity photo saved & verified</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Your verification photo is saved. You can now accept the testing guidelines below to start your assessment.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRetakePhoto}
                          className="h-8 px-3 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-lg gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Retake Verification Photo</span>
                        </Button>
                      </div>
                    ) : prestartCameraActive ? (
                      <div className="space-y-2.5">
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          Position your face clearly in the camera center and click the button below to capture and save your photo.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCaptureVerificationPhoto}
                          disabled={isCapturingPhoto}
                          className="h-10 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isCapturingPhoto ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Scanning Face Geometry...</span>
                            </>
                          ) : (
                            <>
                              <ScanFace className="h-3.5 w-3.5" />
                              <span>Capture & Save Photo</span>
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          Click the button below to turn on the camera and capture your verification photo.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleStartPrestartCamera}
                          disabled={isCameraStarting}
                          className="h-10 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isCameraStarting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Opening Camera...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="h-3.5 w-3.5" />
                              <span>Take Verification Photo</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Honor Code Acceptance */}
              <div
                onClick={() => setAccepted(!accepted)}
                className={`flex items-start gap-3.5 rounded-2xl border p-4.5 sm:p-5 transition-all cursor-pointer select-none ${
                  accepted
                    ? "border-emerald-500 bg-emerald-50/60 text-slate-900 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                    accepted ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {accepted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <label className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer leading-relaxed">
                  I agree to the testing guidelines, affirm that all responses will be my own authentic work, and accept the proctoring honor code.
                </label>
              </div>

              {/* Camera Error / Permission Denied Guide */}
              {cameraError && (
                <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4.5 sm:p-5 text-xs text-rose-950 space-y-2.5 animate-in fade-in shadow-2xs">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-rose-900">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>Camera Access Required to Begin</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed pl-7 font-medium">
                    {cameraError}
                  </p>
                  <div className="pl-7 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleStartClick}
                      disabled={isRequestingCamera || isStarting}
                      className="h-9 px-4 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRequestingCamera ? "animate-spin" : ""}`} />
                      <span>{isRequestingCamera ? "Requesting Camera..." : "Retry Camera Access"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-11 px-6 font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to OTP Security
                </Button>

                <Button
                  type="button"
                  onClick={handleStartClick}
                  disabled={!accepted || !photoVerified || isStarting || isRequestingCamera}
                  className="h-12 px-8 font-black text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all gap-2.5 disabled:opacity-40 cursor-pointer"
                >
                  {isRequestingCamera ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Camera Access...</span>
                    </>
                  ) : isStarting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Initializing Test Environment...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      <span>Start Assessment Now</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AssessmentPreStart;
