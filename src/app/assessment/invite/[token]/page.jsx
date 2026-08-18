import AssessmentInvitation from "@/features/assessment/pages/AssessmentInvitation";

const InvitationPage = async ({ params }) => {
  const { token } = await params;

  return <AssessmentInvitation token={token} />;
};

export default InvitationPage;
