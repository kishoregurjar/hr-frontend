"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mailbox, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAttempts } from "@/lib/api/attempts";

const getCandidateInitials = (name) => {
  const str = String(name || "Candidate").trim();
  const parts = str.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

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
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-6 font-sans transition-shadow duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Recent Assessment Results
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Highest scoring candidates evaluated across modules
          </p>
        </div>
        <Link
          href="/results"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer border border-indigo-200/60 hover:shadow-xs"
        >
          <span>View full leaderboard</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/80 bg-slate-50/60">
            <tr>
              <th className="py-3 px-4 rounded-l-2xl">NO.</th>
              <th className="py-3 px-4">CANDIDATE</th>
              <th className="py-3 px-4">ASSESSMENT</th>
              <th className="py-3 px-4">SCORE</th>
              <th className="py-3 px-4">TIME</th>
              <th className="py-3 px-4 text-right rounded-r-2xl">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {submittedAttempts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-1 shadow-xs">
                      <Mailbox className="h-8 w-8 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-bold text-slate-800">No test results submitted yet</p>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
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
                  <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Rank */}
                    <td className="py-4 px-4 font-extrabold text-sm sm:text-base text-slate-900">
                      {globalRank}
                    </td>

                    {/* Candidate with Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {getCandidateInitials(row.candidateName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm sm:text-[15px] text-slate-900 truncate leading-tight">
                            {row.candidateName || "Candidate"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {row.candidateEmail || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Assessment Title */}
                    <td className="py-4 px-4">
                      <p
                        className="text-xs sm:text-sm font-semibold text-slate-700 max-w-[200px] truncate"
                        title={row.assessmentTitle || "Assessment"}
                      >
                        {row.assessmentTitle || "Assessment"}
                      </p>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center text-sm sm:text-base font-black text-emerald-600">
                        {row.score !== null ? `${row.score}%` : "—"}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-4">
                      <span className="text-xs sm:text-sm font-bold text-slate-600">
                        {timeText}
                      </span>
                    </td>

                    {/* Status Pill with Dot */}
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300/80 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{String(row.status || "SUBMITTED").toUpperCase()}</span>
                      </span>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-extrabold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-extrabold text-slate-800">{endIndex}</span> of{" "}
              <span className="font-extrabold text-slate-800">{submittedAttempts.length}</span> candidates
            </span>
            <div className="hidden sm:flex items-center gap-2 ml-3 border-l border-slate-200 pl-3">
              <span className="text-xs text-slate-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-hidden cursor-pointer"
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
                className="h-9 px-3 rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" />
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
                      className={`h-9 w-9 p-0 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-600/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs font-bold"
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
                className="h-9 px-3 rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentResultsTable;
