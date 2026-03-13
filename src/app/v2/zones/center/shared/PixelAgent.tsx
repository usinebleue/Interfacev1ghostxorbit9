/**
 * PixelAgent.tsx — Bot anime style pixel art retro-gaming
 * Chaque bot a sa couleur neon signature + traits distinctifs
 * 6 etats: idle, thinking, typing, speaking, celebrating, sleeping
 * Sprint F8 — Prototype
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "../../../../components/ui/utils";

export type PixelAgentState = "idle" | "thinking" | "typing" | "speaking" | "celebrating" | "sleeping";

interface PixelAgentProps {
  /** Code du bot (CEOB, CTOB, etc.) */
  botCode: string;
  /** Etat actuel de l'agent */
  state?: PixelAgentState;
  /** Taille: sm=24, md=32, lg=64, xl=128 */
  size?: "sm" | "md" | "lg" | "xl";
  /** Afficher le nom sous l'agent */
  showLabel?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Callback au clic */
  onClick?: () => void;
}

// ─── Palette de couleurs par bot (basee sur les neons des avatars v3) ───

const BOT_PIXEL_CONFIG: Record<string, {
  name: string;
  primary: string;      // couleur neon principale
  secondary: string;    // couleur secondaire
  skin: string;         // peau
  hair: string;         // cheveux
  accent: string;       // accent (lunettes, accessoire)
  hasGlasses?: boolean;
  hasBeard?: boolean;
  shortHair?: boolean;
}> = {
  CEOB: { name: "Carlos", primary: "#3B82F6", secondary: "#1D4ED8", skin: "#D4A574", hair: "#2C2C2C", accent: "#60A5FA", hasBeard: true, shortHair: true },
  CTOB: { name: "Tim", primary: "#8B5CF6", secondary: "#6D28D9", skin: "#D4A574", hair: "#2C2C2C", accent: "#A78BFA", hasGlasses: true, shortHair: true },
  CFOB: { name: "Frank", primary: "#10B981", secondary: "#047857", skin: "#D4A574", hair: "#4A3728", accent: "#34D399", shortHair: true },
  CMOB: { name: "Mathilde", primary: "#EC4899", secondary: "#BE185D", skin: "#E8C4A0", hair: "#B8432F", accent: "#F472B6" },
  CSOB: { name: "Simone", primary: "#F59E0B", secondary: "#D97706", skin: "#E8C4A0", hair: "#1A1A1A", accent: "#FBBF24" },
  COOB: { name: "Olivier", primary: "#EF4444", secondary: "#B91C1C", skin: "#D4A574", hair: "#3D2B1F", accent: "#F87171", shortHair: true },
  CPOB: { name: "Paco", primary: "#06B6D4", secondary: "#0891B2", skin: "#D4A574", hair: "#2C2C2C", accent: "#22D3EE", shortHair: true },
  CHROB: { name: "Helene", primary: "#F97316", secondary: "#C2410C", skin: "#E8C4A0", hair: "#8B4513", accent: "#FB923C" },
  CINOB: { name: "Ines", primary: "#14B8A6", secondary: "#0D9488", skin: "#C68E5B", hair: "#1A1A1A", accent: "#2DD4BF" },
  CROB: { name: "Rich", primary: "#6366F1", secondary: "#4338CA", skin: "#D4A574", hair: "#2C2C2C", accent: "#818CF8", shortHair: true },
  CLOB: { name: "Loulou", primary: "#A855F7", secondary: "#7C3AED", skin: "#E8C4A0", hair: "#4A3728", accent: "#C084FC" },
  CISOB: { name: "Sebastien", primary: "#64748B", secondary: "#475569", skin: "#D4A574", hair: "#1A1A1A", accent: "#94A3B8", hasGlasses: true, shortHair: true },
};

const SIZES = { sm: 24, md: 32, lg: 64, xl: 128 };

// ─── Pixel grid renderer (8x8 base, scaled up) ───

function drawPixelAgent(
  ctx: CanvasRenderingContext2D,
  config: typeof BOT_PIXEL_CONFIG["CEOB"],
  state: PixelAgentState,
  frame: number,
  size: number,
) {
  const px = size / 8; // pixel size
  ctx.clearRect(0, 0, size, size);

  const { primary, secondary, skin, hair, accent } = config;

  // Animation offsets
  const bounce = state === "celebrating" ? Math.sin(frame * 0.8) * px * 0.5 : 0;
  const breathe = state === "idle" ? Math.sin(frame * 0.3) * px * 0.15 : 0;
  const nod = state === "thinking" ? Math.sin(frame * 0.5) * px * 0.2 : 0;
  const typeJitter = state === "typing" ? (frame % 2 === 0 ? px * 0.1 : 0) : 0;
  const sleepDrop = state === "sleeping" ? px * 0.2 : 0;

  const yOff = -bounce + breathe + sleepDrop;

  // Helper
  const fill = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * px, (y * px) + yOff, w * px, h * px);
  };

  // ═══ BODY (costume neon) ═══
  fill(2, 4, 4, 3, secondary);      // torso
  fill(2, 4, 4, 1, primary);        // collar neon line
  // Neon circuit lines on suit
  fill(2, 5.5, 1, 0.5, primary);
  fill(5, 5.5, 1, 0.5, primary);

  // ═══ ARMS ═══
  fill(1, 4.5, 1, 2, secondary);    // left arm
  fill(6, 4.5, 1, 2, secondary);    // right arm

  // Typing animation — arms move
  if (state === "typing") {
    const armY = frame % 3 === 0 ? 5 : 5.3;
    fill(1, armY, 1, 1, skin);      // left hand
    fill(6, armY + 0.3, 1, 1, skin); // right hand (offset)
  } else if (state === "celebrating") {
    fill(1, 3, 1, 1.5, secondary);  // left arm UP
    fill(6, 3, 1, 1.5, secondary);  // right arm UP
    fill(1, 2.5, 1, 0.5, skin);     // left hand up
    fill(6, 2.5, 1, 0.5, skin);     // right hand up
  } else {
    fill(1, 6, 1, 0.5, skin);       // left hand
    fill(6, 6, 1, 0.5, skin);       // right hand
  }

  // ═══ LEGS ═══
  fill(2.5, 7, 1.5, 1, "#1A1A2E"); // left leg
  fill(4, 7, 1.5, 1, "#1A1A2E");   // right leg

  // ═══ HEAD ═══
  const headY = nod;
  const fillH = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * px, (y * px) + yOff + headY, w * px, h * px);
  };

  fillH(2.5, 1, 3, 3, skin);       // face

  // ═══ HAIR ═══
  if (config.shortHair) {
    fillH(2, 0.5, 4, 1.2, hair);   // short top hair
  } else {
    fillH(2, 0.3, 4, 1.5, hair);   // longer hair
    fillH(1.5, 1, 1, 2, hair);     // side hair left
    fillH(5.5, 1, 1, 2, hair);     // side hair right
  }

  // ═══ EYES ═══
  if (state === "sleeping") {
    // Closed eyes (Z Z Z)
    fillH(3, 2.2, 0.8, 0.2, "#1A1A1A");
    fillH(4.2, 2.2, 0.8, 0.2, "#1A1A1A");
    // Z particles
    const zOff = (frame * 0.3) % 3;
    ctx.fillStyle = accent;
    ctx.font = `${px * 0.8}px monospace`;
    ctx.fillText("z", (5.5 + zOff * 0.3) * px, (1 - zOff * 0.4) * px + yOff);
  } else {
    // Open eyes
    fillH(3, 2, 0.7, 0.7, "white");
    fillH(4.3, 2, 0.7, 0.7, "white");
    // Pupils — look direction based on state
    const pupilOff = state === "thinking" ? (frame % 4 < 2 ? 0.15 : -0.15) : 0;
    fillH(3.2 + pupilOff, 2.2, 0.35, 0.35, "#1A1A1A");
    fillH(4.5 + pupilOff, 2.2, 0.35, 0.35, "#1A1A1A");
  }

  // ═══ GLASSES (Tim, Sebastien) ═══
  if (config.hasGlasses) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = px * 0.15;
    const gy = 2 * px + yOff + headY;
    ctx.strokeRect(2.7 * px, gy, 1.2 * px, 0.9 * px);
    ctx.strokeRect(4.1 * px, gy, 1.2 * px, 0.9 * px);
    ctx.beginPath();
    ctx.moveTo(3.9 * px, gy + 0.45 * px);
    ctx.lineTo(4.1 * px, gy + 0.45 * px);
    ctx.stroke();
  }

  // ═══ BEARD (Carlos) ═══
  if (config.hasBeard) {
    fillH(2.8, 3, 2.4, 0.5, hair + "88");
  }

  // ═══ MOUTH ═══
  if (state === "speaking") {
    const mouthH = frame % 3 === 0 ? 0.4 : 0.2;
    fillH(3.5, 3.2, 1, mouthH, "#C0392B");
  } else if (state === "celebrating") {
    fillH(3.3, 3, 1.4, 0.3, "#C0392B"); // big smile
  }

  // ═══ NEON GLOW effect ═══
  if (state !== "sleeping") {
    ctx.shadowColor = primary;
    ctx.shadowBlur = px * 1.5;
    fill(2, 4, 4, 0.15, primary + "66");
    ctx.shadowBlur = 0;
  }

  // ═══ STATE INDICATORS ═══
  if (state === "thinking") {
    // Thought bubbles
    const dotPhase = frame * 0.5;
    ctx.fillStyle = accent + "88";
    ctx.beginPath();
    ctx.arc((6.5 + Math.sin(dotPhase) * 0.3) * px, (0.8) * px + yOff, px * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc((7) * px, (0.3) * px + yOff, px * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  if (state === "typing" && typeJitter > 0) {
    // Tiny keyboard spark
    ctx.fillStyle = accent;
    ctx.fillRect(3 * px, 6.5 * px + yOff, 2 * px, 0.3 * px);
  }

  if (state === "celebrating") {
    // Sparkles
    ctx.fillStyle = accent;
    const sp = frame * 0.7;
    for (let i = 0; i < 3; i++) {
      const sx = (1 + i * 2.5 + Math.sin(sp + i) * 0.5) * px;
      const sy = (0.5 + Math.cos(sp + i * 1.3) * 0.5) * px + yOff;
      ctx.fillRect(sx, sy, px * 0.3, px * 0.3);
    }
  }
}

// ─── Component ───

export function PixelAgent({
  botCode,
  state = "idle",
  size = "md",
  showLabel = false,
  className,
  onClick,
}: PixelAgentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [, setTick] = useState(0);
  const config = BOT_PIXEL_CONFIG[botCode] || BOT_PIXEL_CONFIG.CEOB;
  const pxSize = SIZES[size];

  useEffect(() => {
    let raf: number;
    const fps = state === "sleeping" ? 4 : state === "idle" ? 8 : 12;
    let lastTime = 0;
    const interval = 1000 / fps;

    const animate = (time: number) => {
      raf = requestAnimationFrame(animate);
      if (time - lastTime < interval) return;
      lastTime = time;
      frameRef.current++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawPixelAgent(ctx, config, state, frameRef.current, pxSize);
      setTick((t) => t + 1); // force re-render for label updates if needed
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [config, state, pxSize]);

  const stateLabels: Record<PixelAgentState, string> = {
    idle: "En attente",
    thinking: "Reflechit...",
    typing: "Ecrit...",
    speaking: "Parle...",
    celebrating: "Mission accomplie!",
    sleeping: "Dort...",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-0.5 cursor-pointer group",
        className
      )}
      onClick={onClick}
      title={`${config.name} — ${stateLabels[state]}`}
    >
      <canvas
        ref={canvasRef}
        width={pxSize}
        height={pxSize}
        className="image-rendering-pixelated"
        style={{
          width: pxSize,
          height: pxSize,
          imageRendering: "pixelated",
        }}
      />
      {showLabel && (
        <span className="text-[9px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
          {config.name}
        </span>
      )}
    </div>
  );
}

// ─── Widget "Bots au Travail" — grille 12 agents ───

interface PixelAgentGridProps {
  /** Map botCode → etat (optionnel, defaut idle) */
  botStates?: Record<string, PixelAgentState>;
  /** Callback quand on clique sur un bot */
  onBotClick?: (botCode: string) => void;
}

export function PixelAgentGrid({ botStates = {}, onBotClick }: PixelAgentGridProps) {
  const botCodes = Object.keys(BOT_PIXEL_CONFIG);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
          GhostX Team — Live Activity
        </span>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {botCodes.map((code) => (
          <PixelAgent
            key={code}
            botCode={code}
            state={botStates[code] || "idle"}
            size="lg"
            showLabel
            onClick={() => onBotClick?.(code)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Flow Simulation — Ligne de Production Usine Bleue ───

interface FlowStep {
  bot: string;
  state: PixelAgentState;
  ms: number;
  label: string;
}

interface FlowSequence {
  name: string;
  steps: FlowStep[];
}

const DEMO_FLOWS: FlowSequence[] = [
  {
    name: "Aiguillage Prospect",
    steps: [
      { bot: "CEOB", state: "speaking", ms: 3000, label: "Accueil & qualification" },
      { bot: "CSOB", state: "thinking", ms: 2000, label: "Analyse strategique" },
      { bot: "CROB", state: "typing", ms: 2500, label: "Pipeline revenus" },
      { bot: "CFOB", state: "typing", ms: 2000, label: "Estimation financiere" },
      { bot: "CEOB", state: "celebrating", ms: 2000, label: "Pre-rapport genere!" },
    ],
  },
  {
    name: "Diagnostic VITAA",
    steps: [
      { bot: "CEOB", state: "speaking", ms: 2000, label: "Lancement diagnostic" },
      { bot: "CTOB", state: "typing", ms: 2500, label: "Audit technologie" },
      { bot: "COOB", state: "typing", ms: 2500, label: "Audit operations" },
      { bot: "CHROB", state: "typing", ms: 2000, label: "Audit RH" },
      { bot: "CFOB", state: "typing", ms: 2000, label: "Audit finance" },
      { bot: "CISOB", state: "thinking", ms: 2000, label: "Audit securite" },
      { bot: "CEOB", state: "celebrating", ms: 2500, label: "Score DIA calcule!" },
    ],
  },
  {
    name: "Visite SMART",
    steps: [
      { bot: "CEOB", state: "speaking", ms: 2000, label: "Preparation visite" },
      { bot: "CPOB", state: "thinking", ms: 3000, label: "Analyse usine" },
      { bot: "CTOB", state: "typing", ms: 2500, label: "Plan technologique" },
      { bot: "CFOB", state: "typing", ms: 2000, label: "Calcul ROI" },
      { bot: "CEOB", state: "celebrating", ms: 2000, label: "Rapport visite!" },
    ],
  },
  {
    name: "Jumelage Orbit9",
    steps: [
      { bot: "CEOB", state: "speaking", ms: 2000, label: "Recherche partenaires" },
      { bot: "CSOB", state: "thinking", ms: 2500, label: "Scoring compatibilite" },
      { bot: "CINOB", state: "typing", ms: 2000, label: "Innovation croisee" },
      { bot: "CLOB", state: "thinking", ms: 2000, label: "Validation juridique" },
      { bot: "CEOB", state: "celebrating", ms: 2000, label: "Match trouve!" },
    ],
  },
  {
    name: "Board Meeting",
    steps: [
      { bot: "CEOB", state: "speaking", ms: 2000, label: "Ouverture session" },
      { bot: "CFOB", state: "speaking", ms: 2500, label: "Rapport financier" },
      { bot: "CMOB", state: "speaking", ms: 2000, label: "Rapport marketing" },
      { bot: "COOB", state: "speaking", ms: 2000, label: "Rapport operations" },
      { bot: "CEOB", state: "typing", ms: 2500, label: "Synthese decisions" },
      { bot: "CEOB", state: "celebrating", ms: 2000, label: "PV genere!" },
    ],
  },
];

/** Station labels — noms courts pour les piedestaux */
const STATION_LABELS: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Tech", CFOB: "Finance", CMOB: "Marketing",
  CSOB: "Strategie", COOB: "Operations", CPOB: "Usine", CHROB: "RH",
  CINOB: "Innovation", CROB: "Revenus", CLOB: "Juridique", CISOB: "Securite",
};

export function FlowSimulation() {
  const [flowIndex, setFlowIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [rivetOffset, setRivetOffset] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rivetRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flow = DEMO_FLOWS[flowIndex];
  const step = flow.steps[stepIndex];
  const uniqueBots = Array.from(new Set(flow.steps.map((s) => s.bot)));

  // Advance steps automatically
  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= DEMO_FLOWS[flowIndex].steps.length) {
        // Flow complete — transition to next
        setTransitioning(true);
        setTimeout(() => {
          setFlowIndex((fi) => (fi + 1) % DEMO_FLOWS.length);
          setStepIndex(0);
          setTransitioning(false);
        }, 3000);
        return prev;
      }
      return next;
    });
  }, [flowIndex]);

  useEffect(() => {
    if (transitioning) return;
    timerRef.current = setTimeout(advanceStep, step.ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stepIndex, flowIndex, transitioning, advanceStep, step.ms]);

  // Rivet conveyor animation
  useEffect(() => {
    rivetRef.current = setInterval(() => {
      setRivetOffset((o) => (o + 1) % 24);
    }, 80);
    return () => {
      if (rivetRef.current) clearInterval(rivetRef.current);
    };
  }, []);

  // PME box position — fraction of conveyor width
  const pmeProgress = stepIndex / Math.max(flow.steps.length - 1, 1);
  const isLastStep = stepIndex === flow.steps.length - 1 && step.state === "celebrating";

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border border-gray-700 transition-opacity duration-500",
        transitioning ? "opacity-0" : "opacity-100"
      )}
      style={{ background: "linear-gradient(135deg, #1a1f2e 0%, #0f1218 100%)" }}
    >
      {/* ── Header — titre flow + progress bar ── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500">⚙</span>
            <span className="text-xs font-bold text-white">{flow.name}</span>
          </div>
          <span className="text-[9px] text-gray-500 font-mono">
            {stepIndex + 1}/{flow.steps.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="flex gap-0.5 h-1">
          {flow.steps.map((s, i) => {
            const botConfig = BOT_PIXEL_CONFIG[s.bot];
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i <= stepIndex
                    ? (botConfig?.primary || "#3B82F6")
                    : "#2a2f3e",
                  opacity: i <= stepIndex ? 1 : 0.3,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Stations — pixel agents aux postes ── */}
      <div className="px-4 py-2">
        <div className="flex items-end justify-around">
          {uniqueBots.map((botCode) => {
            const isActive = step.bot === botCode;
            const botConfig = BOT_PIXEL_CONFIG[botCode];
            return (
              <div key={botCode} className="flex flex-col items-center gap-1">
                {/* Pixel agent */}
                <div
                  className="transition-all duration-300"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 6px ${botConfig?.primary || "#3B82F6"})` : "none",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <PixelAgent
                    botCode={botCode}
                    state={isActive ? step.state : "idle"}
                    size="lg"
                  />
                </div>
                {/* Piedestal/Station */}
                <div
                  className="w-14 h-3 rounded-sm border transition-all duration-300"
                  style={{
                    borderColor: isActive ? (botConfig?.primary || "#3B82F6") : "#3a3f4a",
                    backgroundColor: isActive ? (botConfig?.primary + "22") : "#2a2f3a",
                    boxShadow: isActive ? `0 0 8px ${botConfig?.primary}44` : "none",
                  }}
                />
                <span className="text-[7px] text-gray-500 font-medium">
                  {STATION_LABELS[botCode] || botCode}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Convoyeur — bande + rivets + boite PME ── */}
      <div className="relative px-4 py-2">
        {/* Hazard stripes — extremites */}
        <div className="absolute left-4 top-2 w-3 h-4 z-10 overflow-hidden">
          <div className="w-full h-full" style={{
            background: "repeating-linear-gradient(45deg, #F59E0B 0px, #F59E0B 2px, #1a1a1a 2px, #1a1a1a 4px)",
            opacity: 0.6,
          }} />
        </div>
        <div className="absolute right-4 top-2 w-3 h-4 z-10 overflow-hidden">
          <div className="w-full h-full" style={{
            background: "repeating-linear-gradient(-45deg, #F59E0B 0px, #F59E0B 2px, #1a1a1a 2px, #1a1a1a 4px)",
            opacity: 0.6,
          }} />
        </div>

        {/* Bande principale */}
        <div className="relative h-4 bg-[#3a3f4a] rounded-sm border-y border-[#2a2f36]">
          {/* Rivets */}
          <div className="absolute inset-0 flex items-center overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#555] shrink-0"
                style={{
                  marginLeft: i === 0 ? `${-rivetOffset}px` : "6px",
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* PME Box — se deplace sur le convoyeur */}
          <div
            className="absolute top-0 h-full flex items-center z-20"
            style={{
              left: `${4 + pmeProgress * 88}%`,
              transition: "left 800ms ease-in-out",
            }}
          >
            <div
              className="w-5 h-3 rounded-[1px] flex items-center justify-center text-[5px] font-bold text-white transition-all duration-300"
              style={{
                backgroundColor: isLastStep ? "#10B981" : "#2563EB",
                boxShadow: isLastStep
                  ? "0 0 8px #10B981, 0 0 16px #10B98155"
                  : "0 0 6px #3B82F6",
              }}
            >
              PME
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer — label etape + compteur bots ── */}
      <div className="px-4 pb-3 pt-1 flex items-center justify-between">
        <p className="text-[9px] text-gray-400 font-medium truncate">
          <span className="text-gray-600 mr-1">▸</span>
          {step.label}
        </p>
        <span className="text-[8px] text-gray-600 shrink-0 ml-2">
          {uniqueBots.length} bots
        </span>
      </div>
    </div>
  );
}
