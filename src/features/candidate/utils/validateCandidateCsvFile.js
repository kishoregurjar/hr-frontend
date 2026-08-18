const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateCandidateCsvFile = (file) => {
  if (!file) {
    return "Select a CSV file.";
  }

  const isCsv = file.name.toLowerCase().endsWith(".csv");

  if (!isCsv) {
    return "Only CSV files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "CSV file cannot exceed 5 MB.";
  }

  return null;
};
