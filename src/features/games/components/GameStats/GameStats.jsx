"use client";

import { useMemo } from "react";
import {
  Gamepad2,
  CheckCircle2,
  Brain,
  Zap,
} from "lucide-react";

const GameStats = ({ games = [] }) => {
  const total = games.length;
  const active = games.filter((g) => g.status === "Active").length;

  const uniqueSkillsCount = useMemo(() => {
    const skills = new Set(games.map((g) => g.skill || g.category).filter(Boolean));
    return skills.size || total;
  }, [games, total]);

  const totalUsedIn = useMemo(() => {
    return games.reduce((acc, g) => acc + (Number(g.usedIn) || 0), 0);
  }, [games]);

  const cards = [
    {
      title: "Total Games",
      value: total,
      description: "Interactive simulations library",
      icon: Gamepad2,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    {
      title: "Active in Tests",
      value: active,
      description: "Live in candidate rounds",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Cognitive Competencies",
      value: `${uniqueSkillsCount} ${uniqueSkillsCount === 1 ? "Trait" : "Traits"}`,
      description: "Targeted mental abilities",
      icon: Brain,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      title: "Total Integrations",
      value: totalUsedIn,
      description: "Across candidate assessments",
      icon: Zap,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
      {cards.map((card, i) => (
        <div
          key={i}
          className="group rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {card.title}
            </span>
            <div
              className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {card.value}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameStats;
