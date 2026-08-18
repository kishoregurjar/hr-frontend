export const ASSESSMENT_QUERY_KEYS = {
  all: ["assessments"],

  lists: () => [
    ...ASSESSMENT_QUERY_KEYS.all,
    "list",
  ],

  detail: (id) => [
    ...ASSESSMENT_QUERY_KEYS.all,
    "detail",
    id,
  ],
};
