import { Suspense } from "react";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";

export const metadata = {
  title: "Reset Password - HireQuest",
  description: "Reset your HireQuest password.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
