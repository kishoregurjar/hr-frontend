import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "Super Admin Console — Minders World & HireQuest",
  description: "Platform Master Management for Companies, Global Games Engine, and Analytics.",
};

export default function AdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {/* Super Admin Sidebar */}
        <AdminSidebar />

        {/* Main Admin Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {children}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
