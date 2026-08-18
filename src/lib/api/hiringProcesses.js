const hiringProcesses = [
  {
    id: "hiring-1",
    title: "Frontend Developer Hiring",
    position: "Frontend Developer",
    status: "Active",
    createdAt: "2026-07-20T09:00:00.000Z",
    rounds: [
      {
        id: "round-1",
        order: 1,
        title: "Screening Assessment",
        type: "assessment",
        assessmentId: "ass-001",
        status: "Active",
      },
      {
        id: "round-2",
        order: 2,
        title: "Technical Assessment",
        type: "assessment",
        assessmentId: "ass-002",
        status: "Pending",
      },
      {
        id: "round-3",
        order: 3,
        title: "Technical Interview",
        type: "interview",
        status: "Pending",
      },
    ],
  },
];

const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getHiringProcessById = async (hiringProcessId) => {
  await delay(400);

  const process = hiringProcesses.find(
    (item) => String(item.id) === String(hiringProcessId)
  );

  if (!process) {
    throw new Error("Hiring process not found.");
  }

  return {
    ...process,
    rounds: process.rounds.map((round) => ({ ...round })),
  };
};

export const activateNextRound = async ({
  hiringProcessId,
  currentRoundId,
  nextRoundId,
}) => {
  await delay(300);

  const processIndex = hiringProcesses.findIndex(
    (process) => String(process.id) === String(hiringProcessId)
  );

  if (processIndex === -1) {
    throw new Error("Hiring process not found.");
  }

  const process = hiringProcesses[processIndex];

  hiringProcesses[processIndex] = {
    ...process,
    rounds: process.rounds.map((round) => {
      if (String(round.id) === String(currentRoundId)) {
        return {
          ...round,
          status: "Completed",
        };
      }

      if (String(round.id) === String(nextRoundId)) {
        return {
          ...round,
          status: "Active",
        };
      }

      return round;
    }),
  };

  return { ...hiringProcesses[processIndex] };
};
