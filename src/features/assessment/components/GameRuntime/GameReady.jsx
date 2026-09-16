import { useState } from "react";
import { Gamepad2, Play, Clock, Award, Sparkles, CheckCircle2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_GAME_HUB_CARDS = [
  {
    slug: "mahjong",
    title: "Mahjong Tile Match Strategy",
    description: "Authentic classic Mahjong tile match puzzle testing visual scanning, straight-line matching, and strategic push sliding.",
    category: "Visual Recognition",
    duration: "7 Min",
    skill: "Pattern Recognition & Memory",
    scoring: "Matches, Combos & Clearance Speed",
    instructions: [
      "Observe the tile arrangement carefully on the board.",
      "Select and match identical free tiles connected by 3 or fewer straight lines.",
      "Use Hint or Shuffle strategically if no valid moves remain.",
    ],
  },
  {
    slug: "sudoku",
    title: "Mini Sudoku Challenge",
    description: "6x6 Mini Sudoku with 2x3 blocks testing quantitative deduction, numerical constraint logic, and working memory.",
    category: "Quantitative Reasoning",
    duration: "10 Min",
    skill: "Logical Deduction",
    scoring: "Speed, Accuracy & Error-Free Grid",
    instructions: [
      "Fill empty grid cells with numbers 1 to 6.",
      "Ensure each row, column, and 2x3 block contains unique digits 1-6.",
      "Complete the entire grid in minimum time.",
    ],
  },
  {
    slug: "zip",
    title: "Zip Grid Pathfinder",
    description: "Navigate a grid by connecting ordered numerical checkpoints in sequence from 1 to N without crossing maze walls.",
    category: "Spatial Reasoning",
    duration: "6 Min",
    skill: "Spatial Path Planning",
    scoring: "Path Completion & Traversal Speed",
    instructions: [
      "Locate Checkpoint 1 on the grid to start the path.",
      "Draw or tap connected cells sequentially through Checkpoints 1 -> N.",
      "Avoid obstacle walls and complete the path cleanly.",
    ],
  },
  {
    slug: "tango",
    title: "Tango Spatial Deduction",
    description: "Binary deductive reasoning puzzle placing Sun and Moon symbols respecting row/col balance and relational constraints.",
    category: "Deductive Reasoning",
    duration: "8 Min",
    skill: "Constraint Satisfaction",
    scoring: "Symbol Balance & Constraint Accuracy",
    instructions: [
      "Place Sun and Moon symbols into the grid.",
      "Ensure equal number of Suns and Moons in every row and column.",
      "Respect = (equal) and x (opposite) relation markers between adjacent cells.",
    ],
  },
];

const GameReady = ({ section, onStart }) => {
  const initialSlug = section?.slug || section?.gameId || "mahjong";
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);

  const activeCard = ALL_GAME_HUB_CARDS.find((g) => g.slug === selectedSlug) || ALL_GAME_HUB_CARDS[0];

  const handleLaunch = () => {
    onStart(activeCard.slug);
  };

  return (
    <div className="space-y-6">
      {/* Games Selector Hub Header */}
      <div className="rounded-xl border bg-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Interactive Cognitive Challenge</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">Candidate Games Hub</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Select & Launch Cognitive Game</h1>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Select any game module below to begin your cognitive evaluation.
          </div>
        </div>

        {/* 4 Games Grid / Carousel */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_GAME_HUB_CARDS.map((card) => {
            const isSelected = card.slug === selectedSlug;
            return (
              <button
                key={card.slug}
                type="button"
                onClick={() => setSelectedSlug(card.slug)}
                className={`relative flex flex-col justify-between rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/50"
                    : "border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{card.category}</span>
                    <span className="flex items-center text-[10px] text-slate-400">
                      <Clock className="mr-1 h-3 w-3" /> {card.duration}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{card.description}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                  <span className="text-[10px] text-slate-400 font-medium">{card.skill}</span>
                  {isSelected && (
                    <span className="flex items-center text-[10px] font-bold text-blue-400">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-blue-400" /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Game Rules & Launch Card */}
      <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-lg border bg-blue-50/50 p-3 text-blue-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{activeCard.category}</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">{activeCard.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{activeCard.description}</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <Clock className="mr-1.5 h-3.5 w-3.5" /> Allotted: {activeCard.duration}
            </span>
          </div>
        </div>

        {/* Skill & Scoring Metrics */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Award className="h-4 w-4 text-blue-600" /> Skill Evaluated
            </div>
            <p className="mt-1 text-sm font-bold text-slate-900">{activeCard.skill}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <LayoutGrid className="h-4 w-4 text-emerald-600" /> Scoring Metric
            </div>
            <p className="mt-1 text-sm font-bold text-slate-900">{activeCard.scoring}</p>
          </div>
        </div>

        {/* Rules & Instructions */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-sm font-semibold text-slate-900">Game Rules & Instructions</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            {activeCard.instructions.map((inst, idx) => (
              <li key={idx} className="pl-1">{inst}</li>
            ))}
          </ol>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="text-xs text-slate-500">
            Click <strong className="text-slate-800">Start Game</strong> to begin your interactive challenge timer.
          </div>
          <Button type="button" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={handleLaunch}>
            <Play className="mr-2 h-4 w-4 fill-white" />
            Start Game ({activeCard.title.split(" ")[0]})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameReady;
