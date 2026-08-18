import {
  Archive,
  CheckCircle2,
  Gamepad2,
  FileText,
} from "lucide-react";
import { GAME_STATUS } from "@/constants";
import GameStatCard from "./GameStatCard";

const GameStats = ({ games }) => {
  const total = games.length;

  const active = games.filter(
    (game) => game.status === GAME_STATUS.ACTIVE
  ).length;

  const draft = games.filter(
    (game) => game.status === GAME_STATUS.DRAFT
  ).length;

  const archived = games.filter(
    (game) => game.status === GAME_STATUS.ARCHIVED
  ).length;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <GameStatCard
        title="Total Games"
        value={total}
        icon={Gamepad2}
      />

      <GameStatCard
        title="Active"
        value={active}
        icon={CheckCircle2}
      />

      <GameStatCard
        title="Draft"
        value={draft}
        icon={FileText}
      />

      <GameStatCard
        title="Archived"
        value={archived}
        icon={Archive}
      />
    </div>
  );
};

export default GameStats;
