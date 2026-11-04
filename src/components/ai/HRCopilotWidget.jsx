"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Minus,
  Send,
  Bot,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { sendHRCopilotMessage } from "@/lib/api/ai";
import { useAuth } from "@/features/auth/context/AuthContext";

// Dynamically import LottieRobot wrapper with ssr: false
const LottieRobot = dynamic(() => import("./LottieRobot"), {
  ssr: false,
  loading: () => <Bot className="h-4 w-4 animate-pulse text-white/90" />,
});

const STARTER_PROMPTS = [
  {
    icon: "🚀",
    label: "Create Assessment",
    prompt: "How do I create a new assessment step-by-step?",
  },
  {
    icon: "📥",
    label: "Extract Resumes",
    prompt: "How do I extract candidate resumes from emails?",
  },
  {
    icon: "✉️",
    label: "Send Test Invite",
    prompt: "How do I invite candidates and send test links?",
  },
  {
    icon: "📚",
    label: "Question Bank",
    prompt: "How many questions are in the Question Bank and how do I use them?",
  },
  {
    icon: "📊",
    label: "View Test Results",
    prompt: "Where can I view candidate test results and proctoring scores?",
  },
];

function FormattedMessage({ text, isDark, isUser }) {
  if (!text) return null;

  // Simple clean markdown parser for bullets, bold, headers, code, and links
  const lines = text.split("\n");

  const textColor = isUser
    ? "text-white font-medium"
    : isDark
    ? "text-slate-100"
    : "text-slate-900";

  return (
    <div
      className={`space-y-1.5 text-[13.5px] leading-relaxed break-words ${textColor}`}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal divider
        if (trimmed === "---") {
          return (
            <hr
              key={idx}
              className={`my-2 ${
                isUser
                  ? "border-white/30"
                  : isDark
                  ? "border-slate-700/80"
                  : "border-slate-200/80"
              }`}
            />
          );
        }

        // Bullet point
        if (
          trimmed.startsWith("•") ||
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ")
        ) {
          const content = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span
                className={`font-bold shrink-0 mt-0.5 ${
                  isUser
                    ? "text-white"
                    : isDark
                    ? "text-indigo-400"
                    : "text-indigo-600"
                }`}
              >
                •
              </span>
              <span className="flex-1">
                {renderInlineStyles(content, isDark, isUser)}
              </span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span
                className={`font-bold shrink-0 ${
                  isUser
                    ? "text-white"
                    : isDark
                    ? "text-indigo-400"
                    : "text-indigo-600"
                }`}
              >
                {numMatch[1]}.
              </span>
              <span className="flex-1">
                {renderInlineStyles(numMatch[2], isDark, isUser)}
              </span>
            </div>
          );
        }

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <p
              key={idx}
              className={`font-bold text-sm mt-2.5 mb-1 ${
                isUser
                  ? "text-white font-black"
                  : isDark
                  ? "text-slate-100"
                  : "text-slate-950"
              }`}
            >
              {renderInlineStyles(trimmed.slice(4), isDark, isUser)}
            </p>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <p
              key={idx}
              className={`font-black text-sm mt-3 mb-1 ${
                isUser
                  ? "text-white font-black"
                  : isDark
                  ? "text-white"
                  : "text-slate-950"
              }`}
            >
              {renderInlineStyles(trimmed.slice(3), isDark, isUser)}
            </p>
          );
        }

        return <p key={idx}>{renderInlineStyles(trimmed, isDark, isUser)}</p>;
      })}
    </div>
  );
}

function renderInlineStyles(str, isDark, isUser) {
  // Replace bold **text** with strong tag
  const parts = [];
  let remaining = str;
  let keyIndex = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);

    // Pick closest match
    let closest = null;
    let type = null;

    if (boldMatch && linkMatch) {
      if (boldMatch.index < linkMatch.index) {
        closest = boldMatch;
        type = "bold";
      } else {
        closest = linkMatch;
        type = "link";
      }
    } else if (boldMatch) {
      closest = boldMatch;
      type = "bold";
    } else if (linkMatch) {
      closest = linkMatch;
      type = "link";
    }

    if (!closest) {
      parts.push(<span key={keyIndex++}>{remaining}</span>);
      break;
    }

    const before = remaining.slice(0, closest.index);
    if (before) {
      parts.push(<span key={keyIndex++}>{before}</span>);
    }

    if (type === "bold") {
      parts.push(
        <strong
          key={keyIndex++}
          className={`font-bold ${
            isUser
              ? "text-white font-extrabold"
              : isDark
              ? "text-white"
              : "text-slate-950"
          }`}
        >
          {closest[1]}
        </strong>
      );
    } else if (type === "link") {
      parts.push(
        <a
          key={keyIndex++}
          href={closest[2]}
          className={`underline font-semibold transition ${
            isUser
              ? "text-white underline decoration-white"
              : isDark
              ? "text-indigo-400 hover:text-indigo-300 decoration-indigo-500"
              : "text-indigo-600 hover:text-indigo-800 decoration-indigo-300"
          }`}
        >
          {closest[1]}
        </a>
      );
    }

    remaining = remaining.slice(closest.index + closest[0].length);
  }

  return parts;
}

export function HRCopilotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Client hydration mount guard & load saved theme
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("hr_copilot_theme");
      if (saved === "dark") {
        setIsDarkMode(true);
      }
    } catch (e) {
      // localStorage may fail in restricted environments
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("hr_copilot_theme", next ? "dark" : "light");
      } catch (e) {}
      toast.info(next ? "Dark mode enabled 🌙" : "Light mode enabled ☀️", {
        duration: 1500,
      });
      return next;
    });
  };

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        `Hello ${user?.name ? user.name.split(" ")[0] : "there"}! 👋 I am your **HireQuest HR Copilot**.\n\nI can help you analyze candidates, track assessment leaderboards, generate test questions, or draft interview invitations. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // Format history for backend API
      const apiHistory = newHistory.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      const res = await sendHRCopilotMessage({
        message: query,
        history: apiHistory,
      });

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.reply || "I have processed your request.",
        model: res.model,
        poweredBy: res.poweredBy,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "I encountered an issue connecting to the AI engine. Please make sure your server is running and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Conversation cleared! What hiring task can I assist you with now?",
        timestamp: new Date(),
      },
    ]);
    toast.info("Conversation reset");
  };

  return (
    <>
      <AnimatePresence>
        {/* ── 1. Floating Launcher Mascot (Bottom-Right: ONLY Animated Lottie Robot) ── */}
        {!isOpen && (
          <motion.button
            key="hr-copilot-launcher"
            type="button"
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="fixed bottom-6 right-6 z-50 group cursor-pointer focus:outline-none select-none"
            title="Chat with HR AI Copilot"
          >
            <div className="relative flex items-center justify-center filter drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300">
              {/* Soft futuristic glow aura behind mascot */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 rounded-full blur-xl group-hover:blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />

              {/* Large Animated Robot (w-[75px] h-[75px] sm:w-[84px] sm:h-[84px]) */}
              <div className="relative w-[75px] h-[75px] sm:w-[84px] sm:h-[84px] flex items-center justify-center pointer-events-none">
                {isMounted ? (
                  <LottieRobot className="w-full h-full drop-shadow-md" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Bot className="w-7 h-7" />
                  </div>
                )}
              </div>

              {/* Active Online Status Badge */}
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 ring-2 ring-white shadow-xs" />
              </span>
            </div>
          </motion.button>
        )}

        {/* ── 2. Minimized Header Pill with Animated Bot ── */}
        {isOpen && isMinimized && (
          <motion.div
            key="hr-copilot-minimized"
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsMinimized(false)}
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl cursor-pointer transition ${
              isDarkMode
                ? "bg-slate-950 text-white border border-slate-700 hover:bg-slate-900 shadow-black/60"
                : "bg-slate-900 text-white border border-slate-700 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center pointer-events-none">
                {isMounted ? (
                  <LottieRobot className="w-full h-full" />
                ) : (
                  <Bot className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <span>HR Copilot</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Maximize2 className="h-3.5 w-3.5 hover:text-white" />
              <X
                className="h-3.5 w-3.5 hover:text-rose-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ── 3. Full Chatbot Window Card with MacBook Spring Animation & Dark Mode ── */}
        {isOpen && !isMinimized && (
          <motion.div
            key="hr-copilot-window"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 26,
              mass: 0.85,
            }}
            style={{ transformOrigin: "bottom right" }}
            className={`fixed bottom-6 right-6 z-50 w-[460px] sm:w-[500px] md:w-[540px] max-w-[calc(100vw-32px)] h-[650px] sm:h-[700px] max-h-[calc(100vh-84px)] flex flex-col rounded-3xl shadow-2xl overflow-hidden font-sans transition-colors duration-200 ${
              isDarkMode
                ? "bg-slate-900 border border-slate-700/80 shadow-black/60 text-slate-100"
                : "bg-white border border-slate-200/90 shadow-indigo-950/25 text-slate-800"
            }`}
          >
            {/* Header with Animated Bot Mascot */}
            <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white p-4 px-5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  <div className="w-10 h-10 pointer-events-none">
                    {isMounted ? (
                      <LottieRobot className="w-full h-full" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[15px] text-white tracking-tight leading-none">
                      HR Copilot
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                      AI
                    </span>
                  </div>
                  <p className="text-[11px] text-white/85 font-medium mt-1">
                    HireQuest Talent &amp; Screening Intelligence
                  </p>
                </div>
              </div>

              {/* Header Controls (Theme Toggle, Clear, Minimize, Close) */}
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                {/* Dark/Light Mode Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-xl hover:bg-white/20 hover:text-white transition cursor-pointer text-white/90"
                  title={
                    isDarkMode ? "Switch to Light mode" : "Switch to Dark mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="h-3.5 w-3.5 text-amber-300 animate-in spin-in-180 duration-300" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-indigo-100" />
                  )}
                </button>

                {/* Clear Conversation */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-xl hover:bg-white/20 hover:text-white transition cursor-pointer text-white/80"
                  title="Clear conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Minimize */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-xl hover:bg-white/20 hover:text-white transition cursor-pointer text-white/80"
                  title="Minimize chat"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-rose-500/80 hover:text-white transition cursor-pointer text-white/80"
                  title="Close chat"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 transition-colors duration-200 ${
                isDarkMode
                  ? "bg-[#0B0F19] text-slate-200"
                  : "bg-slate-50/60 text-slate-800"
              }`}
            >
              {messages.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className={`flex gap-3 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Avatar with Animated Bot */}
                  {m.role !== "user" && (
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 overflow-hidden">
                      <div className="w-7.5 h-7.5 pointer-events-none">
                        {isMounted ? (
                          <LottieRobot className="w-full h-full" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`group relative max-w-[85%] rounded-2xl p-3.5 shadow-sm transition-all ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs"
                        : isDarkMode
                        ? "bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-xs"
                        : "bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <FormattedMessage
                      text={m.content}
                      isDark={isDarkMode}
                      isUser={m.role === "user"}
                    />

                    {/* Copy Button on hover for AI responses */}
                    {m.role !== "user" && (
                      <div
                        className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                          isDarkMode
                            ? "border-slate-700/60 text-slate-400"
                            : "border-slate-100 text-slate-400"
                        }`}
                      >
                        <span>{m.poweredBy || "HireQuest Intelligence"}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(m.content, idx)}
                          className={`flex items-center gap-1 transition cursor-pointer ${
                            isDarkMode
                              ? "hover:text-indigo-400"
                              : "hover:text-indigo-600"
                          }`}
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing / Loading Skeleton with Animated Mascot */}
              {isLoading && (
                <div className="flex gap-3 items-center">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    <div className="w-8.5 h-8.5 pointer-events-none">
                      {isMounted ? (
                        <LottieRobot className="w-full h-full" />
                      ) : (
                        <Bot className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-1.5 text-xs font-medium border ${
                      isDarkMode
                        ? "bg-slate-800/90 border-slate-700 text-slate-300"
                        : "bg-white border-slate-200/90 text-slate-500"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                    <span
                      className={`ml-1.5 text-xs ${
                        isDarkMode ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Pills (Show when conversation has minimal messages) */}
            {messages.length <= 2 && (
              <div
                className={`p-3 border-t flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 transition-colors ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-100"
                }`}
              >
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.prompt)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-102 ${
                      isDarkMode
                        ? "bg-slate-800/90 hover:bg-slate-700/90 text-indigo-300 border-slate-700/80"
                        : "bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 border-indigo-200/70"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <div
              className={`p-3.5 border-t shrink-0 transition-colors ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200/80"
              }`}
            >
              <div className="relative flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask HR Copilot anything..."
                  disabled={isLoading}
                  className={`flex-1 py-2.5 pl-4 pr-11 rounded-full border text-[13px] font-medium transition shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    input.trim() && !isLoading
                      ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 hover:scale-105 active:scale-95"
                      : isDarkMode
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default HRCopilotWidget;
