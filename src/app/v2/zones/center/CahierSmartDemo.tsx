/**
 * CahierSmartDemo.tsx — Mega-Simulation Cahier SMART en 3 Actes
 * Acte 1 : Tension de depart (diagnostic AI multi-bot)
 * Acte 2 : Jumelage SMART (selection integrateur via reseau Usine Bleue)
 * Acte 3 : Construction du Cahier de Projet + livraison PDF
 * Entreprise fictive : Aliments Boreal inc. (manufacturier alimentaire, Saguenay)
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  Loader2,
  Brain,
  Cpu,
  Database,
  Network,
  Scan,
  BookOpen,
  Zap,
  Target,
  Send,
  Bot,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Building2,
  Wrench,
  ThermometerSun,
  Plug,
  Factory,
  ClipboardCheck,
  Calendar,
  UserCheck,
  Shield,
  DollarSign,
  TrendingDown,
  RotateCcw,
  AlertTriangle,
  Award,
  Gauge,
  Cog,
  LineChart,
  Users,
  MapPin,
  Hash,
  CircleDot,
  Download,
  Share2,
  Search,
  Filter,
  Star,
  Trophy,
  Handshake,
  ArrowDown,
  ChevronRight,
  PartyPopper,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import {
  BOT_COLORS,
  USER_AVATAR,
  SIM_ACTE1,
  SIM_ACTE2,
  SIM_ACTE3,
  INTEGRATORS,
} from "./cahier-smart-data";
import type { Integrator } from "./cahier-smart-data";

// ========== ANIMATION COMPONENTS ==========

function TypewriterText({ text, speed = 12, onComplete, className }: {
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

function ThinkingAnimation({ steps, botName, botCode, onComplete }: {
  steps: { icon: React.ElementType; text: string }[];
  botName: string;
  botCode?: string;
  onComplete: () => void;
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
    }, 800 + Math.random() * 600);
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const botColor = botCode ? BOT_COLORS[botCode] : null;

  return (
    <div className="flex gap-3">
      {botCode ? (
        <BotAvatar code={botCode} size="md" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
          <Bot className="h-4 w-4 text-gray-500" />
        </div>
      )}
      <div className={cn(
        "bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm min-w-[280px]",
        botColor && `border-l-[3px] ${botColor.border}`
      )}>
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

function MultiConsultAnimation({ bots, onComplete }: {
  bots: { emoji: string; name: string; code?: string }[];
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

const SOURCE_ICONS = {
  doc: { icon: FileText, color: "text-blue-500" },
  stat: { icon: BarChart3, color: "text-emerald-500" },
  data: { icon: Database, color: "text-purple-500" },
};

function SourcesList({ sources }: { sources: { type: "doc" | "stat" | "data"; label: string }[] }) {
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

// ========== ACTE INDICATOR (3 actes) ==========

type Acte = 1 | 2 | 3;

function ActeIndicator({ currentActe, progress }: { currentActe: Acte | "complete"; progress: number }) {
  const actes = [
    { id: 1 as const, label: "Tension", icon: Zap, color: "bg-red-500" },
    { id: 2 as const, label: "Jumelage", icon: Handshake, color: "bg-amber-500" },
    { id: 3 as const, label: "Cahier", icon: FileText, color: "bg-blue-500" },
  ];

  const currentIdx = currentActe === "complete" ? 3 : currentActe - 1;

  return (
    <div className="flex items-center gap-1">
      {actes.map((a, i) => {
        const isActive = i === currentIdx;
        const isPast = i < currentIdx;
        const Icon = a.icon;
        return (
          <div key={a.id} className="flex items-center gap-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500",
              isActive && cn(a.color, "text-white shadow-md scale-110"),
              isPast ? "bg-green-500 text-white" : "",
              !isActive && !isPast && "bg-gray-200 text-gray-400",
            )}>
              {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </div>
            <span className={cn(
              "text-[10px] font-medium hidden sm:inline",
              isActive ? "text-gray-700" : isPast ? "text-green-600" : "text-gray-400",
            )}>{a.label}</span>
            {i < actes.length - 1 && (
              <div className={cn(
                "w-4 h-0.5 transition-all duration-500",
                isPast ? "bg-green-400" : "bg-gray-200",
              )} />
            )}
          </div>
        );
      })}
      {currentActe !== "complete" && progress > 0 && (
        <span className="text-xs text-blue-600 ml-2 font-semibold">{progress}%</span>
      )}
      {currentActe === "complete" && (
        <span className="text-xs text-green-600 ml-2 font-semibold flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Complet
        </span>
      )}
    </div>
  );
}

// ========== PROGRESS BAR ==========

function CahierProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-blue-700">{pct}%</span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ========== TRANSITION BANNER ==========

function TransitionBanner({ from, to, animate }: { from: string; to: string; animate: boolean }) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl px-6 py-5 shadow-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          <span className="text-lg font-bold text-white">{from}</span>
          <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <ArrowRight className="h-4 w-4 text-yellow-300" />
          <span className="text-sm font-semibold text-yellow-200">{to}</span>
        </div>
      </div>
    </div>
  );
}

// ========== MULTI-PERSPECTIVES CARD ==========

function PerspectivesCard({ perspectives, onContinue, animate }: {
  perspectives: typeof SIM_ACTE1.perspectives;
  onContinue: () => void;
  animate: boolean;
}) {
  const [visibleCols, setVisibleCols] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    const timers = [
      setTimeout(() => setVisibleCols(1), 300),
      setTimeout(() => setVisibleCols(2), 800),
      setTimeout(() => setVisibleCols(3), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b">
          <Network className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-700">Multi-perspectives — 3 specialistes</span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto font-medium flex items-center gap-1">
            <Zap className="h-3 w-3" /> Diagnostic energie
          </span>
        </div>

        <div className="grid grid-cols-3 gap-0 divide-x">
          {perspectives.map((p, i) => {
            const botColor = BOT_COLORS[p.code];
            return (
              <div key={p.code} className={cn(
                "transition-all duration-500",
                i < visibleCols ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}>
                <div className={cn("h-1.5", botColor?.bg || "bg-gray-300")} />
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BotAvatar code={p.code} size="md" />
                    <div>
                      <div className={cn("text-sm font-bold", botColor?.text || "text-gray-800")}>
                        {botColor?.name || p.name} <span className="text-xs font-normal text-gray-400">({botColor?.role})</span>
                      </div>
                      <div className="text-xs text-gray-400">{p.angle}</div>
                    </div>
                  </div>
                  {i < visibleCols ? (
                    <TypewriterText text={p.text} speed={4} className="text-sm text-gray-600 leading-relaxed whitespace-pre-line" />
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.text}</p>
                  )}
                  <div className={cn(
                    "mt-2 text-xs px-2 py-1 rounded font-medium transition-all duration-300",
                    i < visibleCols ? "opacity-100" : "opacity-0",
                    p.color === "green" && "bg-green-50 text-green-700",
                    p.color === "orange" && "bg-orange-50 text-orange-700",
                  )}>
                    {p.verdict}
                  </div>
                  {i < visibleCols && <SourcesList sources={p.sources} />}
                </div>
              </div>
            );
          })}
        </div>

        {visibleCols >= 3 && (
          <div className="bg-gray-50 px-4 py-2.5 border-t animate-in fade-in duration-500">
            <button
              onClick={onContinue}
              className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium"
            >
              <Brain className="h-3.5 w-3.5" /> Synthetiser le diagnostic preliminaire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== SYNTHESE CARD ==========

function SyntheseCard({ data, animate }: { data: typeof SIM_ACTE1.syntheseCard; animate: boolean }) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); } }, [animate]);
  if (!visible) return null;

  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-gradient-to-b from-green-50 to-white border border-green-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-green-50 px-4 py-2.5 flex items-center gap-2 border-b border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-bold text-green-800">Synthese du diagnostic preliminaire</span>
        </div>
        <div className="p-4 space-y-3">
          {/* CEO intro text */}
          {data.ceoIntro && (
            <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2.5">
              <BotAvatar code="BCO" size="sm" className="mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">{data.ceoIntro}</p>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Points cles</div>
            <ul className="space-y-1.5">
              {data.pointsCles.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Risques identifies</div>
            <ul className="space-y-1.5">
              {data.risques.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ACTE 2 COMPONENTS ==========

function NetworkScanAnimation({ steps, onComplete }: {
  steps: { label: string; count: number }[];
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCount, setCurrentCount] = useState(steps[0]?.count || 0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 600);
      return;
    }
    // Animate count for current step
    const targetCount = steps[currentStep].count;
    const prevCount = currentStep > 0 ? steps[currentStep - 1].count : 130;
    const diff = prevCount - targetCount;
    const duration = 800;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCurrentCount(Math.round(prevCount - diff * progress));
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => setCurrentStep(prev => prev + 1), 400);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [currentStep, steps.length]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-amber-600 animate-pulse" />
          <span className="text-sm font-bold text-amber-800">Scan du reseau Usine Bleue</span>
        </div>

        {/* Counter */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-amber-700 tabular-nums">{currentCount}</div>
          <div className="text-xs text-amber-600 mt-1">
            {currentStep < steps.length ? steps[currentStep].label : "TOP 3 identifies"}
          </div>
        </div>

        {/* Progress steps */}
        <div className="space-y-2">
          {steps.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div key={i} className={cn(
                "flex items-center gap-3 text-sm transition-all duration-300",
                isDone && "text-green-600",
                isActive && "text-amber-700 font-medium",
                !isDone && !isActive && "text-gray-400",
              )}>
                {isDone && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                {isActive && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                {!isDone && !isActive && <Filter className="h-4 w-4 shrink-0" />}
                <span className="flex-1">{step.label}</span>
                <span className="font-bold tabular-nums">{isDone ? step.count : isActive ? currentCount : "..."}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IntegratorCard({ integrator, rank, animate, delay = 0 }: {
  integrator: Integrator;
  rank: number;
  animate: boolean;
  delay?: number;
}) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [animate, delay]);

  if (!visible) return null;

  const rankColors = [
    "from-amber-400 to-yellow-500",
    "from-gray-300 to-gray-400",
    "from-orange-300 to-orange-400",
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-amber-300 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br shadow-md", rankColors[rank])}>
            #{rank + 1}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-800">{integrator.nom}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {integrator.ville}
            </div>
          </div>
          <div className={cn(
            "text-lg font-bold tabular-nums",
            integrator.score >= 90 ? "text-green-600" : integrator.score >= 85 ? "text-amber-600" : "text-gray-600",
          )}>
            {integrator.score}%
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Intro text */}
          {integrator.intro && (
            <p className="text-xs text-gray-600 leading-relaxed">{integrator.intro}</p>
          )}

          {/* Specialites */}
          <div className="flex flex-wrap gap-1">
            {integrator.specialites.map((s, i) => (
              <span key={i} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-1">
            {integrator.certifications.map((c, i) => (
              <span key={i} className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> {c}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="font-bold text-gray-800">{integrator.projetsSimil}</div>
              <div className="text-gray-500">Projets simil.</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="font-bold text-gray-800">{integrator.experience}</div>
              <div className="text-gray-500">Experience</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="font-bold text-gray-800">{integrator.tailleEquipe}</div>
              <div className="text-gray-500">Employes</div>
            </div>
          </div>

          {/* Force */}
          <div className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{integrator.force}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function JumelageSessionAnimation({ questions, onComplete }: {
  questions: typeof SIM_ACTE2.jumelageQuestions;
  onComplete: () => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [currentR, setCurrentR] = useState(-1);
  const [phase, setPhase] = useState<"question" | "answer">("question");

  useEffect(() => {
    if (currentQ >= questions.length) {
      setTimeout(onComplete, 600);
      return;
    }

    if (phase === "question") {
      const timer = setTimeout(() => {
        setCurrentR(0);
        setPhase("answer");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (phase === "answer") {
      if (currentR >= questions[currentQ].reponses.length) {
        const timer = setTimeout(() => {
          setCurrentQ(prev => prev + 1);
          setCurrentR(-1);
          setPhase("question");
        }, 800);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setCurrentR(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentQ, currentR, phase, questions.length]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-indigo-50 px-4 py-2.5 flex items-center gap-2 border-b border-indigo-200">
          <Handshake className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-bold text-indigo-800">Sessions de jumelage AI</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-auto">
            Question {Math.min(currentQ + 1, questions.length)}/{questions.length}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {questions.map((q, qi) => {
            if (qi > currentQ) return null;
            const isCurrentQuestion = qi === currentQ;
            return (
              <div key={qi} className={cn(
                "transition-all duration-300",
                qi < currentQ && "opacity-60",
              )}>
                {/* Question from CarlOS */}
                <div className="flex items-start gap-2 mb-2">
                  <BotAvatar code="BCO" size="sm" />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800 flex-1">
                    {q.question}
                  </div>
                </div>

                {/* Answers */}
                <div className="ml-8 space-y-1.5">
                  {q.reponses.map((r, ri) => {
                    const isVisible = qi < currentQ || (isCurrentQuestion && ri < currentR);
                    if (!isVisible) return null;
                    return (
                      <div key={ri} className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-gray-700">{r.integrateur}</div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.reponse}</div>
                          </div>
                          <div className={cn(
                            "text-sm font-bold tabular-nums shrink-0",
                            r.score >= 90 ? "text-green-600" : r.score >= 70 ? "text-amber-600" : "text-red-500",
                          )}>
                            {r.score}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isCurrentQuestion && phase === "answer" && currentR < q.reponses.length && (
                    <div className="flex items-center gap-2 text-xs text-indigo-500 pl-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Evaluation en cours...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoringAnimation({ categories, results, onComplete }: {
  categories: typeof SIM_ACTE2.scoringCategories;
  results: typeof SIM_ACTE2.scoringResults;
  onComplete: () => void;
}) {
  const [visibleRow, setVisibleRow] = useState(0);
  const [showTotals, setShowTotals] = useState(false);

  useEffect(() => {
    if (visibleRow < categories.length) {
      const timer = setTimeout(() => setVisibleRow(prev => prev + 1), 700);
      return () => clearTimeout(timer);
    }
    if (!showTotals) {
      const timer = setTimeout(() => setShowTotals(true), 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [visibleRow, showTotals, categories.length]);

  return (
    <div className="ml-11">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-700">Scoring final</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2.5 px-4 text-gray-600 font-semibold">Critere</th>
                {results.map((r, i) => (
                  <th key={i} className="text-center py-2.5 px-3 text-gray-600 font-semibold">{r.nom.split(" ")[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, ci) => (
                <tr key={ci} className={cn(
                  "border-b border-gray-100 transition-all duration-500",
                  ci < visibleRow ? "opacity-100" : "opacity-0",
                )}>
                  <td className="py-2 px-4">
                    <div className="text-sm text-gray-700">{cat.label}</div>
                    <div className="text-[10px] text-gray-400">{cat.weight}</div>
                  </td>
                  {results.map((r, ri) => (
                    <td key={ri} className="py-2 px-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              ri === 0 ? "bg-green-500" : ri === 1 ? "bg-amber-500" : "bg-gray-400",
                            )}
                            style={{ width: ci < visibleRow ? `${r.scores[ci]}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-gray-600">{ci < visibleRow ? r.scores[ci] : ""}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {showTotals && (
              <tfoot>
                <tr className="border-t-2 border-gray-300 animate-in fade-in duration-500">
                  <td className="py-3 px-4 font-bold text-gray-800">TOTAL</td>
                  {results.map((r, ri) => (
                    <td key={ri} className="py-3 px-3 text-center">
                      <span className={cn(
                        "text-lg font-bold",
                        ri === 0 ? "text-green-600" : ri === 1 ? "text-amber-600" : "text-gray-600",
                      )}>
                        {r.total}%
                      </span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function WinnerAnnouncement({ integrator, animate }: { integrator: Integrator; animate: boolean }) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); } }, [animate]);
  if (!visible) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
        <div className="px-6 py-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-amber-500" />
            <div>
              <div className="text-xs text-amber-600 font-semibold uppercase">Integrateur selectionne</div>
              <h3 className="text-xl font-bold text-gray-900">{integrator.nom}</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{integrator.score}%</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-amber-200 p-3">
              <div className="text-xs text-gray-500 mb-1">Specialites</div>
              <div className="flex flex-wrap gap-1">
                {integrator.specialites.map((s, i) => (
                  <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-3">
              <div className="text-xs text-gray-500 mb-1">Certifications</div>
              <div className="flex flex-wrap gap-1">
                {integrator.certifications.map((c, i) => (
                  <span key={i} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Shield className="h-2.5 w-2.5" /> {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white border rounded-lg p-2">
              <div className="font-bold text-gray-800">{integrator.experience}</div>
              <div className="text-gray-500">Experience</div>
            </div>
            <div className="bg-white border rounded-lg p-2">
              <div className="font-bold text-gray-800">{integrator.projetsSimil} projets</div>
              <div className="text-gray-500">Similaires</div>
            </div>
            <div className="bg-white border rounded-lg p-2">
              <div className="font-bold text-gray-800">{integrator.tailleEquipe} pers.</div>
              <div className="text-gray-500">Equipe</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ACTE 3 — CAHIER SECTION COMPONENTS ==========

function CahierSectionPortrait({ data, animate }: {
  data: { nom: string; secteur: string; employes: number; lignes: number; ca: string; tarif: string; localisation: string; extras?: { label: string; value: string }[] };
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); } }, [animate]);
  if (!visible) return null;

  const items = [
    { icon: Factory, label: "Secteur", value: data.secteur },
    { icon: Users, label: "Employes", value: `${data.employes} personnes` },
    { icon: Cog, label: "Lignes de production", value: `${data.lignes} lignes actives` },
    { icon: DollarSign, label: "Chiffre d'affaires", value: data.ca },
    { icon: Plug, label: "Tarif electricite", value: data.tarif },
    { icon: MapPin, label: "Localisation", value: data.localisation },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                <div className="text-sm font-semibold text-gray-800">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
      {data.extras && (
        <div className="grid grid-cols-2 gap-2">
          {data.extras.map((e, i) => (
            <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-500">{e.label}</div>
              <div className="text-sm font-bold text-amber-800">{e.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CahierSectionDiagnostic({ data, animate }: {
  data: { items: { systeme: string; probleme: string; gaspillage: string; priorite: string }[]; total: string; note?: string };
  animate: boolean;
}) {
  const [visibleRows, setVisibleRows] = useState(animate ? 0 : data.items.length);
  useEffect(() => {
    if (!animate) return;
    const timers = data.items.map((_, i) => setTimeout(() => setVisibleRows(i + 1), (i + 1) * 500));
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const prioriteColors: Record<string, string> = {
    Critique: "bg-red-100 text-red-700",
    Haute: "bg-orange-100 text-orange-700",
    Moyenne: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="animate-in fade-in duration-500">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-amber-200">
            <th className="text-left py-2 text-gray-600 font-semibold">Systeme</th>
            <th className="text-left py-2 text-gray-600 font-semibold">Probleme</th>
            <th className="text-center py-2 text-gray-600 font-semibold">Gaspillage</th>
            <th className="text-center py-2 text-gray-600 font-semibold">Priorite</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row, i) => (
            <tr key={i} className={cn(
              "border-b border-gray-100 transition-all duration-500",
              i < visibleRows ? "opacity-100" : "opacity-0",
            )}>
              <td className="py-2.5 font-semibold text-gray-800">{row.systeme}</td>
              <td className="py-2.5 text-gray-600 text-xs">{row.probleme}</td>
              <td className="py-2.5 text-center font-bold text-red-600">{row.gaspillage}</td>
              <td className="py-2.5 text-center">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", prioriteColors[row.priorite] || "bg-gray-100 text-gray-700")}>
                  {row.priorite}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visibleRows >= data.items.length && (
        <div className="mt-3 space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center justify-between animate-in fade-in duration-500">
            <span className="text-sm font-semibold text-amber-800">Total gaspillage recuperable</span>
            <span className="text-lg font-bold text-red-700">{data.total}</span>
          </div>
          {data.note && (
            <div className="text-xs text-gray-500 italic text-right">{data.note}</div>
          )}
        </div>
      )}
    </div>
  );
}

function CahierSectionSolutions({ data, animate }: {
  data: { solutions: { nom: string; priorite: string; impact: string; cout: string; delai: string; details?: string; fournisseur?: string }[] };
  animate: boolean;
}) {
  const [visibleIdx, setVisibleIdx] = useState(animate ? 0 : data.solutions.length);
  useEffect(() => {
    if (!animate) return;
    const timers = data.solutions.map((_, i) => setTimeout(() => setVisibleIdx(i + 1), (i + 1) * 600));
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const colors = [
    { bg: "bg-violet-50", border: "border-violet-200", accent: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
    { bg: "bg-indigo-50", border: "border-indigo-200", accent: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
    { bg: "bg-purple-50", border: "border-purple-200", accent: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {data.solutions.map((sol, i) => {
        const c = colors[i % colors.length];
        return (
          <div key={i} className={cn(
            "border rounded-lg overflow-hidden transition-all duration-500",
            c.border,
            i < visibleIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}>
            <div className={cn("px-4 py-3", c.bg)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", c.badge)}>{sol.priorite}</span>
                  <span className={cn("text-sm font-bold", c.accent)}>{sol.nom}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Impact</span>
                  <div className="font-semibold text-green-700 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> {sol.impact}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Cout</span>
                  <div className="font-semibold text-gray-800">{sol.cout}</div>
                </div>
                <div>
                  <span className="text-gray-500">Delai</span>
                  <div className="font-semibold text-gray-800 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {sol.delai}
                  </div>
                </div>
              </div>
              {sol.details && (
                <div className="mt-2 text-xs text-gray-600 bg-white/60 rounded px-2 py-1.5">{sol.details}</div>
              )}
              {sol.fournisseur && (
                <div className="mt-1 text-[11px] text-gray-500">Fournisseur : <span className="font-medium">{sol.fournisseur}</span></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CahierSectionWaterfall({ data, animate }: {
  data: {
    investBrut: number;
    subventions: { programme: string; montant: number; desc: string }[];
    totalSubventions: number;
    investNet: number;
    financement: { source: string; montant: string; taux: string; duree: string; mensualite: string };
    economiesAnnuelles: number;
    cashFlowMensuel: string;
    roi: string;
  };
  animate: boolean;
}) {
  const [step, setStep] = useState(animate ? 0 : 6);
  useEffect(() => {
    if (!animate) return;
    const timers = Array.from({ length: 6 }, (_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const fmt = (n: number) => n.toLocaleString("fr-CA") + "$";

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      {/* Waterfall */}
      <div className="space-y-2">
        <div className={cn("flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all duration-300", step >= 1 ? "opacity-100" : "opacity-0")}>
          <span className="text-sm text-gray-600">Investissement brut</span>
          <span className="text-lg font-bold text-gray-800">{fmt(data.investBrut)}</span>
        </div>

        {data.subventions.map((sub, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-300",
            step >= i + 2 ? "opacity-100" : "opacity-0",
          )}>
            <div>
              <div className="text-sm text-green-700 font-medium">{sub.programme}</div>
              <div className="text-xs text-green-600">{sub.desc}</div>
            </div>
            <span className="text-lg font-bold text-green-600 shrink-0 ml-4">-{fmt(sub.montant)}</span>
          </div>
        ))}

        <div className={cn("flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-300 transition-all duration-300", step >= 5 ? "opacity-100" : "opacity-0")}>
          <span className="text-sm font-bold text-blue-800">Investissement net apres subventions</span>
          <span className="text-xl font-bold text-blue-700">{fmt(data.investNet)}</span>
        </div>
      </div>

      {/* Financement + ROI */}
      {step >= 6 && (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
          <div className="bg-white border rounded-xl p-4">
            <div className="text-xs text-gray-500 font-medium mb-2">Financement</div>
            <div className="text-sm font-bold text-gray-800 mb-1">{data.financement.source}</div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>Montant : {data.financement.montant}</div>
              <div>Taux : {data.financement.taux} sur {data.financement.duree}</div>
              <div>Mensualite : {data.financement.mensualite}</div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <div className="text-xs text-gray-500 font-medium mb-2">Retour sur investissement</div>
            <div className="space-y-2">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">{fmt(data.economiesAnnuelles)}/an</div>
                <div className="text-xs text-gray-500">Economies annuelles</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">{data.roi}</div>
                <div className="text-xs text-gray-500">ROI</div>
              </div>
              <div className="text-center p-2 bg-emerald-50 rounded-lg">
                <div className="text-xs font-bold text-emerald-700">{data.cashFlowMensuel}</div>
                <div className="text-xs text-gray-500">Cash flow mensuel net</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CahierSectionTimeline({ data, animate }: {
  data: { phases: { phase: string; titre: string; duree: string; desc: string; roles?: { integrateur: string; usinebleue: string; client: string } }[]; totalDuree: string };
  animate: boolean;
}) {
  const [visibleIdx, setVisibleIdx] = useState(animate ? 0 : data.phases.length);
  useEffect(() => {
    if (!animate) return;
    const timers = data.phases.map((_, i) => setTimeout(() => setVisibleIdx(i + 1), (i + 1) * 500));
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-cyan-200" />
        <div className="space-y-4">
          {data.phases.map((p, i) => (
            <div key={i} className={cn(
              "relative flex items-start gap-4 pl-2 transition-all duration-500",
              i < visibleIdx ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
            )}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all",
                i < visibleIdx ? "bg-cyan-600 text-white shadow-md" : "bg-gray-200 text-gray-400",
              )}>
                {i + 1}
              </div>
              <div className="flex-1 bg-white border border-cyan-100 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">{p.phase}</span>
                    <span className="text-sm font-bold text-gray-800">{p.titre}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.duree}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{p.desc}</p>
                {p.roles && (
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div className="bg-blue-50 rounded px-1.5 py-1">
                      <div className="font-semibold text-blue-700">Integrateur</div>
                      <div className="text-blue-600">{p.roles.integrateur}</div>
                    </div>
                    <div className="bg-indigo-50 rounded px-1.5 py-1">
                      <div className="font-semibold text-indigo-700">Usine Bleue</div>
                      <div className="text-indigo-600">{p.roles.usinebleue}</div>
                    </div>
                    <div className="bg-gray-50 rounded px-1.5 py-1">
                      <div className="font-semibold text-gray-700">Client</div>
                      <div className="text-gray-600">{p.roles.client}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {visibleIdx >= data.phases.length && (
        <div className="mt-4 bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2.5 flex items-center justify-between animate-in fade-in duration-500">
          <span className="text-sm font-semibold text-cyan-800">Duree totale du projet</span>
          <span className="text-lg font-bold text-cyan-700">{data.totalDuree}</span>
        </div>
      )}
    </div>
  );
}

function CahierSectionKPIs({ data, animate }: {
  data: { kpis: { label: string; baseline: string; cible: string; reduction: string; frequence: string }[] };
  animate: boolean;
}) {
  const [visibleIdx, setVisibleIdx] = useState(animate ? 0 : data.kpis.length);
  useEffect(() => {
    if (!animate) return;
    const timers = data.kpis.map((_, i) => setTimeout(() => setVisibleIdx(i + 1), (i + 1) * 400));
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-3">
        {data.kpis.map((kpi, i) => (
          <div key={i} className={cn(
            "border rounded-lg p-3 transition-all duration-500",
            i < visibleIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}>
            <div className="text-xs font-bold text-gray-700 mb-2">{kpi.label}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Actuel</span>
                <span className="text-red-600 font-medium">{kpi.baseline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cible</span>
                <span className="text-green-600 font-bold">{kpi.cible}</span>
              </div>
              <div className="bg-green-50 rounded px-2 py-1 text-center">
                <span className="text-green-700 font-bold">{kpi.reduction}</span>
              </div>
              <div className="text-[10px] text-gray-400 text-center">Suivi : {kpi.frequence}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CahierSectionValidation({ data, animate }: {
  data: { statut: string; signataires: { role: string; nom: string; date: string }[] };
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); } }, [animate]);
  if (!visible) return null;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-green-600" />
        <span className="text-sm font-semibold text-green-800">Statut : {data.statut}</span>
      </div>
      <div className="space-y-3">
        {data.signataires.map((s, i) => (
          <div key={i} className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{s.role}</div>
                <div className="text-xs text-gray-400">Signature : {s.nom}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">Date : {s.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== GENERIC SECTION WRAPPER ==========

function CahierSectionCard({ section, animate, isComplete, totalSections }: {
  section: (typeof SIM_ACTE3.sections)[number];
  animate: boolean;
  isComplete: boolean;
  totalSections: number;
}) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => {
    if (!animate) { setVisible(true); return; }
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, [animate]);

  if (!visible) return null;

  const Icon = section.icon;

  const renderContent = () => {
    const d = section.content.data as any;
    switch (section.content.type) {
      case "portrait":
        return <CahierSectionPortrait data={d} animate={animate} />;
      case "diagnostic":
        return <CahierSectionDiagnostic data={d} animate={animate} />;
      case "solutions":
        return <CahierSectionSolutions data={d} animate={animate} />;
      case "waterfall":
        return <CahierSectionWaterfall data={d} animate={animate} />;
      case "timeline":
        return <CahierSectionTimeline data={d} animate={animate} />;
      case "kpis":
        return <CahierSectionKPIs data={d} animate={animate} />;
      case "validation":
        return <CahierSectionValidation data={d} animate={animate} />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className={cn(
        "border-2 rounded-xl overflow-hidden shadow-md transition-all duration-500",
        isComplete ? "border-green-300" : section.borderColor,
      )}>
        <div className={cn("h-1.5 bg-gradient-to-r", section.color)} />
        <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm",
              section.color,
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Section {section.num}/{totalSections}</div>
              <div className="text-sm font-bold text-gray-800">{section.titre}</div>
            </div>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1.5 text-green-600 animate-in fade-in duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-semibold">Complete</span>
            </div>
          )}
        </div>
        <div className="bg-white px-4 py-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ========== FINALIZATION ANIMATION ==========

function FinalizationAnimation({ onComplete }: { onComplete: () => void }) {
  const steps = [
    { icon: FileText, text: "Mise en page PDF..." },
    { icon: Award, text: "Insertion logos et references..." },
    { icon: CheckCircle2, text: "Generation du document final..." },
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 500);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 800);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="ml-11">
      <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
        <div className="text-xs text-blue-600 mb-2 font-medium">Finalisation du document...</div>
        <div className="space-y-1.5">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            if (i > currentStep) return null;
            const Icon = step.icon;
            return (
              <div key={i} className={cn(
                "flex items-center gap-2 text-sm",
                isActive && "text-blue-600",
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

// ========== PRE-RAPPORT CARD ==========

function PreRapportCard({ data, animate }: {
  data: typeof SIM_ACTE1.preRapport;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); } }, [animate]);
  if (!visible) return null;

  const axeIcons: Record<string, React.ElementType> = { zap: Zap, cog: Cog, cpu: Cpu };
  const axeColors = [
    { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: "text-amber-600" },
    { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", icon: "text-violet-600" },
    { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-800", icon: "text-cyan-600" },
  ];

  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm">Pre-rapport de visite</div>
              <div className="text-blue-200 text-xs">{data.profil.nom}</div>
            </div>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
              Genere par CarlOS (diagnostic AI a distance)
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Profil */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Profil entreprise
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-400">Secteur</div>
                <div className="font-semibold text-gray-800">{data.profil.secteur}</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-400">Employes</div>
                <div className="font-semibold text-gray-800">{data.profil.employes}</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-400">Lignes / SKUs</div>
                <div className="font-semibold text-gray-800">{data.profil.lignes} lignes / {data.profil.skus} SKUs</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-gray-400">CA</div>
                <div className="font-semibold text-gray-800">{data.profil.ca}</div>
              </div>
            </div>
          </div>

          {/* 3 Axes */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Besoins identifies — 3 axes
            </div>
            <div className="grid grid-cols-3 gap-3">
              {data.axes.map((axe, i) => {
                const c = axeColors[i];
                const Icon = axeIcons[axe.icone] || Zap;
                return (
                  <div key={i} className={cn("rounded-lg border p-3", c.bg, c.border)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("h-4 w-4", c.icon)} />
                      <span className={cn("text-xs font-bold", c.text)}>{axe.titre}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">{axe.description}</p>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimation</span>
                        <span className="font-semibold text-gray-700">{axe.estimation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subventions</span>
                        <span className="font-semibold text-green-700">{axe.subventions}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommandation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-start gap-2">
              <Handshake className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-blue-800 mb-0.5">Recommandation</div>
                <p className="text-xs text-blue-700 leading-relaxed">{data.recommandation}</p>
              </div>
            </div>
            {/* CEO recommendation */}
            {data.ceoRecommandation && (
              <div className="flex items-start gap-2 bg-white/60 border border-blue-100 rounded-lg px-3 py-2.5 mt-2">
                <BotAvatar code="BCO" size="sm" className="mt-0.5" />
                <div>
                  <div className="text-[10px] font-semibold text-blue-600 mb-0.5">Recommandation CarlOS (CEO)</div>
                  <p className="text-xs text-gray-700 leading-relaxed">{data.ceoRecommandation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-[10px] text-gray-400 text-center italic border-t pt-2">
            Ce pre-rapport sera transmis aux integrateurs candidats pour le jumelage
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

/**
 * Stages:
 *
 * === ACTE 1 — La Tension de Depart (0 → 7.5) ===
 * 0    — Hero card avec apercu 3 actes + "Lancer"
 * 1    — User tension message (elargie: energie + palettisation + automatisation)
 * 1.5  — CEO ThinkingAnimation (4 etapes)
 * 2    — CEO reponse + Question 1 (details lignes, fin de ligne, SKUs)
 * 2.5  — User answer 1 (4 lignes, 45 SKUs, palettisation manuelle, blessures)
 * 3    — CEO Question 2 (budget, priorites energie vs automation)
 * 3.5  — User answer 2 (800K-1.2M, les deux urgents, ROI rapide)
 * 4    — MultiConsultAnimation (CFO, COO, CTO)
 * 4.5  — Multi-perspectives card elargie (3 colonnes) + "Synthetiser"
 * 5    — Synthese thinking
 * 5.5  — Synthese card (3 axes: energie + palettisation + automatisation)
 * 6    — Pre-rapport building animation (ThinkingAnimation 4 steps)
 * 6.5  — Pre-rapport de visite card
 * 7    — CEO transition vers jumelage
 * 7.5  — Banner transition + "Lancer le Jumelage"
 *
 * === ACTE 2 — Le Jumelage SMART (8 → 11.5) ===
 * 8    — ThinkingAnimation criteres matching
 * 8.5  — Criteres de matching affiches
 * 9    — NetworkScanAnimation (130 -> TOP 3)
 * 9.5  — TOP 3 IntegratorCards
 * 10   — JumelageSessionAnimation (3 questions)
 * 10.5 — ScoringAnimation (tableau comparatif)
 * 11   — WinnerAnnouncement + CEO message → 11.5
 * 11.5 — Banner transition "Acte 2 -> Acte 3" + "Construire le Cahier"
 *
 * === ACTE 3 — Production du Cahier + Livraison (12 → 19) ===
 * 12   — CEO message + ThinkingAnimation cahier (6 etapes)
 * 12.5 — auto → 13
 * 13   — Section 1 (Profil & Analyse)
 * 13.5 — Section 2 (Analyse du Projet)
 * 14   — Section 3 (Concept preliminaire)
 * 14.5 — Section 4 (Budget, subventions & financement)
 * 15   — Section 5 (Plan d'implantation)
 * 15.5 — Section 6 (KPIs & suivi)
 * 16   — Section 7 (Validation & signatures)
 * 16.5 — Finalization animation + progress 100%
 * 17   — Summary card hero (3 metriques) → 17.5
 * 17.5 — Download PDF
 * 18   — Ceremonie de livraison → 19
 * 19   — Restart + HQ message
 */
export function CahierSmartDemo() {
  const [stage, setStage] = useState(0);
  const [ceoTextDone, setCeoTextDone] = useState(false);
  const [criteresModified, setCriteresModified] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute current acte
  const currentActe: Acte | "complete" =
    stage <= 7.5 ? 1 :
    stage <= 11.5 ? 2 :
    stage <= 18 ? 3 :
    "complete";

  // Cahier section progress (Acte 3 only, sections at stages 13-16)
  const totalSections = SIM_ACTE3.sections.length;
  const sectionsBuilt =
    stage >= 16 ? totalSections :
    stage >= 15.5 ? 6 :
    stage >= 15 ? 5 :
    stage >= 14.5 ? 4 :
    stage >= 14 ? 3 :
    stage >= 13.5 ? 2 :
    stage >= 13 ? 1 : 0;
  const cahierProgress = stage >= 16.5 ? 100 : Math.round((sectionsBuilt / totalSections) * 100);

  // Auto-advance cahier sections during Act 3 (stages 13-16)
  useEffect(() => {
    if (stage >= 13 && stage <= 16) {
      const timer = setTimeout(() => {
        setStage(prev => prev + 0.5);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 150);
  }, [stage]);

  const handleRestart = () => {
    setStage(0);
    setCeoTextDone(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Mega-Simulation — Cahier de Projet SMART en 3 Actes
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Aliments Boreal inc. — Tension {"\u2192"} Jumelage {"\u2192"} Cahier complet
            </div>
          </div>
          <ActeIndicator currentActe={currentActe} progress={currentActe === 3 ? cahierProgress : 0} />
        </div>

        {/* Progress bar during Acte 3 */}
        {stage >= 12.5 && stage <= 17 && (
          <div className="mt-2">
            <CahierProgressBar
              current={sectionsBuilt}
              total={totalSections}
              label="Construction du Cahier de Projet"
            />
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">

          {/* ================================================================ */}
          {/* ===== ACTE 1 — LA TENSION DE DEPART ============================ */}
          {/* ================================================================ */}

          {/* ===== STAGE 0 — Hero card ===== */}
          {stage === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 border-2 border-blue-200 rounded-2xl p-8 max-w-xl text-center mb-6 shadow-lg">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cahier de Projet SMART en 3 Actes</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Decouvrez comment Usine Bleue AI transforme une tension d'entreprise en un cahier de projet complet — du diagnostic AI au jumelage intelligent avec le bon integrateur.
                </p>

                {/* 3 actes preview */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white/80 border border-red-200 rounded-xl p-3">
                    <Zap className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-gray-700">Diagnostic AI 360</div>
                  </div>
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-3">
                    <Handshake className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-gray-700">Jumelage SMART</div>
                  </div>
                  <div className="bg-white/80 border border-blue-200 rounded-xl p-3">
                    <FileText className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-gray-700">Cahier de Projet</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-6">
                  <span className="flex items-center gap-1"><Factory className="h-3.5 w-3.5 text-blue-500" /> Saguenay, 85 employes</span>
                  <span className="flex items-center gap-1"><Plug className="h-3.5 w-3.5 text-amber-500" /> Energie + Palettisation</span>
                  <span className="flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-indigo-500" /> 4 bots + reseau Usine Bleue</span>
                </div>

                <button
                  onClick={() => setStage(1)}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105 mx-auto"
                >
                  <Send className="h-5 w-5" /> Lancer la simulation
                </button>
              </div>
            </div>
          )}

          {/* ===== STAGE 1 — User tension (elargie) ===== */}
          {stage >= 1 && (
            <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-500">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-blue-900">{SIM_ACTE1.userTension}</p>
                <span className="text-[10px] text-blue-400 mt-1 block text-right">10:15</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Dirigeant" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(1.5)} className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1">
                <Bot className="h-3 w-3" /> CarlOS analyse la tension...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={SIM_ACTE1.ceoThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(2)}
            />
          )}

          {/* ===== STAGE 2 — CEO response + Question 1 ===== */}
          {stage >= 2 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Diagnostic preliminaire</span>
                </div>
                {stage === 2 ? (
                  <TypewriterText
                    text={SIM_ACTE1.ceoResponse}
                    speed={10}
                    className="text-sm text-gray-800"
                    onComplete={() => setCeoTextDone(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-800">{SIM_ACTE1.ceoResponse}</p>
                )}
                {/* Question 1 appears after response */}
                {((stage === 2 && ceoTextDone) || stage > 2) && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <p className="text-sm text-blue-800 font-medium">{SIM_ACTE1.ceoQuestion1}</p>
                  </div>
                )}
                <span className="text-[10px] text-gray-400 mt-1 block">10:15</span>
                {stage === 2 && ceoTextDone && (
                  <div className="mt-2 animate-in fade-in duration-500">
                    <button
                      onClick={() => { setCeoTextDone(false); setStage(2.5); }}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-100 font-medium"
                    >
                      <Send className="h-3.5 w-3.5" /> Repondre
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 2.5 — User answer 1 ===== */}
          {stage >= 2.5 && (
            <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-500">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-blue-900">{SIM_ACTE1.userAnswer1}</p>
                <span className="text-[10px] text-blue-400 mt-1 block text-right">10:16</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Dirigeant" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 2.5 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(3)} className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1">
                <Bot className="h-3 w-3" /> CarlOS approfondit...
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — CEO Question 2 ===== */}
          {stage >= 3 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Approfondissement</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  {stage === 3 ? (
                    <TypewriterText
                      text={SIM_ACTE1.ceoQuestion2}
                      speed={10}
                      className="text-sm text-blue-800 font-medium"
                      onComplete={() => setCeoTextDone(true)}
                    />
                  ) : (
                    <p className="text-sm text-blue-800 font-medium">{SIM_ACTE1.ceoQuestion2}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">10:16</span>
                {stage === 3 && ceoTextDone && (
                  <div className="mt-2 animate-in fade-in duration-500">
                    <button
                      onClick={() => { setCeoTextDone(false); setStage(3.5); }}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-100 font-medium"
                    >
                      <Send className="h-3.5 w-3.5" /> Repondre
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 3.5 — User answer 2 ===== */}
          {stage >= 3.5 && (
            <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-500">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-blue-900">{SIM_ACTE1.userAnswer2}</p>
                <span className="text-[10px] text-blue-400 mt-1 block text-right">10:17</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Dirigeant" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 3.5 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(4)} className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1">
                <Network className="h-3 w-3" /> Consulter les specialistes
              </button>
            </div>
          )}

          {/* ===== STAGE 4 — Multi-consult animation ===== */}
          {stage === 4 && (
            <MultiConsultAnimation
              bots={SIM_ACTE1.consultBots}
              onComplete={() => setStage(4.5)}
            />
          )}

          {/* ===== STAGE 4.5 — Multi-perspectives ===== */}
          {stage >= 4.5 && stage < 8 && (
            <PerspectivesCard
              perspectives={SIM_ACTE1.perspectives}
              onContinue={() => { if (stage === 4.5) setStage(5); }}
              animate={stage === 4.5}
            />
          )}

          {/* ===== STAGE 5 — Synthese thinking ===== */}
          {stage === 5 && (
            <ThinkingAnimation
              steps={SIM_ACTE1.syntheseThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(5.5)}
            />
          )}

          {/* ===== STAGE 5.5 — Synthese card ===== */}
          {stage >= 5.5 && stage < 8 && (
            <>
              <SyntheseCard data={SIM_ACTE1.syntheseCard} animate={stage === 5.5} />
              {stage === 5.5 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setStage(6)}
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-100 flex items-center gap-1.5 font-medium"
                  >
                    <FileText className="h-3.5 w-3.5" /> Generer le pre-rapport de visite
                  </button>
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 6 — Pre-rapport building animation ===== */}
          {stage === 6 && (
            <ThinkingAnimation
              steps={SIM_ACTE1.preRapportThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(6.5)}
            />
          )}

          {/* ===== STAGE 6.5 — Pre-rapport de visite card ===== */}
          {stage >= 6.5 && stage < 8 && (
            <>
              <PreRapportCard data={SIM_ACTE1.preRapport} animate={stage === 6.5} />
              {stage === 6.5 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setStage(7)}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full hover:bg-amber-100 flex items-center gap-1.5 font-medium"
                  >
                    <Handshake className="h-3.5 w-3.5" /> Activer le Jumelage SMART
                  </button>
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 7 — CEO transition message ===== */}
          {stage >= 7 && stage < 8 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <Handshake className="h-3 w-3" /> Transition Jumelage
                  </span>
                </div>
                {stage === 7 ? (
                  <TypewriterText
                    text={SIM_ACTE1.ceoTransition}
                    speed={8}
                    className="text-sm text-gray-800"
                    onComplete={() => setTimeout(() => setStage(7.5), 600)}
                  />
                ) : (
                  <p className="text-sm text-gray-800">{SIM_ACTE1.ceoTransition}</p>
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 7.5 — Transition banner Acte 1 -> 2 ===== */}
          {stage >= 7.5 && stage < 8 && (
            <>
              <TransitionBanner
                from="Acte 1 complete — Diagnostic AI + Pre-rapport valide"
                to="Acte 2 : Jumelage SMART avec le reseau Usine Bleue"
                animate={stage === 7.5}
              />
              {stage === 7.5 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setStage(8)}
                    className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 font-semibold shadow-md transition-all hover:scale-105"
                  >
                    <Handshake className="h-4 w-4" /> Lancer le Jumelage SMART
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================================================================ */}
          {/* ===== ACTE 2 — LE JUMELAGE SMART ============================== */}
          {/* ================================================================ */}

          {/* ===== STAGE 8 — Criteres thinking ===== */}
          {stage === 8 && (
            <ThinkingAnimation
              steps={SIM_ACTE2.criteresThinking}
              botName="Equipe Bot (COO + CFO + CTO)"
              botCode="BOO"
              onComplete={() => setStage(8.5)}
            />
          )}

          {/* ===== STAGE 8.5 — Criteres card + Modifier/Approuver ===== */}
          {stage >= 8.5 && stage < 12 && (
            <div className="ml-11 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-amber-50 px-4 py-2.5 flex items-center gap-2 border-b border-amber-200">
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-800">Criteres de matching generes</span>
                  {criteresModified && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto font-medium">Mis a jour</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {SIM_ACTE2.criteres.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        {c}
                      </div>
                    ))}
                    {criteresModified && (
                      <div className="flex items-start gap-2 text-sm text-green-700 animate-in fade-in duration-500">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        Experience en milieu alimentaire (HACCP, zones temp.)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User message after clicking Modifier */}
              {criteresModified && stage === 8.5 && (
                <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-4 py-3 max-w-[70%] shadow-sm">
                    <p className="text-sm">{SIM_ACTE2.userCritereAjout}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                    <img src={USER_AVATAR} alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* CEO acknowledgment */}
              {criteresModified && stage === 8.5 && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <BotAvatar code="BCO" size="md" />
                  <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-2.5 max-w-[70%] shadow-sm">
                    <p className="text-sm text-gray-800">Parfait, j'ajoute l'experience en milieu alimentaire comme critere. C'est effectivement crucial pour ton secteur — les normes HACCP et la gestion des zones de temperature vont filtrer encore plus precisement.</p>
                  </div>
                </div>
              )}

              {stage === 8.5 && (
                <div className="flex justify-center gap-3 mt-2">
                  {!criteresModified && (
                    <button
                      onClick={() => setCriteresModified(true)}
                      className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 flex items-center gap-1.5 font-medium"
                    >
                      <Cog className="h-3.5 w-3.5" /> Modifier mes criteres
                    </button>
                  )}
                  <button
                    onClick={() => setStage(9)}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full hover:bg-amber-100 flex items-center gap-1.5 font-medium"
                  >
                    <Search className="h-3.5 w-3.5" /> {criteresModified ? "Approuver et scanner le reseau" : "Scanner le reseau Usine Bleue"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 9 — Network scan animation ===== */}
          {stage === 9 && (
            <NetworkScanAnimation
              steps={SIM_ACTE2.scanSteps}
              onComplete={() => setStage(9.5)}
            />
          )}

          {/* ===== STAGE 9.5 — TOP 3 integrator cards ===== */}
          {stage >= 9.5 && stage < 12 && (
            <div className="ml-11 space-y-3">
              <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                TOP 3 — Integrateurs compatibles
              </div>
              <div className="grid grid-cols-3 gap-3">
                {INTEGRATORS.map((integ, i) => (
                  <IntegratorCard
                    key={integ.id}
                    integrator={integ}
                    rank={i}
                    animate={stage === 9.5}
                    delay={i * 400}
                  />
                ))}
              </div>
              {stage === 9.5 && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => setStage(10)}
                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-full hover:bg-indigo-100 flex items-center gap-1.5 font-medium"
                  >
                    <Handshake className="h-3.5 w-3.5" /> Lancer les sessions de jumelage AI
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 10 — Jumelage sessions ===== */}
          {stage === 10 && (
            <JumelageSessionAnimation
              questions={SIM_ACTE2.jumelageQuestions}
              onComplete={() => setStage(10.5)}
            />
          )}

          {/* ===== STAGE 10.5 — Scoring animation ===== */}
          {stage === 10.5 && (
            <ScoringAnimation
              categories={SIM_ACTE2.scoringCategories}
              results={SIM_ACTE2.scoringResults}
              onComplete={() => setStage(11)}
            />
          )}

          {/* ===== STAGE 11 — Winner announcement ===== */}
          {stage >= 11 && stage < 12 && (
            <>
              {/* CEO intro before winner */}
              <div className="flex gap-3">
                <BotAvatar code="BCO" size="md" />
                <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-2.5 max-w-[75%] shadow-sm">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <p className="text-sm text-gray-800 mt-1">{SIM_ACTE2.ceoWinnerIntro}</p>
                </div>
              </div>

              <WinnerAnnouncement integrator={INTEGRATORS[0]} animate={stage === 11} />

              {/* CarlOS selection message */}
              {stage >= 11 && (
                <div className="flex gap-3">
                  <BotAvatar code="BCO" size="md" />
                  <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Selection finale
                      </span>
                    </div>
                    {stage === 11 ? (
                      <TypewriterText
                        text={SIM_ACTE2.winnerMessage}
                        speed={8}
                        className="text-sm text-gray-800"
                        onComplete={() => setTimeout(() => setStage(11.5), 600)}
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{SIM_ACTE2.winnerMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 11.5 — Transition banner Acte 2 -> 3 ===== */}
          {stage >= 11.5 && stage < 12 && (
            <>
              <TransitionBanner
                from="Acte 2 complete — Integrateur selectionne"
                to="Acte 3 : Construction du Cahier avec l'integrateur"
                animate={stage === 11.5}
              />
              {stage === 11.5 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setStage(12)}
                    className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-semibold shadow-md transition-all hover:scale-105"
                  >
                    <FileText className="h-4 w-4" /> Construire le Cahier de Projet
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================================================================ */}
          {/* ===== ACTE 3 — CONSTRUCTION DU CAHIER ========================= */}
          {/* ================================================================ */}

          {/* ===== STAGE 12 — CEO message + thinking ===== */}
          {stage >= 12 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Construction du Cahier</span>
                </div>
                <p className="text-sm text-gray-800">
                  Energia Solutions a complete la visite terrain chez Aliments Boreal. Maintenant, notre equipe de bots et l'integrateur co-construisent votre Cahier de Projet SMART.
                </p>
              </div>
            </div>
          )}

          {/* ===== STAGE 12 — Building thinking ===== */}
          {stage === 12 && (
            <ThinkingAnimation
              steps={SIM_ACTE3.buildingThinking}
              botName="Equipe Bot + Energia Solutions"
              botCode="BCO"
              onComplete={() => setStage(12.5)}
            />
          )}

          {/* ===== STAGE 12.5 — Progress starts, trigger sections ===== */}
          {stage === 12.5 && (() => {
            // Auto-advance to first section
            setTimeout(() => setStage(13), 800);
            return null;
          })()}

          {/* ===== SECTIONS 13 → 16 (auto-advancing) ===== */}
          {stage >= 13 && (
            <div className="space-y-4">
              {/* Section 1 — Profil */}
              {stage >= 13 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[0]}
                  animate={stage === 13}
                  isComplete={stage > 13}
                  totalSections={totalSections}
                />
              )}

              {/* Section 2 — Analyse du Projet */}
              {stage >= 13.5 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[1]}
                  animate={stage === 13.5}
                  isComplete={stage > 13.5}
                  totalSections={totalSections}
                />
              )}

              {/* Section 3 — Concept */}
              {stage >= 14 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[2]}
                  animate={stage === 14}
                  isComplete={stage > 14}
                  totalSections={totalSections}
                />
              )}

              {/* Section 4 — Budget waterfall */}
              {stage >= 14.5 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[3]}
                  animate={stage === 14.5}
                  isComplete={stage > 14.5}
                  totalSections={totalSections}
                />
              )}

              {/* Section 5 — Timeline */}
              {stage >= 15 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[4]}
                  animate={stage === 15}
                  isComplete={stage > 15}
                  totalSections={totalSections}
                />
              )}

              {/* Section 6 — KPIs */}
              {stage >= 15.5 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[5]}
                  animate={stage === 15.5}
                  isComplete={stage > 15.5}
                  totalSections={totalSections}
                />
              )}

              {/* Section 7 — Validation */}
              {stage >= 16 && (
                <CahierSectionCard
                  section={SIM_ACTE3.sections[6]}
                  animate={stage === 16}
                  isComplete={stage > 16}
                  totalSections={totalSections}
                />
              )}
            </div>
          )}

          {/* ===== STAGE 16.5 — Finalization ===== */}
          {stage === 16.5 && (
            <FinalizationAnimation onComplete={() => setStage(17)} />
          )}

          {/* ===== STAGE 17 — Summary hero card ===== */}
          {stage >= 17 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 border-2 border-green-300 rounded-2xl overflow-hidden shadow-xl">
                <div className="h-2.5 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500" />
                <div className="px-6 py-5">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Cahier de Projet SMART pret</h3>
                      <p className="text-sm text-green-600">Aliments Boreal inc. — Energie + Palettisation + IoT</p>
                    </div>
                  </div>

                  {/* 3 big metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {SIM_ACTE3.summaryMetrics.map((m, i) => (
                      <div key={i} className="text-center p-3 bg-white rounded-xl border border-green-200 shadow-sm">
                        <div className={cn("text-xl font-bold", m.color)}>{m.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Completed sections list */}
                  <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-bold text-gray-800">{totalSections} sections completees</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        + Integrateur Energia Solutions
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {SIM_ACTE3.sections.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-gray-600">
                          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                          <span className="truncate">{s.titre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STAGE 17 — auto-advance to 17.5 ===== */}
          {stage === 17 && (() => {
            setTimeout(() => setStage(17.5), 2000);
            return null;
          })()}

          {/* ===== STAGE 17.5 — Download PDF button ===== */}
          {stage >= 17.5 && (
            <div className="flex items-center justify-center gap-3 animate-in fade-in duration-500">
              <a
                href="/cahier-boreal-2026.pdf"
                download
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105 animate-pulse"
              >
                <Download className="h-5 w-5" /> Telecharger le Cahier PDF
              </a>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                <Share2 className="h-4 w-4" /> Partager
              </button>
            </div>
          )}

          {/* ===== STAGE 17.5 — auto-advance to 18 ===== */}
          {stage === 17.5 && (() => {
            setTimeout(() => setStage(18), 3000);
            return null;
          })()}

          {/* ===== STAGE 18 — Ceremony ===== */}
          {stage >= 18 && (
            <div className="space-y-4 animate-in fade-in duration-700">
              {/* Integrator ceremony message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 text-white">
                  <Award className="h-4 w-4" />
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-[3px] border-l-amber-400 border border-amber-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-700">Martin Pellerin, ing. — Energia Solutions</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Au nom d'Energia Solutions, nous sommes fiers de remettre ce Cahier de Projet a Aliments Boreal inc. Notre equipe est prete a demarrer dans 3 semaines.
                  </p>
                </div>
              </div>

              {/* CarlOS final message */}
              <div className="flex gap-3">
                <BotAvatar code="BCO" size="md" />
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-[3px] border-l-blue-500 border border-blue-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                  </div>
                  <p className="text-sm text-gray-800">{SIM_ACTE3.ceremonyMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== STAGE 18 auto-advance ===== */}
          {stage === 18 && (() => {
            setTimeout(() => setStage(19), 4000);
            return null;
          })()}

          {/* ===== STAGE 19 — Restart + HQ message ===== */}
          {stage >= 19 && (
            <div className="space-y-4 animate-in fade-in duration-700">
              {/* Value proposition for HQ */}
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl px-6 py-5 shadow-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Factory className="h-5 w-5 text-yellow-300" />
                  <span className="text-lg font-bold text-white">La vision Usine Bleue AI</span>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed max-w-lg mx-auto">
                  {SIM_ACTE3.hqMessage}
                </p>
              </div>

              {/* Restart */}
              <div className="flex justify-center py-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 bg-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Relancer la simulation
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
