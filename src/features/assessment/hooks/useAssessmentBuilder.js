"use client";

import { useState } from "react";

import {
  ASSESSMENT_STEPS,
  DEFAULT_ASSESSMENT,
} from "../constants";

const useAssessmentBuilder = ({
  initialAssessment = DEFAULT_ASSESSMENT,
  initialStep = 1,
} = {}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [assessment, setAssessment] = useState(initialAssessment);

  const updateAssessment = (data) => {
    setAssessment((previous) => ({
      ...previous,
      ...data,
    }));
  };

  const replaceAssessment = (newAssessment) => {
    setAssessment(newAssessment);
  };

  const nextStep = () => {
    setCurrentStep((previous) =>
      Math.min(previous + 1, ASSESSMENT_STEPS.length)
    );
  };

  const previousStep = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= ASSESSMENT_STEPS.length) {
      setCurrentStep(step);
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === ASSESSMENT_STEPS.length;

  return {
    currentStep,
    assessment,

    updateAssessment,
    replaceAssessment,

    nextStep,
    previousStep,
    goToStep,

    isFirstStep,
    isLastStep,
  };
};

export default useAssessmentBuilder;
