"use client";

import { useState } from "react";
import {
  Clock,
  FileText,
  ShieldAlert,
  Building2,
  Briefcase,
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AssessmentPreStart = ({
  assessment = {},
  candidate = {},
  isStarting = false,
  onStart,
}) => {
  const [candidateName, setCandidateName] = useState(
    candidate?.name || candidate?.fullName || ""
  );
  const [email] = useState(candidate?.email || "");
  const [mobileNumber, setMobileNumber] = useState(
    candidate?.phone || candidate?.mobileNumber || ""
  );
  const [experience, setExperience] = useState(
    candidate?.experience || "0-2 Years"
  );
  const [accepted, setAccepted] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const durationMinutes =
    assessment?.durationMinutes ??
    assessment?.duration ??
    assessment?.timeLimit ??
    60;

  const totalQuestions =
    (Array.isArray(assessment?.questions) ? assessment.questions.length : null) ??
    (Array.isArray(assessment?.questionIds) ? assessment.questionIds.length : null) ??
    assessment?.questionCount ??
    assessment?.totalQuestions ??
    0;

  const totalGames =
    (Array.isArray(assessment?.games) ? assessment.games.length : null) ??
    (Array.isArray(assessment?.gameIds) ? assessment.gameIds.length : null) ??
    assessment?.gameCount ??
    assessment?.totalGames ??
    0;

  const companyName = assessment?.companyName || "Minders World Recruitment";
  const jobPosition = assessment?.title || "Candidate Assessment";

  const handleStartClick = () => {
    if (mobileNumber && mobileNumber.trim().length < 8) {
      setPhoneError("Please enter a valid mobile number.");
      return;
    }
    setPhoneError("");
    onStart?.({
      name: candidateName.trim(),
      email,
      phone: mobileNumber.trim(),
      experience,
    });
  };

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

      {/* ── 3. Candidate Information Form ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="font-bold text-slate-900">
              Candidate Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Please confirm your details before starting the assessment session.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Anurag Sharma"
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-10 px-3 rounded-lg border bg-slate-50 text-sm font-medium text-slate-600 cursor-not-allowed"
              />
              <span className="absolute right-3 top-2.5 text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              Mobile Number <span className="text-rose-500">*</span>
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
      </div>

      {/* ── 4. Instructions & Honor Code ── */}
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
            disabled={!accepted || isStarting}
            onClick={handleStartClick}
            className="w-full sm:w-auto min-w-[220px] h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
          >
            {isStarting ? "Launching Session..." : "Start Assessment ➔"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPreStart;
