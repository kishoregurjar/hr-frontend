"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({
  title,
  value,
  icon: Icon,
  className = "",
  iconBgClass = "bg-primary/10",
  iconColorClass = "text-primary",
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
      <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {value}
            </h2>
          </div>

          {Icon && (
            <div className={`rounded-full p-3 ${iconBgClass}`}>
              <Icon className={`h-7 w-7 ${iconColorClass}`} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
