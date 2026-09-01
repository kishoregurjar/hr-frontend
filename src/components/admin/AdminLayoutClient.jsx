"use client";

import { useState, createContext, useContext } from "react";
import AdminSidebar from "./AdminSidebar";

export const AdminNavContext = createContext({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
});

export const useAdminNav = () => useContext(AdminNavContext);

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminNavContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {/* Super Admin Fixed Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dedicated Scrollable Admin Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </div>
      </div>
    </AdminNavContext.Provider>
  );
}
