"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Sparkles,
  ChevronDown,
  Clock,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";

import { ASSESSMENT_STATUS } from "../constants";
import {
  AssessmentCard,
  AssessmentCardSkeleton,
} from "../components";
import {
  useAssessmentsQuery,
  useAssessmentStatusMutation,
} from "../hooks";

const PAGE_SIZE = 6;

const AssessmentList = () => {
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

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionAssessmentId, setActionAssessmentId] = useState(null);

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

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const title = assessment.title?.toLowerCase() ?? "";
      const description = assessment.description?.toLowerCase() ?? "";
      return !query || title.includes(query) || description.includes(query);
    });
  }, [assessments, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedAssessments = useMemo(() => {
    const startIndex = (validPage - 1) * PAGE_SIZE;
    return filteredAssessments.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAssessments, validPage]);

  const statsSummary = useMemo(() => {
    const total = filteredAssessments.length;
    const publishedCount = filteredAssessments.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "PUBLISHED" ||
        String(a.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const draftCount = filteredAssessments.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "DRAFT" ||
        !a.status
    ).length;

    if (total === 0) return "0 assessments configured";
    if (publishedCount > 0 && draftCount > 0) {
      return `${total} total (${publishedCount} Published, ${draftCount} Draft)`;
    }
    if (draftCount > 0 && publishedCount === 0) {
      return `${total} ${total === 1 ? "assessment" : "assessments"} (${draftCount} Draft)`;
    }
    return `${total} ${total === 1 ? "assessment" : "assessments"} (${publishedCount} Published)`;
  }, [filteredAssessments]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. TOP ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Test Modules</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {statsSummary}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
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

          {/* Build CTA */}
          <Link href="/assessments/create">
            <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Build Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Cards Grid (2-Columns matching platform UI) ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <AssessmentCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center bg-card">
          <h3 className="text-base font-bold text-slate-900">No assessments found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;+ Build New Assessment&quot; above to create your first multi-module test!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onRestore={handleRestore}
              isPending={actionAssessmentId === assessment.id}
            />
          ))}
        </div>
      )}

      {/* ── 3. Pagination Footer ── */}
      {!isLoading && filteredAssessments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium pt-4 border-t border-slate-200/80">
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
    </div>
  );
};

export default AssessmentList;
