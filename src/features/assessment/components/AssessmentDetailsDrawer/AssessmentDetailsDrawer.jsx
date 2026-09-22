"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  FileText,
  Gamepad2,
  HelpCircle,
  Percent,
  Plus,
  Send,
  Sparkles,
  Layers,
  Edit,
  Copy,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { getAssessmentSummary } from "../../utils";

const AssessmentDetailsDrawer = ({
  assessment,
  open,
  onOpenChange,
  onInvite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!assessment) return null;

  const { games, quizzes, totalSections } = getAssessmentSummary(assessment);
  const quizQuestions = quizzes?.[0]?.questions || assessment?.questions || [];
  const cognitiveGames = games || assessment?.games || assessment?.selectedGameIds || [];

  const quizWeight = assessment?.quizWeight ?? 40;
  const gameWeight = assessment?.gameWeight ?? 60;
  const passingScore = assessment?.passingScore ?? 70;
  const duration = assessment?.durationMinutes ?? 60;

  const isPublished =
    String(assessment?.status || "").toUpperCase() === "PUBLISHED" ||
    String(assessment?.status || "").toUpperCase() === "ACTIVE";

  const handleCopyInviteLink = () => {
    const inviteUrl = typeof window !== "undefined"
      ? `${window.location.origin}/assessment/invite/${assessment.id}`
      : "";
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Assessment invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 sm:p-7 font-sans">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                    isPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
                >
                  {isPublished ? "Published Assessment" : "Draft"}
                </Badge>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {totalSections} Sequential Modules
                </span>
              </div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 mt-1.5">
                {assessment.title || "Untitled Assessment"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1 line-clamp-2">
                {assessment.description || "No description provided for this assessment module."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── KPI Meta Badges Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>Time Limit</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 mt-1">
              {duration} Minutes
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Percent className="h-3.5 w-3.5 text-emerald-600" />
              <span>Passing Score</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 mt-1">
              {passingScore}%
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Gamepad2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Cognitive Games</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 mt-1">
              {cognitiveGames.length} ({gameWeight}%)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
              <span>MCQ Questions</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 mt-1">
              {quizQuestions.length} ({quizWeight}%)
            </p>
          </div>
        </div>

        {/* ── Modules Deep Breakdown ── */}
        <div className="space-y-4 pt-1">
          {/* Module 1: Cognitive Games */}
          <div className="rounded-xl border border-slate-200/80 p-4 space-y-3 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Module 1: Cognitive & Behavioral Challenges
                  </h4>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Evaluates problem-solving agility, memory, and cognitive pattern recognition.
                  </p>
                </div>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                Weight: {gameWeight}%
              </Badge>
            </div>

            {cognitiveGames.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No cognitive games configured in this module.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {cognitiveGames.map((g, idx) => {
                  const gameTitle = typeof g === "object" ? g.title || g.name || "Cognitive Game" : String(g);
                  const gameCategory = typeof g === "object" ? g.category || "Cognitive" : "Game Module";
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[150px]">
                          {gameTitle}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9.5px] font-semibold text-slate-600 bg-white">
                        {gameCategory}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Module 2: Technical & Domain MCQs */}
          <div className="rounded-xl border border-slate-200/80 p-4 space-y-3 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Module 2: Technical & Domain MCQ Quiz
                  </h4>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Evaluates core technical concepts, problem resolution, and domain proficiency.
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                Weight: {quizWeight}%
              </Badge>
            </div>

            {quizQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No technical questions configured in this assessment.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 pt-1">
                {quizQuestions.map((q, idx) => {
                  const qText = q.title || q.question || q.content || `Question ${idx + 1}`;
                  const qCat = q.category?.name || q.category || q.categoryName || "General";
                  const qDiff = q.difficulty || "Medium";
                  return (
                    <div
                      key={q.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/40 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="h-5 w-5 shrink-0 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-slate-800 truncate">
                          {qText}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[9.5px] font-semibold text-slate-600 bg-white">
                          {qCat}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9.5px] font-bold ${
                            qDiff === "Easy"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : qDiff === "Hard"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {qDiff}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyInviteLink}
            className="w-full sm:w-auto h-9 px-3.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Link Copied!" : "Copy Test Link"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href={`/assessments/${assessment.id}/edit`} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 px-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit / Modules
              </Button>
            </Link>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange?.(false);
                onInvite?.(assessment);
              }}
              className="w-full sm:w-auto h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Invite Candidate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsDrawer;
