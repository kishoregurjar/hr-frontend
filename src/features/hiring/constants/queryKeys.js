export const HIRING_QUERY_KEYS = {
  all: ["hiring-processes"],

  detail: (hiringProcessId) => [
    "hiring-processes",
    String(hiringProcessId),
  ],

  candidates: (hiringProcessId) => [
    "hiring-processes",
    String(hiringProcessId),
    "candidates",
  ],
};
