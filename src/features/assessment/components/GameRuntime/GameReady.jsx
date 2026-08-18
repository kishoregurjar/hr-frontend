import { Gamepad2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const GameReady = ({ section, onStart }) => {
  const instructions = section.instructions ?? [
    "Observe the pattern carefully.",
    "Hide the pattern when you are ready.",
    "Select the pattern you remember.",
  ];

  return (
    <div className="rounded-xl border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-lg border bg-muted p-3">
          <Gamepad2 className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Game</p>
          <h2 className="mt-1 text-2xl font-semibold">{section.title}</h2>
          {section.description && (
            <p className="mt-3 text-muted-foreground">{section.description}</p>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="font-medium text-foreground">Instructions</h3>

        {instructions.length > 0 ? (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Follow the instructions shown during the game.
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="button" size="lg" onClick={onStart}>
          <Play className="mr-2 h-4 w-4" />
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default GameReady;
