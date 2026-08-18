import { AssessmentResults } from "@/features/result/pages";

const AssessmentResultsPage = async ({ params }) => {
  const { id } = await params;

  return <AssessmentResults assessmentId={id} />;
};

export default AssessmentResultsPage;
