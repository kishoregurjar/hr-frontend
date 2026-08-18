import {
  Archive,
  ClipboardList,
  FileEdit,
  Send,
} from "lucide-react";

import DashboardStatCard from "../DashboardStatCard";

const AssessmentStats = ({ stats }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        title="Total Assessments"
        value={stats.total}
        icon={ClipboardList}
      />

      <DashboardStatCard
        title="Published"
        value={stats.published}
        icon={Send}
      />

      <DashboardStatCard
        title="Draft"
        value={stats.draft}
        icon={FileEdit}
      />

      <DashboardStatCard
        title="Archived"
        value={stats.archived}
        icon={Archive}
      />
    </div>
  );
};

export default AssessmentStats;
