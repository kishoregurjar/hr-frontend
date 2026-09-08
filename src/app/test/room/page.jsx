import { Suspense } from "react";
import AssessmentAttempt from "@/features/assessment/pages/AssessmentRuntime";

const TestRoomContent = async ({ searchParams }) => {
  const params = await searchParams;
  const attemptId = params?.attemptId || params?.id || "current";

  return <AssessmentAttempt attemptId={attemptId} />;
};

const TestRoomPage = (props) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Connecting to secure assessment room...
          </p>
        </div>
      }
    >
      <TestRoomContent {...props} />
    </Suspense>
  );
};

export default TestRoomPage;
