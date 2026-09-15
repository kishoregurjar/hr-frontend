"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clock,
  FileText,
  ShieldAlert,
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
  Check,
  Monitor,
  Maximize2,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sendCandidateOtp, verifyCandidateOtp } from "@/lib/api/attempts";

const AssessmentPreStart = ({
  token = "",
  assessment = {},
  candidate = {},
  isStarting = false,
  onStart,
}) => {
  // ── Step Navigation State (1: Identity/OTP, 2: Briefing, 3: Launch) ──
  const [currentStep, setCurrentStep] = useState(1);

  // ── Candidate Information State ─────────────────────────────────
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
    candidate?.experience || "0-2 Years"
  );
  const [accepted, setAccepted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");

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
    if (candidate?.name && !candidateName) {
      setCandidateName(candidate.name);
    }
    if (candidate?.email && !email) {
      setEmail(candidate.email);
    }
    if (candidate?.phone && !mobileNumber) {
      setMobileNumber(candidate.phone);
    }
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

  const passingScore = assessment?.passingScore ?? 70;

  const companyName =
    assessment?.companyName ||
    candidate?.companyName ||
    candidate?.company?.name ||
    assessment?.company?.name ||
    "Assessment Platform";

  const jobPosition = assessment?.title || "Candidate Assessment";

  // ── Handle Send OTP ─────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");
    try {
      const res = await sendCandidateOtp({
        email: email.trim(),
        invitationToken: token,
      });

      setOtpSent(true);
      setCountdown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      if (res?.devOtp) {
        setDevHint(res.devOtp);
      }
      toast.success(res?.message || `Verification code sent to ${email.trim()}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      toast.error(err?.message || "Failed to send verification code. Please try again.");
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

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
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
    }
  };

  // ── Handle Verify OTP ───────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of your verification code.");
      return;
    }

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
        res?.data?.candidateSessionToken ||
        res?.data?.token;

      if (tokenVal) {
        setCandidateAccessToken(tokenVal);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("candidateSessionToken", tokenVal);
          sessionStorage.setItem("candidateAccessToken", tokenVal);
          localStorage.setItem("candidateSessionToken", tokenVal);
          localStorage.setItem("candidateAccessToken", tokenVal);
        }
      }
      toast.success("Email verified successfully! Proceeding to assessment briefing.");
      setCurrentStep(2);
    } catch (err) {
      setOtpError(err?.message || "Invalid OTP code. Please check and try again.");
      toast.error(err?.message || "Verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ── Step 1 Validation & Proceed ──
  const handleProceedToStep2 = () => {
    if (!candidateName.trim()) {
      setNameError("Please enter your full name.");
      return;
    }
    setNameError("");

    if (mobileNumber && mobileNumber.trim().length < 8) {
      setPhoneError("Please enter a valid mobile number.");
      return;
    }
    setPhoneError("");

    if (!isEmailVerified) {
      toast.error("Please verify your email address before proceeding.");
      return;
    }

    setCurrentStep(2);
  };

  // ── Step 2 Validation & Proceed ──
  const handleProceedToStep3 = () => {
    if (!accepted) {
      toast.error("Please accept the assessment guidelines and honor code to continue.");
      return;
    }
    setCurrentStep(3);
  };

  // ── Final Launch Assessment ──
  const handleStartAssessment = () => {
    if (!candidateName.trim() || !isEmailVerified) {
      toast.error("Please ensure your identity is verified before starting.");
      setCurrentStep(1);
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

  const stepsList = [
    { number: 1, title: "Identity & Verification", icon: ShieldCheck },
    { number: 2, title: "Assessment Briefing", icon: FileText },
    { number: 3, title: "Launch Room", icon: Maximize2 },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4 sm:px-6">
      {/* ── 1. Company & Assessment Header ── */}
      <div className="rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-lg text-white shadow-md shadow-blue-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {companyName}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                {jobPosition}
              </h1>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Active Invitation
          </Badge>
        </div>

        {assessment?.description && (
          <p className="mt-4 text-sm text-slate-300 leading-relaxed border-t border-slate-700/60 pt-4">
            {assessment.description}
          </p>
        )}
      </div>

      {/* ── 2. Progress Stepper Bar ── */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {stepsList.map((st) => {
            const isCompleted = currentStep > st.number || (st.number === 1 && isEmailVerified);
            const isCurrent = currentStep === st.number;
            const Icon = st.icon;

            return (
              <button
                key={st.number}
                type="button"
                disabled={st.number === 3 && (!isEmailVerified || !accepted)}
                onClick={() => {
                  if (st.number === 1) setCurrentStep(1);
                  if (st.number === 2 && isEmailVerified) setCurrentStep(2);
                  if (st.number === 3 && isEmailVerified && accepted) setCurrentStep(3);
                }}
                className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition text-left ${
                  isCurrent
                    ? "bg-blue-50/80 border border-blue-200"
                    : isCompleted
                    ? "hover:bg-slate-50 cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs sm:text-sm transition ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : st.number}
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Step 0{st.number}
                  </p>
                  <p
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isCurrent ? "text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {st.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: CANDIDATE IDENTITY & OTP VERIFICATION ── */}
      {currentStep === 1 && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  Candidate Identity Verification
                </h2>
                <p className="text-xs text-muted-foreground">
                  Confirm your personal details and verify your email to unlock the test.
                </p>
              </div>
            </div>

            {isEmailVerified ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1 text-xs py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Email Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-xs py-1 gap-1">
                <Lock className="h-3 w-3 text-amber-600" />
                OTP Required
              </Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Candidate Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Anurag Sharma"
                className={`w-full h-11 px-3.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  nameError
                    ? "border-rose-500 ring-rose-500/30"
                    : "focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
              {nameError && (
                <p className="text-xs text-rose-500 font-medium">{nameError}</p>
              )}
            </div>

            {/* Email Address with OTP Button */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email Address <span className="text-rose-500">*</span>
                </span>
                {isEmailVerified && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    if (!isEmailVerified) setEmail(e.target.value);
                  }}
                  disabled={isEmailVerified}
                  placeholder="candidate@example.com"
                  className={`w-full h-11 px-3.5 rounded-lg border text-sm font-medium transition ${
                    isEmailVerified
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-800 font-semibold"
                      : "bg-background focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  }`}
                />
                {!isEmailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || countdown > 0}
                    className="shrink-0 h-11 px-4 text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-800 transition"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : countdown > 0 ? (
                      `Resend (${countdown}s)`
                    ) : otpSent ? (
                      "Resend OTP"
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Mobile / Phone Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="+91 98765 43210"
                className={`w-full h-11 px-3.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  phoneError
                    ? "border-rose-500 ring-rose-500/30"
                    : "focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
              {phoneError && (
                <p className="text-xs text-rose-500 font-medium">{phoneError}</p>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              >
                <option value="0-1 Years (Fresher)">0-1 Years (Fresher / Student)</option>
                <option value="1-3 Years">1-3 Years (Junior Developer)</option>
                <option value="3-5 Years">3-5 Years (Mid-Level Developer)</option>
                <option value="5+ Years">5+ Years (Senior / Lead)</option>
              </select>
            </div>
          </div>

          {/* ── OTP 6-Digit Box (When OTP is Sent & Unverified) ── */}
          {otpSent && !isEmailVerified && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Enter 6-Digit Email Verification Code
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Code sent to <strong className="text-slate-700">{email}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="h-12 w-10 sm:w-12 text-center font-mono text-xl font-bold rounded-lg border border-blue-200 bg-white text-slate-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition"
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                  className="h-12 px-6 font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Unlock"
                  )}
                </Button>
              </div>

              {otpError && (
                <p className="text-xs text-rose-600 font-semibold">{otpError}</p>
              )}

              {devHint && (
                <p className="text-xs text-blue-700 font-mono bg-blue-100/70 inline-block px-2.5 py-1 rounded">
                  💡 Dev Code: <strong>{devHint}</strong>
                </p>
              )}
            </div>
          )}

          {/* Step 1 Footer Action */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              🔒 Powered by HireQuest Verification Shield.
            </p>

            <Button
              type="button"
              onClick={handleProceedToStep2}
              disabled={!isEmailVerified || !candidateName.trim()}
              className={`h-11 px-6 font-semibold text-sm transition gap-2 ${
                isEmailVerified && candidateName.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isEmailVerified ? (
                <>
                  Next: Assessment Briefing
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                "Verify Email to Continue ➔"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: ASSESSMENT BRIEFING & GUIDELINES ── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Duration
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {durationMinutes} Mins
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Questions
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {totalQuestions} MCQs
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Cognitive Games
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {totalGames} Games
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Passing Score
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {passingScore}%
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Guidelines */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Assessment Rules & Proctoring Policy
              </h2>
            </div>

            <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong>Timed Countdown:</strong> The {durationMinutes}-minute timer starts immediately upon entering the test room and cannot be paused.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong>Real-Time Autosave:</strong> Your answers and game scores are synced to the server automatically.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong>Fullscreen Proctoring:</strong> The test will launch in full screen mode. Switching tabs will be recorded in your proctoring audit log.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong>Stable Connection:</strong> Ensure you have a reliable internet connection and a distraction-free workspace.
                </span>
              </li>
            </ul>

            {/* Honor Code Checkbox */}
            <div className="pt-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm transition hover:bg-blue-50/70">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  I confirm that I have read the instructions, and I pledge to complete this assessment independently without unauthorized external assistance.
                </span>
              </label>
            </div>
          </div>

          {/* Step 2 Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-11 px-5 font-semibold text-xs sm:text-sm gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Verification
            </Button>

            <Button
              type="button"
              onClick={handleProceedToStep3}
              disabled={!accepted}
              className={`h-11 px-6 font-semibold text-xs sm:text-sm gap-2 transition ${
                accepted
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Proceed to Launch Room
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: LAUNCH ASSESSMENT ROOM ── */}
      {currentStep === 3 && (
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Monitor className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Ready to Launch Test Room
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please review your readiness checklist before starting.
            </p>
          </div>

          {/* Readiness Checklist Card */}
          <div className="rounded-xl border bg-slate-50 p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Candidate & Session Summary
            </h3>

            <div className="grid gap-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Candidate Name</span>
                <span className="font-semibold text-slate-900">{candidateName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Verified Email</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {email}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Hiring Organization</span>
                <span className="font-semibold text-slate-900">{companyName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Environment</span>
                <span className="font-semibold text-blue-700 flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5" />
                  Auto-Fullscreen Enabled
                </span>
              </div>
            </div>
          </div>

          {/* Launch Assessment Action */}
          <div className="space-y-4 pt-2">
            <Button
              type="button"
              size="lg"
              disabled={isStarting}
              onClick={handleStartAssessment}
              className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all gap-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Initializing Assessment Session...
                </>
              ) : (
                <>
                  <Maximize2 className="h-5 w-5" />
                  Start Assessment — Enter Fullscreen
                </>
              )}
            </Button>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-slate-600 hover:text-slate-900 gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Review Guidelines
              </Button>

              <p className="text-[11px] text-muted-foreground text-right">
                🔒 Encrypted Candidate Session
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPreStart;
