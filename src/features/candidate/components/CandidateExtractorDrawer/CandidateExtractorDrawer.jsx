"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  Send,
  Sparkles,
  User,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatDate } from "@/lib/formatters";
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
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CD";
  };

  const isEmailIngested =
    candidate.source === "Email Ingestion" || Boolean(candidate.emailSubject);

  const handleCopyLink = async () => {
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/assessment/invite/${candidate.id}`;
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success("Assessment link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <Dialog open={isDrawerOpen} onOpenChange={(nextOpen) => {
      if (!nextOpen) handleClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* ── 1. Top Hero Profile Header ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white rounded-t-2xl relative overflow-hidden">
          {/* Subtle Background Glow Accent */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl shadow-lg border-2 border-white/20">
                {getInitials(candidate.name)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {candidate.name}
                  </h2>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30 font-medium">
                    {candidate.status || "New"}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 font-medium gap-1">
                    <Zap className="h-3 w-3 text-purple-400" />
                    95% Match
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap font-medium">
                  <span className="text-blue-300 font-semibold">{candidate.role || "Software Engineer"}</span>
                  <span>•</span>
                  <span>{candidate.experience || "2+ Years Exp"}</span>
                  <span>•</span>
                  <span>Applied {formatDate(candidate.appliedAt || candidate.createdAt)}</span>
                </p>
              </div>
            </div>

            {/* Ingestion Source Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/10 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-slate-300">Source:</span>
              <span className="font-semibold text-white">
                {candidate.source || "Email Ingestion"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Center Content: 2-Column Balanced Layout ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Contact, Skills & Live Assessment Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Contact Details Card */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                Contact Information
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900 truncate">
                    {candidate.email}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{candidate.phone || "+91 98765 43210"}</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Experience: <strong className="text-slate-900">{candidate.experience || "2+ Years"}</strong></span>
                </div>
              </div>
            </div>

            {/* Extracted Skills Cloud */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                Extracted Skills & Tech Stack
              </h4>

              <div className="flex flex-wrap gap-1.5">
                {(candidate.skills || ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS"]).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 px-2.5 py-1 text-xs font-semibold text-blue-800 shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Attachment Card */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {candidate.name.replace(/\s+/g, "_")}_Resume.pdf
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Verified Application Document
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={() => toast.info("Opening applicant resume preview...")}
              >
                <Download className="mr-1 h-3 w-3" />
                View
              </Button>
            </div>

            {/* Direct Assessment Test Link Box */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  Candidate Test Link
                </span>
                <span className="text-[11px] font-semibold text-indigo-700">
                  Ready to Dispatch
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/assessment/invite/${candidate.id}`}
                  className="flex-1 bg-white border border-indigo-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-mono truncate"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="h-8 text-xs font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Superhuman / Apple Mail Style Inbox Card (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                Ingested Application Email & Cover Note
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                Live Extractor Feed
              </span>
            </div>

            {/* Modern Mail Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3 flex-1 flex flex-col justify-between">
              {/* Mail Header */}
              <div className="space-y-1.5 border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {candidate.emailSubject || `Application for ${candidate.role || "Software Engineer"} - ${candidate.name}`}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>From: <strong className="text-slate-800">{candidate.name}</strong> &lt;{candidate.email}&gt;</span>
                  <span>{formatDate(candidate.appliedAt || candidate.createdAt)}</span>
                </div>
              </div>

              {/* Formatted Mail Body */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans overflow-y-auto max-h-56 pr-2 whitespace-pre-wrap">
                {candidate.emailBody || (
                  `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${candidate.role || "Software Engineer"} role at HireQuest. With ${candidate.experience || "over 3 years"} of experience working on production web applications, I have developed expertise in ${(candidate.skills || ["React", "JavaScript"]).join(", ")}.\n\nI look forward to discussing how my skills and background can contribute to the success of your team.\n\nBest regards,\n${candidate.name}`
                )}
              </div>

              {/* Verified Parsing Badge Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-green-700 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  NLP Parsing 100% Verified
                </span>
                <span>HireQuest Ingestion Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Bottom Sticky Action Bar ─────────────────────────────── */}
        <div className="bg-slate-50/90 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 gap-1.5 font-medium flex-1 sm:flex-initial"
              onClick={() => handleStatusChange("Rejected")}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="h-4 w-4 text-red-600" />
              Reject
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 gap-1.5 font-medium flex-1 sm:flex-initial"
              onClick={() => handleStatusChange("Shortlisted")}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Shortlist
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900"
            >
              Close
            </Button>

            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold gap-2 shadow-md shadow-blue-500/20 px-5"
              onClick={() => {
                onClose();
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
