"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { parseRawEmailContent } from "@/lib/api/candidates";
import { useExtractCandidate } from "../../hooks";

const SAMPLE_EMAIL = `Subject: Application for Senior Frontend Engineer - Siddharth Roy

Dear HR Team,

I would like to apply for the Senior Frontend Engineer position at HireQuest. 
I have over 4 years of experience building modern web applications using React, TypeScript, Next.js, and Tailwind CSS.

Contact Details:
Email: siddharth.roy@example.com
Phone: +91 98765 11223
Experience: 4.2 Years
Key Skills: React, Next.js, TypeScript, Redux, Tailwind CSS, REST APIs, Git

Looking forward to hearing from you.

Best regards,
Siddharth Roy`;

const EmailExtractorDialog = ({ triggerText = "Extract from Emails" }) => {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [extractedPreview, setExtractedPreview] = useState(null);

  const extractMutation = useExtractCandidate();

  const handleParsePreview = () => {
    if (!rawText.trim()) {
      toast.error("Please paste an email or application text first.");
      return;
    }
    const preview = parseRawEmailContent(rawText);
    setExtractedPreview(preview);
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_EMAIL);
    const preview = parseRawEmailContent(SAMPLE_EMAIL);
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
        toast.success(`Candidate "${candidate?.name || 'Candidate'}" added from email!`);
        setOpen(false);
        setRawText("");
        setExtractedPreview(null);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to extract candidate.");
      },
    });
  };

  const handleConfirmExtraction = handleSaveCandidate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-sm shadow-indigo-500/20"
        >
          <Mail className="h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Email Candidate Extractor
              </DialogTitle>
              <DialogDescription>
                Paste incoming candidate emails, cover letters, or resume text to automatically extract candidate profile & skills.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Raw Email / Application Text
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Load Sample Email
            </Button>
          </div>

          <Textarea
            rows={6}
            placeholder="Paste candidate's job application email text here..."
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
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              Extract Fields
            </Button>
          </div>

          {/* Extracted Live Preview Card */}
          {extractedPreview && (
            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100/80 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Auto-Extracted Candidate Profile
                </span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
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
                        className="rounded-md bg-white border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-800 shadow-sm"
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
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCandidate}
              disabled={extractMutation.isPending || !rawText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {extractMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting & Adding...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Add to Candidate Inbox
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailExtractorDialog;
