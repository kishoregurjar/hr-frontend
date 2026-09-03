"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, ChevronDown, Clock, Search, RefreshCw } from "lucide-react";
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

const AssessmentList = () => {
  const { user } = useAuth();
  const rawName = user?.name || user?.fullName || "Sarah Jenkins";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "Sarah Jenkins";
  const companyName = user?.company || "TechCorp Solutions";

  const [search, setSearch] = useState("");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. SINGLE, CLEAN HEADER ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessments & Modules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure multi-module candidate tests combining cognitive games, problem-solving puzzles, and technical MCQs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User HR Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-bold text-slate-900">{userName}</span>
            <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/70 px-1.5 py-0.5 rounded ml-0.5">
              HR
            </span>
          </div>

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

      {/* ── 3. Cards Grid (2-Columns matching screenshot) ── */}
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
          {filteredAssessments.map((assessment) => (
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
    </div>
  );
};

export default AssessmentList;
