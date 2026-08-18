export const CANDIDATE_QUERY_KEYS = {
  all: ["candidates"],

  lists: () => [...CANDIDATE_QUERY_KEYS.all, "list"],

  detail: (id) => [...CANDIDATE_QUERY_KEYS.all, "detail", String(id)],
};
