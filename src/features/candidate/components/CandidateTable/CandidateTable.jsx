"use client";

import { Eye, Send, Briefcase, Mail, Phone, Check, Minus, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const toTitleCase = (str = "") => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

const getCandidateName = (candidate) => {
  let name = "";
  if (
    typeof candidate?.name === "string" &&
    candidate.name.trim() &&
    candidate.name !== "[object Object]"
  ) {
    name = candidate.name.trim();
  } else if (candidate?.firstName || candidate?.lastName) {
    const fName = (candidate.firstName || "").trim();
    const lName = (candidate.lastName || "").trim();
    if (lName.toLowerCase() === "user") {
      name = fName;
    } else {
      name = `${fName} ${lName}`.trim();
    }
  } else if (typeof candidate?.name === "object" && candidate.name) {
    name = candidate.name.name || candidate.name.fullName || "";
  }

  if (!name && candidate?.email) {
    name = candidate.email.split("@")[0];
  }

  if (name.endsWith(" User") && name.length > 5) {
    name = name.replace(/\s+User$/i, "");
  }

  return toTitleCase(name || "Candidate");
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

  const getSourceBadge = (source) => {
    const raw = String(source || "").toUpperCase();
    if (
      raw.includes("EMAIL") ||
      raw.includes("INBOUND") ||
      raw.includes("MAILBOX") ||
      raw.includes("EXTRACTION") ||
      raw.includes("INGESTION")
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/70 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <Mail className="h-3 w-3 text-indigo-500 shrink-0" />
          <span>Email Extraction</span>
        </span>
      );
    }
    if (raw.includes("CSV") || raw.includes("EXCEL") || raw.includes("IMPORT")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50/90 border border-cyan-200/70 text-cyan-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <FileText className="h-3 w-3 text-cyan-600 shrink-0" />
          <span>CSV Import</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
        <User className="h-3 w-3 text-slate-500 shrink-0" />
        <span>Manual Entry</span>
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "SHORTLISTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Shortlisted</span>
        </span>
      );
    }
    if (s === "INVITED" || s === "SENT" || s.includes("INVIT")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50/90 border border-purple-200 text-purple-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
          <span>Invited</span>
        </span>
      );
    }
    if (s === "STARTED" || s === "IN PROGRESS" || s === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
          <span>Started</span>
        </span>
      );
    }
    if (s === "COMPLETED" || s === "SUBMITTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50/90 border border-rose-200 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/90 border border-amber-200 text-amber-700 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
        <span>{status || "New"}</span>
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/90 bg-white shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200/80">
          <TableRow className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <TableHead className="w-10 pl-5">
              <button
                type="button"
                onClick={onToggleAll}
                aria-label="Select all candidates on this page"
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-[6px] border transition-all cursor-pointer ${
                  allSelected || someSelected
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                {allSelected && <Check className="h-3 w-3 stroke-[3]" />}
                {someSelected && <Minus className="h-3 w-3 stroke-[3]" />}
              </button>
            </TableHead>
            <TableHead className="py-4 px-4 font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Candidate Name & Role
            </TableHead>
            <TableHead className="py-4 px-4 font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Email & Phone
            </TableHead>
            <TableHead className="py-4 px-4 font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Source
            </TableHead>
            <TableHead className="py-4 px-4 font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Skills / Tags
            </TableHead>
            <TableHead className="py-4 px-4 font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="py-4 px-4 font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Updated Date
            </TableHead>
            <TableHead className="py-4 px-5 text-right font-extrabold text-[11px] text-slate-600 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-slate-100 text-slate-800 font-medium text-xs">
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-14 text-slate-500 font-medium">
                No candidates found. Click &quot;Extract from Emails&quot; or &quot;+ Add Candidate&quot; to begin!
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((candidate) => {
              const displayName = getCandidateName(candidate);
              const roleName = candidate.role || "Applicant";
              const skills =
                Array.isArray(candidate.extractedSkills) && candidate.extractedSkills.length > 0
                  ? candidate.extractedSkills
                  : [];

              const dateObj = candidate.updatedAt ? new Date(candidate.updatedAt) : (candidate.createdAt ? new Date(candidate.createdAt) : null);
              const datePart = dateObj
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(dateObj)
                : "Just now";
              const timePart = dateObj
                ? new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                  }).format(dateObj)
                : "";

              const isUpdatedRecently = Boolean(
                candidate.updatedAt &&
                candidate.createdAt &&
                new Date(candidate.updatedAt).getTime() > new Date(candidate.createdAt).getTime() + 10000
              );

              return (
                <TableRow
                  key={candidate.id}
                  data-state={isSelected(candidate.id) ? "selected" : undefined}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Checkbox */}
                  <TableCell className="pl-5">
                    <button
                      type="button"
                      onClick={() => onToggleCandidate(candidate.id)}
                      aria-label={`Select ${displayName}`}
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded-[6px] border transition-all cursor-pointer ${
                        isSelected(candidate.id)
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >
                      {isSelected(candidate.id) && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                  </TableCell>

                  {/* Candidate Name & Role with Avatar */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {/* Initials Squircle Avatar */}
                      <div
                        onClick={() => onViewDetails && onViewDetails(candidate)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-indigo-600/20 border border-indigo-200/80 text-indigo-700 font-black text-xs shadow-2xs cursor-pointer group-hover:scale-105 transition-transform"
                      >
                        {getInitials(displayName)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="font-extrabold text-slate-900 text-sm cursor-pointer group-hover:text-indigo-600 transition-colors truncate"
                            onClick={() => onViewDetails && onViewDetails(candidate)}
                          >
                            {displayName}
                          </p>
                          {isUpdatedRecently && (
                            <span
                              className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-md shadow-2xs whitespace-nowrap"
                              title="Profile was recently modified"
                            >
                              Updated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                          <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{roleName}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email & Phone */}
                  <TableCell className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={candidate.email}>
                          {candidate.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{candidate.phoneNumber || candidate.phone || "Not provided"}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Source */}
                  <TableCell className="py-3.5 px-4">
                    {getSourceBadge(candidate.source)}
                  </TableCell>

                  {/* Skills / Tags (Single Horizontal Row to prevent jagged heights) */}
                  <TableCell className="py-3.5 px-4">
                    <div
                      className="flex items-center gap-1.5 max-w-[240px] overflow-hidden whitespace-nowrap"
                      title={skills.length > 0 ? skills.join(", ") : "No skills listed"}
                    >
                      {skills.length > 0 ? (
                        <>
                          {skills.slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 text-[10.5px] font-bold text-slate-700 border border-slate-200/80 shrink-0 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 2 && (
                            <span
                              className="rounded-lg bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 border border-indigo-200/80 shrink-0 transition-colors cursor-default shadow-2xs"
                              title={skills.slice(2).join(", ")}
                            >
                              +{skills.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-normal">No skills listed</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4">
                    {getStatusBadge(candidate.status)}
                  </TableCell>

                  {/* Updated Date */}
                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-bold text-slate-700 text-xs">
                      {datePart}
                    </p>
                    {timePart && (
                      <p className="text-[10.5px] text-slate-400 font-medium">
                        {timePart}
                      </p>
                    )}
                  </TableCell>

                  {/* Actions Column with Assign & Profile buttons */}
                  <TableCell className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => onAssignAssessment && onAssignAssessment(candidate)}
                        className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-indigo-50 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/80 shadow-2xs cursor-pointer transition-all"
                        title="Invite to Assessment"
                      >
                        <Send className="h-3 w-3 text-indigo-600" />
                        <span>Invite</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails && onViewDetails(candidate)}
                        className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer transition-all"
                        title="View Candidate Profile"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Profile</span>
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
