"use client";

/**
 * AnalyseDemo.tsx — Simulation interactive Mode Analyse
 * 5 Pourquoi + Diagramme Ishikawa : "Marges brutes en chute de 42% a 31%"
 * CTO lead — Temperature 0.4
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  Eye,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotAvatar,
  SourcesList,
  UserBubble,
  BotBubble,
  PhaseIndicator,
} from "../shared/simulation-components";
import { BOT_COLORS } from "../shared/simulation-data";
import {
  ANALYSE_DATA,
  type WhyStep,
  type IshikawaBranch,
  type EvidenceCard,
  type CorrectiveAction,
} from "./analyse-data";
import type { CREDOPhase, Source } from "../shared/simulation-types";

// ========== FIVE WHYS CHAIN ==========

function FiveWhysChain({
  steps,
  animate,
  onComplete,
}: {
  steps: WhyStep[];
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : steps.length);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    if (!animate) return;
    if (visibleCount >= steps.length) {
      const doneTimer = setTimeout(() => onComplete?.(), 600);
      return () => clearTimeout(doneTimer);
    }
    const timer = setTimeout(
      () => setVisibleCount((prev) => prev + 1),
      1200
    );
    return () => clearTimeout(timer);
  }, [visibleCount, animate, steps.length]);

  // Color gradient from light to dark cyan
  const depthColors = [
    { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-800", arrow: "text-cyan-300" },
    { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-800", badge: "bg-cyan-200 text-cyan-900", arrow: "text-cyan-400" },
    { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", badge: "bg-teal-200 text-teal-900", arrow: "text-teal-400" },
    { bg: "bg-teal-200", border: "border-teal-400", text: "text-teal-900", badge: "bg-teal-300 text-teal-950", arrow: "text-teal-500" },
    { bg: "bg-teal-300", border: "border-teal-500", text: "text-teal-950", badge: "bg-teal-400 text-teal-950", arrow: "text-teal-600" },
  ];

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-cyan-50 to-white border border-cyan-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-100 to-teal-100 px-4 py-2.5 flex items-center gap-2 border-b border-cyan-200">
          <TrendingDown className="h-4 w-4 text-cyan-700" />
          <span className="text-sm font-bold text-cyan-800">
            Les 5 Pourquoi
          </span>
          <span className="text-xs bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full ml-auto font-medium">
            Cause racine
          </span>
        </div>

        {/* Why chain */}
        <div className="p-4 space-y-0">
          {steps.map((step, i) => {
            if (i >= visibleCount) return null;
            const depth = depthColors[i];
            const isLast = i === steps.length - 1;
            const isExpanded = expandedStep === i;

            return (
              <div key={i}>
                {/* Arrow connector */}
                {i > 0 && (
                  <div className="flex justify-center py-1.5">
                    <ArrowDown className={cn("h-5 w-5", depthColors[i - 1].arrow)} />
                  </div>
                )}

                {/* Why card */}
                <div
                  className={cn(
                    "border rounded-lg overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-md",
                    depth.border,
                    depth.bg,
                    animate && i === visibleCount - 1
                      ? "animate-in fade-in slide-in-from-bottom-2 duration-500"
                      : ""
                  )}
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : i)
                  }
                >
                  <div className="px-4 py-3">
                    {/* Question */}
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                          depth.badge
                        )}
                      >
                        P{step.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            depth.text
                          )}
                        >
                          {step.question}
                        </p>
                        {/* Answer */}
                        <p className="text-sm text-gray-700 leading-relaxed mt-1.5">
                          {animate && i === visibleCount - 1 ? (
                            <TypewriterText
                              text={step.answer}
                              speed={6}
                              className="text-sm text-gray-700 leading-relaxed"
                            />
                          ) : (
                            step.answer
                          )}
                        </p>

                        {/* Evidence (expandable) */}
                        {(isExpanded || isLast) && (
                          <div className="mt-2 animate-in fade-in duration-300">
                            <div className="bg-white/60 border border-gray-200 rounded px-3 py-2">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Evidence
                              </div>
                              <p className="text-xs text-gray-600 italic">
                                {step.evidence}
                              </p>
                            </div>
                            <SourcesList sources={step.sources} />
                          </div>
                        )}

                        {/* Root cause badge on last step */}
                        {isLast && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-full border border-red-300">
                              <AlertTriangle className="h-3 w-3" />
                              CAUSE RACINE IDENTIFIEE
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== ISHIKAWA DIAGRAM ==========

function IshikawaDiagram({
  probleme,
  branches,
  animate,
  onComplete,
}: {
  probleme: string;
  branches: IshikawaBranch[];
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleBranches, setVisibleBranches] = useState(
    animate ? 0 : branches.length
  );
  const [spineVisible, setSpineVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    // Show spine first
    const spineTimer = setTimeout(() => setSpineVisible(true), 300);
    return () => clearTimeout(spineTimer);
  }, [animate]);

  useEffect(() => {
    if (!animate || !spineVisible) return;
    if (visibleBranches >= branches.length) {
      const doneTimer = setTimeout(() => onComplete?.(), 600);
      return () => clearTimeout(doneTimer);
    }
    const timer = setTimeout(
      () => setVisibleBranches((prev) => prev + 1),
      800
    );
    return () => clearTimeout(timer);
  }, [visibleBranches, spineVisible, animate, branches.length]);

  const topBranches = branches.filter((b) => b.position === "top");
  const bottomBranches = branches.filter((b) => b.position === "bottom");

  const branchColors: Record<string, { bg: string; border: string; text: string; headerBg: string }> = {
    man: { bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-800", headerBg: "bg-cyan-100" },
    method: { bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-800", headerBg: "bg-teal-100" },
    machine: { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-800", headerBg: "bg-sky-100" },
    material: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", headerBg: "bg-emerald-100" },
    measurement: { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-800", headerBg: "bg-indigo-100" },
    milieu: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-800", headerBg: "bg-violet-100" },
  };

  const isBranchVisible = (branch: IshikawaBranch) => {
    const idx = branches.findIndex((b) => b.id === branch.id);
    return idx < visibleBranches;
  };

  function BranchCard({ branch }: { branch: IshikawaBranch }) {
    const visible = isBranchVisible(branch);
    const colors = branchColors[branch.id] || branchColors.man;
    const Icon = branch.icon;

    return (
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all duration-500 flex-1",
          colors.border,
          colors.bg,
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        )}
      >
        <div
          className={cn(
            "px-3 py-1.5 flex items-center gap-1.5 border-b",
            colors.headerBg,
            colors.border
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", colors.text)} />
          <span className={cn("text-xs font-bold", colors.text)}>
            {branch.label}
          </span>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          {branch.causes.map((cause, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", colors.border.replace("border-", "bg-"))} />
              <div className="min-w-0">
                <p className="text-xs text-gray-800 font-medium leading-tight">
                  {cause.cause}
                </p>
                <p className="text-[10px] text-gray-500 italic leading-tight">
                  {cause.evidence}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-gray-50 to-white border border-cyan-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-100 to-teal-100 px-4 py-2.5 flex items-center gap-2 border-b border-cyan-200">
          <Eye className="h-4 w-4 text-cyan-700" />
          <span className="text-sm font-bold text-cyan-800">
            Diagramme Ishikawa (6M)
          </span>
          <span className="text-xs bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full ml-auto font-medium">
            Causes contributives
          </span>
        </div>

        <div className="p-4">
          {/* Top branches */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {topBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>

          {/* Central spine — the problem */}
          <div
            className={cn(
              "transition-all duration-700",
              spineVisible
                ? "opacity-100 scale-x-100"
                : "opacity-0 scale-x-0"
            )}
          >
            {/* Angled lines pointing down from top */}
            <div className="flex justify-around px-8 -mb-1">
              {topBranches.map((_, i) => (
                <div key={i} className="w-px h-4 bg-cyan-300" />
              ))}
            </div>

            {/* Spine bar */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-lg px-4 py-3 flex items-center justify-center gap-3 shadow-md">
              <AlertTriangle className="h-5 w-5 text-white shrink-0" />
              <span className="text-sm font-bold text-white text-center">
                {probleme}
              </span>
              <AlertTriangle className="h-5 w-5 text-white shrink-0" />
            </div>

            {/* Angled lines pointing up to bottom */}
            <div className="flex justify-around px-8 -mt-1">
              {bottomBranches.map((_, i) => (
                <div key={i} className="w-px h-4 bg-cyan-300" />
              ))}
            </div>
          </div>

          {/* Bottom branches */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {bottomBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== EVIDENCE CARDS ==========

function EvidenceCards({
  cards,
  animate,
  onComplete,
}: {
  cards: EvidenceCard[];
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(
    animate ? 0 : cards.length
  );

  useEffect(() => {
    if (!animate) return;
    if (visibleCount >= cards.length) {
      const doneTimer = setTimeout(() => onComplete?.(), 400);
      return () => clearTimeout(doneTimer);
    }
    const timer = setTimeout(
      () => setVisibleCount((prev) => prev + 1),
      900
    );
    return () => clearTimeout(timer);
  }, [visibleCount, animate, cards.length]);

  const trendIcon = (trend?: "up" | "down" | "neutral") => {
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
    if (trend === "up") return <TrendingDown className="h-3 w-3 text-green-500 rotate-180" />;
    return null;
  };

  return (
    <div className="ml-11 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <BotAvatar code="BCT" size="sm" />
        <span className="text-xs font-semibold text-violet-700">
          Thomas (CTO) — Donnees d'analyse
        </span>
      </div>

      {cards.map((card, i) => {
        if (i >= visibleCount) return null;
        const CardIcon = card.icon;

        return (
          <div
            key={i}
            className={cn(
              "bg-white border border-violet-200 rounded-xl overflow-hidden shadow-sm transition-all duration-500",
              animate && i === visibleCount - 1
                ? "animate-in fade-in slide-in-from-left-4 duration-500"
                : ""
            )}
          >
            {/* Card header */}
            <div className="bg-violet-50 px-4 py-2 flex items-center gap-2 border-b border-violet-200">
              <CardIcon className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-800">
                {card.title}
              </span>
            </div>

            <div className="p-4">
              {/* Content */}
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {animate && i === visibleCount - 1 ? (
                  <TypewriterText
                    text={card.content}
                    speed={6}
                    className="text-sm text-gray-700 leading-relaxed"
                  />
                ) : (
                  card.content
                )}
              </p>

              {/* Data points grid */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {card.dataPoints.map((dp, j) => (
                  <div
                    key={j}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <div className="text-[10px] text-gray-500 uppercase font-medium">
                      {dp.label}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          dp.trend === "down"
                            ? "text-red-700"
                            : dp.trend === "up"
                            ? "text-green-700"
                            : "text-gray-800"
                        )}
                      >
                        {dp.value}
                      </span>
                      {trendIcon(dp.trend)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sources */}
              <SourcesList sources={card.sources} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== SYNTHESE CARD ==========

function SyntheseCard({
  synthese,
  animate,
}: {
  synthese: typeof ANALYSE_DATA.synthese;
  animate: boolean;
}) {
  const [visibleActions, setVisibleActions] = useState(
    animate ? 0 : synthese.actions.length
  );
  const [conclusionVisible, setConclusionVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timers = synthese.actions.map((_, i) =>
      setTimeout(() => setVisibleActions(i + 1), (i + 1) * 700)
    );
    const conclusionTimer = setTimeout(
      () => setConclusionVisible(true),
      (synthese.actions.length + 1) * 700
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(conclusionTimer);
    };
  }, [animate, synthese.actions.length]);

  const prioriteStyles: Record<string, { bg: string; text: string; label: string }> = {
    critique: { bg: "bg-red-100", text: "text-red-800", label: "CRITIQUE" },
    haute: { bg: "bg-orange-100", text: "text-orange-800", label: "HAUTE" },
    moyenne: { bg: "bg-yellow-100", text: "text-yellow-800", label: "MOYENNE" },
  };

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-cyan-50 to-white border-2 border-cyan-400 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-100 to-teal-100 px-4 py-3 flex items-center gap-2 border-b border-cyan-300">
          <Target className="h-5 w-5 text-cyan-800" />
          <div className="flex-1">
            <div className="text-sm font-bold text-cyan-900">
              Synthese de l'Analyse
            </div>
            <div className="text-xs text-cyan-700">
              5 Pourquoi + Ishikawa — Cause racine identifiee
            </div>
          </div>
          <BotAvatar code="BCO" size="sm" />
        </div>

        <div className="p-4 space-y-4">
          {/* Root cause */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-700" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-700 uppercase mb-1">
                Cause racine
              </div>
              {animate ? (
                <TypewriterText
                  text={synthese.causeRacine}
                  speed={10}
                  className="text-sm text-gray-800 leading-relaxed font-medium"
                />
              ) : (
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {synthese.causeRacine}
                </p>
              )}
            </div>
          </div>

          {/* Impact total */}
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">
                {synthese.impactTotal}
              </span>
            </div>
          </div>

          {/* Corrective actions */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
              5 actions correctives
            </div>
            <div className="space-y-2">
              {synthese.actions.map((action, i) => {
                const prio = prioriteStyles[action.priorite];
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 transition-all duration-500",
                      i < visibleActions
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-cyan-900">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {action.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            prio.bg,
                            prio.text
                          )}
                        >
                          {prio.label}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {action.timeline}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {action.responsable}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conclusion */}
          {conclusionVisible && (
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg px-4 py-3 animate-in fade-in duration-700">
              <div className="flex items-start gap-2">
                <BotAvatar code="BCO" size="sm" className="mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-cyan-700 mb-1">
                    Conclusion CarlOS
                  </div>
                  {animate ? (
                    <TypewriterText
                      text={synthese.conclusion}
                      speed={10}
                      className="text-sm text-gray-800 leading-relaxed font-medium"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {synthese.conclusion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

/**
 * Stages :
 * 0    — Start button
 * 1    — User sends tension
 * 1.5  — CEO thinking animation (CTO lead)
 * 2    — CEO intro (typewriter) — sets up the analysis mode
 * 3    — 5 Pourquoi chain (vertical, animated sequentially)
 * 4    — Ishikawa Diagram (6M fishbone layout)
 * 5    — Evidence Cards (3 CTO data cards)
 * 6    — Synthese thinking animation
 * 7    — Synthese card (root cause + 5 actions + timeline)
 * 8    — Done + restart
 */
export function AnalyseDemo({
  onComplete,
}: { onComplete?: () => void } = {}) {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<CREDOPhase>("C");
  const [ceoIntroDone, setCeoIntroDone] = useState(false);
  const [whysDone, setWhysDone] = useState(false);
  const [ishikawaDone, setIshikawaDone] = useState(false);
  const [evidenceDone, setEvidenceDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on stage change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 150);
  }, [stage, whysDone, ishikawaDone, evidenceDone]);

  const handleRestart = () => {
    setStage(0);
    setPhase("C");
    setCeoIntroDone(false);
    setWhysDone(false);
    setIshikawaDone(false);
    setEvidenceDone(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-600" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              Mode Analyse — CTO Lead
            </div>
            <div className="text-xs text-muted-foreground">
              5 Pourquoi + Ishikawa : erosion de marge
            </div>
          </div>
        </div>
        <PhaseIndicator phase={phase} />
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
          {/* ===== STAGE 0 — Start button ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-16">
              <button
                onClick={() => setStage(1)}
                className="flex items-center gap-3 bg-cyan-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-cyan-700 transition-all hover:scale-105"
              >
                <Eye className="h-5 w-5" /> Lancer l'Analyse
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User tension ===== */}
          {stage >= 1 && (
            <UserBubble text={ANALYSE_DATA.userTension} time="10:32" />
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1"
              >
                <Eye className="h-3 w-3" /> CarlOS analyse la tension...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={ANALYSE_DATA.ceoThinking}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => {
                setPhase("R");
                setStage(2);
              }}
            />
          )}

          {/* ===== STAGE 2 — CEO intro ===== */}
          {stage >= 2 && (
            <BotBubble
              code="BCO"
              text={ANALYSE_DATA.ceoIntro}
              phaseLabel="Mode Analyse"
              time="10:33"
              typewrite={stage === 2}
              onTypewriteDone={() => setCeoIntroDone(true)}
            />
          )}
          {stage === 2 && ceoIntroDone && (
            <div className="flex justify-center animate-in fade-in duration-500">
              <button
                onClick={() => {
                  setPhase("E");
                  setStage(3);
                }}
                className="text-xs bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 flex items-center gap-1.5 font-medium"
              >
                <TrendingDown className="h-3.5 w-3.5" /> Les 5 Pourquoi
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — 5 Pourquoi chain ===== */}
          {stage >= 3 && (
            <FiveWhysChain
              steps={ANALYSE_DATA.cinqPourquoi}
              animate={stage === 3}
              onComplete={() => setWhysDone(true)}
            />
          )}
          {stage === 3 && whysDone && (
            <div className="flex justify-center animate-in fade-in duration-500">
              <button
                onClick={() => setStage(4)}
                className="text-xs bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 flex items-center gap-1.5 font-medium"
              >
                <ArrowRight className="h-3.5 w-3.5" /> Diagramme Ishikawa
              </button>
            </div>
          )}

          {/* ===== STAGE 4 — Ishikawa Diagram ===== */}
          {stage >= 4 && (
            <IshikawaDiagram
              probleme={ANALYSE_DATA.ishikawa.probleme}
              branches={ANALYSE_DATA.ishikawa.branches}
              animate={stage === 4}
              onComplete={() => setIshikawaDone(true)}
            />
          )}
          {stage === 4 && ishikawaDone && (
            <div className="flex justify-center animate-in fade-in duration-500">
              <button
                onClick={() => setStage(5)}
                className="text-xs bg-violet-600 text-white px-4 py-2 rounded-full hover:bg-violet-700 flex items-center gap-1.5 font-medium"
              >
                <ArrowRight className="h-3.5 w-3.5" /> Donnees CTO
              </button>
            </div>
          )}

          {/* ===== STAGE 5 — Evidence Cards ===== */}
          {stage >= 5 && (
            <EvidenceCards
              cards={ANALYSE_DATA.evidenceCards}
              animate={stage === 5}
              onComplete={() => setEvidenceDone(true)}
            />
          )}
          {stage === 5 && evidenceDone && (
            <div className="flex justify-center animate-in fade-in duration-500">
              <button
                onClick={() => {
                  setPhase("D");
                  setStage(6);
                }}
                className="text-xs bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 flex items-center gap-1.5 font-medium"
              >
                <Target className="h-3.5 w-3.5" /> Synthese
              </button>
            </div>
          )}

          {/* ===== STAGE 6 — Synthese thinking ===== */}
          {stage === 6 && (
            <ThinkingAnimation
              steps={ANALYSE_DATA.syntheseThinking}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => {
                setPhase("O");
                setStage(7);
              }}
            />
          )}

          {/* ===== STAGE 7 — Synthese card ===== */}
          {stage >= 7 && (
            <SyntheseCard
              synthese={ANALYSE_DATA.synthese}
              animate={stage === 7}
            />
          )}

          {/* ===== STAGE 8 — End actions ===== */}
          {stage >= 7 && (
            <div className="space-y-3 animate-in fade-in duration-700">
              {/* Completion summary */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Analyse terminee — Cause racine identifiee, 5 actions correctives
                  </span>
                </div>
              </div>

              {/* Restart */}
              <div className="flex justify-center py-4">
                <button
                  onClick={() => {
                    handleRestart();
                    onComplete?.();
                  }}
                  className="flex items-center gap-2 bg-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Relancer l'analyse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
