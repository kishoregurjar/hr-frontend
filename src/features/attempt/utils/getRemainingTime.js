export const getRemainingTime = ({
  startedAt,
  durationMinutes,
  now = Date.now(),
}) => {
  if (!startedAt || !durationMinutes) {
    return 0;
  }

  const startedTime = new Date(startedAt).getTime();
  const durationMs = durationMinutes * 60 * 1000;
  const endTime = startedTime + durationMs;
  const remainingMs = Math.max(0, endTime - now);

  return Math.ceil(remainingMs / 1000);
};
