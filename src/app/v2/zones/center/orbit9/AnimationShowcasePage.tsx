/**
 * AnimationShowcasePage.tsx — Laboratoire d'Animations GhostX
 * 16 concepts d'animation interactifs organises en 2 sections
 * Light premium showcase — white backgrounds, dark text, pastel accents
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════════
// STYLES (keyframes prefixed as-xxx)
// ════════════════════════════════════════════════════════════════

const KEYFRAMES = `
@keyframes as-pulse-node {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes as-rain-drop {
  0% { transform: translateY(-20px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(180px); opacity: 0; }
}
@keyframes as-scan-line {
  0% { top: 0; opacity: 1; }
  100% { top: 100%; opacity: 0.3; }
}
@keyframes as-orbit-spin {
  0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
}
@keyframes as-bar-rise {
  0% { height: 0; }
  100% { height: var(--bar-h); }
}
@keyframes as-particle-out {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
}
@keyframes as-particle-in {
  0% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
@keyframes as-tree-grow {
  0% { width: 0; }
  100% { width: var(--tw); }
}
@keyframes as-node-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes as-timeline-draw {
  0% { width: 0; }
  100% { width: 100%; }
}
@keyframes as-checkpoint-pop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes as-count-scale {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes as-flash-ring {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}
@keyframes as-expand-card {
  0% { transform: scale(0.3); opacity: 0; border-radius: 12px; }
  100% { transform: scale(1); opacity: 1; border-radius: 4px; }
}
@keyframes as-crossfade-in {
  0% { opacity: 0; transform: translateX(8px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes as-color-morph {
  0% { background: #3b82f6; }
  16% { background: #8b5cf6; }
  33% { background: #10b981; }
  50% { background: #ec4899; }
  66% { background: #ef4444; }
  83% { background: #f59e0b; }
  100% { background: #3b82f6; }
}
@keyframes as-stagger-in {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes as-portal-open {
  0% { clip-path: circle(0% at 50% 50%); }
  100% { clip-path: circle(75% at 50% 50%); }
}
@keyframes as-glow-pulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(59,130,246,0.0); }
  50% { box-shadow: 0 4px 20px rgba(59,130,246,0.5); }
}
@keyframes as-circuit-flow {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes as-circuit-flow-reverse {
  0% { stroke-dashoffset: -200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes as-circuit-node-pulse {
  0%, 100% { opacity: 0.3; r: 2; }
  50% { opacity: 1; r: 3.5; }
}
@keyframes as-circuit-glow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.0)); }
  50% { filter: drop-shadow(0 0 6px rgba(99,102,241,0.8)); }
}
@keyframes as-bg-chart-wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes as-bg-bar-breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(var(--bar-scale, 1.15)); }
}
@keyframes as-bg-dot-drift {
  0%, 100% { transform: translate(0, 0); opacity: var(--dot-base-op, 0.15); }
  33% { transform: translate(var(--dx1, 3px), var(--dy1, -2px)); opacity: calc(var(--dot-base-op, 0.15) + 0.05); }
  66% { transform: translate(var(--dx2, -2px), var(--dy2, 3px)); opacity: var(--dot-base-op, 0.15); }
}
@keyframes as-scan-down-left {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(54px); opacity: 0; }
}
@keyframes as-scan-down-right {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(53px); opacity: 0; }
}
@keyframes as-eq-bounce {
  0% { transform: scaleY(0.15); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(0.3); }
}
@keyframes as-wave-flow {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  25% { transform: translateY(-4px); opacity: 0.7; }
  50% { transform: translateY(2px); opacity: 0.4; }
  75% { transform: translateY(-2px); opacity: 0.6; }
}
@keyframes as-voice-ring {
  0% { r: 28; opacity: 0.3; stroke-width: 1; }
  100% { r: 50; opacity: 0; stroke-width: 0.2; }
}
@keyframes as-level-bar {
  0% { opacity: 0.15; }
  100% { opacity: 0.7; }
}
@keyframes as-particle-rise {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 0.8; }
  85% { opacity: 0.6; }
  100% { transform: translateY(var(--rise-y, -30px)); opacity: 0; }
}
`;

// ════════════════════════════════════════════════════════════════
// SHARED STYLES
// ════════════════════════════════════════════════════════════════

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 14,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

const demoAreaStyle: React.CSSProperties = {
  width: "100%",
  height: 220,
  position: "relative",
  overflow: "hidden",
  background: "#f1f5f9",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  width: 26,
  height: 26,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 800,
  color: "#fff",
  zIndex: 5,
};

const replayBtnStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 8,
  right: 8,
  fontSize: 10,
  padding: "3px 10px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.85)",
  color: "rgba(15,23,42,0.6)",
  border: "1px solid rgba(0,0,0,0.12)",
  cursor: "pointer",
  zIndex: 5,
  transition: "all 0.2s",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const infoAreaStyle: React.CSSProperties = {
  padding: "14px 16px",
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: 4,
};

const descStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(15,23,42,0.5)",
  lineHeight: 1.5,
};

// ════════════════════════════════════════════════════════════════
// 1. NEURAL THINKING
// ════════════════════════════════════════════════════════════════

function Demo01NeuralThinking() {
  const [active, setActive] = useState(false);
  const [lit, setLit] = useState<number[]>([]);
  const nodes = [
    { x: 40, y: 50 }, { x: 100, y: 30 }, { x: 160, y: 60 }, { x: 220, y: 35 },
    { x: 70, y: 110 }, { x: 130, y: 100 }, { x: 190, y: 120 }, { x: 250, y: 90 },
    { x: 50, y: 165 }, { x: 120, y: 170 }, { x: 180, y: 155 }, { x: 240, y: 170 },
  ];
  const connections = [
    [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 7],
    [4, 5], [5, 6], [6, 7], [4, 8], [5, 9], [6, 10], [7, 11],
    [8, 9], [9, 10], [10, 11],
  ];

  useEffect(() => {
    if (!active) { setLit([]); return; }
    let idx = 0;
    const iv = setInterval(() => {
      if (idx >= nodes.length) { idx = 0; setLit([]); return; }
      setLit((prev) => [...prev, idx]);
      idx++;
    }, 180);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => setActive(!active)}>
        <div style={badgeStyle}>1</div>
        <svg width="280" height="200" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}>
          {connections.map(([a, b], i) => {
            const litBoth = lit.includes(a) && lit.includes(b);
            return (
              <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
                stroke={litBoth ? "rgba(139,92,246,0.7)" : "rgba(0,0,0,0.1)"}
                strokeWidth={litBoth ? 2 : 1}
                style={{ transition: "all 0.3s" }}
              />
            );
          })}
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={lit.includes(i) ? 7 : 4}
              fill={lit.includes(i) ? "#818cf8" : "rgba(0,0,0,0.12)"}
              style={{
                transition: "all 0.25s",
                filter: lit.includes(i) ? "drop-shadow(0 0 6px rgba(129,140,248,0.8))" : "none",
              }}
            />
          ))}
        </svg>
        {!active && (
          <span style={{ color: "rgba(15,23,42,0.35)", fontSize: 11, zIndex: 2, position: "relative", top: 80 }}>
            Cliquer pour activer
          </span>
        )}
        {active && <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); setActive(false); setTimeout(() => setActive(true), 50); }}>Replay</div>}
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Neural Thinking</div>
        <div style={descStyle}>Reseau neuronal pulsant quand CarlOS reflechit. Les noeuds s'allument progressivement.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 2. DATA STREAM WATERFALL
// ════════════════════════════════════════════════════════════════

function Demo02DataStream() {
  const [drops, setDrops] = useState<{ id: number; x: number; char: string; delay: number; speed: number; color: string }[]>([]);
  const idRef = useRef(0);
  const colors = ["#3b82f6", "#8b5cf6", "#6366f1", "#a78bfa", "#60a5fa"];
  const chars = "01ABCDEF23456789GHML".split("");

  useEffect(() => {
    const iv = setInterval(() => {
      const newDrops = Array.from({ length: 3 }, () => {
        idRef.current++;
        return {
          id: idRef.current,
          x: Math.random() * 260 + 10,
          char: chars[Math.floor(Math.random() * chars.length)],
          delay: Math.random() * 0.5,
          speed: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
      setDrops((prev) => [...prev.slice(-60), ...newDrops]);
    }, 200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle}>
        <div style={badgeStyle}>2</div>
        {drops.map((d) => (
          <span key={d.id} style={{
            position: "absolute",
            left: d.x,
            top: -20,
            color: d.color,
            fontSize: 12,
            fontFamily: "monospace",
            fontWeight: 600,
            opacity: 0.8,
            animation: `as-rain-drop ${d.speed}s linear ${d.delay}s forwards`,
            textShadow: `0 0 6px ${d.color}`,
          }}>
            {d.char}
          </span>
        ))}
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Data Stream Waterfall</div>
        <div style={descStyle}>Cascade de donnees style Matrix en couleurs GhostX. S'anime en continu pendant l'analyse.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3. HOLOGRAPHIC CARD REVEAL
// ════════════════════════════════════════════════════════════════

function Demo03HoloCard() {
  const [revealed, setRevealed] = useState(false);
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    if (!revealed) return;
    setScanY(0);
    const iv = setInterval(() => {
      setScanY((p) => { if (p >= 100) { clearInterval(iv); return 100; } return p + 2; });
    }, 20);
    return () => clearInterval(iv);
  }, [revealed]);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => { setRevealed(false); setTimeout(() => setRevealed(true), 50); }}>
        <div style={badgeStyle}>3</div>
        <div style={{
          width: 180, height: 140, borderRadius: 10, position: "relative", overflow: "hidden",
          background: revealed ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))" : "rgba(255,255,255,0.7)",
          border: revealed ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(0,0,0,0.08)",
          transition: "all 0.5s",
        }}>
          {revealed && (
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, transparent, #818cf8, transparent)",
              top: `${scanY}%`,
              boxShadow: "0 0 12px rgba(129,140,248,0.6)",
              transition: "top 0.02s linear",
            }} />
          )}
          <div style={{
            padding: 14,
            opacity: revealed ? Math.min(scanY / 50, 1) : 0,
            transition: "opacity 0.3s",
            transform: revealed ? "none" : "translateY(8px)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>DIAGNOSTIC</div>
            <div style={{ fontSize: 10, color: "rgba(15,23,42,0.55)", lineHeight: 1.6 }}>
              Score VITAA: 78/100<br />
              Pilier fort: Ventes<br />
              Gap: Technologie
            </div>
            <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: revealed ? "78%" : "0%",
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                transition: "width 1s ease-out 0.5s", borderRadius: 2,
              }} />
            </div>
          </div>
        </div>
        {!revealed && (
          <span style={{ position: "absolute", bottom: 30, color: "rgba(15,23,42,0.35)", fontSize: 11 }}>Cliquer pour reveler</span>
        )}
        {revealed && <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); setRevealed(false); setTimeout(() => setRevealed(true), 100); }}>Replay</div>}
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Holographic Card Reveal</div>
        <div style={descStyle}>Contenu apparait avec ligne de scan + distorsion holographique. Effet premium.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 4. ORBIT MATCHING
// ════════════════════════════════════════════════════════════════

function Demo04OrbitMatching() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setConnected(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle}>
        <div style={badgeStyle}>4</div>
        <div style={{ position: "relative", width: 200, height: 200 }}>
          {/* Center point */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,0.12)",
          }} />
          {/* Orbit ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 100, height: 100, borderRadius: "50%",
            border: "1px dashed rgba(0,0,0,0.1)",
          }} />
          {/* Dot A */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 14, height: 14, borderRadius: "50%",
            background: "#3b82f6",
            boxShadow: "0 0 10px rgba(59,130,246,0.6)",
            animation: "as-orbit-spin 3s linear infinite",
            marginLeft: -7, marginTop: -7,
          }} />
          {/* Dot B */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 14, height: 14, borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 10px rgba(16,185,129,0.6)",
            animation: "as-orbit-spin 3s linear infinite reverse",
            marginLeft: -7, marginTop: -7,
          }} />
          {/* Connection line on match */}
          {connected && (
            <svg width="200" height="200" style={{ position: "absolute", top: 0, left: 0 }}>
              <line x1="100" y1="50" x2="100" y2="150"
                stroke="url(#as-match-grad)" strokeWidth="2"
                strokeDasharray="4 3" opacity="0.7"
              />
              <defs>
                <linearGradient id="as-match-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          )}
          {connected && (
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              fontSize: 9, fontWeight: 700, color: "#a78bfa", letterSpacing: 1,
              textShadow: "0 0 8px rgba(167,139,250,0.5)",
            }}>MATCH</div>
          )}
        </div>
        <div style={replayBtnStyle} onClick={() => { setConnected(false); setTimeout(() => setConnected(true), 2500); }}>Replay</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Orbit Matching</div>
        <div style={descStyle}>Deux profils orbitent et se connectent avec une ligne d'energie. Jumelage Orbit9.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 5. SCORE BAR RISING
// ════════════════════════════════════════════════════════════════

function Demo05ScoreBar() {
  const [animate, setAnimate] = useState(false);
  const bars = [
    { label: "V", value: 82, color: "#3b82f6" },
    { label: "I", value: 65, color: "#8b5cf6" },
    { label: "T", value: 45, color: "#f59e0b" },
    { label: "A", value: 91, color: "#10b981" },
    { label: "A", value: 73, color: "#ec4899" },
  ];
  const maxH = 140;

  useEffect(() => { setTimeout(() => setAnimate(true), 300); }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => { setAnimate(false); setTimeout(() => setAnimate(true), 50); }}>
        <div style={badgeStyle}>5</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: maxH + 30, paddingBottom: 10 }}>
          {bars.map((b, i) => {
            const h = (b.value / 100) * maxH;
            const isMax = b.value === Math.max(...bars.map((x) => x.value));
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {isMax && animate && (
                  <div style={{ fontSize: 14, animation: "as-node-pop 0.5s ease-out 1.2s both" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M8 1 L9.5 6 L15 6 L10.5 9.5 L12 15 L8 11.5 L4 15 L5.5 9.5 L1 6 L6.5 6Z" fill="#f59e0b" opacity="0.9" />
                    </svg>
                  </div>
                )}
                <div style={{
                  width: 32, borderRadius: "6px 6px 2px 2px", overflow: "hidden",
                  background: "rgba(0,0,0,0.04)",
                  height: maxH,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                }}>
                  <div style={{
                    width: "100%",
                    height: animate ? h : 0,
                    background: `linear-gradient(to top, ${b.color}, ${b.color}bb)`,
                    borderRadius: "4px 4px 0 0",
                    transition: `height 0.8s ease-out ${i * 0.15}s`,
                    boxShadow: animate ? `0 0 8px ${b.color}55` : "none",
                  }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(15,23,42,0.5)" }}>{b.label}</span>
              </div>
            );
          })}
        </div>
        <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); setAnimate(false); setTimeout(() => setAnimate(true), 50); }}>Replay</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Score Bar Rising</div>
        <div style={descStyle}>Les barres VITAA montent avec gradient et etoile sur le pilier le plus fort.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 6. BOT TRANSITION MORPHING
// ════════════════════════════════════════════════════════════════

function Demo06BotMorph() {
  const [phase, setPhase] = useState<"idle" | "dissolve" | "reform">("idle");
  const [colorIdx, setColorIdx] = useState(0);
  const botColors = ["#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#ef4444", "#f59e0b"];
  const botLabels = ["CEO", "CTO", "CFO", "CMO", "CSO", "COO"];
  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      px: (Math.random() - 0.5) * 80,
      py: (Math.random() - 0.5) * 80,
    }))
  );

  const trigger = useCallback(() => {
    setPhase("dissolve");
    setTimeout(() => {
      setColorIdx((p) => (p + 1) % botColors.length);
      setPhase("reform");
    }, 600);
    setTimeout(() => setPhase("idle"), 1200);
  }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={trigger}>
        <div style={badgeStyle}>6</div>
        <div style={{ position: "relative", width: 80, height: 80 }}>
          {/* Main circle */}
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: botColors[colorIdx],
            position: "absolute", top: 10, left: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: phase === "dissolve" ? 0 : 1,
            transform: phase === "dissolve" ? "scale(0.3)" : "scale(1)",
            transition: "all 0.5s ease-in-out",
            boxShadow: `0 0 20px ${botColors[colorIdx]}66`,
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
              {botLabels[colorIdx]}
            </span>
          </div>
          {/* Particles */}
          {phase !== "idle" && particles.current.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 5, height: 5, borderRadius: "50%",
              background: phase === "dissolve" ? botColors[colorIdx] : botColors[(colorIdx) % botColors.length],
              top: 37, left: 37,
              ["--px" as string]: `${p.px}px`,
              ["--py" as string]: `${p.py}px`,
              animation: phase === "dissolve"
                ? `as-particle-out 0.5s ease-out ${i * 0.02}s forwards`
                : `as-particle-in 0.5s ease-out ${i * 0.02}s forwards`,
            }} />
          ))}
        </div>
        <span style={{ position: "absolute", bottom: 30, color: "rgba(15,23,42,0.35)", fontSize: 11 }}>
          Cliquer pour morphing
        </span>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Bot Transition Morphing</div>
        <div style={descStyle}>L'avatar se dissout en particules et se reforme en une autre couleur de bot.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 7. DECISION TREE GROWTH
// ════════════════════════════════════════════════════════════════

function Demo07DecisionTree() {
  const [grow, setGrow] = useState(false);
  useEffect(() => { setTimeout(() => setGrow(true), 400); }, []);

  const treeNodes = [
    { x: 20, y: 100, label: "?", delay: 0 },
    { x: 100, y: 50, label: "A", delay: 0.4 },
    { x: 100, y: 150, label: "B", delay: 0.5 },
    { x: 190, y: 25, label: "A1", delay: 0.8 },
    { x: 190, y: 75, label: "A2", delay: 0.9 },
    { x: 190, y: 125, label: "B1", delay: 1.0 },
    { x: 190, y: 175, label: "B2", delay: 1.1 },
  ];
  const branches = [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 5 }, { from: 2, to: 6 },
  ];

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle}>
        <div style={badgeStyle}>7</div>
        <svg width="240" height="200" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}>
          {grow && branches.map((b, i) => {
            const f = treeNodes[b.from];
            const t = treeNodes[b.to];
            return (
              <line key={i}
                x1={f.x + 15} y1={f.y + 10} x2={t.x + 15} y2={t.y + 10}
                stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"
                strokeDasharray="200" strokeDashoffset="0"
                style={{
                  transition: `stroke-dashoffset 0.6s ease-out ${treeNodes[b.to].delay - 0.1}s`,
                }}
              />
            );
          })}
          {treeNodes.map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={n.y} width={30} height={20} rx={6}
                fill={i === 0 ? "rgba(59,130,246,0.3)" : "rgba(139,92,246,0.2)"}
                stroke={i === 0 ? "#3b82f6" : "#8b5cf6"} strokeWidth={1}
                style={{
                  opacity: grow ? 1 : 0,
                  transform: grow ? "scale(1)" : "scale(0)",
                  transformOrigin: `${n.x + 15}px ${n.y + 10}px`,
                  transition: `all 0.4s ease-out ${n.delay}s`,
                }}
              />
              <text x={n.x + 15} y={n.y + 14} textAnchor="middle"
                fill="#1e293b" fontSize={9} fontWeight={700}
                style={{
                  opacity: grow ? 1 : 0,
                  transition: `opacity 0.3s ease-out ${n.delay + 0.15}s`,
                }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
        <div style={replayBtnStyle} onClick={() => { setGrow(false); setTimeout(() => setGrow(true), 100); }}>Replay</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Decision Tree Growth</div>
        <div style={descStyle}>Arbre de decision qui pousse de gauche a droite avec noeuds apparaissant progressivement.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 8. TIMELINE WARP
// ════════════════════════════════════════════════════════════════

function Demo08TimelineWarp() {
  const [play, setPlay] = useState(false);
  const checkpoints = [
    { label: "Diagnostic", pct: 0 },
    { label: "Analyse", pct: 25 },
    { label: "Strategie", pct: 50 },
    { label: "Execution", pct: 75 },
    { label: "Resultats", pct: 100 },
  ];

  useEffect(() => { setTimeout(() => setPlay(true), 500); }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle}>
        <div style={badgeStyle}>8</div>
        <div style={{ width: 260, position: "relative", height: 60 }}>
          {/* Line background */}
          <div style={{
            position: "absolute", top: 20, left: 0, right: 0, height: 3,
            background: "rgba(0,0,0,0.06)", borderRadius: 2,
          }} />
          {/* Animated fill */}
          <div style={{
            position: "absolute", top: 20, left: 0, height: 3, borderRadius: 2,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)",
            width: play ? "100%" : "0%",
            transition: "width 2s ease-out",
          }} />
          {/* Checkpoints */}
          {checkpoints.map((cp, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${cp.pct}%`,
              top: 12,
              transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: play ? (i === checkpoints.length - 1 ? "#10b981" : "#8b5cf6") : "rgba(0,0,0,0.06)",
                border: "2px solid rgba(0,0,0,0.08)",
                transition: `all 0.4s ease-out ${0.4 * i + 0.3}s`,
                transform: play ? "scale(1)" : "scale(0)",
                boxShadow: play ? `0 0 8px ${i === checkpoints.length - 1 ? "#10b98155" : "#8b5cf655"}` : "none",
              }} />
              <span style={{
                fontSize: 8, fontWeight: 600,
                color: play ? "rgba(15,23,42,0.6)" : "transparent",
                transition: `color 0.3s ease-out ${0.4 * i + 0.5}s`,
                whiteSpace: "nowrap",
              }}>
                {cp.label}
              </span>
            </div>
          ))}
        </div>
        <div style={replayBtnStyle} onClick={() => { setPlay(false); setTimeout(() => setPlay(true), 100); }}>Replay</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Timeline Warp</div>
        <div style={descStyle}>Timeline horizontale avec checkpoints apparaissant en sequence et ligne de connexion.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 9. KPI DASHBOARD MORPH
// ════════════════════════════════════════════════════════════════

function Demo09KPIMorph() {
  const [play, setPlay] = useState(false);
  const kpis = [
    { label: "SCORE", value: 87, color: "#3b82f6" },
    { label: "ROI", value: 142, suffix: "%", color: "#10b981" },
    { label: "GAPS", value: 3, color: "#ef4444" },
    { label: "MOIS", value: 18, color: "#f59e0b" },
  ];

  useEffect(() => { setTimeout(() => setPlay(true), 300); }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => { setPlay(false); setTimeout(() => setPlay(true), 50); }}>
        <div style={badgeStyle}>9</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 20 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 10, padding: "12px 14px",
              transform: play ? "scale(1)" : "scale(0.5)",
              opacity: play ? 1 : 0,
              transition: `all 0.5s ease-out ${i * 0.15}s`,
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(15,23,42,0.4)", letterSpacing: 1, marginBottom: 4 }}>
                {k.label}
              </div>
              <CountUp target={k.value} play={play} delay={i * 150 + 300} color={k.color} suffix={k.suffix} />
            </div>
          ))}
        </div>
        <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); setPlay(false); setTimeout(() => setPlay(true), 50); }}>Replay</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>KPI Dashboard Morph</div>
        <div style={descStyle}>Chiffres qui comptent vers le haut avec cards qui s'agrandissent en stagger.</div>
      </div>
    </div>
  );
}

function CountUp({ target, play, delay, color, suffix }: { target: number; play: boolean; delay: number; color: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!play) { setVal(0); return; }
    const timer = setTimeout(() => {
      let cur = 0;
      const step = Math.max(1, Math.floor(target / 20));
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        setVal(cur);
      }, 40);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timer);
  }, [play, target, delay]);

  return (
    <span style={{ fontSize: 22, fontWeight: 800, color, textShadow: `0 0 8px ${color}22` }}>
      {val}{suffix || ""}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// 10. INSIGHT FLASH
// ════════════════════════════════════════════════════════════════

function Demo10InsightFlash() {
  const [flash, setFlash] = useState(false);
  const [showText, setShowText] = useState(false);

  const trigger = () => {
    setFlash(false);
    setShowText(false);
    setTimeout(() => {
      setFlash(true);
      setTimeout(() => setShowText(true), 400);
    }, 50);
  };

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={trigger}>
        <div style={badgeStyle}>10</div>
        {flash && (
          <>
            {[0, 1, 2].map((r) => (
              <div key={r} style={{
                position: "absolute",
                width: 40, height: 40, borderRadius: "50%",
                border: "2px solid rgba(139,92,246,0.4)",
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%) scale(0)",
                animation: `as-flash-ring 0.8s ease-out ${r * 0.15}s forwards`,
              }} />
            ))}
          </>
        )}
        {showText && (
          <div style={{
            textAlign: "center", zIndex: 3, position: "relative",
            animation: "as-count-scale 0.5s ease-out forwards",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: 2, marginBottom: 4 }}>INSIGHT</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", maxWidth: 180, lineHeight: 1.4 }}>
              Le pilier Technologie est votre levier de croissance #1
            </div>
          </div>
        )}
        {!flash && (
          <span style={{ color: "rgba(15,23,42,0.35)", fontSize: 11 }}>Cliquer pour l'eclair</span>
        )}
        {flash && <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); trigger(); }}>Replay</div>}
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Insight Flash</div>
        <div style={descStyle}>Onde de pulse depuis le centre, texte d'insight apparait. Effet revelateur.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 11. FOCUS MODE CARD EXPAND
// ════════════════════════════════════════════════════════════════

function Demo11FocusExpand() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => setExpanded(!expanded)}>
        <div style={badgeStyle}>11</div>
        <div style={{
          position: "absolute",
          width: expanded ? "90%" : 120,
          height: expanded ? "85%" : 70,
          borderRadius: expanded ? 6 : 12,
          background: expanded
            ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))"
            : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))",
          border: `1px solid ${expanded ? "rgba(139,92,246,0.4)" : "rgba(0,0,0,0.08)"}`,
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: expanded ? 16 : 8,
          overflow: "hidden",
        }}>
          {!expanded && (
            <>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: "#3b82f6", marginBottom: 6, opacity: 0.7 }} />
              <div style={{ fontSize: 9, color: "rgba(15,23,42,0.5)", fontWeight: 600 }}>Ventes</div>
            </>
          )}
          {expanded && (
            <div style={{ width: "100%", opacity: expanded ? 1 : 0, transition: "opacity 0.3s 0.3s" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", marginBottom: 8 }}>Departement Ventes</div>
              <div style={{ fontSize: 10, color: "rgba(15,23,42,0.55)", lineHeight: 1.6, marginBottom: 10 }}>
                Score global: 82/100<br />Pipeline: 3.2M$<br />Conversion: 34%
              </div>
              <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: "82%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 2 }} />
              </div>
            </div>
          )}
        </div>
        <span style={{ position: "absolute", bottom: 12, fontSize: 10, color: "rgba(15,23,42,0.3)" }}>
          {expanded ? "Cliquer pour reduire" : "Cliquer pour ouvrir"}
        </span>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Focus Mode Card Expand</div>
        <div style={descStyle}>Carte qui s'agrandit pour remplir le conteneur, comme l'ouverture d'une app iOS.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 12. VIEW CROSSFADE
// ════════════════════════════════════════════════════════════════

function Demo12Crossfade() {
  const [viewA, setViewA] = useState(true);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => setViewA(!viewA)}>
        <div style={badgeStyle}>12</div>
        <div style={{ width: "80%", height: "75%", position: "relative", borderRadius: 8, overflow: "hidden" }}>
          {/* View A */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 8,
            opacity: viewA ? 1 : 0,
            transform: viewA ? "translateX(0)" : "translateX(-8px)",
            transition: "all 0.4s ease-in-out",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>Vue Dashboard</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ width: 30, height: 20, borderRadius: 4, background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.15)" }} />
              ))}
            </div>
          </div>
          {/* View B */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 8,
            opacity: viewA ? 0 : 1,
            transform: viewA ? "translateX(8px)" : "translateX(0)",
            transition: "all 0.4s ease-in-out",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399" }}>Vue Detail</div>
            <div style={{ width: "70%", display: "flex", flexDirection: "column", gap: 4 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ height: 6, borderRadius: 3, background: "rgba(16,185,129,0.2)", width: `${100 - n * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
        <span style={{ position: "absolute", bottom: 12, fontSize: 10, color: "rgba(15,23,42,0.3)" }}>
          Cliquer pour basculer
        </span>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>View Crossfade</div>
        <div style={descStyle}>Deux vues qui se croisent en fondu avec micro-glissement lateral.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 13. BOT BAND COLOR MORPH
// ════════════════════════════════════════════════════════════════

function Demo13ColorMorph() {
  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle}>
        <div style={badgeStyle}>13</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 220, height: 8, borderRadius: 4,
            animation: "as-color-morph 6s linear infinite",
            boxShadow: "0 0 16px rgba(59,130,246,0.3)",
          }} />
          <div style={{
            width: 220, height: 40, borderRadius: 8,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0,0,0,0.08)",
            overflow: "hidden",
            display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
          }}>
            <div style={{
              width: 4, height: 24, borderRadius: 2,
              animation: "as-color-morph 6s linear infinite",
            }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(15,23,42,0.65)" }}>Bot actif</div>
              <div style={{ fontSize: 8, color: "rgba(15,23,42,0.4)" }}>Transition couleur continue</div>
            </div>
          </div>
          <div style={{
            width: 220, height: 3, borderRadius: 2,
            animation: "as-color-morph 6s linear infinite",
            opacity: 0.5,
          }} />
        </div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Bot Band Color Morph</div>
        <div style={descStyle}>Bande de couleur qui transite entre les couleurs des 6 bots C-Level en boucle.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 14. DASHBOARD GRID STAGGER
// ════════════════════════════════════════════════════════════════

function Demo14GridStagger() {
  const [play, setPlay] = useState(false);
  const cards = [
    { label: "Ventes", color: "#3b82f6" },
    { label: "R&D", color: "#8b5cf6" },
    { label: "Finance", color: "#10b981" },
    { label: "Marketing", color: "#ec4899" },
    { label: "Operations", color: "#f59e0b" },
    { label: "Strategie", color: "#ef4444" },
  ];

  useEffect(() => { setTimeout(() => setPlay(true), 300); }, []);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => { setPlay(false); setTimeout(() => setPlay(true), 50); }}>
        <div style={badgeStyle}>14</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: 20, width: "100%" }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              height: 55, borderRadius: 8,
              background: `linear-gradient(135deg, ${c.color}22, ${c.color}11)`,
              border: `1px solid ${c.color}33`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: play ? 1 : 0,
              transform: play ? "translateY(0)" : "translateY(12px)",
              transition: `all 0.4s ease-out ${i * 0.12}s`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, marginBottom: 4, opacity: 0.7 }} />
              <div style={{ fontSize: 8, fontWeight: 600, color: "rgba(15,23,42,0.5)" }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); setPlay(false); setTimeout(() => setPlay(true), 50); }}>Replay</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Dashboard Grid Stagger</div>
        <div style={descStyle}>Grille de 6 cartes apparaissant une par une avec fade + slide vers le haut.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 15. ROOM PORTAL ENTRY
// ════════════════════════════════════════════════════════════════

function Demo15RoomPortal() {
  const [open, setOpen] = useState(false);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle} onClick={() => { setOpen(false); setTimeout(() => setOpen(true), 50); }}>
        <div style={badgeStyle}>15</div>
        <div style={{
          width: "85%", height: "80%", borderRadius: 8,
          background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))",
          border: "1px solid rgba(139,92,246,0.2)",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Content revealed by portal */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            clipPath: open ? "circle(75% at 50% 50%)" : "circle(0% at 50% 50%)",
            transition: "clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.25))",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>Think Room</div>
            <div style={{ fontSize: 9, color: "rgba(15,23,42,0.45)", textAlign: "center", lineHeight: 1.5, padding: "0 20px" }}>
              Espace de reflexion profonde avec CarlOS et les Ghosts cognitifs
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["#3b82f6", "#8b5cf6", "#10b981"].map((c, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: "50%", background: c, opacity: 0.6,
                  boxShadow: `0 0 6px ${c}55`,
                }} />
              ))}
            </div>
          </div>
          {/* Center trigger */}
          {!open && (
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: 40, height: 40, borderRadius: "50%",
              border: "2px solid rgba(139,92,246,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 10px rgba(139,92,246,0.5)" }} />
            </div>
          )}
        </div>
        {!open && (
          <span style={{ position: "absolute", bottom: 12, fontSize: 10, color: "rgba(15,23,42,0.3)" }}>Cliquer pour ouvrir le portail</span>
        )}
        {open && <div style={replayBtnStyle} onClick={(e) => { e.stopPropagation(); setOpen(false); setTimeout(() => setOpen(true), 300); }}>Replay</div>}
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Room Portal Entry</div>
        <div style={descStyle}>Revele circulaire qui s'expanse depuis le centre. Entree dans une Room.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 16. CARD HOVER LIFT + GLOW
// ════════════════════════════════════════════════════════════════

function Demo16HoverGlow() {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={cardStyle}>
      <div style={demoAreaStyle}>
        <div style={badgeStyle}>16</div>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: 180, height: 100, borderRadius: 12,
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))",
            border: "1px solid rgba(0,0,0,0.08)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: "pointer",
            transform: hovered ? "translateY(-3px)" : "translateY(0)",
            boxShadow: hovered
              ? "0 8px 25px rgba(59,130,246,0.2), 0 0 0 1px rgba(59,130,246,0.15)"
              : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease-out",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: hovered ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hovered ? "#fff" : "rgba(15,23,42,0.3)"} strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: hovered ? "#1e293b" : "rgba(15,23,42,0.4)", transition: "color 0.3s" }}>
            Survole-moi
          </div>
        </div>
        <span style={{ position: "absolute", bottom: 12, fontSize: 10, color: "rgba(15,23,42,0.3)" }}>
          Survoler la carte
        </span>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>Card Hover Lift + Glow</div>
        <div style={descStyle}>Carte qui se souleve de 3px avec glow colore au survol. Interaction premium.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 21. CARLOS AVATAR VIVANT — Circuits + Background Graphs
// ════════════════════════════════════════════════════════════════

function DemoCarlOSAlive() {
  // Dashboard screen positions — shifted down to align with actual monitors in image
  const screens = [
    // Left main monitor
    { x: 2, y: 22, w: 78, h: 56, label: "left-main" },
    // Left bottom panel
    { x: 8, y: 85, w: 62, h: 33, label: "left-bottom" },
    // Center-left floating panel
    { x: 78, y: 32, w: 37, h: 35, label: "center-left" },
    // Right main monitor
    { x: 250, y: 20, w: 78, h: 55, label: "right-main" },
    // Right bottom panel
    { x: 258, y: 82, w: 64, h: 33, label: "right-bottom" },
    // Center-right floating panel
    { x: 215, y: 26, w: 37, h: 36, label: "center-right" },
  ];

  // Bar charts on left screen (matching the bar chart visible in image)
  const leftBars = [
    { x: 15, h: 22, delay: 0 }, { x: 24, h: 34, delay: 0.4 },
    { x: 33, h: 18, delay: 0.8 }, { x: 42, h: 42, delay: 1.2 },
    { x: 51, h: 28, delay: 1.6 }, { x: 60, h: 36, delay: 2.0 },
  ];

  // Bar charts on right screen
  const rightBars = [
    { x: 265, h: 20, delay: 0.2 }, { x: 274, h: 32, delay: 0.6 },
    { x: 283, h: 24, delay: 1.0 }, { x: 292, h: 38, delay: 1.4 },
    { x: 301, h: 28, delay: 1.8 }, { x: 310, h: 30, delay: 2.2 },
  ];

  // Data points that pulse on screens
  const dataPoints = [
    // Left monitor KPI dots
    { cx: 20, cy: 28, r: 1.8 }, { cx: 45, cy: 22, r: 1.5 }, { cx: 65, cy: 35, r: 1.8 },
    { cx: 30, cy: 50, r: 1.5 }, { cx: 55, cy: 55, r: 1.2 },
    // Right monitor data dots
    { cx: 270, cy: 25, r: 1.8 }, { cx: 295, cy: 30, r: 1.5 }, { cx: 315, cy: 22, r: 1.8 },
    { cx: 280, cy: 50, r: 1.5 }, { cx: 305, cy: 55, r: 1.2 },
    // Center floating panels
    { cx: 95, cy: 38, r: 1.5 }, { cx: 105, cy: 48, r: 1.2 },
    { cx: 230, cy: 32, r: 1.5 }, { cx: 240, cy: 42, r: 1.2 },
  ];

  return (
    <div style={{
      ...cardStyle,
      gridColumn: "1 / -1",
    }}>
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        position: "relative",
        overflow: "hidden",
        background: "#0a0e1a",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        {/* ===== CARLOS IMAGE ===== */}
        <img
          src="/agents/generated/ceo-carlos-standby-v3.png?v=5"
          alt="CarlOS CEO"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* ===== DASHBOARD ANIMATION OVERLAY (mix-blend screen = adds light) ===== */}
        <svg
          viewBox="0 0 330 185"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            mixBlendMode: "screen",
          }}
        >
          <defs>
            <linearGradient id="as-screen-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.12)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.06)" />
            </linearGradient>
            {/* Scan line gradient — bright center fading to transparent edges */}
            <linearGradient id="as-scan-h" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="rgba(99,180,246,0.18)" />
              <stop offset="50%" stopColor="rgba(99,180,246,0.25)" />
              <stop offset="70%" stopColor="rgba(99,180,246,0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* ── Screen glow pulses — subtle breathing on each monitor ── */}
          {screens.map((s, i) => (
            <rect
              key={`sg-${i}`}
              x={s.x} y={s.y} width={s.w} height={s.h}
              rx={2}
              fill="url(#as-screen-glow)"
              style={{
                animation: `as-circuit-node-pulse ${4 + i * 0.7}s ease-in-out ${i * 0.5}s infinite`,
              }}
            />
          ))}

          {/* ── Scan lines sweeping down each main monitor ── */}
          <rect x={2} y={22} width={78} height={2} rx={1}
            fill="url(#as-scan-h)"
            style={{ animation: "as-scan-down-left 4s ease-in-out 0s infinite" }}
          />
          <rect x={250} y={20} width={78} height={2} rx={1}
            fill="url(#as-scan-h)"
            style={{ animation: "as-scan-down-right 5s ease-in-out 1.5s infinite" }}
          />

          {/* ── Bar charts breathing on left screen ── */}
          {leftBars.map((b, i) => (
            <rect
              key={`lb-${i}`}
              x={b.x} y={108 - b.h} width={7} height={b.h}
              rx={1}
              fill="rgba(59,130,246,0.12)"
              style={{
                transformOrigin: `${b.x + 3.5}px 108px`,
                animation: `as-bg-bar-breathe ${3 + i * 0.4}s ease-in-out ${b.delay}s infinite`,
              }}
            />
          ))}

          {/* ── Bar charts breathing on right screen ── */}
          {rightBars.map((b, i) => (
            <rect
              key={`rb-${i}`}
              x={b.x} y={105 - b.h} width={7} height={b.h}
              rx={1}
              fill="rgba(59,130,246,0.10)"
              style={{
                transformOrigin: `${b.x + 3.5}px 105px`,
                animation: `as-bg-bar-breathe ${3.2 + i * 0.4}s ease-in-out ${b.delay}s infinite`,
              }}
            />
          ))}

          {/* ── Flowing line chart on left monitor ── */}
          <path
            d="M 5 55 Q 15 45 25 50 Q 35 55 45 42 Q 55 30 65 38 Q 72 44 78 35"
            fill="none"
            stroke="rgba(99,180,246,0.20)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="10 8"
            style={{ animation: "as-circuit-flow 6s linear 0s infinite" }}
          />
          {/* Second line — slightly offset */}
          <path
            d="M 5 62 Q 18 52 28 58 Q 38 62 50 50 Q 60 38 70 45 Q 75 50 78 42"
            fill="none"
            stroke="rgba(139,92,246,0.12)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray="6 12"
            style={{ animation: "as-circuit-flow-reverse 8s linear 0.5s infinite" }}
          />

          {/* ── Flowing line chart on right monitor ── */}
          <path
            d="M 252 50 Q 262 38 272 45 Q 282 52 292 35 Q 302 22 312 30 Q 320 38 326 28"
            fill="none"
            stroke="rgba(99,180,246,0.18)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="10 8"
            style={{ animation: "as-circuit-flow 7s linear 1s infinite" }}
          />

          {/* ── Line on center-left floating panel ── */}
          <path
            d="M 80 58 Q 88 48 95 42 Q 102 35 110 30"
            fill="none"
            stroke="rgba(59,200,246,0.20)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray="4 6"
            style={{ animation: "as-circuit-flow 5s linear 0.8s infinite" }}
          />

          {/* ── Data points pulsing on screens ── */}
          {dataPoints.map((pt, i) => (
            <circle
              key={`dp-${i}`}
              cx={pt.cx} cy={pt.cy} r={pt.r}
              fill="rgba(99,180,246,0.35)"
              style={{
                animation: `as-circuit-node-pulse ${2.5 + (i % 5) * 0.5}s ease-in-out ${i * 0.3}s infinite`,
                filter: "drop-shadow(0 0 2px rgba(59,130,246,0.3))",
              }}
            />
          ))}

          {/* ── Holographic table glow (center bottom) ── */}
          <rect x={90} y={135} width={150} height={40} rx={3}
            fill="rgba(59,130,246,0.04)"
            style={{
              animation: "as-circuit-node-pulse 5s ease-in-out 0s infinite",
            }}
          />
          {/* Holographic table line chart */}
          <path
            d="M 95 165 Q 110 155 125 158 Q 140 162 155 148 Q 170 135 185 142 Q 200 150 215 140 Q 225 132 235 138"
            fill="none"
            stroke="rgba(59,200,246,0.15)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray="8 6"
            style={{ animation: "as-circuit-flow 8s linear 0s infinite" }}
          />

          {/* ── Donut chart on left monitor ── */}
          <circle cx="25" cy="30" r="8" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="2.5" />
          <circle cx="25" cy="30" r="8" fill="none" stroke="rgba(99,180,246,0.18)" strokeWidth="2.5"
            strokeDasharray="15 35"
            style={{ animation: "as-circuit-flow 6s linear infinite" }}
          />

          {/* ── Donut chart on right monitor ── */}
          <circle cx="305" cy="25" r="7" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="2" />
          <circle cx="305" cy="25" r="7" fill="none" stroke="rgba(99,180,246,0.16)" strokeWidth="2"
            strokeDasharray="12 32"
            style={{ animation: "as-circuit-flow-reverse 7s linear infinite" }}
          />

          {/* ── Screen edge highlights — aligned with monitors ── */}
          <rect x={2} y={22} width={78} height={56} rx={2}
            fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"
            style={{ animation: "as-circuit-node-pulse 6s ease-in-out 0s infinite" }}
          />
          <rect x={250} y={20} width={78} height={55} rx={2}
            fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"
            style={{ animation: "as-circuit-node-pulse 6s ease-in-out 2s infinite" }}
          />
        </svg>

        {/* ===== CIRCUIT DOTS ON SUIT (animateMotion = dots traveling along circuit traces) ===== */}
        <svg
          viewBox="0 0 330 185"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 3,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        >
          <defs>
            <filter id="as-dot-glow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── His left chest (our right side) — main circuit traces (+15px right shift) ── */}
          <path id="sc1" d="M 187 84 L 187 112 L 203 112 L 203 138" fill="none" stroke="none" />
          <path id="sc2" d="M 195 90 L 195 108 L 211 108 L 211 130 L 221 130" fill="none" stroke="none" />
          <path id="sc3" d="M 193 118 L 207 118 L 207 148 L 217 148" fill="none" stroke="none" />
          <path id="sc4" d="M 185 138 L 185 158 L 199 158 L 199 172" fill="none" stroke="none" />
          <path id="sc5" d="M 211 94 L 211 118 L 225 118 L 225 148" fill="none" stroke="none" />
          <path id="sc6" d="M 200 130 L 215 130 L 215 160 L 225 160 L 225 172" fill="none" stroke="none" />

          {/* ── His right chest (our left side) — circuit traces (+15px right shift) ── */}
          <path id="sc7" d="M 169 88 L 169 112 L 155 112 L 155 138" fill="none" stroke="none" />
          <path id="sc8" d="M 163 96 L 163 120 L 149 120 L 149 148" fill="none" stroke="none" />
          <path id="sc9" d="M 165 132 L 153 132 L 153 158 L 143 158" fill="none" stroke="none" />
          <path id="sc10" d="M 173 82 L 173 100 L 161 100 L 161 126" fill="none" stroke="none" />

          {/* ── Traveling dots — slow, elegant pace (×2.25 from original) ── */}
          {/* Left chest paths */}
          <circle r="0.7" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.7">
            <animateMotion dur="6.3s" repeatCount="indefinite" begin="0s"><mpath href="#sc1" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#818cf8" filter="url(#as-dot-glow)" opacity="0.5">
            <animateMotion dur="6.3s" repeatCount="indefinite" begin="3.2s"><mpath href="#sc1" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.7">
            <animateMotion dur="7.2s" repeatCount="indefinite" begin="0.7s"><mpath href="#sc2" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#818cf8" filter="url(#as-dot-glow)" opacity="0.5">
            <animateMotion dur="7.2s" repeatCount="indefinite" begin="4s"><mpath href="#sc2" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.65">
            <animateMotion dur="5.7s" repeatCount="indefinite" begin="1.4s"><mpath href="#sc3" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#93c5fd" filter="url(#as-dot-glow)" opacity="0.45">
            <animateMotion dur="5.7s" repeatCount="indefinite" begin="4s"><mpath href="#sc3" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.7">
            <animateMotion dur="5.9s" repeatCount="indefinite" begin="2.2s"><mpath href="#sc4" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#818cf8" filter="url(#as-dot-glow)" opacity="0.65">
            <animateMotion dur="6.8s" repeatCount="indefinite" begin="1.2s"><mpath href="#sc5" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.5">
            <animateMotion dur="6.8s" repeatCount="indefinite" begin="4.5s"><mpath href="#sc5" /></animateMotion>
          </circle>

          <circle r="0.6" fill="#93c5fd" filter="url(#as-dot-glow)" opacity="0.6">
            <animateMotion dur="7.7s" repeatCount="indefinite" begin="1.8s"><mpath href="#sc6" /></animateMotion>
          </circle>

          {/* Right chest paths */}
          <circle r="0.7" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.7">
            <animateMotion dur="6.3s" repeatCount="indefinite" begin="0.5s"><mpath href="#sc7" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#818cf8" filter="url(#as-dot-glow)" opacity="0.5">
            <animateMotion dur="6.3s" repeatCount="indefinite" begin="3.6s"><mpath href="#sc7" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.65">
            <animateMotion dur="6.8s" repeatCount="indefinite" begin="1.6s"><mpath href="#sc8" /></animateMotion>
          </circle>

          <circle r="0.6" fill="#93c5fd" filter="url(#as-dot-glow)" opacity="0.6">
            <animateMotion dur="5.4s" repeatCount="indefinite" begin="0.9s"><mpath href="#sc9" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#818cf8" filter="url(#as-dot-glow)" opacity="0.65">
            <animateMotion dur="5.9s" repeatCount="indefinite" begin="2s"><mpath href="#sc10" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#60a5fa" filter="url(#as-dot-glow)" opacity="0.45">
            <animateMotion dur="5.9s" repeatCount="indefinite" begin="5s"><mpath href="#sc10" /></animateMotion>
          </circle>

          {/* ── Holographic 3D panel (×2.25 from original) ── */}
          <path id="holo1" d="M 80 162 Q 90 158 98 152 Q 106 145 112 140 Q 120 134 128 128 Q 134 124 140 122" fill="none" stroke="none" />
          <path id="holo2" d="M 82 166 Q 92 162 100 158 Q 110 152 118 148 Q 126 142 135 138" fill="none" stroke="none" />
          <path id="holo3" d="M 78 148 L 142 148" fill="none" stroke="none" />
          <path id="holo4" d="M 78 158 L 142 158" fill="none" stroke="none" />
          <path id="holo5" d="M 80 168 L 80 122" fill="none" stroke="none" />
          <path id="holo6" d="M 140 168 L 140 122 L 128 118" fill="none" stroke="none" />

          {/* Holographic dots — slow */}
          <circle r="0.8" fill="#67e8f9" filter="url(#as-dot-glow)" opacity="0.8">
            <animateMotion dur="5.7s" repeatCount="indefinite" begin="0s"><mpath href="#holo1" /></animateMotion>
          </circle>
          <circle r="0.6" fill="#a5f3fc" filter="url(#as-dot-glow)" opacity="0.55">
            <animateMotion dur="5.7s" repeatCount="indefinite" begin="2.7s"><mpath href="#holo1" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#67e8f9" filter="url(#as-dot-glow)" opacity="0.7">
            <animateMotion dur="6.3s" repeatCount="indefinite" begin="0.9s"><mpath href="#holo2" /></animateMotion>
          </circle>

          <circle r="0.5" fill="#a5f3fc" filter="url(#as-dot-glow)" opacity="0.5">
            <animateMotion dur="4.5s" repeatCount="indefinite" begin="0.7s"><mpath href="#holo3" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#67e8f9" filter="url(#as-dot-glow)" opacity="0.45">
            <animateMotion dur="5s" repeatCount="indefinite" begin="1.8s"><mpath href="#holo4" /></animateMotion>
          </circle>

          <circle r="0.6" fill="#a5f3fc" filter="url(#as-dot-glow)" opacity="0.6">
            <animateMotion dur="4.1s" repeatCount="indefinite" begin="1.2s"><mpath href="#holo5" /></animateMotion>
          </circle>

          <circle r="0.7" fill="#67e8f9" filter="url(#as-dot-glow)" opacity="0.65">
            <animateMotion dur="5.4s" repeatCount="indefinite" begin="2.2s"><mpath href="#holo6" /></animateMotion>
          </circle>
          <circle r="0.5" fill="#a5f3fc" filter="url(#as-dot-glow)" opacity="0.4">
            <animateMotion dur="5.4s" repeatCount="indefinite" begin="4.5s"><mpath href="#holo6" /></animateMotion>
          </circle>
        </svg>

        {/* ===== VIGNETTE OVERLAY ===== */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,14,26,0.3) 100%)",
          pointerEvents: "none",
        }} />

        {/* ===== BADGE ===== */}
        <div style={{
          ...badgeStyle,
          zIndex: 5,
          width: 30,
          height: 30,
          fontSize: 12,
        }}>21</div>
      </div>

      <div style={infoAreaStyle}>
        <div style={titleStyle}>CarlOS Avatar Vivant</div>
        <div style={descStyle}>
          Dashboards animés (scan lines, bars, line charts) + micro-dots voyageant sur les circuits de l'habit (animateMotion, mix-blend screen). L'habit et les écrans semblent vivants.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 22. CARLOS VOICE STREAM — Audio Visualizer Effect
// ════════════════════════════════════════════════════════════════

// Helper — shared CarlOS image + dark bottom gradient for voice demos
function VoiceCardShell({ badge, title, desc, children }: { badge: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={cardStyle}>
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        position: "relative",
        overflow: "hidden",
        background: "#060a14",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <img
          src="/agents/generated/ceo-carlos-standby-v3.png?v=5"
          alt="CarlOS Voice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", zIndex: 2,
          background: "linear-gradient(to top, rgba(6,10,20,0.8) 0%, rgba(6,10,20,0.3) 50%, transparent 100%)",
          pointerEvents: "none",
        }} />
        {children}
        <div style={{ ...badgeStyle, zIndex: 5, width: 24, height: 24, fontSize: 10 }}>{badge}</div>
      </div>
      <div style={infoAreaStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={descStyle}>{desc}</div>
      </div>
    </div>
  );
}

// ── Option A: EQ Bars (bleu/vert/blanc alternés) ──
function DemoVoiceA() {
  const bars = [
    6, 10, 4, 12, 7, 11, 5, 14, 8, 12, 5, 13, 9, 15, 6, 10, 8, 12, 5, 14,
    7, 11, 6, 13, 9, 12, 5, 15, 8, 10, 6, 12, 9, 14, 5, 11, 8, 10, 6, 13,
  ].map((h, i) => ({ x: 10 + i * 8, maxH: h, delay: i * 0.06, dur: 0.7 + (i % 7) * 0.12 }));
  const fills = ["url(#va-blue)", "url(#va-green)", "url(#va-white)"];

  return (
    <VoiceCardShell badge="A" title="A — EQ Bars" desc="Barres fines bleu/vert/blanc qui respirent en bas">
      <svg viewBox="0 0 330 185" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3 }}>
        <defs>
          <linearGradient id="va-blue" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(59,130,246,0.55)" /><stop offset="100%" stopColor="rgba(129,140,248,0.08)" />
          </linearGradient>
          <linearGradient id="va-green" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(34,197,94,0.50)" /><stop offset="100%" stopColor="rgba(74,222,128,0.08)" />
          </linearGradient>
          <linearGradient id="va-white" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        {bars.map((b, i) => (
          <rect key={`va-${i}`} x={b.x} y={185 - b.maxH} width={4} rx={1} height={b.maxH}
            fill={fills[i % 3]}
            style={{ transformOrigin: `${b.x + 2}px 185px`, animation: `as-eq-bounce ${b.dur}s ease-in-out ${b.delay}s infinite alternate` }}
          />
        ))}
      </svg>
    </VoiceCardShell>
  );
}

// ── Option B: Waveform sinusoïdale (style Siri) ──
function DemoVoiceB() {
  return (
    <VoiceCardShell badge="B" title="B — Waveform Siri" desc="Onde sinusoïdale fluide, dégradé bleu→vert→blanc">
      <svg viewBox="0 0 330 185" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3 }}>
        <defs>
          <linearGradient id="vb-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="rgba(59,130,246,0.5)" />
            <stop offset="50%" stopColor="rgba(34,197,94,0.5)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id="vb-glow"><feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Main wave */}
        <path d="M 10 175 Q 30 168 50 175 Q 70 182 90 170 Q 110 158 130 172 Q 150 182 170 165 Q 190 148 210 168 Q 230 182 250 170 Q 270 158 290 172 Q 310 182 320 175"
          fill="none" stroke="url(#vb-wave)" strokeWidth="1.5" strokeLinecap="round"
          filter="url(#vb-glow)"
          style={{ animation: "as-wave-flow 4s ease-in-out infinite" }}
        />
        {/* Ghost wave 1 */}
        <path d="M 10 175 Q 35 165 55 175 Q 75 185 95 168 Q 115 152 135 170 Q 155 185 175 162 Q 195 142 215 165 Q 235 185 255 168 Q 275 152 295 170 Q 315 185 320 175"
          fill="none" stroke="rgba(99,180,246,0.2)" strokeWidth="0.8" strokeLinecap="round"
          style={{ animation: "as-wave-flow 5s ease-in-out 0.5s infinite" }}
        />
        {/* Ghost wave 2 */}
        <path d="M 10 175 Q 25 170 45 175 Q 65 180 85 172 Q 105 164 125 174 Q 145 180 165 170 Q 185 158 205 172 Q 225 180 245 172 Q 265 164 285 174 Q 305 180 320 175"
          fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="0.6" strokeLinecap="round"
          style={{ animation: "as-wave-flow 6s ease-in-out 1s infinite" }}
        />
      </svg>
    </VoiceCardShell>
  );
}

// ── Option C: Particules montantes ──
function DemoVoiceC() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    cx: 15 + (i * 10.3) % 310,
    startY: 185,
    endY: 155 + (i % 5) * 4,
    r: 0.6 + (i % 3) * 0.3,
    dur: 2.5 + (i % 7) * 0.4,
    delay: (i * 0.17) % 3,
    color: i % 3 === 0 ? "rgba(59,130,246,0.6)" : i % 3 === 1 ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.45)",
  }));

  return (
    <VoiceCardShell badge="C" title="C — Particules" desc="Particules bleu/vert/blanc qui montent doucement depuis le bas">
      <svg viewBox="0 0 330 185" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3 }}>
        <defs>
          <filter id="vc-glow"><feGaussianBlur stdDeviation="1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {particles.map((p, i) => (
          <circle key={`vc-${i}`} cx={p.cx} cy={p.startY} r={p.r} fill={p.color} filter="url(#vc-glow)"
            style={{
              animation: `as-particle-rise ${p.dur}s ease-out ${p.delay}s infinite`,
              ["--rise-y" as string]: `${p.endY - p.startY}px`,
            }}
          />
        ))}
      </svg>
    </VoiceCardShell>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "rgba(15,23,42,0.6)",
  letterSpacing: 1.5,
  textTransform: "uppercase" as const,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  marginBottom: 20,
  marginTop: 40,
};

export function AnimationShowcasePage() {
  return (
    <div
      className="h-full overflow-auto"
      style={{
        background: "#f8fafc",
      }}
    >
      <style>{KEYFRAMES}</style>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: "rgba(139,92,246,0.6)",
            letterSpacing: 3, textTransform: "uppercase" as const, marginBottom: 10,
          }}>
            GhostX Lab
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.2,
            background: "linear-gradient(135deg, #1e293b, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Laboratoire d'Animations
          </h1>
          <p style={{
            fontSize: 13, color: "rgba(15,23,42,0.45)", marginTop: 8, fontWeight: 500,
          }}>
            22 concepts pour GhostX
          </p>
        </div>

        {/* Section A */}
        <div style={sectionHeaderStyle}>A — Animations Chat & Flow</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Demo01NeuralThinking />
          <Demo02DataStream />
          <Demo03HoloCard />
          <Demo04OrbitMatching />
          <Demo05ScoreBar />
          <Demo06BotMorph />
          <Demo07DecisionTree />
          <Demo08TimelineWarp />
          <Demo09KPIMorph />
          <Demo10InsightFlash />
        </div>

        {/* Section B */}
        <div style={sectionHeaderStyle}>B — Transitions Plateforme</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Demo11FocusExpand />
          <Demo12Crossfade />
          <Demo13ColorMorph />
          <Demo14GridStagger />
          <Demo15RoomPortal />
          <Demo16HoverGlow />
        </div>

        {/* Section D — CarlOS Avatar Vivant */}
        <div style={sectionHeaderStyle}>D — CarlOS Avatar Vivant</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 20 }}>
          <DemoCarlOSAlive />
        </div>

        <div style={{ ...sectionHeaderStyle, fontSize: 11 }}>D.2 — Effet Sonore (3 options)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 20 }}>
          <DemoVoiceA />
          <DemoVoiceB />
          <DemoVoiceC />
        </div>

        {/* Section C — Videos Generees */}
        <div style={sectionHeaderStyle}>C — Videos Generees (CarlOS Intro)</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Option 1 — Remotion */}
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>17</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Remotion (React)</span>
            </div>
            <div style={{ padding: "0 16px 4px" }}>
              <p style={{ fontSize: 11, color: "rgba(15,23,42,0.5)", margin: 0, lineHeight: 1.4 }}>
                React + spring() + interpolate() — composants declaratifs, re-rendable
              </p>
            </div>
            <video
              src="/videos/carlos-remotion.mp4"
              controls
              loop
              muted
              playsInline
              style={{ width: "100%", aspectRatio: "16/9", background: "#0f172a", borderTop: "1px solid rgba(0,0,0,0.04)" }}
            />
          </div>

          {/* Option 2 — Canvas MediaRecorder */}
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>18</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Canvas MediaRecorder</span>
            </div>
            <div style={{ padding: "0 16px 4px" }}>
              <p style={{ fontSize: 11, color: "rgba(15,23,42,0.5)", margin: 0, lineHeight: 1.4 }}>
                HTML standalone — Canvas2D + captureStream + VP9/VP8 codec
              </p>
            </div>
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#0f172a", borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <a
                href="/videos/carlos-mediarecorder.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 20px", borderRadius: 8,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  textDecoration: "none", transition: "opacity 0.2s",
                }}
              >
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>

          {/* Option 3 — FFmpeg + Python */}
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>19</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>FFmpeg + Python (Pillow)</span>
            </div>
            <div style={{ padding: "0 16px 4px" }}>
              <p style={{ fontSize: 11, color: "rgba(15,23,42,0.5)", margin: 0, lineHeight: 1.4 }}>
                Frames Pillow pipees vers FFmpeg — 4x supersampled, particules orbitantes
              </p>
            </div>
            <video
              src="/videos/carlos-animated-ffmpeg.mp4"
              controls
              loop
              muted
              playsInline
              style={{ width: "100%", aspectRatio: "16/9", background: "#0f172a", borderTop: "1px solid rgba(0,0,0,0.04)" }}
            />
          </div>

          {/* Option 4 — Puppeteer */}
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>20</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Puppeteer (Headless Chrome)</span>
            </div>
            <div style={{ padding: "0 16px 4px" }}>
              <p style={{ fontSize: 11, color: "rgba(15,23,42,0.5)", margin: 0, lineHeight: 1.4 }}>
                Virtual clock + screenshot frame-by-frame — capture deterministe parfaite
              </p>
            </div>
            <video
              src="/videos/carlos-puppeteer.mp4"
              controls
              loop
              muted
              playsInline
              style={{ width: "100%", aspectRatio: "16/9", background: "#0f172a", borderTop: "1px solid rgba(0,0,0,0.04)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
