"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Send,
  RefreshCw,
  Copy,
  Mail,
  Sparkles,
  FileText,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { useCandidatesQuery, useAssignmentsQuery } from "@/features/candidate/hooks";
import { AssignAssessmentDialog } from "@/features/candidate/components";

export default function InvitationsPage() {
  const { user } = useAuth();
  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "HR Manager";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || "HR Manager";
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";

  const [assessmentFilter, setAssessmentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [preselectedAssessmentId, setPreselectedAssessmentId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetAssessmentId = params.get("assessmentId");
      if (targetAssessmentId) {
        setPreselectedAssessmentId(targetAssessmentId);
        setIsAssignDialogOpen(true);
      }
    }
  }, []);

  const { data: assessments = [] } = useAssessmentsQuery();
  const { data: candidates = [] } = useCandidatesQuery();
  const { data: rawAssignments = [], refetch } = useAssignmentsQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Invitation states refreshed!");
    }, 400);
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/candidate/assessments/invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Candidate exam link copied to clipboard!");
  };

  const dynamicInvitations = useMemo(() => {
    return (rawAssignments || []).map((assignment) => {
      const cand = candidates.find((c) => String(c.id) === String(assignment.candidateId)) || {};
      const assm = assessments.find((a) => String(a.id) === String(assignment.assessmentId)) || {};

      return {
        id: assignment.id,
        candidateName: assignment.candidateName || cand.name || "Candidate",
        email: assignment.candidateEmail || assignment.email || cand.email || "email@example.com",
        assessmentTitle: assignment.assessmentTitle || assm.title || "Assessment Test",
        status: assignment.status || "Sent",
        token: assignment.token || assignment.invitationToken || "token",
        dispatchedDate: assignment.invitedAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(assignment.invitedAt))
          : "Just now",
        expiresDate: assignment.expiresAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(assignment.expiresAt))
          : "7 Days",
      };
    });
  }, [rawAssignments, candidates, assessments]);

  const filteredInvitations = useMemo(() => {
    if (assessmentFilter === "ALL") return dynamicInvitations;
    return dynamicInvitations.filter((inv) =>
      inv.assessmentTitle.toLowerCase().includes(assessmentFilter.toLowerCase())
    );
  }, [dynamicInvitations, assessmentFilter]);

  // Reset pagination to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [assessmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvitations.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = filteredInvitations.length === 0 ? 0 : (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredInvitations.length);

  const paginatedInvitations = useMemo(() => {
    return filteredInvitations.slice(startIndex, startIndex + pageSize);
  }, [filteredInvitations, startIndex, pageSize]);

  // Generate smart pagination numbers
  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pageSet = new Set([1, totalPages, validPage, validPage - 1, validPage + 1]);
    const sorted = Array.from(pageSet)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push(`ellipsis-${i}`);
      }
      result.push(sorted[i]);
    }
    return result;
  }, [totalPages, validPage]);

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "IN PROGRESS" || s === "STARTED") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300 font-bold text-[10.5px] px-2.5 py-0.5 rounded"
        >
          In Progress
        </Badge>
      );
    }
    if (s === "COMPLETED") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10.5px] px-2.5 py-0.5 rounded"
        >
          Completed
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-300 font-bold text-[10.5px] px-2.5 py-0.5 rounded"
      >
        Sent
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── UNIFIED TOOLBAR & ACTIONS (Single Row Layout) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Filter by Assessment + Count */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-600 shrink-0">
              Filter by Assessment:
            </span>
            <select
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 max-w-xs truncate shadow-2xs"
            >
              <option value="ALL">All Assessments ({dynamicInvitations.length})</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.title}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <p className="text-xs text-slate-500 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredInvitations.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900">{endIndex}</span> of{" "}
            <span className="font-bold text-slate-900">{filteredInvitations.length}</span> invitations
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          {/* Refresh Action */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-600 ${
                isRefreshing ? "animate-spin text-indigo-600" : ""
              }`}
            />
          </Button>

          {/* Dispatch CTA */}
          <Button
            onClick={() => setIsAssignDialogOpen(true)}
            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Dispatch Invitations
          </Button>
        </div>
      </div>

      {/* ── 3. Invitations Table (High Depth & Clarity) ── */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3.5 px-5">Candidate</th>
              <th className="py-3.5 px-5">Assessment</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Dispatched Date</th>
              <th className="py-3.5 px-5">Expires</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            {filteredInvitations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Inbox className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No invitations dispatched yet</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Select candidates and dispatch tokenized assessment links to track their screening in real time.
                    </p>
                    <Button
                      onClick={() => setIsAssignDialogOpen(true)}
                      size="sm"
                      className="mt-2 h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Dispatch First Invitation
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedInvitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                  {/* Candidate */}
                  <td className="py-4 px-5">
                    <p className="font-bold text-slate-900 text-sm">
                      {inv.candidateName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span>{inv.email}</span>
                    </div>
                  </td>

                  {/* Assessment */}
                  <td className="py-4 px-5 font-semibold text-slate-800">
                    {inv.assessmentTitle}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">{getStatusBadge(inv.status)}</td>

                  {/* Dispatched Date */}
                  <td className="py-4 px-5 text-slate-500 font-medium">
                    {inv.dispatchedDate}
                  </td>

                  {/* Expires */}
                  <td className="py-4 px-5 text-slate-500 font-medium">
                    {inv.expiresDate}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(inv.token)}
                        className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        Copy Link
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Pagination Controls ── */}
      {filteredInvitations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-xs">
            <span>
              Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
              <span className="font-bold text-slate-800">{filteredInvitations.length}</span> invitations
            </span>
            <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l pl-3">
              <span className="text-[11px] text-slate-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage === 1}
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {paginationPages.map((pageItem, idx) => {
                  if (typeof pageItem === "string" && pageItem.startsWith("ellipsis")) {
                    return (
                      <span key={pageItem || idx} className="px-1 text-slate-400 font-bold select-none">
                        ...
                      </span>
                    );
                  }

                  const pageNum = Number(pageItem);
                  const isActive = validPage === pageNum;

                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage === totalPages}
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Modals ── */}
      <AssignAssessmentDialog
        open={isAssignDialogOpen}
        onOpenChange={(next) => {
          setIsAssignDialogOpen(next);
          if (!next) setPreselectedAssessmentId(null);
        }}
        candidates={candidates}
        preselectedAssessmentId={preselectedAssessmentId}
        onSuccess={() => {
          setIsAssignDialogOpen(false);
          setPreselectedAssessmentId(null);
          refetch();
        }}
      />
    </div>
  );
}
