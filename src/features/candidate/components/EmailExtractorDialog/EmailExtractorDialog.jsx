"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  FileUp,
  Globe,
  Inbox,
  Loader2,
  Mail,
  Plus,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Zap,
  PowerOff,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuth } from "@/features/auth/context";
import { parseRawEmailContent } from "@/lib/api/candidates";
import {
  useExtractCandidate,
  useUploadResume,
  useMailboxStatus,
  useConnectGoogleMailbox,
  useSyncMailboxNow,
  useDisconnectMailbox,
} from "../../hooks";

const EmailExtractorDialog = ({ triggerText = "Extract from Emails" }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox"); // "inbox" | "resume" | "manual"

  // Derive dynamic user info
  const hrEmail = user?.email || "";
  const hrName =
    user?.name ||
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    (hrEmail ? hrEmail.split("@")[0] : "Recruiter");

  const inboundCareerEmail =
    user?.inboundEmail ||
    user?.tenant?.inboundEmail ||
    (user?.tenantSlug ? `${user.tenantSlug}@inbound.hirequest.com` : "careers@hirequest.com");

  // Mailbox API Hooks
  const { data: mailboxStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useMailboxStatus();
  const connectGoogleMutation = useConnectGoogleMailbox();
  const syncMailboxMutation = useSyncMailboxNow();
  const disconnectMailboxMutation = useDisconnectMailbox();

  // 2. Direct Resume Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetJobId, setTargetJobId] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // 3. Manual Text Paste State
  const [rawText, setRawText] = useState("");
  const [extractedPreview, setExtractedPreview] = useState(null);

  const extractMutation = useExtractCandidate();
  const uploadResumeMutation = useUploadResume();

  const handleGoogleConnect = () => {
    connectGoogleMutation.mutate();
  };

  const handleSyncMailbox = () => {
    syncMailboxMutation.mutate(undefined, {
      onSuccess: () => {
        refetchStatus();
      },
    });
  };

  const handleDisconnect = () => {
    disconnectMailboxMutation.mutate(undefined, {
      onSuccess: () => {
        refetchStatus();
      },
    });
  };

  const handleCopyInboundEmail = () => {
    navigator.clipboard.writeText(inboundCareerEmail);
    toast.success(`Inbound email copied: ${inboundCareerEmail}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit. Please upload a smaller PDF/DOCX.");
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUploadResumeSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a PDF or DOCX resume file first.");
      return;
    }

    uploadResumeMutation.mutate(
      { file: selectedFile, jobId: targetJobId || undefined },
      {
        onSuccess: (res) => {
          const conf = res?.resumeProcessing?.confidenceScore;
          const msg = conf
            ? `Resume parsed successfully (${Math.round(conf * 100)}% confidence)! Candidate added.`
            : `Resume uploaded & processed! Candidate added.`;
          toast.success(msg);
          setUploadResult(res);
          setSelectedFile(null);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to parse resume.");
        },
      }
    );
  };

  const handleParsePreview = () => {
    if (!rawText.trim()) {
      toast.error("Please paste an email or application text first.");
      return;
    }
    const preview = parseRawEmailContent(rawText);
    setExtractedPreview(preview);
  };

  const handleSaveCandidate = () => {
    if (!rawText.trim()) {
      toast.error("Please provide email application text.");
      return;
    }
    const dataToSave = extractedPreview || parseRawEmailContent(rawText);
    extractMutation.mutate(dataToSave, {
      onSuccess: (candidate) => {
        toast.success(`Candidate "${candidate?.name || "Candidate"}" added from email!`);
        setOpen(false);
        setRawText("");
        setExtractedPreview(null);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to extract candidate.");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="relative gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <Mail className="h-4 w-4" />
          {triggerText}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Candidate Inbound & Resume Extractor
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0">
                  🟢 Auto-Sync Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                1-Click connected recruiter inboxes, direct PDF resume upload, or instant text parsing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── 3 TABS SELECTOR ── */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "inbox"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Connected Inboxes
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "resume"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileUp className="h-3.5 w-3.5 text-indigo-500" />
            Direct Resume Upload
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "manual"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            Manual Text Paste
          </button>
        </div>

        {/* ── TAB 1: GOOGLE OAUTH 2.0 RECRUITER MAILBOX SYNC ── */}
        {activeTab === "inbox" && (
          <div className="space-y-4 pt-3">
            {/* Official Careers Address Banner */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/60 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Inbox className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Dedicated Inbound Career Address</span>
                    <Badge className="bg-indigo-100 text-indigo-700 text-[10px] py-0 border-0">Public Webhook</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">{inboundCareerEmail}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyInboundEmail}
                className="text-xs h-8 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-100/60 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Address
              </Button>
            </div>

            {/* Connection Status Container */}
            {isStatusLoading ? (
              <div className="p-8 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="text-xs font-medium">Checking Google Mailbox Connection Status...</span>
              </div>
            ) : mailboxStatus?.connected ? (
              /* ── STATE B: CONNECTED ── */
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-4 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {mailboxStatus.email || hrEmail}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] py-0.5 px-2">
                          🟢 Connected & Auto-Syncing Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Last Synced:{" "}
                        {mailboxStatus.lastSyncedAt
                          ? new Date(mailboxStatus.lastSyncedAt).toLocaleString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSyncMailbox}
                      disabled={syncMailboxMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-3.5 rounded-xl font-semibold shadow-xs cursor-pointer"
                    >
                      {syncMailboxMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Sync Mailbox Now
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnectMailboxMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs h-9 px-3 rounded-xl cursor-pointer"
                    >
                      {disconnectMailboxMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <PowerOff className="h-3.5 w-3.5 mr-1" />
                      )}
                      Disconnect
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Inbound email applications parsed automatically</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>PDF/DOCX resumes extracted & structured</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ── STATE A: NOT CONNECTED ── */
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 p-5 space-y-4 shadow-2xs text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Connect Recruiter Google Mailbox
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sync candidate application emails & resumes directly into HireQuest with 1-click Google OAuth 2.0.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleConnect}
                    disabled={connectGoogleMutation.isPending}
                    className="h-11 px-5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/20 gap-2 shrink-0 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    {connectGoogleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 font-black text-xs">
                        G
                      </span>
                    )}
                    Connect with Google
                  </Button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Zero passwords required · Secure Google OAuth 2.0 token delegation
                  </span>
                  <span className="font-mono text-slate-400">GET /api/v1/mailbox/google/connect</span>
                </div>
              </div>
            )}

            {/* Footer notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Background ingestion scans incoming candidate applications every few minutes
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 2: DIRECT RESUME UPLOAD (POST /api/v1/resumes) ── */}
        {activeTab === "resume" && (
          <div className="space-y-4 pt-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : "Click to select or drag candidate resume"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supported formats: PDF, DOCX (Max size: 5 MB)
                </p>
              </div>
              {selectedFile && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Ready for upload
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Target Job / Assessment ID (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. job-frontend-101"
                  value={targetJobId}
                  onChange={(e) => setTargetJobId(e.target.value)}
                  className="bg-white h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">API Endpoint</label>
                <div className="h-9 px-3 rounded-lg border border-slate-200 bg-white flex items-center font-mono text-[11px] text-slate-600">
                  POST /api/v1/resumes
                </div>
              </div>
            </div>

            {uploadResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Resume Extracted & Candidate Saved!
                  </span>
                  {uploadResult.resumeProcessing?.confidenceScore && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                      Score: {Math.round(uploadResult.resumeProcessing.confidenceScore * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                  <div><b>File:</b> {uploadResult.resumeProcessing?.fileName || "Resume"}</div>
                  <div><b>Status:</b> {uploadResult.resumeProcessing?.status || "COMPLETED"}</div>
                  <div><b>Candidate ID:</b> {uploadResult.candidateId}</div>
                  <div><b>Application:</b> {uploadResult.application?.status || "APPLIED"}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleUploadResumeSubmit}
                disabled={!selectedFile || uploadResumeMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-sm"
              >
                {uploadResumeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Uploading & Parsing (POST /resumes)...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-1.5 h-3.5 w-3.5" />
                    Upload & Extract Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 3: MANUAL TEXT PASTE ── */}
        {activeTab === "manual" && (
          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Raw Email / Application Text
              </label>
            </div>

            <Textarea
              rows={6}
              placeholder="Paste incoming candidate's email, cover letter, or application text here..."
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (e.target.value.trim().length > 20) {
                  setExtractedPreview(parseRawEmailContent(e.target.value));
                }
              }}
              className="font-mono text-xs leading-relaxed"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleParsePreview}
                disabled={!rawText.trim()}
                className="text-xs"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                Extract Fields
              </Button>
            </div>

            {/* Extracted Live Preview Card */}
            {extractedPreview && (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wide">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Auto-Extracted Candidate Profile
                  </span>
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                    Email Ingestion
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-800">{extractedPreview.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Email:</span>
                    <span className="font-semibold text-slate-800">{extractedPreview.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-800">{extractedPreview.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Role & Exp:</span>
                    <span className="font-semibold text-slate-800">
                      {extractedPreview.role} ({extractedPreview.experience})
                    </span>
                  </div>
                </div>

                {extractedPreview.skills && extractedPreview.skills.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-slate-500">Extracted Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedPreview.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[11px] font-medium text-indigo-800 shadow-2xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveCandidate}
                disabled={extractMutation.isPending || !rawText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-sm"
              >
                {extractMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting & Adding...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Add to Candidate Directory
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailExtractorDialog;
