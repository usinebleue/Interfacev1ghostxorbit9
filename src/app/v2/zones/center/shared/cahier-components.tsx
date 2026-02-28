/**
 * cahier-components.tsx — Composants partages pour les 3 demos du Cahier SMART
 * ActeIndicator, CahierProgressBar, TransitionBanner, PerspectivesCard,
 * SyntheseCard, PreRapportCard, IntegratorCard, NetworkScanAnimation,
 * JumelageSessionAnimation, ScoringAnimation, WinnerAnnouncement,
 * CahierSection components, FinalizationAnimation
 * Sprint A — Frame Master V2
 */

"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  Loader2,
  Brain,
  Cpu,
  Database,
  Network,
  Zap,
  Target,
  Bot,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Building2,
  Wrench,
  Plug,
  Factory,
  ClipboardCheck,
  UserCheck,
  Shield,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Award,
  Cog,
  Users,
  MapPin,
  Download,
  Search,
  Filter,
  Star,
  Trophy,
  Handshake,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  BOT_COLORS,
  USER_AVATAR,
  SIM_ACTE1,
  SIM_ACTE2,
  SIM_ACTE3,
} from "../cahier-smart-data";
import type { Integrator } from "../cahier-smart-data";

// ========== RE-EXPORTS for convenience ==========
export { BOT_COLORS, USER_AVATAR, SIM_ACTE1, SIM_ACTE2, SIM_ACTE3 };
export type { Integrator };
export { INTEGRATORS } from "../cahier-smart-data";

// ========== ANIMATION COMPONENTS ==========

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

export function ThinkingAnimation({ steps, botName, botCode, onComplete }: {
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

export function MultiConsultAnimation({ bots, onComplete }: {
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

const SOURCE_ICONS = {
  doc: { icon: FileText, color: "text-blue-500" },
  stat: { icon: BarChart3, color: "text-emerald-500" },
  data: { icon: Database, color: "text-purple-500" },
};

export function SourcesList({ sources }: { sources: { type: "doc" | "stat" | "data"; label: string }[] }) {
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

export type Acte = 1 | 2 | 3;

export function ActeIndicator({ currentActe, progress }: { currentActe: Acte | "complete"; progress: number }) {
  const actes = [
    { id: 1 as const, label: "Diagnostic", icon: Zap, color: "bg-red-500" },
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

export function CahierProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-blue-700">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ========== TRANSITION BANNER ==========

export function TransitionBanner({ from, to, animate }: { from: string; to: string; animate: boolean }) {
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

export function PerspectivesCard({ perspectives, onContinue, animate }: {
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
              className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
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

export function SyntheseCard({ data, animate }: { data: typeof SIM_ACTE1.syntheseCard; animate: boolean }) {
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

// ========== PRE-RAPPORT CARD ==========

export function PreRapportCard({ data, animate }: {
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-start gap-2">
              <Handshake className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-blue-800 mb-0.5">Recommandation</div>
                <p className="text-xs text-blue-700 leading-relaxed">{data.recommandation}</p>
              </div>
            </div>
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

          <div className="text-[10px] text-gray-400 text-center italic border-t pt-2">
            Ce pre-rapport sera transmis aux integrateurs candidats pour le jumelage
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ACTE 2 COMPONENTS ==========

export function NetworkScanAnimation({ steps, onComplete }: {
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

        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-amber-700 tabular-nums">{currentCount}</div>
          <div className="text-xs text-amber-600 mt-1">
            {currentStep < steps.length ? steps[currentStep].label : "TOP 3 identifies"}
          </div>
        </div>

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

export function IntegratorCard({ integrator, rank, animate, delay = 0 }: {
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

        <div className="p-4 space-y-3">
          {integrator.intro && (
            <p className="text-xs text-gray-600 leading-relaxed">{integrator.intro}</p>
          )}

          <div className="flex flex-wrap gap-1">
            {integrator.specialites.map((s, i) => (
              <span key={i} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {integrator.certifications.map((c, i) => (
              <span key={i} className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> {c}
              </span>
            ))}
          </div>

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

          <div className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{integrator.force}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function JumelageSessionAnimation({ questions, onComplete }: {
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
                <div className="flex items-start gap-2 mb-2">
                  <BotAvatar code="BCO" size="sm" />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800 flex-1">
                    {q.question}
                  </div>
                </div>

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

export function ScoringAnimation({ categories, results, onComplete }: {
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
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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

export function WinnerAnnouncement({ integrator, animate }: { integrator: Integrator; animate: boolean }) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); } }, [animate]);
  if (!visible) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
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

export function CahierSectionPortrait({ data, animate }: {
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

export function CahierSectionDiagnostic({ data, animate }: {
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

export function CahierSectionSolutions({ data, animate }: {
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

export function CahierSectionWaterfall({ data, animate }: {
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

export function CahierSectionTimeline({ data, animate }: {
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

export function CahierSectionKPIs({ data, animate }: {
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

export function CahierSectionValidation({ data, animate }: {
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

export function CahierSectionCard({ section, animate, isComplete, totalSections }: {
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

export function FinalizationAnimation({ onComplete }: { onComplete: () => void }) {
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
