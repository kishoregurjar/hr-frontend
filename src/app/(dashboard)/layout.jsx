import { DashboardLayout } from "@/components/layout";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";

export default function Layout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
