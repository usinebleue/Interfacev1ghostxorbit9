"use client";

/**
 * LiveChat.tsx — Affichage chat reel avec CarlOS via ChatContext
 * PAS d'input ici — l'InputBar partagee en bas de CenterZone gere l'envoi.
 * Sprint A — Frame Master V2
 */

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Zap,
  Brain,
  Scale,
  AlertTriangle,
  Target,
  Sparkles,
  MessageSquare,
  Bot,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Search,
  Users,
  Cpu,
  FileText,
  CheckCircle2,
  Loader2,
  Swords,
  ChevronRight,
  ChevronDown,
  Plus,
  Bookmark,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useBots } from "../../api/hooks";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useTextToSpeech } from "../../api/useVocal";
import { CarlOSAvatar } from "./CarlOSAvatar";

// ══════════════════════════════════════════════
// Config
// ══════════════════════════════════════════════

const MODE_CONFIG: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  credo: { label: "CREDO", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
  analyse: { label: "Analyse", icon: Zap, color: "text-red-500", bg: "bg-red-50" },
  brainstorm: { label: "Brainstorm", icon: Brain, color: "text-amber-500", bg: "bg-amber-50" },
  decision: { label: "Decision", icon: Scale, color: "text-indigo-500", bg: "bg-indigo-50" },
  crise: { label: "Crise", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  strategie: { label: "Strategie", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
  debat: { label: "Debat", icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-50" },
  innovation: { label: "Innovation", icon: Sparkles, color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
  deep: { label: "Deep Resonance", icon: Brain, color: "text-cyan-500", bg: "bg-cyan-50" },
};

// ── Bot identity — photos, couleurs, noms (meme config que simulations) ──

const BOT_COLORS: Record<string, {
  bg: string; bgLight: string; text: string; border: string;
  ring: string; emoji: string; name: string; role: string; avatar: string;
}> = {
  BCO: { bg: "bg-blue-600", bgLight: "bg-blue-50", text: "text-blue-700", border: "border-blue-400", ring: "ring-blue-300", emoji: "\u{1F454}", name: "CarlOS", role: "CEO", avatar: "/agents/ceo-carlos.png" },
  BCT: { bg: "bg-violet-600", bgLight: "bg-violet-50", text: "text-violet-700", border: "border-violet-400", ring: "ring-violet-300", emoji: "\u{1F4BB}", name: "Thomas", role: "CTO", avatar: "/agents/cto-thomas.png" },
  BCF: { bg: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-300", emoji: "\u{1F4B0}", name: "Fran\u00E7ois", role: "CFO", avatar: "/agents/cfo-francois.png" },
  BCM: { bg: "bg-pink-600", bgLight: "bg-pink-50", text: "text-pink-700", border: "border-pink-400", ring: "ring-pink-300", emoji: "\u{1F4E3}", name: "Sofia", role: "CMO", avatar: "/agents/cmo-sofia.png" },
  BCS: { bg: "bg-red-600", bgLight: "bg-red-50", text: "text-red-700", border: "border-red-400", ring: "ring-red-300", emoji: "\u{1F3AF}", name: "Marc", role: "CSO", avatar: "/agents/cso-marc.png" },
  BOO: { bg: "bg-orange-600", bgLight: "bg-orange-50", text: "text-orange-700", border: "border-orange-400", ring: "ring-orange-300", emoji: "\u{2699}\u{FE0F}", name: "Lise", role: "COO", avatar: "/agents/coo-lise.png" },
  BFA: { bg: "bg-slate-600", bgLight: "bg-slate-50", text: "text-slate-700", border: "border-slate-400", ring: "ring-slate-300", emoji: "\u{1F3ED}", name: "FactoryBot", role: "Factory", avatar: "" },
  BHR: { bg: "bg-teal-600", bgLight: "bg-teal-50", text: "text-teal-700", border: "border-teal-400", ring: "ring-teal-300", emoji: "\u{1F91D}", name: "David", role: "CHRO", avatar: "/agents/David - CHRO.png" },
  BIO: { bg: "bg-cyan-600", bgLight: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-400", ring: "ring-cyan-300", emoji: "\u{1F4CA}", name: "H\u00E9l\u00E8ne", role: "CIO", avatar: "/agents/H\u00E9l\u00E8ne - CIO.png" },
  BCC: { bg: "bg-rose-600", bgLight: "bg-rose-50", text: "text-rose-700", border: "border-rose-400", ring: "ring-rose-300", emoji: "\u{1F4E2}", name: "\u00C9milie", role: "CCO", avatar: "/agents/CCO - \u00C9milie2.png" },
  BPO: { bg: "bg-fuchsia-600", bgLight: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-400", ring: "ring-fuchsia-300", emoji: "\u{1F680}", name: "Alex", role: "CPO", avatar: "/agents/CPO - Alex2.png" },
  BRO: { bg: "bg-amber-600", bgLight: "bg-amber-50", text: "text-amber-700", border: "border-amber-400", ring: "ring-amber-300", emoji: "\u{1F4C8}", name: "Julien", role: "CRO", avatar: "/agents/CRO - Julien2.png" },
  BLE: { bg: "bg-indigo-600", bgLight: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-400", ring: "ring-indigo-300", emoji: "\u{2696}\u{FE0F}", name: "Isabelle", role: "Legal", avatar: "/agents/CLO - Isabelle3.png" },
  BSE: { bg: "bg-zinc-700", bgLight: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-400", ring: "ring-zinc-300", emoji: "\u{1F6E1}\u{FE0F}", name: "SecBot", role: "CISO", avatar: "" },
};

const USER_AVATAR = "/agents/carl-fugere.jpg";

function botFullName(code: string): string {
  const bot = BOT_COLORS[code];
  return bot ? `${bot.name} — ${bot.role}` : code;
}

/** Avatar du bot — photo si disponible, emoji en fallback */
function BotAvatar({ code, size = "md", className }: { code: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  const sizeClasses = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };

  if (bot.avatar) {
    return (
      <div className={cn("rounded-full overflow-hidden shrink-0 ring-2", bot.ring, sizeClasses[size], className)}>
        <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("rounded-full flex items-center justify-center shrink-0 text-white", bot.bg, sizeClasses[size], textSizes[size], className)}>
      {bot.emoji}
    </div>
  );
}

/** TypewriterText — texte qui s'ecrit caractere par caractere (cerveau vivant) */
function TypewriterText({ text, speed = 10, onComplete, className }: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-text-bottom" />}
    </span>
  );
}

// ══════════════════════════════════════════════
// Rich markdown formatter for CarlOS responses
// ══════════════════════════════════════════════

function formatBotText(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^[━─═\-]{3,}$/.test(line.trim())) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push('<hr class="my-3 border-gray-200">');
      continue;
    }

    if (/^\p{Emoji}?\s*\d+\s*[·|]/u.test(line.trim())) {
      if (inList) { result.push("</ul>"); inList = false; }
      const options = line.split(/\s*\|\s*/);
      result.push('<div class="flex flex-wrap gap-2 my-3">');
      for (const opt of options) {
        const cleaned = opt.replace(/^\p{Emoji}?\s*/u, "").trim();
        result.push(`<span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">${cleaned}</span>`);
      }
      result.push("</div>");
      continue;
    }

    const bulletMatch = line.match(/^(\s*)([-*•]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s+(.+)/u);
    if (bulletMatch) {
      if (!inList) { result.push('<ul class="space-y-1.5 my-2">'); inList = true; }
      const content = applyInlineFormatting(bulletMatch[3]);
      const emoji = /^[-*•]$/.test(bulletMatch[2]) ? "" : bulletMatch[2] + " ";
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="text-gray-400 mt-0.5 shrink-0">${emoji || "•"}</span><span>${content}</span></li>`);
      continue;
    }

    if (inList && line.trim() !== "") {
      result.push("</ul>");
      inList = false;
    }

    if (line.trim() === "") {
      result.push('<div class="h-2"></div>');
      continue;
    }

    if (/^\*\*(.+)\*\*\s*:?\s*$/.test(line.trim())) {
      const headerText = line.trim().replace(/^\*\*(.+)\*\*\s*:?\s*$/, "$1");
      result.push(`<div class="font-semibold text-gray-900 mt-3 mb-1">${headerText}</div>`);
      continue;
    }

    result.push(`<p class="text-sm leading-relaxed">${applyInlineFormatting(line)}</p>`);
  }

  if (inList) result.push("</ul>");
  return result.join("\n");
}

function applyInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-600 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-800">$1</code>');
}

// ══════════════════════════════════════════════
// Copy button hook
// ══════════════════════════════════════════════

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copied, copy };
}

// ══════════════════════════════════════════════
// Thinking Process — animation multi-étapes
// ══════════════════════════════════════════════

interface ThinkingStep {
  icon: typeof Zap;
  label: string;
  duration: number; // ms before moving to next
}

function getThinkingSteps(mode: string): ThinkingStep[] {
  const common: ThinkingStep[] = [
    { icon: Search, label: "Analyse de la tension...", duration: 1200 },
  ];

  const modeSteps: Record<string, ThinkingStep[]> = {
    credo: [
      { icon: Users, label: "Consultation du C-Level...", duration: 1400 },
      { icon: Brain, label: "Protocole CREDO active...", duration: 1200 },
      { icon: Cpu, label: "Synthese en cours...", duration: 0 },
    ],
    analyse: [
      { icon: Search, label: "Decomposition du probleme...", duration: 1300 },
      { icon: Users, label: "Mobilisation CTO + CFO...", duration: 1400 },
      { icon: Cpu, label: "Analyse approfondie...", duration: 0 },
    ],
    brainstorm: [
      { icon: Sparkles, label: "Ouverture du champ creatif...", duration: 1200 },
      { icon: Users, label: "Convocation CMO + CEO...", duration: 1300 },
      { icon: Brain, label: "Generation d'idees...", duration: 0 },
    ],
    debat: [
      { icon: Users, label: "Positionnement des debatteurs...", duration: 1300 },
      { icon: MessageSquare, label: "Arguments et contre-arguments...", duration: 1500 },
      { icon: Scale, label: "Arbitrage en cours...", duration: 0 },
    ],
    decision: [
      { icon: FileText, label: "Compilation des donnees...", duration: 1200 },
      { icon: Users, label: "Consultation CEO + CFO...", duration: 1400 },
      { icon: Scale, label: "Evaluation Go/No-Go...", duration: 0 },
    ],
    crise: [
      { icon: AlertTriangle, label: "Evaluation de la severite...", duration: 800 },
      { icon: Users, label: "Mobilisation d'urgence COO + CEO...", duration: 1000 },
      { icon: Cpu, label: "Plan d'action immediat...", duration: 0 },
    ],
    strategie: [
      { icon: Target, label: "Cadrage strategique...", duration: 1300 },
      { icon: Users, label: "Consultation CSO + CFO + CEO...", duration: 1500 },
      { icon: Cpu, label: "Elaboration du plan...", duration: 0 },
    ],
    innovation: [
      { icon: Sparkles, label: "Scan des possibilites...", duration: 1200 },
      { icon: Users, label: "Mobilisation CTO + CMO...", duration: 1300 },
      { icon: Brain, label: "Catalyse d'innovation...", duration: 0 },
    ],
    deep: [
      { icon: Brain, label: "Plongee en profondeur...", duration: 1500 },
      { icon: Users, label: "Resonance multi-perspectives...", duration: 1600 },
      { icon: Cpu, label: "Synthese spirale...", duration: 0 },
    ],
  };

  return [...common, ...(modeSteps[mode] || modeSteps.credo)];
}

/** ThinkingAnimation — style simulation : bot photo, random timing, hidden pending steps */
function ThinkingAnimation({ mode, botCode }: { mode: string; botCode?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const steps = useMemo(() => getThinkingSteps(mode), [mode]);
  const bot = BOT_COLORS[botCode || "BCO"];

  useEffect(() => {
    setCurrentStep(0);
    setCompletedSteps([]);
  }, [mode]);

  useEffect(() => {
    if (currentStep >= steps.length) return;
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, 800 + Math.random() * 600); // randomized timing
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <BotAvatar code={botCode || "BCO"} size="md" className="mt-1" />
      <div className={cn(
        "bg-white border rounded-2xl rounded-tl-md px-5 py-4 shadow-sm min-w-[280px]",
        bot && `border-l-[3px] ${bot.border}`
      )}>
        <div className={cn("text-xs font-semibold mb-2.5 flex items-center gap-1.5", bot?.text || "text-blue-600")}>
          <Brain className="h-3 w-3 animate-pulse" />
          {bot?.name || "CarlOS"} reflechit...
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isDone = completedSteps.includes(i);
            const isPending = i > currentStep;
            if (isPending) return null; // hidden until reached (simulation style)
            return (
              <div key={i} className={cn(
                "flex items-center gap-2.5 text-sm transition-all duration-300 animate-in fade-in slide-in-from-left-2",
                isActive && (bot?.text || "text-blue-600"),
                isDone && "text-green-600 opacity-60",
              )}>
                {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
                {isDone && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                <StepIcon className="h-3.5 w-3.5 shrink-0" />
                <span className={cn(isDone && "line-through")}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Bot Message Actions — options cliquables + Challenger/Approfondir/Consulter
// ══════════════════════════════════════════════

interface BotActionsProps {
  msg: { id: string; content: string; agent?: string; options?: string[] };
  isLast: boolean;
  challengeCount: number;
  onOptionClick: (text: string) => void;
  onChallenge: () => void;
  onApprofondir: () => void;
  onConsulterBot: (botCode: string) => void;
  onCrystallize: () => void;
  crystallized: boolean;
  disabled: boolean;
  availableBots: { code: string; nom: string; titre: string }[];
  currentBotCode: string;
}

function BotMessageActions({
  msg,
  isLast,
  challengeCount,
  onOptionClick,
  onChallenge,
  onApprofondir,
  onConsulterBot,
  onCrystallize,
  crystallized,
  disabled,
  availableBots,
  currentBotCode,
}: BotActionsProps) {
  const [showConsulter, setShowConsulter] = useState(false);
  const maxChallenges = 2;
  const canChallenge = challengeCount < maxChallenges;

  // Only show full actions on the last bot message, subtle on others
  const alwaysShow = isLast && !disabled;

  return (
    <div className={cn(
      "mt-3 space-y-2 transition-opacity duration-200",
      alwaysShow ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      {/* Options cliquables */}
      {msg.options && msg.options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {msg.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onOptionClick(opt)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Challenger */}
        <button
          onClick={onChallenge}
          disabled={disabled || !canChallenge}
          className={cn(
            "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full transition-colors cursor-pointer font-medium",
            canChallenge
              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
          )}
          title={canChallenge ? "Challenger cette reponse" : `Max ${maxChallenges} challenges atteint`}
        >
          <Swords className="h-3 w-3" />
          Challenger
          {challengeCount > 0 && (
            <span className="text-[9px] opacity-60">({challengeCount}/{maxChallenges})</span>
          )}
        </button>

        {/* Approfondir */}
        <button
          onClick={onApprofondir}
          disabled={disabled}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50 font-medium"
        >
          <Maximize2 className="h-3 w-3" />
          Approfondir
        </button>

        {/* Consulter un autre bot */}
        <div className="relative">
          <button
            onClick={() => setShowConsulter(!showConsulter)}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer disabled:opacity-50 font-medium"
          >
            <Users className="h-3 w-3" />
            Consulter
            <ChevronDown className={cn("h-3 w-3 transition-transform", showConsulter && "rotate-180")} />
          </button>

          {/* Bot dropdown */}
          {showConsulter && (
            <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50 max-h-[240px] overflow-auto">
              {availableBots
                .filter((b) => b.code !== currentBotCode)
                .map((bot) => {
                  const info = BOT_COLORS[bot.code];
                  return (
                    <button
                      key={bot.code}
                      onClick={() => {
                        onConsulterBot(bot.code);
                        setShowConsulter(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <BotAvatar code={bot.code} size="sm" />
                      <div>
                        <span className="font-medium text-gray-700">{bot.titre}</span>
                        <span className="text-gray-400 ml-1">— {bot.nom}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Cristalliser (sauvegarder l'idee dans la banque) */}
        <button
          onClick={onCrystallize}
          disabled={disabled || crystallized}
          className={cn(
            "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full transition-colors cursor-pointer font-medium",
            crystallized
              ? "bg-emerald-200 text-emerald-800 border border-emerald-300"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
          )}
        >
          {crystallized ? (
            <><Check className="h-3 w-3" /> Cristallise</>
          ) : (
            <><Bookmark className="h-3 w-3" /> Cristalliser</>
          )}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Component — affichage avec actions interactives
// ══════════════════════════════════════════════

export function LiveChat({
  onBack,
}: {
  initialMode?: string;
  onBack?: () => void;
}) {
  const {
    messages, isTyping, activeReflectionMode, newConversation, sendMessage, sendMultiPerspective,
    threads, activeThreadId, parkThread, resumeThread, completeThread, deleteThread,
    crystals, crystallize, deleteCrystal, exportCrystals,
    videoAvatarEnabled, toggleVideoAvatar,
  } = useChatContext();
  const { activeBotCode } = useFrameMaster();
  const { bots } = useBots();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();
  const tts = useTextToSpeech();
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [showThreads, setShowThreads] = useState(false);
  const [showCrystals, setShowCrystals] = useState(false);
  const [justCrystallized, setJustCrystallized] = useState<string | null>(null);
  const [typewriterMsgId, setTypewriterMsgId] = useState<string | null>(null);
  const prevMsgCount = useRef(messages.length);

  // Track new bot messages for typewriter effect (skip if streaming — already live)
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.msgType !== "coaching" && !lastMsg.isStreaming) {
        setTypewriterMsgId(lastMsg.id);
      }
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  const modeInfo = MODE_CONFIG[activeReflectionMode] || MODE_CONFIG.credo;

  // Thread counts
  const parkedThreads = useMemo(() => threads.filter((t) => t.status === "parked"), [threads]);
  const completedThreads = useMemo(() => threads.filter((t) => t.status === "completed"), [threads]);
  const ModeIcon = modeInfo.icon;

  // Find the last user message (for "Consulter" — resend to different bot)
  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return null;
  }, [messages]);

  // Find the last bot message ID (for showing actions always visible)
  const lastBotMsgId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  // Request synthesis from CarlOS — MUST be defined before handleOptionClick
  const SYNTHESIS_PROMPTS: Record<string, string> = {
    credo: "Synthetise en format CREDO: (C) Tension identifiee, (R) Recherche faite, (E) Expose des options, (D) Demonstration de la meilleure, (O) Obtenir — prochaines etapes concretes.",
    debat: "Synthetise le debat: Position A (arguments + forces), Position B (arguments + forces), Verdict (quelle position est la plus solide et pourquoi), Decision recommandee.",
    brainstorm: "Classe les idees par potentiel (fort/moyen/faible). Top 3 idees avec justification. Prochaine etape pour chaque top idee.",
    crise: "Plan de crise: (1) Severite 1-10, (2) Actions immediates (30 min), (3) Communication a faire, (4) Responsable de chaque action, (5) Suivi dans 24h.",
    analyse: "Analyse structuree: (1) Probleme decompose, (2) Causes racines identifiees, (3) Donnees cles, (4) Conclusions, (5) Recommandations actionnables.",
    decision: "Matrice de decision: Options evaluees (criteres, risques, potentiel). Recommandation avec niveau de confiance. Conditions de succes du Go. Plan B si No-Go.",
    strategie: "Plan strategique: (1) SWOT synthetise, (2) 3 axes strategiques prioritaires, (3) Quick wins (30 jours), (4) Moyen terme (90 jours), (5) Indicateurs de succes.",
    innovation: "Innovation brief: (1) Opportunite identifiee, (2) Solution proposee, (3) Differenciateur cle, (4) Premier prototype, (5) Marche potentiel, (6) Prochaine etape.",
    deep: "Deep insights: (1) Insight principal (ce qui n'etait pas evident), (2) Connexions inattendues, (3) Question que personne ne posait, (4) Recommandation contre-intuitive.",
  };

  const handleSynthesis = useCallback(() => {
    if (!isTyping) {
      const prompt = SYNTHESIS_PROMPTS[activeReflectionMode] || SYNTHESIS_PROMPTS.credo;
      sendMessage(
        prompt,
        "BCO",
        undefined,
        { msgType: "synthesis" as const, branchLabel: `Synthese ${activeReflectionMode.toUpperCase()}` }
      );
    }
  }, [sendMessage, isTyping, activeReflectionMode]);

  // Action handlers
  const handleOptionClick = useCallback(
    (text: string) => {
      if (isTyping) return;

      // Special routing for coaching options
      switch (text) {
        case "Parker et nouveau thread":
          parkThread();
          return;
        case "Revenir au sujet": {
          const firstUser = messages.find((m) => m.role === "user");
          if (firstUser) sendMessage(`Revenons au sujet initial: ${firstUser.content}`, activeBotCode);
          return;
        }
        case "Forcer la synthese":
        case "Synthese finale":
        case "Synthese":
          handleSynthesis();
          return;
        case "Retour au sujet principal": {
          const orig = messages.find((m) => m.role === "user");
          if (orig) sendMessage(`Recentrons-nous: ${orig.content}`, activeBotCode);
          return;
        }
        default:
          sendMessage(text, activeBotCode);
      }
    },
    [sendMessage, activeBotCode, isTyping, messages, parkThread, handleSynthesis]
  );

  const handleChallenge = useCallback(
    (msgId: string, agentCode?: string) => {
      const count = challengeCounts[msgId] || 0;
      if (count >= 2 || isTyping) return;
      setChallengeCounts((prev) => ({ ...prev, [msgId]: count + 1 }));
      const agentName = botFullName(agentCode || activeBotCode);
      sendMessage(
        "Je ne suis pas d'accord avec cette analyse. Defends ta position avec plus de details et des sources concretes.",
        agentCode || activeBotCode,
        undefined,
        { msgType: "challenge", parentId: msgId, branchLabel: `Challenge — ${agentName}` }
      );
    },
    [challengeCounts, sendMessage, activeBotCode, isTyping]
  );

  const handleApprofondir = useCallback(
    (msgId: string, agentCode?: string) => {
      if (!isTyping)
        sendMessage(
          "Developpe ce point en detail. Quelles sont les implications concretes?",
          agentCode || activeBotCode,
          undefined,
          { msgType: "normal", parentId: msgId }
        );
    },
    [sendMessage, activeBotCode, isTyping]
  );

  const handleConsulterBot = useCallback(
    (botCode: string) => {
      if (!isTyping && lastUserMessage) {
        const botName = botFullName(botCode);
        sendMessage(lastUserMessage, botCode, undefined, {
          msgType: "consultation",
          branchLabel: `Consultation — ${botName}`,
        });
      }
    },
    [sendMessage, lastUserMessage, isTyping]
  );

  // B.1 — Consulter MULTIPLE bots en parallele via /chat/multi
  const handleConsulterMulti = useCallback(
    (botCodes: string[]) => {
      if (isTyping || !lastUserMessage || botCodes.length < 2) return;
      sendMultiPerspective(lastUserMessage, botCodes);
    },
    [sendMultiPerspective, lastUserMessage, isTyping]
  );

  // Challenge ALL consulted bots at once (multi-perspective debate)
  const handleChallengeAll = useCallback(() => {
    if (isTyping) return;
    const consultedBots = [...new Set(messages.filter(m => m.role === "assistant" && m.agent).map(m => m.agent!))];
    if (consultedBots.length < 2) return;
    const botNames = consultedBots.map(c => botFullName(c)).join(", ");
    sendMessage(
      `Je challenge TOUS vos points de vue (${botNames}). Defendez vos positions avec des arguments concrets et des sources. Ou etes-vous en desaccord entre vous?`,
      "BCO", undefined,
      { msgType: "challenge", branchLabel: `Challenge collectif — ${consultedBots.length} bots` }
    );
  }, [messages, sendMessage, isTyping]);

  // Launch a formal debate between 2+ bots
  const handleDebat = useCallback(() => {
    if (isTyping || !lastUserMessage) return;
    const consultedBots = [...new Set(messages.filter(m => m.role === "assistant" && m.agent).map(m => m.agent!))];
    const botNames = consultedBots.map(c => botFullName(c)).join(" vs ");
    sendMessage(
      `Lance un DEBAT structure entre ${botNames} sur le sujet: "${lastUserMessage}". Chaque bot defend sa position. Identifie les points de friction et propose un verdict.`,
      "BCO", undefined,
      { msgType: "challenge", branchLabel: `Debat — ${botNames}` }
    );
  }, [messages, sendMessage, lastUserMessage, isTyping]);

  // Create a new branch (sub-thread) from current discussion
  const handleNewBranch = useCallback((topic?: string) => {
    if (isTyping) return;
    const branchTopic = topic || "cet angle specifique";
    sendMessage(
      `Ouvre une nouvelle branche d'exploration sur: ${branchTopic}. Analyse cet angle en profondeur separement du fil principal.`,
      activeBotCode, undefined,
      { msgType: "normal", branchLabel: `Branche — ${branchTopic.slice(0, 40)}` }
    );
  }, [sendMessage, activeBotCode, isTyping]);

  // ── Sentinelle CarlOS — detection de boucles (vocaux Carl: max 3 challenges/bulle, max 3 niveaux branches) ──
  const sentinelleWarning = useMemo(() => {
    const botMessages = messages.filter((m) => m.role === "assistant");
    const userMessages = messages.filter((m) => m.role === "user");
    const totalChallenges = Object.values(challengeCounts).reduce((a, b) => a + b, 0);

    // Regle 1: Messages similaires — user tourne en rond (3x meme question)
    if (userMessages.length >= 3) {
      const last3 = userMessages.slice(-3).map((m) => m.content.toLowerCase().slice(0, 50));
      const unique = new Set(last3);
      if (unique.size === 1) {
        return {
          type: "repetition" as const,
          message: "Ca fait 3 fois qu'on tourne autour de la meme idee. C'est pas mal tout le temps les memes options qui sortent. Change d'angle ou cristallise.",
          actions: ["Reformuler", "Consulter un autre bot", "Cristalliser le resultat"],
        };
      }
    }

    // Regle 2: Trop de challenges (>4) — "il n'y a rien de plus qui va sortir"
    if (totalChallenges >= 4) {
      return {
        type: "over-challenge" as const,
        message: "Tu as challenge plusieurs fois. Les positions sont claires — il n'y a rien de plus qui va sortir. C'est le moment de trancher.",
        actions: ["Synthese finale", "Decision Go/No-Go", "Cristalliser le meilleur"],
      };
    }

    // Regle 3: Long thread sans synthese (>8 echanges bot) — pousser vers l'action
    if (botMessages.length >= 8 && !messages.some(m => m.msgType === "synthesis") && botMessages.length % 4 === 0) {
      return {
        type: "long-thread" as const,
        message: `Ca fait ${botMessages.length} echanges. On a explore pas mal d'angles. Veux-tu cristalliser une idee geniale ou passer a l'action?`,
        actions: ["Synthetiser", "Passer au Cahier SMART", "Cristalliser et continuer"],
      };
    }

    // Regle 4: Branches trop profondes (>2 niveaux) — ramener vers le concentre
    const maxDepth = Math.max(0, ...messages.map(m => m.branchDepth || 0));
    if (maxDepth >= 2) {
      return {
        type: "deep-branch" as const,
        message: "Tu es a 2+ niveaux de profondeur dans les branches. Finalise cette branche ou remonte vers le fil principal.",
        actions: ["Synthetiser cette branche", "Retour au fil principal", "Continuer quand meme"],
      };
    }

    return null;
  }, [messages, challengeCounts]);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [messages, isTyping]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b px-4 py-2.5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <BotAvatar code={activeBotCode} size="lg" />
          <div>
            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
              {botFullName(activeBotCode)}
              <span className={cn("text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-full", modeInfo.color, modeInfo.bg)}>
                <ModeIcon className="h-3 w-3" /> {modeInfo.label}
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              Usine Bleue AI — Pipeline GHML
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Park thread */}
          {messages.length > 0 && (
            <button
              onClick={parkThread}
              className="text-gray-400 hover:text-amber-600 cursor-pointer p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
              title="Parker cette discussion"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Mes Idees toggle */}
          <button
            onClick={() => { setShowCrystals(!showCrystals); setShowThreads(false); }}
            className={cn(
              "flex items-center gap-1.5 p-1.5 rounded-lg transition-colors cursor-pointer",
              showCrystals ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
            title="Mes Idees"
          >
            <Bookmark className="h-3.5 w-3.5" />
            {crystals.length > 0 && (
              <span className="text-[9px] font-bold bg-emerald-500 text-white px-1 rounded-full min-w-[14px] text-center">
                {crystals.length}
              </span>
            )}
          </button>

          {/* Thread Manager toggle */}
          <button
            onClick={() => { setShowThreads(!showThreads); setShowCrystals(false); }}
            className={cn(
              "flex items-center gap-1.5 p-1.5 rounded-lg transition-colors cursor-pointer",
              showThreads ? "bg-violet-50 text-violet-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
            title="Threads"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {parkedThreads.length > 0 && (
              <span className="text-[9px] font-bold bg-amber-500 text-white px-1 rounded-full min-w-[14px] text-center">
                {parkedThreads.length}
              </span>
            )}
          </button>

          {/* New conversation */}
          {messages.length > 0 && (
            <button
              onClick={newConversation}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Nouvelle conversation"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-600 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Avatar video CarlOS */}
      {videoAvatarEnabled && (
        <CarlOSAvatar onClose={toggleVideoAvatar} />
      )}

      {/* Mes Idees panel */}
      {showCrystals && (
        <div className="bg-white border-b px-4 py-3 space-y-2 max-h-[280px] overflow-auto shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Mes Idees ({crystals.length})
            </div>
            {crystals.length > 0 && (
              <button
                onClick={() => {
                  const text = exportCrystals();
                  navigator.clipboard.writeText(text);
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer font-medium"
              >
                Copier tout
              </button>
            )}
          </div>

          {crystals.length === 0 && (
            <p className="text-xs text-gray-400 py-2">Aucune idee cristallisee. Clique "Cristalliser" sur une reponse bot pour sauvegarder.</p>
          )}

          {crystals.map((crystal) => {
            const botInfo = BOT_COLORS[crystal.bot];
            return (
              <div key={crystal.id} className="py-2 px-3 rounded-lg bg-emerald-50/50 border border-emerald-100 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{crystal.titre}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className={cn("font-medium", botInfo?.text || "text-gray-500")}>{botInfo ? botFullName(crystal.bot) : crystal.bot}</span>
                      <span>·</span>
                      <span>{crystal.mode}</span>
                      <span>·</span>
                      <span>{new Date(crystal.date).toLocaleDateString("fr-CA")}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">{crystal.contenu.slice(0, 150)}...</p>
                  </div>
                  <button
                    onClick={() => deleteCrystal(crystal.id)}
                    className="text-[10px] px-1.5 py-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thread Manager panel */}
      {showThreads && (
        <div className="bg-white border-b px-4 py-3 space-y-2 max-h-[240px] overflow-auto shrink-0">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Threads</div>

          {threads.length === 0 && (
            <p className="text-xs text-gray-400 py-2">Aucun thread sauvegarde.</p>
          )}

          {/* Parked threads first */}
          {parkedThreads.map((thread) => (
            <div key={thread.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">{thread.title}</div>
                <div className="text-[10px] text-gray-400">
                  {thread.messages.length} messages · {thread.primaryBot}
                </div>
              </div>
              <button
                onClick={() => { resumeThread(thread.id); setShowThreads(false); }}
                className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Reprendre
              </button>
              <button
                onClick={() => deleteThread(thread.id)}
                className="text-[10px] px-1.5 py-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Completed threads */}
          {completedThreads.map((thread) => (
            <div key={thread.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group opacity-60">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">{thread.title}</div>
                <div className="text-[10px] text-gray-400">
                  {thread.messages.length} messages · Termine
                </div>
              </div>
              <button
                onClick={() => { resumeThread(thread.id); setShowThreads(false); }}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Revoir
              </button>
              <button
                onClick={() => deleteThread(thread.id)}
                className="text-[10px] px-1.5 py-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {/* Empty state */}
          {messages.length === 0 && !isTyping && (
            <div className="flex justify-center py-16">
              <div className="text-center space-y-5 max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                  <ModeIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Mode {modeInfo.label}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Ecris ta tension dans la barre ci-dessous.<br />
                    CarlOS et ses specialistes analysent en temps reel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bots consultes — breadcrumb multi-perspectives + actions collectives */}
          {(() => {
            const consultedBots = [...new Set(messages.filter(m => m.role === "assistant" && m.agent).map(m => m.agent!))];
            if (consultedBots.length <= 1) return null;
            return (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-violet-50/50 rounded-xl border border-violet-100 flex-wrap">
                <Users className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="text-[11px] text-violet-600 font-medium">Perspectives :</span>
                <div className="flex gap-1.5 flex-wrap">
                  {consultedBots.map((code) => {
                    const info = BOT_COLORS[code];
                    return (
                      <span key={code} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border", info?.text || "text-gray-500")}>
                        {info ? botFullName(code) : code}
                      </span>
                    );
                  })}
                </div>
                {/* Actions collectives */}
                {!isTyping && (
                  <div className="flex gap-1.5 ml-auto flex-wrap">
                    {/* Multi-consult — relancer sur tous les bots */}
                    <button
                      onClick={() => handleConsulterMulti(consultedBots)}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-300 hover:bg-violet-200 transition-colors cursor-pointer font-medium"
                    >
                      <Cpu className="h-2.5 w-2.5" />
                      Relancer {consultedBots.length} bots
                    </button>
                    <button
                      onClick={handleChallengeAll}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer font-medium"
                    >
                      <Swords className="h-2.5 w-2.5" />
                      Challenger les {consultedBots.length}
                    </button>
                    <button
                      onClick={handleDebat}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer font-medium"
                    >
                      <MessageSquare className="h-2.5 w-2.5" />
                      Debat
                    </button>
                    <button
                      onClick={() => handleNewBranch()}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer font-medium"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      Branche
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Message bubbles */}
          {messages.map((msg, idx) => {
            const agentInfo = msg.agent ? BOT_COLORS[msg.agent] : null;
            const isUser = msg.role === "user";
            const isSystem = msg.role === "system";
            const isChallenge = msg.msgType === "challenge";
            const isConsultation = msg.msgType === "consultation";
            const isSynthesis = msg.msgType === "synthesis";
            const isCoaching = msg.msgType === "coaching";
            const depth = msg.branchDepth || 0;

            // ── Coaching messages — CarlOS encadrement ──
            if (isCoaching || isSystem) {
              return (
                <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <BotAvatar code="BCO" size="md" className="mt-1" />
                  <div className="bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%]">
                    <div className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> CarlOS — Coaching
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{msg.content}</p>
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            disabled={isTyping}
                            className="text-xs px-3 py-1.5 rounded-full bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer font-medium"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // ── Synthesis card — special golden card ──
            if (isSynthesis && !isUser) {
              return (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                  {/* Branch connector */}
                  <div className="flex items-center gap-2 mb-2 ml-10">
                    <div className="w-6 h-px bg-amber-300" />
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Synthese
                    </span>
                    <div className="flex-1 h-px bg-amber-200" />
                  </div>
                  <div className="flex gap-3">
                    <BotAvatar code="BCO" size="md" className="mt-1" />
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md max-w-[85%] group">
                      <div className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> Synthese CarlOS
                      </div>
                      <div
                        className="text-sm text-amber-900 leading-relaxed prose-sm"
                        dangerouslySetInnerHTML={{ __html: formatBotText(msg.content) }}
                      />
                      <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-amber-500">
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {tts.isSupported && (
                            <button
                              onClick={() => tts.toggleSpeak(msg.content, msg.id)}
                              className={cn(
                                "cursor-pointer p-1 rounded transition-colors",
                                tts.speakingMsgId === msg.id ? "text-amber-600" : "text-amber-400 hover:text-amber-600"
                              )}
                              title={tts.speakingMsgId === msg.id ? "Arreter" : "Ecouter la synthese"}
                            >
                              {tts.speakingMsgId === msg.id ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </button>
                          )}
                          <button
                            onClick={() => copy(msg.id, msg.content)}
                            className="text-amber-400 hover:text-amber-600 cursor-pointer p-1 rounded transition-colors"
                            title="Copier la synthese"
                          >
                            {copied === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Branch indicator for challenges and consultations ──
            const showBranchIndicator = (isChallenge || isConsultation) && !isUser;
            const isDebat = msg.branchLabel?.startsWith("Debat");
            const isCollectiveChallenge = msg.branchLabel?.startsWith("Challenge collectif");

            return (
              <div key={msg.id}>
                {/* Branch node — visual fork point */}
                {showBranchIndicator && (
                  <div className="flex items-center gap-2 mb-2 ml-10 animate-in fade-in slide-in-from-left-3 duration-400">
                    {/* Node dot */}
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 shrink-0",
                      isDebat ? "bg-violet-500 border-violet-300" :
                      isCollectiveChallenge ? "bg-red-500 border-red-300" :
                      isChallenge ? "bg-red-400 border-red-200" : "bg-violet-400 border-violet-200"
                    )} />
                    {/* Branch line */}
                    <div className={cn("w-4 h-px",
                      isChallenge ? "bg-red-300" : "bg-violet-300"
                    )} />
                    {/* Label */}
                    <span className={cn(
                      "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1",
                      isDebat ? "text-violet-700 bg-violet-100 border-violet-300" :
                      isCollectiveChallenge ? "text-red-700 bg-red-100 border-red-300" :
                      isChallenge
                        ? "text-red-600 bg-red-50 border-red-200"
                        : "text-violet-600 bg-violet-50 border-violet-200"
                    )}>
                      {isDebat ? (
                        <><MessageSquare className="h-2.5 w-2.5" /> {msg.branchLabel}</>
                      ) : isCollectiveChallenge ? (
                        <><Swords className="h-2.5 w-2.5" /> {msg.branchLabel}</>
                      ) : isChallenge ? (
                        <><Swords className="h-2.5 w-2.5" /> {msg.branchLabel || "Challenge"}</>
                      ) : (
                        <><Users className="h-2.5 w-2.5" /> {msg.branchLabel || "Consultation"}</>
                      )}
                    </span>
                    <div className={cn("flex-1 h-px", isChallenge ? "bg-red-200" : "bg-violet-200")} />
                    {/* Branch depth badge */}
                    {depth > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-mono">
                        N{depth}
                      </span>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div className={cn(
                  "flex gap-3",
                  isUser && "justify-end",
                  depth > 0 && "ml-6",
                  depth > 1 && "ml-12",
                )}>
                  {/* Branch depth indicator */}
                  {depth > 0 && !isUser && (
                    <div className={cn(
                      "w-0.5 self-stretch rounded-full shrink-0",
                      isChallenge ? "bg-red-200" : isConsultation ? "bg-violet-200" : "bg-gray-200"
                    )} />
                  )}

                  {!isUser && (
                    <BotAvatar
                      code={msg.agent || "BCO"}
                      size="md"
                      className={cn(
                        "mt-1",
                        isChallenge && "ring-red-200",
                        isConsultation && "ring-violet-200"
                      )}
                    />
                  )}
                  <div className={cn(
                    "rounded-2xl shadow-sm max-w-[85%] relative group",
                    isUser
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-3 rounded-tr-md"
                      : isChallenge
                        ? cn("bg-white border border-red-100 border-l-[3px] px-5 py-4 rounded-tl-md", agentInfo?.border || "border-l-red-400")
                        : isConsultation
                          ? cn("bg-white border border-violet-100 border-l-[3px] px-5 py-4 rounded-tl-md", agentInfo?.border || "border-l-violet-400")
                          : cn("bg-white border border-gray-100 border-l-[3px] px-5 py-4 rounded-tl-md", agentInfo?.border || "border-l-blue-400")
                  )}>
                    {/* Agent name */}
                    {!isUser && agentInfo && (
                      <div className={cn("text-xs mb-2 font-semibold", agentInfo.text)}>
                        {botFullName(msg.agent || "BCO")}
                      </div>
                    )}

                    {/* Content — streaming live OR typewriter on latest bot response */}
                    {!isUser ? (
                      msg.isStreaming ? (
                        // SSE streaming — text appears in real-time from the server
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                          <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-text-bottom" />
                        </div>
                      ) : typewriterMsgId === msg.id ? (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          <TypewriterText
                            text={msg.content}
                            speed={8}
                            onComplete={() => setTypewriterMsgId(null)}
                          />
                        </div>
                      ) : (
                        <div
                          className="text-sm text-gray-700 leading-relaxed prose-sm"
                          dangerouslySetInnerHTML={{ __html: formatBotText(msg.content) }}
                        />
                      )
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

                    {/* Bot actions — TTS + copy */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div />
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {tts.isSupported && (
                            <button
                              onClick={() => tts.toggleSpeak(msg.content, msg.id)}
                              className={cn(
                                "cursor-pointer p-1 rounded transition-colors",
                                tts.speakingMsgId === msg.id
                                  ? "text-blue-500 hover:text-blue-700"
                                  : "text-gray-300 hover:text-gray-500"
                              )}
                              title={tts.speakingMsgId === msg.id ? "Arreter" : "Ecouter"}
                            >
                              {tts.speakingMsgId === msg.id ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </button>
                          )}
                          <button
                            onClick={() => copy(msg.id, msg.content)}
                            className="text-gray-300 hover:text-gray-500 cursor-pointer p-1 rounded transition-colors"
                            title="Copier"
                          >
                            {copied === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions interactives — branches */}
                    {!isUser && (
                      <BotMessageActions
                        msg={msg}
                        isLast={msg.id === lastBotMsgId}
                        challengeCount={challengeCounts[msg.id] || 0}
                        onOptionClick={handleOptionClick}
                        onChallenge={() => handleChallenge(msg.id, msg.agent)}
                        onApprofondir={() => handleApprofondir(msg.id, msg.agent)}
                        onConsulterBot={handleConsulterBot}
                        onCrystallize={() => {
                          crystallize(msg.content, msg.agent || activeBotCode);
                          setJustCrystallized(msg.id);
                          setTimeout(() => setJustCrystallized(null), 3000);
                        }}
                        crystallized={justCrystallized === msg.id}
                        disabled={isTyping}
                        availableBots={bots}
                        currentBotCode={msg.agent || activeBotCode}
                      />
                    )}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-300 mt-1">
                      <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Synthese — bouton discret toujours visible, le user controle le rythme */}
          {!isTyping && messages.filter(m => m.role === "assistant").length >= 2 && !messages.some(m => m.msgType === "synthesis") && (
            <div className="flex justify-center">
              <button
                onClick={handleSynthesis}
                className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all cursor-pointer font-medium"
              >
                <Sparkles className="h-3 w-3" />
                Synthetiser
              </button>
            </div>
          )}

          {/* Sentinelle CarlOS — alerte anti-boucle */}
          {sentinelleWarning && !isTyping && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <BotAvatar code="BCO" size="md" className="mt-1" />
              <div className="bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%]">
                <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" /> Sentinelle CarlOS
                </div>
                <p className="text-sm text-amber-800">{sentinelleWarning.message}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sentinelleWarning.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const lower = action.toLowerCase();
                        if (lower.includes("synth")) handleSynthesis();
                        else if (lower.includes("cristallise")) {
                          const lastBot = messages.filter(m => m.role === "assistant").slice(-1)[0];
                          if (lastBot) { crystallize(lastBot.content, lastBot.agent || activeBotCode); setJustCrystallized(lastBot.id); setTimeout(() => setJustCrystallized(null), 3000); }
                        }
                        else if (lower.includes("parker")) parkThread();
                        else if (lower.includes("retour") || lower.includes("revenir") || lower.includes("sujet principal")) {
                          const orig = messages.find(m => m.role === "user");
                          if (orig) sendMessage(`Recentrons-nous: ${orig.content}`, activeBotCode);
                        }
                        else handleOptionClick(action);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer font-medium"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Thinking process animation */}
          {isTyping && (
            <ThinkingAnimation mode={activeReflectionMode} botCode={activeBotCode} />
          )}
        </div>
      </div>
    </div>
  );
}
