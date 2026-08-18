import { Suspense } from "react";
import LoginPage from "@/features/auth/pages/LoginPage";

export const metadata = {
  title: "HR Sign In - HireQuest",
  description: "Sign in to your HireQuest HR account to manage assessments.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
