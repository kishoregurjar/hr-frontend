import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const GameStatCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {value}
            </h2>
          </div>

          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-7 w-7 text-primary" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GameStatCard;
