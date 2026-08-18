import { generateInvitationToken } from "@/features/candidate/utils";

let assignments = [];

const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createToken = () => {
  return crypto.randomUUID();
};

export const getAssignments = async () => {
  await delay();
  return [...assignments];
};

export const getAssignmentByToken = async (token) => {
  await delay(300);

  const assignment = assignments.find(
    (item) => item.token === token || item.invitationToken === token
  );

  if (!assignment) {
    throw new Error("Assessment invitation is invalid or no longer available.");
  }

  const expired =
    assignment.status === "Invited" &&
    assignment.expiresAt &&
    new Date(assignment.expiresAt).getTime() <= Date.now();

  return {
    ...assignment,
    isExpired: Boolean(expired),
  };
};

export const createAssignment = async ({
  candidateId,
  assessmentId,
  hiringProcessId,
  roundId,
}) => {
  await delay(300);

  const existing = assignments.find(
    (assignment) =>
      String(assignment.candidateId) === String(candidateId) &&
      String(assignment.roundId) === String(roundId) &&
      String(assignment.hiringProcessId) === String(hiringProcessId)
  );

  if (existing) {
    return { ...existing };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const token = createToken();

  const assignment = {
    id: crypto.randomUUID(),
    candidateId,
    assessmentId,
    hiringProcessId,
    roundId,
    status: "Invited",
    token,
    invitationToken: token,
    invitedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    startedAt: null,
    submittedAt: null,
    completedAt: null,
    resendCount: 0,
    lastResentAt: null,
  };

  assignments.push(assignment);
  return { ...assignment };
};

export const createAssignments = async ({
  candidates,
  assessmentId,
  hiringProcessId,
  roundId,
}) => {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("Candidates are required.");
  }

  const created = [];

  for (const candidate of candidates) {
    const assignment = await createAssignment({
      candidateId: candidate.candidateId,
      assessmentId,
      hiringProcessId,
      roundId,
    });

    created.push(assignment);
  }

  return created;
};

export const startAssignment = async (token) => {
  await delay(300);

  const index = assignments.findIndex(
    (item) => item.token === token || item.invitationToken === token
  );

  if (index === -1) {
    throw new Error("Assessment invitation not found.");
  }

  const assignment = assignments[index];

  if (assignment.status === "Completed") {
    throw new Error("This assessment has already been completed.");
  }

  const expired =
    assignment.status === "Invited" &&
    assignment.expiresAt &&
    new Date(assignment.expiresAt).getTime() <= Date.now();

  if (expired) {
    throw new Error("This assessment invitation has expired.");
  }

  if (assignment.status === "Invited" || assignment.status === "Assigned") {
    assignments[index] = {
      ...assignment,
      status: "In Progress",
      startedAt: assignment.startedAt || new Date().toISOString(),
    };
  }

  return { ...assignments[index] };
};

export const completeAssignment = async ({ assignmentId }) => {
  await delay(300);

  const index = assignments.findIndex(
    (item) => String(item.id) === String(assignmentId)
  );

  if (index === -1) {
    throw new Error("Assignment not found.");
  }

  assignments[index] = {
    ...assignments[index],
    status: "Completed",
    completedAt: assignments[index].completedAt ?? new Date().toISOString(),
    submittedAt: assignments[index].submittedAt ?? new Date().toISOString(),
  };

  return { ...assignments[index] };
};

export const resendAssignmentInvitation = async (assignmentId) => {
  await delay(500);

  const index = assignments.findIndex(
    (assignment) => String(assignment.id) === String(assignmentId)
  );

  if (index === -1) {
    throw new Error("Assignment not found.");
  }

  const assignment = assignments[index];

  if (assignment.status === "Completed") {
    throw new Error("Completed assessments cannot be resent.");
  }

  if (assignment.status === "In Progress") {
    throw new Error("An assessment already in progress cannot be resent.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const newToken = createToken();

  assignments[index] = {
    ...assignment,
    status: "Invited",
    token: newToken,
    invitationToken: newToken,
    invitedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    resendCount: (assignment.resendCount ?? 0) + 1,
    lastResentAt: now.toISOString(),
  };

  return { ...assignments[index] };
};

export const getRoundAssignments = async ({ hiringProcessId, roundId }) => {
  await delay(300);

  return assignments
    .filter(
      (item) =>
        String(item.hiringProcessId) === String(hiringProcessId) &&
        String(item.roundId) === String(roundId)
    )
    .map((item) => ({ ...item }));
};

export const assignAssessment = async ({ assessmentId, candidateIds }) => {
  await delay(700);

  if (!assessmentId) {
    throw new Error("Assessment is required.");
  }

  if (!candidateIds || candidateIds.length === 0) {
    throw new Error("Select at least one candidate.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const createdAssignments = [];

  candidateIds.forEach((candidateId, index) => {
    const alreadyAssigned = assignments.some(
      (assignment) =>
        String(assignment.candidateId) === String(candidateId) &&
        String(assignment.assessmentId) === String(assessmentId)
    );

    if (alreadyAssigned) return;

    const token = createToken();
    const assignment = {
      id: crypto.randomUUID(),
      candidateId,
      assessmentId,
      status: "Assigned",
      assignedAt: now.toISOString(),
      token,
      invitationToken: token,
      invitedAt: null,
      expiresAt: expiresAt.toISOString(),
      startedAt: null,
      completedAt: null,
      resendCount: 0,
      lastResentAt: null,
    };

    assignments.push(assignment);
    createdAssignments.push(assignment);
  });

  return createdAssignments;
};

export const sendInvitation = async (assignmentId) => {
  await delay(700);

  const index = assignments.findIndex(
    (assignment) => String(assignment.id) === String(assignmentId)
  );

  if (index === -1) {
    throw new Error("Assignment not found.");
  }

  const assignment = assignments[index];

  if (assignment.status === "Completed") {
    throw new Error("Completed assessment cannot be invited again.");
  }

  const invitationToken =
    assignment.token || assignment.invitationToken || generateInvitationToken();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const updatedAssignment = {
    ...assignment,
    status: "Invited",
    token: invitationToken,
    invitationToken,
    invitedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  assignments[index] = updatedAssignment;
  return { ...updatedAssignment };
};

export const sendBulkInvitations = async (assignmentIds) => {
  const results = [];
  for (const assignmentId of assignmentIds) {
    const invitation = await sendInvitation(assignmentId);
    results.push(invitation);
  }
  return results;
};

export const markAssignmentInProgress = async (assignmentId) => {
  await delay(200);

  const index = assignments.findIndex(
    (assignment) => String(assignment.id) === String(assignmentId)
  );

  if (index === -1) {
    throw new Error("Assignment not found.");
  }

  const assignment = assignments[index];

  if (assignment.status === "Completed") {
    throw new Error("This assessment has already been completed.");
  }

  assignments[index] = {
    ...assignment,
    status: "In Progress",
    startedAt: assignment.startedAt || new Date().toISOString(),
  };

  return { ...assignments[index] };
};

export const markAssignmentCompleted = async (assignmentId) => {
  await delay(200);

  const index = assignments.findIndex(
    (assignment) => String(assignment.id) === String(assignmentId)
  );

  if (index === -1) {
    throw new Error("Assignment not found.");
  }

  assignments[index] = {
    ...assignments[index],
    status: "Completed",
    completedAt: assignments[index].completedAt ?? new Date().toISOString(),
    submittedAt: assignments[index].submittedAt ?? new Date().toISOString(),
  };

  return { ...assignments[index] };
};
