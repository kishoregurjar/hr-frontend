export const QUESTION_QUERY_KEYS = {
  all: ["questions"],
  lists: () => [
    ...QUESTION_QUERY_KEYS.all,
    "list",
  ],
  detail: (id) => [
    ...QUESTION_QUERY_KEYS.all,
    "detail",
    id,
  ],
};
