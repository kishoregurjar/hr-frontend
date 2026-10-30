import { Gamepad2, Play, Clock, Award, Sparkles, LayoutGrid, SkipForward, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDurationDisplay } from "@/features/games/utils/gameTimers";

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
      "Draw or tap connected cells sequentially through Checkpoints 1 → N.",
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
  nqueens: {
    slug: "nqueens",
    title: "Queens Deductive Reasoning",
    description: "Authentic Queens grid puzzle. Place exactly one Queen in each row, column, and color region without any two queens touching.",
    category: "Constraint Satisfaction",
    duration: "8 Mins",
    skill: "Deductive Logic & Spatial Planning",
    scoring: "Region Accuracy, Speed & Move Efficiency",
    instructions: [
      "The entire board starts completely empty.",
      "Your goal is to have exactly one 👑 in each row, column, and color region.",
      "Tap once to place ✕ and tap twice for 👑.",
      "Two 👑 cannot touch each other, not even diagonally.",
    ],
  },
};

const resolveGameBrief = (section) => {
  const rawKey = String(section?.slug || section?.gameId || section?.gameType || section?.title || "").toLowerCase();
  
  if (rawKey.includes("mahjong")) return GAME_BRIEFS.mahjong;
  if (rawKey.includes("sudoku")) return GAME_BRIEFS.sudoku;
  if (rawKey.includes("zip") || rawKey.includes("path")) return GAME_BRIEFS.zip;
  if (rawKey.includes("tango")) return GAME_BRIEFS.tango;
  if (rawKey.includes("queen")) return GAME_BRIEFS.nqueens;

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

  const rawDiff = section?.difficulty || section?.config?.difficulty || "Medium";
  const diffDisplay = String(rawDiff).charAt(0).toUpperCase() + String(rawDiff).slice(1).toLowerCase();
  const diffLower = String(rawDiff).toLowerCase();

  const gameDurationMins = Number(section?.durationMinutes || section?.duration || 3.5);
  const formattedDuration = formatDurationDisplay(gameDurationMins);

  const handleLaunch = () => {
    onStart(brief.slug);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Main Game Briefing Card ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header with Title and Category */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/15 text-indigo-600 border border-indigo-200/60 shadow-xs shrink-0">
              <Gamepad2 className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {brief.category}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                  {totalGames > 1 ? `Game ${gameIndex + 1} of ${totalGames}` : "Cognitive Module"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {section?.title || brief.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider border shadow-2xs ${
                diffLower === "easy"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : diffLower === "hard"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                diffLower === "easy" ? "bg-emerald-500" : diffLower === "hard" ? "bg-rose-500" : "bg-amber-500"
              }`} />
              {diffDisplay}
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Time Limit: {formattedDuration}</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {brief.description}
        </p>

        {/* Skill & Scoring Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/50 to-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900/70 uppercase tracking-wider">
              <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Award className="h-3.5 w-3.5" />
              </div>
              <span>Skill Evaluated</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 pl-0.5">{brief.skill}</p>
          </div>

          <div className="rounded-xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/50 to-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900/70 uppercase tracking-wider">
              <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <LayoutGrid className="h-3.5 w-3.5" />
              </div>
              <span>Scoring Metric</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 pl-0.5">{brief.scoring}</p>
          </div>
        </div>

        {/* Rules & Instructions List */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-3.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Rules & Gameplay Instructions
          </h3>
          <div className="space-y-2.5">
            {brief.instructions.map((inst, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{inst}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Module timer is shared across all cognitive games. You can solve as many games as you want within the 40-min module pool.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            {onSkip && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onSkip}
                className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs gap-1.5 cursor-pointer shadow-2xs"
              >
                <SkipForward className="h-4 w-4 text-slate-500" />
                Skip Challenge
              </Button>
            )}

            <Button
              type="button"
              size="lg"
              onClick={handleLaunch}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs gap-2 shadow-md shadow-indigo-500/25 cursor-pointer transition-all hover:scale-[1.01]"
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
