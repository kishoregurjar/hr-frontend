export const ATTEMPT_QUERY_KEYS = {
  all: ["attempts"],

  assignment: (assignmentId) => [
    "attempts",
    "assignment",
    String(assignmentId),
  ],
};
