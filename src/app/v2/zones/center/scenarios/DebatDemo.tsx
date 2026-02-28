"use client";

/**
 * DebatDemo.tsx — Simulation interactive Mode Debat
 * Debat structure CFO vs CRO : "ERP integre a 200K$ ou continuer avec nos outils separes?"
 * Split-screen 3 rounds + verdict CEO
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  Swords,
  Scale,
  ArrowRight,
  RotateCcw,
  Send,
  CheckCircle2,
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
import { DEBAT_DATA } from "./debat-data";
import type { CREDOPhase, Source } from "../shared/simulation-types";

// ========== TYPES ==========

interface RoundData {
  theme: string;
  icon: React.ElementType;
  pour: {
    code: string;
    position: string;
    argument: string;
    sources: Source[];
  };
  contre: {
    code: string;
    position: string;
    argument: string;
    sources: Source[];
  };
}

// ========== ROUND CARD ==========

function RoundCard({
  round,
  roundNum,
  data,
  animate,
  onContinue,
  showContinue,
}: {
  round: number;
  roundNum: string;
  data: RoundData;
  animate: boolean;
  onContinue?: () => void;
  showContinue?: boolean;
}) {
  const [leftVisible, setLeftVisible] = useState(!animate);
  const [rightVisible, setRightVisible] = useState(!animate);
  const [leftDone, setLeftDone] = useState(!animate);
  const [rightDone, setRightDone] = useState(!animate);

  const ThemeIcon = data.icon;
  const pourBot = BOT_COLORS[data.pour.code];
  const contreBot = BOT_COLORS[data.contre.code];

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setLeftVisible(true), 400);
    const t2 = setTimeout(() => setRightVisible(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [animate]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b">
          <Swords className="h-4 w-4 text-red-600" />
          <span className="text-sm font-bold text-gray-700">
            Round {roundNum}
          </span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
            <ThemeIcon className="h-3 w-3" />
            {data.theme}
          </span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-auto font-medium">
            Debat
          </span>
        </div>

        {/* Split-screen columns */}
        <div className="grid grid-cols-2 divide-x">
          {/* === POUR (left, green tint) === */}
          <div
            className={cn(
              "transition-all duration-700",
              leftVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <div className="h-1 bg-green-500" />
            <div className="p-4">
              {/* Bot identity */}
              <div className="flex items-center gap-2 mb-3">
                <BotAvatar code={data.pour.code} size="md" />
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-bold",
                      pourBot?.text || "text-gray-800"
                    )}
                  >
                    {pourBot?.name || data.pour.code}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      ({pourBot?.role})
                    </span>
                  </div>
                </div>
              </div>

              {/* Position badge */}
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full mb-2">
                <CheckCircle2 className="h-3 w-3" />
                {data.pour.position}
              </span>

              {/* Argument */}
              <div className="mt-2">
                {animate && leftVisible && !leftDone ? (
                  <TypewriterText
                    text={data.pour.argument}
                    speed={8}
                    className="text-sm text-gray-700 leading-relaxed"
                    onComplete={() => setLeftDone(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.pour.argument}
                  </p>
                )}
              </div>

              {/* Sources */}
              {leftVisible && <SourcesList sources={data.pour.sources} />}
            </div>
          </div>

          {/* === CONTRE (right, red tint) === */}
          <div
            className={cn(
              "transition-all duration-700",
              rightVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <div className="h-1 bg-red-500" />
            <div className="p-4">
              {/* Bot identity */}
              <div className="flex items-center gap-2 mb-3">
                <BotAvatar code={data.contre.code} size="md" />
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-bold",
                      contreBot?.text || "text-gray-800"
                    )}
                  >
                    {contreBot?.name || data.contre.code}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      ({contreBot?.role})
                    </span>
                  </div>
                </div>
              </div>

              {/* Position badge */}
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full mb-2">
                <Swords className="h-3 w-3" />
                {data.contre.position}
              </span>

              {/* Argument */}
              <div className="mt-2">
                {animate && rightVisible && !rightDone ? (
                  <TypewriterText
                    text={data.contre.argument}
                    speed={8}
                    className="text-sm text-gray-700 leading-relaxed"
                    onComplete={() => setRightDone(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.contre.argument}
                  </p>
                )}
              </div>

              {/* Sources */}
              {rightVisible && <SourcesList sources={data.contre.sources} />}
            </div>
          </div>
        </div>

        {/* Continue button */}
        {showContinue && leftDone && rightDone && (
          <div className="bg-gray-50 px-4 py-2.5 border-t flex items-center justify-center animate-in fade-in duration-500">
            <button
              onClick={onContinue}
              className="text-xs bg-gray-800 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-900 font-medium transition-all"
            >
              <ArrowRight className="h-3.5 w-3.5" /> Continuer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== VERDICT CARD ==========

function VerdictCard({
  verdict,
  animate,
}: {
  verdict: typeof DEBAT_DATA.verdict;
  animate: boolean;
}) {
  const [visibleSteps, setVisibleSteps] = useState(
    animate ? 0 : verdict.plan.length
  );
  const [conclusionVisible, setConclusionVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timers = verdict.plan.map((_, i) =>
      setTimeout(() => setVisibleSteps(i + 1), (i + 1) * 800)
    );
    const conclusionTimer = setTimeout(
      () => setConclusionVisible(true),
      (verdict.plan.length + 1) * 800
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(conclusionTimer);
    };
  }, [animate, verdict.plan.length]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-3 flex items-center gap-2 border-b border-amber-300">
          <Scale className="h-5 w-5 text-amber-700" />
          <div className="flex-1">
            <div className="text-sm font-bold text-amber-900">
              Verdict du CEO
            </div>
            <div className="text-xs text-amber-700">
              Analyse des 3 rounds de debat
            </div>
          </div>
          <BotAvatar code="BCO" size="sm" />
        </div>

        <div className="p-4 space-y-4">
          {/* Winner */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Scale className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-700 uppercase mb-1">
                Gagnant
              </div>
              <div className="text-sm font-bold text-gray-800">
                {verdict.winner}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {animate ? (
              <TypewriterText
                text={verdict.recommendation}
                speed={12}
                className="text-sm text-amber-900 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-amber-900 leading-relaxed">
                {verdict.recommendation}
              </p>
            )}
          </div>

          {/* 3-phase plan */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
              Plan d'action en 3 phases
            </div>
            <div className="space-y-2">
              {verdict.plan.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 transition-all duration-500",
                    i < visibleSteps
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-800">
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 animate-in fade-in duration-700">
              <div className="flex items-start gap-2">
                <BotAvatar code="BCO" size="sm" className="mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-blue-700 mb-1">
                    Conclusion CarlOS
                  </div>
                  {animate ? (
                    <TypewriterText
                      text={verdict.conclusion}
                      speed={10}
                      className="text-sm text-gray-800 leading-relaxed font-medium"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {verdict.conclusion}
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
 * 2    — CEO intro (typewriter) — sets up the debate
 * 3    — ROUND 1 — split-screen (pour vs contre)
 * 4    — ROUND 2 — split-screen
 * 5    — ROUND 3 — split-screen
 * 6    — CEO verdict thinking animation
 * 7    — Verdict card (winner, recommendation, 3-phase plan, conclusion)
 */
export function DebatDemo({
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
          <Swords className="h-4 w-4 text-red-600" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              Mode Debat — CFO vs CRO
            </div>
            <div className="text-xs text-muted-foreground">
              ERP a 200K$ : investir ou optimiser?
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
                className="flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-red-700 transition-all hover:scale-105"
              >
                <Swords className="h-5 w-5" /> Lancer le Debat
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User tension ===== */}
          {stage >= 1 && (
            <UserBubble text={DEBAT_DATA.userTension} time="09:15" />
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1"
              >
                <Swords className="h-3 w-3" /> CarlOS analyse la tension...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={DEBAT_DATA.ceoThinking}
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
              text={DEBAT_DATA.ceoIntro}
              phaseLabel="Mode Debat"
              time="09:16"
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
                className="text-xs bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 flex items-center gap-1.5 font-medium"
              >
                <Swords className="h-3.5 w-3.5" /> Round 1 : {DEBAT_DATA.round1.theme}
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — ROUND 1 ===== */}
          {stage >= 3 && (
            <RoundCard
              round={1}
              roundNum="1"
              data={DEBAT_DATA.round1}
              animate={stage === 3}
              showContinue={stage === 3}
              onContinue={() => setStage(4)}
            />
          )}

          {/* ===== STAGE 4 — ROUND 2 ===== */}
          {stage >= 4 && (
            <RoundCard
              round={2}
              roundNum="2"
              data={DEBAT_DATA.round2}
              animate={stage === 4}
              showContinue={stage === 4}
              onContinue={() => setStage(5)}
            />
          )}

          {/* ===== STAGE 5 — ROUND 3 ===== */}
          {stage >= 5 && (
            <RoundCard
              round={3}
              roundNum="3"
              data={DEBAT_DATA.round3}
              animate={stage === 5}
              showContinue={stage === 5}
              onContinue={() => {
                setPhase("D");
                setStage(6);
              }}
            />
          )}

          {/* ===== STAGE 6 — CEO verdict thinking ===== */}
          {stage === 6 && (
            <ThinkingAnimation
              steps={DEBAT_DATA.verdictThinking}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => {
                setPhase("O");
                setStage(7);
              }}
            />
          )}

          {/* ===== STAGE 7 — Verdict card ===== */}
          {stage >= 7 && (
            <VerdictCard
              verdict={DEBAT_DATA.verdict}
              animate={stage === 7}
            />
          )}

          {/* ===== STAGE 7 — End actions ===== */}
          {stage >= 7 && (
            <div className="space-y-3 animate-in fade-in duration-700">
              {/* Completion summary */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Debat termine — 3 rounds, verdict rendu
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
                  <RotateCcw className="h-4 w-4" /> Relancer le debat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
