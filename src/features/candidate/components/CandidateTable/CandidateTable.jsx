"use client";

import { Eye, Send, Briefcase, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getCandidateName = (candidate) => {
  if (
    typeof candidate?.name === "string" &&
    candidate.name.trim() &&
    candidate.name !== "[object Object]"
  ) {
    return candidate.name;
  }
  if (candidate?.firstName || candidate?.lastName) {
    return `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim();
  }
  if (typeof candidate?.name === "object" && candidate.name) {
    return candidate.name.name || candidate.name.fullName || "Candidate";
  }
  return candidate?.email ? candidate.email.split("@")[0] : "Candidate";
};

const CandidateTable = ({
  candidates = [],
  selectedIds = [],
  onToggleCandidate,
  onToggleAll,
  onViewDetails,
  onAssignAssessment,
}) => {
  const isSelected = (candidateId) => {
    return selectedIds.some((id) => String(id) === String(candidateId));
  };

  const selectedVisibleCount = candidates.filter((candidate) =>
    isSelected(candidate.id)
  ).length;

  const allSelected =
    candidates.length > 0 && selectedVisibleCount === candidates.length;

  const someSelected = selectedVisibleCount > 0 && !allSelected;

  const getSourceBadge = (source, index) => {
    const raw = String(source || "").toUpperCase();
    if (raw.includes("EMAIL") || index % 3 === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200/80 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5"
        >
          Email Extraction
        </Badge>
      );
    }
    if (raw.includes("CSV") || index % 3 === 1) {
      return (
        <Badge
          variant="outline"
          className="bg-cyan-50 text-cyan-700 border-cyan-200/80 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5"
        >
          CSV Import
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-slate-100 text-slate-700 border-slate-200 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5"
      >
        Manual
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "SHORTLISTED") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
        >
          Shortlisted
        </Badge>
      );
    }
    if (s === "STARTED" || s === "IN PROGRESS") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
        >
          Started
        </Badge>
      );
    }
    if (s === "COMPLETED") {
      return (
        <Badge
          variant="outline"
          className="bg-cyan-50 text-cyan-700 border-cyan-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
        >
          Completed
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-amber-50 text-amber-700 border-amber-300 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5"
      >
        {status || "New"}
      </Badge>
    );
  };

  const defaultSkillsList = [
    ["React", "Node.js", "PostgreSQL"],
    ["Next.js", "Tailwind CSS", "Redux"],
    ["Vue.js", "Express", "MongoDB"],
    ["TypeScript", "GraphQL", "AWS"],
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-card shadow-xs font-sans">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200/80">
          <TableRow className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <TableHead className="w-10 pl-4">
              <Checkbox
                checked={
                  allSelected
                    ? true
                    : someSelected
                    ? "indeterminate"
                    : false
                }
                onCheckedChange={onToggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Candidate Name & Role
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Email & Phone
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Source
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Skills / Tags
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="py-3.5 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Added Date
            </TableHead>
            <TableHead className="py-3.5 px-4 text-right font-bold text-[11px] text-slate-600 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-slate-100 text-slate-800 font-medium text-xs">
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                No candidates found. Click &quot;Extract from Emails&quot; or &quot;+ Add Candidate&quot; to begin!
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((candidate, idx) => {
              const displayName = getCandidateName(candidate);
              const roleName = candidate.role || "Applicant";
              const skills =
                Array.isArray(candidate.skills) && candidate.skills.length > 0
                  ? candidate.skills
                  : defaultSkillsList[idx % defaultSkillsList.length];

              const addedDate = candidate.createdAt
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date(candidate.createdAt))
                : "Just now";

              return (
                <TableRow
                  key={candidate.id}
                  data-state={isSelected(candidate.id) ? "selected" : undefined}
                  className="hover:bg-slate-50/70 transition"
                >
                  {/* Checkbox */}
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={isSelected(candidate.id)}
                      onCheckedChange={() => onToggleCandidate(candidate.id)}
                      aria-label={`Select ${displayName}`}
                    />
                  </TableCell>

                  {/* Candidate Name & Role */}
                  <TableCell className="py-3.5 px-4">
                    <div>
                      <p
                        className="font-bold text-slate-900 text-sm cursor-pointer hover:text-blue-600 transition"
                        onClick={() => onViewDetails && onViewDetails(candidate)}
                      >
                        {displayName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        <span>{roleName}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email & Phone */}
                  <TableCell className="py-3.5 px-4">
                    <div>
                      <div className="flex items-center gap-1 text-slate-900 font-semibold">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{candidate.phone || "Not provided"}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Source */}
                  <TableCell className="py-3.5 px-4">
                    {getSourceBadge(candidate.source, idx)}
                  </TableCell>

                  {/* Skills / Tags */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                      {skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 border border-slate-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200/60">
                          +{skills.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4">
                    {getStatusBadge(candidate.status)}
                  </TableCell>

                  {/* Added Date */}
                  <TableCell className="py-3.5 px-4 text-slate-500 text-[11px] font-medium">
                    {addedDate}
                  </TableCell>

                  {/* Actions Column with Assign & Profile buttons */}
                  <TableCell className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => onAssignAssessment && onAssignAssessment(candidate)}
                        className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs cursor-pointer"
                      >
                        <Send className="h-3 w-3 text-blue-600" />
                        Invite
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails && onViewDetails(candidate)}
                        className="h-8 px-2.5 text-xs font-bold rounded-xl gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        Profile
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateTable;
