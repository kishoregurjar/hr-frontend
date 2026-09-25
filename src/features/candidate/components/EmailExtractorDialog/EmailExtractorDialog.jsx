"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  FileUp,
  Loader2,
  Mail,
  Phone,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Zap,
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

  // Mailbox API Hooks
  const { data: mailboxStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useMailboxStatus();
  const connectGoogleMutation = useConnectGoogleMailbox();
  const syncMailboxMutation = useSyncMailboxNow();
  const disconnectMailboxMutation = useDisconnectMailbox();

  // Direct Resume Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetJobId, setTargetJobId] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // Manual Text Paste State
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
    extractMutation.mutate(
      { ...dataToSave, source: "EMAIL_EXTRACTION" },
      {
        onSuccess: (candidate) => {
          toast.success(`Candidate "${candidate?.name || "Candidate"}" added successfully!`);
          setOpen(false);
          setRawText("");
          setExtractedPreview(null);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to extract candidate.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="relative gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
        >
          <Mail className="h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-6 rounded-2xl border-slate-200">
        {/* ── HEADER ── */}
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Import Candidates & Resumes
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Sync recruiter inboxes, upload PDF/DOCX resumes, or paste application text.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── 3 TABS SELECTOR ── */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "inbox"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-indigo-600" />
            Recruiter Mailbox
            {mailboxStatus?.connected && (
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "resume"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileUp className="h-3.5 w-3.5 text-purple-600" />
            Upload Resume
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            Paste Text
          </button>
        </div>

        {/* ── TAB 1: RECRUITER MAILBOX SYNC ── */}
        {activeTab === "inbox" && (
          <div className="space-y-4 pt-2">
            {isStatusLoading ? (
              <div className="p-8 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="text-xs font-medium">Checking Mailbox Status...</span>
              </div>
            ) : mailboxStatus?.connected ? (
              /* ACTIVE LOGGED-IN EMAIL RECRUITER CARD (CONNECTED) */
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {mailboxStatus?.email || user?.email || "Recruiter Mailbox"}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] py-0 px-2 font-medium">
                          Active Account
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Last synced:{" "}
                        {mailboxStatus?.lastSyncedAt
                          ? new Date(mailboxStatus.lastSyncedAt).toLocaleString()
                          : "Ready to sync"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSyncMailbox}
                      disabled={syncMailboxMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 rounded-lg font-semibold shadow-xs cursor-pointer"
                    >
                      {syncMailboxMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Sync Now
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnectMailboxMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs h-8 px-2.5 rounded-lg cursor-pointer"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-100 flex items-center gap-2 text-slate-700">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Incoming resumes extracted automatically</span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-100 flex items-center gap-2 text-slate-700">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Structured candidate profiles auto-saved</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CONNECT GOOGLE MAILBOX CARD (DISCONNECTED) */
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {user?.email || "Recruiter Mailbox"}
                        </span>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-2 font-medium">
                          Not Connected
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                        Connect your recruiter Google Mailbox to automatically extract applicant resumes from LinkedIn, Indeed, and Naukri emails.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleConnect}
                    disabled={connectGoogleMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 rounded-lg font-semibold shadow-xs cursor-pointer shrink-0"
                  >
                    {connectGoogleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Connect Google Mailbox
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: DIRECT RESUME UPLOAD ── */}
        {activeTab === "resume" && (
          <div className="space-y-3.5 pt-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 transition-all rounded-xl p-6 text-center cursor-pointer space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : "Click or drag resume here"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports PDF, DOCX (Max 5MB)
                </p>
              </div>
              {selectedFile && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Ready to parse
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Target Job / Assessment (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Frontend Developer, Job-101"
                value={targetJobId}
                onChange={(e) => setTargetJobId(e.target.value)}
                className="bg-white h-9 text-xs"
              />
            </div>

            {uploadResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 space-y-1 text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Resume Extracted & Candidate Saved!
                </span>
                <p className="text-[11px] text-emerald-800">
                  {uploadResult.resumeProcessing?.fileName || "Resume"} parsed successfully.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUploadResumeSubmit}
                disabled={!selectedFile || uploadResumeMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                {uploadResumeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Parsing Resume...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-1.5 h-3.5 w-3.5" />
                    Upload & Extract
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 3: MANUAL TEXT PASTE ── */}
        {activeTab === "manual" && (
          <div className="space-y-3.5 pt-2">
            <Textarea
              rows={5}
              placeholder="Paste candidate application email, cover letter, or resume text here..."
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (e.target.value.trim().length > 20) {
                  setExtractedPreview(parseRawEmailContent(e.target.value));
                }
              }}
              className="text-xs leading-relaxed"
            />

            {extractedPreview && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Preview Extracted Info
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div><span className="text-slate-500">Name:</span> <span className="font-semibold">{extractedPreview.name}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{extractedPreview.email}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="font-semibold">{extractedPreview.phone}</span></div>
                  <div><span className="text-slate-500">Role:</span> <span className="font-semibold">{extractedPreview.role}</span></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCandidate}
                disabled={extractMutation.isPending || !rawText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                {extractMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Add Candidate
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
