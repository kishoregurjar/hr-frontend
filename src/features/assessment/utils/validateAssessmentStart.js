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

  const isPublished =
    assessment.status === "Published" ||
    assessment.status === "published" ||
    assessment.status === "Active";

  if (!isPublished) {
    return {
      valid: false,
      reason: "NOT_AVAILABLE",
      message: "This assessment is not currently available for attempts.",
    };
  }

  const items =
    assessment.items ??
    assessment.questions ??
    assessment.sections ??
    [];

  if (!Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      reason: "NO_ITEMS",
      message: "This assessment does not contain any questions or test items.",
    };
  }

  const duration =
    assessment.durationMinutes ??
    assessment.timeLimit ??
    assessment.duration ??
    0;

  if (!duration || Number(duration) <= 0) {
    return {
      valid: false,
      reason: "INVALID_DURATION",
      message: "Assessment duration configuration is invalid.",
    };
  }

  return {
    valid: true,
    reason: null,
    message: null,
  };
};
