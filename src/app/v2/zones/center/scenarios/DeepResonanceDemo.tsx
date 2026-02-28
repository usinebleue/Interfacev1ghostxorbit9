"use client";

/**
 * DeepResonanceDemo.tsx — Simulation interactive Mode Deep Resonance
 * Dialogue socratique 1-on-1 CEO (CarlOS) : spirale 3-6-9
 * "Vendre l'entreprise ou doubler la mise avec un partenaire financier?"
 * Calme, minimal, profond. Pas de multi-bot, pas de split-screen.
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotAvatar,
  UserBubble,
} from "../shared/simulation-components";
import { BOT_COLORS } from "../shared/simulation-data";
import { DEEP_DATA } from "./deep-data";

// ========== SPIRAL INDICATOR ==========

function SpiralIndicator({ active }: { active: number }) {
  const spirales = [
    { num: 1, label: "Surface" },
    { num: 2, label: "Profond" },
    { num: 3, label: "Resonance" },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer ring — spirale 3 */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 transition-all duration-1000",
            active >= 3
              ? "border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              : "border-indigo-200/40"
          )}
        />
        {/* Middle ring — spirale 2 */}
        <div
          className={cn(
            "absolute inset-[6px] rounded-full border-2 transition-all duration-1000",
            active >= 2
              ? "border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
              : "border-indigo-200/30"
          )}
        />
        {/* Inner ring — spirale 1 */}
        <div
          className={cn(
            "absolute inset-[12px] rounded-full border-2 transition-all duration-1000",
            active >= 1
              ? "border-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.5)]"
              : "border-indigo-200/20"
          )}
        />
        {/* Active pulse */}
        {active > 0 && active <= 3 && (
          <div
            className={cn(
              "absolute rounded-full animate-pulse bg-indigo-500/20",
              active === 1 && "inset-[12px]",
              active === 2 && "inset-[6px]",
              active === 3 && "inset-0"
            )}
          />
        )}
        {/* Center dot */}
        <div className="w-2 h-2 rounded-full bg-indigo-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-indigo-400 font-medium">
          Spirale {active > 0 && active <= 3 ? active : "—"}/3
        </span>
        <span className="text-[11px] text-indigo-300">
          {active > 0 && active <= 3
            ? spirales[active - 1].label
            : active > 3
              ? "Cristallise"
              : "En attente"}
        </span>
      </div>
    </div>
  );
}

// ========== REFLECTION CARD ==========

function ReflectionCard({
  titre,
  insight,
  animate,
}: {
  titre: string;
  insight: string;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div
        className="relative bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-violet-50 border border-indigo-200/60 rounded-xl px-5 py-4 overflow-hidden"
        style={{
          boxShadow:
            "0 0 20px rgba(99, 102, 241, 0.08), 0 0 40px rgba(99, 102, 241, 0.04)",
        }}
      >
        {/* Subtle glow line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">
              {titre}
            </div>
            <p className="text-sm text-indigo-900/80 leading-relaxed italic">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MENTAL MODEL CARD ==========

function MentalModelCard({
  nom,
  explication,
  animate,
}: {
  nom: string;
  explication: string;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-1 duration-500">
      <div className="bg-slate-50/80 border border-slate-200/60 rounded-lg px-4 py-3 max-w-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Modele mental
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-800 mb-1">{nom}</div>
        <p className="text-xs text-slate-500 leading-relaxed">{explication}</p>
      </div>
    </div>
  );
}

// ========== CRYSTALLIZATION CARD ==========

function CrystallizationCard({
  titre,
  insight,
  animate,
}: {
  titre: string;
  insight: string;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-3 duration-1000">
      <div
        className="relative bg-gradient-to-br from-amber-50/90 via-amber-50/60 to-indigo-50/40 border border-amber-300/50 rounded-xl px-5 py-5 overflow-hidden"
        style={{
          boxShadow:
            "0 0 24px rgba(245, 158, 11, 0.1), 0 0 48px rgba(99, 102, 241, 0.06)",
        }}
      >
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

        {/* Subtle inner glow */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl" />

        <div className="relative flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="h-4.5 w-4.5 text-amber-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
              {titre}
            </div>
            <p className="text-[15px] text-gray-800 leading-relaxed font-medium">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== DEEP BOT BUBBLE (indigo variant) ==========

function DeepBotBubble({
  text,
  typewrite,
  speed = 16,
  onTypewriteDone,
  label,
  time,
}: {
  text: string;
  typewrite?: boolean;
  speed?: number;
  onTypewriteDone?: () => void;
  label?: string;
  time?: string;
}) {
  const botColor = BOT_COLORS["BCO"];

  return (
    <div className="flex gap-3">
      <BotAvatar code="BCO" size="md" />
      <div className="bg-white/80 backdrop-blur-sm border-l-[3px] border border-indigo-200/60 border-l-indigo-400 rounded-xl rounded-tl-none px-4 py-3 max-w-[80%] shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-indigo-700">
            CarlOS (CEO)
          </span>
          {label && (
            <span className="text-[10px] bg-indigo-100/80 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
              {label}
            </span>
          )}
        </div>
        {typewrite ? (
          <TypewriterText
            text={text}
            speed={speed}
            className="text-sm text-gray-800 leading-relaxed"
            onComplete={onTypewriteDone}
          />
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed">{text}</p>
        )}
        {time && (
          <span className="text-[10px] text-gray-400 mt-1.5 block">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

// ========== MIRROR SYNTHESIS ==========

function MirrorSynthesis({
  intro,
  priorities,
  animate,
}: {
  intro: string;
  priorities: string[];
  animate: boolean;
}) {
  const [introVisible, setIntroVisible] = useState(!animate);
  const [visiblePriorities, setVisiblePriorities] = useState(
    animate ? 0 : priorities.length
  );

  useEffect(() => {
    if (!animate) return;
    const t0 = setTimeout(() => setIntroVisible(true), 300);
    return () => clearTimeout(t0);
  }, [animate]);

  useEffect(() => {
    if (!animate || !introVisible) return;
    const timers = priorities.map((_, i) =>
      setTimeout(() => setVisiblePriorities(i + 1), (i + 1) * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [animate, introVisible, priorities.length]);

  return (
    <div className="flex gap-3">
      <BotAvatar code="BCO" size="md" />
      <div className="bg-white/80 backdrop-blur-sm border-l-[3px] border border-indigo-200/60 border-l-indigo-400 rounded-xl rounded-tl-none px-5 py-4 max-w-[85%] shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-indigo-700">
            CarlOS (CEO)
          </span>
          <span className="text-[10px] bg-indigo-100/80 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
            Synthese miroir
          </span>
        </div>

        {introVisible && (
          <div className="mb-4">
            {animate ? (
              <TypewriterText
                text={intro}
                speed={18}
                className="text-sm text-gray-700 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">{intro}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {priorities.map((priority, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 transition-all duration-700",
                i < visiblePriorities
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="text-xs font-bold text-indigo-700">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{priority}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

/**
 * Stages :
 * 0    — Start button (minimal, indigo)
 * 1    — User tension (emotional, longer text)
 * 1.5  — CEO thinking (slow, reflective)
 * 2    — Spirale 1 : Surface — CEO question + user response + ReflectionCard
 * 3    — Spirale 2 : Profond — thinking + CEO question + user response + MentalModelCard + ReflectionCard
 * 4    — Spirale 3 : Resonance — thinking + CEO question + user response + CrystallizationCard
 * 5    — Mirror Synthesis — priorities list, slow reveal
 * 6    — Closing + restart
 */
export function DeepResonanceDemo({
  onComplete,
}: { onComplete?: () => void } = {}) {
  const [stage, setStage] = useState(0);
  const [activeSpiral, setActiveSpiral] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Typewriter completion flags
  const [s1QuestionDone, setS1QuestionDone] = useState(false);
  const [s1ResponseVisible, setS1ResponseVisible] = useState(false);
  const [s1ReflectionDone, setS1ReflectionDone] = useState(false);
  const [s1ReflectionTextDone, setS1ReflectionTextDone] = useState(false);

  const [s2QuestionDone, setS2QuestionDone] = useState(false);
  const [s2ResponseVisible, setS2ResponseVisible] = useState(false);
  const [s2ReflectionDone, setS2ReflectionDone] = useState(false);
  const [s2ReflectionTextDone, setS2ReflectionTextDone] = useState(false);

  const [s3QuestionDone, setS3QuestionDone] = useState(false);
  const [s3ResponseVisible, setS3ResponseVisible] = useState(false);
  const [s3ReflectionDone, setS3ReflectionDone] = useState(false);
  const [s3ReflectionTextDone, setS3ReflectionTextDone] = useState(false);

  const [closingDone, setClosingDone] = useState(false);

  // Auto-show user response after CEO question typewriter completes
  useEffect(() => {
    if (stage === 2 && s1QuestionDone && !s1ResponseVisible) {
      const t = setTimeout(() => setS1ResponseVisible(true), 1400);
      return () => clearTimeout(t);
    }
  }, [stage, s1QuestionDone, s1ResponseVisible]);

  useEffect(() => {
    if (stage === 2 && s1ResponseVisible && !s1ReflectionDone) {
      const t = setTimeout(() => setS1ReflectionDone(true), 1800);
      return () => clearTimeout(t);
    }
  }, [stage, s1ResponseVisible, s1ReflectionDone]);

  useEffect(() => {
    if (stage === 3 && s2QuestionDone && !s2ResponseVisible) {
      const t = setTimeout(() => setS2ResponseVisible(true), 1400);
      return () => clearTimeout(t);
    }
  }, [stage, s2QuestionDone, s2ResponseVisible]);

  useEffect(() => {
    if (stage === 3 && s2ResponseVisible && !s2ReflectionDone) {
      const t = setTimeout(() => setS2ReflectionDone(true), 1800);
      return () => clearTimeout(t);
    }
  }, [stage, s2ResponseVisible, s2ReflectionDone]);

  useEffect(() => {
    if (stage === 4 && s3QuestionDone && !s3ResponseVisible) {
      const t = setTimeout(() => setS3ResponseVisible(true), 1400);
      return () => clearTimeout(t);
    }
  }, [stage, s3QuestionDone, s3ResponseVisible]);

  useEffect(() => {
    if (stage === 4 && s3ResponseVisible && !s3ReflectionDone) {
      const t = setTimeout(() => setS3ReflectionDone(true), 1800);
      return () => clearTimeout(t);
    }
  }, [stage, s3ResponseVisible, s3ReflectionDone]);

  // Auto-scroll on stage change and key moments
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [
    stage,
    s1QuestionDone,
    s1ResponseVisible,
    s1ReflectionDone,
    s1ReflectionTextDone,
    s2QuestionDone,
    s2ResponseVisible,
    s2ReflectionDone,
    s2ReflectionTextDone,
    s3QuestionDone,
    s3ResponseVisible,
    s3ReflectionDone,
    s3ReflectionTextDone,
  ]);

  const handleRestart = () => {
    setStage(0);
    setActiveSpiral(0);
    setS1QuestionDone(false);
    setS1ResponseVisible(false);
    setS1ReflectionDone(false);
    setS1ReflectionTextDone(false);
    setS2QuestionDone(false);
    setS2ResponseVisible(false);
    setS2ReflectionDone(false);
    setS2ReflectionTextDone(false);
    setS3QuestionDone(false);
    setS3ResponseVisible(false);
    setS3ReflectionDone(false);
    setS3ReflectionTextDone(false);
    setClosingDone(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/30">
      {/* Header bar — minimal, dark, calm */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-indigo-100 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              Deep Resonance
            </div>
            <div className="text-xs text-indigo-400/80">
              Dialogue socratique — spirale 3-6-9
            </div>
          </div>
        </div>
        <SpiralIndicator active={activeSpiral} />
      </div>

      {/* Scrollable content — lots of space, calm pacing */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6 pb-16">
          {/* ===== STAGE 0 — Start button ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-24">
              <button
                onClick={() => setStage(1)}
                className="group flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 hover:shadow-indigo-200/50 hover:shadow-xl"
              >
                <Brain className="h-5 w-5 group-hover:animate-pulse" />{" "}
                Entrer en Deep Resonance
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User tension ===== */}
          {stage >= 1 && (
            <UserBubble text={DEEP_DATA.userTension} time="21:42" />
          )}
          {stage === 1 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-200 flex items-center gap-1.5 transition-all font-medium"
              >
                <Brain className="h-3 w-3" /> CarlOS ecoute...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking (SLOW) ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={DEEP_DATA.ceoThinking}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              speed={1200}
              onComplete={() => {
                setActiveSpiral(1);
                setStage(2);
              }}
            />
          )}

          {/* ===== STAGE 2 — SPIRALE 1 : Surface ===== */}
          {stage >= 2 && (
            <div className="space-y-5">
              {/* CEO question */}
              <DeepBotBubble
                text={DEEP_DATA.spirale1.ceoQuestion}
                typewrite={stage === 2 && !s1QuestionDone}
                speed={16}
                onTypewriteDone={() => setS1QuestionDone(true)}
                label="Spirale 1 — Surface"
                time="21:43"
              />

              {/* User response (appears after delay) */}
              {(s1ResponseVisible || stage > 2) && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <UserBubble
                    text={DEEP_DATA.spirale1.userResponse}
                    time="21:45"
                  />
                </div>
              )}

              {/* CEO reflection */}
              {(s1ReflectionDone || stage > 2) && (
                <DeepBotBubble
                  text={DEEP_DATA.spirale1.ceoReflection}
                  typewrite={stage === 2 && !s1ReflectionTextDone}
                  speed={16}
                  onTypewriteDone={() => setS1ReflectionTextDone(true)}
                  time="21:46"
                />
              )}

              {/* Reflection card */}
              {(s1ReflectionTextDone || stage > 2) && (
                <ReflectionCard
                  titre={DEEP_DATA.spirale1.reflectionCard.titre}
                  insight={DEEP_DATA.spirale1.reflectionCard.insight}
                  animate={stage === 2}
                />
              )}

              {/* Continue to spirale 2 */}
              {stage === 2 && s1ReflectionTextDone && (
                <div className="flex justify-center pt-2 animate-in fade-in duration-700">
                  <button
                    onClick={() => {
                      setActiveSpiral(2);
                      setStage(2.5);
                    }}
                    className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 flex items-center gap-1.5 font-medium transition-all"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Aller plus profond
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 2.5 — Spirale 2 thinking ===== */}
          {stage === 2.5 && (
            <ThinkingAnimation
              steps={DEEP_DATA.spirale2.thinkingSteps}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              speed={1200}
              onComplete={() => setStage(3)}
            />
          )}

          {/* ===== STAGE 3 — SPIRALE 2 : Profond ===== */}
          {stage >= 3 && (
            <div className="space-y-5">
              {/* CEO question */}
              <DeepBotBubble
                text={DEEP_DATA.spirale2.ceoQuestion}
                typewrite={stage === 3 && !s2QuestionDone}
                speed={16}
                onTypewriteDone={() => setS2QuestionDone(true)}
                label="Spirale 2 — Profond"
                time="21:48"
              />

              {/* User response */}
              {(s2ResponseVisible || stage > 3) && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <UserBubble
                    text={DEEP_DATA.spirale2.userResponse}
                    time="21:51"
                  />
                </div>
              )}

              {/* CEO reflection */}
              {(s2ReflectionDone || stage > 3) && (
                <DeepBotBubble
                  text={DEEP_DATA.spirale2.ceoReflection}
                  typewrite={stage === 3 && !s2ReflectionTextDone}
                  speed={16}
                  onTypewriteDone={() => setS2ReflectionTextDone(true)}
                  time="21:52"
                />
              )}

              {/* Mental Model card */}
              {(s2ReflectionTextDone || stage > 3) && (
                <MentalModelCard
                  nom={DEEP_DATA.spirale2.mentalModel.nom}
                  explication={DEEP_DATA.spirale2.mentalModel.explication}
                  animate={stage === 3}
                />
              )}

              {/* Reflection card */}
              {(s2ReflectionTextDone || stage > 3) && (
                <ReflectionCard
                  titre={DEEP_DATA.spirale2.reflectionCard.titre}
                  insight={DEEP_DATA.spirale2.reflectionCard.insight}
                  animate={stage === 3}
                />
              )}

              {/* Continue to spirale 3 */}
              {stage === 3 && s2ReflectionTextDone && (
                <div className="flex justify-center pt-2 animate-in fade-in duration-700">
                  <button
                    onClick={() => {
                      setActiveSpiral(3);
                      setStage(3.5);
                    }}
                    className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 flex items-center gap-1.5 font-medium transition-all"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Spirale finale
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 3.5 — Spirale 3 thinking ===== */}
          {stage === 3.5 && (
            <ThinkingAnimation
              steps={DEEP_DATA.spirale3.thinkingSteps}
              botEmoji=""
              botName="CarlOS (CEO)"
              botCode="BCO"
              speed={1200}
              onComplete={() => setStage(4)}
            />
          )}

          {/* ===== STAGE 4 — SPIRALE 3 : Resonance ===== */}
          {stage >= 4 && (
            <div className="space-y-5">
              {/* CEO question */}
              <DeepBotBubble
                text={DEEP_DATA.spirale3.ceoQuestion}
                typewrite={stage === 4 && !s3QuestionDone}
                speed={16}
                onTypewriteDone={() => setS3QuestionDone(true)}
                label="Spirale 3 — Resonance"
                time="21:55"
              />

              {/* User response */}
              {(s3ResponseVisible || stage > 4) && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <UserBubble
                    text={DEEP_DATA.spirale3.userResponse}
                    time="21:58"
                  />
                </div>
              )}

              {/* CEO crystallization reflection */}
              {(s3ReflectionDone || stage > 4) && (
                <DeepBotBubble
                  text={DEEP_DATA.spirale3.ceoReflection}
                  typewrite={stage === 4 && !s3ReflectionTextDone}
                  speed={16}
                  onTypewriteDone={() => setS3ReflectionTextDone(true)}
                  time="21:59"
                />
              )}

              {/* Crystallization card — the aha moment */}
              {(s3ReflectionTextDone || stage > 4) && (
                <CrystallizationCard
                  titre={DEEP_DATA.spirale3.crystallizationCard.titre}
                  insight={DEEP_DATA.spirale3.crystallizationCard.insight}
                  animate={stage === 4}
                />
              )}

              {/* Continue to mirror synthesis */}
              {stage === 4 && s3ReflectionTextDone && (
                <div className="flex justify-center pt-4 animate-in fade-in duration-700">
                  <button
                    onClick={() => {
                      setActiveSpiral(4);
                      setStage(5);
                    }}
                    className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 flex items-center gap-1.5 font-medium transition-all"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Synthese miroir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 5 — Mirror Synthesis ===== */}
          {stage >= 5 && (
            <div className="space-y-5 pt-2">
              {/* Divider */}
              <div className="flex items-center gap-3 px-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                <span className="text-[11px] text-indigo-400 font-medium uppercase tracking-widest">
                  Miroir
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
              </div>

              <MirrorSynthesis
                intro={DEEP_DATA.mirrorSynthesis.intro}
                priorities={DEEP_DATA.mirrorSynthesis.priorities}
                animate={stage === 5}
              />

              {/* Continue to closing */}
              {stage === 5 && (
                <div className="flex justify-center pt-2 animate-in fade-in duration-700 delay-[7500ms]">
                  <button
                    onClick={() => setStage(6)}
                    className="text-xs bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-200 flex items-center gap-1.5 font-medium transition-all"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Conclure
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 6 — Closing ===== */}
          {stage >= 6 && (
            <div className="space-y-5">
              <DeepBotBubble
                text={DEEP_DATA.closing}
                typewrite={stage === 6 && !closingDone}
                speed={20}
                onTypewriteDone={() => setClosingDone(true)}
                time="22:03"
              />

              {/* Completion + restart */}
              {closingDone && (
                <div className="space-y-4 animate-in fade-in duration-1000">
                  {/* Completion indicator */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200/60 rounded-full px-4 py-2">
                      <Brain className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-xs text-indigo-600 font-medium">
                        Deep Resonance terminee — 3 spirales, 1 cristallisation
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
                      <RotateCcw className="h-4 w-4" /> Recommencer la session
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
