import Link from "next/link";

export default function SidebarHeader() {
  return (
    <div className="border-b px-6 py-5">
      <Link
        href="/dashboard"
        className="flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          HQ
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            HireQuest
          </h1>
          <p className="text-xs text-muted-foreground">
            Game-Based Hiring Platform
          </p>
        </div>
      </Link>
    </div>
  );
}
