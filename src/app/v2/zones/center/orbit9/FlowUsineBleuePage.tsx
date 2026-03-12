/**
 * FlowUsineBleuePage.tsx — Animation PREMIUM du flow de transformation Usine Bleue AI
 * V2 MAX — Canvas particle system, 3D tilt, glassmorphism, typewriter, energy beams
 * 7 etapes : Qualification → Pre-rapport → Jumelage → Visite → Rapport → Cahier → Financement
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════

interface FlowStep {
  num: number;
  emoji: string;
  label: string;
  title: string;
  desc: string;
  pills: string[];
  carlosBadge?: string;
  color: string;
  colorRgb: string;
  gradient: string;
}

const STEPS: FlowStep[] = [
  {
    num: 1, emoji: "\uD83C\uDFAF", label: "Phase 1",
    title: "Qualification du manufacturier",
    desc: "CarlOS engage la conversation avec le dirigeant. Diagnostic VITAA automatise sur les 5 piliers : Ventes, Idees, Temps, Argent, Actifs.",
    pills: ["Diagnostic VITAA", "Triangle du Feu", "Scoring 0-100"],
    carlosBadge: "CarlOS — CEO Bot analyse en temps reel",
    color: "#3b82f6", colorRgb: "59,130,246",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  {
    num: 2, emoji: "\uD83D\uDCCB", label: "Phase 2",
    title: "Pre-rapport & invitation",
    desc: "Generation automatique du pre-rapport diagnostique. Identification des gaps critiques. Invitation au jumelage avec fournisseurs qualifies.",
    pills: ["Pre-rapport PDF", "Gaps identifies", "Invitation jumelage"],
    carlosBadge: "CarlOS genere le rapport + propose le match",
    color: "#8b5cf6", colorRgb: "139,92,246",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },
  {
    num: 3, emoji: "\uD83E\uDD1D", label: "Phase 3",
    title: "Jumelage manufacturier \u2194 fournisseur",
    desc: "Orbit9 Matching Engine connecte le manufacturier avec les fournisseurs, integrateurs et equipementiers du reseau.",
    pills: ["Orbit9 Matching", "Trisociation", "130+ membres REAI"],
    color: "#06b6d4", colorRgb: "6,182,212",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
  },
  {
    num: 4, emoji: "\uD83C\uDFED", label: "Phase 4",
    title: "Visite d'usine",
    desc: "Rencontre terrain entre le manufacturier et les fournisseurs jumeles. Evaluation de la ligne de production. Identification des opportunites.",
    pills: ["Visite terrain", "Audit ligne", "Photos / mesures"],
    color: "#10b981", colorRgb: "16,185,129",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  {
    num: 5, emoji: "\uD83D\uDCCA", label: "Phase 5",
    title: "Rapport complet",
    desc: "Rapport detaille post-visite. Analyse approfondie des processus, couts, retour sur investissement projete et plan de transformation.",
    pills: ["Analyse ROI", "Plan transformation", "Recommandations"],
    carlosBadge: "CarlOS compile les donnees + genere l'analyse",
    color: "#f59e0b", colorRgb: "245,158,11",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
  {
    num: 6, emoji: "\uD83D\uDCD3", label: "Phase 6",
    title: "Cahier de projet",
    desc: "Document de reference complet. Specifications techniques, echeancier, budget, responsabilites et jalons.",
    pills: ["Specs techniques", "Echeancier", "Budget detaille", "Jalons"],
    color: "#ec4899", colorRgb: "236,72,153",
    gradient: "linear-gradient(135deg, #ec4899, #db2777)",
  },
  {
    num: 7, emoji: "\uD83D\uDCB0", label: "Phase 7",
    title: "Financement & realisation",
    desc: "Montage financier avec les programmes disponibles. Demarrage de l'implantation sur la ligne de montage. Suivi en temps reel par CarlOS.",
    pills: ["Montage financier", "Implantation", "Suivi CarlOS"],
    carlosBadge: "CarlOS suit le projet jusqu'a la livraison",
    color: "#22d3ee", colorRgb: "34,211,238",
    gradient: "linear-gradient(135deg, #22d3ee, #06b6d4)",
  },
];

// ════════════════════════════════════════════════════════════════
// CANVAS PARTICLE SYSTEM — neural network + mouse reactive
// ════════════════════════════════════════════════════════════════

interface CanvasParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

interface BurstParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

function CanvasBackground({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<CanvasParticle[]>([]);
  const burstsRef = useRef<BurstParticle[]>([]);
  const frameRef = useRef(0);

  const spawnBurst = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
      const speed = 1 + Math.random() * 4;
      burstsRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, maxLife: 60 + Math.random() * 40,
        size: 1 + Math.random() * 3,
        color,
      });
    }
  }, []);

  // Expose spawnBurst on the canvas element for external triggering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) (canvas as unknown as Record<string, unknown>)._spawnBurst = spawnBurst;
  }, [spawnBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    const PARTICLE_COUNT = 120;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 200;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(container.scrollHeight, rect.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Init particles
    if (particlesRef.current.length === 0) {
      const colors = ["59,130,246", "139,92,246", "6,182,212", "16,185,129", "245,158,11", "236,72,153", "34,211,238"];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 1 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.05 + Math.random() * 0.15,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.03,
        });
      }
    }

    // Mouse tracking (relative to container scroll)
    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top + container.scrollTop,
      };
    };
    container.addEventListener("mousemove", handleMouse);

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const bursts = burstsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;
        const pulseAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        // Mouse attraction/repulsion
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
        }

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${pulseAlpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${pulseAlpha * 0.05})`;
        ctx.fill();

        // Connections to nearby particles (neural network effect)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < CONNECTION_DIST) {
            const connAlpha = (1 - cdist / CONNECTION_DIST) * 0.04;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${p.color}, ${connAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update & draw burst particles
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.97;
        b.vy *= 0.97;
        b.life++;
        const progress = b.life / b.maxLife;
        const alpha = 1 - progress;
        if (progress >= 1) { bursts.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = b.color.replace(")", `, ${alpha})`).replace("rgb(", "rgba(");
        ctx.fill();
        // Trail
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * 2 * (1 - progress), 0, Math.PI * 2);
        ctx.fillStyle = b.color.replace(")", `, ${alpha * 0.2})`).replace("rgb(", "rgba(");
        ctx.fill();
      }

      // Floating orbs (ambient large soft circles)
      const time = frameRef.current * 0.005;
      const orbs = [
        { x: canvas.width * 0.2, y: 200, r: 120, color: "59,130,246" },
        { x: canvas.width * 0.8, y: 600, r: 100, color: "139,92,246" },
        { x: canvas.width * 0.5, y: 1200, r: 140, color: "6,182,212" },
        { x: canvas.width * 0.3, y: 1800, r: 110, color: "16,185,129" },
        { x: canvas.width * 0.7, y: 2400, r: 130, color: "245,158,11" },
      ];
      for (const orb of orbs) {
        const ox = orb.x + Math.sin(time + orb.y * 0.01) * 30;
        const oy = orb.y + Math.cos(time * 0.7 + orb.x * 0.01) * 20;
        const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        gradient.addColorStop(0, `rgba(${orb.color}, 0.02)`);
        gradient.addColorStop(1, `rgba(${orb.color}, 0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      frameRef.current++;
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      container.removeEventListener("mousemove", handleMouse);
      ro.disconnect();
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ════════════════════════════════════════════════════════════════
// TYPEWRITER TEXT
// ════════════════════════════════════════════════════════════════

function TypewriterText({ text, active, speed = 30 }: { text: string; active: boolean; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    let i = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return (
    <span>
      {displayed}
      {active && !done && (
        <span style={{ animation: "ub-blink 0.8s infinite", borderRight: "2px solid currentColor", marginLeft: 2 }} />
      )}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// 3D TILT CARD
// ════════════════════════════════════════════════════════════════

function TiltCard({ children, color }: { children: React.ReactNode; color: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 12;
    const rotateX = (0.5 - y) * 12;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    setGlare({ x: x * 100, y: y * 100, opacity: 0.15 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
        position: "relative",
        background: "white",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid rgba(0,0,0,0.08)`,
        borderRadius: 20,
        padding: "24px 28px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Glare effect */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
        transition: "opacity 0.3s",
        pointerEvents: "none",
        borderRadius: 20,
      }} />
      {/* Border glow */}
      <div style={{
        position: "absolute", inset: -1,
        borderRadius: 21,
        background: `linear-gradient(135deg, ${color}33, transparent 50%, ${color}22)`,
        zIndex: -1,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ════════════════════════════════════════════════════════════════

function AnimatedCounter({ target, active, suffix = "" }: { target: number; active: boolean; suffix?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      start = Math.floor(eased * target);
      setValue(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, active]);
  return <span>{value}{suffix}</span>;
}

// ════════════════════════════════════════════════════════════════
// STEP NODE with energy ring + particle burst trigger
// ════════════════════════════════════════════════════════════════

function StepNodeV2({ step, visible, canvasRef }: { step: FlowStep; visible: boolean; canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const hasBurst = useRef(false);

  useEffect(() => {
    if (visible && !hasBurst.current && nodeRef.current && canvasRef.current) {
      hasBurst.current = true;
      const canvas = canvasRef.current as unknown as Record<string, unknown>;
      const rect = nodeRef.current.getBoundingClientRect();
      const container = nodeRef.current.closest("[data-flow-container]");
      if (container && typeof canvas._spawnBurst === "function") {
        const cRect = container.getBoundingClientRect();
        const x = rect.left - cRect.left + rect.width / 2;
        const y = rect.top - cRect.top + rect.height / 2 + container.scrollTop;
        (canvas._spawnBurst as (x: number, y: number, c: string) => void)(x, y, `rgb(${step.colorRgb})`);
      }
    }
  }, [visible, step.colorRgb, canvasRef]);

  return (
    <div ref={nodeRef} style={{
      width: 72, height: 72, borderRadius: "50%",
      position: "relative", zIndex: 2, flexShrink: 0,
    }}>
      {/* Outer energy rings */}
      <div style={{
        position: "absolute", inset: -12,
        borderRadius: "50%",
        border: `1px solid ${step.color}`,
        opacity: visible ? 0.2 : 0,
        animation: visible ? "ub-ring-pulse 2s infinite" : undefined,
        transition: "opacity 0.5s",
      }} />
      <div style={{
        position: "absolute", inset: -20,
        borderRadius: "50%",
        border: `1px solid ${step.color}`,
        opacity: visible ? 0.1 : 0,
        animation: visible ? "ub-ring-pulse 2s infinite 0.5s" : undefined,
        transition: "opacity 0.5s",
      }} />
      {/* Inner glow */}
      <div style={{
        position: "absolute", inset: -30,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${step.colorRgb}, 0.15), transparent 70%)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 1s",
      }} />
      {/* Main circle */}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28,
        background: step.gradient,
        boxShadow: visible ? `0 0 40px rgba(${step.colorRgb}, 0.5), 0 0 80px rgba(${step.colorRgb}, 0.2)` : "none",
        transition: "box-shadow 0.8s, transform 0.3s",
        cursor: "default",
      }}>
        {step.emoji}
      </div>
      {/* Step number badge */}
      <div style={{
        position: "absolute", top: -6, right: -6,
        width: 24, height: 24,
        background: "white", color: "#0f172a",
        borderRadius: "50%",
        fontSize: 12, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 2px 12px rgba(0,0,0,0.3), 0 0 20px rgba(${step.colorRgb}, 0.3)`,
      }}>
        {step.num}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CARLOS BADGE V2 — scan line + holographic
// ════════════════════════════════════════════════════════════════

function CarlosBadgeV2({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))",
      border: "1px solid rgba(59,130,246,0.25)",
      borderRadius: 24, padding: "6px 16px",
      marginTop: 16, fontSize: 11, color: "#3b82f6", fontWeight: 600,
      position: "relative", overflow: "hidden",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.6s ease-out 0.5s",
    }}>
      {/* Scan line */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent)",
        backgroundSize: "200% 100%",
        animation: "ub-scanline 2s linear infinite",
      }} />
      <span style={{
        width: 8, height: 8, background: "#3b82f6",
        borderRadius: "50%", animation: "ub-carlos-pulse 1.5s infinite",
        display: "inline-block", position: "relative",
      }} />
      <span style={{ position: "relative" }}>{text}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// BOT REFLECTION VIZ — Thinking + Multi-Consult patterns (dark theme)
// Same pattern as simulation-components.tsx (ThinkingAnimation, MultiConsultAnimation)
// ════════════════════════════════════════════════════════════════

interface BotConfig {
  avatar: string;
  name: string;
  role: string;
  color: string;
}

const BOT_CFG: Record<string, BotConfig> = {
  CEOB: { avatar: "/agents/ceo-carlos.png", name: "CarlOS", role: "CEO", color: "#3b82f6" },
  CTOB: { avatar: "/agents/cto-thierry.png", name: "Thierry", role: "CTO", color: "#8b5cf6" },
  CFOB: { avatar: "/agents/cfo-francois.png", name: "François", role: "CFO", color: "#10b981" },
  CROB: { avatar: "/agents/cro-raphael.png", name: "Raphaël", role: "CRO", color: "#f59e0b" },
  COOB: { avatar: "/agents/coo-olivier.png", name: "Olivier", role: "COO", color: "#f97316" },
  CSOB: { avatar: "/agents/cso-sophie.png", name: "Sophie", role: "CSO", color: "#ef4444" },
};

interface ReflectionConfig {
  type: "thinking" | "consult";
  lead: string;
  thinkSteps?: string[];
  consultBots?: string[];
  consolidation?: string;
}

const STEP_REFLECTIONS: Record<number, ReflectionConfig> = {
  1: {
    type: "thinking", lead: "CEOB",
    thinkSteps: [
      "Analyse du profil manufacturier...",
      "Scoring VITAA — 5 piliers...",
      "Calcul du Triangle du Feu...",
      "Diagnostic initial complete",
    ],
  },
  2: {
    type: "thinking", lead: "CEOB",
    thinkSteps: [
      "Compilation des donnees brutes...",
      "Identification des gaps critiques...",
      "Generation du pre-rapport PDF...",
      "Preparation de l'invitation jumelage",
    ],
  },
  3: {
    type: "consult", lead: "CEOB",
    consultBots: ["CEOB", "CROB", "COOB"],
    consolidation: "Orbit9 — Match optimal identifie",
  },
  4: {
    type: "thinking", lead: "COOB",
    thinkSteps: [
      "Planification de la visite terrain...",
      "Evaluation de la ligne de production...",
      "Analyse des processus existants...",
      "Identification des opportunites",
    ],
  },
  5: {
    type: "consult", lead: "CEOB",
    consultBots: ["CEOB", "CTOB", "CFOB"],
    consolidation: "Rapport compile — ROI projete calcule",
  },
  6: {
    type: "thinking", lead: "CTOB",
    thinkSteps: [
      "Structuration des specs techniques...",
      "Calcul du budget detaille...",
      "Definition de l'echeancier...",
      "Attribution des responsabilites",
    ],
  },
  7: {
    type: "consult", lead: "CEOB",
    consultBots: ["CEOB", "CFOB", "CSOB"],
    consolidation: "Montage financier pret — Go Live!",
  },
};

// --- Dark Thinking Animation (same pattern as ThinkingAnimation) ---

function DarkThinkingAnim({ botCode, steps, active, onComplete }: {
  botCode: string; steps: string[]; active: boolean; onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const bot = BOT_CFG[botCode];
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) { setCurrentStep(-1); setCompletedSteps([]); return; }
    let step = 0;
    setCurrentStep(0);
    setCompletedSteps([]);
    const advance = () => {
      setCompletedSteps(prev => [...prev, step]);
      step++;
      if (step < steps.length) {
        setCurrentStep(step);
        timer = setTimeout(advance, 800 + Math.random() * 500);
      } else {
        setCurrentStep(steps.length); // done state
        onCompleteRef.current?.();
      }
    };
    let timer = setTimeout(advance, 1000 + Math.random() * 400);
    return () => clearTimeout(timer);
  }, [active, steps.length]);

  if (!active || !bot) return null;

  return (
    <div style={{
      display: "flex", gap: 10, marginTop: 16,
      opacity: currentStep >= 0 ? 1 : 0,
      transition: "opacity 0.5s",
    }}>
      {/* Bot avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", overflow: "hidden",
        border: `2px solid ${bot.color}40`, flexShrink: 0,
      }}>
        <img src={bot.avatar} alt={bot.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Thinking bubble */}
      <div style={{
        background: "white",
        border: `1px solid rgba(0,0,0,0.08)`,
        borderLeft: `3px solid ${bot.color}60`,
        borderRadius: "0 12px 12px 12px",
        padding: "10px 14px", flex: 1, minWidth: 0,
      }}>
        <div style={{ fontSize: 10, color: `${bot.color}cc`, marginBottom: 6, fontWeight: 600 }}>
          {bot.name} ({bot.role}) reflechit...
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((text, i) => {
            const isActive = i === currentStep;
            const isDone = completedSteps.includes(i);
            if (i > currentStep) return null;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 11,
                color: isActive ? bot.color : isDone ? "rgba(16,185,129,0.8)" : "rgba(15,23,42,0.3)",
                transition: "color 0.3s",
              }}>
                {/* Spinner or checkmark */}
                {isActive && (
                  <div style={{
                    width: 12, height: 12, border: `2px solid ${bot.color}`,
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "ub-rotate-slow 0.8s linear infinite", flexShrink: 0,
                  }} />
                )}
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                    <circle cx="6" cy="6" r="5" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="1.5" />
                    <polyline points="3.5,6 5.5,8 8.5,4" fill="none" stroke="rgba(16,185,129,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{
                  textDecoration: isDone ? "line-through" : "none",
                  opacity: isDone ? 0.5 : 1,
                }}>{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Dark Multi-Consult Animation (same pattern as MultiConsultAnimation) ---

function DarkConsultAnim({ botCodes, consolidation, active, onComplete }: {
  botCodes: string[]; consolidation: string; active: boolean; onComplete?: () => void;
}) {
  const [activeBot, setActiveBot] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "consulting" | "consolidating" | "done">("idle");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) { setActiveBot(-1); setPhase("idle"); return; }
    // Start consulting after delay
    const startTimer = setTimeout(() => {
      setPhase("consulting");
      setActiveBot(0);
    }, 800);
    return () => clearTimeout(startTimer);
  }, [active]);

  useEffect(() => {
    if (phase !== "consulting") return;
    if (activeBot >= botCodes.length) {
      setPhase("consolidating");
      const timer = setTimeout(() => { setPhase("done"); onCompleteRef.current?.(); }, 1200);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setActiveBot(prev => prev + 1), 900);
    return () => clearTimeout(timer);
  }, [activeBot, phase, botCodes.length]);

  if (!active || phase === "idle") return null;

  return (
    <div style={{
      marginTop: 16,
      background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(59,130,246,0.03))",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: 12, padding: "12px 14px",
      opacity: 1, transition: "opacity 0.5s",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
        fontSize: 11, fontWeight: 600,
        color: phase === "consolidating" || phase === "done"
          ? "rgba(139,92,246,0.8)" : "rgba(59,130,246,0.8)",
      }}>
        {/* Animated network icon */}
        <svg width="14" height="14" viewBox="0 0 14 14" style={{
          animation: phase === "consulting" ? "ub-carlos-pulse 1.5s infinite" : "none",
        }}>
          <circle cx="7" cy="3" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="3" cy="11" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="11" cy="11" r="2" fill="currentColor" opacity="0.6" />
          <line x1="7" y1="5" x2="3" y2="9" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <line x1="7" y1="5" x2="11" y2="9" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <line x1="3" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        </svg>
        <span>
          {phase === "consulting" ? "Consultation des departements..."
           : phase === "consolidating" ? "Consolidation des perspectives..."
           : consolidation}
        </span>
      </div>

      {/* Bot avatars row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {botCodes.map((code, i) => {
          const bot = BOT_CFG[code];
          if (!bot) return null;
          const isActive = phase === "consulting" && i === activeBot;
          const isDone = i < activeBot || phase === "consolidating" || phase === "done";
          const isPending = phase === "consulting" && i > activeBot;
          return (
            <div key={code} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              transition: "all 0.3s",
              transform: isActive ? "scale(1.1)" : "scale(1)",
              opacity: isPending ? 0.3 : 1,
            }}>
              {/* Avatar with status ring */}
              <div style={{
                position: "relative",
                width: 36, height: 36, borderRadius: "50%", overflow: "hidden",
                border: `2px solid ${isActive ? bot.color : isDone ? "#10b981" : "rgba(0,0,0,0.1)"}`,
                boxShadow: isActive ? `0 0 12px ${bot.color}40` : "none",
                transition: "all 0.3s",
              }}>
                <img src={bot.avatar} alt={bot.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    opacity: isActive ? 0.5 : 1,
                  }} />
                {/* Spinner overlay when active */}
                {isActive && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: 16, height: 16, border: `2px solid ${bot.color}`,
                      borderTopColor: "transparent", borderRadius: "50%",
                      animation: "ub-rotate-slow 0.8s linear infinite",
                    }} />
                  </div>
                )}
              </div>
              {/* Name */}
              <span style={{
                fontSize: 9, fontWeight: 600,
                color: isDone ? "rgba(16,185,129,0.7)" : `${bot.color}aa`,
              }}>
                {bot.name}
              </span>
              {/* Done checkmark */}
              {isDone && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="4" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="1.2" />
                  <polyline points="3,5 4.5,6.5 7,3.5" fill="none" stroke="rgba(16,185,129,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          );
        })}

        {/* Consolidation arrow + zap */}
        {(phase === "consolidating" || phase === "done") && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, marginLeft: 8,
            animation: phase === "consolidating" ? "ub-carlos-pulse 1s infinite" : "none",
            color: "rgba(139,92,246,0.7)",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 8h8M9 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M9 2L5 8h4l-2 6 6-8H9l2-4z" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Unified BotReflectionViz component ---

function BotReflectionViz({ stepNum, active, onComplete }: { stepNum: number; active: boolean; onComplete?: () => void }) {
  const config = STEP_REFLECTIONS[stepNum];
  if (!config) return null;

  if (config.type === "thinking" && config.thinkSteps) {
    return (
      <DarkThinkingAnim
        botCode={config.lead}
        steps={config.thinkSteps}
        active={active}
        onComplete={onComplete}
      />
    );
  }

  if (config.type === "consult" && config.consultBots) {
    return (
      <DarkConsultAnim
        botCodes={config.consultBots}
        consolidation={config.consolidation || "Consolidation complete"}
        active={active}
        onComplete={onComplete}
      />
    );
  }

  return null;
}

// ════════════════════════════════════════════════════════════════
// STEP RESULT DATA — Per-step output badges
// ════════════════════════════════════════════════════════════════

const STEP_RESULTS: Record<number, { label: string; value: string; detail: string; emoji: string }> = {
  1: { label: "Diagnostic", value: "72/100", detail: "Triangle du Feu: COUVE", emoji: "🎯" },
  2: { label: "Livrable", value: "PRE-RAPPORT", detail: "Gaps critiques identifies", emoji: "📋" },
  3: { label: "Match Orbit9", value: "94%", detail: "Equipementier A identifie", emoji: "🤝" },
  4: { label: "Visite", value: "Complete", detail: "12 photos + mesures + notes", emoji: "🏭" },
  5: { label: "ROI projete", value: "340%", detail: "Payback: 14 mois", emoji: "📊" },
  6: { label: "Cahier", value: "$485K", detail: "Specs + echeancier + jalons", emoji: "📓" },
  7: { label: "Statut", value: "GO LIVE!", detail: "Financement + suivi CarlOS", emoji: "🚀" },
};

// ════════════════════════════════════════════════════════════════
// ACT RESULT BADGE — Shows after process scene completes
// ════════════════════════════════════════════════════════════════

function ActResultBadge({ stepNum, color, visible }: { stepNum: number; color: string; visible: boolean }) {
  const result = STEP_RESULTS[stepNum];
  if (!result) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: `linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))`,
      border: "1px solid rgba(16,185,129,0.2)",
      borderRadius: 10, padding: "8px 14px", marginTop: 10,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.97)",
      transition: "all 0.5s ease-out",
    }}>
      <span style={{ fontSize: 18 }}>{result.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 8, color: "rgba(16,185,129,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            {result.label}
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color }}>
            {result.value}
          </span>
        </div>
        <div style={{ fontSize: 9, color: "rgba(15,23,42,0.35)", marginTop: 1 }}>
          {result.detail}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
        <polyline points="5,8 7.5,10.5 11,5.5" fill="none" stroke="rgba(16,185,129,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// THREE ACT SCENE — Condensed 3-phase simulation per step
// Act 1: Bot reflexion (ThinkingAnim or ConsultAnim)
// Act 2: Process visualization (StepProcessScene)
// Act 3: Result badge
// Triggered ONLY on scroll into viewport — plays sequentially
// ════════════════════════════════════════════════════════════════

function ThreeActScene({ stepNum, active, color, colorRgb }: {
  stepNum: number; active: boolean; color: string; colorRgb: string;
}) {
  const [currentAct, setCurrentAct] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!active) { setCurrentAct(0); return; }
    // Start Act 1 after a small delay (let card entrance animation finish)
    const t = setTimeout(() => setCurrentAct(1), 500);
    return () => clearTimeout(t);
  }, [active]);

  const handleAct1Done = useCallback(() => {
    setTimeout(() => setCurrentAct(2), 300);
  }, []);

  const handleAct2Done = useCallback(() => {
    setTimeout(() => setCurrentAct(3), 200);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ACT 1 — Bot reflexion */}
      <div style={{
        opacity: currentAct >= 1 ? 1 : 0,
        transition: "opacity 0.4s",
      }}>
        <div style={{
          fontSize: 7, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: 2, color: "rgba(15,23,42,0.2)", marginBottom: 2,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: `${color}60` }}>①</span>
          Analyse
        </div>
        <BotReflectionViz stepNum={stepNum} active={currentAct >= 1} onComplete={handleAct1Done} />
      </div>

      {/* ACT 2 — Process visualization */}
      <div style={{
        opacity: currentAct >= 2 ? 1 : 0,
        transition: "opacity 0.5s",
        marginTop: currentAct >= 2 ? 8 : 0,
      }}>
        <div style={{
          fontSize: 7, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: 2, color: "rgba(15,23,42,0.2)", marginBottom: 2,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: `${color}60` }}>②</span>
          Processus
        </div>
        <StepProcessScene stepNum={stepNum} active={currentAct >= 2} color={color} colorRgb={colorRgb} onComplete={handleAct2Done} />
      </div>

      {/* ACT 3 — Result badge */}
      <ActResultBadge stepNum={stepNum} color={color} visible={currentAct >= 3} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP PROCESS SCENE — Rich illustrated process for each step
// Shows the actual work: manufacturer, CarlOS, bots, data flows
// ════════════════════════════════════════════════════════════════

function BotAvatarSmall({ code, size = 28, glow = false }: { code: string; size?: number; glow?: boolean }) {
  const bot = BOT_CFG[code];
  if (!bot) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      border: `2px solid ${bot.color}50`, flexShrink: 0,
      boxShadow: glow ? `0 0 10px ${bot.color}40` : "none",
    }}>
      <img src={bot.avatar} alt={bot.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

function StepProcessScene({ stepNum, active, color, colorRgb, onComplete }: {
  stepNum: number; active: boolean; color: string; colorRgb: string; onComplete?: () => void;
}) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 6; i++) {
      timers.push(setTimeout(() => {
        setPhase(i);
        if (i === 6) onCompleteRef.current?.();
      }, 400 + i * 600));
    }
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const W = 280, H = 160;

  // Step 1 — Conversation CarlOS <-> Manufacturer + VITAA scoring
  if (stepNum === 1) {
    const vitaaLabels = ["V", "I", "T", "A", "A"];
    const scores = [85, 62, 78, 45, 90];
    const cx = 200, cy = 70, r = 35;
    const scorePoints = scores.map((s, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const sr = r * (s / 100);
      return `${cx + Math.cos(angle) * sr},${cy + Math.sin(angle) * sr}`;
    });
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* Avatars */}
        <div style={{ position: "absolute", left: 8, top: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
          <span style={{ fontSize: 8, color: "rgba(15,23,42,0.4)", fontWeight: 600 }}>Manufacturier</span>
        </div>
        <div style={{ position: "absolute", left: 100, top: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <BotAvatarSmall code="CEOB" size={40} glow={phase >= 1} />
          <span style={{ fontSize: 8, color: "rgba(59,130,246,0.6)", fontWeight: 600 }}>CarlOS</span>
        </div>
        {/* Chat bubbles */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", top: 65 + i * 22,
            left: i % 2 === 0 ? 12 : 52,
            background: i % 2 === 0 ? "rgba(0,0,0,0.03)" : `${color}15`,
            border: `1px solid ${i % 2 === 0 ? "rgba(0,0,0,0.08)" : `${color}30`}`,
            borderRadius: 8, padding: "3px 10px", fontSize: 8, color: "rgba(15,23,42,0.5)",
            opacity: phase > i ? 1 : 0, transform: phase > i ? "translateX(0)" : `translateX(${i % 2 === 0 ? -10 : 10}px)`,
            transition: `all 0.4s ease-out`,
          }}>
            {["Situation actuelle?", "Analyse en cours...", "Resultats VITAA"][i]}
          </div>
        ))}
        {/* VITAA Radar */}
        <svg viewBox={`140 20 120 100`} style={{ position: "absolute", right: 0, top: 0, width: 140, height: 120 }}>
          {vitaaLabels.map((_, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r}
              stroke={`rgba(${colorRgb},0.12)`} strokeWidth="0.5" />;
          })}
          <polygon points={vitaaLabels.map((_, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
          }).join(" ")} fill="none" stroke={`rgba(${colorRgb},0.15)`} strokeWidth="0.5" />
          <polygon points={scorePoints.join(" ")} fill={`rgba(${colorRgb},0.12)`} stroke={color} strokeWidth="1.2"
            strokeDasharray="200" strokeDashoffset={phase >= 3 ? "0" : "200"}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
          {vitaaLabels.map((l, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            return <text key={i} x={cx + Math.cos(angle) * (r + 10)} y={cy + Math.sin(angle) * (r + 10)}
              fill={`rgba(${colorRgb},0.5)`} fontSize="7" fontWeight="700" textAnchor="middle" dominantBaseline="central">{l}</text>;
          })}
        </svg>
        {/* Score result */}
        <div style={{
          position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center",
          opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          <span style={{ fontSize: 9, color: "rgba(15,23,42,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Score global</span>
          <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 2 }}>
            {phase >= 4 ? "72/100" : ""}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 4 }}>
            {["🔥", "🔥", "🟡"].map((e, i) => (
              <span key={i} style={{ fontSize: 10, opacity: phase >= 5 ? 1 : 0, transition: `opacity 0.3s ${i * 0.15}s` }}>{e}</span>
            ))}
            <span style={{ fontSize: 8, color: "rgba(15,23,42,0.3)", marginLeft: 4, opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s 0.5s" }}>
              Triangle du Feu: COUVE
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — Pre-rapport generation: document assembly + gaps
  if (stepNum === 2) {
    const sections = ["Profil entreprise", "Diagnostic VITAA", "Gaps critiques", "Recommandations", "Invitation jumelage"];
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* CarlOS generating */}
        <div style={{ position: "absolute", left: 8, top: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <BotAvatarSmall code="CEOB" size={28} glow={phase >= 1} />
          <span style={{ fontSize: 9, color: `rgba(${colorRgb},0.6)`, fontWeight: 600 }}>
            {phase < 4 ? "Generation en cours..." : "Rapport genere!"}
          </span>
        </div>
        {/* Document being assembled */}
        <div style={{
          position: "absolute", left: "50%", top: 45, transform: "translateX(-50%)",
          width: 160, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 8, padding: "8px 10px", overflow: "hidden",
        }}>
          {/* Scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
            animation: phase >= 1 && phase < 4 ? "ub-scanY 2.5s ease-in-out infinite" : "none",
            opacity: phase >= 1 && phase < 4 ? 0.8 : 0,
          }} />
          {sections.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "3px 0",
              opacity: phase > i ? 1 : 0,
              transform: phase > i ? "translateX(0)" : "translateX(-15px)",
              transition: `all 0.4s ease-out`,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i === 2 ? "#ef4444" : color, opacity: 0.7,
              }} />
              <span style={{ fontSize: 8, color: i === 2 ? "rgba(239,68,68,0.7)" : "rgba(15,23,42,0.4)", fontWeight: i === 2 ? 700 : 400 }}>
                {s}
              </span>
              {phase > i + 1 && (
                <svg width="8" height="8" viewBox="0 0 8 8" style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <polyline points="1.5,4 3,5.5 6.5,2.5" fill="none" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
        {/* PDF badge + invitation */}
        <div style={{
          position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 12, alignItems: "center",
          opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          <div style={{
            background: `${color}20`, border: `1px solid ${color}40`,
            borderRadius: 6, padding: "4px 12px", fontSize: 9, fontWeight: 700, color,
          }}>📄 PRE-RAPPORT.PDF</div>
          <div style={{
            background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 6, padding: "4px 12px", fontSize: 9, fontWeight: 700, color: "#06b6d4",
          }}>✉️ INVITATION</div>
        </div>
      </div>
    );
  }

  // Step 3 — Orbit9 Matching: network graph connecting manufacturer to suppliers
  if (stepNum === 3) {
    const suppliers = [
      { name: "Equip. A", x: 200, y: 30 },
      { name: "Integ. B", x: 230, y: 90 },
      { name: "Fourniss. C", x: 195, y: 150 },
    ];
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* Manufacturer node */}
        <div style={{ position: "absolute", left: 20, top: 70, textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: `${color}15`, border: `2px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto",
            boxShadow: phase >= 1 ? `0 0 15px ${color}30` : "none", transition: "box-shadow 0.5s",
          }}>🏭</div>
          <span style={{ fontSize: 7, color: "rgba(15,23,42,0.3)", marginTop: 2, display: "block" }}>Manufacturier</span>
        </div>
        {/* Orbit9 center */}
        <div style={{
          position: "absolute", left: 110, top: 78,
          width: 30, height: 30, borderRadius: "50%",
          background: `${color}10`, border: `1px dashed ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: `${color}80`, fontWeight: 800,
          animation: phase >= 2 ? "ub-carlos-pulse 2s infinite" : "none",
        }}>O9</div>
        {/* Connection lines (SVG overlay) */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${W} ${H}`}>
          {/* Mfg → Orbit9 */}
          <line x1="65" y1="92" x2="110" y2="93" stroke={color} strokeWidth="1" opacity={phase >= 2 ? 0.4 : 0}
            strokeDasharray="4,3" style={{ transition: "opacity 0.5s" }} />
          {/* Orbit9 → Suppliers */}
          {suppliers.map((s, i) => (
            <line key={i} x1="140" y1="93" x2={s.x} y2={s.y + 12} stroke={color} strokeWidth="1"
              opacity={phase >= 3 + i ? 0.4 : 0} strokeDasharray="4,3" style={{ transition: `opacity 0.5s ${i * 0.3}s` }} />
          ))}
          {/* Match highlight line */}
          {phase >= 5 && (
            <line x1="65" y1="92" x2={suppliers[0].x} y2={suppliers[0].y + 12}
              stroke="#10b981" strokeWidth="2" opacity="0.6" strokeDasharray="6,3" />
          )}
        </svg>
        {/* Supplier nodes */}
        {suppliers.map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: s.x - 18, top: s.y, textAlign: "center",
            opacity: phase >= 3 + i ? 1 : 0.15, transition: `opacity 0.5s ${i * 0.3}s`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: phase >= 5 && i === 0 ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.03)",
              border: `1.5px solid ${phase >= 5 && i === 0 ? "#10b981" : "rgba(0,0,0,0.08)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, margin: "0 auto",
            }}>🔧</div>
            <span style={{ fontSize: 6, color: "rgba(15,23,42,0.3)", display: "block", marginTop: 2 }}>{s.name}</span>
          </div>
        ))}
        {/* Bots overseeing */}
        <div style={{
          position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4,
          opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          {["CEOB", "CROB", "COOB"].map(c => <BotAvatarSmall key={c} code={c} size={22} />)}
        </div>
        {/* Match result */}
        {phase >= 5 && (
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            fontSize: 8, color: "#10b981", fontWeight: 700,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 6, padding: "3px 8px",
          }}>✓ Match 94% — Equip. A</div>
        )}
      </div>
    );
  }

  // Step 4 — Visite d'usine: factory floor with scanning/checkpoints
  if (stepNum === 4) {
    const checkpoints = [
      { label: "Reception", x: 30, y: 50 },
      { label: "Ligne 1", x: 90, y: 50 },
      { label: "Ligne 2", x: 150, y: 50 },
      { label: "Expedit.", x: 210, y: 50 },
    ];
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* Factory floor grid */}
        <svg viewBox={`0 0 ${W} 100`} style={{ position: "absolute", top: 30, left: 0, width: "100%", height: 100 }}>
          {/* Floor grid */}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1="20" y1={20 + i * 15} x2="250" y2={20 + i * 15}
              stroke={`rgba(${colorRgb},0.06)`} strokeWidth="0.5" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={20 + i * 26} y1="20" x2={20 + i * 26} y2="95"
              stroke={`rgba(${colorRgb},0.06)`} strokeWidth="0.5" />
          ))}
          {/* Checkpoint zones */}
          {checkpoints.map((cp, i) => (
            <g key={i}>
              <rect x={cp.x} y={cp.y} width="45" height="28" rx="4"
                fill={phase > i ? `rgba(${colorRgb},0.08)` : "rgba(0,0,0,0.02)"}
                stroke={phase > i ? `${color}40` : "rgba(0,0,0,0.06)"} strokeWidth="0.8"
                style={{ transition: "all 0.5s" }} />
              <text x={cp.x + 22} y={cp.y + 17} fill={phase > i ? `${color}aa` : "rgba(15,23,42,0.2)"}
                fontSize="6" fontWeight="600" textAnchor="middle" style={{ transition: "fill 0.5s" }}>{cp.label}</text>
              {phase > i + 1 && (
                <circle cx={cp.x + 40} cy={cp.y + 5} r="4" fill="#10b981" opacity="0.7">
                  <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="1" />
                </circle>
              )}
            </g>
          ))}
          {/* Scan line */}
          {phase >= 1 && phase < 5 && (
            <line x1="0" y1="0" x2="0" y2="100" stroke={color} strokeWidth="1.5" opacity="0.3">
              <animateMotion dur="4s" repeatCount="indefinite" path="M20,0 L250,0" />
            </line>
          )}
        </svg>
        {/* Walking team */}
        <div style={{
          position: "absolute", top: 8, left: 8, display: "flex", gap: 6, alignItems: "center",
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${color}20`, border: `1.5px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👤</div>
          <span style={{ fontSize: 7, color: "rgba(15,23,42,0.3)" }}>+</span>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.03)", border: "1.5px solid rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🔧</div>
          <BotAvatarSmall code="COOB" size={24} glow={phase >= 2} />
        </div>
        {/* Measurement badges */}
        <div style={{
          position: "absolute", bottom: 10, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 8,
          opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          {["📸 12 photos", "📏 Mesures OK", "📋 Notes terrain"].map((badge, i) => (
            <span key={i} style={{
              fontSize: 7, padding: "2px 8px", borderRadius: 4,
              background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)",
              color: "rgba(15,23,42,0.4)",
              opacity: phase >= 4 + i * 0.5 ? 1 : 0, transition: `opacity 0.3s ${i * 0.15}s`,
            }}>{badge}</span>
          ))}
        </div>
      </div>
    );
  }

  // Step 5 — Rapport complet: multi-source analysis + charts
  if (stepNum === 5) {
    const bars = [65, 45, 80, 55, 90];
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* Bot team analyzing */}
        <div style={{
          position: "absolute", top: 8, right: 8, display: "flex", gap: 4,
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          {["CEOB", "CTOB", "CFOB"].map((c, i) => (
            <div key={c} style={{ opacity: phase >= 1 + i ? 1 : 0.3, transition: `opacity 0.4s ${i * 0.3}s` }}>
              <BotAvatarSmall code={c} size={24} glow={phase >= 2 + i} />
            </div>
          ))}
        </div>
        {/* Data streams flowing in */}
        <div style={{ position: "absolute", left: 8, top: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {["Visite terrain", "Diagnostic VITAA", "Donnees marche"].map((src, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 4,
              opacity: phase > i ? 1 : 0, transform: phase > i ? "translateX(0)" : "translateX(-10px)",
              transition: `all 0.4s`,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.5 }} />
              <span style={{ fontSize: 7, color: "rgba(15,23,42,0.3)" }}>{src}</span>
              <div style={{
                width: 20, height: 1, background: `linear-gradient(90deg, ${color}40, transparent)`,
              }} />
            </div>
          ))}
        </div>
        {/* Chart area */}
        <svg viewBox="0 0 200 90" style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", width: 220, height: 90 }}>
          {/* Axis */}
          <line x1="20" y1="75" x2="180" y2="75" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
          <line x1="20" y1="10" x2="20" y2="75" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
          {/* Bars */}
          {bars.map((v, i) => {
            const bh = (v / 100) * 55;
            const bx = 30 + i * 30;
            return <rect key={i} x={bx} y={phase >= 3 ? 75 - bh : 75} width="18" height={phase >= 3 ? bh : 0} rx="2"
              fill={`rgba(${colorRgb},0.25)`} stroke={`${color}60`} strokeWidth="0.5"
              style={{ transition: `all 0.5s ease-out ${i * 0.12}s` }} />;
          })}
          {/* Trend line */}
          <polyline points={bars.map((v, i) => `${39 + i * 30},${75 - (v / 100) * 55}`).join(" ")}
            fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="200" strokeDashoffset={phase >= 4 ? "0" : "200"}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
        </svg>
        {/* ROI result */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 12, alignItems: "center",
          opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, color: "rgba(15,23,42,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>ROI projete</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>340%</div>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.08)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, color: "rgba(15,23,42,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Payback</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>14 mois</div>
          </div>
        </div>
      </div>
    );
  }

  // Step 6 — Cahier de projet: sections assembling + timeline
  if (stepNum === 6) {
    const cahierSections = ["Specs techniques", "Echeancier", "Budget", "Responsabilites", "Jalons"];
    const milestones = ["Kick-off", "Phase 1", "Phase 2", "Livraison"];
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* CTO structuring */}
        <div style={{ position: "absolute", right: 8, top: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <BotAvatarSmall code="CTOB" size={24} glow={phase >= 1} />
          <span style={{ fontSize: 8, color: "rgba(139,92,246,0.6)", fontWeight: 600 }}>Structure le cahier...</span>
        </div>
        {/* Notebook sections stacking */}
        <div style={{
          position: "absolute", left: 15, top: 40, width: 110,
        }}>
          {cahierSections.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", marginBottom: 2,
              background: phase > i ? `rgba(${colorRgb},0.06)` : "transparent",
              border: `1px solid ${phase > i ? `${color}25` : "transparent"}`,
              borderRadius: 4,
              opacity: phase > i ? 1 : 0.15,
              transform: phase > i ? "translateX(0) scale(1)" : "translateX(-8px) scale(0.95)",
              transition: `all 0.4s ease-out`,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: 1, background: color, opacity: 0.5 }} />
              <span style={{ fontSize: 7, color: "rgba(15,23,42,0.4)" }}>{s}</span>
              {phase > i + 1 && <span style={{ fontSize: 7, marginLeft: "auto", color: "#10b981" }}>✓</span>}
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div style={{ position: "absolute", right: 10, top: 50, width: 130 }}>
          <svg viewBox="0 0 130 80" style={{ width: "100%", height: 80 }}>
            {/* Timeline line */}
            <line x1="10" y1="15" x2="120" y2="15" stroke={`rgba(${colorRgb},0.15)`} strokeWidth="1" />
            {/* Progress fill */}
            <line x1="10" y1="15" x2={phase >= 5 ? "120" : "10"} y2="15" stroke={color} strokeWidth="1.5"
              strokeDasharray="110" strokeDashoffset={phase >= 4 ? "0" : "110"}
              style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
            {/* Milestone nodes */}
            {milestones.map((m, i) => {
              const mx = 10 + (i / (milestones.length - 1)) * 110;
              return (
                <g key={i}>
                  <circle cx={mx} cy="15" r={phase >= 4 + i * 0.3 ? 4 : 2.5}
                    fill={phase >= 4 + i * 0.3 ? color : "rgba(0,0,0,0.1)"}
                    style={{ transition: "all 0.4s" }} />
                  <text x={mx} y="28" fill="rgba(15,23,42,0.3)" fontSize="5" textAnchor="middle">{m}</text>
                </g>
              );
            })}
          </svg>
        </div>
        {/* Budget bar */}
        <div style={{
          position: "absolute", bottom: 12, left: 15, right: 15,
          opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 7, color: "rgba(15,23,42,0.3)" }}>Budget alloue</span>
            <span style={{ fontSize: 7, color, fontWeight: 700 }}>$485,000</span>
          </div>
          <div style={{ height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}80)`,
              width: phase >= 5 ? "100%" : "0%", transition: "width 1s ease-out",
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Step 7 — Financement & Go-Live: money flow + implementation progress
  if (stepNum === 7) {
    const programs = ["MESI", "BDC", "DEC", "Desjardins"];
    return (
      <div style={{ position: "relative", height: H, opacity: active ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>
        {/* Bot team */}
        <div style={{
          position: "absolute", top: 8, left: 8, display: "flex", gap: 4,
          opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          {["CEOB", "CFOB", "CSOB"].map((c, i) => (
            <div key={c} style={{ opacity: phase >= 1 + i ? 1 : 0.3, transition: `opacity 0.4s ${i * 0.3}s` }}>
              <BotAvatarSmall code={c} size={22} glow={phase >= 2 + i} />
            </div>
          ))}
        </div>
        {/* Funding programs flowing in */}
        <div style={{ position: "absolute", right: 10, top: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          {programs.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 4,
              opacity: phase > i ? 1 : 0, transform: phase > i ? "translateX(0)" : "translateX(10px)",
              transition: `all 0.4s`,
            }}>
              <span style={{ fontSize: 7, color: "rgba(15,23,42,0.4)", padding: "1px 6px",
                background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 3 }}>{p}</span>
              <span style={{ fontSize: 9, color: `${color}80` }}>💰</span>
            </div>
          ))}
        </div>
        {/* Implementation progress */}
        <div style={{
          position: "absolute", left: 15, top: 80, right: 15,
          opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s",
        }}>
          <div style={{ fontSize: 8, color: "rgba(15,23,42,0.3)", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>
            Implantation
          </div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.05)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: `linear-gradient(90deg, ${color}, #10b981)`,
              width: phase >= 5 ? "100%" : phase >= 4 ? "60%" : "0%",
              transition: "width 1.5s ease-out",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 6, color: "rgba(15,23,42,0.2)" }}>Demarrage</span>
            <span style={{ fontSize: 6, color: "rgba(15,23,42,0.2)" }}>Go Live</span>
          </div>
        </div>
        {/* CarlOS monitoring dashboard */}
        <div style={{
          position: "absolute", bottom: 10, left: 15, right: 15,
          background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: 6, padding: "6px 10px",
          opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.5s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
            <BotAvatarSmall code="CEOB" size={16} />
            <span style={{ fontSize: 7, color: "rgba(59,130,246,0.6)", fontWeight: 600 }}>Suivi en temps reel</span>
            <span style={{
              marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
              background: "#10b981", animation: "ub-carlos-pulse 2s infinite",
            }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ l: "Budget", v: "92%", c: "#10b981" }, { l: "Delai", v: "OK", c: color }, { l: "Qualite", v: "A+", c: "#f59e0b" }].map(kpi => (
              <div key={kpi.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: kpi.c }}>{phase >= 5 ? kpi.v : "..."}</div>
                <div style={{ fontSize: 6, color: "rgba(15,23,42,0.25)" }}>{kpi.l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* GO LIVE celebration */}
        {phase >= 6 && (
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: `rgba(${colorRgb},0.1)`, border: `1px solid ${color}40`,
            borderRadius: 12, padding: "8px 20px", textAlign: "center",
            animation: "ub-banner-reveal 0.6s ease-out",
          }}>
            <div style={{ fontSize: 20 }}>🚀</div>
            <div style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 2 }}>GO LIVE!</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ════════════════════════════════════════════════════════════════
// STEP CARD V3 — Two-column layout: info left + process scene right
// ════════════════════════════════════════════════════════════════

function FlowStepCardV2({
  step, index, visible, canvasRef,
}: {
  step: FlowStep; index: number; visible: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  const isEven = index % 2 === 1;

  return (
    <div
      data-step-idx={index}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        marginBottom: 60,
        position: "relative",
        opacity: visible ? 1 : 0,
        zIndex: 3,
        transform: visible
          ? "translateY(0) translateX(0)"
          : isEven ? "translateY(30px) translateX(40px)" : "translateY(30px) translateX(-40px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        flexDirection: isEven ? "row-reverse" : "row",
      }}
    >
      <StepNodeV2 step={step} visible={visible} canvasRef={canvasRef} />
      <div style={{ flex: 1 }}>
        <TiltCard color={step.color}>
          <div style={{ display: "flex", gap: 24 }}>
            {/* LEFT COLUMN — Step info */}
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              {/* Phase label */}
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 4, color: step.color, marginBottom: 8,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  width: 20, height: 1,
                  background: `linear-gradient(90deg, ${step.color}, transparent)`,
                  display: "inline-block",
                }} />
                {step.label}
              </div>
              {/* Title with typewriter */}
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 10, lineHeight: 1.3 }}>
                <TypewriterText text={step.title} active={visible} speed={25} />
              </div>
              {/* Description */}
              <div style={{
                fontSize: 13, color: "rgba(15,23,42,0.5)", lineHeight: 1.7,
                opacity: visible ? 1 : 0,
                transition: "opacity 0.8s ease-out 0.6s",
              }}>
                {step.desc}
              </div>
              {/* Pills with stagger */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14,
              }}>
                {step.pills.map((pill, pi) => (
                  <span key={pill} style={{
                    fontSize: 10, padding: "4px 12px", borderRadius: 20,
                    background: `rgba(${step.colorRgb}, 0.1)`,
                    color: step.color,
                    border: `1px solid rgba(${step.colorRgb}, 0.25)`,
                    fontWeight: 500,
                    backdropFilter: "blur(8px)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: `all 0.5s ease-out ${0.4 + pi * 0.1}s`,
                  }}>
                    {pill}
                  </span>
                ))}
              </div>
              {step.carlosBadge && <CarlosBadgeV2 text={step.carlosBadge} visible={visible} />}
            </div>

            {/* DIVIDER */}
            <div style={{
              width: 1, alignSelf: "stretch",
              background: `linear-gradient(180deg, transparent, rgba(${step.colorRgb},0.15), transparent)`,
            }} />

            {/* RIGHT COLUMN — 3-Act condensed simulation */}
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
              {/* Scene title */}
              <div style={{
                fontSize: 8, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 2, color: `rgba(${step.colorRgb},0.4)`, marginBottom: 6,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: step.color, opacity: 0.5 }} />
                Processus en action
              </div>
              {/* Three-act condensed simulation */}
              <ThreeActScene stepNum={step.num} active={visible} color={step.color} colorRgb={step.colorRgb} />
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ════════════════════════════════════════════════════════════════

function ScrollProgressBar({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  // Calculate which step we're at
  const stepProgress = Math.min(Math.floor(progress * STEPS.length), STEPS.length - 1);
  const currentColor = STEPS[stepProgress]?.color || "#3b82f6";

  return (
    <div style={{
      position: "sticky", top: 0, left: 0, right: 0, zIndex: 50,
      height: 3,
      background: "rgba(0,0,0,0.05)",
    }}>
      <div style={{
        height: "100%",
        width: `${progress * 100}%`,
        background: `linear-gradient(90deg, #3b82f6, ${currentColor})`,
        boxShadow: `0 0 10px ${currentColor}, 0 0 20px ${currentColor}40`,
        transition: "width 0.1s ease-out, background 0.3s",
        borderRadius: "0 2px 2px 0",
      }} />
      {/* Step indicators on the bar */}
      {STEPS.map((step, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${((i + 0.5) / STEPS.length) * 100}%`,
          top: -2,
          width: 7, height: 7,
          borderRadius: "50%",
          background: progress >= (i + 0.5) / STEPS.length ? step.color : "rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
          transform: "translateX(-50%)",
          transition: "background 0.3s",
          boxShadow: progress >= (i + 0.5) / STEPS.length ? `0 0 8px ${step.color}` : "none",
        }} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ENERGY BEAM SVG between nodes
// ════════════════════════════════════════════════════════════════

function EnergyBeam() {
  return (
    <div style={{
      position: "absolute", left: "50%", top: 0, bottom: 0,
      width: 4, transform: "translateX(-50%)", zIndex: 0,
    }}>
      {/* Main beam */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ec4899, #22d3ee)",
        backgroundSize: "100% 300%",
        animation: "ub-line-flow 6s linear infinite",
        borderRadius: 2,
        opacity: 0.25,
      }} />
      {/* Glow layer */}
      <div style={{
        position: "absolute", left: -6, right: -6, top: 0, bottom: 0,
        background: "linear-gradient(180deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1), rgba(6,182,212,0.1), rgba(16,185,129,0.1), rgba(245,158,11,0.1), rgba(236,72,153,0.1), rgba(34,211,238,0.1))",
        backgroundSize: "100% 300%",
        animation: "ub-line-flow 6s linear infinite",
        filter: "blur(8px)",
        borderRadius: 8,
      }} />
      {/* Traveling energy pulses */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#22d3ee"];
        return (
          <div key={i} style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            width: 10, height: 10,
            background: colors[i],
            borderRadius: "50%",
            boxShadow: `0 0 15px ${colors[i]}, 0 0 30px ${colors[i]}60`,
            animation: `ub-flow-down ${5 + i * 0.7}s linear ${i * 1.2}s infinite`,
            opacity: 0,
          }} />
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// BLUEPRINT INFOGRAPHIC between steps
// ════════════════════════════════════════════════════════════════

interface FlowStepData {
  from: string;
  process: string;
  to: string;
  icon: string;
  detail: string;
}

const FLOW_STEP_DATA: FlowStepData[] = [
  { from: "Donnees brutes", process: "Analyse VITAA", to: "Diagnostic", icon: "\u2699\uFE0F", detail: "5 piliers scores" },
  { from: "Gaps identifies", process: "Orbit9 Match", to: "Invitation", icon: "\uD83D\uDD0D", detail: "Algorithme trisociation" },
  { from: "Profils jumeles", process: "Coordination", to: "RDV terrain", icon: "\uD83D\uDCC5", detail: "Planification visite" },
  { from: "Observations", process: "Compilation IA", to: "Rapport", icon: "\uD83E\uDDE0", detail: "CarlOS analyse" },
  { from: "Analyse ROI", process: "Structuration", to: "Cahier", icon: "\uD83D\uDCC1", detail: "Specs + budget + jalon" },
  { from: "Cahier valide", process: "Montage $", to: "Go Live", icon: "\uD83D\uDE80", detail: "Programmes + suivi" },
];

function FlowStepConnector({ data, visible, colorFrom, colorTo }: {
  data: FlowStepData; visible: boolean; colorFrom: string; colorTo: string;
}) {
  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", padding: "8px 0",
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.95)",
      transition: "all 0.6s ease-out 0.3s",
      position: "relative", zIndex: 2,
    }}>
      <svg viewBox="0 0 420 60" style={{ width: "100%", height: 60 }}>
        {/* Blueprint grid background */}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="60" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 20} x2="420" y2={i * 20} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        ))}

        {/* From box */}
        <rect x="20" y="15" width="90" height="30" rx="6" fill="rgba(0,0,0,0.02)"
          stroke={colorFrom} strokeWidth="0.5" strokeDasharray="3,2" />
        <text x="65" y="34" fill="rgba(15,23,42,0.5)" fontSize="7" fontWeight="600" textAnchor="middle">
          {data.from}
        </text>

        {/* Arrow from→process */}
        <line x1="115" y1="30" x2="145" y2="30" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="4,3"
          strokeDashoffset={visible ? "0" : "30"} style={{ transition: "stroke-dashoffset 1s 0.5s" }} />
        <polygon points="143,27 150,30 143,33" fill="rgba(0,0,0,0.15)" />

        {/* Process center — diamond */}
        <rect x="155" y="10" width="110" height="40" rx="8" fill="rgba(0,0,0,0.02)"
          stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        <text x="210" y="25" fill="rgba(15,23,42,0.25)" fontSize="6" fontWeight="700" textAnchor="middle"
          style={{ textTransform: "uppercase", letterSpacing: "1px" } as React.CSSProperties}>
          {data.icon} PROCESSUS
        </text>
        <text x="210" y="40" fill="rgba(15,23,42,0.5)" fontSize="8" fontWeight="600" textAnchor="middle">
          {data.process}
        </text>

        {/* Arrow process→to */}
        <line x1="270" y1="30" x2="300" y2="30" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="4,3"
          strokeDashoffset={visible ? "0" : "30"} style={{ transition: "stroke-dashoffset 1s 0.8s" }} />
        <polygon points="298,27 305,30 298,33" fill="rgba(0,0,0,0.15)" />

        {/* To box */}
        <rect x="310" y="15" width="90" height="30" rx="6" fill="rgba(0,0,0,0.02)"
          stroke={colorTo} strokeWidth="0.5" strokeDasharray="3,2" />
        <text x="355" y="34" fill="rgba(15,23,42,0.5)" fontSize="7" fontWeight="600" textAnchor="middle">
          {data.to}
        </text>

        {/* Detail label bottom-center */}
        <text x="210" y="56" fill="rgba(15,23,42,0.2)" fontSize="6" textAnchor="middle"
          style={{ fontStyle: "italic" } as React.CSSProperties}>
          {data.detail}
        </text>
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// KPI COUNTER ROW (visible at bottom of flow)
// ════════════════════════════════════════════════════════════════

function KpiCounterRow({ visible }: { visible: boolean }) {
  const kpis = [
    { label: "Manufacturiers accompagnes", value: 130, suffix: "+", color: "#3b82f6" },
    { label: "Projets transformes", value: 47, suffix: "", color: "#10b981" },
    { label: "ROI moyen", value: 340, suffix: "%", color: "#f59e0b" },
    { label: "Emplois crees", value: 850, suffix: "+", color: "#8b5cf6" },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
      maxWidth: 800, margin: "0 auto", padding: "20px 40px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s ease-out",
    }}>
      {kpis.map((kpi) => (
        <div key={kpi.label} style={{
          textAlign: "center",
          background: "white",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          borderRadius: 16, padding: "20px 12px",
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: kpi.color, marginBottom: 4 }}>
            <AnimatedCounter target={kpi.value} active={visible} suffix={kpi.suffix} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(15,23,42,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>
            {kpi.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STYLES V2
// ════════════════════════════════════════════════════════════════

const FLOW_STYLES_V2 = `
@keyframes ub-pulse-glow {
  0%, 100% { box-shadow: 0 0 30px rgba(59,130,246,0.4); }
  50% { box-shadow: 0 0 60px rgba(59,130,246,0.8), 0 0 100px rgba(59,130,246,0.3); }
}
@keyframes ub-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes ub-line-flow {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 300%; }
}
@keyframes ub-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.05; }
}
@keyframes ub-carlos-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(59,130,246,0); }
}
@keyframes ub-flow-down {
  0% { top: -2%; opacity: 0; }
  3% { opacity: 1; }
  97% { opacity: 1; }
  100% { top: 102%; opacity: 0; }
}
@keyframes ub-banner-reveal {
  0% { opacity: 0; transform: scale(0.8) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes ub-result-shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes ub-fade-in-down {
  from { opacity: 0; transform: translateY(-40px); filter: blur(10px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes ub-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
@keyframes ub-scanline {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes ub-scanY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(70px); }
}
@keyframes ub-float-header {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes ub-rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT V2
// ════════════════════════════════════════════════════════════════

export function FlowUsineBleuePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [bannerVisible, setBannerVisible] = useState(false);
  const [headerDone, setHeaderDone] = useState(false);

  // Capture canvas ref from CanvasBackground
  const captureCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
  }, []);

  // Header entrance animation only
  useEffect(() => {
    const t = setTimeout(() => setHeaderDone(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Scroll-based reveals
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = (entry.target as HTMLElement).dataset.stepIdx;
          if (idx !== undefined) setVisibleSteps((prev) => new Set(prev).add(Number(idx)));
          if ((entry.target as HTMLElement).dataset.banner !== undefined) setBannerVisible(true);
        }
      });
    }, { threshold: 0.15, root: container });

    // Observe after a tick to ensure DOM is ready
    setTimeout(() => {
      const stepEls = container.querySelectorAll("[data-step-idx]");
      const bannerEl = container.querySelector("[data-banner]");
      stepEls.forEach((el) => observer.observe(el));
      if (bannerEl) observer.observe(bannerEl);
    }, 100);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      data-flow-container=""
      className="h-full overflow-auto"
      style={{
        background: "linear-gradient(135deg, #f8fafc, #f1f5f9, #f8fafc)",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#1e293b",
        position: "relative",
      }}
    >
      <style>{FLOW_STYLES_V2}</style>

      {/* Canvas particle system — neural network + mouse reactive */}
      <CanvasBackground containerRef={containerRef} />

      {/* Scroll progress bar */}
      <ScrollProgressBar containerRef={containerRef} />

      {/* Header — immersive entrance */}
      <div style={{
        textAlign: "center", padding: "80px 20px 60px",
        position: "relative", zIndex: 1,
        animation: "ub-fade-in-down 1.2s ease-out",
      }}>
        {/* Decorative rotating ring */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 280, height: 280,
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(59,130,246,0.12)",
          borderRadius: "50%",
          animation: "ub-rotate-slow 30s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%",
            width: 6, height: 6, background: "#3b82f6",
            borderRadius: "50%", transform: "translate(-50%, -50%)",
            boxShadow: "0 0 10px #3b82f6",
          }} />
        </div>
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 360, height: 360,
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(139,92,246,0.08)",
          borderRadius: "50%",
          animation: "ub-rotate-slow 45s linear infinite reverse",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%",
            width: 4, height: 4, background: "#8b5cf6",
            borderRadius: "50%", transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px #8b5cf6",
          }} />
        </div>

        {/* Logo */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 18, marginBottom: 28,
          animation: "ub-float-header 4s ease-in-out infinite",
          position: "relative",
        }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "ub-pulse-glow 3s infinite",
            boxShadow: "0 0 40px rgba(59,130,246,0.4), inset 0 0 20px rgba(255,255,255,0.1)",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{
            fontSize: 32, fontWeight: 900,
            background: "linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)",
            backgroundSize: "200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "ub-shimmer 3s infinite linear",
          }}>
            Usine Bleue AI
          </span>
        </div>

        <h2 style={{
          fontSize: 14, fontWeight: 500, color: "rgba(15,23,42,0.35)",
          letterSpacing: 6, textTransform: "uppercase", marginBottom: 12,
        }}>
          Ligne de transformation
        </h2>
        <h1 style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1.15,
          background: "linear-gradient(90deg, #1e293b, #3b82f6, #1e293b)",
          backgroundSize: "200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "ub-shimmer 4s infinite linear",
          opacity: headerDone ? 1 : 0,
          transition: "opacity 0.8s",
        }}>
          Du diagnostic<br />a la realisation
        </h1>
        <p style={{
          fontSize: 16, color: "rgba(15,23,42,0.35)",
          marginTop: 16, maxWidth: 550, marginInline: "auto",
          lineHeight: 1.6,
          opacity: headerDone ? 1 : 0,
          transform: headerDone ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.8s ease-out 0.3s",
        }}>
          Le parcours complet d'un manufacturier accompagne par CarlOS et le reseau Usine Bleue
        </p>
      </div>

      {/* Flow container */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 40px 40px", position: "relative", zIndex: 1 }}>
        {/* Energy beam connector */}
        <EnergyBeam />

        {/* Steps + Blueprint connectors between each */}
        {STEPS.map((step, i) => (
          <div key={step.num}>
            <FlowStepCardV2
              step={step}
              index={i}
              visible={visibleSteps.has(i)}
              canvasRef={canvasRef}
            />
            {/* Blueprint infographic between steps */}
            {i < STEPS.length - 1 && FLOW_STEP_DATA[i] && (
              <FlowStepConnector
                data={FLOW_STEP_DATA[i]}
                visible={visibleSteps.has(i) && visibleSteps.has(i + 1)}
                colorFrom={step.color}
                colorTo={STEPS[i + 1].color}
              />
            )}
          </div>
        ))}

        {/* Result Banner V2 */}
        <div
          data-banner=""
          style={{
            textAlign: "center", padding: "60px 20px 20px",
            opacity: bannerVisible ? 1 : 0,
            transform: bannerVisible ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(34,211,238,0.08))",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 24, padding: "40px 60px",
            position: "relative", overflow: "hidden",
            backdropFilter: "blur(20px)",
          }}>
            {/* Shimmer overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, transparent, rgba(16,185,129,0.05))",
              animation: "ub-result-shimmer 3s infinite",
            }} />
            {/* Rotating ring decoration */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 180, height: 180,
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(16,185,129,0.15)",
              borderRadius: "50%",
              animation: "ub-rotate-slow 20s linear infinite",
            }} />
            <div style={{ fontSize: 56, marginBottom: 16, position: "relative" }}>{"\uD83D\uDE80"}</div>
            <div style={{
              fontSize: 32, fontWeight: 900, position: "relative",
              background: "linear-gradient(90deg, #10b981, #22d3ee, #10b981)",
              backgroundSize: "200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "ub-shimmer 3s infinite linear",
            }}>
              Usine transformee
            </div>
            <div style={{ fontSize: 14, color: "rgba(15,23,42,0.4)", marginTop: 10, position: "relative" }}>
              Ligne de production automatisee, performante et connectee
            </div>
          </div>
        </div>

        {/* KPI counter row */}
        <KpiCounterRow visible={bannerVisible} />
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "40px 20px 60px", position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: 11, color: "rgba(15,23,42,0.25)", letterSpacing: 3, textTransform: "uppercase",
        }}>
          Usine Bleue AI — Propulse par GhostX & CarlOS
        </p>
      </div>
    </div>
  );
}
