import { ASSIGNMENT_STATUS } from "../constants";

export const getAssignmentStatus = (assignment) => {
  if (!assignment) {
    return null;
  }

  if (assignment.status === ASSIGNMENT_STATUS.COMPLETED || assignment.status === "Completed") {
    return ASSIGNMENT_STATUS.COMPLETED;
  }

  if (assignment.status === ASSIGNMENT_STATUS.IN_PROGRESS || assignment.status === "In Progress") {
    return ASSIGNMENT_STATUS.IN_PROGRESS;
  }

  if (
    assignment.status === ASSIGNMENT_STATUS.INVITED ||
    assignment.status === "Invited" ||
    assignment.status === "Assigned"
  ) {
    if (
      assignment.expiresAt &&
      new Date(assignment.expiresAt).getTime() <= Date.now()
    ) {
      return ASSIGNMENT_STATUS.EXPIRED;
    }
  }

  return assignment.status;
};
