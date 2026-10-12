"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAttempts } from "@/lib/api/attempts";

const RecentResultsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: attempts = [] } = useQuery({
    queryKey: ["attempts", "recent"],
    queryFn: () => getAttempts(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const submittedAttempts = useMemo(() => {
    return (attempts || []).filter(
      (a) =>
        String(a.status).toUpperCase() === "COMPLETED" ||
        String(a.status).toUpperCase() === "SUBMITTED"
    );
  }, [attempts]);

  const totalPages = Math.max(1, Math.ceil(submittedAttempts.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedAttempts = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return submittedAttempts.slice(start, start + pageSize);
  }, [submittedAttempts, validPage, pageSize]);

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, submittedAttempts.length);

  // Helper for generating page numbers with smart ellipsis
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

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Recent Assessment Results
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Highest scoring candidates evaluated across modules
          </p>
        </div>
        <Link
          href="/results"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
        >
          View Full Leaderboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b pb-2">
            <tr>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Candidate</th>
              <th className="py-2.5 px-3">Assessment</th>
              <th className="py-2.5 px-3">Score</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-800 font-medium">
            {submittedAttempts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <Inbox className="h-7 w-7 text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">No test results submitted yet</p>
                    <p className="text-[11px] text-slate-400">
                      When invited candidates take tests, their evaluated scores will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAttempts.map((row, idx) => {
                const globalRank = startIndex + idx + 1;
                const minutes =
                  row.durationMinutes ||
                  (row.timeTaken ? Math.round(row.timeTaken / 60) : null) ||
                  (row.startedAt && row.submittedAt
                    ? Math.max(1, Math.round((new Date(row.submittedAt).getTime() - new Date(row.startedAt).getTime()) / 60000))
                    : null);
                const timeText = minutes ? `${minutes}m` : row.timeSpent || "24m";

                return (
                  <tr key={row.id || idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      #{globalRank}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{row.candidateName || "Candidate"}</p>
                      <p className="text-[11px] text-muted-foreground">{row.candidateEmail || "email"}</p>
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground max-w-[180px] truncate">
                      {row.assessmentTitle || "Assessment"}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-emerald-600">
                        {row.score !== null ? `${row.score}%` : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground font-bold">
                      {timeText}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5"
                      >
                        {row.status || "Completed"}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {submittedAttempts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-xs">
            <span>
              Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
              <span className="font-bold text-slate-800">{submittedAttempts.length}</span> candidates
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
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
    </div>
  );
};

export default RecentResultsTable;
