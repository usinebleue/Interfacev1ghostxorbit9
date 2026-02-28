/**
 * CriseDemo.tsx — Simulation Mode Crise (OODA Loop)
 * Sujet : "Notre plus gros client (35% du CA) menace de partir dans 48h"
 * Boucle OODA : Observer -> Orienter -> Decider -> Agir
 * Animations accelerees (300ms), urgence visuelle, choix binaires
 * Sprint A — Frame Master V2
 */

"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Shield,
  Zap,
  RotateCcw,
  ChevronRight,
  Eye,
  Target,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotAvatar,
  InlineOptions,
} from "../shared/simulation-components";
import { BOT_COLORS } from "../shared/simulation-data";
import { CRISE_DATA } from "./crise-data";

// ========== TYPES ==========

type OODAPhase = "alert" | "observer" | "orienter" | "decider" | "agir" | "stabilise";

const OODA_PHASES: { id: OODAPhase; label: string; full: string }[] = [
  { id: "observer", label: "O", full: "Observer" },
  { id: "orienter", label: "O", full: "Orienter" },
  { id: "decider", label: "D", full: "Decider" },
  { id: "agir", label: "A", full: "Agir" },
];

// ========== OODA PHASE INDICATOR ==========

function OODAIndicator({ phase }: { phase: OODAPhase }) {
  const phaseIndex = OODA_PHASES.findIndex((p) => p.id === phase);

  return (
    <div className="flex items-center gap-1">
      {OODA_PHASES.map((p, i) => {
        const isActive = p.id === phase;
        const isPast = phaseIndex > i;
        const isDone = phase === "stabilise";
        return (
          <div key={`${p.id}-${i}`} className="flex items-center gap-1">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                isActive && "bg-red-600 text-white shadow-md scale-110",
                (isPast || isDone) && "bg-orange-500 text-white",
                !isActive && !isPast && !isDone && "bg-gray-200 text-gray-500"
              )}
            >
              {isPast || isDone ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                p.label
              )}
            </div>
            {i < OODA_PHASES.length - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5 transition-all duration-300",
                  isPast || isDone ? "bg-orange-400" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
      <span className="text-xs text-red-600 ml-2 font-bold uppercase tracking-wide">
        {phase === "alert"
          ? "Alerte"
          : phase === "stabilise"
            ? "Stabilise"
            : OODA_PHASES.find((p) => p.id === phase)?.full}
      </span>
    </div>
  );
}

// ========== ALERT CARD ==========

function AlertCard({
  message,
  onActivate,
}: {
  message: string;
  onActivate: () => void;
}) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-red-50 via-red-100 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-lg animate-in fade-in duration-500">
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <div
            className={cn(
              "absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 transition-opacity duration-300",
              pulse ? "opacity-100" : "opacity-30"
            )}
          />
        </div>
        <div>
          <div className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">
            Alerte critique
          </div>
          <div className="text-xs text-red-600 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Il y a 3 minutes
          </div>
        </div>
      </div>
      <div className="bg-white/70 border border-red-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-red-900 leading-relaxed italic">
          &quot;{message}&quot;
        </p>
        <p className="text-xs text-red-500 mt-2 font-medium">
          — Jean-Pierre Lavoie, VP Approvisionnement, Aeromax inc.
        </p>
      </div>
      <button
        onClick={onActivate}
        className={cn(
          "w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
          "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
          pulse && "ring-2 ring-red-400 ring-offset-2"
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          Mode Crise
          <Zap className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
}

// ========== FACTS DASHBOARD ==========

function FactsDashboard({
  facts,
  animate,
}: {
  facts: typeof CRISE_DATA.observe.facts;
  animate: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : facts.length);

  useEffect(() => {
    if (!animate) return;
    if (visibleCount >= facts.length) return;
    const timer = setTimeout(
      () => setVisibleCount((c) => c + 1),
      200
    );
    return () => clearTimeout(timer);
  }, [visibleCount, animate, facts.length]);

  const severityConfig = {
    critical: {
      border: "border-l-red-500",
      bg: "bg-red-50",
      text: "text-red-700",
      badge: "bg-red-100 text-red-700",
      label: "CRITIQUE",
    },
    warning: {
      border: "border-l-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      label: "ATTENTION",
    },
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
      label: "INFO",
    },
  };

  return (
    <div className="ml-11 grid grid-cols-2 gap-2">
      {facts.slice(0, visibleCount).map((fact, i) => {
        const cfg = severityConfig[fact.severity];
        return (
          <div
            key={i}
            className={cn(
              "border border-gray-200 border-l-[3px] rounded-lg p-2.5 transition-all duration-300 animate-in fade-in slide-in-from-left-2",
              cfg.border,
              cfg.bg
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-500 font-medium">
                {fact.label}
              </span>
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                  cfg.badge
                )}
              >
                {cfg.label}
              </span>
            </div>
            <div className={cn("text-sm font-semibold", cfg.text)}>
              {fact.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== TIMER DISPLAY ==========

function TimerDisplay({ time }: { time: string }) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ml-11 bg-gradient-to-r from-gray-900 to-red-900 rounded-xl px-5 py-4 shadow-lg animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full bg-red-500 transition-opacity duration-300",
              pulse ? "opacity-100" : "opacity-20"
            )}
          />
          <span className="text-xs text-red-300 uppercase tracking-wider font-bold">
            Temps restant
          </span>
        </div>
        <Clock className="h-4 w-4 text-red-400" />
      </div>
      <div className="text-3xl font-mono font-bold text-white mt-1 tracking-widest">
        {time}
      </div>
    </div>
  );
}

// ========== ASSIGNMENT CARD ==========

function AssignmentCard({
  assignment,
  index,
  animate,
}: {
  assignment: (typeof CRISE_DATA.decide.assignments)[number];
  index: number;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);
  const botColor = BOT_COLORS[assignment.bot];

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), index * 400);
    return () => clearTimeout(timer);
  }, [animate, index]);

  if (!visible) return null;

  const colorMap: Record<string, string> = {
    blue: "border-l-blue-500 bg-blue-50/50",
    orange: "border-l-orange-500 bg-orange-50/50",
    violet: "border-l-violet-500 bg-violet-50/50",
    emerald: "border-l-emerald-500 bg-emerald-50/50",
  };

  return (
    <div
      className={cn(
        "border border-gray-200 border-l-[3px] rounded-lg p-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
        colorMap[assignment.color] || "border-l-gray-400"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <BotAvatar code={assignment.bot} size="sm" />
        <div>
          <span className={cn("text-xs font-bold", botColor?.text || "text-gray-700")}>
            {botColor?.name || assignment.bot}
          </span>
          <span className="text-[10px] text-gray-400 ml-1.5">
            ({assignment.role})
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-snug">{assignment.task}</p>
    </div>
  );
}

// ========== PLAN CORRECTIF CARD ==========

function PlanCorrectifCard({
  plan,
  animate,
}: {
  plan: typeof CRISE_DATA.act.planCorrectif;
  animate: boolean;
}) {
  const [visibleSections, setVisibleSections] = useState(
    animate ? 0 : plan.sections.length
  );

  useEffect(() => {
    if (!animate) return;
    if (visibleSections >= plan.sections.length) return;
    const timer = setTimeout(
      () => setVisibleSections((c) => c + 1),
      500
    );
    return () => clearTimeout(timer);
  }, [visibleSections, animate, plan.sections.length]);

  return (
    <div className="ml-11 bg-white border-2 border-orange-200 rounded-xl p-4 shadow-md animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-orange-600" />
        <span className="text-sm font-bold text-orange-800">{plan.titre}</span>
      </div>
      <div className="space-y-3">
        {plan.sections.slice(0, visibleSections).map((section) => (
          <div
            key={section.num}
            className="animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                {section.num}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {section.titre}
              </span>
            </div>
            {"contenu" in section && section.contenu && (
              <p className="text-sm text-gray-600 ml-7">{section.contenu}</p>
            )}
            {"items" in section && section.items && (
              <ul className="ml-7 space-y-1">
                {section.items.map((item: string, j: number) => (
                  <li
                    key={j}
                    className="flex items-start gap-1.5 text-sm text-gray-600"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== STABILISE CARD ==========

function StabiliseCard({ onRestart, onTransition }: { onRestart: () => void; onTransition?: (target: string) => void }) {
  return (
    <div className="ml-11 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-md animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-green-800 uppercase tracking-wide">
            Crise stabilisee
          </div>
          <div className="text-xs text-green-600">
            Boucle OODA completee en 47 minutes
          </div>
        </div>
      </div>
      <div className="bg-white/70 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-800">
          Meeting confirme demain 8h. Plan correctif envoye. Le client a repondu
          positivement au premier contact. La crise n&apos;est pas resolue, mais
          le temps a ete achete et la credibilite restauree.
        </p>
      </div>
      {/* Actions — TYPE 6 Synthese/Verdict */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <button
          onClick={() => onTransition?.("analyse")}
          className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-cyan-100 font-medium cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" /> Post-mortem (Analyse)
        </button>
        <button
          onClick={() => onTransition?.("strategie")}
          className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-100 font-medium cursor-pointer"
        >
          <Target className="h-3.5 w-3.5" /> Prevention (Strategie)
        </button>
      </div>
      <button
        onClick={onRestart}
        className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium transition-colors cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" />
        Relancer la simulation
      </button>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export function CriseDemo({ onComplete, onTransition: onTransitionProp }: { onComplete?: () => void; onTransition?: (target: string) => void } = {}) {
  const [stage, setStage] = useState(0);
  const [oodaPhase, setOodaPhase] = useState<OODAPhase>("alert");
  const [orientChoice, setOrientChoice] = useState<number | null>(null);
  const [ceoTextDone, setCeoTextDone] = useState(false);
  const [orientTextDone, setOrientTextDone] = useState(false);
  const [directiveTextDone, setDirectiveTextDone] = useState(false);
  const [resultTextDone, setResultTextDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const data = CRISE_DATA;

  // Auto-scroll on stage change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, [stage, ceoTextDone, orientTextDone, directiveTextDone, resultTextDone]);

  // Notify parent when simulation complete
  useEffect(() => {
    if (stage >= 10) {
      onComplete?.();
    }
  }, [stage, onComplete]);

  function handleRestart() {
    setStage(0);
    setOodaPhase("alert");
    setOrientChoice(null);
    setCeoTextDone(false);
    setOrientTextDone(false);
    setDirectiveTextDone(false);
    setResultTextDone(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="border-b px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-red-50/50 to-orange-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-red-600" />
            <span className="text-sm font-bold text-red-800">Mode Crise</span>
          </div>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500 truncate max-w-[300px]">
            {data.titre}
          </span>
        </div>
        <OODAIndicator phase={oodaPhase} />
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* ============================================ */}
          {/* STAGE 0 — ALERT */}
          {/* ============================================ */}
          {stage === 0 && (
            <AlertCard
              message={data.alertMessage}
              onActivate={() => {
                setOodaPhase("observer");
                setStage(1);
              }}
            />
          )}

          {/* ============================================ */}
          {/* STAGE 1 — OBSERVER: CEO Thinking (fast) */}
          {/* ============================================ */}
          {stage >= 1 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <div className="h-px flex-1 bg-red-200" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider px-2">
                {data.observe.label}
              </span>
              <div className="h-px flex-1 bg-red-200" />
            </div>
          )}

          {stage === 1 && (
            <ThinkingAnimation
              steps={data.observe.thinking}
              botEmoji=""
              botCode="BCO"
              botName="CarlOS"
              speed={300}
              onComplete={() => setStage(1.5)}
            />
          )}

          {/* STAGE 1.5 — CEO Message + Facts Dashboard */}
          {stage >= 1.5 && stage < 3 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm border-l-blue-400">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-700">
                    CarlOS (CEO)
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                    CRISE
                  </span>
                </div>
                {stage === 1.5 ? (
                  <TypewriterText
                    text={data.observe.ceoMessage}
                    speed={8}
                    className="text-sm text-gray-800"
                    onComplete={() => setCeoTextDone(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-800">
                    {data.observe.ceoMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {stage === 1.5 && ceoTextDone && (
            <FactsDashboard facts={data.observe.facts} animate={true} />
          )}

          {/* Continue button after facts */}
          {stage === 1.5 && ceoTextDone && (
            <div className="flex justify-center py-2">
              <button onClick={() => setStage(2)}
                className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-200 hover:text-gray-800 font-medium transition-colors cursor-pointer">
                <ChevronRight className="h-3.5 w-3.5" /> Passer a l'orientation
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* STAGE 2 — ORIENTER: CEO analysis + binary choice */}
          {/* ============================================ */}
          {stage >= 2 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <div className="h-px flex-1 bg-orange-200" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider px-2">
                {data.orient.label}
              </span>
              <div className="h-px flex-1 bg-orange-200" />
            </div>
          )}

          {stage >= 2 && stage < 5 && (
            <OrientStage
              stage={stage}
              data={data}
              orientTextDone={orientTextDone}
              onTextDone={() => setOrientTextDone(true)}
              onSelect={(num) => {
                setOrientChoice(num);
                setOodaPhase("decider");
                setStage(num === 1 ? 2.5 : 3);
              }}
            />
          )}

          {/* STAGE 2.5 — Option 1: Appel immediat (path rapide) */}
          {stage >= 2.5 && stage < 3 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm border-l-red-400">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-700">CarlOS (CEO)</span>
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">APPEL IMMEDIAT</span>
                </div>
                <TypewriterText
                  text="Tu as choisi l'attaque directe. On appelle Jean-Pierre MAINTENANT. C'est risque mais ca montre qu'on prend la situation au serieux. Je prepare le script d'appel pendant que le reste de l'equipe se mobilise en parallele."
                  speed={8}
                  className="text-sm text-gray-800"
                  onComplete={() => setStage(3)}
                />
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* STAGE 3 — DECIDER: Thinking + Directive + Assignments */}
          {/* ============================================ */}
          {stage >= 3 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <div className="h-px flex-1 bg-amber-200" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider px-2">
                {data.decide.label}
              </span>
              <div className="h-px flex-1 bg-amber-200" />
            </div>
          )}

          {stage === 3 && (
            <ThinkingAnimation
              steps={data.decide.thinking}
              botEmoji=""
              botCode="BCO"
              botName="CarlOS"
              speed={300}
              onComplete={() => setStage(3.5)}
            />
          )}

          {/* STAGE 3.5 — CEO Directive (adapted to choice) */}
          {stage >= 3.5 && stage < 6 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm border-l-blue-400">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-700">
                    CarlOS (CEO)
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                    DIRECTIVE
                  </span>
                </div>
                {stage === 3.5 ? (
                  <TypewriterText
                    text={orientChoice === 2
                      ? "Plan correctif d'abord — on redige un document structure avant d'appeler. Ca prend 2 heures de plus mais on arrive avec du concret. Voici la repartition :"
                      : data.decide.ceoDirective
                    }
                    speed={8}
                    className="text-sm text-gray-800 font-medium"
                    onComplete={() => {
                      setDirectiveTextDone(true);
                      setStage(4);
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-800 font-medium">
                    {orientChoice === 2
                      ? "Plan correctif d'abord — on redige un document structure avant d'appeler. Ca prend 2 heures de plus mais on arrive avec du concret. Voici la repartition :"
                      : data.decide.ceoDirective
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STAGE 4 — Assignment Cards (sequential reveal) */}
          {stage >= 4 && stage < 6 && (
            <div className="ml-11 space-y-2">
              {data.decide.assignments.map((assignment, i) => (
                <AssignmentCard
                  key={assignment.bot}
                  assignment={assignment}
                  index={i}
                  animate={stage === 4}
                />
              ))}
            </div>
          )}

          {stage === 4 && directiveTextDone && (
            <div className="flex justify-center py-2">
              <button onClick={() => setStage(orientChoice === 1 ? 6 : 5)}
                className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-200 hover:text-gray-800 font-medium transition-colors cursor-pointer">
                <ChevronRight className="h-3.5 w-3.5" /> {orientChoice === 1 ? "Passer a l'appel" : "Voir le plan correctif"}
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* STAGE 5 — AGIR: Timer + Plan + Resultat */}
          {/* ============================================ */}
          {stage >= 5 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <div className="h-px flex-1 bg-red-200" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider px-2">
                {data.act.label}
              </span>
              <div className="h-px flex-1 bg-red-200" />
            </div>
          )}

          {stage >= 5 && stage < 10 && (
            <>
              {/* Set phase on mount */}
              <PhaseUpdater phase="agir" setPhase={setOodaPhase} stage={5} currentStage={stage} />

              <TimerDisplay time={data.act.timer} />
            </>
          )}

          {stage >= 5.5 && stage < 10 && (
            <PlanCorrectifCard
              plan={data.act.planCorrectif}
              animate={stage === 5.5}
            />
          )}

          {stage === 5 && (
            <div className="flex justify-center py-2">
              <button onClick={() => setStage(5.5)}
                className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-200 hover:text-gray-800 font-medium transition-colors cursor-pointer">
                <ChevronRight className="h-3.5 w-3.5" /> Voir le plan correctif
              </button>
            </div>
          )}

          {stage === 5.5 && (
            <div className="flex justify-center py-2">
              <button onClick={() => setStage(6)}
                className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-200 hover:text-gray-800 font-medium transition-colors cursor-pointer">
                <ChevronRight className="h-3.5 w-3.5" /> Voir le resultat
              </button>
            </div>
          )}

          {/* STAGE 6 — Resultat message (differs by orient choice) */}
          {stage >= 6 && stage < 10 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm border-l-green-400">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-green-700">
                    CarlOS (CEO)
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                    RESULTAT
                  </span>
                </div>
                {stage === 6 ? (
                  <TypewriterText
                    text={orientChoice === 1
                      ? "Appel fait dans les 30 minutes. Jean-Pierre etait surpris — \"C'est la premiere fois qu'un fournisseur reagit aussi vite.\" Il a accepte un meeting demain 8h. On n'a pas de plan ecrit, mais la credibilite est restauree par la vitesse d'execution. Risque : il va demander le plan demain, il faut le produire cette nuit."
                      : data.act.resultat
                    }
                    speed={8}
                    className="text-sm text-gray-800"
                    onComplete={() => {
                      setResultTextDone(true);
                      setStage(7);
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-800">
                    {orientChoice === 1
                      ? "Appel fait dans les 30 minutes. Jean-Pierre etait surpris — \"C'est la premiere fois qu'un fournisseur reagit aussi vite.\" Il a accepte un meeting demain 8h. On n'a pas de plan ecrit, mais la credibilite est restauree par la vitesse d'execution. Risque : il va demander le plan demain, il faut le produire cette nuit."
                      : data.act.resultat
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* STAGE 7+ — STABILISE */}
          {/* ============================================ */}
          {stage >= 7 && (
            <>
              <PhaseUpdater phase="stabilise" setPhase={setOodaPhase} stage={7} currentStage={stage} />
              <StabiliseCard onRestart={handleRestart} onTransition={onTransitionProp} />
            </>
          )}

          {/* Bottom spacer for scroll */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

// (AutoAdvance components removed — replaced with manual Continue buttons)

/** Updates the OODA phase indicator without rendering anything */
function PhaseUpdater({
  phase,
  setPhase,
  stage,
  currentStage,
}: {
  phase: OODAPhase;
  setPhase: (p: OODAPhase) => void;
  stage: number;
  currentStage: number;
}) {
  useEffect(() => {
    if (currentStage >= stage) {
      setPhase(phase);
    }
  }, [currentStage, stage, phase, setPhase]);
  return null;
}

// ========== ORIENT STAGE (extracted for clarity) ==========

function OrientStage({
  stage,
  data,
  orientTextDone,
  onTextDone,
  onSelect,
}: {
  stage: number;
  data: typeof CRISE_DATA;
  orientTextDone: boolean;
  onTextDone: () => void;
  onSelect: (num: number) => void;
}) {
  useEffect(() => {
    // No-op, phase is set by parent
  }, []);

  return (
    <>
      <div className="flex gap-3">
        <BotAvatar code="BCO" size="md" />
        <div className="bg-white border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm border-l-blue-400">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-700">
              CarlOS (CEO)
            </span>
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
              ANALYSE
            </span>
          </div>
          {stage === 2 ? (
            <TypewriterText
              text={data.orient.ceoMessage}
              speed={8}
              className="text-sm text-gray-800"
              onComplete={onTextDone}
            />
          ) : (
            <p className="text-sm text-gray-800">{data.orient.ceoMessage}</p>
          )}
          {(stage > 2 || orientTextDone) && (
            <InlineOptions
              options={data.orient.options}
              onSelect={onSelect}
              animate={stage === 2}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default CriseDemo;
