"use client";

/**
 * InnovationDemo.tsx — Simulation interactive Mode Innovation
 * 3 techniques de pensee laterale : Analogie, Inversion, Biomimetisme
 * Sujet : "Reinventer le SAV en centre de profit"
 * CTO + CMO + COO lead, Temperature 0.95
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Shuffle,
  Leaf,
  Star,
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
import { INNOVATION_DATA } from "./innovation-data";
import type { CREDOPhase, Source } from "../shared/simulation-types";

// ========== TYPES ==========

interface TechniqueData {
  nom: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  icon: React.ElementType;
  intro: string;
  botCode: string;
  botProposal: string;
  sources: Source[];
}

interface FaisabiliteIdee {
  nom: string;
  technique: string;
  color: string;
  scores: number[];
  botCode: string;
}

// ========== TECHNIQUE ICONS ==========

const TECHNIQUE_ICONS: Record<string, React.ElementType> = {
  ANALOGIE: Lightbulb,
  INVERSION: Shuffle,
  BIOMIMETISME: Leaf,
};

// ========== TECHNIQUE CARD ==========

function TechniqueCard({
  data,
  techniqueNum,
  animate,
  onContinue,
  showContinue,
}: {
  data: TechniqueData;
  techniqueNum: number;
  animate: boolean;
  onContinue?: () => void;
  showContinue?: boolean;
}) {
  const [introVisible, setIntroVisible] = useState(!animate);
  const [introDone, setIntroDone] = useState(!animate);
  const [proposalVisible, setProposalVisible] = useState(!animate);
  const [proposalDone, setProposalDone] = useState(!animate);

  const TechIcon = data.icon;
  const proposalBot = BOT_COLORS[data.botCode];

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setIntroVisible(true), 400);
    return () => clearTimeout(t1);
  }, [animate]);

  useEffect(() => {
    if (introDone && animate) {
      const t = setTimeout(() => setProposalVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [introDone, animate]);

  const allDone = introDone && proposalDone;

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", data.accentColor)}>
          <TechIcon className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">
            Technique {techniqueNum}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium bg-white/90", data.badgeColor)}>
            {data.badge}
          </span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full ml-auto font-medium">
            Innovation
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* CEO intro — the lateral thinking example */}
          <div
            className={cn(
              "transition-all duration-700",
              introVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-start gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-blue-700">CarlOS (CEO)</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", data.badgeColor)}>
                    {data.nom}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  {animate && introVisible && !introDone ? (
                    <TypewriterText
                      text={data.intro}
                      speed={10}
                      className="text-sm text-gray-700 leading-relaxed"
                      onComplete={() => setIntroDone(true)}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {data.intro}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bot proposal */}
          {proposalVisible && (
            <div
              className={cn(
                "transition-all duration-700",
                proposalVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              <div className="flex items-start gap-3">
                <BotAvatar code={data.botCode} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("text-xs font-semibold", proposalBot?.text || "text-gray-800")}>
                      {proposalBot?.name || data.botCode}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        ({proposalBot?.role})
                      </span>
                    </span>
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-medium">
                      Proposition
                    </span>
                  </div>
                  <div className={cn("border rounded-lg px-3 py-2.5 border-l-[3px]", proposalBot?.border || "border-gray-300", proposalBot?.bgLight || "bg-white")}>
                    {animate && proposalVisible && !proposalDone ? (
                      <TypewriterText
                        text={data.botProposal}
                        speed={8}
                        className="text-sm text-gray-700 leading-relaxed"
                        onComplete={() => setProposalDone(true)}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {data.botProposal}
                      </p>
                    )}
                  </div>
                  {proposalDone && <SourcesList sources={data.sources} />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue button */}
        {showContinue && allDone && (
          <div className="bg-gray-50 px-4 py-2.5 border-t flex items-center justify-center animate-in fade-in duration-500">
            <button
              onClick={onContinue}
              className="text-xs bg-fuchsia-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-fuchsia-700 font-medium transition-all"
            >
              <ArrowRight className="h-3.5 w-3.5" /> Technique suivante
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== SCORE BAR ==========

function ScoreBar({ score, color, animate }: { score: number; color: string; animate: boolean }) {
  const [width, setWidth] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(score), 300);
    return () => clearTimeout(timer);
  }, [animate, score]);

  const colorClasses: Record<string, string> = {
    fuchsia: "bg-fuchsia-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClasses[color] || "bg-gray-400")}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 w-8 text-right">{score}</span>
    </div>
  );
}

// ========== FEASIBILITY SPECTRUM ==========

function FeasibilitySpectrum({
  axes,
  idees,
  animate,
  onContinue,
  showContinue,
}: {
  axes: string[];
  idees: FaisabiliteIdee[];
  animate: boolean;
  onContinue?: () => void;
  showContinue?: boolean;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [animate]);

  const colorBorders: Record<string, string> = {
    fuchsia: "border-fuchsia-300",
    orange: "border-orange-300",
    green: "border-green-300",
  };

  const colorBgs: Record<string, string> = {
    fuchsia: "from-fuchsia-50 to-pink-50",
    orange: "from-orange-50 to-amber-50",
    green: "from-green-50 to-emerald-50",
  };

  const colorTexts: Record<string, string> = {
    fuchsia: "text-fuchsia-800",
    orange: "text-orange-800",
    green: "text-green-800",
  };

  const colorBadges: Record<string, string> = {
    fuchsia: "bg-fuchsia-100 text-fuchsia-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 px-4 py-2.5 flex items-center gap-2 border-b border-fuchsia-200">
          <Star className="h-4 w-4 text-fuchsia-700" />
          <div className="flex-1">
            <div className="text-sm font-bold text-fuchsia-900">
              Spectre de faisabilite
            </div>
            <div className="text-xs text-fuchsia-700">
              3 idees comparees sur 3 axes
            </div>
          </div>
          <BotAvatar code="BCO" size="sm" />
        </div>

        {/* 3-column comparison */}
        <div
          className={cn(
            "grid grid-cols-3 gap-3 p-4 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {idees.map((idee, i) => {
            const total = idee.scores.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / idee.scores.length);
            return (
              <div
                key={i}
                className={cn(
                  "border rounded-lg overflow-hidden transition-all duration-500",
                  colorBorders[idee.color] || "border-gray-200",
                )}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Column header */}
                <div className={cn("bg-gradient-to-r px-3 py-2 border-b", colorBgs[idee.color] || "from-gray-50 to-gray-50", colorBorders[idee.color] || "border-gray-200")}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <BotAvatar code={idee.botCode} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-xs font-bold truncate", colorTexts[idee.color] || "text-gray-800")}>
                        {idee.nom}
                      </div>
                    </div>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colorBadges[idee.color] || "bg-gray-100 text-gray-600")}>
                    {idee.technique}
                  </span>
                </div>

                {/* Scores */}
                <div className="p-3 space-y-2.5">
                  {axes.map((axe, j) => (
                    <div key={j}>
                      <div className="text-[10px] text-gray-500 font-medium mb-0.5">
                        {axe}
                      </div>
                      <ScoreBar
                        score={idee.scores[j]}
                        color={idee.color}
                        animate={visible && animate}
                      />
                    </div>
                  ))}

                  {/* Average */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-medium">Score global</span>
                      <span className={cn("text-sm font-bold", colorTexts[idee.color] || "text-gray-800")}>
                        {avg}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue button */}
        {showContinue && visible && (
          <div className="bg-gray-50 px-4 py-2.5 border-t flex items-center justify-center animate-in fade-in duration-500">
            <button
              onClick={onContinue}
              className="text-xs bg-fuchsia-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-fuchsia-700 font-medium transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> Voir la synthese
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== SYNTHESE CARD ==========

function SyntheseCard({
  synthese,
  animate,
}: {
  synthese: typeof INNOVATION_DATA.synthese;
  animate: boolean;
}) {
  const [visiblePhases, setVisiblePhases] = useState(
    animate ? 0 : synthese.phases.length
  );
  const [conclusionVisible, setConclusionVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timers = synthese.phases.map((_, i) =>
      setTimeout(() => setVisiblePhases(i + 1), (i + 1) * 900)
    );
    const conclusionTimer = setTimeout(
      () => setConclusionVisible(true),
      (synthese.phases.length + 1) * 900
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(conclusionTimer);
    };
  }, [animate, synthese.phases.length]);

  const phaseColors = [
    { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", label: "Biomimetisme" },
    { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-200", label: "Analogie" },
    { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", label: "Inversion" },
  ];

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-fuchsia-50 to-white border-2 border-fuchsia-300 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 px-4 py-3 flex items-center gap-2 border-b border-fuchsia-300">
          <Sparkles className="h-5 w-5 text-fuchsia-700" />
          <div className="flex-1">
            <div className="text-sm font-bold text-fuchsia-900">
              {synthese.titre}
            </div>
            <div className="text-xs text-fuchsia-700">
              Fusion des 3 techniques d'innovation
            </div>
          </div>
          <BotAvatar code="BCO" size="sm" />
        </div>

        <div className="p-4 space-y-4">
          {/* Recommendation */}
          <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg px-3 py-2">
            {animate ? (
              <TypewriterText
                text={synthese.recommendation}
                speed={12}
                className="text-sm text-fuchsia-900 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-fuchsia-900 leading-relaxed">
                {synthese.recommendation}
              </p>
            )}
          </div>

          {/* 3-phase plan */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
              Plan en 3 phases (escalier)
            </div>
            <div className="space-y-2.5">
              {synthese.phases.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 transition-all duration-600",
                    i < visiblePhases
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", phaseColors[i].bg)}>
                    <span className={cn("text-xs font-bold", phaseColors[i].text)}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className={cn("inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium mb-1", phaseColors[i].bg, phaseColors[i].text)}>
                      {phaseColors[i].label}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          {conclusionVisible && (
            <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border border-fuchsia-200 rounded-lg px-4 py-3 animate-in fade-in duration-700">
              <div className="flex items-start gap-2">
                <BotAvatar code="BCO" size="sm" className="mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-fuchsia-700 mb-1">
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
 * 1.5  — CEO thinking animation
 * 2    — CEO intro (typewriter)
 * 3    — Technique 1 — ANALOGIE
 * 4    — Technique 2 — INVERSION
 * 5    — Technique 3 — BIOMIMETISME
 * 6    — Feasibility Spectrum (3 columns, 3 axes)
 * 7    — CEO synthese thinking animation
 * 8    — Synthese card (hybrid model, 3-phase plan, conclusion)
 * 9    — Done + restart
 */
export function InnovationDemo({
  onComplete,
}: { onComplete?: () => void } = {}) {
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
          <Sparkles className="h-4 w-4 text-fuchsia-600" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              Mode Innovation — CTO + CMO + COO
            </div>
            <div className="text-xs text-muted-foreground">
              Reinventer le SAV en centre de profit
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
                className="flex items-center gap-3 bg-fuchsia-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-fuchsia-700 transition-all hover:scale-105"
              >
                <Sparkles className="h-5 w-5" /> Lancer l'Innovation
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User tension ===== */}
          {stage >= 1 && (
            <UserBubble text={INNOVATION_DATA.userTension} time="14:22" />
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-fuchsia-100 text-fuchsia-600 px-4 py-2 rounded-full hover:bg-fuchsia-200 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> CarlOS active le mode Innovation...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={INNOVATION_DATA.ceoThinking}
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
              text={INNOVATION_DATA.ceoIntro}
              phaseLabel="Mode Innovation"
              time="14:23"
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
                className="text-xs bg-fuchsia-600 text-white px-4 py-2 rounded-full hover:bg-fuchsia-700 flex items-center gap-1.5 font-medium"
              >
                <Lightbulb className="h-3.5 w-3.5" /> Technique 1 : Analogie
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — TECHNIQUE 1 : ANALOGIE ===== */}
          {stage >= 3 && (
            <TechniqueCard
              data={INNOVATION_DATA.technique1}
              techniqueNum={1}
              animate={stage === 3}
              showContinue={stage === 3}
              onContinue={() => setStage(4)}
            />
          )}

          {/* ===== STAGE 4 — TECHNIQUE 2 : INVERSION ===== */}
          {stage >= 4 && (
            <TechniqueCard
              data={INNOVATION_DATA.technique2}
              techniqueNum={2}
              animate={stage === 4}
              showContinue={stage === 4}
              onContinue={() => setStage(5)}
            />
          )}

          {/* ===== STAGE 5 — TECHNIQUE 3 : BIOMIMETISME ===== */}
          {stage >= 5 && (
            <TechniqueCard
              data={INNOVATION_DATA.technique3}
              techniqueNum={3}
              animate={stage === 5}
              showContinue={stage === 5}
              onContinue={() => {
                setPhase("D");
                setStage(6);
              }}
            />
          )}

          {/* ===== STAGE 6 — FEASIBILITY SPECTRUM ===== */}
          {stage >= 6 && (
            <FeasibilitySpectrum
              axes={INNOVATION_DATA.faisabilite.axes}
              idees={INNOVATION_DATA.faisabilite.idees}
              animate={stage === 6}
              showContinue={stage === 6}
              onContinue={() => setStage(7)}
            />
          )}

          {/* ===== STAGE 7 — CEO synthese thinking ===== */}
          {stage === 7 && (
            <ThinkingAnimation
              steps={INNOVATION_DATA.syntheseThinking}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => {
                setPhase("O");
                setStage(8);
              }}
            />
          )}

          {/* ===== STAGE 8 — Synthese card ===== */}
          {stage >= 8 && (
            <SyntheseCard
              synthese={INNOVATION_DATA.synthese}
              animate={stage === 8}
            />
          )}

          {/* ===== STAGE 8+ — End actions ===== */}
          {stage >= 8 && (
            <div className="space-y-3 animate-in fade-in duration-700">
              {/* Completion summary */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-fuchsia-50 border border-fuchsia-200 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-600" />
                  <span className="text-xs text-fuchsia-700 font-medium">
                    Innovation terminee — 3 techniques, modele hybride genere
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
                  <RotateCcw className="h-4 w-4" /> Relancer l'innovation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
