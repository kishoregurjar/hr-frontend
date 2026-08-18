import {
  DashboardHeader,
  StatsGrid,
  RecentAssessments,
  RecentCandidates,
  ActivityChart,
} from "@/features/dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <StatsGrid />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentCandidates />
        <ActivityChart />
      </div>

      <RecentAssessments />
    </div>
  );
}
