import { Check, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GameSelectionCard = ({
  game,
  selected,
  onToggle,
}) => {
  return (
    <Card
      className={
        selected
          ? "border-primary ring-1 ring-primary"
          : ""
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">
            {game.title}
          </CardTitle>

          {selected && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {game.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {game.category && (
            <Badge variant="secondary">
              {game.category}
            </Badge>
          )}

          {game.difficulty && (
            <Badge variant="outline">
              {game.difficulty}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          variant={selected ? "secondary" : "outline"}
          className="w-full"
          onClick={() => onToggle(game.id)}
        >
          {selected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Select
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameSelectionCard;
