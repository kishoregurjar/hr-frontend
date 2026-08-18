"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import InvitationActions from "../InvitationActions";
import InvitationStatusBadge from "../InvitationStatusBadge";
import { getAssignmentPath, getAssignmentStatus, getInvitationStats } from "../../utils";

const RoundInvitations = ({
  assignments = [],
  candidates = [],
  onResend,
  resendingId,
}) => {
  const candidateMap = useMemo(
    () =>
      new Map(
        candidates.map((item) => [item.candidateId || item.id, item.candidate || item])
      ),
    [candidates]
  );

  const stats = useMemo(() => getInvitationStats(assignments), [assignments]);

  if (!assignments || assignments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
        <h3 className="font-semibold text-foreground">No round invitations</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Invitations will appear here when candidates enter an assessment round.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Invited</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.invited}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Expired</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{stats.expired}</p>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 text-left">Candidate</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-left">Invited At</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y text-sm">
              {assignments.map((assignment) => {
                const candidate = candidateMap.get(assignment.candidateId);
                const status = getAssignmentStatus(assignment);
                const isCompleted = status === "Completed";
                const isInProgress = status === "In Progress";
                const isResending = resendingId === assignment.id;
                const path = getAssignmentPath(assignment.token);

                return (
                  <tr
                    key={assignment.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {candidate?.name ?? "Candidate"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {candidate?.email ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <InvitationStatusBadge assignment={assignment} />
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {assignment.invitedAt
                        ? new Date(assignment.invitedAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 items-center">
                        <InvitationActions link={path} />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isCompleted || isInProgress || isResending}
                          onClick={() => onResend(assignment)}
                        >
                          <RefreshCw
                            className={`mr-1.5 h-3.5 w-3.5 ${
                              isResending ? "animate-spin" : ""
                            }`}
                          />
                          Resend
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoundInvitations;
