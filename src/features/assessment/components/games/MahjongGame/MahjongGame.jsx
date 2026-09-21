"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  Lightbulb,
  RotateCcw,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlayModal from "../shared/HowToPlayModal";
import GameWinModal from "../shared/GameWinModal";
import { GAME_RULES } from "../shared/gameRules";
import { useGameTimer } from "../shared/useGameTimer";
import {
  DIFFICULTIES,
  createBoard,
  canTilesMatch,
  getPushChain,
  findAllMatchesForTile,
  shuffle,
  getAvailablePair,
  checkRemainingPairsExist,
  hasAnyValidMovesOrMatches,
} from "./mahjongLogic";

// Authentic Classic Mahjong SVG Tile Face Renderer (100% pure responsive SVG)
const TileFace = ({ design }) => {
  const vW = 100;
  const vH = 140;

  const renderDot = (key, cx, cy, innerColor, outerColor, isLarge = false) => {
    const r = isLarge ? 17 : 11.5;
    return (
      <g key={key} transform={`translate(${cx}, ${cy})`}>
        <circle cx="0" cy="0" r={r} fill={outerColor} />
        <circle cx="0" cy="0" r={r * 0.65} fill={innerColor} />
        <circle cx={-r * 0.15} cy={-r * 0.15} r={r * 0.25} fill="#ffffff" />
      </g>
    );
  };

  const renderBam = (key, cx, cy, color, isLarge = false) => {
    const w = isLarge ? 11 : 8.5;
    const h = isLarge ? 36 : 26;
    const segmentH = h / 2 - 2;
    return (
      <g key={key} transform={`translate(${cx}, ${cy})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={segmentH} rx="2" fill={color} />
        <rect x={-w / 2} y={-h / 2} width={w} height="2.5" rx="1" fill="#ffffff" fillOpacity="0.3" />
        <rect x={-w / 2 - 1.5} y={-1.5} width={w + 3} height="3" rx="1" fill="#d97706" />
        <rect x={-w / 2} y={1.5} width={w} height={segmentH} rx="2" fill={color} />
        <rect x={-w / 2} y={1.5} width={w} height="2.5" rx="1" fill="#ffffff" fillOpacity="0.3" />
        <line x1="0" y1={-h / 2 + 1} x2="0" y2={h / 2 - 1} stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.45" />
      </g>
    );
  };

  const renderContent = () => {
    const darkNavy = "#0f3c8a";
    const jadeGreen = "#0a703d";
    const crimsonRed = "#c81c1c";

    if (design.type === "wind" || design.type === "dragon") {
      if (design.id === "dragon_white") {
        return (
          <g>
            <rect x="20" y="24" width="60" height="92" rx="4" fill="none" stroke={darkNavy} strokeWidth="5.5" />
            <rect x="27" y="31" width="46" height="78" rx="2" fill="none" stroke={darkNavy} strokeWidth="1.5" strokeDasharray="4,3" />
          </g>
        );
      }

      const displayColor = design.id === "dragon_red" ? crimsonRed : design.id === "dragon_green" ? jadeGreen : darkNavy;
      return (
        <text
          x="50"
          y="74"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="68"
          fontWeight="bold"
          fontFamily="'STKaiti', 'KaiTi', 'Georgia', 'serif'"
          fill={displayColor}
          style={{ filter: "drop-shadow(0.5px 0.8px 0.5px rgba(0,0,0,0.15))" }}
        >
          {design.symbol}
        </text>
      );
    }

    if (design.type === "character") {
      return (
        <g textAnchor="middle" fontWeight="bold" fontFamily="'STKaiti', 'KaiTi', 'Georgia', 'serif'">
          <text x="50" y="52" dominantBaseline="middle" fontSize="48" fill="#1c1c1c">
            {design.symbol}
          </text>
          <text x="50" y="103" dominantBaseline="middle" fontSize="44" fill={crimsonRed}>
            萬
          </text>
        </g>
      );
    }

    if (design.type === "dot") {
      if (design.num === 1) {
        return (
          <g transform="translate(50, 70)">
            <circle cx="0" cy="0" r="32" fill={darkNavy} />
            <circle cx="0" cy="0" r="28" fill="#ffffff" stroke={crimsonRed} strokeWidth="2" />
            <path
              d="M0,-24 L3,-8 L18,-18 L8,-3 L24,0 L8,3 L18,18 L3,8 L0,24 L-3,8 L-18,18 L-8,3 L-24,0 L-8,-3 L-18,-18 L-3,-8 Z"
              fill={crimsonRed}
            />
            <circle cx="0" cy="0" r="14" fill="none" stroke={darkNavy} strokeWidth="1.5" strokeDasharray="3,2" />
            <circle cx="0" cy="0" r="8" fill={jadeGreen} />
            <circle cx="-1.5" cy="-1.5" r="2.5" fill="#ffffff" />
          </g>
        );
      }

      const dotLayouts = {
        2: [{ x: 50, y: 38 }, { x: 50, y: 102 }],
        3: [{ x: 30, y: 32 }, { x: 50, y: 70 }, { x: 70, y: 108 }],
        4: [{ x: 32, y: 38 }, { x: 68, y: 38 }, { x: 32, y: 102 }, { x: 68, y: 102 }],
        5: [{ x: 28, y: 32 }, { x: 72, y: 32 }, { x: 50, y: 70 }, { x: 28, y: 108 }, { x: 72, y: 108 }],
        6: [{ x: 32, y: 36 }, { x: 68, y: 36 }, { x: 32, y: 70 }, { x: 68, y: 70 }, { x: 32, y: 104 }, { x: 68, y: 104 }],
        7: [{ x: 26, y: 30 }, { x: 50, y: 46 }, { x: 74, y: 62 }, { x: 32, y: 88 }, { x: 68, y: 88 }, { x: 32, y: 114 }, { x: 68, y: 114 }],
        8: [{ x: 32, y: 30 }, { x: 68, y: 30 }, { x: 32, y: 56 }, { x: 68, y: 56 }, { x: 32, y: 84 }, { x: 68, y: 84 }, { x: 32, y: 110 }, { x: 68, y: 110 }],
        9: [{ x: 28, y: 32 }, { x: 50, y: 32 }, { x: 72, y: 32 }, { x: 28, y: 70 }, { x: 50, y: 70 }, { x: 72, y: 70 }, { x: 28, y: 108 }, { x: 50, y: 108 }, { x: 72, y: 108 }],
      };

      const pts = dotLayouts[design.num] || [];
      return pts.map((pt, i) => {
        let inner = jadeGreen;
        let outer = "#064e3b";
        if (design.num === 2) {
          inner = i === 0 ? jadeGreen : darkNavy;
          outer = i === 0 ? "#064e3b" : "#1e3a8a";
        } else if (design.num === 3) {
          inner = i === 0 ? darkNavy : i === 1 ? crimsonRed : jadeGreen;
          outer = i === 0 ? "#1e3a8a" : i === 1 ? "#7f1d1d" : "#064e3b";
        } else if (design.num === 4) {
          inner = i === 0 || i === 3 ? darkNavy : jadeGreen;
          outer = i === 0 || i === 3 ? "#1e3a8a" : "#064e3b";
        } else if (design.num === 5) {
          inner = i === 2 ? crimsonRed : i < 2 ? darkNavy : jadeGreen;
          outer = i === 2 ? "#7f1d1d" : i < 2 ? "#1e3a8a" : "#064e3b";
        } else if (design.num === 6) {
          inner = i < 2 ? jadeGreen : crimsonRed;
          outer = i < 2 ? "#064e3b" : "#7f1d1d";
        } else if (design.num === 7) {
          inner = i < 3 ? jadeGreen : crimsonRed;
          outer = i < 3 ? "#064e3b" : "#7f1d1d";
        } else if (design.num === 8) {
          inner = darkNavy;
          outer = "#1e3a8a";
        } else if (design.num === 9) {
          inner = i % 3 === 0 ? jadeGreen : i % 3 === 1 ? darkNavy : crimsonRed;
          outer = i % 3 === 0 ? "#064e3b" : i % 3 === 1 ? "#1e3a8a" : "#7f1d1d";
        }
        return renderDot(i, pt.x, pt.y, inner, outer, false);
      });
    }

    if (design.type === "bamboo") {
      if (design.num === 1) {
        return (
          <g transform="translate(50, 70)">
            <ellipse cx="0" cy="5" rx="20" ry="24" fill={jadeGreen} />
            <circle cx="0" cy="-14" r="11" fill={jadeGreen} />
            <circle cx="-4" cy="-16" r="3" fill="#ffffff" />
            <circle cx="-4" cy="-16" r="1.5" fill="#000000" />
            <polygon points="-12,-16 -24,-13 -12,-10" fill="#d97706" />
          </g>
        );
      }

      const bamLayouts = {
        2: [{ x: 50, y: 38 }, { x: 50, y: 102 }],
        3: [{ x: 50, y: 32 }, { x: 35, y: 102 }, { x: 65, y: 102 }],
        4: [{ x: 35, y: 38 }, { x: 65, y: 38 }, { x: 35, y: 102 }, { x: 65, y: 102 }],
        5: [{ x: 25, y: 32 }, { x: 75, y: 32 }, { x: 50, y: 70 }, { x: 25, y: 108 }, { x: 75, y: 108 }],
        6: [{ x: 25, y: 38 }, { x: 50, y: 38 }, { x: 75, y: 38 }, { x: 25, y: 102 }, { x: 50, y: 102 }, { x: 75, y: 102 }],
        7: [{ x: 50, y: 24 }, { x: 25, y: 66 }, { x: 50, y: 66 }, { x: 75, y: 66 }, { x: 25, y: 108 }, { x: 50, y: 108 }, { x: 75, y: 108 }],
        8: [{ x: 25, y: 28 }, { x: 50, y: 28 }, { x: 75, y: 28 }, { x: 37.5, y: 70 }, { x: 62.5, y: 70 }, { x: 25, y: 112 }, { x: 50, y: 112 }, { x: 75, y: 112 }],
        9: [{ x: 25, y: 28 }, { x: 50, y: 28 }, { x: 75, y: 28 }, { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 }, { x: 25, y: 112 }, { x: 50, y: 112 }, { x: 75, y: 112 }],
      };

      const pts = bamLayouts[design.num] || [];
      return pts.map((pt, i) => {
        let color = i % 2 === 0 ? jadeGreen : darkNavy;
        if (design.num === 3) color = i === 0 ? jadeGreen : darkNavy;
        if (design.num === 5) color = i === 2 ? crimsonRed : i < 2 ? jadeGreen : darkNavy;
        if (design.num === 7) color = i === 0 ? crimsonRed : i > 3 ? (i === 5 ? jadeGreen : darkNavy) : jadeGreen;
        if (design.num === 8) color = i < 3 ? jadeGreen : i < 5 ? crimsonRed : darkNavy;
        if (design.num === 9) color = i < 3 ? crimsonRed : i < 6 ? darkNavy : jadeGreen;
        const isLarge = [2, 3, 4, 5, 6].includes(design.num);
        return renderBam(i, pt.x, pt.y, color, isLarge);
      });
    }

    return null;
  };

  return (
    <svg
      viewBox={`0 0 ${vW} ${vH}`}
      className="w-full h-full drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.15)] pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {renderContent()}
    </svg>
  );
};

// CSS Custom Styles matching minderWorld authentic 3D ivory tiles and keyframes
const customStyles = `
  :root {
    --tile-padding: 1.5px;
  }
  @keyframes tile-shake {
    0%, 100% { transform: translate3d(0, 0, 0); }
    20%, 60% { transform: translate3d(-6px, 0, 0); }
    40%, 80% { transform: translate3d(6px, 0, 0); }
  }
  .animate-tile-shake {
    animation: tile-shake 0.3s ease-in-out;
  }
  @keyframes line-draw {
    0% { stroke-dasharray: 2000; stroke-dashoffset: 2000; opacity: 0; }
    20% { opacity: 1; }
    70% { stroke-dasharray: 2000; stroke-dashoffset: 0; opacity: 1; filter: brightness(1.5); }
    100% { stroke-dasharray: 2000; stroke-dashoffset: 0; opacity: 0; }
  }
  .animate-line-draw {
    animation: line-draw 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  @keyframes tile-break {
    0% { transform: scale(1); opacity: 1; filter: brightness(1.2); }
    40% { transform: scale(1.15); opacity: 1; filter: brightness(2) drop-shadow(0 0 15px rgba(250,204,21,0.8)); }
    100% { transform: scale(0.4); opacity: 0; filter: blur(8px); }
  }
  .animate-tile-break {
    animation: tile-break 0.4s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes fade-up-out {
    0% { transform: translate(-50%, -50%) translateY(0) scale(0.6); opacity: 0; }
    20% { transform: translate(-50%, -50%) translateY(-10px) scale(1.3); opacity: 1; filter: drop-shadow(0 0 8px rgba(251,191,36,0.8)); }
    100% { transform: translate(-50%, -50%) translateY(-35px) scale(1); opacity: 0; }
  }
  .animate-fade-up-out {
    animation: fade-up-out 0.8s forwards ease-out;
  }
  .mahjong-tile {
    background: 
      radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.7) 12%, rgba(255, 255, 255, 0) 35%),
      linear-gradient(135deg, #ffffff 0%, #fafaf4 100%);
    border: 1px solid rgba(255, 255, 255, 0.95);
    border-top-color: #ffffff;
    border-left-color: #ffffff;
    border-right-color: #e5e5dc;
    border-bottom-color: #d1d1c5;
    border-radius: 14%;
    box-shadow:
      inset 1.2px 1.2px 1.2px rgba(255, 255, 255, 1),
      inset -1.2px -1.2px 1.5px rgba(0, 0, 0, 0.03),
      0.5px 0.5px 0 -0.1px #e2e2d9,
      0.5px 0.5px 1px rgba(0, 0, 0, 0.05);
    transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .mahjong-tile:hover {
    box-shadow:
      inset 1.2px 1.2px 1.2px rgba(255, 255, 255, 1),
      inset -1.2px -1.2px 1.5px rgba(0, 0, 0, 0.03),
      0.5px 0.5px 0 -0.1px #e6e6dc,
      0.8px 0.8px 0 -0.2px #dcdcd0,
      0.8px 0.8px 1.8px -0.2px rgba(0, 0, 0, 0.08);
  }
  .mahjong-tile-selected {
    background: 
      radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.7) 12%, rgba(255, 255, 255, 0) 35%),
      linear-gradient(135deg, #fffef7 0%, #fffbf0 100%);
    border: 2px solid #fbbf24;
    border-radius: 14%;
    box-shadow:
      inset 1.2px 1.2px 1.2px rgba(255, 255, 255, 1),
      0 0 10px rgba(251, 191, 36, 0.85),
      0.5px 0.5px 0 -0.1px #e2e2d9;
    transform: scale(1.02);
  }
  .mahjong-tile-hinted {
    background: linear-gradient(135deg, #fffdf2 0%, #fff9e6 100%);
    border: 2.5px solid #facc15;
    border-radius: 14%;
    animation: tile-hint-pulse 1.5s infinite ease-in-out;
  }
  @keyframes tile-hint-pulse {
    0%, 100% {
      box-shadow: inset 1.2px 1.2px 1.2px rgba(255, 255, 255, 1), 0 0 7px rgba(250, 204, 21, 0.5);
      transform: scale(1);
    }
    50% {
      box-shadow: inset 1.2px 1.2px 1.2px rgba(255, 255, 255, 1), 0 0 15px rgba(250, 204, 21, 1);
      transform: scale(1.03);
    }
  }
  .mahjong-tile-multi-match {
    background: linear-gradient(135deg, #fffdf2 0%, #fffbeb 100%);
    border: 2.5px dashed #d97706;
    border-radius: 14%;
  }
  .mahjong-tile-moving {
    background: 
      radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.7) 12%, rgba(255, 255, 255, 0) 35%),
      linear-gradient(135deg, #ffffff 0%, #fbfbf6 100%);
    border: 1px solid rgba(255, 255, 255, 0.95);
    border-radius: 14%;
    box-shadow:
      inset 1.2px 1.2px 1.2px rgba(255, 255, 255, 1),
      0.5px 0.5px 0 -0.1px #e2e2d9,
      0.8px 0.8px 2px rgba(0, 0, 0, 0.06);
  }
  .mahjong-slot {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14%;
    background: #5bb450;
    box-shadow: inset 0 1.5px 3px rgba(0, 0, 0, 0.18);
    transition: all 0.2s ease;
  }
`;

export default function MahjongGame({ config = {}, onComplete }) {
  const difficulty = (config?.difficulty || "easy").toLowerCase();
  const dimConfig = DIFFICULTIES[difficulty] || DIFFICULTIES.easy;

  const [board, setBoard] = useState(() => config?.board || createBoard(difficulty));
  const [selected, setSelected] = useState(null); // { row, col }
  const [multiMatches, setMultiMatches] = useState([]);
  const [hintPair, setHintPair] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(config?.maxHints ?? 3);
  const [shufflesLeft, setShufflesLeft] = useState(config?.maxShuffles ?? 3);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(1);
  const [message, setMessage] = useState("Tap matching tiles to clear the board!");
  const [isMuted, setIsMuted] = useState(false);
  const [connectionLines, setConnectionLines] = useState([]);
  const [dyingTiles, setDyingTiles] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [shakingDesignId, setShakingDesignId] = useState(null);
  const [activeTileId, setActiveTileId] = useState(null);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isShuffleHighlighted, setIsShuffleHighlighted] = useState(false);

  const handleContinue = () => {
    const finalResult = {
      rawScore: 100,
      score: 100,
      normalizedScore: 100,
      accuracy: 100,
      moves,
      timeTaken: formatted,
      timeSeconds: time || 0,
      timeSpent: time || 0,
      finalScore: score,
      finalState: { cleared: true, score },
    };
    if (typeof onComplete === "function") {
      onComplete(finalResult);
    } else if (typeof onNext === "function") {
      onNext(finalResult);
    } else if (typeof onFinish === "function") {
      onFinish(finalResult);
    }
  };

  const boardRef = useRef(null);
  const lastMatchTimeRef = useRef(0);
  const solvedRef = useRef(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [dragChainIds, setDragChainIds] = useState(new Set());
  const dragStateRef = useRef({
    isActive: false,
    tileR: -1,
    tileC: -1,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    direction: null,
    chain: [],
    dr: 0,
    dc: 0,
    maxOffset: 0,
    emptyCount: 0,
    slotSize: 0,
  });

  const { formatted, startTimer, stopTimer, time } = useGameTimer();

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  // Derived active tiles list
  const activeTiles = useMemo(() => {
    if (!board || board.length === 0) return [];
    const list = [];
    for (let r = 0; r < dimConfig.rows; r++) {
      if (!board[r]) continue;
      for (let c = 0; c < dimConfig.cols; c++) {
        const tile = board[r][c];
        if (tile) {
          list.push({ ...tile, row: r, col: c });
        }
      }
    }
    return list;
  }, [board, dimConfig]);

  // Pure Web Audio API Synthesizer matching minderWorld
  const playSynthSound = (type) => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      if (type === "match") {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.12, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.25);
        });
      } else if (type === "combo") {
        const notes = [659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.15, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.2);
        });
      } else if (type === "move") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.12);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.15);
      } else if (type === "shuffle") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.35);
      } else if (type === "win") {
        const notes = [
          { f: 523.25, d: 0.12 },
          { f: 659.25, d: 0.12 },
          { f: 783.99, d: 0.12 },
          { f: 1046.5, d: 0.25 },
        ];
        notes.forEach((note, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(note.f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.15, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + note.d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + note.d);
        });
      }
    } catch {}
  };

  // Perform Match & Animate Connection Laser & Dynamic Popups
  const executeMatch = (r1, c1, r2, c2, customBoardState = null) => {
    const currentBoard = customBoardState || board;
    const t1 = currentBoard[r1][c1];
    const t2 = currentBoard[r2][c2];
    if (!t1 || !t2) return;

    const matchedAt = Date.now();
    setDyingTiles((prev) => [
      ...prev,
      { ...t1, dyingId: `${t1.id}-${matchedAt}`, row: r1, col: c1, matchedAt },
      { ...t2, dyingId: `${t2.id}-${matchedAt}`, row: r2, col: c2, matchedAt },
    ]);

    const lineId = `${matchedAt}-${Math.random()}`;
    setConnectionLines((prev) => [
      ...prev,
      { id: lineId, start: { row: r1, col: c1 }, end: { row: r2, col: c2 } },
    ]);
    setTimeout(() => {
      setConnectionLines((prev) => prev.filter((l) => l.id !== lineId));
    }, 450);

    const timeDelta = matchedAt - lastMatchTimeRef.current;
    lastMatchTimeRef.current = matchedAt;

    let newCombo = 1;
    if (timeDelta < 4000) {
      newCombo = Math.min(combo + 1, 8);
    }
    setCombo(newCombo);

    const earnedPoints = newCombo * 100;
    setScore((prev) => prev + earnedPoints);
    setMoves((m) => m + 1);

    setFloatingTexts((prev) => [
      ...prev,
      { id: matchedAt, row: r1, col: c1, text: `+${earnedPoints}` },
    ]);

    if (newCombo > 1) {
      playSynthSound("combo");
    } else {
      playSynthSound("match");
    }

    const nextBoard = currentBoard.map((row) => [...row]);
    nextBoard[r1][c1] = null;
    nextBoard[r2][c2] = null;
    setBoard(nextBoard);

    setTimeout(() => {
      setDyingTiles((prev) => prev.filter((t) => Date.now() - t.matchedAt < 300));
    }, 350);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => Date.now() - f.id < 800));
    }, 850);

    // Deadlock detection: Check if remaining tiles have any possible moves or matches
    const remainingTiles = [];
    for (let r = 0; r < dimConfig.rows; r++) {
      for (let c = 0; c < dimConfig.cols; c++) {
        if (nextBoard[r][c]) remainingTiles.push(nextBoard[r][c]);
      }
    }

    if (remainingTiles.length > 0 && !hasAnyValidMovesOrMatches(nextBoard)) {
      setTimeout(() => {
        setIsShuffleHighlighted(true);
        setMessage("No direct matches visible — Click 'Shuffle' button to reshuffle tiles!");
      }, 350);
    }
  };

  // Check Win condition
  useEffect(() => {
    if (win || solvedRef.current) return;
    if (board.length > 0 && activeTiles.length === 0) {
      solvedRef.current = true;
      stopTimer();
      playSynthSound("win");
      setWin(true);
    }
  }, [activeTiles.length, board.length, win, stopTimer]);

  // Click handler matching minderWorld: 1-click auto-match if exactly 1 match
  const handleTileClick = (r, c) => {
    const tile = board[r]?.[c];
    if (!tile || win) return;

    const matches = findAllMatchesForTile(board, r, c);

    if (selected) {
      if (selected.row === r && selected.col === c) {
        setSelected(null);
        setMultiMatches([]);
        return;
      }

      const selectedTile = board[selected.row]?.[selected.col];
      if (
        selectedTile &&
        selectedTile.design.id === tile.design.id &&
        canTilesMatch(board, selected, { row: r, col: c })
      ) {
        executeMatch(selected.row, selected.col, r, c);
        setSelected(null);
        setMultiMatches([]);
        return;
      }

      // Mismatch clicked -> shake & error sound
      setCombo(1);
      playSynthSound("error");
      setShakingDesignId(tile.design.id);
      setTimeout(() => setShakingDesignId(null), 300);
      setSelected(null);
      setMultiMatches([]);
      return;
    }

    // No tile previously selected
    if (matches.length === 1) {
      // 1 match available -> instant match!
      executeMatch(r, c, matches[0].row, matches[0].col);
    } else if (matches.length > 1) {
      setSelected({ row: r, col: c });
      setMultiMatches(matches);
      setMessage("Multiple matches available! Tap a glowing tile to clear.");
      playSynthSound("move");
    } else {
      setShakingDesignId(tile.design.id);
      setTimeout(() => setShakingDesignId(null), 300);
      setSelected({ row: r, col: c });
      setMultiMatches([]);
      playSynthSound("move");
    }
  };

  const handleCellClick = (r, c) => {
    if (selected) {
      setSelected(null);
      setMultiMatches([]);
    }
  };

  // Dragging gesture handlers with smooth snapback and chain pushing
  const handlePointerDown = (e, r, c) => {
    if (win) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const tile = board[r]?.[c];
    if (tile) setActiveTileId(tile.id);

    dragStateRef.current = {
      isActive: true,
      tileR: r,
      tileC: c,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      direction: null,
      chain: [],
      dr: 0,
      dc: 0,
      maxOffset: 0,
      emptyCount: 0,
      slotSize: 0,
    };
  };

  const handlePointerMove = (e) => {
    const state = dragStateRef.current;
    if (!state.isActive) return;

    state.currentX = e.clientX;
    state.currentY = e.clientY;

    const dx = state.currentX - state.startX;
    const dy = state.currentY - state.startY;

    if (!state.direction) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        let dr = 0,
          dc = 0;
        if (Math.abs(dx) > Math.abs(dy)) dc = Math.sign(dx);
        else dr = Math.sign(dy);

        const pushInfo = getPushChain(board, state.tileR, state.tileC, dr, dc);
        if (pushInfo.canPush) {
          const cellW = boardRef.current ? boardRef.current.clientWidth / dimConfig.cols : 60;
          const cellH = boardRef.current ? boardRef.current.clientHeight / dimConfig.rows : 70;
          state.slotSize = dc !== 0 ? cellW : cellH;
          state.emptyCount = pushInfo.emptyCount;
          state.maxOffset = state.slotSize * pushInfo.emptyCount;
          state.direction = dc !== 0 ? "horizontal" : "vertical";

          if (state.direction === "horizontal") dragY.set(0);
          else dragX.set(0);

          state.dr = dr;
          state.dc = dc;
          state.chain = pushInfo.chain;
          setDragChainIds(new Set(pushInfo.chain.map((t) => t.id)));
        } else {
          state.direction = "invalid";
        }
      }
    }

    if (state.direction && state.direction !== "invalid") {
      const strictClamp = (val, max) => {
        if (val < 0) return 0;
        if (val > max) return max;
        return val;
      };

      if (state.direction === "horizontal") {
        let clampedX = 0;
        if (state.dc === 1) clampedX = strictClamp(dx, state.maxOffset);
        else if (state.dc === -1) clampedX = -strictClamp(-dx, state.maxOffset);
        dragX.set(clampedX);
      } else {
        let clampedY = 0;
        if (state.dr === 1) clampedY = strictClamp(dy, state.maxOffset);
        else if (state.dr === -1) clampedY = -strictClamp(-dy, state.maxOffset);
        dragY.set(clampedY);
      }
    }
  };

  const handlePointerUp = (e) => {
    const state = dragStateRef.current;
    if (!state.isActive) {
      setDragChainIds(new Set());
      setActiveTileId(null);
      return;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    state.isActive = false;
    setActiveTileId(null);

    if (state.direction && state.direction !== "invalid") {
      const dx = state.currentX - state.startX;
      const dy = state.currentY - state.startY;

      let offset = state.dr !== 0 ? dy * state.dr : dx * state.dc;
      let offsetCells = Math.round(offset / state.slotSize);
      if (offsetCells < 0) offsetCells = 0;
      if (offsetCells > state.emptyCount) offsetCells = state.emptyCount;

      if (offsetCells > 0) {
        // 1. Build simulated test board
        const testBoard = board.map((row) => [...row]);
        // Clear original positions of all chain tiles
        for (const tile of state.chain) {
          testBoard[tile.startR][tile.startC] = null;
        }
        // Place chain tiles at shifted target positions
        const movedTiles = [];
        for (const tile of state.chain) {
          const targetR = tile.startR + state.dr * offsetCells;
          const targetC = tile.startC + state.dc * offsetCells;
          testBoard[targetR][targetC] = { ...tile, row: targetR, col: targetC };
          movedTiles.push({ row: targetR, col: targetC, tile: testBoard[targetR][targetC] });
        }

        // 2. Check if the move triggers an immediate valid straight-line or adjacent match
        let matchedPair = null;
        for (const moved of movedTiles) {
          for (let tr = 0; tr < dimConfig.rows; tr++) {
            for (let tc = 0; tc < dimConfig.cols; tc++) {
              if (tr === moved.row && tc === moved.col) continue;
              const other = testBoard[tr][tc];
              if (other && other.design.id === moved.tile.design.id) {
                if (canTilesMatch(testBoard, { row: moved.row, col: moved.col }, { row: tr, col: tc })) {
                  matchedPair = {
                    r1: moved.row,
                    c1: moved.col,
                    r2: tr,
                    c2: tc,
                  };
                  break;
                }
              }
            }
            if (matchedPair) break;
          }
          if (matchedPair) break;
        }

        if (matchedPair) {
          // Valid move -> Commit new board state and execute match
          setBoard(testBoard);
          setMoves((m) => m + 1);
          executeMatch(matchedPair.r1, matchedPair.c1, matchedPair.r2, matchedPair.c2, testBoard);
        } else {
          // Invalid move (No match) -> Snap back to initial state with error feedback!
          playSynthSound("error");
          const activeTile = board[state.tileR]?.[state.tileC];
          if (activeTile) {
            setShakingDesignId(activeTile.design.id);
            setTimeout(() => setShakingDesignId(null), 350);
          }
          setMessage("No match made. Tile returned to position!");
        }
      }
    } else if (!state.direction) {
      handleTileClick(state.tileR, state.tileC);
    }

    state.direction = null;
    state.chain = [];
    animate(dragX, 0, { type: "spring", stiffness: 220, damping: 18, mass: 0.8 });
    animate(dragY, 0, {
      type: "spring",
      stiffness: 220,
      damping: 18,
      mass: 0.8,
      onComplete: () => {
        setDragChainIds(new Set());
      },
    });
  };

  const showHint = () => {
    if (hintsLeft <= 0 || win) {
      setMessage("No hints left!");
      return;
    }

    const pair = getAvailablePair(board);
    if (pair) {
      setHintPair(pair);
      setHintsLeft((prev) => prev - 1);
      setMessage("Matching pair highlighted!");
      setTimeout(() => setHintPair(null), 3500);
    } else {
      setMessage("No direct match visible — try sliding a tile or shuffling!");
    }
  };

  const shuffleBoard = (customBoard = null, isAuto = false) => {
    const currentBoard = (Array.isArray(customBoard) ? customBoard : null) || board;
    const occupiedCoords = [];
    const tilesToShuffle = [];

    for (let r = 0; r < dimConfig.rows; r++) {
      for (let c = 0; c < dimConfig.cols; c++) {
        const tile = currentBoard[r]?.[c];
        if (tile) {
          occupiedCoords.push({ r, c });
          tilesToShuffle.push(tile);
        }
      }
    }

    if (tilesToShuffle.length === 0) return;

    if (!isAuto) {
      setShufflesLeft((prev) => Math.max(0, prev - 1));
    }
    setIsShuffleHighlighted(false);
    playSynthSound("shuffle");

    const hasRemainingPairs = checkRemainingPairsExist(tilesToShuffle);
    let finalBoard = currentBoard;
    let fallbackBoard = null;
    let attempts = 0;

    if (hasRemainingPairs) {
      while (attempts < 150) {
        const testCoords = shuffle([...occupiedCoords]);
        const testBoard = Array.from({ length: dimConfig.rows }, () =>
          Array.from({ length: dimConfig.cols }, () => null)
        );

        tilesToShuffle.forEach((tile, index) => {
          const coord = testCoords[index];
          testBoard[coord.r][coord.c] = {
            ...tile,
            row: coord.r,
            col: coord.c,
          };
        });

        if (!fallbackBoard) {
          fallbackBoard = testBoard;
        }

        if (hasAnyValidMovesOrMatches(testBoard)) {
          finalBoard = testBoard;
          break;
        }
        attempts += 1;
      }

      // If no instant match detected in 150 attempts, still use randomized fallback board
      if (finalBoard === currentBoard && fallbackBoard) {
        finalBoard = fallbackBoard;
      }
    }

    setBoard(finalBoard);
    setSelected(null);
    setMultiMatches([]);
    setHintPair(null);
    setCombo(1);
    if (!isAuto) setMoves((m) => m + 1);
    setMessage(isAuto ? "No moves left — Auto-shuffled board!" : "Board shuffled! Keep matching!");
  };

  const handleReset = () => {
    setBoard(createBoard(difficulty));
    setSelected(null);
    setMultiMatches([]);
    setHintPair(null);
    setScore(0);
    setMoves(0);
    setCombo(1);
    playSynthSound("shuffle");
  };


  const isSelectedTile = (r, c) => selected?.row === r && selected?.col === c;
  const isHintedTile = (r, c) => hintPair?.some((p) => p.row === r && p.col === c);

  const boardAspectRatio = (dimConfig.cols / dimConfig.rows) * 0.76;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col items-center justify-between select-none p-1 sm:p-2 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* ── Compact Consolidated Game HUD (Single Strip) ── */}
      <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-2xs shrink-0">
        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg gap-1"
          >
            <HelpCircle size={14} />
            <span className="hidden sm:inline">Rules</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showHint()}
            disabled={hintsLeft <= 0 || win}
            className="h-8 px-2.5 text-xs font-bold border-amber-300 bg-amber-50/60 text-amber-900 hover:bg-amber-100 rounded-lg gap-1"
          >
            <Lightbulb size={14} className="text-amber-600" />
            <span>Hint ({hintsLeft})</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shuffleBoard()}
            disabled={shufflesLeft <= 0 || win}
            className={`h-8 px-2.5 text-xs font-bold border-emerald-300 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100 rounded-lg gap-1 transition-all ${
              isShuffleHighlighted ? "animate-pulse ring-2 ring-emerald-500 font-black" : ""
            }`}
          >
            <Shuffle size={14} className="text-emerald-700" />
            <span>Shuffle ({shufflesLeft})</span>
          </Button>
        </div>

        {/* Center: Live Metrics */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Score</span>
            <span className="text-sm font-black text-slate-900">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Moves</span>
            <span className="text-sm font-black text-slate-900">{moves}</span>
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md animate-bounce">
              <Sparkles size={12} className="text-amber-600" />
              <span className="text-[10px] font-black text-amber-700">
                {combo}x!
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Tiles</span>
            <span className="text-sm font-black text-emerald-600">{activeTiles.length}</span>
          </div>
        </div>

        {/* Right: Sound & Round Timer */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
            <Clock size={14} className="text-rose-500" />
            <span className="font-mono text-xs font-black tracking-tight text-slate-900">
              {formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle Game Message */}
      {message && (
        <p className="text-[11px] font-semibold text-slate-500 text-center mb-1 shrink-0">
          {message}
        </p>
      )}

      {/* AUTHENTIC MAHJONG TABLE (Zero-Scroll Height-Bounded Fit) */}
      <div className="flex-1 flex justify-center items-center w-full min-h-0 overflow-hidden py-0.5">
        <div
          ref={boardRef}
          className="relative rounded-2xl bg-[#3b8132] border-3 sm:border-4 border-[#2b5e24] shadow-[inset_0_2px_10px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.2)] overflow-hidden"
          style={{
            height: "min(calc(100vh - 250px), 480px)",
            aspectRatio: boardAspectRatio,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Authentic Felt Noise Overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
            }}
          />

          <div
            className="absolute pointer-events-none"
            style={{
              top: "min(0.6vw, 5px)",
              left: "min(0.6vw, 5px)",
              right: "min(0.6vw, 5px)",
              bottom: "min(0.6vw, 5px)",
            }}
          >
            {/* SVG Connecting Laser Beam Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-45 overflow-visible">
              {connectionLines.map((line) => {
                const startX = `${((line.start.col + 0.5) / dimConfig.cols) * 100}%`;
                const startY = `${((line.start.row + 0.5) / dimConfig.rows) * 100}%`;
                const endX = `${((line.end.col + 0.5) / dimConfig.cols) * 100}%`;
                const endY = `${((line.end.row + 0.5) / dimConfig.rows) * 100}%`;

                return (
                  <g key={line.id}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      className="stroke-amber-400 opacity-90 animate-line-draw"
                      strokeWidth="16"
                      strokeLinecap="round"
                      style={{ filter: "blur(6px)" }}
                    />
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      className="stroke-yellow-100 animate-line-draw"
                      strokeWidth="6"
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 5px rgba(253,224,71,0.9))" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Static Sunken Slots Grid (#5bb450 Green Table Baize) */}
            <div
              className="absolute inset-0 grid z-0 pointer-events-auto"
              style={{
                gridTemplateRows: `repeat(${dimConfig.rows}, 1fr)`,
                gridTemplateColumns: `repeat(${dimConfig.cols}, 1fr)`,
                gap: "2px",
              }}
            >
              {Array.from({ length: dimConfig.rows * dimConfig.cols }).map((_, idx) => {
                const r = Math.floor(idx / dimConfig.cols);
                const c = idx % dimConfig.cols;

                return (
                  <div
                    key={`slot-${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className="relative cursor-pointer mahjong-slot"
                  />
                );
              })}
            </div>

            {/* Interactive 3D Ivory Tiles Layer */}
            {board.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {activeTiles.map((tile) => {
                  const selectedStyle = isSelectedTile(tile.row, tile.col);
                  const hintedStyle = isHintedTile(tile.row, tile.col);
                  const isMultiMatch = multiMatches.some(
                    (m) => m.row === tile.row && m.col === tile.col
                  );
                  const isShaking = shakingDesignId === tile.design.id;
                  const isMoving = dragChainIds.has(tile.id);

                  const targetX = isMoving ? dragX : 0;
                  const targetY = isMoving ? dragY : 0;

                  const tileClass = `
                    w-full h-full flex flex-col items-center justify-center 
                    select-none cursor-grab active:cursor-grabbing touch-none relative overflow-hidden
                    ${
                      selectedStyle
                        ? "mahjong-tile-selected z-30"
                        : isMultiMatch
                        ? "mahjong-tile-multi-match z-25"
                        : hintedStyle
                        ? "mahjong-tile-hinted z-20"
                        : isMoving
                        ? "mahjong-tile-moving z-20"
                        : "mahjong-tile z-10"
                    }
                    ${isShaking ? "animate-tile-shake" : ""}
                  `;

                  return (
                    <motion.div
                      key={tile.id}
                      className="pointer-events-auto touch-none"
                      style={{
                        position: "absolute",
                        top: `${(tile.row / dimConfig.rows) * 100}%`,
                        left: `${(tile.col / dimConfig.cols) * 100}%`,
                        width: `${100 / dimConfig.cols}%`,
                        height: `${100 / dimConfig.rows}%`,
                        padding: "var(--tile-padding)",
                        zIndex: isMoving ? 50 : selectedStyle ? 30 : isMultiMatch ? 25 : 10,
                        x: targetX,
                        y: targetY,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, tile.row, tile.col)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      transition={{
                        layout: { type: "spring", stiffness: 220, damping: 18, mass: 0.8 },
                        x: { type: "spring", stiffness: 220, damping: 18, mass: 0.8 },
                        y: { type: "spring", stiffness: 220, damping: 18, mass: 0.8 },
                      }}
                    >
                      <div
                        className={tileClass}
                        style={tile.id === activeTileId ? { background: "#F3D8C7" } : undefined}
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        {isMultiMatch && (
                          <div className="absolute top-1 right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.85)] animate-bounce">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                        <div className="transform scale-[0.88] pointer-events-none relative z-10">
                          <TileFace design={tile.design} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Shattering / Dying Tiles on Match */}
                {dyingTiles.map((tile) => (
                  <div
                    key={tile.dyingId}
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      top: `${(tile.row / dimConfig.rows) * 100}%`,
                      left: `${(tile.col / dimConfig.cols) * 100}%`,
                      width: `${100 / dimConfig.cols}%`,
                      height: `${100 / dimConfig.rows}%`,
                      padding: "var(--tile-padding)",
                      zIndex: 40,
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center mahjong-tile animate-tile-break">
                      <div className="transform scale-[0.88] opacity-80 pointer-events-none">
                        <TileFace design={tile.design} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Floating Combo Score Popups */}
                {floatingTexts.map((item) => (
                  <div
                    key={item.id}
                    className="animate-fade-up-out absolute pointer-events-none z-50 rounded-lg px-2 py-0.5 font-black text-xl text-white drop-shadow-[0_4px_10px_rgba(251,191,36,0.8)]"
                    style={{
                      top: `${((item.row + 0.5) / dimConfig.rows) * 100}%`,
                      left: `${((item.col + 0.5) / dimConfig.cols) * 100}%`,
                    }}
                  >
                    <span style={{ color: "#fbbf24", WebkitTextStroke: "1px #b45309" }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        rules={GAME_RULES.mahjong}
      />

      {/* Victory Modal */}
      <GameWinModal
        isOpen={win}
        score={100}
        time={formatted}
        message="Masterful! All Mahjong tiles cleared with pure strategy and focus!"
        onContinue={handleContinue}
      />
    </div>
  );
}
