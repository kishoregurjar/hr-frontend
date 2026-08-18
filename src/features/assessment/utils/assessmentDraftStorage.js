import { ASSESSMENT_STORAGE_KEYS } from "../constants";

const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const saveAssessmentDraft = (assessment, currentStep) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      ASSESSMENT_STORAGE_KEYS.CREATE_DRAFT,
      JSON.stringify({
        assessment,
        currentStep,
        savedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Unable to save assessment draft:", error);
  }
};

export const getAssessmentDraft = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedDraft = localStorage.getItem(
      ASSESSMENT_STORAGE_KEYS.CREATE_DRAFT
    );

    if (!storedDraft) {
      return null;
    }

    const parsedDraft = JSON.parse(storedDraft);
    const savedAt = new Date(parsedDraft.savedAt).getTime();

    const isExpired = !savedAt || Date.now() - savedAt > DRAFT_MAX_AGE;

    if (isExpired) {
      clearAssessmentDraft();
      return null;
    }

    return parsedDraft;
  } catch (error) {
    console.error("Unable to read assessment draft:", error);
    clearAssessmentDraft();
    return null;
  }
};

export const clearAssessmentDraft = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(ASSESSMENT_STORAGE_KEYS.CREATE_DRAFT);
  } catch (error) {
    console.error("Unable to clear assessment draft:", error);
  }
};
