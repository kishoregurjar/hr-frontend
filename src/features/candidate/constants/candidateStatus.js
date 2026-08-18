export const CANDIDATE_STATUS = {
  NEW: "New",
  INVITED: "Invited",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
};

export const CANDIDATE_STATUS_OPTIONS = [
  {
    label: "All Status",
    value: "all",
  },
  {
    label: "New",
    value: CANDIDATE_STATUS.NEW,
  },
  {
    label: "Invited",
    value: CANDIDATE_STATUS.INVITED,
  },
  {
    label: "In Progress",
    value: CANDIDATE_STATUS.IN_PROGRESS,
  },
  {
    label: "Completed",
    value: CANDIDATE_STATUS.COMPLETED,
  },
  {
    label: "Shortlisted",
    value: CANDIDATE_STATUS.SHORTLISTED,
  },
  {
    label: "Rejected",
    value: CANDIDATE_STATUS.REJECTED,
  },
];
