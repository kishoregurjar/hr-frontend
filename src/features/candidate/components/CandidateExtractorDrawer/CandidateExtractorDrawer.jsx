"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  Mail,
  Phone,
  Send,
  Sparkles,
  User,
  XCircle,
  Zap,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { formatDate, formatExperience } from "@/lib/formatters";
import { useUpdateCandidateStatus } from "../../hooks";

const CandidateExtractorDrawer = ({
  candidate,
  open,
  isOpen,
  onOpenChange,
  onClose,
  onAssignAssessment,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const updateStatusMutation = useUpdateCandidateStatus();

  const isDrawerOpen = typeof open === "boolean" ? open : Boolean(isOpen);
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  if (!candidate) return null;

  const handleStatusChange = (newStatus) => {
    updateStatusMutation.mutate(
      { id: candidate.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Candidate status updated to "${newStatus}"!`);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to update status");
        },
      }
    );
  };

  const getInitials = (name = "") => {
    return String(name || "CD")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CD";
  };

  const handleCopyLink = async () => {
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/assessment/invite/${candidate.id}`;
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success("Assessment link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <Dialog 
      open={isDrawerOpen} 
      preventCloseOnClickOutside={true}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent 
        className="max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-white/90 bg-white shadow-2xl font-sans"
      >
        {/* ── 1. Top Hero Profile Header (Fixed) ─────────────────────── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-28 w-28 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 pr-8 sm:pr-0">
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-xl shadow-inner border border-white/30">
                {getInitials(candidate.name)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                    {candidate.name || "Candidate Profile"}
                  </h2>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-bold text-xs py-0.5 px-2.5 rounded-full">
                    {candidate.status || "New"}
                  </Badge>
                  {candidate.score !== null && candidate.score !== undefined ? (
                    <Badge className="bg-emerald-400/25 text-emerald-100 border-emerald-300/40 font-bold text-xs gap-1 py-0.5 px-2.5 rounded-full">
                      <Zap className="h-3 w-3 text-emerald-300 fill-emerald-300" />
                      Score: {candidate.score}%
                    </Badge>
                  ) : (
                    <Badge className="bg-white/10 text-white/75 border-white/20 font-medium text-xs py-0.5 px-2 rounded-full">
                      Not Evaluated
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-white/85 flex items-center gap-2 flex-wrap font-medium">
                  <span className="text-white font-bold">{candidate.role || "Applicant"}</span>
                  {candidate.experience != null && (
                    <>
                      <span>•</span>
                      <span>{formatExperience(candidate.experience)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Applied {formatDate(candidate.appliedAt || candidate.createdAt)}</span>
                </p>
              </div>
            </div>

            {/* Ingestion Source Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-md px-3.5 py-1.5 border border-white/25 text-xs shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-pink-200" />
              <span className="text-white/75 font-medium">Source:</span>
              <span className="font-extrabold text-white uppercase tracking-wider">
                {candidate.source || "Manual"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Center Content: 2-Column Balanced Layout (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Contact, Skills & Live Assessment Info (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Contact Details Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  Contact Information
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">
                      {candidate.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{candidate.phoneNumber || candidate.phone || "Not provided"}</span>
                  </div>

                  {candidate.experience != null && (
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Briefcase className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>Experience: <strong className="text-slate-900 font-bold">{formatExperience(candidate.experience)}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Skills Cloud */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Extracted Skills & Tech Stack
                </h4>

                {Array.isArray(candidate.extractedSkills) && candidate.extractedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.extractedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl bg-indigo-50/80 border border-indigo-200/60 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100/70 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-medium text-slate-400 italic py-1">
                    No skills extracted
                  </div>
                )}
              </div>

              {/* Resume Attachment Card */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {candidate.resumeUrl || candidate.resumeFileName ? (candidate.resumeFileName || `${String(candidate.name || "Candidate").replace(/\s+/g, "_")}_Resume.pdf`) : "Resume Document"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {candidate.resumeUrl ? "Verified Application Document" : "No resume document attached"}
                    </p>
                  </div>
                </div>

                {candidate.resumeUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-100/80 bg-white cursor-pointer rounded-xl"
                    onClick={() => window.open(candidate.resumeUrl, "_blank")}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    View
                  </Button>
                ) : null}
              </div>

              {/* Direct Assessment Test Link Box */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    Candidate Test Link
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    Ready to Dispatch
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/assessment/invite/${candidate.id}`}
                    className="flex-1 bg-white border border-indigo-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-xl font-mono truncate select-all focus:outline-hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-100 bg-white cursor-pointer rounded-xl"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Superhuman / Apple Mail Style Inbox Card or Application Details (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-600" />
                  {candidate.emailSubject || candidate.emailBody ? "Ingested Application Email & Note" : "Candidate Application Overview"}
                </h4>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10.5px] font-bold px-2 py-0.5">
                  {candidate.emailSubject || candidate.emailBody ? "Live Extractor Feed" : "Profile Details"}
                </Badge>
              </div>

              {/* Content Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3 flex-1 flex flex-col justify-between shadow-2xs">
                {candidate.emailSubject || candidate.emailBody ? (
                  <>
                    {/* Mail Header */}
                    <div className="space-y-1.5 border-b border-slate-200/80 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {candidate.emailSubject ? candidate.emailSubject : <span className="text-slate-400 italic font-normal">Subject unavailable</span>}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>From: <strong className="text-slate-800 font-bold">{candidate.name}</strong> &lt;{candidate.email}&gt;</span>
                        <span>{formatDate(candidate.appliedAt || candidate.createdAt)}</span>
                      </div>
                    </div>

                    {/* Formatted Mail Body */}
                    <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans overflow-y-auto max-h-56 pr-2 whitespace-pre-wrap no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {candidate.emailBody ? candidate.emailBody : (
                        <span className="text-slate-400 italic">Original email content is unavailable</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="border-b border-slate-200/80 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Candidate Profile Summary
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Registered candidate in recruitment pipeline.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1 shadow-2xs">
                        <p className="text-slate-500 font-semibold text-[11px]">Pipeline Status</p>
                        <p className="font-extrabold text-slate-900">{candidate.status || "NEW"}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1 shadow-2xs">
                        <p className="text-slate-500 font-semibold text-[11px]">Added On</p>
                        <p className="font-extrabold text-slate-900">{formatDate(candidate.createdAt || candidate.appliedAt)}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1 shadow-2xs">
                        <p className="text-slate-500 font-semibold text-[11px]">Ingestion Method</p>
                        <p className="font-extrabold text-slate-900 uppercase">{candidate.source || "Manual Entry"}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1 shadow-2xs">
                        <p className="text-slate-500 font-semibold text-[11px]">Assessment Status</p>
                        <p className="font-extrabold text-slate-900">
                          {candidate.score !== null && candidate.score !== undefined ? `${candidate.score}% Score` : "Not Attempted"}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 font-medium">
                      💡 Click <strong>&quot;Invite to Assessment Test&quot;</strong> below to dispatch cognitive or skill-based test modules to this candidate.
                    </p>
                  </div>
                )}

                {/* Verified Parsing Badge Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    HireQuest Profile Verified
                  </span>
                  <span className="font-semibold text-slate-400">System Pipeline</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Bottom Action Bar (Fixed at Bottom) ───────────────────── */}
        <div className="shrink-0 bg-slate-50/95 backdrop-blur-sm border-t border-slate-200/80 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-3xl">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-rose-700 border-rose-200 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 gap-1.5 font-bold text-xs h-10 px-4 rounded-xl flex-1 sm:flex-initial cursor-pointer"
              onClick={() => handleStatusChange("Rejected")}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="h-4 w-4 text-rose-600" />
              Reject
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:text-emerald-800 gap-1.5 font-bold text-xs h-10 px-4 rounded-xl flex-1 sm:flex-initial cursor-pointer"
              onClick={() => handleStatusChange("Shortlisted")}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Shortlist
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              Close
            </Button>

            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 shadow-md shadow-indigo-500/20 h-10 px-5 rounded-xl cursor-pointer transition-all"
              onClick={() => {
                handleClose();
                onAssignAssessment(candidate);
              }}
            >
              <Send className="h-4 w-4" />
              Invite to Assessment Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateExtractorDrawer;
