export const ASSIGNMENT_QUERY_KEYS = {
  all: ["assignments"],

  lists: () => [...ASSIGNMENT_QUERY_KEYS.all, "list"],

  candidate: (candidateId) => [
    ...ASSIGNMENT_QUERY_KEYS.all,
    "candidate",
    String(candidateId),
  ],

  assessment: (assessmentId) => [
    ...ASSIGNMENT_QUERY_KEYS.all,
    "assessment",
    String(assessmentId),
  ],
};
