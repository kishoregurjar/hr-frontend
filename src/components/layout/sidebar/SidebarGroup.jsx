import { SidebarItem } from ".";

export default function SidebarGroup({
  title,
  items,
  pathname,
  onItemClick,
}) {
  return (
    <div className="space-y-2">
      <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
