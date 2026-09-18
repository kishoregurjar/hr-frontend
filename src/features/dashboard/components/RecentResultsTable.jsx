"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getAttempts } from "@/lib/api/attempts";

const RecentResultsTable = () => {
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
              <th className="py-2.5 px-3">Integrity</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-800 font-medium">
            {submittedAttempts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
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
              submittedAttempts.map((row, idx) => {
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
                    #{idx + 1}
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
                  <td className="py-3.5 px-3">
                    {row.integrity?.events?.length === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">
                        Clean
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/60">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {row.integrity?.events?.length || 0} logs
                      </span>
                    )}
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
    </div>
  );
};

export default RecentResultsTable;
