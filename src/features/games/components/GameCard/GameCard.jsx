import { motion } from "framer-motion";
import {
  Brain,
  Clock3,
  BarChart3,
  Eye,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { StatusBadge } from "@/components/common";
import { hoverCard } from "@/lib/animations";
import { formatDuration } from "@/lib/formatters";

const GameCard = ({ game }) => {
  return (
    <motion.div
      {...hoverCard}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <Card className="h-full border transition-all duration-300 hover:border-primary/30 hover:shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {game.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {game.description}
              </p>
            </div>
            <StatusBadge status={game.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain size={18} />
            <span>{game.category}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock3 size={18} />
              {formatDuration(game.duration)}
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              {game.usedIn} Assessments
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Last updated • {game.updatedAt}
          </p>
        </CardContent>

        <CardFooter className="gap-2">
          <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
            <Button
              size="sm"
              className="w-full"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GameCard;
