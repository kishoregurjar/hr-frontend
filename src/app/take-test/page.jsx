import { Suspense } from "react";
import AssessmentInvitation from "@/features/assessment/pages/AssessmentInvitation";

const TakeTestContent = async ({ searchParams }) => {
  const params = await searchParams;
  const token = params?.token || "";

  return <AssessmentInvitation token={token} />;
};

const TakeTestPage = (props) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Verifying candidate test invitation...
          </p>
        </div>
      }
    >
      <TakeTestContent {...props} />
    </Suspense>
  );
};

export default TakeTestPage;
