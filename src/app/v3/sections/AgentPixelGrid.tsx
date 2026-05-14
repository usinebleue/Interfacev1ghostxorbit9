/**
 * AgentPixelGrid.tsx — Bureau virtuel Brain Team (Agent Pixel V2)
 *
 * Bureau top-down anime: Canvas (sol + bureaux) + React overlays (personnages + bulles).
 * Inspire de Pixel Agents — adapte pour le web.
 *
 * Architecture:
 *  - OfficeCanvas: <canvas> pur (sol grille + bureaux bois + ecrans)
 *  - AgentCharacter: overlay React (avatar + glow + status dot + progress)
 *  - SpeechBubble: bulle de pensee avec typing effect
 *  - FloatingDocs: petits docs animes sur bureau actif
 *  - AgentDetailPanel: expansion inline SOUS le canvas (pas modal)
 *  - useAgentPixelSimulation: anime les mock data en continu
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Pause, XCircle, Eye, Cpu } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR_MAP, BOT_DISPLAY } from "./shared/dept-data";
import { useDataSource } from "../data/use-data-source";
import type { AgentPixelState } from "./shared/execution-data";
import { MOCK_AGENT_PIXELS } from "./shared/execution-data";

// ═══ Constantes bureau ═══

const DESK_W = 64;
const DESK_H = 40;
const COL_SPACING = 120;
const ROW_SPACING = 96;
const PADDING_X = 30;
const PADDING_Y = 24;
const COLS = 4;

const BOT_GLOW_COLORS: Record<string, string> = {
  CEOB: "#3b82f6", CTOB: "#8b5cf6", CFOB: "#10b981",
  CMOB: "#ec4899", CSOB: "#ef4444", COOB: "#f97316",
  CPOB: "#64748b", CHROB: "#14b8a6", CINOB: "#f43f5e",
  CROB: "#f59e0b", CLOB: "#06b6d4", CISOB: "#6366f1",
};

const BOT_DOT_COLORS: Record<string, string> = {
  CEOB: "bg-blue-500", CTOB: "bg-violet-500", CFOB: "bg-emerald-500",
  CMOB: "bg-pink-500", CSOB: "bg-red-500", COOB: "bg-orange-500",
  CPOB: "bg-slate-500", CHROB: "bg-teal-500", CINOB: "bg-rose-500",
  CROB: "bg-amber-500", CLOB: "bg-cyan-500", CISOB: "bg-indigo-500",
};

// ═══ Styles CSS injectes une fois ═══

const BUREAU_STYLES = `
@keyframes agent-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
@keyframes agent-glow {
  0%, 100% { box-shadow: 0 0 6px 1px var(--glow-c); opacity: 0.7; }
  50% { box-shadow: 0 0 14px 4px var(--glow-c); opacity: 1; }
}
@keyframes doc-appear {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes particle-rise {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-20px) scale(0.3); opacity: 0; }
}
@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes expand-in {
  0% { max-height: 0; opacity: 0; }
  100% { max-height: 400px; opacity: 1; }
}
`;

// ═══ Desk positions calculator ═══

function calcDeskPositions(agents: AgentPixelState[]) {
  const rows = Math.ceil(agents.length / COLS);
  const positions: Record<string, { x: number; y: number; col: number; row: number }> = {};
  agents.forEach((a, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    positions[a.bot_code] = {
      x: PADDING_X + col * COL_SPACING,
      y: PADDING_Y + row * ROW_SPACING,
      col,
      row,
    };
  });
  const canvasW = PADDING_X * 2 + (Math.min(agents.length, COLS) - 1) * COL_SPACING + DESK_W;
  const canvasH = PADDING_Y * 2 + (rows - 1) * ROW_SPACING + DESK_H + 40;
  return { positions, canvasW, canvasH, rows };
}

function isActive(state: AgentPixelState) {
  return state.status === "executing" || state.status === "thinking";
}

// ═══ Simulation hook — anime les mock data en continu ═══

const THOUGHT_POOLS: Record<string, string[]> = {
  CEOB: [
    "Analyse des KPIs Q2 pour identifier les 3 priorites strategiques...",
    "Cross-reference des objectifs OKR avec la performance reelle du trimestre...",
    "Evaluation de l'impact du partenariat REAI sur la croissance organique...",
  ],
  CFOB: [
    "Verification croisee des projections avec les donnees comptables...",
    "Consolidation des flux de tresorerie et ajustement des previsions...",
    "Analyse de sensibilite sur les marges operationnelles par segment...",
  ],
  CMOB: [
    "Segmentation des audiences cibles pour la campagne manufacturiere...",
    "Optimisation du mix media digital vs evenementiel pour Q3...",
    "Analyse du funnel de conversion depuis les contenus LinkedIn...",
  ],
  CTOB: [
    "Architecture des microservices pour le module multi-tenant...",
    "Evaluation de la dette technique et priorisation du refactoring...",
    "Benchmark des solutions de cache distribue pour la scalabilite...",
  ],
};

function useAgentPixelSimulation(agents: AgentPixelState[], enabled: boolean) {
  const [simAgents, setSimAgents] = useState<AgentPixelState[]>(agents);
  const tickRef = useRef(0);
  const typingRef = useRef<Record<string, { text: string; idx: number; poolIdx: number }>>({});

  useEffect(() => {
    if (!enabled) {
      setSimAgents(agents);
      return;
    }

    // Init typing state per active agent
    agents.forEach((a) => {
      if (isActive(a) && !typingRef.current[a.bot_code]) {
        const pool = THOUGHT_POOLS[a.bot_code] || THOUGHT_POOLS.CEOB;
        typingRef.current[a.bot_code] = { text: pool[0], idx: 0, poolIdx: 0 };
      }
    });

    const interval = setInterval(() => {
      tickRef.current++;
      setSimAgents((prev) =>
        prev.map((a) => {
          if (!isActive(a)) {
            // Cycle waiting → executing every ~20s
            if (a.status === "waiting" && tickRef.current % 200 === 50 + (a.bot_code.charCodeAt(0) % 30)) {
              const pool = THOUGHT_POOLS[a.bot_code] || THOUGHT_POOLS.CEOB;
              typingRef.current[a.bot_code] = { text: pool[0], idx: 0, poolIdx: 0 };
              return { ...a, status: "executing" as const, step: 1, total_steps: 5, task_title: "Nouvelle tache auto" };
            }
            return a;
          }

          // Typing effect (every 30ms tick = every call)
          const typing = typingRef.current[a.bot_code];
          let newPreview = a.thought_preview;
          if (typing) {
            if (typing.idx < typing.text.length) {
              typing.idx++;
              newPreview = typing.text.slice(0, typing.idx);
            } else if (tickRef.current % 60 === 0) {
              // Change text after pause
              const pool = THOUGHT_POOLS[a.bot_code] || THOUGHT_POOLS.CEOB;
              typing.poolIdx = (typing.poolIdx + 1) % pool.length;
              typing.text = pool[typing.poolIdx];
              typing.idx = 0;
              newPreview = "";
            }
          }

          // Step advancement every ~5s (50 ticks at 100ms)
          let newStep = a.step;
          let newStatus = a.status;
          if (tickRef.current % 50 === 0 && a.step < a.total_steps) {
            newStep = a.step + 1;
          }
          // Done after reaching total steps
          if (newStep >= a.total_steps && a.step < a.total_steps) {
            newStatus = "done";
          }
          // Cycle done → waiting after 3s
          if (a.status === "done" && tickRef.current % 30 === 0) {
            delete typingRef.current[a.bot_code];
            return { ...a, status: "waiting" as const, step: 0, total_steps: 0, thought_preview: "", task_title: "" };
          }

          return { ...a, step: newStep, status: newStatus, thought_preview: newPreview };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, agents]);

  return enabled ? simAgents : agents;
}

// ═══ OfficeCanvas — Sol + bureaux sur <canvas> ═══

function OfficeCanvas({
  canvasW,
  canvasH,
  positions,
  agents,
}: {
  canvasW: number;
  canvasH: number;
  positions: Record<string, { x: number; y: number }>;
  agents: AgentPixelState[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const draw = () => {
      frameRef.current++;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sol
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Grille subtile
      ctx.strokeStyle = "rgba(37, 37, 64, 0.3)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvasW; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasH);
        ctx.stroke();
      }
      for (let y = 0; y < canvasH; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasW, y);
        ctx.stroke();
      }

      // Bureaux
      for (const a of agents) {
        const pos = positions[a.bot_code];
        if (!pos) continue;
        const active = isActive(a);
        const bx = pos.x;
        const by = pos.y + 28; // Below avatar space

        // Ombre portee
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        roundRect(ctx, bx + 2, by + 2, DESK_W, DESK_H, 3);
        ctx.fill();

        // Bureau bois
        ctx.fillStyle = active ? "#9B8465" : "#6B6355";
        roundRect(ctx, bx, by, DESK_W, DESK_H, 3);
        ctx.fill();

        // Grain du bois
        ctx.strokeStyle = active ? "rgba(139,115,85,0.4)" : "rgba(80,70,60,0.3)";
        ctx.lineWidth = 0.3;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + 4, by + 8 + i * 8);
          ctx.lineTo(bx + DESK_W - 4, by + 8 + i * 8);
          ctx.stroke();
        }

        // Ecran (petit rect sombre au-dessus du bureau)
        const screenW = 24;
        const screenH = 14;
        const screenX = bx + (DESK_W - screenW) / 2;
        const screenY = by - screenH + 2;
        ctx.fillStyle = active ? "#1e293b" : "#2a2a3a";
        roundRect(ctx, screenX, screenY, screenW, screenH, 2);
        ctx.fill();

        // Lueur ecran actif
        if (active) {
          const glowColor = BOT_GLOW_COLORS[a.bot_code] || "#3b82f6";
          ctx.fillStyle = glowColor + "40";
          roundRect(ctx, screenX + 1, screenY + 1, screenW - 2, screenH - 2, 1);
          ctx.fill();
        }

        // Documents sur bureau actif
        if (active && frameRef.current > 30) {
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillRect(bx + 6, by + 8, 8, 10);
          ctx.fillRect(bx + 18, by + 12, 7, 9);
          if (a.step > 2) {
            ctx.fillRect(bx + DESK_W - 18, by + 6, 8, 11);
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [canvasW, canvasH, positions, agents]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: canvasW, height: canvasH }}
      className="absolute inset-0 rounded-xl"
    />
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ═══ SpeechBubble — Bulle de pensee ═══

function SpeechBubble({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div
      className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      style={{ maxWidth: 160 }}
    >
      <div className="bg-white/95 border border-gray-200 rounded-lg px-2 py-1 shadow-sm relative">
        <p className="text-[8px] text-gray-700 font-mono leading-tight truncate">
          {text}
          <span className="inline-block w-[4px] h-[9px] bg-gray-700 ml-px align-middle" style={{ animation: "cursor-blink 1s step-end infinite" }} />
        </p>
        {/* Triangle fleche */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/95 border-r border-b border-gray-200 rotate-45" />
      </div>
    </div>
  );
}

// ═══ FloatingDocs — Petits docs qui apparaissent ═══

function FloatingDocs() {
  return (
    <div className="absolute top-6 left-2 pointer-events-none">
      {[0, 0.8, 1.6].map((delay, i) => (
        <div
          key={i}
          className="absolute w-[6px] h-[8px] bg-white/80 rounded-[1px]"
          style={{
            left: i * 12,
            top: i * 4,
            animation: `doc-appear 0.5s ease-out ${delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ═══ Particles — Donnees qui montent ═══

function DataParticles({ color }: { color: string }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
      {[0, 0.7, 1.4].map((delay, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            backgroundColor: color,
            left: (i - 1) * 6,
            animation: `particle-rise 2s ease-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ═══ AgentCharacter — Personnage overlay ═══

function AgentCharacter({
  state,
  onClick,
  isExpanded,
}: {
  state: AgentPixelState;
  onClick: () => void;
  isExpanded: boolean;
}) {
  const display = BOT_DISPLAY[state.bot_code] || { name: state.bot_code, role: "Agent", dept: "" };
  const avatar = BOT_AVATAR_MAP[state.bot_code];
  const active = isActive(state);
  const glowColor = BOT_GLOW_COLORS[state.bot_code] || "#3b82f6";
  const pct = state.total_steps > 0 ? Math.round((state.step / state.total_steps) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 cursor-pointer group transition-all",
        active ? "" : "opacity-50 grayscale",
      )}
      style={{ width: DESK_W + 20 }}
    >
      {/* Avatar cercle */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 28,
          height: 28,
          ...(active
            ? {
                animation: "agent-bob 0.8s ease-in-out infinite",
                // @ts-expect-error CSS custom property
                "--glow-c": glowColor,
                boxShadow: `0 0 8px 2px ${glowColor}60`,
              }
            : {}),
          border: active ? `2px solid ${glowColor}` : "2px solid #444",
          imageRendering: "pixelated",
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={display.name}
            className="w-full h-full object-cover"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-[10px] text-white font-bold">
            {display.name?.charAt(0) || "?"}
          </div>
        )}

        {/* Glow ring for active */}
        {active && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              // @ts-expect-error CSS custom property
              "--glow-c": glowColor,
              animation: "agent-glow 3s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-1">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            active ? "animate-pulse" : "",
            active
              ? BOT_DOT_COLORS[state.bot_code] || "bg-green-500"
              : state.status === "done"
                ? "bg-blue-400"
                : "bg-gray-500",
          )}
        />
        <span className="text-[7px] font-bold text-gray-300 truncate max-w-[56px]">
          {display.name}
        </span>
      </div>

      {/* Mini progress bar (active only) */}
      {active && (
        <div className="w-10 h-[3px] bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: glowColor }}
          />
        </div>
      )}

      {/* Hover indicator */}
      {isExpanded && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `4px solid ${glowColor}`,
          }}
        />
      )}
    </button>
  );
}

// ═══ AgentDetailPanel — Expansion inline ═══

function AgentDetailPanel({
  state,
  onClose,
}: {
  state: AgentPixelState;
  onClose: () => void;
}) {
  const display = BOT_DISPLAY[state.bot_code] || { name: state.bot_code, role: "Agent", dept: "" };
  const avatar = BOT_AVATAR_MAP[state.bot_code];
  const STEPS = ["Ingestion", "Classification", "Extraction", "Assemblage", "Fact-check", "Publication"];
  const steps = STEPS.slice(0, state.total_steps || 5);

  return (
    <div
      className="overflow-hidden border-t border-gray-700/50"
      style={{ animation: "expand-in 0.3s ease-out forwards" }}
    >
      <div className="bg-[#12121f] rounded-b-xl p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {avatar && <img src={avatar} alt={display.name} className="w-5 h-5 rounded-full" />}
            <span className="text-[10px] font-bold text-gray-200">{display.name} — {display.role}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-[9px]">Fermer</button>
        </div>

        {/* Pipeline steps */}
        {state.total_steps > 0 && (
          <div className="flex gap-1 mb-2">
            {steps.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "flex-1 px-1 py-0.5 rounded text-center text-[7px] font-bold",
                  i + 1 < state.step
                    ? "bg-green-900/60 text-green-400"
                    : i + 1 === state.step
                      ? "bg-blue-900/60 text-blue-300 ring-1 ring-blue-500/50"
                      : "bg-gray-800 text-gray-600",
                )}
              >
                {i + 1 < state.step ? "\u2713" : i + 1 === state.step ? "\u2192" : "\u25CB"} {s}
              </div>
            ))}
          </div>
        )}

        {/* Stream de pensee */}
        {state.thought_preview && (
          <div className="bg-slate-900 rounded-lg p-2 mb-2">
            <p className="text-[8px] text-slate-500 uppercase mb-0.5">Pensee</p>
            <p className="text-[9px] text-slate-300 font-mono leading-relaxed">
              &quot;{state.thought_preview}&quot;
            </p>
          </div>
        )}

        {/* Metriques */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[
            { label: "Tokens in", value: state.tokens_in.toLocaleString() },
            { label: "Tokens out", value: state.tokens_out.toLocaleString() },
            { label: "Cout", value: `$${state.cost_usd.toFixed(4)}` },
            { label: "Modele", value: state.model.replace("gemini-2.0-", "G2-") },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-[7px] text-gray-500 uppercase">{m.label}</p>
              <p className="text-[9px] font-bold text-gray-300">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        {isActive(state) && (
          <div className="flex gap-2 justify-end">
            <button className="flex items-center gap-1 px-2 py-1 text-[8px] font-medium text-gray-400 bg-gray-800 rounded hover:bg-gray-700">
              <Pause className="h-2.5 w-2.5" /> Pause
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-[8px] font-medium text-red-400 bg-red-950/50 rounded hover:bg-red-900/50">
              <XCircle className="h-2.5 w-2.5" /> Annuler
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-[8px] font-medium text-blue-400 bg-blue-950/50 rounded hover:bg-blue-900/50">
              <Eye className="h-2.5 w-2.5" /> Voir resultat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ Composant principal — Bureau Brain Team ═══

export function AgentPixelGrid() {
  // Fetch live agent pixels from API
  const { data: rawPixels, isLive } = useDataSource<Record<string, AgentPixelState>>("agent-pixels", {});

  // Merge live + mock data
  const baseAgents: AgentPixelState[] = useMemo(
    () =>
      isLive && Object.keys(rawPixels).length > 0
        ? Object.values(rawPixels)
        : MOCK_AGENT_PIXELS,
    [rawPixels, isLive],
  );

  // Simulation for mock mode
  const agents = useAgentPixelSimulation(baseAgents, !isLive);

  const [expandedBot, setExpandedBot] = useState<string | null>(null);

  // Desk layout
  const { positions, canvasW, canvasH } = useMemo(() => calcDeskPositions(agents), [agents]);

  const activeCount = agents.filter(isActive).length;

  const toggle = useCallback(
    (botCode: string) => setExpandedBot((prev) => (prev === botCode ? null : botCode)),
    [],
  );

  // Inject styles once
  useEffect(() => {
    const id = "agent-pixel-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = BUREAU_STYLES;
    document.head.appendChild(style);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  if (agents.length === 0) return null;

  const expandedState = expandedBot ? agents.find((a) => a.bot_code === expandedBot) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-bold text-gray-900">Bureau Brain Team</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-green-100 text-green-700 rounded-full">
            {activeCount} actif{activeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Bureau virtuel */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#1a1a2e" }}>
        <div className="relative" style={{ width: canvasW, height: canvasH }}>
          {/* Canvas: sol + bureaux + ecrans */}
          <OfficeCanvas canvasW={canvasW} canvasH={canvasH} positions={positions} agents={agents} />

          {/* Overlays React: personnages + bulles */}
          {agents.map((agent) => {
            const pos = positions[agent.bot_code];
            if (!pos) return null;
            const active = isActive(agent);
            return (
              <div
                key={agent.bot_code}
                className="absolute"
                style={{ left: pos.x - 10, top: pos.y - 12 }}
              >
                {/* Speech bubble above */}
                {active && <SpeechBubble text={agent.thought_preview} />}

                {/* Character */}
                <AgentCharacter
                  state={agent}
                  onClick={() => toggle(agent.bot_code)}
                  isExpanded={expandedBot === agent.bot_code}
                />

                {/* Floating docs + particles on active */}
                {active && <FloatingDocs />}
                {active && <DataParticles color={BOT_GLOW_COLORS[agent.bot_code] || "#3b82f6"} />}
              </div>
            );
          })}
        </div>

        {/* Detail panel — SOUS le canvas, inline */}
        {expandedState && (
          <AgentDetailPanel state={expandedState} onClose={() => setExpandedBot(null)} />
        )}
      </div>
    </div>
  );
}
