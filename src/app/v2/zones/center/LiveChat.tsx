"use client";

/**
 * LiveChat.tsx — Affichage chat central CarlOS (MVP2 — Discussion Architecture)
 * Zone centre = affichage des discussions uniquement. L'InputBar reste dans le cockpit (sidebar droite).
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
  Mic,
  ArrowRight,
  LayoutDashboard,
  FileBarChart,
  Heart,
  Pencil,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useBots, useCommandMission, useModeBranch } from "../../api/hooks";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
// TTS retiré — Carl: "si je suis en texte c'est ok d'être en texte"
import { CarlOSAvatar } from "./CarlOSAvatar";
import { api } from "../../api/client";
import type { CanvasAction, BubbleContext } from "../../api/types";

// ══════════════════════════════════════════════
// Config
// ══════════════════════════════════════════════

// Actions hardcodées retirées — le backend drive les suggestions via msg.options
// Seuls Consulter (autre bot) et Cristalliser (sauvegarder) restent comme utilitaires

// Labels CREDO phase pour le footer
const CREDO_PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  C: { label: "Connecter", color: "bg-blue-400" },
  R: { label: "Rechercher", color: "bg-purple-400" },
  E: { label: "Exposer", color: "bg-amber-400" },
  D: { label: "Démontrer", color: "bg-green-400" },
  O: { label: "Obtenir", color: "bg-red-400" },
};

// Sprint Discussion 1 — Helper: comparer les phases CREDO (C < R < E < D < O)
const CREDO_ORDER = ["C", "R", "E", "D", "O"];
function isPhaseAtLeast(current: string | null | undefined, target: string): boolean {
  if (!current) return false;
  return CREDO_ORDER.indexOf(current) >= CREDO_ORDER.indexOf(target);
}

const MODE_CONFIG: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  credo: { label: "Standard", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
  analyse: { label: "Analyse", icon: Zap, color: "text-red-500", bg: "bg-red-50" },
  brainstorm: { label: "Brainstorm", icon: Brain, color: "text-amber-500", bg: "bg-amber-50" },
  decision: { label: "Decision", icon: Scale, color: "text-indigo-500", bg: "bg-indigo-50" },
  crise: { label: "Crise", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  strategie: { label: "Strategie", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
  debat: { label: "Debat", icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-50" },
  innovation: { label: "Innovation", icon: Sparkles, color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
  deep: { label: "Deep Resonance", icon: Brain, color: "text-cyan-500", bg: "bg-cyan-50" },
};

// ══════════════════════════════════════════════
// BubbleFooterContext — breadcrumb contextuel par bulle
// D-108 — Section GPS + phase CREDO + mode réflexion + mission/chantier
// ══════════════════════════════════════════════

function BubbleFooterContext({ ctx }: { ctx?: BubbleContext }) {
  if (!ctx) return <div className="flex-1" />;

  const phase = ctx.credo_phase ? CREDO_PHASE_CONFIG[ctx.credo_phase] : null;
  const mode = ctx.mode && ctx.mode !== "credo" ? MODE_CONFIG[ctx.mode] : null;

  return (
    <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
      {/* Section GPS */}
      {ctx.section && (
        <span className="text-[9px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded truncate max-w-[80px]" title={ctx.section}>
          {ctx.section}
        </span>
      )}

      {/* Phase CREDO dot + label */}
      {phase && (
        <span className="flex items-center gap-0.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", phase.color)} />
          <span className="text-[9px] text-gray-400">{phase.label}</span>
        </span>
      )}

      {/* Mode réflexion */}
      {mode && (
        <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", mode.bg, mode.color)}>
          {mode.label}
        </span>
      )}

      {/* Branch indicator */}
      {ctx.is_branch && (
        <span className="text-[9px] text-violet-400">
          <ArrowRight className="h-2.5 w-2.5 inline" />
        </span>
      )}

      {/* Chantier */}
      {ctx.chantier_nom && (
        <span className="text-[9px] text-amber-500 font-medium truncate max-w-[70px]" title={ctx.chantier_nom}>
          {ctx.chantier_nom}
        </span>
      )}

      {/* S43 — COMMAND QC Sentinel feedback */}
      {ctx.command_active && (
        <span className="flex items-center gap-0.5 ml-1">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            ctx.command_urgency === "crisis" ? "bg-red-500 animate-pulse" :
            ctx.command_urgency === "tactical" ? "bg-amber-500" : "bg-blue-400"
          )} />
          <span className="text-[9px] text-gray-500 font-medium">COMMAND</span>
        </span>
      )}
      {ctx.command_qc && (
        <span className="group relative flex items-center gap-0.5 ml-1">
          <span className={cn(
            "text-[9px] font-medium px-1 py-0.5 rounded",
            ctx.command_qc.checks_passed === ctx.command_qc.checks_total
              ? "bg-emerald-50 text-emerald-600"
              : ctx.command_qc.checks_passed > 0
                ? "bg-amber-50 text-amber-600"
                : "bg-red-50 text-red-600"
          )}>
            VERITE {ctx.command_qc.checks_passed}/{ctx.command_qc.checks_total}
          </span>
          {ctx.command_qc.retries != null && ctx.command_qc.retries > 0 && (
            <span className="text-[9px] text-amber-500">↻{ctx.command_qc.retries}</span>
          )}
          {/* QC Tooltip détaillé */}
          {ctx.command_qc.warnings && ctx.command_qc.warnings.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1.5 bg-gray-800 text-white text-[9px] rounded max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="font-semibold mb-0.5">QC {ctx.command_qc.stage}</div>
              {ctx.command_qc.warnings.map((w, i) => (
                <div key={i} className="text-gray-300">• {w}</div>
              ))}
            </div>
          )}
        </span>
      )}

      {/* Precision % */}
      {ctx.precision_pct != null && ctx.precision_pct > 0 && (
        <span className="text-[9px] text-gray-300 ml-auto">{ctx.precision_pct}%</span>
      )}
    </div>
  );
}

// ── Bot identity — photos, couleurs, noms (meme config que simulations) ──

const BOT_COLORS: Record<string, {
  bg: string; bgLight: string; text: string; border: string;
  ring: string; emoji: string; name: string; role: string; avatar: string;
}> = {
  CEOB: { bg: "bg-blue-600", bgLight: "bg-blue-50", text: "text-blue-700", border: "border-blue-400", ring: "ring-blue-300", emoji: "\u{1F454}", name: "CarlOS", role: "CEO", avatar: "/agents/generated/ceo-carlos-profil-v3.png" },
  CTOB: { bg: "bg-violet-600", bgLight: "bg-violet-50", text: "text-violet-700", border: "border-violet-400", ring: "ring-violet-300", emoji: "\u{1F4BB}", name: "Tim", role: "CTO", avatar: "/agents/generated/cto-thierry-profil-v3.png" },
  CFOB: { bg: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-300", emoji: "\u{1F4B0}", name: "Frank", role: "CFO", avatar: "/agents/generated/cfo-francois-profil-v3.png" },
  CMOB: { bg: "bg-pink-600", bgLight: "bg-pink-50", text: "text-pink-700", border: "border-pink-400", ring: "ring-pink-300", emoji: "\u{1F4E3}", name: "Mathilde", role: "CMO", avatar: "/agents/generated/cmo-martine-profil-v3.png" },
  CSOB: { bg: "bg-red-600", bgLight: "bg-red-50", text: "text-red-700", border: "border-red-400", ring: "ring-red-300", emoji: "\u{1F3AF}", name: "Simone", role: "CSO", avatar: "/agents/generated/cso-sophie-profil-v3.png" },
  COOB: { bg: "bg-orange-600", bgLight: "bg-orange-50", text: "text-orange-700", border: "border-orange-400", ring: "ring-orange-300", emoji: "\u{2699}\u{FE0F}", name: "Olivier", role: "COO", avatar: "/agents/generated/coo-olivier-profil-v3.png" },
  CPOB: { bg: "bg-slate-600", bgLight: "bg-slate-50", text: "text-slate-700", border: "border-slate-400", ring: "ring-slate-300", emoji: "\u{1F3ED}", name: "Paco", role: "CPO", avatar: "/agents/generated/factory-bot-profil-v3.png" },
  CHROB: { bg: "bg-teal-600", bgLight: "bg-teal-50", text: "text-teal-700", border: "border-teal-400", ring: "ring-teal-300", emoji: "\u{1F91D}", name: "H\u00E9l\u00E8ne", role: "CHRO", avatar: "/agents/generated/chro-helene-profil-v3.png" },
  CINOB: { bg: "bg-rose-600", bgLight: "bg-rose-50", text: "text-rose-700", border: "border-rose-400", ring: "ring-rose-300", emoji: "\u{1F4CA}", name: "Inès", role: "CINO", avatar: "/agents/generated/cino-ines-profil-v3.png" },
  CROB: { bg: "bg-amber-600", bgLight: "bg-amber-50", text: "text-amber-700", border: "border-amber-400", ring: "ring-amber-300", emoji: "\u{1F4C8}", name: "Rich", role: "CRO", avatar: "/agents/generated/cro-raphael-profil-v3.png" },
  CLOB: { bg: "bg-indigo-600", bgLight: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-400", ring: "ring-indigo-300", emoji: "\u{2696}\u{FE0F}", name: "Loulou", role: "CLO", avatar: "/agents/generated/clo-louise-profil-v3.png" },
  CISOB: { bg: "bg-zinc-700", bgLight: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-400", ring: "ring-zinc-300", emoji: "\u{1F6E1}\u{FE0F}", name: "Sébastien", role: "CISO", avatar: "/agents/generated/ciso-secbot-profil-v3.png" },
};

const USER_AVATAR = "/agents/carl-fugere.jpg";

/** Labels et icones pour les canvas action badges inline */
const ACTION_BADGE_CONFIG: Record<string, { label: string; icon: typeof ArrowRight; color: string; bg: string }> = {
  navigate: { label: "Voir", icon: LayoutDashboard, color: "text-blue-700", bg: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  push_content: { label: "Contenu", icon: FileBarChart, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100" },
  context_widget: { label: "Action", icon: Zap, color: "text-amber-700", bg: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  annotate: { label: "Coaching", icon: Heart, color: "text-pink-700", bg: "bg-pink-50 border-pink-200 hover:bg-pink-100" },
  execute: { label: "Executer", icon: ArrowRight, color: "text-green-700", bg: "bg-green-50 border-green-200 hover:bg-green-100" },
  split_screen: { label: "Split", icon: LayoutDashboard, color: "text-violet-700", bg: "bg-violet-50 border-violet-200 hover:bg-violet-100" },
};

const VIEW_LABELS: Record<string, string> = {
  department: "Departement",
  health: "Sante Globale",
  cockpit: "Cockpit",
  "orbit9-detail": "Orbit9",
  "agent-settings": "Reglages",
  "espace-bureau": "Espace Bureau",
  dashboard: "Dashboard",
  detail: "Detail",
};

function CanvasActionBadges({ actions }: { actions: CanvasAction[] }) {
  const { dispatch } = useCanvasActions();
  const { navigateToDepartment, setActiveView } = useFrameMaster();

  const handleClick = (action: CanvasAction) => {
    if (action.type === "navigate" && action.view) {
      const params = action.params as Record<string, unknown> | undefined;
      const botCode = params?.bot as string | undefined;
      if (botCode && (action.view === "department" || action.view === "detail")) {
        navigateToDepartment(botCode, action.view as "department" | "detail");
      } else {
        setActiveView(action.view as "department" | "health" | "cockpit" | "orbit9-detail" | "agent-settings" | "espace-bureau" | "diagnostic-hub");
      }
    } else {
      dispatch(action);
    }
  };

  // Ne montrer que les actions pertinentes (pas les phase_update)
  const visibleActions = actions.filter(
    (a) => a.type !== "annotate" || (a.data as Record<string, unknown>)?.type !== "phase_update"
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visibleActions.map((action, i) => {
        const config = ACTION_BADGE_CONFIG[action.type];
        if (!config) return null;
        const ActionIcon = config.icon;
        const params = action.params as Record<string, unknown> | undefined;
        const botCode = params?.bot as string | undefined;
        const viewLabel = action.view ? VIEW_LABELS[action.view] || action.view : "";
        const botInfo = botCode ? BOT_COLORS[botCode] : null;

        let label = config.label;
        if (action.type === "navigate" && viewLabel) {
          label = botInfo ? `${viewLabel} ${botInfo.role}` : viewLabel;
        } else if (action.type === "context_widget") {
          const data = action.data as Record<string, unknown> | undefined;
          const actionType = data?.action_type as string;
          if (actionType === "document") label = "Generer doc";
          else if (actionType === "analyse") label = "Analyse";
          else label = "Action";
        } else if (action.type === "push_content") {
          label = "Voir le contenu";
        }

        return (
          <button
            key={i}
            onClick={() => handleClick(action)}
            className={cn(
              "flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border font-medium transition-colors cursor-pointer",
              config.bg, config.color
            )}
          >
            <ActionIcon className="h-2.5 w-2.5" />
            {label}
            <ArrowRight className="h-2 w-2 opacity-50" />
          </button>
        );
      })}
    </div>
  );
}

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
      { icon: Brain, label: "Analyse en profondeur...", duration: 1200 },
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
  const bot = BOT_COLORS[botCode || "CEOB"];

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
      <BotAvatar code={botCode || "CEOB"} size="md" className="mt-1" />
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
// Cascade Suggestions — pilules inter-departements
// ══════════════════════════════════════════════

function CascadeSuggestionsCard({ suggestions }: { suggestions: import("../../api/types").CascadeSuggestion[] }) {
  const { navigateToDepartment } = useFrameMaster();

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => navigateToDepartment(s.target_section, s.view as "department" | "detail")}
          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border font-medium bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowRight className="h-2.5 w-2.5" />
          {s.message}
          <ChevronRight className="h-2.5 w-2.5 opacity-50" />
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════
// COMMAND Progress Card — mission en cours (BLOC 1)
// ══════════════════════════════════════════════

const COMMAND_STAGE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  scan: { label: "SCAN", color: "text-blue-600", bgColor: "bg-blue-500" },
  strategy: { label: "STRATEGIE", color: "text-violet-600", bgColor: "bg-violet-500" },
  execution: { label: "EXECUTION", color: "text-orange-600", bgColor: "bg-orange-500" },
  bilan: { label: "BILAN", color: "text-emerald-600", bgColor: "bg-emerald-500" },
};

const COMMAND_STAGES_ORDER = ["scan", "strategy", "execution", "bilan"];

function CommandProgressCard({ status }: { status: import("../../api/types").CommandStatusResponse }) {
  const stageIdx = COMMAND_STAGES_ORDER.indexOf(status.stage);

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <BotAvatar code="CEOB" size="md" className="mt-1" />
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 border-l-[3px] border-l-blue-500 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%] w-full">
        <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 animate-pulse" /> COMMAND en cours
          {status.error && <span className="text-red-500 ml-2">Erreur</span>}
        </div>

        {/* 4 stages horizontaux */}
        <div className="flex items-center gap-1 mb-3">
          {COMMAND_STAGES_ORDER.map((stage, i) => {
            const conf = COMMAND_STAGE_CONFIG[stage];
            const isActive = i === stageIdx && !status.completed;
            const isDone = i < stageIdx || status.completed;
            return (
              <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn(
                  "w-full h-1.5 rounded-full transition-all duration-500",
                  isDone ? conf.bgColor : isActive ? `${conf.bgColor} animate-pulse` : "bg-gray-200"
                )} />
                <span className={cn(
                  "text-[9px] font-semibold",
                  isDone ? conf.color : isActive ? conf.color : "text-gray-300"
                )}>
                  {conf.label}
                  {isDone && " ✓"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mini-résumés des stages complétés */}
        {Object.entries(status.stage_results || {}).map(([stage, result]) => {
          const conf = COMMAND_STAGE_CONFIG[stage];
          const r = result as Record<string, unknown>;
          const content = (r?.content as string) || (r?.summary as string) || "";
          if (!content || !conf) return null;
          return (
            <div key={stage} className="text-[9px] text-gray-500 mb-1 flex items-start gap-1.5">
              <span className={cn("font-semibold shrink-0", conf.color)}>{conf.label}:</span>
              <span className="truncate">{content.slice(0, 80)}...</span>
            </div>
          );
        })}

        {status.completed && status.summary && (
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div className="text-xs text-blue-800 font-medium">Bilan final</div>
            <p className="text-xs text-gray-600 leading-relaxed mt-1">{status.summary.slice(0, 200)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// COMMAND Launch Banner — affiche quand command_active detected (BLOC 1)
// ══════════════════════════════════════════════

function CommandLaunchBanner({ ctx, onLaunch, disabled }: {
  ctx: BubbleContext;
  onLaunch: () => void;
  disabled: boolean;
}) {
  if (!ctx.command_active) return null;

  const urgencyColors: Record<string, { bg: string; text: string; border: string }> = {
    crisis: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
    tactical: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
    routine: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  };
  const uc = urgencyColors[ctx.command_urgency || "routine"] || urgencyColors.routine;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border mt-2", uc.bg, uc.border)}>
      <Cpu className={cn("h-3.5 w-3.5 shrink-0", uc.text)} />
      <span className={cn("text-xs font-medium flex-1", uc.text)}>
        COMMAND detecte — orchestration multi-bot disponible
      </span>
      <button
        onClick={onLaunch}
        disabled={disabled}
        className={cn(
          "text-[9px] px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer disabled:opacity-50",
          "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        Lancer l'analyse
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════
// Suggestions Welcome — pilules debut de session (BLOC 4)
// ══════════════════════════════════════════════

function SuggestionsWelcome({ onSelect, disabled }: {
  onSelect: (text: string, mode?: string) => void;
  disabled: boolean;
}) {
  const [data, setData] = useState<import("../../api/types").SuggestionsResponse | null>(null);

  useEffect(() => {
    api.suggestions(1).then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const iconMap: Record<string, typeof Zap> = {
    zap: Zap, brain: Brain, scale: Scale, "alert-triangle": AlertTriangle,
    target: Target, swords: Swords, sparkles: Sparkles, play: ArrowRight,
  };

  const colorMap: Record<string, string> = {
    red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    amber: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    violet: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100",
    blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="text-center">
        <p className="text-sm text-gray-600 leading-relaxed">{data.greeting}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {data.suggestions.map((s) => {
          const Icon = iconMap[s.icon] || Zap;
          const colors = colorMap[s.color] || colorMap.blue;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.description, s.mode || undefined)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium transition-colors cursor-pointer disabled:opacity-50",
                colors
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>
      {data.active_projects.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center pt-1">
          <span className="text-[9px] text-gray-400 font-medium">Projets :</span>
          {data.active_projects.map((p) => (
            <button
              key={p.slug}
              onClick={() => onSelect(`Parlons du projet ${p.nom} — ${p.secteur}`)}
              disabled={disabled}
              className="text-[9px] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer font-medium"
            >
              {p.nom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// Mode Bar — barre de 8 modes dans le header (BLOC 2)
// ══════════════════════════════════════════════

function ModeBar({ activeMode, onSelectMode, activeBranch, onAdvance, onComplete, onCancel, loading, disabled }: {
  activeMode: string;
  onSelectMode: (mode: string) => void;
  activeBranch: Record<string, unknown> | null;
  onAdvance: () => void;
  onComplete: () => void;
  onCancel: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const modes = [
    { id: "brainstorm", label: "Brain", icon: Brain, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "crise", label: "Crise", icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200" },
    { id: "decision", label: "Decision", icon: Scale, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { id: "analyse", label: "Analyse", icon: Search, color: "text-green-600 bg-green-50 border-green-200" },
    { id: "strategie", label: "Strat.", icon: Target, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "innovation", label: "Innov.", icon: Sparkles, color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200" },
    { id: "deep", label: "Deep", icon: Brain, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
    { id: "debat", label: "Debat", icon: MessageSquare, color: "text-violet-600 bg-violet-50 border-violet-200" },
  ];

  return (
    <div className="bg-white/60 border-b px-3 py-1.5 shrink-0">
      {/* Mode buttons */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {modes.map((m) => {
          const MIcon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border font-medium transition-all cursor-pointer disabled:opacity-50 shrink-0",
                isActive ? cn(m.color, "shadow-sm") : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              <MIcon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Active branch indicator */}
      {activeBranch && (
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[9px] font-semibold text-blue-600">
              Mode {String(activeBranch.mode || "").toUpperCase()} — Etape {Number(activeBranch.step_index || 0) + 1}/{Number(activeBranch.total_steps || 0)}
            </span>
            <div className="flex-1 h-1 rounded-full bg-gray-200 max-w-[100px]">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Number(activeBranch.total_steps || 1) > 0 ? ((Number(activeBranch.step_index || 0) + 1) / Number(activeBranch.total_steps || 1)) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onAdvance} disabled={loading} className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer font-medium disabled:opacity-50">
              Avancer
            </button>
            <button onClick={onComplete} disabled={loading} className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 cursor-pointer font-medium disabled:opacity-50">
              Terminer
            </button>
            <button onClick={onCancel} disabled={loading} className="text-[9px] px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 cursor-pointer font-medium disabled:opacity-50">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// Bot Message Actions — options cliquables + Challenger/Approfondir/Consulter
// ══════════════════════════════════════════════

interface BotActionsProps {
  msg: { id: string; content: string; agent?: string; options?: string[]; bubbleContext?: BubbleContext };
  isLast: boolean;
  onOptionClick: (text: string) => void;
  onConsulterBot: (botCode: string) => void;
  onCrystallize: () => void;
  crystallized: boolean;
  disabled: boolean;
  availableBots: { code: string; nom: string; titre: string }[];
  currentBotCode: string;
  // Sprint Discussion 1 — phase-gating
  currentPhase?: string | null;
  exchangeCount?: number;
}

function BotMessageActions({
  msg,
  isLast,
  onOptionClick,
  onConsulterBot,
  onCrystallize,
  crystallized,
  disabled,
  availableBots,
  currentBotCode,
  currentPhase,
  exchangeCount = 0,
}: BotActionsProps) {
  const [showConsulter, setShowConsulter] = useState(false);

  // Visible sur le dernier message seulement — pas de hover confus
  if (!isLast || disabled) return null;

  const hasOptions = msg.options && msg.options.length > 0;

  return (
    <div className="mt-3 space-y-2">
      {/* Options backend — le bot propose les prochaines étapes */}
      {hasOptions && (
        <div className="flex flex-wrap gap-1.5">
          {msg.options!.map((opt, i) => (
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

      {/* Utilitaires discrets — Consulter (phase R+) + Cristalliser (phase D+) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Consulter un autre bot — visible à partir de la phase R (3+ échanges) */}
        {isPhaseAtLeast(currentPhase, "R") && (
        <div className="relative">
          <button
            onClick={() => setShowConsulter(!showConsulter)}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors cursor-pointer disabled:opacity-50 font-medium"
          >
            <Users className="h-3.5 w-3.5" />
            Consulter
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showConsulter && "rotate-180")} />
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
        )}

        {/* Cristalliser — visible à partir de la phase D (9+ échanges) */}
        {isPhaseAtLeast(currentPhase, "D") && (
        <button
          onClick={onCrystallize}
          disabled={disabled || crystallized}
          className={cn(
            "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full transition-colors cursor-pointer font-medium",
            crystallized
              ? "bg-emerald-200 text-emerald-800 border border-emerald-300"
              : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 disabled:opacity-50"
          )}
        >
          {crystallized ? (
            <><Check className="h-3.5 w-3.5" /> Cristallise</>
          ) : (
            <><Bookmark className="h-3.5 w-3.5" /> Cristalliser</>
          )}
        </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// TeamProposalCard — proposition d'équipe 3 bots
// ══════════════════════════════════════════════

interface TeamProposalCardProps {
  proposal: { bots: { code: string; name: string; emoji: string; role_tag: string; raison: string }[]; explication: string };
  onAccept: (bots: string[]) => void;
  disabled: boolean;
}

function TeamProposalCard({ proposal, onAccept, disabled }: TeamProposalCardProps) {
  const [accepted, setAccepted] = useState(false);
  const roleColors: Record<string, string> = {
    "PRIMAIRE": "bg-blue-100 text-blue-700 border-blue-300",
    "ANGLE MORT": "bg-amber-100 text-amber-700 border-amber-300",
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="flex items-center gap-2 mb-2 ml-10">
        <div className="w-6 h-px bg-blue-300" />
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
          <Users className="h-2.5 w-2.5" /> Équipe proposée
        </span>
        <div className="flex-1 h-px bg-blue-200" />
      </div>
      <div className="flex gap-3 ml-10">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md max-w-[90%] w-full">
          <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5" /> CarlOS compose votre équipe
          </div>

          {/* Bot cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {proposal.bots.map((bot) => {
              const info = BOT_COLORS[bot.code];
              return (
                <div key={bot.code} className={cn("bg-white rounded-xl p-3 border text-center", info?.border || "border-gray-200")}>
                  <div className="text-xl mb-1">{bot.emoji}</div>
                  <div className={cn("text-xs font-bold mb-1", info?.text || "text-gray-700")}>{bot.name}</div>
                  <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", roleColors[bot.role_tag] || "bg-gray-100 text-gray-600 border-gray-200")}>
                    {bot.role_tag}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">{bot.raison}</p>
                </div>
              );
            })}
          </div>

          {/* Explication LLM */}
          <p className="text-xs text-blue-800 leading-relaxed mb-3 italic">"{proposal.explication}"</p>

          {/* Bouton accepter */}
          <button
            onClick={() => {
              setAccepted(true);
              onAccept(proposal.bots.map(b => b.code));
            }}
            disabled={disabled || accepted}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer",
              accepted
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700 disabled:opacity-50"
            )}
          >
            {accepted ? (
              <><CheckCircle2 className="h-4 w-4" /> Équipe activée</>
            ) : (
              <><Users className="h-4 w-4" /> Activer cette équipe</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Component — affichage avec actions interactives
// ══════════════════════════════════════════════

export function LiveChat({
  onBack,
  compact = false,
  splitMode = false,
  splitTitle,
}: {
  initialMode?: string;
  onBack?: () => void;
  compact?: boolean;
  splitMode?: boolean;
  splitTitle?: string;
}) {
  const {
    messages, isTyping, activeReflectionMode, currentCREDOPhase, newConversation, sendMessage, sendMultiPerspective,
    threads, activeThreadId, parkThread, resumeThread, completeThread, deleteThread,
    crystals, crystallize, deleteCrystal, exportCrystals,
    videoAvatarEnabled, toggleVideoAvatar,
    injectVoiceMessage,
    activeRoster, addBotToRoster, removeBotFromRoster, acceptTeamProposal,
    exchangeCount, renameThread,
  } = useChatContext();
  const { activeBotCode } = useFrameMaster();
  const { bots } = useBots();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();
  // TTS retiré — Carl: audio = live stream vocal, pas lecture texte
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [showThreads, setShowThreads] = useState(false);
  const [showCrystals, setShowCrystals] = useState(false);
  const [justCrystallized, setJustCrystallized] = useState<string | null>(null);
  const [typewriterMsgId, setTypewriterMsgId] = useState<string | null>(null);
  // Sprint 2 — editable title
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const prevMsgCount = useRef(messages.length);

  // COMMAND mission tracking (BLOC 1)
  const command = useCommandMission();

  // Mode branch tracking (BLOC 2)
  const modeBranch = useModeBranch();

  const handleCommandLaunch = useCallback((message: string) => {
    if (!isTyping) command.launch(message);
  }, [isTyping, command]);

  const handleModeSelect = useCallback((mode: string) => {
    if (!isTyping) modeBranch.branch(mode);
  }, [isTyping, modeBranch]);

  // Kit personalization — greeting + C-Level name mapping + user avatar
  const [kitGreeting, setKitGreeting] = useState<string | null>(null);
  const [cLevelMap, setCLevelMap] = useState<Record<string, string> | null>(null);
  const [kitUserPhoto, setKitUserPhoto] = useState<string | null>(null);
  const greetingDoneRef = useRef<string | null>(null);

  useEffect(() => {
    api.getActiveKit().then(data => {
      if (data.greeting) setKitGreeting(data.greeting);
      if (data.c_level_mapping) setCLevelMap(data.c_level_mapping);
      if (data.user_profile?.photo) setKitUserPhoto(data.user_profile.photo);
    }).catch(() => {});
  }, []);

  // Inject greeting as CarlOS's first message when conversation is empty
  useEffect(() => {
    if (messages.length === 0 && kitGreeting && greetingDoneRef.current !== kitGreeting) {
      greetingDoneRef.current = kitGreeting;
      setTimeout(() => injectVoiceMessage("assistant", kitGreeting, "CEOB"), 150);
    }
    if (messages.length > 0) {
      greetingDoneRef.current = null;
    }
  }, [messages.length, kitGreeting, injectVoiceMessage]);

  // Override bot name from kit C-Level mapping
  const kitBotName = useCallback((code: string): string => {
    if (cLevelMap && cLevelMap[code]) return cLevelMap[code];
    return BOT_COLORS[code]?.name || code;
  }, [cLevelMap]);

  const kitBotFullName = useCallback((code: string): string => {
    const bot = BOT_COLORS[code];
    if (!bot) return code;
    const name = cLevelMap?.[code] || bot.name;
    return `${name} — ${bot.role}`;
  }, [cLevelMap]);

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
    credo: "Synthetise: (1) Tension identifiee, (2) Recherche faite, (3) Options exposees, (4) Meilleure option demontree, (5) Prochaines etapes concretes.",
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
        "CEOB",
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
        // Phase 2B — Promouvoir la discussion en mission
        case "Oui, creer la mission": {
          if (!activeThreadId) return;
          const thread = threads.find((t) => t.id === activeThreadId);
          const titre = thread?.title || "Nouvelle mission";
          api.createMission({ titre, bot_primaire: activeBotCode })
            .then((res) => {
              if (res?.id) {
                api.linkThreadToMission(res.id, activeThreadId!).catch(() => {});
              }
            })
            .catch(() => {});
          sendMessage("Mission creee. Je vais suivre l'avancement de ce sujet.", activeBotCode);
          return;
        }
        case "Pas encore":
        case "Non merci":
          // Dismiss nudge — just continue
          return;
        default:
          sendMessage(text, activeBotCode);
      }
    },
    [sendMessage, activeBotCode, isTyping, messages, parkThread, handleSynthesis, activeThreadId, threads]
  );

  // handleChallenge / handleApprofondir retirés — le backend propose les actions via msg.options

  const handleConsulterBot = useCallback(
    (botCode: string) => {
      if (!isTyping && lastUserMessage) {
        const botName = kitBotFullName(botCode);
        sendMessage(lastUserMessage, botCode, undefined, {
          msgType: "consultation",
          branchLabel: `Consultation — ${botName}`,
        });
      }
    },
    [sendMessage, lastUserMessage, isTyping, kitBotFullName]
  );

  // Actions Chef d'Orchestre retirées — le backend propose via msg.options

  const handleAcceptTeam = useCallback((bots: string[]) => {
    acceptTeamProposal(bots);
  }, [acceptTeamProposal]);

  // Multi-consultation / fusion / challenge retirés — le backend orchestre via msg.options

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
      {/* Header — harmonisé avec FocusModeLayout en split mode */}
      {(() => {
        const botInfo = BOT_COLORS[activeBotCode] || BOT_COLORS.CEOB;
        const SPLIT_GRADIENTS: Record<string, string> = {
          CEOB: "bg-blue-600", CTOB: "bg-violet-600",
          CFOB: "bg-emerald-600", CMOB: "bg-pink-600",
          CSOB: "bg-red-600", COOB: "bg-orange-600",
          CPOB: "bg-slate-600", CHROB: "bg-teal-600",
          CINOB: "bg-rose-600", CROB: "bg-amber-600",
          CLOB: "bg-indigo-600", CISOB: "bg-zinc-600",
        };
        const splitBg = SPLIT_GRADIENTS[activeBotCode] || "bg-blue-600";
        const txtColor = splitMode ? "text-white" : "text-gray-800";
        const txtMuted = splitMode ? "text-white/60" : "text-gray-400";
        const hoverBg = splitMode ? "hover:bg-white/10" : "hover:bg-gray-100";
        const hoverTxt = splitMode ? "hover:text-white" : "hover:text-gray-600";
        return (
          <div className={cn(
            "shrink-0",
            compact ? "px-3 py-1.5" : "px-4 py-2",
            splitMode ? splitBg : "bg-white/80 backdrop-blur-sm border-b"
          )}>
            {/* Ligne 1: Titre + actions + équipe */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {onBack && !compact && (
                  <button onClick={onBack} className={cn(txtMuted, hoverTxt, "cursor-pointer p-1 rounded-lg", hoverBg, "transition-colors")}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                {/* Pas d'avatar en ligne 1 splitMode — déjà dans ligne 2 "Equipe" */}
                {splitMode && splitTitle ? (
                  /* En splitMode: titre fixe = le sujet global (Blueprint, DocForge, etc.) */
                  <span className={cn("font-semibold truncate text-xs text-white max-w-[240px]")}>
                    {splitTitle}
                  </span>
                ) : editingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={() => {
                      if (titleDraft.trim() && activeThreadId) renameThread(activeThreadId, titleDraft.trim());
                      setEditingTitle(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.currentTarget.blur(); }
                      if (e.key === "Escape") { setEditingTitle(false); }
                    }}
                    className={cn("text-sm font-semibold bg-transparent border-b outline-none max-w-[300px] px-0.5", splitMode ? "text-white border-white/50" : "text-gray-800 border-blue-400")}
                  />
                ) : (
                  <button
                    onClick={() => {
                      const current = threads.find(t => t.id === activeThreadId)?.title || "";
                      setTitleDraft(current);
                      setEditingTitle(true);
                    }}
                    className="flex items-center gap-1.5 min-w-0 group cursor-pointer"
                  >
                    <span className={cn("font-semibold truncate", txtColor, compact ? "text-xs max-w-[160px]" : "text-xs max-w-[240px]")}>
                      {threads.find(t => t.id === activeThreadId)?.title || "Nouvelle discussion"}
                    </span>
                    <Pencil className={cn("h-3.5 w-3.5 transition-colors shrink-0", splitMode ? "text-white/30 group-hover:text-white/60" : "text-gray-300 group-hover:text-gray-500")} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={parkThread} className={cn(txtMuted, hoverTxt, "cursor-pointer p-1.5 rounded-lg", hoverBg, "transition-colors flex items-center gap-1")} title="Parker">
                    <Clock className="h-3.5 w-3.5" />
                    {splitMode && <span className="text-[9px] font-medium">Parker</span>}
                  </button>
                )}
                <button
                  onClick={() => { setShowCrystals(!showCrystals); setShowThreads(false); }}
                  className={cn("flex items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer",
                    showCrystals
                      ? (splitMode ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600")
                      : cn(txtMuted, hoverTxt, hoverBg)
                  )}
                  title="Mes Idées"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {splitMode && <span className="text-[9px] font-medium">Idées</span>}
                  {crystals.length > 0 && <span className={cn("text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center", splitMode ? "bg-white/25 text-white" : "bg-emerald-500 text-white")}>{crystals.length}</span>}
                </button>
                <button
                  onClick={() => { setShowThreads(!showThreads); setShowCrystals(false); }}
                  className={cn("flex items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer",
                    showThreads
                      ? (splitMode ? "bg-white/20 text-white" : "bg-violet-50 text-violet-600")
                      : cn(txtMuted, hoverTxt, hoverBg)
                  )}
                  title="Threads"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {splitMode && <span className="text-[9px] font-medium">Discussions</span>}
                  {parkedThreads.length > 0 && <span className={cn("text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center", splitMode ? "bg-white/25 text-white" : "bg-amber-500 text-white")}>{parkedThreads.length}</span>}
                </button>
                {messages.length > 0 && (
                  <button onClick={newConversation} className={cn(txtMuted, hoverTxt, "cursor-pointer p-1.5 rounded-lg", hoverBg, "transition-colors flex items-center gap-1")} title="Nouvelle discussion">
                    <Plus className="h-3.5 w-3.5" />
                    {splitMode && <span className="text-[9px] font-medium">Nouveau</span>}
                  </button>
                )}
                {!splitMode && (
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-green-600 font-medium">LIVE</span>
                  </div>
                )}
              </div>
            </div>
            {/* Ligne 2: Équipe active (splitMode) — avatars + noms + ajouter agent */}
            {splitMode && !compact && (
              <div className="flex items-center gap-2 pt-1 mt-1 border-t border-white/15">
                {activeRoster.map((code, idx) => {
                  const info = BOT_COLORS[code];
                  return (
                    <div key={code} className="flex items-center gap-1">
                      <BotAvatar code={code} size="sm" />
                      <span className="text-[9px] text-white font-medium">{info?.name || code}</span>
                      <span className="text-[9px] text-white/50">{info?.role || ""}</span>
                      {activeRoster.length > 1 && (
                        <button onClick={() => removeBotFromRoster(code)} className="text-white/30 hover:text-white/70 cursor-pointer transition-colors" title={`Retirer ${info?.name}`}>
                          <span className="text-xs">×</span>
                        </button>
                      )}
                    </div>
                  );
                })}
                {activeRoster.length < 3 && (
                  <select
                    onChange={(e) => { if (e.target.value) { addBotToRoster(e.target.value); e.target.value = ""; } }}
                    className="text-[9px] text-white/70 bg-white/10 border border-dashed border-white/30 rounded-full px-2.5 py-0.5 cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled className="text-gray-800 bg-white">+ Ajouter un agent</option>
                    {Object.entries(BOT_COLORS)
                      .filter(([c]) => !activeRoster.includes(c))
                      .map(([c, info]) => (
                        <option key={c} value={c} className="text-gray-800 bg-white">{info.name} — {info.role}</option>
                      ))
                    }
                  </select>
                )}
              </div>
            )}
            {/* Ligne 2: Équipe active (mode normal) + dots CREDO */}
            {!compact && !splitMode && (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5">
                  {activeRoster.map((code) => (
                    <BotAvatar key={code} code={code} size="sm" />
                  ))}
                  {activeRoster.length < 3 && (
                    <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {CREDO_ORDER.map((phase) => {
                      const cfg = CREDO_PHASE_CONFIG[phase];
                      const isActive = currentCREDOPhase === phase;
                      const isReached = isPhaseAtLeast(currentCREDOPhase, phase);
                      return (
                        <div
                          key={phase}
                          title={cfg?.label || phase}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            isActive ? cn(cfg?.color || "bg-gray-400", "ring-2 ring-offset-1 ring-gray-300 scale-125") :
                            isReached ? (cfg?.color || "bg-gray-400") : "bg-gray-200"
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {CREDO_PHASE_CONFIG[currentCREDOPhase]?.label || "Connecter"}, {exchangeCount} éch
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Avatar video CarlOS */}
      {videoAvatarEnabled && (
        <CarlOSAvatar onClose={toggleVideoAvatar} />
      )}

      {/* Mode Bar retiré — les modes de réflexion sont dans le cockpit (sidebar droite) */}

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
                      <span className={cn("font-medium", botInfo?.text || "text-gray-500")}>{botInfo ? kitBotFullName(crystal.bot) : crystal.bot}</span>
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
        <div className={cn(compact ? "px-3 py-4 space-y-3" : "max-w-3xl mx-auto px-10 py-5 space-y-5")}>

          {/* Empty state + Suggestions Welcome (BLOC 4) */}
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
                <SuggestionsWelcome
                  onSelect={(text) => sendMessage(text, activeBotCode)}
                  disabled={isTyping}
                />
              </div>
            </div>
          )}

          {/* COMMAND Progress Card — mission en cours (BLOC 1) */}
          {command.status && !command.status.completed && (
            <CommandProgressCard status={command.status} />
          )}

          {/* Perspectives bar retirée — trop d'options sans logique contextuelle */}

          {/* Roster de bots actifs — en splitMode, l'équipe est dans le header */}
          {!splitMode && activeRoster.length > 0 && messages.length > 0 && (
            <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-xl border border-gray-100">
              <Bot className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="text-[10px] text-gray-400 font-medium shrink-0">Équipe active :</span>
              <div className="flex gap-1.5 flex-wrap flex-1">
                {activeRoster.map((code) => {
                  const info = BOT_COLORS[code];
                  return (
                    <div key={code} className={cn(
                      "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border",
                      info?.text || "text-gray-600",
                      info?.border ? info.border.replace("border-l-", "border-") : "border-gray-200"
                    )}>
                      <span>{info?.emoji || "🤖"}</span>
                      <span>{info?.name || code}</span>
                      {activeRoster.length > 1 && (
                        <button
                          onClick={() => removeBotFromRoster(code)}
                          className="ml-0.5 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                          title={`Retirer ${info?.name || code}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {activeRoster.length < 3 && (
                <div className="relative">
                  <select
                    onChange={(e) => { if (e.target.value) { addBotToRoster(e.target.value); e.target.value = ""; } }}
                    className="text-[10px] text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-full px-2 py-0.5 cursor-pointer appearance-none pr-5"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Bot</option>
                    {Object.entries(BOT_COLORS)
                      .filter(([code]) => !activeRoster.includes(code))
                      .map(([code, info]) => (
                        <option key={code} value={code}>{info.emoji} {info.name}</option>
                      ))
                    }
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, idx) => {
            const agentInfo = msg.agent ? BOT_COLORS[msg.agent] : null;
            const isUser = msg.role === "user";
            const isSystem = msg.role === "system";
            const isChallenge = msg.msgType === "challenge";
            const isConsultation = msg.msgType === "consultation";
            const isSynthesis = msg.msgType === "synthesis";
            const isCoaching = msg.msgType === "coaching";
            const isVoice = msg.msgType === "voice";
            const isFocusCard = msg.msgType === "focus_card";
            const isTeamProposal = msg.msgType === "team_proposal";
            const isDiagnosticMsg = msg.isDiagnostic === true;
            const depth = msg.branchDepth || 0;

            // Skip empty streaming messages — ThinkingAnimation is already visible
            if (msg.isStreaming && !msg.content) return null;

            // ── Focus Card — injection depuis le dashboard (style BotBubble simulation) ──
            if (isFocusCard) {
              const bot = msg.agent ? (BOT_COLORS[msg.agent] || BOT_COLORS.CEOB) : BOT_COLORS.CEOB;
              const fc = msg.focusCardData;
              return (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex gap-3">
                    <BotAvatar code={msg.agent || "CEOB"} size="md" className="mt-1 shrink-0" />
                    <div className={cn(
                      "rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%] border border-l-[3px]",
                      bot.bgLight, bot.border
                    )}>
                      {/* Header: titre + badge role */}
                      <div className={cn("text-xs font-bold mb-3 flex items-center gap-1.5", bot.text)}>
                        <span className="text-base leading-none">{bot.emoji}</span>
                        <span className="flex-1">{fc?.title || "Focus"}</span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0", bot.bg)}>
                          {bot.role}
                        </span>
                      </div>
                      {/* Items de données */}
                      {fc?.items && fc.items.length > 0 && (
                        <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-200">
                          {fc.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center gap-4 text-xs">
                              <span className="text-gray-500 truncate">{item.label}</span>
                              <span className={cn("font-semibold shrink-0", bot.text)}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Question d'ouverture — TypewriterText */}
                      <p className={cn("text-sm leading-relaxed mb-3", bot.text)}>
                        {typewriterMsgId === msg.id ? (
                          <TypewriterText
                            text={msg.content}
                            speed={12}
                            onComplete={() => setTypewriterMsgId(null)}
                          />
                        ) : (
                          msg.content
                        )}
                      </p>
                      {/* Quick actions */}
                      {fc?.quickActions && fc.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {fc.quickActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(action)}
                              disabled={isTyping}
                              className={cn(
                                "text-xs px-3 py-1.5 rounded-full bg-white border font-medium transition-colors cursor-pointer hover:shadow-sm disabled:opacity-50",
                                bot.border, bot.text
                              )}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // ── Coaching messages — CarlOS encadrement ──
            if (isCoaching || isSystem) {
              return (
                <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <BotAvatar code="CEOB" size="md" className="mt-1" />
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
                    <BotAvatar code="CEOB" size="md" className="mt-1" />
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
                          <button
                            onClick={() => copy(msg.id, msg.content)}
                            className="text-amber-400 hover:text-amber-600 cursor-pointer p-1 rounded transition-colors"
                            title="Copier la synthese"
                          >
                            {copied === msg.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Team Proposal card ──
            if (isTeamProposal && msg.teamProposal) {
              return (
                <TeamProposalCard
                  key={msg.id}
                  proposal={msg.teamProposal}
                  onAccept={handleAcceptTeam}
                  disabled={isTyping}
                />
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
                      code={msg.agent || "CEOB"}
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
                    {/* Voice indicator */}
                    {isVoice && isUser && (
                      <div className="flex items-center gap-1 mb-1 opacity-60">
                        <Mic className="h-2.5 w-2.5" />
                        <span className="text-[9px] font-medium">Vocal</span>
                      </div>
                    )}

                    {/* Agent name + écouter/copier en haut */}
                    {!isUser && agentInfo && (
                      <div className={cn("text-xs mb-2 font-semibold flex items-center gap-1.5", agentInfo.text)}>
                        {kitBotFullName(msg.agent || "CEOB")}
                        {isVoice && <Mic className="h-2.5 w-2.5 opacity-50" />}
                        {isDiagnosticMsg && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 ml-1">
                            Diagnostic
                          </span>
                        )}
                        {/* Copier — en haut à droite */}
                        <span className="ml-auto flex items-center gap-0.5">
                          <button
                            onClick={() => copy(msg.id, msg.content)}
                            className="text-gray-300 hover:text-gray-500 cursor-pointer p-1 rounded transition-colors"
                            title="Copier"
                          >
                            {copied === msg.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </span>
                      </div>
                    )}

                    {/* S43 — Scaffold Bandeau "Cadrage en cours" */}
                    {!isUser && msg.scaffoldProgress && msg.scaffoldProgress.completude < 3 && (
                      <div className="mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-semibold text-blue-700 uppercase tracking-wider">
                            VERITE {msg.scaffoldProgress.completude}/3
                          </span>
                          <span className="text-[9px] text-blue-500">
                            {msg.scaffoldProgress.completude === 0 ? "En attente de contexte" :
                             msg.scaffoldProgress.completude === 1 ? "Bon debut" : "Presque complet"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[
                            { key: "ancrage", label: "Contexte", filled: msg.scaffoldProgress.ancrage },
                            { key: "intention", label: "Objectif", filled: msg.scaffoldProgress.intention },
                            { key: "contraintes", label: "Limites", filled: msg.scaffoldProgress.contraintes },
                          ].map((slot) => (
                            <div key={slot.key} className="group relative flex items-center gap-1">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-500 ease-out",
                                  slot.filled
                                    ? "bg-emerald-500 scale-125 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                                    : "bg-gray-300 scale-100"
                                )}
                              />
                              <span className={cn(
                                "text-[9px] transition-colors duration-300",
                                slot.filled ? "text-emerald-700 font-medium" : "text-gray-400"
                              )}>
                                {slot.label} {slot.filled ? "✓" : ""}
                              </span>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {slot.filled
                                  ? `${slot.label} — capté`
                                  : slot.key === "ancrage" ? "Secteur, taille, CA..."
                                    : slot.key === "intention" ? "Objectif précis visé"
                                    : "Budget, délai, interdits"
                                }
                              </div>
                            </div>
                          ))}
                        </div>
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

                    {/* Canvas Action Badges — RETIRÉ Sprint Discussion 1 (Bug 1: navigation parasite) */}

                    {/* Cascade Suggestions — pilules inter-departements */}
                    {!isUser && msg.cascadeSuggestions && msg.cascadeSuggestions.length > 0 && (
                      <CascadeSuggestionsCard suggestions={msg.cascadeSuggestions} />
                    )}

                    {/* D-108 — Footer contextuel dynamique (section, CREDO, mode, mission) */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <BubbleFooterContext ctx={msg.bubbleContext} />
                      </div>
                    )}

                    {/* Actions interactives — branches */}
                    {!isUser && (
                      <BotMessageActions
                        msg={msg}
                        isLast={msg.id === lastBotMsgId}
                        onOptionClick={handleOptionClick}
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
                        currentPhase={currentCREDOPhase}
                        exchangeCount={exchangeCount}
                      />
                    )}

                    {/* COMMAND Launch Banner — quand command_active detecte (BLOC 1) */}
                    {!isUser && msg.bubbleContext?.command_active && msg.id === lastBotMsgId && (
                      <CommandLaunchBanner
                        ctx={msg.bubbleContext}
                        onLaunch={() => handleCommandLaunch(msg.content)}
                        disabled={isTyping || command.loading}
                      />
                    )}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-300 mt-1">
                      <img src={kitUserPhoto || USER_AVATAR} alt="Vous" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Synthese — bouton discret, apparaît après 4+ échanges avec le bot */}
          {!isTyping && messages.filter(m => m.role === "assistant").length >= 4 && !messages.some(m => m.msgType === "synthesis") && (
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
              <BotAvatar code="CEOB" size="md" className="mt-1" />
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
