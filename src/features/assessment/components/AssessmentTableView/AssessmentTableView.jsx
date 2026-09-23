"use client";

import Link from "next/link";
import {
  Eye,
  Send,
  Edit,
  Clock,
  Percent,
  Gamepad2,
  HelpCircle,
  Sparkles,
  Archive,
  RotateCcw,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AssessmentCardActions from "../AssessmentCardActions";
import { getAssessmentSummary } from "../../utils";

const AssessmentTableView = ({
  assessments = [],
  onViewDetails,
  onInvite,
  onPublish,
  onArchive,
  onRestore,
  isPendingId = null,
}) => {
  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "PUBLISHED" || s === "ACTIVE") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
        >
          Published
        </Badge>
      );
    }
    if (s === "DRAFT") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
        >
          Draft
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-slate-100 text-slate-700 border-slate-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
      >
        {status || "Archived"}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs font-sans">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200/80">
          <TableRow className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Assessment Name & Description
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Modules & Weightage
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Time & Passing
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-slate-100">
          {assessments.map((assessment) => {
            const { games, quizzes, totalSections } = getAssessmentSummary(assessment);
            const questionCount = quizzes?.[0]?.questions?.length ?? assessment?.questions?.length ?? 0;
            const gameCount = games?.length ?? assessment?.games?.length ?? assessment?.selectedGameIds?.length ?? 0;

            const quizWeight = assessment?.quizWeight ?? 40;
            const gameWeight = assessment?.gameWeight ?? 60;
            const passingScore = assessment?.passingScore ?? 70;
            const duration = assessment?.durationMinutes ?? 60;

            const title = assessment.title || "Untitled Assessment";
            const description = assessment.description || "No description provided.";

            return (
              <TableRow
                key={assessment.id}
                className="hover:bg-slate-50/60 transition-colors group text-xs"
              >
                {/* 1. Assessment Title & Description */}
                <TableCell className="py-3.5 px-4 max-w-[280px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p
                        onClick={() => onViewDetails?.(assessment)}
                        className="font-extrabold text-slate-900 text-[13px] leading-snug group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {title}
                      </p>
                    </div>
                    <p className="text-slate-500 text-[11px] line-clamp-1">
                      {description}
                    </p>
                  </div>
                </TableCell>

                {/* 2. Modules Breakdown & Weightages */}
                <TableCell className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {gameCount > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-indigo-50/70 text-indigo-700 border-indigo-200/80 text-[10px] font-bold px-2 py-0.5 gap-1"
                        >
                          <Gamepad2 className="h-3 w-3" />
                          <span>{gameCount} Games ({gameWeight}%)</span>
                        </Badge>
                      )}
                      {questionCount > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50/70 text-blue-700 border-blue-200/80 text-[10px] font-bold px-2 py-0.5 gap-1"
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>{questionCount} MCQs ({quizWeight}%)</span>
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10.5px] text-slate-400 font-medium">
                      {totalSections} Sequential Modules
                    </span>
                  </div>
                </TableCell>

                {/* 3. Duration & Passing Criteria */}
                <TableCell className="py-3.5 px-4 whitespace-nowrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{duration} Mins</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pass: <strong className="text-slate-800">{passingScore}%</strong>
                    </p>
                  </div>
                </TableCell>

                {/* 4. Status Badge */}
                <TableCell className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(assessment.status)}
                </TableCell>

                {/* 5. Actions */}
                <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details CTA */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(assessment)}
                      className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 text-xs font-semibold gap-1 shadow-2xs cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>View</span>
                    </Button>

                    {/* Invite CTA */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onInvite?.(assessment)}
                      className="h-8 px-2.5 rounded-xl border-blue-200/90 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 text-xs font-semibold gap-1 shadow-2xs cursor-pointer"
                      title="Invite Candidate"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Invite</span>
                    </Button>

                    {/* Actions Menu (Duplicate, Delete, Publish/Archive) */}
                    <AssessmentCardActions
                      assessment={assessment}
                      onPublish={onPublish}
                      onArchive={onArchive}
                      onRestore={onRestore}
                      isPending={isPendingId === assessment.id}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssessmentTableView;

