import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Super Admin Console — Minders World & HireQuest",
  description: "Platform Master Management for Companies, Global Games Engine, and Analytics.",
};

export default function AdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AdminAuthGuard>
  );
}
