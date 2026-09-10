"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, UserCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCandidatesQuery } from "@/features/candidate/hooks";
import { CandidateStatusBadge } from "@/features/candidate/components";
import { recentCandidates as fallbackCandidates } from "../data/recent-candidates";

function getInitials(name) {
  const str = String(name || "U").trim();
  if (!str) return "U";
  const parts = str.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return str.slice(0, 2).toUpperCase();
}

const RecentCandidates = () => {
  const {
    data: apiCandidates = [],
    isLoading,
  } = useCandidatesQuery();

  const candidatesList = useMemo(() => {
    if (Array.isArray(apiCandidates) && apiCandidates.length > 0) {
      return apiCandidates.slice(0, 5);
    }
    return fallbackCandidates;
  }, [apiCandidates]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Candidates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-primary" />
            Recent Candidates
          </CardTitle>

          <Link href="/candidates">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {candidatesList.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recent candidates found.
            </p>

            <Link href="/candidates">
              <Button variant="outline" size="sm" className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {candidatesList.map((candidate) => {
              const displayName =
                candidate.name ||
                (candidate.firstName
                  ? `${candidate.firstName} ${candidate.lastName || ""}`.trim()
                  : candidate.email);
              const subtitle = candidate.assessment || candidate.email || "Candidate";
              const candidateStatus = candidate.status || "New";

              return (
                <div
                  key={candidate.id}
                  className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="font-medium hover:underline block truncate text-sm"
                      >
                        {displayName}
                      </Link>

                      <p className="text-xs text-muted-foreground truncate">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {candidate.score !== undefined && candidate.score !== null && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent text-accent-foreground">
                        {candidate.score}%
                      </span>
                    )}
                    <CandidateStatusBadge status={candidateStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCandidates;

