"use client";

/**
 * StrategieDemo.tsx — Simulation interactive Mode Strategie
 * SWOT + 3 Scenarios + Roadmap 3 phases + Risk Matrix + Synthese
 * CEO + CSO + CFO lead — Temperature 0.6
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  Target,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Shield,
  TrendingUp,
  AlertTriangle,
  Star,
  Clock,
  Scale,
  Swords,
  FileText,
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
import { STRATEGIE_DATA } from "./strategie-data";
import type { CREDOPhase, Source } from "../shared/simulation-types";

// ========== SWOT CARD ==========

function SwotCard({
  swot,
  animate,
  onComplete,
}: {
  swot: typeof STRATEGIE_DATA.swot;
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleQuadrants, setVisibleQuadrants] = useState(animate ? 0 : 4);

  useEffect(() => {
    if (!animate) return;
    setVisibleQuadrants(0);
    const timers = [
      setTimeout(() => setVisibleQuadrants(1), 400),
      setTimeout(() => setVisibleQuadrants(2), 1000),
      setTimeout(() => setVisibleQuadrants(3), 1600),
      setTimeout(() => setVisibleQuadrants(4), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const quadrants = [
    {
      titre: "Forces",
      items: swot.forces,
      bg: "bg-green-50",
      border: "border-green-300",
      headerBg: "bg-green-100",
      headerText: "text-green-800",
      icon: Shield,
      iconColor: "text-green-600",
    },
    {
      titre: "Faiblesses",
      items: swot.faiblesses,
      bg: "bg-red-50",
      border: "border-red-300",
      headerBg: "bg-red-100",
      headerText: "text-red-800",
      icon: AlertTriangle,
      iconColor: "text-red-600",
    },
    {
      titre: "Opportunites",
      items: swot.opportunites,
      bg: "bg-blue-50",
      border: "border-blue-300",
      headerBg: "bg-blue-100",
      headerText: "text-blue-800",
      icon: TrendingUp,
      iconColor: "text-blue-600",
    },
    {
      titre: "Menaces",
      items: swot.menaces,
      bg: "bg-orange-50",
      border: "border-orange-300",
      headerBg: "bg-orange-100",
      headerText: "text-orange-800",
      icon: AlertTriangle,
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="ml-11">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-2.5 flex items-center gap-2 border-b border-purple-200">
          <Target className="h-4 w-4 text-purple-700" />
          <span className="text-sm font-bold text-purple-900">
            Analyse SWOT
          </span>
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full ml-auto font-medium">
            Strategie
          </span>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2">
          {quadrants.map((q, i) => {
            const Icon = q.icon;
            const isVisible = i < visibleQuadrants;
            return (
              <div
                key={q.titre}
                className={cn(
                  "transition-all duration-600",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4",
                  q.bg,
                  i === 0 && "border-r border-b",
                  i === 1 && "border-b",
                  i === 2 && "border-r",
                  q.border
                )}
              >
                {/* Quadrant header */}
                <div
                  className={cn(
                    "px-3 py-2 flex items-center gap-1.5",
                    q.headerBg
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", q.iconColor)} />
                  <span
                    className={cn("text-xs font-bold uppercase", q.headerText)}
                  >
                    {q.titre}
                  </span>
                </div>

                {/* Quadrant items */}
                <div className="p-3 space-y-2.5">
                  {q.items.map((item, j) => (
                    <div key={j}>
                      <div className="text-xs font-semibold text-gray-800 mb-0.5">
                        {item.titre}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {item.detail}
                      </p>
                      {item.sources && (
                        <SourcesList sources={item.sources} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue */}
      {visibleQuadrants >= 4 && onComplete && (
        <div className="flex justify-center mt-3 animate-in fade-in duration-500">
          <button
            onClick={onComplete}
            className="text-xs bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 flex items-center gap-1.5 font-medium transition-all"
          >
            <ArrowRight className="h-3.5 w-3.5" /> Voir les 3 scenarios
          </button>
        </div>
      )}
    </div>
  );
}

// ========== SCENARIOS COMPARISON ==========

function ScenariosCard({
  scenarios,
  animate,
  onComplete,
}: {
  scenarios: typeof STRATEGIE_DATA.scenarios;
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleCols, setVisibleCols] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    setVisibleCols(0);
    const timers = [
      setTimeout(() => setVisibleCols(1), 500),
      setTimeout(() => setVisibleCols(2), 1200),
      setTimeout(() => setVisibleCols(3), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const colBorders = [
    "border-green-300",
    "border-amber-300",
    "border-red-300",
  ];
  const colHeaderBgs = [
    "bg-gradient-to-b from-green-50 to-white",
    "bg-gradient-to-b from-amber-50 to-white",
    "bg-gradient-to-b from-red-50 to-white",
  ];

  return (
    <div className="ml-11">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-2.5 flex items-center gap-2 border-b border-purple-200">
          <Target className="h-4 w-4 text-purple-700" />
          <span className="text-sm font-bold text-purple-900">
            Comparaison des 3 scenarios
          </span>
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full ml-auto font-medium">
            Strategie
          </span>
        </div>

        {/* 3 columns */}
        <div className="grid grid-cols-3 divide-x">
          {scenarios.map((sc, i) => (
            <div
              key={sc.id}
              className={cn(
                "transition-all duration-600",
                i < visibleCols
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
                colHeaderBgs[i]
              )}
            >
              {/* Scenario header */}
              <div className="px-3 py-3 border-b relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-800">
                    {sc.titre}
                  </span>
                  {sc.recommande && (
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-white" />
                      Recommande
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              {/* Key metrics */}
              <div className="px-3 py-2 border-b bg-gray-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Timeline
                  </span>
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    {sc.timeline}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Investissement
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {sc.investissement}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Ratio cible
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {sc.ratio}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Risque
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      sc.risqueColor
                    )}
                  >
                    {sc.risque}
                  </span>
                </div>
              </div>

              {/* Key actions */}
              <div className="px-3 py-2.5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">
                  Actions cles
                </div>
                <ul className="space-y-1">
                  {sc.actions.map((action, j) => (
                    <li
                      key={j}
                      className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5"
                    >
                      <span className="text-purple-400 mt-0.5 shrink-0">
                        -
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pros/Cons */}
              <div className="px-3 py-2 border-t">
                <div className="mb-1.5">
                  <span className="text-[10px] font-semibold text-green-600">
                    +
                  </span>{" "}
                  <span className="text-[10px] text-gray-600">
                    {sc.avantages}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-red-600">
                    -
                  </span>{" "}
                  <span className="text-[10px] text-gray-600">
                    {sc.inconvenients}
                  </span>
                </div>
                {sc.sources && <SourcesList sources={sc.sources} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue */}
      {visibleCols >= 3 && onComplete && (
        <div className="flex justify-center mt-3 animate-in fade-in duration-500">
          <button
            onClick={onComplete}
            className="text-xs bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 flex items-center gap-1.5 font-medium transition-all"
          >
            <ArrowRight className="h-3.5 w-3.5" /> Voir la roadmap
          </button>
        </div>
      )}
    </div>
  );
}

// ========== ROADMAP TIMELINE ==========

function RoadmapCard({
  roadmap,
  animate,
  onComplete,
}: {
  roadmap: typeof STRATEGIE_DATA.roadmap;
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visiblePhases, setVisiblePhases] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    setVisiblePhases(0);
    const timers = [
      setTimeout(() => setVisiblePhases(1), 500),
      setTimeout(() => setVisiblePhases(2), 1200),
      setTimeout(() => setVisiblePhases(3), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="ml-11">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-2.5 flex items-center gap-2 border-b border-purple-200">
          <Target className="h-4 w-4 text-purple-700" />
          <span className="text-sm font-bold text-purple-900">
            Roadmap — 3 phases
          </span>
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full ml-auto font-medium">
            Scenario Equilibre
          </span>
        </div>

        {/* Timeline */}
        <div className="p-4">
          {/* Horizontal connector line */}
          <div className="relative">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-purple-200 z-0" />
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {roadmap.map((phase, i) => {
                const PhaseIcon = phase.icon;
                const isVisible = i < visiblePhases;
                return (
                  <div
                    key={phase.id}
                    className={cn(
                      "transition-all duration-600",
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    )}
                  >
                    {/* Phase dot on timeline */}
                    <div className="flex justify-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-md ring-4 ring-white">
                        <PhaseIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    {/* Card */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-center mb-2">
                        <div className="text-xs font-bold text-purple-800">
                          {phase.phase}
                        </div>
                        <div className="text-[10px] text-purple-600 font-medium">
                          {phase.periode}
                        </div>
                        <div className="text-xs font-semibold text-gray-800 mt-0.5">
                          {phase.titre}
                        </div>
                      </div>

                      {/* Livrables */}
                      <div className="space-y-1 mb-2.5">
                        {phase.livrables.map((l, j) => (
                          <div
                            key={j}
                            className="flex items-start gap-1.5 text-[10px] text-gray-600 leading-relaxed"
                          >
                            <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                            {l}
                          </div>
                        ))}
                      </div>

                      {/* Owners */}
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-[9px] text-gray-400 font-medium mr-1">
                          Responsables :
                        </span>
                        {phase.owners.map((code) => (
                          <BotAvatar key={code} code={code} size="sm" />
                        ))}
                      </div>

                      {/* Success metrics */}
                      <div className="bg-white border border-purple-100 rounded px-2 py-1.5">
                        <div className="text-[9px] font-semibold text-purple-600 uppercase mb-0.5">
                          Metriques de succes
                        </div>
                        <p className="text-[10px] text-gray-600 leading-relaxed">
                          {phase.metriques}
                        </p>
                      </div>

                      {phase.sources && (
                        <SourcesList sources={phase.sources} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Continue */}
      {visiblePhases >= 3 && onComplete && (
        <div className="flex justify-center mt-3 animate-in fade-in duration-500">
          <button
            onClick={onComplete}
            className="text-xs bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 flex items-center gap-1.5 font-medium transition-all"
          >
            <ArrowRight className="h-3.5 w-3.5" /> Voir la matrice de risques
          </button>
        </div>
      )}
    </div>
  );
}

// ========== RISK MATRIX ==========

function RiskMatrixCard({
  risks,
  animate,
  onComplete,
}: {
  risks: typeof STRATEGIE_DATA.riskMatrix;
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [animate]);

  // Organize risks into quadrants
  const critique = risks.filter((r) => r.quadrant === "critique");
  const surveiller = risks.filter((r) => r.quadrant === "surveiller");
  const gerer = risks.filter((r) => r.quadrant === "gerer");
  const accepter = risks.filter((r) => r.quadrant === "accepter");

  const quadrantConfig = [
    {
      label: "SURVEILLER",
      risks: surveiller,
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      headerBg: "bg-amber-100",
      position: "Impact haut / Probabilite basse",
    },
    {
      label: "CRITIQUE",
      risks: critique,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      headerBg: "bg-red-100",
      position: "Impact haut / Probabilite haute",
    },
    {
      label: "ACCEPTER",
      risks: accepter,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      headerBg: "bg-green-100",
      position: "Impact bas / Probabilite basse",
    },
    {
      label: "GERER",
      risks: gerer,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      headerBg: "bg-blue-100",
      position: "Impact bas / Probabilite haute",
    },
  ];

  return (
    <div className="ml-11">
      <div
        className={cn(
          "bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-2.5 flex items-center gap-2 border-b border-purple-200">
          <AlertTriangle className="h-4 w-4 text-purple-700" />
          <span className="text-sm font-bold text-purple-900">
            Matrice de risques
          </span>
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full ml-auto font-medium">
            Probabilite x Impact
          </span>
        </div>

        {/* Axis labels + Grid */}
        <div className="p-4">
          <div className="flex">
            {/* Y-axis label */}
            <div className="flex flex-col items-center justify-center mr-2 w-6">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
                Impact
              </span>
            </div>

            <div className="flex-1">
              {/* Y-axis markers */}
              <div className="flex items-center mb-1">
                <span className="text-[9px] text-gray-400 w-10 text-right mr-2">
                  Haut
                </span>
                <div className="flex-1" />
              </div>

              {/* 2x2 grid */}
              <div className="grid grid-cols-2 gap-2">
                {quadrantConfig.map((q) => (
                  <div
                    key={q.label}
                    className={cn(
                      "rounded-lg border p-3 min-h-[120px]",
                      q.bg,
                      q.border
                    )}
                  >
                    <div
                      className={cn(
                        "text-[10px] font-bold uppercase mb-2 px-1.5 py-0.5 rounded inline-block",
                        q.headerBg,
                        q.text
                      )}
                    >
                      {q.label}
                    </div>
                    {q.risks.map((risk) => {
                      const RiskIcon = risk.icon;
                      return (
                        <div
                          key={risk.id}
                          className="bg-white rounded-md border border-white/80 p-2 mb-1.5 shadow-sm"
                        >
                          <div className="flex items-start gap-1.5">
                            <RiskIcon
                              className={cn(
                                "h-3 w-3 shrink-0 mt-0.5",
                                q.text
                              )}
                            />
                            <div>
                              <div className="text-[10px] font-semibold text-gray-800 leading-tight">
                                {risk.titre}
                              </div>
                              <p className="text-[9px] text-gray-500 leading-relaxed mt-0.5">
                                {risk.mitigation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {q.risks.length === 0 && (
                      <div className="text-[10px] text-gray-400 italic">
                        Aucun risque identifie
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Y-axis markers (bottom) */}
              <div className="flex items-center mt-1">
                <span className="text-[9px] text-gray-400 w-10 text-right mr-2">
                  Bas
                </span>
                <div className="flex-1 flex justify-between px-4">
                  <span className="text-[9px] text-gray-400">Basse</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                    Probabilite
                  </span>
                  <span className="text-[9px] text-gray-400">Haute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue */}
      {visible && onComplete && (
        <div className="flex justify-center mt-3 animate-in fade-in duration-500">
          <button
            onClick={onComplete}
            className="text-xs bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 flex items-center gap-1.5 font-medium transition-all"
          >
            <ArrowRight className="h-3.5 w-3.5" /> Synthese et recommandation
          </button>
        </div>
      )}
    </div>
  );
}

// ========== SYNTHESE CARD ==========

function SyntheseCard({
  synthese,
  animate,
}: {
  synthese: typeof STRATEGIE_DATA.synthese;
  animate: boolean;
}) {
  const [visibleSteps, setVisibleSteps] = useState(
    animate ? 0 : synthese.prochaines_etapes.length
  );
  const [conclusionVisible, setConclusionVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timers = synthese.prochaines_etapes.map((_, i) =>
      setTimeout(() => setVisibleSteps(i + 1), (i + 1) * 800)
    );
    const conclusionTimer = setTimeout(
      () => setConclusionVisible(true),
      (synthese.prochaines_etapes.length + 1) * 800
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(conclusionTimer);
    };
  }, [animate, synthese.prochaines_etapes.length]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-purple-50 to-white border-2 border-purple-300 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-3 flex items-center gap-2 border-b border-purple-300">
          <Target className="h-5 w-5 text-purple-700" />
          <div className="flex-1">
            <div className="text-sm font-bold text-purple-900">
              Recommandation strategique
            </div>
            <div className="text-xs text-purple-700">
              Synthese SWOT + Scenarios + Risques
            </div>
          </div>
          <BotAvatar code="BCO" size="sm" />
        </div>

        <div className="p-4 space-y-4">
          {/* Recommendation */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
            {animate ? (
              <TypewriterText
                text={synthese.recommandation}
                speed={10}
                className="text-sm text-purple-900 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-purple-900 leading-relaxed">
                {synthese.recommandation}
              </p>
            )}
          </div>

          {/* Next steps */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
              Prochaines etapes
            </div>
            <div className="space-y-2">
              {synthese.prochaines_etapes.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 transition-all duration-500",
                    i < visibleSteps
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-800">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          {conclusionVisible && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg px-4 py-3 animate-in fade-in duration-700">
              <div className="flex items-start gap-2">
                <BotAvatar code="BCO" size="sm" className="mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-purple-700 mb-1">
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
 * 0    — Start button (purple Target icon)
 * 1    — User sends tension
 * 1.5  — CEO thinking animation
 * 2    — CEO intro (typewriter)
 * 3    — SWOT Card (2x2 grid animated)
 * 4    — 3 Scenarios comparison (3 columns)
 * 5    — Roadmap timeline (3 phases horizontal)
 * 6    — Risk Matrix (2x2 probability x impact)
 * 7    — Synthese card (recommendation + next steps)
 * 8    — Done + restart
 */
export function StrategieDemo({
  onComplete,
  onTransition,
}: { onComplete?: () => void; onTransition?: (target: string) => void } = {}) {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<CREDOPhase>("C");
  const [ceoIntroDone, setCeoIntroDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on stage change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 150);
  }, [stage]);

  const handleRestart = () => {
    setStage(0);
    setPhase("C");
    setCeoIntroDone(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              Mode Strategie — CEO + CSO + CFO
            </div>
            <div className="text-xs text-muted-foreground">
              Sous-traitant a produit propre : SWOT + 3 scenarios + Roadmap
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
            Temperature 0.6
          </span>
          <PhaseIndicator phase={phase} />
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
          {/* ===== STAGE 0 — Start button ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-16">
              <button
                onClick={() => setStage(1)}
                className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-purple-700 transition-all hover:scale-105"
              >
                <Target className="h-5 w-5" /> Lancer l'Analyse Strategique
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User tension ===== */}
          {stage >= 1 && (
            <UserBubble text={STRATEGIE_DATA.userTension} time="10:32" />
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-purple-100 text-purple-700 px-4 py-2 rounded-full hover:bg-purple-200 flex items-center gap-1 transition-colors"
              >
                <Target className="h-3 w-3" /> CarlOS prepare l'analyse
                strategique...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={STRATEGIE_DATA.ceoThinking}
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
              text={STRATEGIE_DATA.ceoIntro}
              phaseLabel="Mode Strategie"
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
                className="text-xs bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 flex items-center gap-1.5 font-medium"
              >
                <Target className="h-3.5 w-3.5" /> Diagnostic SWOT
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — SWOT Card ===== */}
          {stage >= 3 && (
            <SwotCard
              swot={STRATEGIE_DATA.swot}
              animate={stage === 3}
              onComplete={stage === 3 ? () => setStage(4) : undefined}
            />
          )}

          {/* ===== STAGE 4 — 3 Scenarios ===== */}
          {stage >= 4 && (
            <ScenariosCard
              scenarios={STRATEGIE_DATA.scenarios}
              animate={stage === 4}
              onComplete={stage === 4 ? () => setStage(5) : undefined}
            />
          )}

          {/* ===== STAGE 5 — Roadmap Timeline ===== */}
          {stage >= 5 && (
            <RoadmapCard
              roadmap={STRATEGIE_DATA.roadmap}
              animate={stage === 5}
              onComplete={stage === 5 ? () => setStage(6) : undefined}
            />
          )}

          {/* ===== STAGE 6 — Risk Matrix ===== */}
          {stage >= 6 && (
            <RiskMatrixCard
              risks={STRATEGIE_DATA.riskMatrix}
              animate={stage === 6}
              onComplete={
                stage === 6
                  ? () => {
                      setPhase("D");
                      setStage(6.5);
                    }
                  : undefined
              }
            />
          )}

          {/* ===== STAGE 6.5 — Synthese thinking ===== */}
          {stage === 6.5 && (
            <ThinkingAnimation
              steps={STRATEGIE_DATA.syntheseThinking}
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
              synthese={STRATEGIE_DATA.synthese}
              animate={stage === 7}
            />
          )}

          {/* ===== STAGE 8 — Done + restart ===== */}
          {stage >= 7 && stage !== 6.5 && (
            <div className="space-y-3 animate-in fade-in duration-700">
              {/* Completion summary */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Analyse strategique complete — SWOT + 3 scenarios + Roadmap
                    + Risques
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex justify-center">
                <div className="flex items-center gap-6 bg-purple-50 border border-purple-200 rounded-xl px-6 py-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-700">4</div>
                    <div className="text-[10px] text-gray-500">
                      Quadrants SWOT
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-700">3</div>
                    <div className="text-[10px] text-gray-500">Scenarios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">3</div>
                    <div className="text-[10px] text-gray-500">
                      Phases roadmap
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-700">4</div>
                    <div className="text-[10px] text-gray-500">Risques</div>
                  </div>
                </div>
              </div>

              {/* Transition buttons */}
              <div className="flex items-center gap-2 justify-center flex-wrap mt-2">
                <button onClick={() => onTransition?.("decision")} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-100 font-medium cursor-pointer">
                  <Scale className="h-3.5 w-3.5" /> Decision
                </button>
                <button onClick={() => onTransition?.("debat")} className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-100 font-medium cursor-pointer">
                  <Swords className="h-3.5 w-3.5" /> Debat
                </button>
                <button onClick={() => onTransition?.("cahier")} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-100 font-medium cursor-pointer">
                  <FileText className="h-3.5 w-3.5" /> Cahier SMART
                </button>
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
                  strategique
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
