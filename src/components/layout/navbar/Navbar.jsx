"use client";

import { useState } from "react";
import { Bell, LogOut, Menu, ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { PAGE_TITLES } from "@/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context";

const Navbar = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      router.push("/login");
    } catch {
      setShowLogoutConfirm(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "HR";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search..."
            className="hidden w-64 md:block"
          />

          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">
                {user?.name ?? "Rohit Solanki"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.company ?? "HireQuest HR"}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign Out"
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal Popup */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-md p-6 sm:rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 max-w-xs leading-relaxed">
              Are you sure you want to log out of your HireQuest HR account? You will need to sign in again to access the dashboard.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full sm:w-1/2 font-semibold"
              disabled={isLoggingOut}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmLogout}
              className="w-full sm:w-1/2 font-semibold bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging Out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
