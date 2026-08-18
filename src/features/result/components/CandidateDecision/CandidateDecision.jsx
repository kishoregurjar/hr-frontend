"use client";

import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecisionBadge from "../DecisionBadge";

const CandidateDecision = ({
  decision = "Pending",
  onShortlist,
  onReject,
  isUpdating = false,
}) => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hiring Decision
          </p>
          <div className="mt-2 flex items-center gap-2">
            <DecisionBadge decision={decision} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isUpdating || decision === "Rejected"}
            onClick={onReject}
          >
            <UserX className="mr-2 h-4 w-4" />
            Reject Candidate
          </Button>

          <Button
            type="button"
            disabled={isUpdating || decision === "Shortlisted"}
            onClick={onShortlist}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Shortlist Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDecision;
