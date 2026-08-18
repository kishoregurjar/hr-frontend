export const RESULT_QUERY_KEYS = {
  all: ["results"],

  assessment: (assessmentId) => [
    "results",
    "assessment",
    String(assessmentId),
  ],

  summary: (assessmentId) => [
    "results",
    "assessment",
    String(assessmentId),
    "summary",
  ],

  detail: (assessmentId, resultId) => [
    "results",
    "assessment",
    String(assessmentId),
    "detail",
    String(resultId),
  ],
};
