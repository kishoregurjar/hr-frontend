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
    (Array.isArray(assessment?.selectedGameIds) ? assessment.selectedGameIds.length : null) ??
    (Array.isArray(assessment?.AssessmentGames) ? assessment.AssessmentGames.length : null) ??
    (Array.isArray(assessment?.assessmentGames) ? assessment.assessmentGames.length : null) ??
    (Array.isArray(assessment?.gameIds) ? assessment.gameIds.length : null) ??
    (Array.isArray(assessment?.games) ? assessment.games.length : null) ??
    assessment?.gameCount ??
    assessment?.totalGames ??
    0;

  const companyName = assessment?.companyName || "Minders World Recruitment";
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
      toast.success("Email verified successfully! You can now start the assessment.");
    } catch (err) {
      setOtpError(err?.message || "Invalid OTP code. Please check and try again.");
      toast.error(err?.message || "Verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ── Handle Start Assessment ─────────────────────────────────────
  const handleStartClick = () => {
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
      toast.error("Please verify your email address before starting the assessment.");
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

  const isFormReadyToStart =
    accepted &&
    isEmailVerified &&
    candidateName.trim().length > 0 &&
    !isStarting;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4 sm:px-6">
      {/* ── 1. Company & Job Header ── */}
      <div className="rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-lg text-white shadow-md shadow-blue-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                {companyName}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                {jobPosition}
              </h1>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs font-semibold gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Active Invitation
          </Badge>
        </div>

        {assessment?.description && (
          <p className="mt-4 text-sm text-slate-300 leading-relaxed border-t border-slate-700/60 pt-4">
            {assessment.description}
          </p>
        )}
      </div>

      {/* ── 2. Test Overview Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Duration</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {durationMinutes} Mins
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Questions</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {totalQuestions} MCQs
            </p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Cognitive Games</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {totalGames} Games
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Candidate Verification & Details ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
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
                Confirm your details and verify your email to unlock the test.
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
              Verification Required
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
              className={`w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 transition ${
                nameError
                  ? "border-rose-500 ring-rose-500/30"
                  : "focus:ring-blue-500/40 focus:border-blue-500"
              }`}
            />
            {nameError && (
              <p className="text-xs text-rose-500 font-medium">{nameError}</p>
            )}
          </div>

          {/* Email Address with Verification Button */}
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
                disabled={isEmailVerified || (candidate?.email && candidate.email.length > 0)}
                placeholder="candidate@example.com"
                className={`w-full h-10 px-3 rounded-lg border text-sm font-medium transition ${
                  isEmailVerified
                    ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                    : "bg-background focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
              {!isEmailVerified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || countdown > 0}
                  className="shrink-0 h-10 px-3.5 text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-800 transition"
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
              className={`w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 transition ${
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
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
            >
              <option value="0-1 Years (Fresher)">0-1 Years (Fresher / Student)</option>
              <option value="1-3 Years">1-3 Years (Junior Developer)</option>
              <option value="3-5 Years">3-5 Years (Mid-Level Developer)</option>
              <option value="5+ Years">5+ Years (Senior / Lead)</option>
            </select>
          </div>
        </div>

        {/* ── OTP Input Box (When OTP is Sent & Unverified) ── */}
        {otpSent && !isEmailVerified && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Enter 6-Digit Email Verification Code
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Sent to <strong className="text-slate-700">{email}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                    className="h-11 w-10 sm:w-11 text-center font-mono text-lg font-bold rounded-lg border border-blue-200 bg-white text-slate-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition"
                  />
                ))}
              </div>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                className="h-11 px-5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Unlock"
                )}
              </Button>
            </div>

            {otpError && (
              <p className="text-xs text-rose-600 font-medium">{otpError}</p>
            )}

            {devHint && (
              <p className="text-[11px] text-blue-600 font-mono bg-blue-100/60 inline-block px-2 py-0.5 rounded">
                💡 Dev Verification Code: <strong>{devHint}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 4. Instructions & Guidelines ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <h2 className="font-bold text-slate-900">
            Assessment Instructions & Guidelines
          </h2>
        </div>

        <ul className="grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <span>
              The <strong>{durationMinutes}-minute countdown timer</strong> begins immediately once you click Start.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <span>
              Your responses are <strong>automatically saved in real-time</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <span>
              Closing or refreshing the tab will <strong>not</strong> pause or reset the timer.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <span>
              Tests will automatically enter <strong>fullscreen mode</strong> for an uninterrupted experience.
            </span>
          </li>
        </ul>
      </div>

      {/* ── 5. Acceptance Checkbox & Start Action ── */}
      <div className="space-y-4 pt-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition hover:bg-slate-50">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-800 leading-snug">
            I confirm that my candidate details are accurate and I agree to the assessment guidelines and honor code.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            🔒 Secure test environment by HireQuest & Minders World.
          </p>

          <Button
            type="button"
            size="lg"
            disabled={!isFormReadyToStart}
            onClick={handleStartClick}
            className={`w-full sm:w-auto min-w-[220px] h-12 text-base font-semibold transition-all ${
              isFormReadyToStart
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none"
            }`}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Launching Session...
              </>
            ) : !isEmailVerified ? (
              "🔒 Verify Email to Unlock Test"
            ) : (
              "Start Assessment ➔"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPreStart;
