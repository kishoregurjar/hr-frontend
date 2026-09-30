"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Clock,
  ChevronDown,
  RefreshCw,
  Inbox,
  LifeBuoy,
  CircleDashed,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-full mx-auto space-y-8">
        
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-200/60">
          <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-600/20">
            <LifeBuoy className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Help & Support
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Need assistance with your recruitment workspace? Submit a ticket below and our dedicated support team will help you resolve it.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Form ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Submit a Request
                </h2>
              </div>
              
              <div className="p-6">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2 border-4 border-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Ticket Submitted!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                      Thank you for reaching out. Our support team will review your request and get back to you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSubmitted(false)}
                      className="mt-2 text-xs font-semibold h-9"
                    >
                      Submit Another Ticket
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Full Name
                        </label>
                        <Input
                          value={fullName}
                          disabled
                          className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Work Email
                        </label>
                        <Input
                          value={email}
                          disabled
                          className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                        <span>Subject <span className="text-rose-500">*</span></span>
                      </label>
                      <Input
                        placeholder="Brief summary of your issue..."
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value);
                          setFormError("");
                        }}
                        maxLength={200}
                        required
                        className="focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Details <span className="text-rose-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Please provide as much detail as possible to help us assist you..."
                        className="min-h-[160px] resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setFormError("");
                        }}
                        maxLength={5000}
                        required
                      />
                      <div className="flex items-center justify-end">
                        <p className={`text-[11px] font-medium ${message.length > 4900 ? 'text-amber-500' : 'text-slate-400'}`}>
                          {message.length} / 5000
                        </p>
                      </div>
                    </div>

                    {formError && (
                      <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="font-medium leading-snug">{formError}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !subject.trim() || !message.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-sm shadow-sm transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting Ticket...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Support Ticket
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column: My Requests ── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-xl font-bold text-slate-900">My Recent Tickets</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRequests}
                disabled={isLoading}
                className="text-xs font-semibold gap-1.5 shadow-sm bg-white"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : "text-slate-500"}`}
                />
                Refresh List
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col space-y-4 pt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex flex-col space-y-3 p-5 rounded-xl border border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
                      <div className="h-5 w-20 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="h-3 w-1/4 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-base text-slate-800 font-bold">No tickets found</p>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    When you submit support requests, you'll be able to track their status and responses here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((req) => {
                  const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.OPEN;
                  const isExpanded = expandedId === req.id;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div
                      key={req.id}
                      className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-200 ${
                        isExpanded ? "border-blue-200 ring-1 ring-blue-500/10 shadow-md" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition cursor-pointer ${
                          isExpanded ? "bg-blue-50/30" : "hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            isExpanded ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                          }`}>
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {req.subject}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 opacity-70" />
                                {formatDate(req.createdAt)}
                              </p>
                              {req.adminReply && !isExpanded && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  Reply received
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusCfg.color}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusCfg.label}
                          </span>
                          <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? "bg-blue-100/50" : ""}`}>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-blue-600" : "text-slate-400"
                              }`}
                            />
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-slate-100/60 bg-white">
                          <div className="pt-4 space-y-4">
                            
                            {/* Message Bubble */}
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                You wrote
                              </p>
                              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {req.message}
                              </div>
                            </div>
                            
                            {/* Admin Reply Bubble */}
                            {req.adminReply ? (
                              <div className="ml-6">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 mr-1 text-right">
                                  Support Team
                                </p>
                                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl rounded-tr-sm p-4">
                                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                                    {req.adminReply}
                                  </p>
                                  {req.repliedAt && (
                                    <p className="text-[10px] font-medium text-blue-500/80 flex items-center gap-1 mt-3 justify-end">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(req.repliedAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="ml-6 flex items-center justify-end">
                                <p className="text-[11px] font-medium text-slate-400 italic">
                                  Awaiting response from support team...
                                </p>
                              </div>
                            )}
                            
                          </div>
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
