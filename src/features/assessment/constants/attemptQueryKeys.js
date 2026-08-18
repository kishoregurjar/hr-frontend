export const ATTEMPT_QUERY_KEYS = {
  all: ["attempts"],

  detail: (attemptId) => [
    ...ATTEMPT_QUERY_KEYS.all,
    "detail",
    String(attemptId),
  ],

  assignment: (assignmentId) => [
    ...ATTEMPT_QUERY_KEYS.all,
    "assignment",
    String(assignmentId),
  ],
};
