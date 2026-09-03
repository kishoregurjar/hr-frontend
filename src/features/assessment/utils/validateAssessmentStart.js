export const validateAssessmentStart = ({ assignment, assessment }) => {
  if (!assignment) {
    return {
      valid: false,
      reason: "INVALID_ASSIGNMENT",
      message: "Assessment invitation is invalid or unavailable.",
    };
  }

  if (assignment.isExpired) {
    return {
      valid: false,
      reason: "INVITATION_EXPIRED",
      message: "Assessment invitation has expired.",
    };
  }

  if (assignment.status === "Completed") {
    return {
      valid: false,
      reason: "ALREADY_COMPLETED",
      message: "This assessment has already been completed.",
    };
  }

  if (!assessment) {
    return {
      valid: false,
      reason: "ASSESSMENT_NOT_FOUND",
      message: "Assessment could not be found.",
    };
  }

  // Permissive status check for assigned candidates
  const rawStatus = String(assessment.status || "").toUpperCase();
  const isAvailable =
    rawStatus === "PUBLISHED" ||
    rawStatus === "ACTIVE" ||
    rawStatus === "DRAFT" ||
    rawStatus === "READY" ||
    !rawStatus;

  if (!isAvailable) {
    return {
      valid: false,
      reason: "NOT_AVAILABLE",
      message: "This assessment is not currently available for attempts.",
    };
  }

  return {
    valid: true,
    reason: null,
    message: null,
  };
};
