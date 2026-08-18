import { Card, CardContent } from "@/components/ui/card";

const StatsCard = ({ title, value, change, icon: Icon }) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {title}
            </p>

            <h2 className="text-3xl font-bold">
              {value}
            </h2>
          </div>

          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-green-600">
            {change}
          </span>

          <span className="text-xs text-muted-foreground">
            Updated just now
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
