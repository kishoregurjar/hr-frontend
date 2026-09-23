"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/context";

import { ASSESSMENT_STATUS } from "../constants";
import {
  AssessmentTableView,
  AssessmentDetailsDrawer,
  AssessmentCardSkeleton,
} from "../components";
import {
  useAssessmentsQuery,
  useAssessmentStatusMutation,
} from "../hooks";

const PAGE_SIZE = 8;

const AssessmentList = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionAssessmentId, setActionAssessmentId] = useState(null);
  const [selectedDrawerAssessment, setSelectedDrawerAssessment] = useState(null);

  const {
    data: assessments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAssessmentsQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Assessments list updated!");
    }, 400);
  };

  const statusMutation = useAssessmentStatusMutation();

  const updateStatus = (id, newStatus) => {
    setActionAssessmentId(id);
    statusMutation.mutate(
      { id, status: newStatus },
      { onSettled: () => setActionAssessmentId(null) }
    );
  };

  const handlePublish = (id) => updateStatus(id, ASSESSMENT_STATUS.PUBLISHED);
  const handleArchive = (id) => updateStatus(id, ASSESSMENT_STATUS.ARCHIVED);
  const handleRestore = (id) => updateStatus(id, ASSESSMENT_STATUS.PUBLISHED);

  const handleInvite = (assessment) => {
    const inviteUrl = typeof window !== "undefined"
      ? `${window.location.origin}/assessment/invite/${assessment.id}`
      : "";
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast.success(`Invite link for "${assessment.title}" copied!`);
    } else {
      setSelectedDrawerAssessment(assessment);
    }
  };

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const title = assessment.title?.toLowerCase() ?? "";
      const description = assessment.description?.toLowerCase() ?? "";
      const matchesQuery = !query || title.includes(query) || description.includes(query);

      const normStatus = String(assessment.status || "DRAFT").toUpperCase();
      let matchesStatus = true;
      if (statusFilter === "PUBLISHED") {
        matchesStatus = normStatus === "PUBLISHED" || normStatus === "ACTIVE";
      } else if (statusFilter === "DRAFT") {
        matchesStatus = normStatus === "DRAFT";
      } else if (statusFilter === "ARCHIVED") {
        matchesStatus = normStatus === "ARCHIVED";
      }

      return matchesQuery && matchesStatus;
    });
  }, [assessments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedAssessments = useMemo(() => {
    const startIndex = (validPage - 1) * PAGE_SIZE;
    return filteredAssessments.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAssessments, validPage]);

  const statsSummary = useMemo(() => {
    const total = assessments.length;
    const publishedCount = assessments.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "PUBLISHED" ||
        String(a.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const draftCount = assessments.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "DRAFT" ||
        !a.status
    ).length;

    if (total === 0) return "0 assessments configured";
    return `${total} Total Assessments (${publishedCount} Published, ${draftCount} Draft)`;
  }, [assessments]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      {/* ── 1. TOP HEADER & PRIMARY CTAs ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Assessments
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {statsSummary}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/assessments/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Build Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. SEARCH & FILTER TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by assessment title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-9 pr-3 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-40 text-xs rounded-xl border-slate-200 bg-slate-50/50 text-slate-700 font-medium">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── 3. LIST VIEW TABLE ── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-xl bg-slate-100/70 animate-pulse border border-slate-200/60"
            />
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-white shadow-2xs">
          <h3 className="text-base font-bold text-slate-900">No assessments found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search or filters."
              : "Click '+ Build Assessment' above to create your first multi-module test!"}
          </p>
        </div>
      ) : (
        <AssessmentTableView
          assessments={paginatedAssessments}
          onViewDetails={(assessment) => setSelectedDrawerAssessment(assessment)}
          onInvite={handleInvite}
          onPublish={handlePublish}
          onArchive={handleArchive}
          onRestore={handleRestore}
          isPendingId={actionAssessmentId}
        />
      )}

      {/* ── 4. PAGINATION FOOTER ── */}
      {!isLoading && filteredAssessments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium pt-3 border-t border-slate-200/80">
          <p>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {(validPage - 1) * PAGE_SIZE + 1}–
              {Math.min(validPage * PAGE_SIZE, filteredAssessments.length)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredAssessments.length}</span> Total Assessments (Page{" "}
            <span className="font-bold text-slate-900">{validPage} of {totalPages}</span>)
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={validPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </Button>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === validPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                          : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={validPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── 5. DETAILS DRAWER / MODAL ── */}
      <AssessmentDetailsDrawer
        open={Boolean(selectedDrawerAssessment)}
        onOpenChange={(open) => !open && setSelectedDrawerAssessment(null)}
        assessment={selectedDrawerAssessment}
        onInvite={handleInvite}
      />
    </div>
  );
};

export default AssessmentList;

