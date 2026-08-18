import { EditAssessment } from "@/features/assessment";

const EditAssessmentPage = async ({ params }) => {
  const { id } = await params;

  return <EditAssessment assessmentId={id} />;
};

export default EditAssessmentPage;
