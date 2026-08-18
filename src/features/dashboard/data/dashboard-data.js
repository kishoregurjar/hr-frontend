import {
  ClipboardList,
  Users,
  CheckCircle2,
  Trophy,
} from "lucide-react";

export const dashboardStats = [
  {
    id: 1,
    title: "Total Assessments",
    value: 24,
    change: "+12%",
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "Candidates",
    value: 186,
    change: "+8%",
    icon: Users,
  },
  {
    id: 3,
    title: "Completed",
    value: 142,
    change: "+18%",
    icon: CheckCircle2,
  },
  {
    id: 4,
    title: "Average Score",
    value: "82%",
    change: "+4%",
    icon: Trophy,
  },
];
