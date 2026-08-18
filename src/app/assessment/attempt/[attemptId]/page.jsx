import AssessmentAttempt from "@/features/assessment/pages/AssessmentRuntime";

const AssessmentAttemptPage = async ({ params }) => {
  const { attemptId } = await params;

  return <AssessmentAttempt attemptId={attemptId} />;
};

export default AssessmentAttemptPage;
