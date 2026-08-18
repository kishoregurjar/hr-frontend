import { candidateSchema } from "../validations";

export const validateCandidateCsv = (
  rows = [],
  existingCandidates = []
) => {
  const existingEmails = new Set(
    existingCandidates.map((candidate) =>
      candidate.email.trim().toLowerCase()
    )
  );

  const csvEmails = new Set();

  const valid = [];
  const invalid = [];
  const duplicates = [];

  rows.forEach((row, index) => {
    const candidate = {
      name: row.name?.trim() ?? "",
      email: row.email?.trim().toLowerCase() ?? "",
      phone: row.phone?.trim() ?? "",
    };

    const rowNumber = index + 2; // Row 1 is header

    const validation = candidateSchema.safeParse(candidate);

    if (!validation.success) {
      invalid.push({
        rowNumber,
        candidate,
        errors: validation.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const email = candidate.email;

    if (existingEmails.has(email) || csvEmails.has(email)) {
      duplicates.push({
        rowNumber,
        candidate,
      });
      return;
    }

    csvEmails.add(email);

    valid.push({
      rowNumber,
      candidate: validation.data,
    });
  });

  return {
    valid,
    invalid,
    duplicates,
  };
};
