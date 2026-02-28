/**
 * simulation-components.tsx — Composants partages pour toutes les simulations
 * TypewriterText, ThinkingAnimation, MultiConsultAnimation, BotAvatar,
 * SourcesList, InlineOptions, PhaseIndicator, ModeSelector
 * Sprint A — Frame Master V2
 */

"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Loader2,
  Network,
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { BOT_COLORS, SOURCE_ICONS, REFLECTION_MODES } from "./simulation-data";
import type { CREDOPhase, Source, ThinkingStep, ConsultBot, InlineOption } from "./simulation-types";

// ========== TYPEWRITER ==========

export function TypewriterText({ text, speed = 12, onComplete, className }: {
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
      {!done && <span className="inline-block w-0.5 h-4 bg-gray-800 ml-0.5 animate-pulse align-text-bottom" />}
    </span>
  );
}

// ========== BOT AVATAR ==========

export function BotAvatar({ code, size = "md", className }: { code: string; size?: "sm" | "md" | "lg"; className?: string }) {
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

// ========== THINKING ANIMATION ==========

export function ThinkingAnimation({ steps, botEmoji, botName, botCode, onComplete, speed = 800 }: {
  steps: ThinkingStep[];
  botEmoji: string;
  botCode?: string;
  botName: string;
  onComplete: () => void;
  speed?: number;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 400);
      return;
    }
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, speed + Math.random() * 600);
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const botColor = botCode ? BOT_COLORS[botCode] : null;

  return (
    <div className="flex gap-3">
      {botCode ? (
        <BotAvatar code={botCode} size="md" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">{botEmoji}</div>
      )}
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm min-w-[280px]", botColor && `border-l-[3px] ${botColor.border}`)}>
        <div className={cn("text-xs mb-2", botColor?.text || "text-gray-400")}>{botName} reflechit...</div>
        <div className="space-y-1.5">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = completedSteps.includes(i);
            const isPending = i > currentStep;
            if (isPending) return null;
            const Icon = step.icon;
            return (
              <div key={i} className={cn(
                "flex items-center gap-2 text-sm transition-all",
                isActive && (botColor?.text || "text-blue-600"),
                isDone && "text-green-600",
              )}>
                {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                <Icon className="h-3.5 w-3.5" />
                <span className={cn(isDone && "line-through opacity-60")}>{step.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== MULTI CONSULT ANIMATION ==========

export function MultiConsultAnimation({ bots, onComplete }: {
  bots: ConsultBot[];
  onComplete: () => void;
}) {
  const [activeBot, setActiveBot] = useState(0);
  const [phase, setPhase] = useState<"consulting" | "consolidating">("consulting");

  useEffect(() => {
    if (phase === "consulting") {
      if (activeBot >= bots.length) {
        setPhase("consolidating");
        return;
      }
      const timer = setTimeout(() => setActiveBot(prev => prev + 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeBot, phase, bots.length]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Network className="h-4 w-4 text-blue-600 animate-pulse" />
          <span className="text-sm font-semibold text-blue-800">
            {phase === "consulting" ? "Consultation des departements..." : "Consolidation des perspectives..."}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {bots.map((bot, i) => {
            const isActive = phase === "consulting" && i === activeBot;
            const isDone = i < activeBot;
            const botColor = bot.code ? BOT_COLORS[bot.code] : null;
            return (
              <div key={i} className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive && "scale-110",
                !isDone && !isActive && "opacity-30",
              )}>
                <div className={cn(
                  "relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all",
                  isActive && (botColor ? cn(botColor.border, "shadow-md") : "border-blue-500 shadow-md"),
                  isDone && "border-green-500",
                  !isDone && !isActive && "border-gray-200",
                )}>
                  {bot.code && BOT_COLORS[bot.code]?.avatar ? (
                    <img src={BOT_COLORS[bot.code].avatar} alt={bot.name} className={cn("w-full h-full object-cover", isActive && "opacity-50", !isDone && !isActive && "opacity-30")} />
                  ) : (
                    <div className={cn("w-full h-full flex items-center justify-center text-lg", isActive ? "bg-blue-50" : isDone ? "bg-green-50" : "bg-gray-50")}>
                      <span className={cn(isActive && "opacity-50")}>{bot.emoji}</span>
                    </div>
                  )}
                  {isActive && <Loader2 className={cn("h-5 w-5 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", botColor ? botColor.text : "text-blue-500")} />}
                </div>
                <span className={cn("text-xs font-medium", isDone ? "text-gray-600" : botColor ? botColor.text : "text-gray-600")}>{bot.name}</span>
                {isDone && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              </div>
            );
          })}

          {phase === "consolidating" && (
            <div className="flex items-center gap-2 ml-2 animate-pulse">
              <ArrowRight className="h-4 w-4 text-indigo-500" />
              <Zap className="h-5 w-5 text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== PHASE INDICATOR ==========

export function PhaseIndicator({ phase }: { phase: CREDOPhase }) {
  const phases: { id: CREDOPhase; label: string; full: string }[] = [
    { id: "C", label: "C", full: "Connecter" },
    { id: "R", label: "R", full: "Rechercher" },
    { id: "E", label: "E", full: "Exposer" },
    { id: "D", label: "D", full: "Demontrer" },
    { id: "O", label: "O", full: "Obtenir" },
  ];

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => {
        const isActive = p.id === phase;
        const isPast = phases.findIndex(x => x.id === phase) > i;
        const isDone = phase === "done";
        return (
          <div key={p.id} className="flex items-center gap-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
              isActive && "bg-blue-600 text-white shadow-md scale-110",
              isPast || isDone ? "bg-green-500 text-white" : "",
              !isActive && !isPast && !isDone && "bg-gray-200 text-gray-500",
            )}>
              {isPast || isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : p.label}
            </div>
            {i < phases.length - 1 && (
              <div className={cn(
                "w-4 h-0.5 transition-all duration-500",
                isPast || isDone ? "bg-green-400" : "bg-gray-200",
              )} />
            )}
          </div>
        );
      })}
      <span className="text-xs text-muted-foreground ml-2 font-medium">
        {phase === "done" ? "Cristallise" : phases.find(p => p.id === phase)?.full}
      </span>
    </div>
  );
}

// ========== SOURCES LIST ==========

export function SourcesList({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {sources.map((s, i) => {
        const cfg = SOURCE_ICONS[s.type];
        const Icon = cfg.icon;
        return (
          <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 hover:bg-gray-100 cursor-pointer transition-colors">
            <Icon className={cn("h-3 w-3 shrink-0", cfg.color)} />
            <span className="truncate max-w-[160px]">{s.label}</span>
          </span>
        );
      })}
    </div>
  );
}

// ========== INLINE OPTIONS ==========

export function InlineOptions({ options, onSelect, animate }: {
  options: InlineOption[];
  onSelect: (num: number) => void;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  const borderColors = ["border-l-blue-500", "border-l-amber-500", "border-l-green-500", "border-l-red-500"];
  const hoverBgs = ["hover:bg-blue-50", "hover:bg-amber-50", "hover:bg-green-50", "hover:bg-red-50"];

  return (
    <div className="mt-3 space-y-1.5 animate-in fade-in duration-500">
      {options.map((opt, i) => (
        <button
          key={opt.num}
          onClick={() => onSelect(opt.num)}
          className={cn(
            "w-full text-left border border-gray-200 rounded-lg px-3 py-2 transition-all",
            "border-l-[3px]",
            borderColors[i % borderColors.length],
            hoverBgs[i % hoverBgs.length],
            "hover:shadow-sm group cursor-pointer",
          )}
        >
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{opt.num}.</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{opt.text}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{opt.consequence}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ========== MODE SELECTOR ==========

export function ModeSelector({ activeMode, onChangeMode }: {
  activeMode: string;
  onChangeMode: (mode: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-gray-500 font-medium mr-1">Mode :</span>
      {REFLECTION_MODES.map(m => {
        const isActive = activeMode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChangeMode(m.id)}
            className={cn(
              "text-[11px] px-2 py-1 rounded-full flex items-center gap-1 font-medium transition-all",
              isActive
                ? cn(m.bg, m.text, "ring-1", m.ring)
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600",
            )}
          >
            <Icon className="h-3 w-3" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

// ========== USER BUBBLE ==========

export function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex gap-3 justify-end">
      <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
        <p className="text-sm text-blue-900">{text}</p>
        <span className="text-[10px] text-blue-400 mt-1 block text-right">{time}</span>
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
        <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

// ========== BOT BUBBLE ==========

export function BotBubble({ code, text, phaseLabel, time, typewrite, onTypewriteDone, children }: {
  code: string;
  text: string;
  phaseLabel?: string;
  time?: string;
  typewrite?: boolean;
  onTypewriteDone?: () => void;
  children?: React.ReactNode;
}) {
  const botColor = BOT_COLORS[code];
  if (!botColor) return null;

  return (
    <div className="flex gap-3">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm", botColor.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-xs font-semibold", botColor.text)}>{botColor.name} ({botColor.role})</span>
          {phaseLabel && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{phaseLabel}</span>}
        </div>
        {typewrite ? (
          <TypewriterText text={text} speed={12} className="text-sm text-gray-800" onComplete={onTypewriteDone} />
        ) : (
          <p className="text-sm text-gray-800">{text}</p>
        )}
        {time && <span className="text-[10px] text-gray-400 mt-1 block">{time}</span>}
        {children}
      </div>
    </div>
  );
}
