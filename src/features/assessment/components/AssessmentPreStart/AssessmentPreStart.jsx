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
  Rocket,
  Check,
  Award,
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
  // ── 4 Dedicated Steps: 1: Company Welcome, 2: Candidate Details, 3: OTP Verification, 4: Rules & Launch ──
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
  const [phoneError, setPhoneError] = useState("");
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

  const passingScore = assessment?.passingScore ?? 60;

  const companyName =
    assessment?.companyName ||
    assessment?.company?.name ||
    assessment?.createdBy?.company?.name ||
    assessment?.createdBy?.companyMembers?.[0]?.company?.name ||
    candidate?.companyName ||
    candidate?.company?.name ||
    "Company Assessment";

  const companyLogo =
    assessment?.companyLogo ||
    assessment?.company?.logoUrl ||
    assessment?.createdBy?.company?.logoUrl ||
    assessment?.createdBy?.companyMembers?.[0]?.company?.logoUrl ||
    candidate?.companyLogo ||
    null;

  const jobPosition = assessment?.title || "Candidate Assessment";

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

    // Auto-verify if all 6 digits are entered
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
      toast.success("Email verified successfully!");
      setStep(4); // Auto advance to Step 4 (Rules & Launch)
    } catch (err) {
      setOtpError(err?.message || "Invalid verification code. Please check and try again.");
      toast.error(err?.message || "Verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ── Handle Verify OTP Button ────────────────────────────────────
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

    // If already verified, move directly to Step 4
    if (isEmailVerified) {
      setStep(4);
      return;
    }

    // Advance to Step 3 (OTP) and dispatch OTP email
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

  // ── Handle Final Start Launch ──────────────────────────────────
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
      toast.error("Please accept the assessment guidelines & integrity honor code.");
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
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4 sm:px-6 font-sans">
      {/* ── 1. Company & Job Branding Header Card ── */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-14 w-14 rounded-2xl object-contain bg-white/10 p-1.5 border border-white/20 shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-bold text-xl text-white shadow-lg shadow-blue-500/30">
                <Building2 className="h-7 w-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  {companyName}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                {jobPosition}
              </h1>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Verified Assessment Invitation
          </Badge>
        </div>
      </div>

      {/* ── 2. Stepped Wizard 4-Step Breadcrumb Navigation ── */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 shadow-xs">
        {/* Step 1: Company Welcome */}
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
            step === 1
              ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
            step === 1 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
          }`}>
            1
          </span>
          <span className="hidden md:inline">Company Info</span>
          <span className="md:hidden">Step 1</span>
        </button>

        {/* Step 2: Candidate Details */}
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
            step === 2
              ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
            step === 2 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
          }`}>
            2
          </span>
          <span className="hidden md:inline">Candidate Profile</span>
          <span className="md:hidden">Step 2</span>
        </button>

        {/* Step 3: OTP Verification */}
        <button
          type="button"
          onClick={() => candidateName && email && setStep(3)}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
            step === 3
              ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold"
              : isEmailVerified
              ? "text-emerald-700 hover:bg-slate-200/60"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
        >
          {isEmailVerified ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
              step === 3 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
            }`}>
              3
            </span>
          )}
          <span className="hidden md:inline">OTP Security</span>
          <span className="md:hidden">Step 3</span>
        </button>

        {/* Step 4: Rules & Launch */}
        <button
          type="button"
          onClick={() => isEmailVerified && setStep(4)}
          disabled={!isEmailVerified}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
            step === 4
              ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold"
              : "disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/60 cursor-pointer"
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
            step === 4 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
          }`}>
            4
          </span>
          <span className="hidden md:inline">Rules & Start</span>
          <span className="md:hidden">Step 4</span>
        </button>
      </div>

      {/* ── STEP 1: COMPANY DETAILS & WELCOME ── */}
      {step === 1 && (
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Step 1: Welcome to {companyName}
              </h2>
              <p className="text-xs text-muted-foreground">
                You have been selected to complete the official evaluation for the role of <strong>{jobPosition}</strong>.
              </p>
            </div>
          </div>

          {/* Assessment Key Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Duration</p>
                <p className="text-base font-extrabold text-slate-900">{durationMinutes} Minutes</p>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Technical Questions</p>
                <p className="text-base font-extrabold text-slate-900">{totalQuestions} MCQs</p>
              </div>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-500/20">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Cognitive Modules</p>
                <p className="text-base font-extrabold text-slate-900">{totalGames} Games</p>
              </div>
            </div>
          </div>

          {/* Company Brief & Overview Box */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              About This Assessment
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {assessment?.description ||
                `This online assessment is designed by the hiring team at ${companyName} to assess your problem-solving capabilities, technical domain understanding, and cognitive agility. Please make sure you are in a quiet environment before proceeding.`}
            </p>
          </div>

          {/* Proceed CTA */}
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              onClick={handleStep1ToStep2}
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer gap-2"
            >
              <span>Continue to Candidate Profile</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: CANDIDATE PROFILE DETAILS ── */}
      {step === 2 && (
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Step 2: Candidate Profile Details
                </h2>
                <p className="text-xs text-muted-foreground">
                  Confirm your personal details and contact info for {companyName}'s hiring records.
                </p>
              </div>
            </div>

            {isEmailVerified && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1 text-xs py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified
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
                placeholder="e.g. Rahul Sharma"
                className={`w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  nameError
                    ? "border-rose-500 ring-rose-500/30"
                    : "focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
              {nameError && (
                <p className="text-xs text-rose-500 font-medium">{nameError}</p>
              )}
            </div>

            {/* Email Address */}
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
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  if (!isEmailVerified) setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                disabled={isEmailVerified || Boolean(candidate?.email && candidate.email.length > 0)}
                placeholder="candidate@example.com"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium transition ${
                  isEmailVerified
                    ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                    : emailError
                    ? "border-rose-500 ring-rose-500/30"
                    : "bg-background focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
              {emailError && (
                <p className="text-xs text-rose-500 font-medium">{emailError}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Mobile / Contact Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="+91 98765 43210"
                className={`w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  phoneError
                    ? "border-rose-500 ring-rose-500/30"
                    : "focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
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
                className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition cursor-pointer"
              >
                <option value="0-1 Years (Fresher)">0-1 Years (Fresher / Student)</option>
                <option value="1-3 Years">1-3 Years (Junior Professional)</option>
                <option value="3-5 Years">3-5 Years (Mid-Level)</option>
                <option value="5+ Years">5+ Years (Senior / Lead)</option>
              </select>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="h-11 px-5 rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Company Info</span>
            </Button>

            <Button
              type="button"
              onClick={handleStep2ToStep3}
              disabled={isSendingOtp}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer gap-2"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Proceed to OTP Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SECURITY & OTP VERIFICATION ── */}
      {step === 3 && (
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Step 3: Email OTP Verification
                </h2>
                <p className="text-xs text-muted-foreground">
                  A 6-digit passcode has been dispatched to authenticate your identity.
                </p>
              </div>
            </div>

            {isEmailVerified ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1 text-xs py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-xs py-1 gap-1">
                <Lock className="h-3 w-3 text-amber-600" />
                OTP Gate
              </Badge>
            )}
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                Enter 6-Digit Passcode
              </span>
              <span className="text-xs text-slate-600">
                Sent to <strong className="text-blue-900">{email}</strong>
              </span>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-1" onPaste={handleOtpPaste}>
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
                  className="h-12 w-11 sm:w-12 text-center font-mono text-xl font-extrabold rounded-xl border border-blue-200 bg-white text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition"
                />
              ))}

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </div>

            {otpError && (
              <p className="text-xs text-rose-600 font-semibold">{otpError}</p>
            )}

            {/* Resend OTP Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-xs">
              <span className="text-slate-500">Didn't receive the passcode?</span>
              <button
                type="button"
                onClick={() => handleSendOtp(email)}
                disabled={isSendingOtp || countdown > 0}
                className="font-bold text-blue-700 hover:text-blue-900 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </div>

            {devHint && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                🧪 <strong>Dev Passcode:</strong> {devHint}
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="h-11 px-5 rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Profile</span>
            </Button>

            <Button
              type="button"
              onClick={handleStep3ToStep4}
              disabled={!isEmailVerified}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer gap-2 disabled:opacity-40"
            >
              <span>Continue to Rules & Start</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: ASSESSMENT INSTRUCTIONS, RULES & LAUNCH ── */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Rules Card */}
          <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Step 4: Assessment Instructions & Integrity Rules
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review the guidelines carefully before launching your secure test session.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed font-medium">
                  The <strong>{durationMinutes}-minute countdown timer</strong> starts the moment you launch the test.
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-start gap-3">
                <RotateCw className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed font-medium">
                  All your question choices and game milestones are <strong>auto-saved in real time</strong>.
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed font-medium">
                  Closing or refreshing your browser window will <strong>not pause</strong> the countdown clock.
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-start gap-3">
                <Lock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed font-medium">
                  The test runs in <strong>mandatory fullscreen mode</strong>. Tab switching is logged for HR review.
                </span>
              </div>
            </div>

            {/* Candidate Summary Verification Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-bold text-slate-900">{candidateName}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Verified Email:</span>
                <span className="font-bold text-slate-900">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hiring Organization:</span>
                <span className="font-bold text-slate-900">{companyName}</span>
              </div>
            </div>

            {/* Honor Code Agreement Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                  I confirm that I am taking this assessment independently, my details are accurate, and I agree to the proctoring guidelines.
                </span>
              </label>
            </div>

            {/* Launch Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
                className="h-11 w-full sm:w-auto px-5 text-xs font-bold gap-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Verification</span>
              </Button>

              <Button
                type="button"
                onClick={handleStartClick}
                disabled={isStarting || !accepted}
                className="h-12 w-full sm:w-auto px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer gap-2 disabled:opacity-40"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Entering Assessment Room...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    <span>🚀 Launch Assessment (Fullscreen)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPreStart;
