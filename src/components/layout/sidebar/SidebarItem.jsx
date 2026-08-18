import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  active = false,
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
