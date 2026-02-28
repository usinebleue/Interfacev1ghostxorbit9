/**
 * DecisionDemo.tsx — Simulation Mode Decision
 * Go/No-Go acquisition — Matrice ponderee + Stakeholder Impact + Verdict
 * Sprint A — Frame Master V2
 */

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Scale,
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { DECISION_DATA } from "./decision-data";
import type { DecisionCriteria } from "./decision-data";

// ─── Bot colors ───
const BOT_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  BCO: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", label: "CEO" },
  BCF: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", label: "CFO" },
  BCS: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "CSO" },
  BOO: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", label: "COO" },
  BRO: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", label: "CRO" },
};

// ─── Typewriter ───
function TypewriterText({ text, speed = 12, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const iv = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <>{displayed}</>;
}

// ─── Thinking animation ───
function ThinkingAnimation({ steps, speed = 800, onDone }: { steps: { icon: React.ElementType; text: string }[]; speed?: number; onDone?: () => void }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (current >= steps.length) { onDone?.(); return; }
    const t = setTimeout(() => setCurrent((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [current, steps.length, speed]);
  return (
    <div className="space-y-2 py-3">
      {steps.slice(0, current + 1).map((s, i) => {
        const Icon = s.icon;
        const active = i === current && current < steps.length;
        return (
          <div key={i} className={cn("flex items-center gap-2 text-xs transition-opacity duration-300", active ? "text-blue-600" : "text-gray-400")}>
            <Icon className={cn("h-3.5 w-3.5", active && "animate-pulse")} />
            <span>{s.text}</span>
            {!active && i < current && <CheckCircle className="h-3 w-3 text-green-500 ml-1" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Bot avatar ───
function BotAvatar({ code, size = "sm" }: { code: string; size?: "sm" | "md" }) {
  const bot = BOT_COLORS[code] || BOT_COLORS.BCO;
  const sz = size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]";
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold shrink-0", sz, bot.bg, bot.text, "border", bot.border)}>
      {bot.label}
    </div>
  );
}

// ─── Score bar ───
function ScoreBar({ score, max = 10, color }: { score: number; max?: number; color: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono font-bold text-gray-600 w-6 text-right">{score}</span>
    </div>
  );
}

// ─── Criteria card ───
function CriteriaCard({ criteria, index, animated }: { criteria: DecisionCriteria; index: number; animated: boolean }) {
  const weightStars = "★".repeat(criteria.weight) + "☆".repeat(5 - criteria.weight);
  const botFor = BOT_COLORS[criteria.botFor] || BOT_COLORS.BCO;
  const botAgainst = BOT_COLORS[criteria.botAgainst] || BOT_COLORS.BCO;

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all duration-500",
      animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    )} style={{ transitionDelay: `${index * 150}ms` }}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">{criteria.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500">Poids</span>
          <span className="text-xs text-amber-500 tracking-tight">{weightStars}</span>
        </div>
      </div>

      {/* For vs Against */}
      <div className="grid grid-cols-2 divide-x">
        {/* GO */}
        <div className="p-3 bg-green-50/30">
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
            <span className="text-[10px] font-bold text-green-700 uppercase">Go</span>
            <BotAvatar code={criteria.botFor} />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-2">{criteria.argFor}</p>
          <ScoreBar score={criteria.scoreFor} color="bg-green-500" />
        </div>

        {/* NO-GO */}
        <div className="p-3 bg-red-50/30">
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
            <span className="text-[10px] font-bold text-red-700 uppercase">No-Go</span>
            <BotAvatar code={criteria.botAgainst} />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-2">{criteria.argAgainst}</p>
          <ScoreBar score={criteria.scoreAgainst} color="bg-red-500" />
        </div>
      </div>
    </div>
  );
}

// ─── Stakeholder impact card ───
function StakeholderCard({ stakeholders, animated }: { stakeholders: typeof DECISION_DATA.stakeholders; animated: boolean }) {
  const impactColors = {
    positif: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle, label: "Positif" },
    negatif: { bg: "bg-red-50", text: "text-red-700", icon: XCircle, label: "Negatif" },
    neutre: { bg: "bg-gray-50", text: "text-gray-600", icon: AlertTriangle, label: "Neutre" },
  };

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all duration-500",
      animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    )}>
      <div className="bg-gray-50 px-4 py-2.5 border-b flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-bold text-gray-800">Impact sur les parties prenantes</span>
      </div>
      <div className="divide-y">
        {stakeholders.map((s, i) => {
          const imp = impactColors[s.impact];
          const ImpIcon = imp.icon;
          return (
            <div key={i} className="px-4 py-2.5 flex items-start gap-3">
              <div className={cn("mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0", imp.bg)}>
                <ImpIcon className={cn("h-3 w-3", imp.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{s.stakeholder}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", imp.bg, imp.text)}>{imp.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scenarios card ───
function ScenariosCard({ animated }: { animated: boolean }) {
  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all duration-500",
      animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    )}>
      <div className="bg-gray-50 px-4 py-2.5 border-b flex items-center gap-2">
        <Target className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-bold text-gray-800">4 Scenarios possibles</span>
      </div>
      <div className="divide-y">
        {DECISION_DATA.scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className={cn("px-4 py-3", s.bg)}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={cn("h-4 w-4", s.color)} />
                <span className={cn("text-sm font-bold", s.color)}>{s.label}</span>
                <span className="text-[10px] bg-white/60 px-1.5 py-0.5 rounded-full text-gray-600 font-medium">Prob: {s.probability}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1"><strong>Conditions :</strong> {s.conditions}</p>
              <p className="text-xs text-gray-600">{s.outcome}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Verdict card ───
function VerdictCard({ animated }: { animated: boolean }) {
  const v = DECISION_DATA.verdict;

  return (
    <div className={cn(
      "border-2 border-blue-300 rounded-xl overflow-hidden transition-all duration-700",
      animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    )}>
      {/* Decision banner */}
      <div className="bg-blue-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          <span className="text-lg font-black tracking-tight">{v.decision}</span>
        </div>
        <p className="text-xs text-blue-200 mt-1">{v.condition}</p>
      </div>

      {/* Score comparison */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-green-700">Score GO</span>
              <span className="text-sm font-black text-green-700">{v.scoreGo}/120</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${(v.scoreGo / 120) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400">vs</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-red-700">Score NO-GO</span>
              <span className="text-sm font-black text-red-700">{v.scoreNoGo}/120</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${(v.scoreNoGo / 120) * 100}%` }} />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">Ecart : {v.ecart}</p>
      </div>

      {/* Consensus */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-1.5 mb-1">
          <Users className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-700">Consensus du Board</span>
        </div>
        <p className="text-xs text-gray-600">{v.consensus}</p>
      </div>

      {/* Recommandation */}
      <div className="px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-1.5 mb-1.5">
          <BotAvatar code="BCO" size="md" />
          <span className="text-xs font-bold text-gray-800">Recommandation du CEO</span>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">{v.recommandation}</p>
      </div>

      {/* Next steps */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-700">Plan d'action</span>
        </div>
        <div className="space-y-1.5">
          {v.nextSteps.map((ns, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
              <span className="flex-1 text-gray-700">{ns.step}</span>
              <span className="text-[10px] text-gray-400 shrink-0">{ns.deadline}</span>
              <BotAvatar code={ns.bot} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───
export function DecisionDemo() {
  const [stage, setStage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [stage]);

  const advance = (next: number) => () => setStage((s) => Math.max(s, next));

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Mode Decision — Go/No-Go</h2>
            <p className="text-[11px] text-gray-500">Matrice ponderee + Stakeholder Impact + Verdict structure</p>
          </div>
        </div>
        {/* Stage indicator */}
        <div className="flex gap-1 mt-2">
          {["Tension", "Cadrage", "Matrice", "Stakeholders", "Scenarios", "Verdict"].map((label, i) => (
            <div key={i} className={cn(
              "flex-1 h-1.5 rounded-full transition-colors duration-300",
              stage >= i ? "bg-indigo-500" : "bg-gray-200",
            )} title={label} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Stage 0 — User tension */}
        {stage >= 0 && (
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-sm">
              <p className="text-sm leading-relaxed">
                <TypewriterText text={DECISION_DATA.userTension} speed={8} onDone={advance(0.5)} />
              </p>
              <p className="text-[10px] text-blue-200 mt-1 text-right">Carl Fugere — 09:15</p>
            </div>
          </div>
        )}

        {/* Stage 0.5 — CEO intro */}
        {stage >= 0.5 && (
          <div className="flex gap-2">
            <BotAvatar code="BCO" size="md" />
            <div className="bg-white border rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed">
                <TypewriterText text={DECISION_DATA.ceoIntro} speed={10} onDone={advance(1)} />
              </p>
            </div>
          </div>
        )}

        {/* Stage 1 — Thinking setup */}
        {stage >= 1 && (
          <div className="flex gap-2">
            <BotAvatar code="BCO" size="md" />
            <div className="bg-white border rounded-2xl px-4 py-2 shadow-sm">
              <ThinkingAnimation steps={DECISION_DATA.setupThinking} speed={700} onDone={advance(2)} />
            </div>
          </div>
        )}

        {/* Stage 2 — Contexte + Criteres */}
        {stage >= 2 && (
          <>
            {/* Contexte */}
            <div className="bg-white border rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-bold text-gray-800">Matrice de Decision Ponderee</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{DECISION_DATA.contexte}</p>

              <div className="text-[10px] text-gray-400 flex items-center gap-4 mb-3">
                <span>6 criteres | Poids 1-5 | Score 0-10</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-green-500" /> GO
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-red-500" /> NO-GO
                </span>
              </div>
            </div>

            {/* Criteria cards */}
            {DECISION_DATA.criteres.map((c, i) => (
              <CriteriaCard key={c.id} criteria={c} index={i} animated={stage >= 2} />
            ))}

            {/* Auto-advance after criteria appear */}
            {stage === 2 && <AutoAdvance delay={2500} onDone={advance(3)} />}
          </>
        )}

        {/* Stage 3 — Stakeholder Impact */}
        {stage >= 3 && (
          <>
            <StakeholderCard stakeholders={DECISION_DATA.stakeholders} animated={stage >= 3} />
            {stage === 3 && <AutoAdvance delay={2000} onDone={advance(4)} />}
          </>
        )}

        {/* Stage 4 — Scenarios */}
        {stage >= 4 && (
          <>
            <ScenariosCard animated={stage >= 4} />
            {stage === 4 && <AutoAdvance delay={2000} onDone={advance(4.5)} />}
          </>
        )}

        {/* Stage 4.5 — Verdict thinking */}
        {stage >= 4.5 && (
          <div className="flex gap-2">
            <BotAvatar code="BCO" size="md" />
            <div className="bg-white border rounded-2xl px-4 py-2 shadow-sm">
              <ThinkingAnimation steps={DECISION_DATA.verdictThinking} speed={800} onDone={advance(5)} />
            </div>
          </div>
        )}

        {/* Stage 5 — Verdict */}
        {stage >= 5 && <VerdictCard animated={stage >= 5} />}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── Auto-advance helper ───
function AutoAdvance({ delay, onDone }: { delay: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, delay);
    return () => clearTimeout(t);
  }, [delay, onDone]);
  return null;
}
