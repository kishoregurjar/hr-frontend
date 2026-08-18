import { AssessmentDetailsPage } from "@/features/assessment";

const AssessmentPage = async ({ params }) => {
  const { id } = await params;

  return <AssessmentDetailsPage assessmentId={id} />;
};

export default AssessmentPage;
