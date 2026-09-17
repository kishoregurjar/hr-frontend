import { Gamepad2, Play, Clock, Award, Sparkles, LayoutGrid, CheckCircle2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const GAME_BRIEFS = {
  mahjong: {
    slug: "mahjong",
    title: "Mahjong Tile Match Strategy",
    description: "Classic Mahjong tile-matching puzzle evaluating visual scanning, unobstructed straight-line connections, and sliding maneuvers.",
    category: "Visual Recognition & Strategy",
    duration: "7 Mins",
    skill: "Pattern Recognition & Spatial Logic",
    scoring: "Matches, Combos & Clearance Speed",
    instructions: [
      "Observe the tile arrangement carefully on the board.",
      "Select and match identical free tiles connected by 3 or fewer straight lines.",
      "Use Hint or Shuffle strategically if no valid moves remain.",
      "Match all tiles before the round timer expires for maximum score.",
    ],
  },
  sudoku: {
    slug: "sudoku",
    title: "Mini Sudoku Logic Challenge",
    description: "6x6 Mini Sudoku with 2x3 blocks testing quantitative deduction, numerical constraint logic, and working memory.",
    category: "Quantitative Reasoning",
    duration: "10 Mins",
    skill: "Logical Deduction & Working Memory",
    scoring: "Speed, Accuracy & Error-Free Grid",
    instructions: [
      "Fill empty grid cells with numbers 1 to 6.",
      "Ensure each row, column, and 2x3 block contains unique digits 1-6.",
      "Avoid conflicting numbers and complete the entire grid.",
    ],
  },
  zip: {
    slug: "zip",
    title: "Zip Grid Pathfinder",
    description: "Navigate a grid by connecting ordered numerical checkpoints in sequence from 1 to N without crossing maze walls.",
    category: "Spatial Reasoning",
    duration: "6 Mins",
    skill: "Spatial Path Planning & Route Optimization",
    scoring: "Path Completion & Traversal Speed",
    instructions: [
      "Locate Checkpoint 1 on the grid to start the path.",
      "Draw or tap connected cells sequentially through Checkpoints 1 -> N.",
      "Avoid obstacle walls and complete the path cleanly.",
    ],
  },
  tango: {
    slug: "tango",
    title: "Tango Spatial Deduction",
    description: "Binary deductive reasoning puzzle placing Sun and Moon symbols respecting row/col balance and relational constraints.",
    category: "Deductive Reasoning",
    duration: "8 Mins",
    skill: "Constraint Satisfaction & Deductive Logic",
    scoring: "Symbol Balance & Constraint Accuracy",
    instructions: [
      "Place Sun and Moon symbols into the grid.",
      "Ensure equal number of Suns and Moons in every row and column.",
      "Respect = (equal) and x (opposite) relation markers between adjacent cells.",
    ],
  },
};

const resolveGameBrief = (section) => {
  const rawKey = String(section?.slug || section?.gameId || section?.gameType || section?.title || "").toLowerCase();
  
  if (rawKey.includes("mahjong")) return GAME_BRIEFS.mahjong;
  if (rawKey.includes("sudoku")) return GAME_BRIEFS.sudoku;
  if (rawKey.includes("zip") || rawKey.includes("path")) return GAME_BRIEFS.zip;
  if (rawKey.includes("tango")) return GAME_BRIEFS.tango;

  return (
    GAME_BRIEFS[rawKey] || {
      slug: section?.slug || "mahjong",
      title: section?.title || "Cognitive Interactive Challenge",
      description: section?.description || "Interactive problem-solving challenge evaluating mental agility and logical deduction.",
      category: "Cognitive Problem Solving",
      duration: "7 Mins",
      skill: "Strategic Agility & Deduction",
      scoring: "Accuracy, Speed & Move Efficiency",
      instructions: [
        "Read the on-screen objective carefully before starting.",
        "Interact with the game board using mouse clicks or drag gestures.",
        "Complete all objectives before time expires to maximize your score.",
      ],
    }
  );
};

const GameReady = ({ section, gameIndex = 0, totalGames = 1, onStart, onSkip }) => {
  const brief = resolveGameBrief(section);

  const handleLaunch = () => {
    onStart(brief.slug);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Main Game Briefing Card ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Header with Title and Category */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 border border-blue-200/60 shrink-0">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  {brief.category}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {totalGames > 1 ? `Game ${gameIndex + 1} of ${totalGames}` : "Cognitive Module"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {section?.title || brief.title}
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs font-bold text-slate-700">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Duration: {brief.duration}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {brief.description}
        </p>

        {/* Skill & Scoring Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Award className="h-4 w-4 text-indigo-600" />
              <span>Skill Evaluated</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900">{brief.skill}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <LayoutGrid className="h-4 w-4 text-emerald-600" />
              <span>Scoring Metric</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900">{brief.scoring}</p>
          </div>
        </div>

        {/* Rules & Instructions List */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Rules & Gameplay Instructions
          </h3>
          <ol className="space-y-2 text-xs font-medium text-slate-600 list-decimal pl-5">
            {brief.instructions.map((inst, idx) => (
              <li key={idx} className="pl-1 leading-relaxed">
                {inst}
              </li>
            ))}
          </ol>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Timer will begin automatically once you click <strong className="text-slate-800">Start Game Challenge</strong>.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onSkip && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onSkip}
                className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs gap-1.5 cursor-pointer"
              >
                <SkipForward className="h-4 w-4 text-slate-500" />
                Skip Challenge
              </Button>
            )}

            <Button
              type="button"
              size="lg"
              onClick={handleLaunch}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              Start Game Challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameReady;
