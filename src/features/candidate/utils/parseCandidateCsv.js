import Papa from "papaparse";

import {
  CANDIDATE_CSV_MAX_ROWS,
  CANDIDATE_CSV_REQUIRED_HEADERS,
} from "../constants";

export const parseCandidateCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const headers = results.meta.fields ?? [];

        const missingHeaders = CANDIDATE_CSV_REQUIRED_HEADERS.filter(
          (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          reject(
            new Error(
              `Missing required columns: ${missingHeaders.join(", ")}`
            )
          );
          return;
        }

        if (results.data.length === 0) {
          reject(new Error("CSV does not contain any candidates."));
          return;
        }

        if (results.data.length > CANDIDATE_CSV_MAX_ROWS) {
          reject(
            new Error(
              `CSV cannot contain more than ${CANDIDATE_CSV_MAX_ROWS} candidates.`
            )
          );
          return;
        }

        resolve(results.data);
      },
      error: () => {
        reject(new Error("Unable to read CSV file."));
      },
    });
  });
};
