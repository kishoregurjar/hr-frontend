import { getAssignmentStatus } from "./getAssignmentStatus";

export const getInvitationStats = (assignments = []) => {
  return assignments.reduce(
    (stats, assignment) => {
      const status = getAssignmentStatus(assignment);

      stats.total += 1;

      if (status === "Invited" || status === "Assigned") {
        stats.invited += 1;
      } else if (status === "In Progress") {
        stats.inProgress += 1;
      } else if (status === "Completed") {
        stats.completed += 1;
      } else if (status === "Expired") {
        stats.expired += 1;
      }

      return stats;
    },
    {
      total: 0,
      invited: 0,
      inProgress: 0,
      completed: 0,
      expired: 0,
    }
  );
};
