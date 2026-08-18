import {
  LayoutDashboard,
  ClipboardList,
  Gamepad2,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

import { ROUTES } from "./routes";

export const NAVIGATION = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
      {
        label: "Assessments",
        href: ROUTES.ASSESSMENTS,
        icon: ClipboardList,
      },
      {
        label: "Games",
        href: ROUTES.GAMES,
        icon: Gamepad2,
      },
      {
        label: "Candidates",
        href: ROUTES.CANDIDATES,
        icon: Users,
      },
      {
        label: "Results",
        href: ROUTES.RESULTS,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];
