export const ASSIGNMENT_QUERY_KEYS = {
  all: ["assignments"],

  token: (token) => ["assignments", "token", String(token)],

  round: (hiringProcessId, roundId) => [
    "assignments",
    "round",
    String(hiringProcessId),
    String(roundId),
  ],
};
