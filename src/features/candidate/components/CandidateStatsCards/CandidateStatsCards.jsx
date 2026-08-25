"use client";

import { useMemo } from "react";
import { Mail, Send, Sparkles, UserCheck, Users } from "lucide-react";
import { StatCard } from "@/components/common";

const CandidateStatsCards = ({ candidates = [] }) => {
  const stats = useMemo(() => {
    const total = candidates.length;
    const emailIngested = candidates.filter(
      (c) => c.source === "Email Ingestion" || Boolean(c.emailSubject)
    ).length;
    const newApplicants = candidates.filter(
      (c) => String(c.status || "").toLowerCase() === "new"
    ).length;
    const invited = candidates.filter(
      (c) => String(c.status || "").toLowerCase() === "invited"
    ).length;
    const shortlisted = candidates.filter(
      (c) => String(c.status || "").toLowerCase() === "shortlisted"
    ).length;

    return {
      total,
      emailIngested,
      newApplicants,
      invited,
      shortlisted,
    };
  }, [candidates]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Applications"
        value={stats.total}
        description="All candidates in pipeline"
        icon={Users}
        color="blue"
      />

      <StatCard
        title="Email Ingested"
        value={stats.emailIngested}
        description="Parsed from HR inbox"
        icon={Mail}
        color="purple"
      />

      <StatCard
        title="New Applicants"
        value={stats.newApplicants}
        description="Awaiting HR review"
        icon={Sparkles}
        color="orange"
      />

      <StatCard
        title="Invited to Test"
        value={stats.invited}
        description="Assessment link dispatched"
        icon={Send}
        color="emerald"
      />
    </div>
  );
};

export default CandidateStatsCards;
