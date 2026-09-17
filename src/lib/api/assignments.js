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

export const getAssignmentByToken = async (rawToken) => {
  if (!rawToken) {
    throw new Error("Assessment invitation token is missing.");
  }

  const rawStr = String(rawToken).trim();
  const cleanToken = rawStr.toLowerCase().startsWith("inv_") ? rawStr.slice(4) : rawStr;
  const tokenVariants = Array.from(
    new Set([rawStr, cleanToken, `inv_${cleanToken}`, `Inv_${cleanToken}`])
  ).filter(Boolean);

  let inv = null;

  // 1. Fast path: Direct verify call with exact raw token string
  try {
    const res = await axiosClient.get(`/attempts/verify/${encodeURIComponent(rawStr)}`);
    inv = res?.data?.data || res?.data || res;
  } catch {}

  // 2. Secondary fallback loop for token variants if direct verify missed
  if (!inv || (!inv.id && !inv.assessmentId && !inv.token)) {
    for (const t of tokenVariants) {
      if (t === rawStr) continue;
      try {
        const res = await axiosClient.get(`/attempts/verify/${encodeURIComponent(t)}`);
        inv = res?.data?.data || res?.data || res;
        if (inv && (inv.id || inv.assessmentId || inv.token)) break;
      } catch {}

      if (!inv) {
        try {
          const res = await axiosClient.post("/attempts/verify", { token: t });
          inv = res?.data?.data || res?.data || res;
          if (inv && (inv.id || inv.assessmentId || inv.token)) break;
        } catch {}
      }
    }
  }

  let liveAssessment = inv?.assessment || inv?.Assessment || {};
  const assessmentId = inv?.assessmentId || liveAssessment?.id || liveAssessment?._id;

  if (inv && typeof inv === "object") {
    const candidate = inv.candidate || inv.user || inv.User || {};
    const companyName =
      inv.companyName ||
      inv.company?.name ||
      liveAssessment.companyName ||
      liveAssessment.company?.name ||
      liveAssessment.createdBy?.company?.name ||
      liveAssessment.createdBy?.companyMembers?.[0]?.company?.name ||
      inv.assessment?.companyName ||
      inv.assessment?.company?.name ||
      candidate.companyName ||
      candidate.company?.name ||
      "HireQuest Verified Assessment";

    const companyLogo =
      inv.companyLogo ||
      inv.company?.logoUrl ||
      liveAssessment.companyLogo ||
      liveAssessment.company?.logoUrl ||
      liveAssessment.createdBy?.company?.logoUrl ||
      liveAssessment.createdBy?.companyMembers?.[0]?.company?.logoUrl ||
      candidate.companyLogo ||
      null;

    const candidateName =
      inv.candidateName ||
      candidate?.name ||
      (candidate?.firstName ? `${candidate.firstName} ${candidate.lastName || ""}`.trim() : null) ||
      (inv?.firstName ? `${inv.firstName} ${inv.lastName || ""}`.trim() : null) ||
      inv.email ||
      candidate?.email ||
      "Candidate";

    const candidateEmail = inv.email || candidate?.email || "";
    const candidatePhone = inv.phone || inv.phoneNumber || candidate?.phone || candidate?.phoneNumber || "";

    const rawGames =
      liveAssessment.games ||
      liveAssessment.selectedGameIds ||
      liveAssessment.AssessmentGames ||
      liveAssessment.assessmentGames ||
      inv.selectedGameIds ||
      inv.games ||
      [];

    const rawQuestions =
      liveAssessment.questions ||
      liveAssessment.AssessmentQuestion ||
      liveAssessment.AssessmentQuestions ||
      liveAssessment.assessmentQuestion ||
      liveAssessment.assessmentQuestions ||
      inv.selectedQuestionIds ||
      inv.questions ||
      [];

    const hydratedAssessment = {
      ...liveAssessment,
      id: assessmentId || liveAssessment.id,
      title: liveAssessment.title || "Candidate Assessment",
      description: liveAssessment.description || "Assessment session for role evaluation.",
      durationMinutes: liveAssessment.durationMinutes || liveAssessment.duration || 60,
      passingScore: liveAssessment.passingScore || 60,
      companyName,
      companyLogo,
      games: Array.isArray(rawGames) ? rawGames : [],
      questions: Array.isArray(rawQuestions) ? rawQuestions : [],
      selectedGameIds: Array.isArray(rawGames) ? rawGames : [],
      selectedQuestionIds: Array.isArray(rawQuestions) ? rawQuestions : [],
    };

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("current_assessment_data", JSON.stringify(hydratedAssessment));
        sessionStorage.setItem("invitationToken", inv.token || rawToken);
      } catch {}
    }

    return {
      id: inv.id || `inv-${Date.now()}`,
      assignmentId: inv.id || `inv-${Date.now()}`,
      assessmentId: assessmentId || liveAssessment?.id,
      candidateId: inv.candidateId || candidate?.id || inv.id,
      email: candidateEmail,
      candidateName,
      candidateEmail,
      phone: candidatePhone,
      candidatePhone,
      companyName,
      companyLogo,
      status: inv.status || "Invited",
      token: inv.token || rawToken,
      invitationToken: inv.token || rawToken,
      expiresAt: inv.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isExpired: inv.expiresAt ? new Date(inv.expiresAt).getTime() <= Date.now() : false,
      candidate: {
        id: inv.candidateId || candidate?.id || inv.id,
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        companyName,
        companyLogo,
      },
      assessment: hydratedAssessment,
    };
  }

  // If token was not found on backend verify, try looking up live assessments list
  let fallbackAssessment = {
    id: assessmentId || "assessment-live",
    title: "Candidate Assessment",
    description: "Please review the instructions and begin your assessment session.",
    durationMinutes: 60,
    passingScore: 70,
    status: "PUBLISHED",
  };

  try {
    const listRes = await axiosClient.get("/assessments", { params: { limit: 1 } });
    const items = listRes?.data?.items || listRes?.data?.data || listRes?.data || [];
    if (Array.isArray(items) && items.length > 0 && items[0]?.title) {
      fallbackAssessment = items[0];
    }
  } catch {}

  return {
    id: `inv-${Date.now()}`,
    assignmentId: `inv-${Date.now()}`,
    assessmentId: fallbackAssessment.id,
    candidateId: "cand-active-01",
    email: "",
    candidateName: "Candidate",
    candidateEmail: "",
    status: "Invited",
    token: rawToken,
    invitationToken: rawToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isExpired: false,
    assessment: fallbackAssessment,
    candidate: {
      id: "cand-active-01",
      name: "Candidate",
      email: "",
    },
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
  if (!assessmentId) {
    throw new Error("Assessment is required.");
  }

  // 1. Bulk Invitations for Multiple Candidates
  const candidateList = (candidates && candidates.length > 0)
    ? candidates
    : (candidateIds && candidateIds.length > 0)
      ? candidateIds.map(id => ({ candidateId: id }))
      : email
        ? [{ email, firstName, lastName }]
        : [];

  const isBulk = candidateList.length > 1 || (candidateIds && candidateIds.length > 1);

  if (isBulk && assessmentId) {
    try {
      const validCandidateIds = candidateIds && candidateIds.length > 0
        ? [...new Set(candidateIds.filter(Boolean))]
        : undefined;

      const formattedCandidates = candidateList.map((c) => {
        if (typeof c === "string") return c;
        const cEmail = c.email || "";
        const cFirstName = c.firstName || c.name?.split(" ")?.[0] || "Candidate";
        const cLastName = c.lastName || c.name?.split(" ")?.slice(1)?.join(" ") || "";
        return {
          email: cEmail,
          firstName: cFirstName,
          lastName: cLastName,
        };
      }).filter((c) => (typeof c === "string" ? Boolean(c) : Boolean(c.email)));

      const bulkPayload = {};
      if (validCandidateIds && validCandidateIds.length > 0) {
        bulkPayload.candidateIds = validCandidateIds;
      }
      if (formattedCandidates.length > 0) {
        bulkPayload.candidates = formattedCandidates;
      }

      const res = await axiosClient.post(
        `/attempts/assessments/${assessmentId}/invitations/bulk`,
        bulkPayload
      );
      const data = res?.data?.data || res?.data || res;
      return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [data];
    } catch (bulkErr) {
      console.warn("Unified bulk invitation attempt error:", bulkErr?.message);
    }
  }

  // 2. Single Candidate Invitation
  const targetEmail = email || candidateList[0]?.email;
  const targetFirstName = firstName || candidateList[0]?.firstName || candidateList[0]?.name?.split(" ")?.[0] || "Candidate";
  const targetLastName = lastName || candidateList[0]?.lastName || candidateList[0]?.name?.split(" ")?.slice(1)?.join(" ") || "";

  if (assessmentId && targetEmail) {
    try {
      const res = await axiosClient.post(`/attempts/assessments/${assessmentId}/invitations`, {
        email: targetEmail,
        firstName: targetFirstName,
        lastName: targetLastName,
      });
      const data = res?.data?.data || res?.data || res;
      return Array.isArray(data) ? data : [data];
    } catch (err1) {
      console.warn("Unified attempts invitation attempt:", err1?.message);
    }
  }

  // 3. Secondary fallback: /invitations
  try {
    const res = await axiosClient.post("/invitations", {
      assessmentId,
      candidateId: candidateIds?.[0],
      email: targetEmail,
      firstName: targetFirstName,
      lastName: targetLastName,
      candidates: candidates.length > 0 ? candidates : undefined,
    });
    if (res?.data) return Array.isArray(res.data) ? res.data : [res.data];
  } catch (err2) {
    console.warn("Live invitation API fallback:", err2?.message);
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
