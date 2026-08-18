import AssessmentInvitation from "@/features/assessment/pages/AssessmentInvitation";

const CandidateAssessmentTokenPage = async ({ params }) => {
  const { token } = await params;

  return <AssessmentInvitation token={token} />;
};

export default CandidateAssessmentTokenPage;
