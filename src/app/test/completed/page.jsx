import AssessmentCompleted from "@/features/assessment/components/AssessmentCompleted/AssessmentCompleted";

const TestCompletedPage = () => {
  return (
    <AssessmentCompleted
      assessment={{ title: "HireQuest Assessment" }}
      attempt={{ submittedAt: new Date().toISOString() }}
    />
  );
};

export default TestCompletedPage;
