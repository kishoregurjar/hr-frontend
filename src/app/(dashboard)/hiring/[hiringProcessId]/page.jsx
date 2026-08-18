import { HiringProcessDetail } from "@/features/hiring/pages";

const HiringProcessPage = async ({ params }) => {
  const { hiringProcessId } = await params;

  return <HiringProcessDetail hiringProcessId={hiringProcessId} />;
};

export default HiringProcessPage;
