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
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useBots } from "../../api/hooks";
import { useFrameMaster } from "../../context/FrameMasterContext";

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

const AGENT_NAMES: Record<string, { name: string; color: string; gradient: string }> = {
  BCO: { name: "CarlOS — CEO", color: "text-blue-600", gradient: "from-blue-500 to-indigo-600" },
  BCF: { name: "CFO Bot", color: "text-emerald-600", gradient: "from-emerald-500 to-green-600" },
  BCT: { name: "CTO Bot", color: "text-purple-600", gradient: "from-purple-500 to-violet-600" },
  BOO: { name: "COO Bot", color: "text-orange-600", gradient: "from-orange-500 to-amber-600" },
  BCM: { name: "CMO Bot", color: "text-pink-600", gradient: "from-pink-500 to-rose-600" },
  BCS: { name: "CSO Bot", color: "text-red-600", gradient: "from-red-500 to-rose-600" },
  BRO: { name: "CRO Bot", color: "text-amber-600", gradient: "from-amber-500 to-yellow-600" },
  BHR: { name: "CHRO Bot", color: "text-teal-600", gradient: "from-teal-500 to-cyan-600" },
  BSE: { name: "CISO Bot", color: "text-zinc-600", gradient: "from-zinc-500 to-gray-600" },
  BLE: { name: "CLO Bot", color: "text-indigo-600", gradient: "from-indigo-500 to-blue-600" },
  BPO: { name: "CINO Bot", color: "text-fuchsia-600", gradient: "from-fuchsia-500 to-purple-600" },
  BFA: { name: "CPO Bot", color: "text-slate-600", gradient: "from-slate-500 to-gray-600" },
  BIO: { name: "CIO Bot", color: "text-sky-600", gradient: "from-sky-500 to-blue-600" },
  BCC: { name: "CCO Bot", color: "text-rose-600", gradient: "from-rose-500 to-pink-600" },
};

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

function ThinkingProcess({ mode }: { mode: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = useMemo(() => getThinkingSteps(mode), [mode]);

  useEffect(() => {
    setCurrentStep(0);
  }, [mode]);

  useEffect(() => {
    if (currentStep >= steps.length - 1) return; // last step loops
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, steps[currentStep].duration);
    return () => clearTimeout(timer);
  }, [currentStep, steps]);

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm min-w-[280px]">
        <div className="space-y-2.5">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2.5 transition-all duration-500",
                  isPending && "opacity-0 translate-y-1",
                  isDone && "opacity-60",
                  isActive && "opacity-100"
                )}
                style={{
                  transitionDelay: isPending ? "0ms" : `${i * 100}ms`,
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isDone && "text-gray-400 line-through",
                    isActive && "text-gray-700 font-medium",
                    isPending && "text-gray-300"
                  )}
                >
                  {step.label}
                </span>
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
                  const info = AGENT_NAMES[bot.code];
                  return (
                    <button
                      key={bot.code}
                      onClick={() => {
                        onConsulterBot(bot.code);
                        setShowConsulter(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br shrink-0",
                        info?.gradient || "from-gray-400 to-gray-500"
                      )}>
                        <Bot className="h-3 w-3 text-white" />
                      </div>
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

        {/* Cristalliser (sauvegarder l'idee) */}
        <button
          onClick={() => onOptionClick("Cristallise cette idee — resume le resultat cle en 3 points.")}
          disabled={disabled}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50 font-medium"
        >
          <Bookmark className="h-3 w-3" />
          Cristalliser
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
    messages, isTyping, activeReflectionMode, newConversation, sendMessage,
    threads, activeThreadId, parkThread, resumeThread, completeThread, deleteThread,
  } = useChatContext();
  const { activeBotCode } = useFrameMaster();
  const { bots } = useBots();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [showThreads, setShowThreads] = useState(false);

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

  // Action handlers
  const handleOptionClick = useCallback(
    (text: string) => {
      if (!isTyping) sendMessage(text, activeBotCode);
    },
    [sendMessage, activeBotCode, isTyping]
  );

  const handleChallenge = useCallback(
    (msgId: string, agentCode?: string) => {
      const count = challengeCounts[msgId] || 0;
      if (count >= 2 || isTyping) return;
      setChallengeCounts((prev) => ({ ...prev, [msgId]: count + 1 }));
      const agentName = AGENT_NAMES[agentCode || activeBotCode]?.name || "Bot";
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
        const botName = AGENT_NAMES[botCode]?.name || botCode;
        sendMessage(lastUserMessage, botCode, undefined, {
          msgType: "consultation",
          branchLabel: `Consultation — ${botName}`,
        });
      }
    },
    [sendMessage, lastUserMessage, isTyping]
  );

  // Request synthesis from CarlOS
  const handleSynthesis = useCallback(() => {
    if (!isTyping) {
      sendMessage(
        "Synthetise cette discussion. Quels sont les 3 points cles, la recommandation principale, et les prochaines etapes concretes?",
        "BCO",
        undefined,
        { msgType: "synthesis" as const, branchLabel: "Synthese CarlOS" }
      );
    }
  }, [sendMessage, isTyping]);

  // ── Sentinelle CarlOS — detection de boucles ──
  const sentinelleWarning = useMemo(() => {
    const botMessages = messages.filter((m) => m.role === "assistant");
    const userMessages = messages.filter((m) => m.role === "user");

    // Regle 1: Trop de messages sans action concrete (>10 echanges)
    if (botMessages.length >= 10 && botMessages.length % 5 === 0) {
      return {
        type: "long-thread" as const,
        message: `Ca fait ${botMessages.length} echanges. On tourne autour du sujet. Veux-tu cristalliser une decision ou passer a l'action?`,
        actions: ["Cristalliser le resultat", "Passer au Cahier SMART", "Continuer"],
      };
    }

    // Regle 2: Messages similaires (user qui pose la meme question)
    if (userMessages.length >= 3) {
      const last3 = userMessages.slice(-3).map((m) => m.content.toLowerCase().slice(0, 50));
      const unique = new Set(last3);
      if (unique.size === 1) {
        return {
          type: "repetition" as const,
          message: "Tu poses la meme question 3 fois. Reformule differemment ou change d'angle.",
          actions: ["Reformuler", "Changer de bot", "Passer a un autre sujet"],
        };
      }
    }

    // Regle 3: Trop de challenges globaux (>4 dans la conversation)
    const totalChallenges = Object.values(challengeCounts).reduce((a, b) => a + b, 0);
    if (totalChallenges >= 4) {
      return {
        type: "over-challenge" as const,
        message: "Tu as challenge plusieurs fois. Les positions sont claires — il est temps de trancher.",
        actions: ["Synthese finale", "Decision Go/No-Go", "Continuer quand meme"],
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
              CarlOS
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

          {/* Thread Manager toggle */}
          <button
            onClick={() => setShowThreads(!showThreads)}
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

          {/* Bots consultes — breadcrumb multi-perspectives */}
          {(() => {
            const consultedBots = [...new Set(messages.filter(m => m.role === "assistant" && m.agent).map(m => m.agent!))];
            if (consultedBots.length <= 1) return null;
            return (
              <div className="flex items-center gap-2 py-2 px-3 bg-violet-50/50 rounded-xl border border-violet-100">
                <Users className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="text-[11px] text-violet-600 font-medium">Perspectives :</span>
                <div className="flex gap-1.5 flex-wrap">
                  {consultedBots.map((code) => {
                    const info = AGENT_NAMES[code];
                    return (
                      <span key={code} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border", info?.color || "text-gray-500")}>
                        {info?.name || code}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Message bubbles */}
          {messages.map((msg, idx) => {
            const agentInfo = msg.agent ? AGENT_NAMES[msg.agent] : null;
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm mt-1 ring-2 ring-blue-200">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%]">
                    <div className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1.5">
                      <Bot className="h-3 w-3" /> CarlOS — Coaching
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
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
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
                          {msg.tier && <span className="px-1.5 py-0.5 bg-amber-100 rounded">{msg.tier}</span>}
                          {msg.latence_ms !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {(msg.latence_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copy(msg.id, msg.content)}
                          className="text-amber-400 hover:text-amber-600 cursor-pointer p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Copier la synthese"
                        >
                          {copied === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Branch indicator for challenges and consultations ──
            const showBranchIndicator = (isChallenge || isConsultation) && !isUser;

            return (
              <div key={msg.id}>
                {/* Branch connector line */}
                {showBranchIndicator && (
                  <div className="flex items-center gap-2 mb-2 ml-10 animate-in fade-in duration-300">
                    <div className={cn("w-6 h-px", isChallenge ? "bg-red-300" : "bg-violet-300")} />
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      isChallenge
                        ? "text-red-600 bg-red-50 border-red-200"
                        : "text-violet-600 bg-violet-50 border-violet-200"
                    )}>
                      {isChallenge ? (
                        <span className="flex items-center gap-1"><Swords className="h-2.5 w-2.5" /> {msg.branchLabel || "Challenge"}</span>
                      ) : (
                        <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {msg.branchLabel || "Consultation"}</span>
                      )}
                    </span>
                    <div className={cn("flex-1 h-px", isChallenge ? "bg-red-200" : "bg-violet-200")} />
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
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br mt-1",
                      isChallenge && "ring-2 ring-red-200",
                      isConsultation && "ring-2 ring-violet-200",
                      agentInfo?.gradient || "from-blue-500 to-indigo-600"
                    )}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "rounded-2xl shadow-sm max-w-[85%] relative group",
                    isUser
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-3 rounded-tr-md"
                      : isChallenge
                        ? "bg-white border-2 border-red-100 px-5 py-4 rounded-tl-md"
                        : isConsultation
                          ? "bg-white border-2 border-violet-100 px-5 py-4 rounded-tl-md"
                          : "bg-white border border-gray-100 px-5 py-4 rounded-tl-md"
                  )}>
                    {/* Agent name */}
                    {!isUser && agentInfo && (
                      <div className={cn("text-xs mb-2 font-semibold", agentInfo.color)}>
                        {agentInfo.name}
                      </div>
                    )}

                    {/* Content */}
                    {!isUser ? (
                      <div
                        className="text-sm text-gray-700 leading-relaxed prose-sm"
                        dangerouslySetInnerHTML={{ __html: formatBotText(msg.content) }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

                    {/* Bot metadata + copy */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          {msg.tier && <span className="px-1.5 py-0.5 bg-gray-50 rounded">{msg.tier}</span>}
                          {msg.latence_ms !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {(msg.latence_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copy(msg.id, msg.content)}
                          className="text-gray-300 hover:text-gray-500 cursor-pointer p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Copier"
                        >
                          {copied === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
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
                        disabled={isTyping}
                        availableBots={bots}
                        currentBotCode={msg.agent || activeBotCode}
                      />
                    )}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 text-[10px] font-bold text-white mt-1">
                      CF
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Synthese rapide — apparait apres 4+ echanges bot */}
          {!isTyping && messages.filter(m => m.role === "assistant").length >= 4 && !messages.some(m => m.msgType === "synthesis") && (
            <div className="flex justify-center">
              <button
                onClick={handleSynthesis}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-700 hover:from-amber-100 hover:to-yellow-100 transition-all cursor-pointer font-medium shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Demander la synthese a CarlOS
              </button>
            </div>
          )}

          {/* Sentinelle CarlOS — alerte anti-boucle */}
          {sentinelleWarning && !isTyping && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%]">
                <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> Sentinelle CarlOS
                </div>
                <p className="text-sm text-amber-800">{sentinelleWarning.message}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sentinelleWarning.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (action === "Synthese finale" || action === "Synthese") handleSynthesis();
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
            <ThinkingProcess mode={activeReflectionMode} />
          )}
        </div>
      </div>
    </div>
  );
}
