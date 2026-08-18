export const getAssignmentPath = (token) => {
  if (!token) return "";
  return `/assessment/${token}`;
};
