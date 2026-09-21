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
  HelpCircle,
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
  const [phoneError, setPhoneError] = useState("");

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
    "Cognizant";

  const companyLogo =
    assessment?.companyLogo ||
    assessment?.company?.logoUrl ||
    assessment?.createdBy?.company?.logoUrl ||
    assessment?.createdBy?.companyMembers?.[0]?.company?.logoUrl ||
    candidate?.companyLogo ||
    null;

  const jobPosition = assessment?.title || "Competitive Programmer";
  const aboutDescription =
    assessment?.description ||
    assessment?.about ||
    "Official candidate skill & cognitive aptitude evaluation.";

  // Monogram initials for fallback logo (e.g. CG)
  const monogram = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CG";

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

  const handleStartClick = () => {
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

    onStart?.({
      name: candidateName.trim(),
      email: email.trim(),
      phone: mobileNumber.trim(),
      experience,
      candidateAccessToken,
    });
  };

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 flex flex-col items-center py-8 px-4 sm:px-8">
      {/* ── Outer Full-Width Container ── */}
      <div className="w-full max-w-5xl space-y-6">
        {/* ── 1. Top Header: Minimal Plain Header (Style 1) ── */}
        <header className="pb-5 border-b-2 border-[#303331]/90">
          <div className="flex items-center gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-14 w-14 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="h-13 w-13 rounded-xl bg-[#303331] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0 tracking-wide">
                {monogram}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>{companyName}</span>
                <span>•</span>
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  VERIFIED
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#303331] tracking-tight mt-0.5">
                {jobPosition}
              </h1>
            </div>
          </div>
        </header>

        {/* ── 2. Stepper Bar (Plain Minimalist Pills) ── */}
        <nav aria-label="Progress" className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Step 1: Company Info */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              step === 1
                ? "bg-[#303331] text-white shadow-xs"
                : "bg-[#f1f5f9] text-[#64748b] hover:bg-slate-200/80"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                step === 1 ? "bg-white text-[#303331]" : "bg-slate-300 text-slate-700"
              }`}
            >
              1
            </span>
            <span>Company Info</span>
          </button>

          {/* Step 2: Candidate Profile */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              step === 2
                ? "bg-[#303331] text-white shadow-xs"
                : "bg-[#f1f5f9] text-[#64748b] hover:bg-slate-200/80"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                step === 2 ? "bg-white text-[#303331]" : "bg-slate-300 text-slate-700"
              }`}
            >
              2
            </span>
            <span>Candidate Profile</span>
          </button>

          {/* Step 3: OTP Security */}
          <button
            type="button"
            onClick={() => candidateName && email && setStep(3)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              step === 3
                ? "bg-[#303331] text-white shadow-xs"
                : isEmailVerified
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-[#f1f5f9] text-[#64748b] hover:bg-slate-200/80"
            }`}
          >
            {isEmailVerified ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                  step === 3 ? "bg-white text-[#303331]" : "bg-slate-300 text-slate-700"
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
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              step === 4
                ? "bg-[#303331] text-white shadow-xs"
                : "bg-[#f1f5f9] text-[#64748b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/80 cursor-pointer"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                step === 4 ? "bg-white text-[#303331]" : "bg-slate-300 text-slate-700"
              }`}
            >
              4
            </span>
            <span>Rules & Start</span>
          </button>
        </nav>

        {/* ── 3. Step Content Card (Minimalist Clean Container) ── */}
        <main className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xs space-y-7">
          {/* ══════════════════════════════════════════════════════════════
              STEP 1: COMPANY INFO & WELCOME (EXACT SCREENSHOT MATCH)
             ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#f1f5f9] border border-slate-200/70 flex items-center justify-center text-[#303331] shrink-0 mt-0.5">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#303331] tracking-tight">
                    Step 1: Welcome to {companyName}
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    You've been selected to complete the evaluation for{" "}
                    <strong className="text-slate-900 font-bold">{jobPosition}</strong>.
                  </p>
                </div>
              </div>

              {/* 3 Minimal Stat Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Duration Card */}
                <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
                  <div className="h-11 w-11 rounded-xl bg-[#303331] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total Duration
                    </span>
                    <span className="text-base font-extrabold text-[#303331]">
                      {durationMinutes} Minutes
                    </span>
                  </div>
                </div>

                {/* Technical Questions Card */}
                <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
                  <div className="h-11 w-11 rounded-xl bg-[#303331] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Technical Questions
                    </span>
                    <span className="text-base font-extrabold text-[#303331]">
                      {totalQuestions} {totalQuestions === 1 ? "MCQ" : "MCQs"}
                    </span>
                  </div>
                </div>

                {/* Cognitive Games Card */}
                <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
                  <div className="h-11 w-11 rounded-xl bg-[#303331] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Cognitive Modules
                    </span>
                    <span className="text-base font-extrabold text-[#303331]">
                      {totalGames} {totalGames === 1 ? "Game" : "Games"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ABOUT THIS ASSESSMENT Box */}
              <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 sm:p-5 space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  ABOUT THIS ASSESSMENT
                </span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {aboutDescription}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleStep1ToStep2}
                  className="h-11 px-7 font-bold text-xs bg-[#303331] hover:bg-[#424644] text-white rounded-xl shadow-xs transition-all gap-2"
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
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#f1f5f9] border border-slate-200/70 flex items-center justify-center text-[#303331] shrink-0 mt-0.5">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#303331] tracking-tight">
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
                  <label className="text-xs font-bold text-slate-700">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Rohit Panchal"
                      value={candidateName}
                      onChange={(e) => {
                        setCandidateName(e.target.value);
                        setNameError("");
                      }}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#303331]/20 focus:border-[#303331]"
                    />
                  </div>
                  {nameError && <p className="text-xs font-semibold text-rose-600">{nameError}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. rohit@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        setIsEmailVerified(false);
                      }}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#303331]/20 focus:border-[#303331]"
                    />
                  </div>
                  {emailError && <p className="text-xs font-semibold text-rose-600">{emailError}</p>}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Mobile / Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#303331]/20 focus:border-[#303331]"
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Experience Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#303331]/20 focus:border-[#303331] cursor-pointer"
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
                  className="h-11 px-6 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Company Info
                </Button>

                <Button
                  type="button"
                  onClick={handleStep2ToStep3}
                  className="h-11 px-7 font-bold text-xs bg-[#303331] hover:bg-[#424644] text-white rounded-xl shadow-xs transition-all gap-2"
                >
                  <span>Proceed to OTP Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3: EMAIL OTP VERIFICATION (EXACT SCREENSHOT MATCH)
             ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Step 3 Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#303331] tracking-tight">
                      Step 3: Email OTP Verification
                    </h2>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">
                      A 6-digit passcode has been dispatched to authenticate your identity.
                    </p>
                  </div>
                </div>

                {/* OTP Gate Badge */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>OTP Gate</span>
                </div>
              </div>

              {/* OTP Passcode Card */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/20 p-5 sm:p-7 space-y-4">
                {/* Header row inside card */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Lock className="h-3.5 w-3.5 text-[#303331]" />
                    <span>ENTER 6-DIGIT PASSCODE</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Sent to <strong className="text-slate-900 font-bold">{email}</strong>
                  </div>
                </div>

                {/* Inputs & Verify Button Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
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
                        className={`h-11 w-9 sm:h-12 sm:w-11 text-center text-lg sm:text-xl font-black rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#303331]/20 ${
                          digit
                            ? "border-[#303331] ring-1 ring-[#303331]/20"
                            : "border-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otpDigits.some((d) => !d)}
                    className="h-11 sm:h-12 px-6 font-bold text-xs bg-[#303331] hover:bg-[#424644] text-white rounded-xl shadow-xs transition-all gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isVerifyingOtp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </Button>
                </div>

                {/* Error & Dev Hint */}
                {otpError && (
                  <p className="text-xs font-semibold text-rose-600">{otpError}</p>
                )}

                {devHint && (
                  <p className="text-xs font-mono text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
                    Dev Code: <strong>{devHint}</strong>
                  </p>
                )}

                {/* Footer row: Didn't receive? / Resend OTP */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-medium text-slate-500">
                    Didn't receive the passcode?
                  </span>

                  {countdown > 0 ? (
                    <span className="font-semibold text-slate-500">
                      Resend OTP in <strong className="text-slate-800">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(email)}
                      disabled={isSendingOtp}
                      className="font-bold text-[#303331] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className={`h-3 w-3 ${isSendingOtp ? "animate-spin" : ""}`} />
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
                  className="h-11 px-6 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Profile
                </Button>

                <Button
                  type="button"
                  onClick={handleStep3ToStep4}
                  disabled={!isEmailVerified}
                  className={`h-11 px-7 font-bold text-xs rounded-xl shadow-xs transition-all gap-2 ${
                    isEmailVerified
                      ? "bg-[#303331] hover:bg-[#424644] text-white"
                      : "bg-[#303331]/40 text-white/70 cursor-not-allowed"
                  }`}
                >
                  <span>Continue to Rules & Start</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 4: RULES & FINAL LAUNCH (FULLSCREEN READY)
             ══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#f1f5f9] border border-slate-200/70 flex items-center justify-center text-[#303331] shrink-0 mt-0.5">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#303331] tracking-tight">
                    Step 4: Rules & System Readiness
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    Please review the proctoring guidelines before launching the test.
                  </p>
                </div>
              </div>

              {/* Guidelines Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="rounded-xl border border-slate-200 p-4 bg-[#f8fafc] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Fullscreen Proctoring</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    Test will run in secure fullscreen mode. Do not minimize or switch tabs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-[#f8fafc] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Real-time Autosave</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    Answers and game scores are encrypted and autosaved in real-time.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-[#f8fafc] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Strict Single Attempt</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    Once submitted, re-attempts are strictly barred as per hiring policy.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-[#f8fafc] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Stable Internet Connection</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    Ensure an uninterrupted network connection during the entire {durationMinutes} mins.
                  </p>
                </div>
              </div>

              {/* Honor Code Acceptance */}
              <div
                onClick={() => setAccepted(!accepted)}
                className={`flex items-start gap-3.5 rounded-xl border p-4 sm:p-5 transition-all cursor-pointer select-none ${
                  accepted
                    ? "border-emerald-600 bg-emerald-50/40 text-slate-900 shadow-xs"
                    : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                    accepted ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {accepted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <label className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer leading-relaxed">
                  I agree to the testing guidelines, affirm that all responses will be my own authentic work, and accept the proctoring honor code.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-11 px-6 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to OTP Security
                </Button>

                <Button
                  type="button"
                  onClick={handleStartClick}
                  disabled={!accepted || isStarting}
                  className="h-12 px-8 font-black text-xs sm:text-sm bg-[#303331] hover:bg-[#424644] text-white rounded-xl shadow-md transition-all gap-2.5 disabled:opacity-40"
                >
                  {isStarting ? (
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
