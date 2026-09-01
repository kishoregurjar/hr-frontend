import axiosClient from "./axiosClient";
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
  try {
    const res = await axiosClient.get(`/invitations/verify/${token}`);
    const inv = res?.data?.data || res?.data || res;
    if (inv && (inv.token === token || inv.id || inv.assessmentId)) {
      const assessment = inv.assessment || {};
      return {
        id: inv.id,
        assignmentId: inv.id,
        assessmentId: inv.assessmentId,
        candidateId: inv.candidateId || inv.id,
        email: inv.email,
        candidateName: inv.candidateName || (inv.email ? inv.email.split("@")[0] : "Candidate"),
        candidateEmail: inv.email,
        status: "Invited",
        token: inv.token,
        invitationToken: inv.token,
        expiresAt: inv.expiresAt,
        isExpired: inv.expiresAt ? new Date(inv.expiresAt).getTime() <= Date.now() : false,
        assessment,
        candidate: {
          id: inv.candidateId || inv.id,
          name: inv.candidateName || (inv.email ? inv.email.split("@")[0] : "Candidate"),
          email: inv.email,
        },
      };
    }
  } catch (err) {
    console.warn("Verify invitation API fallback:", err.message);
  }

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
  const assignment = await getAssignmentByToken(token);

  if (assignment.status === "Completed") {
    throw new Error("This assessment has already been completed.");
  }

  if (assignment.isExpired) {
    throw new Error("This assessment invitation has expired.");
  }

  const updated = {
    ...assignment,
    status: "In Progress",
    startedAt: assignment.startedAt || new Date().toISOString(),
  };

  const index = assignments.findIndex(
    (item) => item.token === token || item.invitationToken === token
  );
  if (index >= 0) {
    assignments[index] = updated;
  } else {
    assignments.push(updated);
  }

  return updated;
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

export const assignAssessment = async ({ assessmentId, candidateIds, email, firstName, lastName, candidates = [] }) => {
  try {
    const res = await axiosClient.post("/invitations", {
      assessmentId,
      candidateId: candidateIds?.[0],
      email: email || candidates?.[0]?.email,
      firstName: firstName || candidates?.[0]?.name?.split(" ")?.[0] || candidates?.[0]?.firstName,
      lastName: lastName || candidates?.[0]?.name?.split(" ")?.slice(1)?.join(" ") || candidates?.[0]?.lastName,
      candidates: candidates.length > 0 ? candidates : undefined,
    });
    if (res?.data) return Array.isArray(res.data) ? res.data : [res.data];
  } catch (err) {
    console.warn("Live invitation API fallback:", err.message);
  }

  await delay(500);

  if (!assessmentId) {
    throw new Error("Assessment is required.");
  }

  if (!candidateIds || candidateIds.length === 0) {
    throw new Error("Select at least one candidate.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const createdAssignments = [];

  candidateIds.forEach((candidateId) => {
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
      status: "Invited",
      assignedAt: now.toISOString(),
      token,
      invitationToken: token,
      invitedAt: now.toISOString(),
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
