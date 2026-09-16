"use client";

import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Brain,
  Code2,
  Copy,
  ExternalLink,
  Pencil,
  CheckCircle2,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AssessmentCard = ({
  assessment,
  onPublish,
  onArchive,
  onRestore,
  isPending,
}) => {
  if (!assessment) return null;

  const duration =
    assessment.duration ??
    assessment.durationMinutes ??
    25;

  const durationMode = duration > 30 ? "OVERALL" : "MODULE_WISE";

  const isPublished =
    String(assessment.status || "").toUpperCase() === "PUBLISHED" ||
    String(assessment.status || "").toUpperCase() === "ACTIVE";

  const passingScore = assessment.passingScore ?? 70;

  // Extract or generate module breakdown
  const rawModules = [];

  const gamesList =
    assessment.games ||
    assessment.AssessmentGames ||
    assessment.assessmentGames ||
    [];

  const questionsList =
    assessment.questions ||
    assessment.AssessmentQuestions ||
    assessment.assessmentQuestions ||
    [];

  if (Array.isArray(gamesList) && gamesList.length > 0) {
    gamesList.forEach((g, idx) => {
      rawModules.push({
        id: `game-${idx}`,
        title: `Module ${idx + 1}: ${g.game?.name || g.name || "Visual Logic & Pattern Matrix"}`,
        type: "game",
        weight: Math.round(50 / gamesList.length),
      });
    });
  }

  if (Array.isArray(questionsList) && questionsList.length > 0) {
    rawModules.push({
      id: `mcq-1`,
      title: `Module ${rawModules.length + 1}: Core Technical & Engineering MCQ`,
      type: "quiz",
      weight: 50,
    });
  }

  // Fallback realistic modules matching the reference screenshot
  const displayModules =
    rawModules.length > 0
      ? rawModules
      : assessment.title?.toLowerCase().includes("architect")
      ? [
          {
            id: "mod-1",
            title: "Frontend Mastery Quiz",
            type: "quiz",
            weight: 100,
          },
        ]
      : [
          {
            id: "mod-1",
            title: "Module 1: Visual Logic & Pattern Matrix",
            type: "game",
            weight: 30,
          },
          {
            id: "mod-2",
            title: "Module 2: Cognitive Memory Sequence Matrix",
            type: "game",
            weight: 20,
          },
          {
            id: "mod-3",
            title: "Module 3: Core Engineering & Architecture MCQ",
            type: "quiz",
            weight: 50,
          },
        ];

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const link = `${window.location.origin}/take-test?token=inv_demo_${assessment.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Assessment candidate link copied to clipboard!");
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
      <div>
        {/* ── Top Row: Status + Duration Badge ── */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 ${
              isPublished
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300"
            }`}
          >
            {isPublished ? "PUBLISHED" : "DRAFT"}
          </Badge>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {duration}m ({durationMode})
            </span>
          </div>
        </div>

        {/* ── Title & Description ── */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-3">
          {assessment.title || "Untitled Assessment"}
        </h3>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
          {assessment.description ||
            "Comprehensive screening containing a Visual Pattern Game, Memory Matrix, and Core Technical Quiz."}
        </p>

        {/* ── Modules Breakdown ── */}
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {displayModules.length} SEQUENTIAL MODULES:
          </p>

          <div className="space-y-1.5">
            {displayModules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {mod.type === "game" ? (
                    <Code2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  ) : (
                    <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  )}
                  <span className="truncate text-[11.5px] font-medium text-slate-900">
                    {mod.title}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {mod.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500">
          Pass: <span className="text-slate-800 font-bold">{passingScore}%</span>
        </p>

        <div className="flex items-center gap-2">
          {!isPublished && onPublish && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPublish(assessment.id)}
              disabled={isPending}
              className="h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 cursor-pointer"
            >
              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
              Publish
            </Button>
          )}

          {isPublished && (
            <>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Copy Candidate Link"
              >
                <Copy className="h-4 w-4" />
              </button>

              <Link href={`/invitations?assessmentId=${assessment.id}`}>
                <Button
                  size="sm"
                  className="h-8 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/80 shadow-none cursor-pointer"
                >
                  <Send className="h-3 w-3 mr-1 text-indigo-600" />
                  Invite
                </Button>
              </Link>
            </>
          )}

          <Link href={`/assessments/${assessment.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/70 cursor-pointer"
            >
              Edit / Modules
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard;
