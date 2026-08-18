const pipelineCandidates = [
  {
    id: "pipeline-candidate-1",
    hiringProcessId: "hiring-1",
    candidateId: "cand-1",
    candidate: {
      id: "cand-1",
      name: "Rahul Sharma",
      email: "rahul@example.com",
    },
    currentRoundId: "round-1",
    status: "Active",
    rounds: [
      {
        roundId: "round-1",
        status: "Completed",
        resultId: "result-1",
        decision: "Shortlisted",
        enteredAt: "2026-07-25T09:00:00.000Z",
        completedAt: "2026-07-28T10:42:00.000Z",
      },
    ],
  },
  {
    id: "pipeline-candidate-2",
    hiringProcessId: "hiring-1",
    candidateId: "cand-2",
    candidate: {
      id: "cand-2",
      name: "Priya Patel",
      email: "priya@example.com",
    },
    currentRoundId: "round-1",
    status: "Active",
    rounds: [
      {
        roundId: "round-1",
        status: "Completed",
        resultId: "result-2",
        decision: "Shortlisted",
        enteredAt: "2026-07-25T09:00:00.000Z",
        completedAt: "2026-07-28T11:38:00.000Z",
      },
    ],
  },
  {
    id: "pipeline-candidate-3",
    hiringProcessId: "hiring-1",
    candidateId: "cand-3",
    candidate: {
      id: "cand-3",
      name: "Aman Verma",
      email: "aman@example.com",
    },
    currentRoundId: "round-1",
    status: "Active",
    rounds: [
      {
        roundId: "round-1",
        status: "Completed",
        resultId: "result-3",
        decision: "Pending",
        enteredAt: "2026-07-25T09:00:00.000Z",
        completedAt: "2026-07-28T12:45:00.000Z",
      },
    ],
  },
  {
    id: "pipeline-candidate-4",
    hiringProcessId: "hiring-1",
    candidateId: "cand-4",
    candidate: {
      id: "cand-4",
      name: "Neha Singh",
      email: "neha@example.com",
    },
    currentRoundId: "round-1",
    status: "Active",
    rounds: [
      {
        roundId: "round-1",
        status: "Completed",
        resultId: "result-4",
        decision: "Rejected",
        enteredAt: "2026-07-25T09:00:00.000Z",
        completedAt: "2026-07-28T14:50:00.000Z",
      },
    ],
  },
];

const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getPipelineCandidates = async (hiringProcessId) => {
  await delay(500);

  const matched = pipelineCandidates.filter(
    (item) => String(item.hiringProcessId) === String(hiringProcessId)
  );

  return (matched.length > 0 ? matched : pipelineCandidates).map((item) => ({
    ...item,
    candidate: { ...item.candidate },
    rounds: item.rounds.map((round) => ({ ...round })),
  }));
};

export const moveCandidatesToRound = async ({
  hiringProcessId,
  candidateIds,
  targetRoundId,
}) => {
  await delay(600);

  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    throw new Error("Select at least one candidate.");
  }

  const processCandidates = pipelineCandidates.filter(
    (item) => String(item.hiringProcessId) === String(hiringProcessId)
  );

  const selectedCandidates = candidateIds.map((candidateId) =>
    processCandidates.find(
      (item) => String(item.candidateId) === String(candidateId)
    )
  );

  if (selectedCandidates.some((candidate) => !candidate)) {
    throw new Error("One or more candidates were not found.");
  }

  const invalidCandidate = selectedCandidates.find((candidate) => {
    const currentRound = candidate.rounds.find(
      (round) => String(round.roundId) === String(candidate.currentRoundId)
    );

    return (
      !currentRound ||
      currentRound.status !== "Completed" ||
      currentRound.decision !== "Shortlisted"
    );
  });

  if (invalidCandidate) {
    throw new Error(
      "Only shortlisted candidates from a completed round can move forward."
    );
  }

  const alreadyInRound = selectedCandidates.some((candidate) =>
    candidate.rounds.some(
      (round) => String(round.roundId) === String(targetRoundId)
    )
  );

  if (alreadyInRound) {
    throw new Error(
      "One or more candidates are already in the target round."
    );
  }

  const now = new Date().toISOString();

  const updatedCandidates = selectedCandidates.map((candidate) => {
    const index = pipelineCandidates.findIndex(
      (item) => String(item.id) === String(candidate.id)
    );

    const nextRound = {
      roundId: targetRoundId,
      status: "Invited",
      assignmentId: null,
      decision: "Pending",
      enteredAt: now,
      completedAt: null,
    };

    pipelineCandidates[index] = {
      ...pipelineCandidates[index],
      currentRoundId: targetRoundId,
      rounds: [...pipelineCandidates[index].rounds, nextRound],
    };

    return { ...pipelineCandidates[index] };
  });

  return updatedCandidates;
};

export const attachAssignmentToCandidateRound = async ({
  hiringProcessId,
  candidateId,
  roundId,
  assignmentId,
}) => {
  const candidateIndex = pipelineCandidates.findIndex(
    (item) =>
      String(item.hiringProcessId) === String(hiringProcessId) &&
      String(item.candidateId) === String(candidateId)
  );

  if (candidateIndex === -1) {
    throw new Error("Pipeline candidate not found.");
  }

  const candidate = pipelineCandidates[candidateIndex];

  pipelineCandidates[candidateIndex] = {
    ...candidate,
    rounds: candidate.rounds.map((round) =>
      String(round.roundId) === String(roundId)
        ? { ...round, assignmentId }
        : round
    ),
  };

  return { ...pipelineCandidates[candidateIndex] };
};

export const updateCandidateRoundStatus = async ({
  hiringProcessId,
  candidateId,
  roundId,
  status,
  resultId,
}) => {
  const candidateIndex = pipelineCandidates.findIndex(
    (item) =>
      String(item.hiringProcessId) === String(hiringProcessId) &&
      String(item.candidateId) === String(candidateId)
  );

  if (candidateIndex === -1) {
    throw new Error("Pipeline candidate not found.");
  }

  const candidate = pipelineCandidates[candidateIndex];

  pipelineCandidates[candidateIndex] = {
    ...candidate,
    rounds: candidate.rounds.map((round) => {
      if (String(round.roundId) !== String(roundId)) {
        return round;
      }

      return {
        ...round,
        status,
        ...(resultId ? { resultId } : {}),
        ...(status === "Completed" ? { completedAt: new Date().toISOString() } : {}),
      };
    }),
  };

  return { ...pipelineCandidates[candidateIndex] };
};
