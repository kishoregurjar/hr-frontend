let candidates = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 9876543210",
    status: "Invited",
    createdAt: "2026-07-27T10:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "+91 9876543211",
    status: "Completed",
    createdAt: "2026-07-26T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit@example.com",
    phone: "+91 9876543212",
    status: "Shortlisted",
    createdAt: "2026-07-25T10:00:00.000Z",
    updatedAt: "2026-07-25T10:00:00.000Z",
  },
];

const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getCandidates = async () => {
  await delay();

  return [...candidates];
};

export const getCandidateById = async (id) => {
  await delay();

  const candidate = candidates.find(
    (item) => String(item.id) === String(id)
  );

  if (!candidate) {
    throw new Error("Candidate not found.");
  }

  return { ...candidate };
};

export const createCandidate = async (payload) => {
  await delay();

  const emailExists = candidates.some(
    (candidate) =>
      candidate.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (emailExists) {
    throw new Error("A candidate with this email already exists.");
  }

  const candidate = {
    id: Date.now(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || "",
    status: "New",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  candidates = [candidate, ...candidates];

  return candidate;
};

export const updateCandidate = async (id, payload) => {
  await delay();

  const index = candidates.findIndex(
    (candidate) => String(candidate.id) === String(id)
  );

  if (index === -1) {
    throw new Error("Candidate not found.");
  }

  const emailExists = candidates.some(
    (candidate) =>
      String(candidate.id) !== String(id) &&
      candidate.email.toLowerCase() === payload.email.trim().toLowerCase()
  );

  if (emailExists) {
    throw new Error("A candidate with this email already exists.");
  }

  const updatedCandidate = {
    ...candidates[index],
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || "",
    updatedAt: new Date().toISOString(),
  };

  candidates[index] = updatedCandidate;

  return { ...updatedCandidate };
};

export const importCandidates = async (importedCandidates) => {
  await delay(700);

  const existingEmails = new Set(
    candidates.map((candidate) => candidate.email.toLowerCase())
  );

  const incomingEmails = new Set();

  for (const candidate of importedCandidates) {
    const email = candidate.email.trim().toLowerCase();

    if (existingEmails.has(email) || incomingEmails.has(email)) {
      throw new Error(`Duplicate candidate email: ${email}`);
    }

    incomingEmails.add(email);
  }

  const now = new Date().toISOString();

  const createdCandidates = importedCandidates.map((candidate, index) => ({
    id: Date.now() + index,
    name: candidate.name.trim(),
    email: candidate.email.trim().toLowerCase(),
    phone: candidate.phone?.trim() || "",
    status: "New",
    createdAt: now,
    updatedAt: now,
  }));

  candidates = [...createdCandidates, ...candidates];

  return createdCandidates;
};
