"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Clock,
  ChevronDown,
  RefreshCw,
  Mailbox,
  Sparkles,
  ArrowRight,
  CircleDashed,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { toast } from "sonner";
import { submitSupportRequest, getMyRequests } from "@/lib/api/support";

const STATUS_CONFIG = {
  OPEN: { 
    label: "Open", 
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: CircleDashed
  },
  IN_PROGRESS: { 
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: MoreHorizontal
  },
  RESOLVED: { 
    label: "Resolved", 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2
  },
};

export default function SupportPage() {
  const { user } = useAuth();

  // Scroll & Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);
  const stat1Ref = useRef(null);
  const stat2Ref = useRef(null);
  const stat3Ref = useRef(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Request list state
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fullName = user?.name || user?.fullName || "";
  const email = user?.email || "";

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyRequests({ limit: 50, sortOrder: "desc" });
      setRequests(data.items || []);
    } catch {
      // Silent — user will see empty list
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── 3D Parallax Scroll Handler ──
  // Background, Midground, and Foreground move at distinctly different speeds
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far Background: Decorative orbs & celestial geometry (0.58x counter-lag => moves slowest)
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0004;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Content: Title, subtitle, badge (0.45x counter-lag + 3D depth push)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.45;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.15);
      const heroScale = 1 - heroProgress * 0.07;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }

    // 3. Staggered Parallax on Stat Cards for organic physical depth
    if (stat1Ref.current) {
      stat1Ref.current.style.transform = `translate3d(0, ${scrollY * 0.09}px, 0)`;
    }
    if (stat2Ref.current) {
      stat2Ref.current.style.transform = `translate3d(0, ${scrollY * 0.16}px, 0)`;
    }
    if (stat3Ref.current) {
      stat3Ref.current.style.transform = `translate3d(0, ${scrollY * 0.23}px, 0)`;
    }
  };

  const validateForm = () => {
    if (!subject.trim()) return "Subject is required.";
    if (subject.trim().length < 3) return "Subject must be at least 3 characters.";
    if (!message.trim()) return "Message is required.";
    if (message.trim().length < 10) return "Message must be at least 10 characters.";
    if (message.trim().length > 5000) return "Message must not exceed 5000 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitSupportRequest({
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubmitted(true);
      setSubject("");
      setMessage("");
      toast.success("Support request submitted successfully!");
      fetchRequests();

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      const errMsg =
        err?.message || "Failed to submit support request. Please try again.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f3f4f8] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* ── Layer 1 & 2: 3D Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-36 md:pb-44 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        
        {/* Far Background: Rotating Ambient Orbs & Geometric Rings (Slow Parallax Layer) */}
        <div 
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Glowing Ambient Radial Glow */}
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />
          
          {/* Concentric 3D Rings */}
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />

          {/* Floating Subtle Shimmer Sparks */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Midground: Hero Content (Medium Parallax Layer with 3D Depth Scale) */}
        <div 
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-3 relative z-10 will-change-transform transition-opacity duration-75"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Tag / Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
            <span>Help Center</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Help & Support
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-xs sm:text-sm font-normal max-w-2xl leading-relaxed">
            Recruitment workspace mein koi problem hai? Ticket submit karein, hamari support team jaldi resolve karegi.
          </p>

          {/* 3 Metric / Response Time Cards (With Staggered Parallax Elevation) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
            <div 
              ref={stat1Ref}
              className="bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3 min-w-[130px] shadow-sm will-change-transform transition-transform duration-75 hover:bg-white/18"
            >
              <div className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                &lt; 2 hrs
              </div>
              <div className="text-[11px] sm:text-xs text-white/75 font-medium mt-0.5">
                Avg. response time
              </div>
            </div>

            <div 
              ref={stat2Ref}
              className="bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3 min-w-[130px] shadow-sm will-change-transform transition-transform duration-75 hover:bg-white/18"
            >
              <div className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                24/7
              </div>
              <div className="text-[11px] sm:text-xs text-white/75 font-medium mt-0.5">
                Support available
              </div>
            </div>

            <div 
              ref={stat3Ref}
              className="bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3 min-w-[130px] shadow-sm will-change-transform transition-transform duration-75 hover:bg-white/18"
            >
              <div className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                98%
              </div>
              <div className="text-[11px] sm:text-xs text-white/75 font-medium mt-0.5">
                Resolved issues
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (1.0x Normal Speed with 3D Depth Tilt) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── Left Card: Submit a Request ── */}
          <div 
            className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.14),0_10px_20px_rgba(0,0,0,0.04)] border border-white/90 ring-1 ring-slate-900/5 p-6 sm:p-8 space-y-6 transition-all duration-200 ease-out"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shadow-2xs">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Submit a Request
              </h2>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Ticket Submitted!
                </h3>
                <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                  Aapka support ticket submit ho gaya hai. Hamari team jaldi resolve karegi.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name & Work Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      disabled
                      className="w-full bg-[#f8fafc] text-slate-600 border border-slate-200/80 rounded-xl h-11 px-3.5 text-sm font-medium cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      WORK EMAIL
                    </label>
                    <input
                      type="text"
                      value={email}
                      disabled
                      className="w-full bg-[#f8fafc] text-slate-600 border border-slate-200/80 rounded-xl h-11 px-3.5 text-sm font-medium cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>SUBJECT</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of your issue..."
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setFormError("");
                    }}
                    maxLength={200}
                    required
                    className="w-full bg-[#f8fafc] border border-slate-200/80 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 rounded-xl h-11 px-3.5 text-sm transition-all outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>DETAILS</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Please provide as much detail as possible..."
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setFormError("");
                    }}
                    maxLength={5000}
                    required
                    className="w-full bg-[#f8fafc] border border-slate-200/80 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 rounded-xl p-3.5 text-sm transition-all outline-none resize-none placeholder:text-slate-400 min-h-[140px]"
                  />
                  <div className="flex items-center justify-end">
                    <p className="text-[11px] font-medium text-slate-400">
                      {message.length} / 5000
                    </p>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{formError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !message.trim()}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#5338ec] to-[#6d38f0] hover:from-[#472ee0] hover:to-[#5e2de0] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/35"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Support Ticket</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Right Card: My Recent Tickets ── */}
          <div 
            className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.14),0_10px_20px_rgba(0,0,0,0.04)] border border-white/90 ring-1 ring-slate-900/5 p-6 sm:p-8 flex flex-col min-h-[460px] transition-all duration-200 ease-out"
          >
            {/* Header with Title and Refresh Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                My Recent Tickets
              </h2>
              <button
                type="button"
                onClick={fetchRequests}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-xs hover:shadow-sm"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-600" : "text-slate-500"}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {/* Ticket List or Empty State */}
            {isLoading ? (
              <div className="flex flex-col space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex flex-col space-y-2.5 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-2/5 bg-slate-200 rounded"></div>
                      <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-3 w-1/4 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-indigo-50/70 border border-indigo-100/50 flex items-center justify-center mb-1 shadow-inner">
                  <Mailbox className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No tickets found
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
                  Aapke submit kiye gaye tickets yahan dikhenge.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-4">
                {requests.map((req) => {
                  const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.OPEN;
                  const isExpanded = expandedId === req.id;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div
                      key={req.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-indigo-200 ring-1 ring-indigo-500/10 shadow-md bg-white"
                          : "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-xs"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isExpanded
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-white text-slate-500 border border-slate-200/60"
                            }`}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {req.subject}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(req.createdAt)}
                              </p>
                              {req.adminReply && !isExpanded && (
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                  Reply received
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-indigo-600" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Your Message
                            </p>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {req.message}
                            </div>
                          </div>

                          {req.adminReply ? (
                            <div>
                              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                Support Team Reply
                              </p>
                              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                                <p className="text-xs text-indigo-950 whitespace-pre-wrap leading-relaxed">
                                  {req.adminReply}
                                </p>
                                {req.repliedAt && (
                                  <p className="text-[10px] font-medium text-indigo-400 mt-2 flex items-center gap-1 justify-end">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(req.repliedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic text-right">
                              Awaiting response from support team...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
