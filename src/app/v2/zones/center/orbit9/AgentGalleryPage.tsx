/**
 * AgentGalleryPage.tsx — Galerie des 12 Agents AI GhostX
 * Chaque agent: photo 16:9 animée avec dots circuits + élément unique
 * Pattern identique à DemoCarlOSAlive (AnimationShowcasePage.tsx)
 */

import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { Users } from "lucide-react";

// ════════════════════════════════════════════════════════════════
// KEYFRAMES
// ════════════════════════════════════════════════════════════════
export const AG_KEYFRAMES = `
@keyframes ag-node-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
@keyframes ag-circuit-flow {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes ag-circuit-flow-rev {
  0% { stroke-dashoffset: -200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes ag-bar-breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.15); }
}
@keyframes ag-scan-down {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(54px); opacity: 0; }
}
@keyframes ag-ring-pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.08); }
}
@keyframes ag-shield-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}
@keyframes ag-spark {
  0% { opacity: 0; transform: translateY(0); }
  20% { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(-12px); }
}
@keyframes ag-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes ag-wave-flow {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  25% { transform: translateY(-4px); opacity: 0.7; }
  50% { transform: translateY(2px); opacity: 0.4; }
  75% { transform: translateY(-2px); opacity: 0.6; }
}
`;

// ════════════════════════════════════════════════════════════════
// TYPES & CONFIG
// ════════════════════════════════════════════════════════════════

interface AgentConfig {
  code: string;
  name: string;
  role: string;
  image: string;
  // Primary color hex for dots
  dotColor: string;
  // Secondary lighter color for accent dots
  dotColorLight: string;
  // Gradient badge bg
  badgeGrad: string;
  // Circuit paths on suit (6-10 paths each)
  suitPaths: string[];
  // Unique element paths + dots
  uniqueElement: React.ReactNode;
  // Unique element description
  uniqueDesc: string;
  // Identity overlay position — "right" if face is on the left side
  identityPos?: "left" | "right";
}

// ════════════════════════════════════════════════════════════════
// AGENT CONFIGURATIONS (12 agents)
// ════════════════════════════════════════════════════════════════

export const AGENTS: AgentConfig[] = [
  // ─── 1. BCO — CarlOS (CEO) — BLUE ───
  {
    code: "BCO",
    name: "CarlOS",
    role: "CEO AI — Président Directeur Général",
    image: "/agents/generated/ceo-carlos-standby-v3.png?v=5",
    dotColor: "#60a5fa",
    dotColorLight: "#93c5fd",
    badgeGrad: "linear-gradient(135deg, #2563eb, #3b82f6)",
    suitPaths: [
      "M 187 84 L 187 112 L 203 112 L 203 138",
      "M 195 90 L 195 108 L 211 108 L 211 130 L 221 130",
      "M 193 118 L 207 118 L 207 148 L 217 148",
      "M 185 138 L 185 158 L 199 158 L 199 172",
      "M 211 94 L 211 118 L 225 118 L 225 148",
      "M 200 130 L 215 130 L 215 160 L 225 160 L 225 172",
      "M 169 88 L 169 112 L 155 112 L 155 138",
      "M 163 96 L 163 120 L 149 120 L 149 148",
      "M 165 132 L 153 132 L 153 158 L 143 158",
      "M 173 82 L 173 100 L 161 100 L 161 126",
    ],
    uniqueElement: (
      <>
        {/* Holographic 3D panel left of CarlOS */}
        <path id="ag-bco-h1" d="M 80 162 Q 90 158 98 152 Q 106 145 112 140 Q 120 134 128 128 Q 134 124 140 122" fill="none" stroke="none" />
        <path id="ag-bco-h2" d="M 82 166 Q 92 162 100 158 Q 110 152 118 148 Q 126 142 135 138" fill="none" stroke="none" />
        <path id="ag-bco-h3" d="M 78 148 L 142 148" fill="none" stroke="none" />
        <path id="ag-bco-h4" d="M 78 158 L 142 158" fill="none" stroke="none" />
        <path id="ag-bco-h5" d="M 80 168 L 80 122" fill="none" stroke="none" />
        <path id="ag-bco-h6" d="M 140 168 L 140 122 L 128 118" fill="none" stroke="none" />
        <circle r="0.8" fill="#67e8f9" filter="url(#ag-glow)" opacity="0.8">
          <animateMotion dur="5.7s" repeatCount="indefinite" begin="0s"><mpath href="#ag-bco-h1" /></animateMotion>
        </circle>
        <circle r="0.6" fill="#a5f3fc" filter="url(#ag-glow)" opacity="0.55">
          <animateMotion dur="5.7s" repeatCount="indefinite" begin="2.7s"><mpath href="#ag-bco-h1" /></animateMotion>
        </circle>
        <circle r="0.7" fill="#67e8f9" filter="url(#ag-glow)" opacity="0.7">
          <animateMotion dur="6.3s" repeatCount="indefinite" begin="0.9s"><mpath href="#ag-bco-h2" /></animateMotion>
        </circle>
        <circle r="0.5" fill="#a5f3fc" filter="url(#ag-glow)" opacity="0.5">
          <animateMotion dur="4.5s" repeatCount="indefinite" begin="0.7s"><mpath href="#ag-bco-h3" /></animateMotion>
        </circle>
        <circle r="0.5" fill="#67e8f9" filter="url(#ag-glow)" opacity="0.45">
          <animateMotion dur="5s" repeatCount="indefinite" begin="1.8s"><mpath href="#ag-bco-h4" /></animateMotion>
        </circle>
        <circle r="0.6" fill="#a5f3fc" filter="url(#ag-glow)" opacity="0.6">
          <animateMotion dur="4.1s" repeatCount="indefinite" begin="1.2s"><mpath href="#ag-bco-h5" /></animateMotion>
        </circle>
        <circle r="0.7" fill="#67e8f9" filter="url(#ag-glow)" opacity="0.65">
          <animateMotion dur="5.4s" repeatCount="indefinite" begin="2.2s"><mpath href="#ag-bco-h6" /></animateMotion>
        </circle>

        {/* === DASHBOARD SCREENS BEHIND CARLOS — subtle, on screens (+15 down) === */}
        {/* Left monitor line chart */}
        <path d="M 5 70 Q 15 60 25 65 Q 35 70 45 57 Q 55 45 65 53 Q 72 59 78 50"
          fill="none" stroke="rgba(99,180,246,0.32)" strokeWidth="0.7"
          strokeDasharray="10 8" style={{ animation: "ag-circuit-flow 6s linear infinite" }} />
        <path d="M 5 77 Q 18 67 28 73 Q 38 77 50 65 Q 60 53 70 60 Q 75 65 78 57"
          fill="none" stroke="rgba(139,92,246,0.22)" strokeWidth="0.7"
          strokeDasharray="6 12" style={{ animation: "ag-circuit-flow-rev 8s linear 0.5s infinite" }} />
        {/* Left monitor donut */}
        <circle cx="25" cy="45" r="8" fill="none" stroke="rgba(59,130,246,0.18)" strokeWidth="1.5" />
        <circle cx="25" cy="45" r="8" fill="none" stroke="rgba(99,180,246,0.28)" strokeWidth="1.5"
          strokeDasharray="15 35" style={{ animation: "ag-circuit-flow 6s linear infinite" }} />
        {/* Left monitor data dots */}
        <circle cx="20" cy="43" r="1" fill="rgba(99,180,246,0.25)" style={{ animation: "ag-node-pulse 2.5s ease-in-out 0s infinite" }} />
        <circle cx="45" cy="55" r="0.8" fill="rgba(99,180,246,0.22)" style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />
        <circle cx="65" cy="50" r="1" fill="rgba(99,180,246,0.25)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1s infinite" }} />

        {/* Right monitor line chart */}
        <path d="M 252 65 Q 262 53 272 60 Q 282 67 292 50 Q 302 37 312 45 Q 320 53 326 43"
          fill="none" stroke="rgba(99,180,246,0.28)" strokeWidth="0.7"
          strokeDasharray="10 8" style={{ animation: "ag-circuit-flow 7s linear 1s infinite" }} />
        {/* Right monitor donut */}
        <circle cx="305" cy="40" r="7" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="1.5" />
        <circle cx="305" cy="40" r="7" fill="none" stroke="rgba(99,180,246,0.28)" strokeWidth="1.5"
          strokeDasharray="12 32" style={{ animation: "ag-circuit-flow-rev 7s linear infinite" }} />
        {/* Right monitor data dots */}
        <circle cx="270" cy="57" r="1" fill="rgba(99,180,246,0.25)" style={{ animation: "ag-node-pulse 3s ease-in-out 0.3s infinite" }} />
        <circle cx="295" cy="45" r="0.8" fill="rgba(99,180,246,0.22)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.8s infinite" }} />
        <circle cx="315" cy="47" r="1" fill="rgba(99,180,246,0.25)" style={{ animation: "ag-node-pulse 2.5s ease-in-out 1.3s infinite" }} />

        {/* Center-left floating panel */}
        <path d="M 80 73 Q 88 63 95 57 Q 102 50 110 45"
          fill="none" stroke="rgba(59,200,246,0.28)" strokeWidth="0.7"
          strokeDasharray="4 6" style={{ animation: "ag-circuit-flow 5s linear 0.8s infinite" }} />
        <circle cx="95" cy="57" r="0.8" fill="rgba(99,180,246,0.22)" style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />

        {/* Center-right floating panel */}
        <path d="M 218 70 Q 225 60 235 53 Q 242 47 248 43"
          fill="none" stroke="rgba(59,200,246,0.25)" strokeWidth="0.7"
          strokeDasharray="4 6" style={{ animation: "ag-circuit-flow-rev 5.5s linear 1.2s infinite" }} />
        <circle cx="235" cy="55" r="0.8" fill="rgba(99,180,246,0.22)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />
      </>
    ),
    uniqueDesc: "Hologramme 3D + dashboards animés",
  },

  // ─── 2. BCT — Thierry (CTO) — VIOLET ───
  {
    code: "BCT",
    name: "Thierry",
    role: "CTO AI — Directeur Technologie",
    image: "/agents/generated/cto-thierry-standby-v3.png?v=5",
    dotColor: "#a78bfa",
    dotColorLight: "#c4b5fd",
    badgeGrad: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    suitPaths: [
      // Right shoulder + arm circuits
      "M 175 75 L 175 95 L 190 95 L 190 120",
      "M 185 80 L 185 100 L 200 100 L 200 125 L 210 125",
      "M 180 105 L 195 105 L 195 135 L 205 135",
      "M 195 85 L 195 110 L 208 110 L 208 140",
      // Left shoulder circuits
      "M 155 78 L 155 98 L 142 98 L 142 125",
      "M 148 85 L 148 108 L 135 108 L 135 130",
      "M 160 100 L 145 100 L 145 128 L 135 128",
      "M 150 115 L 138 115 L 138 142",
    ],
    uniqueElement: (
      <>
        {/* Holographic brain display on tablet — center-right */}
        <circle cx="240" cy="85" r="18" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.2"
          style={{ animation: "ag-ring-pulse 4s ease-in-out infinite" }} />
        <circle cx="240" cy="85" r="12" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.2"
          style={{ animation: "ag-ring-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <circle cx="240" cy="85" r="6" fill="none" stroke="rgba(196,181,253,0.7)" strokeWidth="1.2"
          style={{ animation: "ag-ring-pulse 3s ease-in-out 1s infinite" }} />
        {/* Neural connection lines */}
        <path d="M 228 78 Q 235 72 245 70 Q 255 68 258 75" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.2"
          strokeDasharray="4 4" style={{ animation: "ag-circuit-flow 5s linear infinite" }} />
        <path d="M 225 90 Q 232 95 240 98 Q 250 100 255 92" fill="none" stroke="rgba(196,181,253,0.45)" strokeWidth="1.2"
          strokeDasharray="3 5" style={{ animation: "ag-circuit-flow-rev 6s linear infinite" }} />
        {/* Brain node dots */}
        <circle cx="235" cy="78" r="1" fill="rgba(167,139,250,0.7)" style={{ animation: "ag-node-pulse 3s ease-in-out 0s infinite" }} />
        <circle cx="245" cy="82" r="1.2" fill="rgba(196,181,253,0.65)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <circle cx="240" cy="90" r="1" fill="rgba(167,139,250,0.7)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1s infinite" }} />
        <circle cx="248" cy="75" r="0.8" fill="rgba(196,181,253,0.6)" style={{ animation: "ag-node-pulse 3.2s ease-in-out 1.5s infinite" }} />
        <circle cx="233" cy="88" r="0.8" fill="rgba(167,139,250,0.65)" style={{ animation: "ag-node-pulse 4s ease-in-out 0.8s infinite" }} />

        {/* === SERVER RACK LEDs — left background (x=5-25, y=30-100) === */}
        {[38, 48, 58, 68, 78, 88].map((y, i) => (
          <circle key={`bct-led-${i}`} cx={10 + (i % 2) * 8} cy={y} r="1" fill="rgba(167,139,250,0.6)"
            style={{ animation: `ag-node-pulse ${2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
        {/* Server rack vertical line glow */}
        <line x1="14" y1="32" x2="14" y2="95" stroke="rgba(167,139,250,0.38)" strokeWidth="1.0" />
        <line x1="6" y1="35" x2="6" y2="92" stroke="rgba(167,139,250,0.3)" strokeWidth="0.8" />

        {/* === CODE LINES on left monitor (x=5-70, y=25-72) === */}
        {[28, 34, 40, 46, 52, 58, 64].map((y, i) => (
          <rect key={`bct-code-${i}`} x={8} y={y} width={[28, 42, 20, 38, 32, 45, 24][i]} height="1.5" rx={0.5}
            fill="rgba(167,139,250,0.5)"
            style={{ animation: `ag-node-pulse ${3 + (i % 3) * 0.5}s ease-in-out ${i * 0.4}s infinite` }} />
        ))}

        {/* === ROBOTIC ARM GLOW — right side (x=285-315, y=35-65) === */}
        <path d="M 295 38 Q 305 45 310 55 Q 312 62 308 68"
          fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="0.8"
          strokeDasharray="4 4" style={{ animation: "ag-circuit-flow 5s linear 0.5s infinite" }} />
        <circle cx="308" cy="68" r="1.5" fill="rgba(167,139,250,0.5)"
          style={{ animation: "ag-node-pulse 2.5s ease-in-out infinite" }} />
        <circle cx="295" cy="38" r="1" fill="rgba(196,181,253,0.4)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />

        {/* === TABLET SCREEN data lines (x=195-235, y=115-150) === */}
        <path d="M 198 128 Q 208 122 218 126 Q 228 130 235 124"
          fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="1.0"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow 4s linear infinite" }} />
        <circle cx="210" cy="125" r="0.8" fill="rgba(196,181,253,0.5)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.3s infinite" }} />
      </>
    ),
    uniqueDesc: "Cerveau holographique + tablette tech",
    identityPos: "right",
  },

  // ─── 3. BCF — François (CFO) — EMERALD ───
  {
    code: "BCF",
    name: "François",
    role: "CFO AI — Directeur Finances",
    image: "/agents/generated/cfo-francois-standby-v3.png?v=5",
    dotColor: "#34d399",
    dotColorLight: "#6ee7b7",
    badgeGrad: "linear-gradient(135deg, #059669, #10b981)",
    suitPaths: [
      // Left side circuits
      "M 150 85 L 150 110 L 138 110 L 138 135",
      "M 145 95 L 145 115 L 130 115 L 130 140",
      "M 155 100 L 140 100 L 140 128 L 128 128",
      "M 148 120 L 135 120 L 135 150",
      // Right side circuits
      "M 175 82 L 175 105 L 188 105 L 188 130",
      "M 180 90 L 180 112 L 195 112 L 195 138",
      "M 170 108 L 185 108 L 185 140 L 195 140",
      "M 185 95 L 198 95 L 198 125",
    ],
    uniqueElement: (
      <>
        {/* Green holographic screen to his left (x=60-130, y=65-110) — shifted down +10 */}
        {/* Line chart on green holo screen */}
        <path d="M 62 92 Q 75 80 88 86 Q 100 92 112 78 Q 120 70 128 75"
          fill="none" stroke="rgba(52,211,153,0.55)" strokeWidth="1"
          strokeDasharray="6 6" style={{ animation: "ag-circuit-flow 6s linear infinite" }} />
        <path d="M 62 100 Q 78 88 92 94 Q 105 100 118 85 Q 125 78 128 82"
          fill="none" stroke="rgba(110,231,183,0.45)" strokeWidth="0.8"
          strokeDasharray="4 8" style={{ animation: "ag-circuit-flow-rev 7s linear 1s infinite" }} />
        {/* Second line - lower */}
        <path d="M 65 106 Q 80 98 95 102 Q 108 106 120 95 Q 126 90 130 94"
          fill="none" stroke="rgba(52,211,153,0.35)" strokeWidth="1.0"
          strokeDasharray="3 5" style={{ animation: "ag-circuit-flow 5s linear 0.5s infinite" }} />
        {/* Data points on green screen */}
        <circle cx="75" cy="82" r="1.2" fill="rgba(52,211,153,0.65)" style={{ animation: "ag-node-pulse 3s ease-in-out 0s infinite" }} />
        <circle cx="100" cy="90" r="1" fill="rgba(110,231,183,0.6)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.7s infinite" }} />
        <circle cx="118" cy="80" r="1.2" fill="rgba(52,211,153,0.65)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1.2s infinite" }} />
        <circle cx="88" cy="86" r="0.8" fill="rgba(110,231,183,0.55)" style={{ animation: "ag-node-pulse 3.2s ease-in-out 0.4s infinite" }} />
        {/* Mini bar chart on green screen */}
        {[68, 78, 88, 98, 108, 118].map((x, i) => (
          <rect key={`bcf-bar-${i}`} x={x} y={110 - [10, 18, 8, 20, 14, 16][i]} width={5} height={[10, 18, 8, 20, 14, 16][i]}
            rx={1} fill="rgba(52,211,153,0.35)"
            style={{ transformOrigin: `${x + 2.5}px 110px`, animation: `ag-bar-breathe ${3 + i * 0.3}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
        {/* Right Bloomberg screens (x=240-320, y=25-75) */}
        <path d="M 240 50 Q 255 40 270 48 Q 285 55 300 42 Q 310 35 320 40"
          fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="0.8"
          strokeDasharray="6 6" style={{ animation: "ag-circuit-flow 5.5s linear 0.5s infinite" }} />
        <path d="M 242 60 Q 260 50 278 58 Q 292 64 308 52 Q 316 46 322 50"
          fill="none" stroke="rgba(110,231,183,0.4)" strokeWidth="1.0"
          strokeDasharray="4 6" style={{ animation: "ag-circuit-flow-rev 6.5s linear 1s infinite" }} />
        {/* Data dots on right screens */}
        <circle cx="260" cy="44" r="1" fill="rgba(52,211,153,0.65)" style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />
        <circle cx="290" cy="48" r="0.8" fill="rgba(110,231,183,0.55)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />
        <circle cx="310" cy="38" r="1" fill="rgba(52,211,153,0.6)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1.5s infinite" }} />
        {/* Mini bar chart on right screen */}
        {[255, 265, 275, 285, 295, 305].map((x, i) => (
          <rect key={`bcf-rbar-${i}`} x={x} y={68 - [14, 22, 10, 26, 18, 20][i]} width={5} height={[14, 22, 10, 26, 18, 20][i]}
            rx={1} fill="rgba(52,211,153,0.3)"
            style={{ transformOrigin: `${x + 2.5}px 68px`, animation: `ag-bar-breathe ${3 + i * 0.3}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
      </>
    ),
    uniqueDesc: "Écrans Bloomberg + courbes financières animées",
  },

  // ─── 4. BCM — Martine (CMO) — PINK ───
  {
    code: "BCM",
    name: "Martine",
    role: "CMO AI — Directrice Marketing",
    image: "/agents/generated/cmo-martine-standby-v3.png?v=5",
    dotColor: "#f472b6",
    dotColorLight: "#f9a8d4",
    badgeGrad: "linear-gradient(135deg, #db2777, #ec4899)",
    suitPaths: [
      // Pink blazer circuits - left side
      "M 148 90 L 148 115 L 135 115 L 135 140",
      "M 142 98 L 142 118 L 128 118 L 128 145",
      "M 150 108 L 138 108 L 138 135 L 125 135",
      "M 145 125 L 132 125 L 132 150",
      // Right side
      "M 178 88 L 178 110 L 192 110 L 192 135",
      "M 185 95 L 185 115 L 198 115 L 198 140",
      "M 172 105 L 188 105 L 188 132 L 200 132",
      "M 180 120 L 195 120 L 195 148",
    ],
    uniqueElement: (
      <>
        {/* Floating UI cards / creative campaign elements around her */}
        {/* Floating card 1 - top right */}
        <rect x="240" y="50" width="35" height="22" rx="3" fill="none" stroke="rgba(244,114,182,0.5)" strokeWidth="1.2"
          style={{ animation: "ag-float 5s ease-in-out infinite" }} />
        <rect x="244" y="55" width="12" height="2" rx={1} fill="rgba(244,114,182,0.5)"
          style={{ animation: "ag-node-pulse 4s ease-in-out infinite" }} />
        <rect x="244" y="60" width="20" height="1.5" rx={1} fill="rgba(249,168,212,0.4)"
          style={{ animation: "ag-node-pulse 4.5s ease-in-out 0.5s infinite" }} />
        <rect x="244" y="65" width="16" height="1.5" rx={1} fill="rgba(244,114,182,0.4)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />
        {/* Floating card 2 - bottom right */}
        <rect x="250" y="95" width="30" height="18" rx="3" fill="none" stroke="rgba(249,168,212,0.45)" strokeWidth="1.2"
          style={{ animation: "ag-float 4.5s ease-in-out 1s infinite" }} />
        <circle cx="258" cy="104" r="3" fill="none" stroke="rgba(244,114,182,0.5)" strokeWidth="1.2"
          style={{ animation: "ag-ring-pulse 3.5s ease-in-out infinite" }} />
        {/* Connection line between cards */}
        <path d="M 257 72 Q 260 82 255 95" fill="none" stroke="rgba(244,114,182,0.4)" strokeWidth="1.0"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow 4s linear infinite" }} />
        {/* Floating circles - creative elements */}
        <circle cx="100" cy="55" r="5" fill="none" stroke="rgba(244,114,182,0.45)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 0.3s infinite" }} />
        <circle cx="105" cy="72" r="3" fill="none" stroke="rgba(249,168,212,0.4)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 4.5s ease-in-out 1.2s infinite" }} />

        {/* === BRAND CAMPAIGN SCREEN glow — left (x=15-75, y=50-100) === */}
        <rect x="18" y="52" width="55" height="35" rx="2" fill="none" stroke="rgba(244,114,182,0.5)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 6s ease-in-out 0.5s infinite" }} />
        {/* Bar chart on campaign screen */}
        {[22, 30, 38, 46, 54, 62].map((x, i) => (
          <rect key={`bcm-bar-${i}`} x={x} y={82 - [12, 18, 10, 22, 14, 16][i]} width={4} height={[12, 18, 10, 22, 14, 16][i]}
            rx={0.5} fill="rgba(244,114,182,0.55)"
            style={{ transformOrigin: `${x + 2}px 82px`, animation: `ag-bar-breathe ${3 + i * 0.3}s ease-in-out ${i * 0.25}s infinite` }} />
        ))}

        {/* === FLOATING HUD target rings — behind her (x=85-120, y=88-120) === */}
        <circle cx="88" cy="95" r="6" fill="none" stroke="rgba(244,114,182,0.3)" strokeWidth="1.0"
          strokeDasharray="4 8" style={{ animation: "ag-circuit-flow 8s linear infinite" }} />
        <circle cx="88" cy="95" r="3" fill="none" stroke="rgba(249,168,212,0.35)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 4s ease-in-out 0.8s infinite" }} />

        {/* === DATA CARD floating top-left (x=30-65, y=28-48) === */}
        <rect x="32" y="30" width="30" height="15" rx="2" fill="none" stroke="rgba(244,114,182,0.3)" strokeWidth="1.0"
          style={{ animation: "ag-float 6s ease-in-out 1.5s infinite" }} />
        <rect x="35" y="34" width="14" height="1.5" rx={0.5} fill="rgba(244,114,182,0.35)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <rect x="35" y="38" width="22" height="1.5" rx={0.5} fill="rgba(249,168,212,0.3)"
          style={{ animation: "ag-node-pulse 4s ease-in-out 1s infinite" }} />

        {/* === PIN BOARD highlights — right wall (x=260-315, y=40-95) === */}
        <circle cx="275" cy="48" r="1.5" fill="rgba(244,114,182,0.35)"
          style={{ animation: "ag-node-pulse 4s ease-in-out 0.2s infinite" }} />
        <circle cx="295" cy="55" r="1.5" fill="rgba(249,168,212,0.3)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.8s infinite" }} />
        <circle cx="285" cy="72" r="1.5" fill="rgba(244,114,182,0.3)"
          style={{ animation: "ag-node-pulse 4.5s ease-in-out 1.5s infinite" }} />
        <circle cx="305" cy="68" r="1.2" fill="rgba(249,168,212,0.55)"
          style={{ animation: "ag-node-pulse 3.8s ease-in-out 2s infinite" }} />
      </>
    ),
    uniqueDesc: "Cards UI flottantes + éléments créatifs",
  },

  // ─── 5. BCS — Sophie (CSO) — RED ───
  {
    code: "BCS",
    name: "Sophie",
    role: "CSO AI — Directrice Stratégie",
    image: "/agents/generated/cso-sophie-standby-v3.png?v=5",
    dotColor: "#f87171",
    dotColorLight: "#fca5a5",
    badgeGrad: "linear-gradient(135deg, #dc2626, #ef4444)",
    suitPaths: [
      // Red strategic suit circuits
      "M 160 85 L 160 108 L 148 108 L 148 132",
      "M 155 92 L 155 115 L 140 115 L 140 138",
      "M 165 100 L 150 100 L 150 128 L 138 128",
      "M 152 118 L 142 118 L 142 145",
      // Right side
      "M 182 82 L 182 105 L 195 105 L 195 130",
      "M 188 90 L 188 112 L 200 112 L 200 135",
      "M 178 102 L 192 102 L 192 130 L 202 130",
      "M 190 120 L 200 120 L 200 145",
    ],
    uniqueElement: (
      <>
        {/* World map with connection lines + chess glow */}
        {/* Map connection arcs */}
        <path d="M 20 45 Q 50 30 80 42" fill="none" stroke="rgba(248,113,113,0.5)" strokeWidth="1.2"
          strokeDasharray="4 4" style={{ animation: "ag-circuit-flow 5s linear infinite" }} />
        <path d="M 60 38 Q 85 25 110 35" fill="none" stroke="rgba(252,165,165,0.45)" strokeWidth="1.0"
          strokeDasharray="3 5" style={{ animation: "ag-circuit-flow 6s linear 1s infinite" }} />
        <path d="M 30 55 Q 55 48 90 50" fill="none" stroke="rgba(248,113,113,0.4)" strokeWidth="1.0"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow-rev 7s linear 0.5s infinite" }} />
        {/* Map location dots */}
        <circle cx="25" cy="45" r="1.2" fill="rgba(248,113,113,0.7)" style={{ animation: "ag-node-pulse 3s ease-in-out 0s infinite" }} />
        <circle cx="55" cy="35" r="1" fill="rgba(252,165,165,0.6)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <circle cx="85" cy="42" r="1.2" fill="rgba(248,113,113,0.65)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1s infinite" }} />
        <circle cx="110" cy="35" r="0.8" fill="rgba(252,165,165,0.6)" style={{ animation: "ag-node-pulse 4s ease-in-out 1.5s infinite" }} />
        {/* Chess board glow - bottom right */}
        <rect x="260" y="140" width="40" height="30" rx="2" fill="none" stroke="rgba(248,113,113,0.3)" strokeWidth="1.2"
          style={{ animation: "ag-ring-pulse 5s ease-in-out infinite" }} />
        {/* Chess grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`chess-h-${i}`} x1="262" y1={143 + i * 6} x2="298" y2={143 + i * 6}
            stroke="rgba(248,113,113,0.55)" strokeWidth="0.8" />
        ))}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`chess-v-${i}`} x1={262 + i * 7.2} y1="142" x2={262 + i * 7.2} y2="168"
            stroke="rgba(248,113,113,0.55)" strokeWidth="0.8" />
        ))}

        {/* === TIME ZONE CLOCKS — top right (x=270-320, y=15-35) === */}
        {/* Clock box glows — LDN, NYC, HKG, SYD */}
        {[272, 284, 296, 308].map((x, i) => (
          <g key={`bcs-clock-${i}`}>
            <rect x={x} y={18} width={10} height={7} rx={1} fill="none" stroke="rgba(248,113,113,0.35)" strokeWidth="1.0"
              style={{ animation: `ag-node-pulse ${3 + i * 0.3}s ease-in-out ${i * 0.5}s infinite` }} />
            <rect x={x + 2} y={20} width={6} height="2" rx={0.5} fill="rgba(248,113,113,0.4)"
              style={{ animation: `ag-node-pulse ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }} />
          </g>
        ))}

        {/* === CHESS PIECES GLOW — on chess board === */}
        <circle cx="268" cy="150" r="2" fill="rgba(248,113,113,0.55)"
          style={{ animation: "ag-node-pulse 4s ease-in-out infinite" }} />
        <circle cx="282" cy="156" r="2" fill="rgba(252,165,165,0.5)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <circle cx="290" cy="148" r="1.8" fill="rgba(248,113,113,0.5)"
          style={{ animation: "ag-node-pulse 3.8s ease-in-out 1s infinite" }} />

        {/* === MAP SCAN LINE — horizontal sweep across world map === */}
        <line x1="15" y1="42" x2="120" y2="42" stroke="rgba(248,113,113,0.5)" strokeWidth="0.8"
          style={{ animation: "ag-scan-down 8s linear infinite" }} />

        {/* === ADDITIONAL map arcs — more connections === */}
        <path d="M 45 50 Q 70 42 95 48" fill="none" stroke="rgba(248,113,113,0.35)" strokeWidth="1.0"
          strokeDasharray="2 4" style={{ animation: "ag-circuit-flow 8s linear 2s infinite" }} />
        <circle cx="45" cy="50" r="0.8" fill="rgba(248,113,113,0.5)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 2s infinite" }} />

        {/* === MILITARY CONSOLE glow — bottom left (x=15-50, y=130-160) === */}
        <rect x="15" y="135" width="35" height="22" rx="2" fill="none" stroke="rgba(248,113,113,0.38)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 6s ease-in-out 1s infinite" }} />
        <rect x="18" y="140" width="18" height="1.5" rx={0.5} fill="rgba(248,113,113,0.55)"
          style={{ animation: "ag-node-pulse 4s ease-in-out 0.5s infinite" }} />
        <rect x="18" y="145" width="12" height="1.5" rx={0.5} fill="rgba(252,165,165,0.5)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />
      </>
    ),
    uniqueDesc: "Carte mondiale + connexions stratégiques + échiquier",
  },

  // ─── 6. BOO — Olivier (COO) — ORANGE ───
  {
    code: "BOO",
    name: "Olivier",
    role: "COO AI — Directeur Opérations",
    image: "/agents/generated/coo-olivier-standby-v3.png?v=5",
    dotColor: "#fb923c",
    dotColorLight: "#fdba74",
    badgeGrad: "linear-gradient(135deg, #ea580c, #f97316)",
    suitPaths: [
      // Orange circuit jacket - very prominent circuits
      "M 155 78 L 155 102 L 142 102 L 142 128",
      "M 148 85 L 148 108 L 135 108 L 135 132",
      "M 160 95 L 145 95 L 145 122 L 132 122",
      "M 150 110 L 138 110 L 138 138",
      // Right side
      "M 180 76 L 180 100 L 195 100 L 195 125",
      "M 188 82 L 188 105 L 202 105 L 202 130",
      "M 175 98 L 190 98 L 190 126 L 205 126",
      "M 195 88 L 208 88 L 208 118",
    ],
    uniqueElement: (
      <>
        {/* HUD dashboard to the right + robotic arm sparks */}
        {/* HUD panel right side */}
        <rect x="240" y="40" width="60" height="45" rx="3" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 5s ease-in-out infinite" }} />
        {/* Mini donut */}
        <circle cx="295" cy="52" r="6" fill="none" stroke="rgba(251,146,60,0.3)" strokeWidth="1.5" />
        <circle cx="295" cy="52" r="6" fill="none" stroke="rgba(251,146,60,0.6)" strokeWidth="1.5"
          strokeDasharray="12 26" style={{ animation: "ag-circuit-flow 5s linear infinite" }} />
        {/* Bar chart in HUD */}
        {[248, 256, 264, 272].map((x, i) => (
          <rect key={`boo-hud-${i}`} x={x} y={78 - [16, 24, 12, 20][i]} width={5} height={[16, 24, 12, 20][i]}
            rx={1} fill="rgba(251,146,60,0.4)"
            style={{ transformOrigin: `${x + 2.5}px 78px`, animation: `ag-bar-breathe ${2.8 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
        {/* Efficiency % text area glow */}
        <rect x="245" y="42" width="28" height="8" rx="1" fill="rgba(253,186,116,0.55)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />
        {/* Robotic arm sparks - left side */}
        <circle cx="40" cy="105" r="0.8" fill="rgba(251,146,60,0.8)"
          style={{ animation: "ag-spark 2.5s ease-out 0s infinite" }} />
        <circle cx="45" cy="108" r="0.6" fill="rgba(253,186,116,0.7)"
          style={{ animation: "ag-spark 3s ease-out 0.8s infinite" }} />
        <circle cx="38" cy="112" r="0.7" fill="rgba(251,146,60,0.75)"
          style={{ animation: "ag-spark 2.8s ease-out 1.5s infinite" }} />

        {/* === MACHINE INDICATOR LEDs — left factory floor (x=10-55, y=50-90) === */}
        {[{x:15,y:55},{x:22,y:62},{x:12,y:72},{x:28,y:78},{x:18,y:85},{x:48,y:58}].map((p, i) => (
          <circle key={`boo-led-${i}`} cx={p.x} cy={p.y} r="1" fill={i % 3 === 0 ? "rgba(52,211,153,0.5)" : "rgba(251,146,60,0.5)"}
            style={{ animation: `ag-node-pulse ${2 + i * 0.5}s ease-in-out ${i * 0.4}s infinite` }} />
        ))}

        {/* === CEILING INDUSTRIAL LIGHTS glow (x=60-270, y=5-15) === */}
        {[80, 130, 180, 230].map((x, i) => (
          <rect key={`boo-ceil-${i}`} x={x} y={5} width={30} height="3" rx={1}
            fill="rgba(253,186,116,0.38)"
            style={{ animation: `ag-node-pulse ${4 + i * 0.5}s ease-in-out ${i * 0.5}s infinite` }} />
        ))}

        {/* === CONVEYOR BELT MOTION — bottom center (x=85-240, y=145-155) === */}
        <path d="M 85 150 L 240 150" fill="none" stroke="rgba(251,146,60,0.38)" strokeWidth="1.0"
          strokeDasharray="6 8" style={{ animation: "ag-circuit-flow 4s linear infinite" }} />
        <path d="M 85 153 L 240 153" fill="none" stroke="rgba(251,146,60,0.3)" strokeWidth="0.8"
          strokeDasharray="4 10" style={{ animation: "ag-circuit-flow 5s linear 0.5s infinite" }} />

        {/* === RIGHT ROBOTIC ARM glow (x=285-320, y=100-140) === */}
        <path d="M 290 105 Q 300 112 305 122 Q 308 132 312 138"
          fill="none" stroke="rgba(251,146,60,0.3)" strokeWidth="0.8"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow 5.5s linear 1s infinite" }} />
        <circle cx="312" cy="138" r="1.2" fill="rgba(251,146,60,0.6)"
          style={{ animation: "ag-node-pulse 2.5s ease-in-out 0.5s infinite" }} />
        {/* Right arm sparks */}
        <circle cx="315" cy="135" r="0.6" fill="rgba(251,191,36,0.7)"
          style={{ animation: "ag-spark 2.2s ease-out 0.3s infinite" }} />
        <circle cx="310" cy="140" r="0.5" fill="rgba(253,224,71,0.6)"
          style={{ animation: "ag-spark 2.8s ease-out 1s infinite" }} />
      </>
    ),
    uniqueDesc: "Dashboard HUD opérationnel + étincelles bras robotiques",
  },

  // ─── 7. BHR — Hélène (CHRO) — TEAL ───
  {
    code: "BHR",
    name: "Hélène",
    role: "CHRO AI — Directrice Ressources Humaines",
    image: "/agents/generated/chro-helene-standby-v3.png?v=5",
    dotColor: "#2dd4bf",
    dotColorLight: "#5eead4",
    badgeGrad: "linear-gradient(135deg, #0d9488, #14b8a6)",
    suitPaths: [
      // Teal blazer circuits - centered on torso
      "M 172 82 L 172 105 L 185 105 L 185 130",
      "M 178 88 L 178 110 L 192 110 L 192 135",
      "M 168 95 L 180 95 L 180 122 L 195 122",
      "M 175 108 L 188 108 L 188 138",
      // Left side
      "M 158 85 L 158 105 L 145 105 L 145 128",
      "M 152 92 L 152 112 L 138 112 L 138 135",
      "M 162 100 L 148 100 L 148 125",
    ],
    uniqueElement: (
      <>
        {/* Holographic org chart / mind map — large, to her left (x=45-140, y=50-115) */}
        {/* Root node - big */}
        <rect x="72" y="55" width="35" height="12" rx="3" fill="rgba(45,212,191,0.38)" stroke="rgba(45,212,191,0.6)" strokeWidth="1.2"
          style={{ animation: "ag-node-pulse 4s ease-in-out infinite" }} />
        {/* Branch lines from root to level 2 */}
        <line x1="89" y1="67" x2="55" y2="82" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
        <line x1="89" y1="67" x2="89" y2="82" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
        <line x1="89" y1="67" x2="125" y2="82" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
        {/* Level 2 nodes */}
        <rect x="40" y="82" width="28" height="10" rx="2" fill="rgba(94,234,212,0.3)" stroke="rgba(94,234,212,0.55)" strokeWidth="1"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <rect x="75" y="82" width="28" height="10" rx="2" fill="rgba(45,212,191,0.3)" stroke="rgba(45,212,191,0.55)" strokeWidth="1"
          style={{ animation: "ag-node-pulse 3.8s ease-in-out 1s infinite" }} />
        <rect x="112" y="82" width="28" height="10" rx="2" fill="rgba(94,234,212,0.3)" stroke="rgba(94,234,212,0.55)" strokeWidth="1"
          style={{ animation: "ag-node-pulse 3.2s ease-in-out 1.5s infinite" }} />
        {/* Level 3 branches + nodes */}
        <line x1="54" y1="92" x2="45" y2="104" stroke="rgba(45,212,191,0.4)" strokeWidth="0.8" />
        <line x1="54" y1="92" x2="65" y2="104" stroke="rgba(45,212,191,0.4)" strokeWidth="0.8" />
        <line x1="126" y1="92" x2="118" y2="104" stroke="rgba(45,212,191,0.4)" strokeWidth="0.8" />
        <line x1="126" y1="92" x2="136" y2="104" stroke="rgba(45,212,191,0.4)" strokeWidth="0.8" />
        <rect x="35" y="104" width="22" height="8" rx="2" fill="rgba(94,234,212,0.25)" stroke="rgba(94,234,212,0.45)" strokeWidth="0.8"
          style={{ animation: "ag-node-pulse 4s ease-in-out 2s infinite" }} />
        <rect x="55" y="104" width="22" height="8" rx="2" fill="rgba(45,212,191,0.25)" stroke="rgba(45,212,191,0.45)" strokeWidth="0.8"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 2.5s infinite" }} />
        <rect x="108" y="104" width="22" height="8" rx="2" fill="rgba(94,234,212,0.25)" stroke="rgba(94,234,212,0.45)" strokeWidth="0.8"
          style={{ animation: "ag-node-pulse 3.8s ease-in-out 1.8s infinite" }} />
        <rect x="128" y="104" width="22" height="8" rx="2" fill="rgba(45,212,191,0.25)" stroke="rgba(45,212,191,0.45)" strokeWidth="0.8"
          style={{ animation: "ag-node-pulse 3.2s ease-in-out 2.2s infinite" }} />
        {/* Pulsing dots at node intersections */}
        <circle cx="89" cy="61" r="1.5" fill="rgba(45,212,191,0.7)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3s ease-in-out 0s infinite" }} />
        <circle cx="54" cy="87" r="1.2" fill="rgba(94,234,212,0.6)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <circle cx="89" cy="87" r="1.2" fill="rgba(45,212,191,0.6)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1s infinite" }} />
        <circle cx="126" cy="87" r="1.2" fill="rgba(94,234,212,0.6)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3.2s ease-in-out 1.5s infinite" }} />

        {/* === WARM LAMP GLOW — right background (x=280-310, y=28-55) === */}
        <circle cx="295" cy="38" r="12" fill="rgba(253,224,71,0.25)"
          style={{ animation: "ag-ring-pulse 6s ease-in-out infinite" }} />
        <circle cx="295" cy="38" r="6" fill="rgba(253,224,71,0.3)"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 1s infinite" }} />

        {/* === MONSTERA LEAF silhouette — left (x=18-52, y=58-110) === */}
        <path d="M 30 68 Q 22 78 25 90 Q 28 100 35 108"
          fill="none" stroke="rgba(45,212,191,0.5)" strokeWidth="1.0" />
        <path d="M 38 62 Q 32 72 34 85 Q 36 95 42 102"
          fill="none" stroke="rgba(94,234,212,0.38)" strokeWidth="1.0" />
        <circle cx="33" cy="85" r="0.8" fill="rgba(45,212,191,0.3)"
          style={{ animation: "ag-node-pulse 5s ease-in-out 1s infinite" }} />

        {/* === BOOKSHELF spine glows — right side (x=272-315, y=58-105) === */}
        {[62, 70, 78, 86, 94].map((y, i) => (
          <rect key={`bhr-book-${i}`} x={278 + (i % 2) * 15} y={y} width="2" height="6" rx={0.5}
            fill="rgba(45,212,191,0.5)"
            style={{ animation: `ag-node-pulse ${4 + i * 0.5}s ease-in-out ${i * 0.8}s infinite` }} />
        ))}

        {/* === PEN + NOTEPAD area glow — on desk (x=140-175, y=140-160) === */}
        <rect x="145" y="145" width="25" height="12" rx="1" fill="rgba(45,212,191,0.3)"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 2s infinite" }} />
        <line x1="148" y1="148" x2="165" y2="148" stroke="rgba(94,234,212,0.5)" strokeWidth="0.8" />
        <line x1="148" y1="152" x2="160" y2="152" stroke="rgba(94,234,212,0.38)" strokeWidth="0.8" />
      </>
    ),
    uniqueDesc: "Organigramme holographique interactif",
  },

  // ─── 8. BIO — Inès (CINO) — CYAN/PINK ───
  {
    code: "BIO",
    name: "Inès",
    role: "CINO AI — Directrice Innovation",
    image: "/agents/generated/cino-ines-standby-v3.png?v=5",
    dotColor: "#f472b6",
    dotColorLight: "#fb7185",
    badgeGrad: "linear-gradient(135deg, #06b6d4, #ec4899)",
    suitPaths: [
      // Pink/cyan circuit blazer
      "M 158 78 L 158 100 L 145 100 L 145 125",
      "M 152 85 L 152 108 L 138 108 L 138 132",
      "M 162 95 L 148 95 L 148 122 L 135 122",
      "M 155 110 L 142 110 L 142 138",
      // Right side
      "M 178 75 L 178 98 L 190 98 L 190 122",
      "M 185 82 L 185 105 L 198 105 L 198 128",
      "M 172 92 L 188 92 L 188 120 L 200 120",
    ],
    uniqueElement: (
      <>
        {/* === BRAIN 3D — HUGE, right side (x=210-290, y=25-95) === */}
        {/* Outer brain ring */}
        <circle cx="250" cy="58" r="32" fill="none" stroke="rgba(244,114,182,0.5)" strokeWidth="1.2"
          style={{ animation: "ag-ring-pulse 5s ease-in-out infinite" }} />
        {/* Mid ring */}
        <circle cx="250" cy="58" r="22" fill="none" stroke="rgba(251,113,133,0.55)" strokeWidth="1"
          style={{ animation: "ag-ring-pulse 4.5s ease-in-out 0.7s infinite" }} />
        {/* Inner ring */}
        <circle cx="250" cy="58" r="12" fill="none" stroke="rgba(244,114,182,0.6)" strokeWidth="1"
          style={{ animation: "ag-ring-pulse 4s ease-in-out 1.4s infinite" }} />
        {/* Neural network paths — spanning the brain area */}
        <path d="M 228 48 Q 240 38 255 42 Q 268 46 272 55" fill="none" stroke="rgba(244,114,182,0.55)" strokeWidth="1"
          strokeDasharray="4 4" style={{ animation: "ag-circuit-flow 5s linear infinite" }} />
        <path d="M 225 62 Q 238 70 252 65 Q 265 58 275 65" fill="none" stroke="rgba(251,113,133,0.5)" strokeWidth="0.8"
          strokeDasharray="3 5" style={{ animation: "ag-circuit-flow-rev 6s linear 0.5s infinite" }} />
        <path d="M 235 40 L 248 52 L 260 45 L 265 58 L 255 68 L 242 60 L 235 40" fill="none" stroke="rgba(244,114,182,0.4)" strokeWidth="0.8"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow 7s linear 1s infinite" }} />
        <path d="M 240 72 Q 250 78 262 72 Q 270 65 268 52" fill="none" stroke="rgba(251,113,133,0.35)" strokeWidth="1.0"
          strokeDasharray="2 4" style={{ animation: "ag-circuit-flow-rev 5.5s linear 1.5s infinite" }} />
        {/* Big neuron dots with glow */}
        <circle cx="240" cy="45" r="2" fill="rgba(244,114,182,0.8)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3s ease-in-out 0s infinite" }} />
        <circle cx="262" cy="50" r="1.8" fill="rgba(251,113,133,0.75)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        <circle cx="250" cy="60" r="2" fill="rgba(244,114,182,0.8)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1s infinite" }} />
        <circle cx="235" cy="58" r="1.5" fill="rgba(251,113,133,0.7)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 4s ease-in-out 1.5s infinite" }} />
        <circle cx="268" cy="62" r="1.5" fill="rgba(244,114,182,0.7)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3.2s ease-in-out 0.8s infinite" }} />
        <circle cx="248" cy="48" r="1.2" fill="rgba(251,113,133,0.65)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3.8s ease-in-out 2s infinite" }} />
        <circle cx="258" cy="70" r="1.2" fill="rgba(244,114,182,0.65)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3s ease-in-out 2.5s infinite" }} />
        {/* === MONITOR SCREEN below brain (x=200-310, y=95-135) === */}
        <rect x="205" y="98" width="100" height="35" rx="3" fill="none" stroke="rgba(244,114,182,0.55)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 1s infinite" }} />
        {/* Line chart on screen */}
        <path d="M 210 118 Q 225 108 240 115 Q 255 122 270 105 Q 285 95 298 108"
          fill="none" stroke="rgba(244,114,182,0.45)" strokeWidth="0.8"
          strokeDasharray="5 5" style={{ animation: "ag-circuit-flow 5.5s linear infinite" }} />
        {/* Data dots on screen */}
        <circle cx="225" cy="110" r="1.2" fill="rgba(244,114,182,0.6)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3s ease-in-out 0.3s infinite" }} />
        <circle cx="255" cy="120" r="1" fill="rgba(251,113,133,0.55)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 1.2s infinite" }} />
        <circle cx="285" cy="100" r="1.2" fill="rgba(244,114,182,0.6)" filter="url(#ag-glow)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 0.8s infinite" }} />

        {/* === WHITEBOARD / IDEA BOARD — left wall (x=10-80, y=22-80) === */}
        {/* Board outline */}
        <rect x="12" y="25" width="65" height="50" rx="2" fill="none" stroke="rgba(244,114,182,0.38)" strokeWidth="0.8" />
        {/* Sketch squares / sticky notes on board */}
        {[{x:16,y:30,w:12,h:10},{x:32,y:28,w:14,h:12},{x:50,y:32,w:12,h:10},{x:18,y:48,w:16,h:12},{x:40,y:50,w:14,h:10},{x:58,y:46,w:14,h:12}].map((r, i) => (
          <rect key={`bio-note-${i}`} x={r.x} y={r.y} width={r.w} height={r.h} rx={1}
            fill="rgba(244,114,182,0.25)" stroke="rgba(244,114,182,0.5)" strokeWidth="0.8"
            style={{ animation: `ag-node-pulse ${4 + i * 0.5}s ease-in-out ${i * 0.6}s infinite` }} />
        ))}
        {/* Connection lines between notes */}
        <line x1="28" y1="35" x2="32" y2="34" stroke="rgba(251,113,133,0.5)" strokeWidth="0.8" />
        <line x1="46" y1="34" x2="50" y2="37" stroke="rgba(244,114,182,0.5)" strokeWidth="0.8" />
        <line x1="34" y1="40" x2="26" y2="48" stroke="rgba(251,113,133,0.38)" strokeWidth="0.8" />

        {/* === DESK OBJECTS glow — bottom (x=200-270, y=130-155) === */}
        {/* 3D printed objects / art supplies */}
        <circle cx="215" cy="140" r="3" fill="none" stroke="rgba(244,114,182,0.5)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 2s infinite" }} />
        <circle cx="235" cy="145" r="2" fill="none" stroke="rgba(251,113,133,0.55)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 4s ease-in-out 1s infinite" }} />
        <rect x="248" y="138" width="8" height="12" rx={1} fill="none" stroke="rgba(244,114,182,0.38)" strokeWidth="0.8"
          style={{ animation: "ag-node-pulse 5s ease-in-out 1.5s infinite" }} />
      </>
    ),
    uniqueDesc: "Cerveau neural 3D flottant holographique",
    identityPos: "right",
  },

  // ─── 9. BRO — Raphaël (CRO) — AMBER ───
  {
    code: "BRO",
    name: "Raphaël",
    role: "CRO AI — Directeur Revenus",
    image: "/agents/generated/cro-raphael-standby-v3.png?v=5",
    dotColor: "#fbbf24",
    dotColorLight: "#fcd34d",
    badgeGrad: "linear-gradient(135deg, #d97706, #f59e0b)",
    suitPaths: [
      // Amber/gold circuit suit
      "M 155 82 L 155 105 L 142 105 L 142 130",
      "M 148 88 L 148 112 L 135 112 L 135 135",
      "M 160 98 L 148 98 L 148 125 L 135 125",
      "M 150 115 L 138 115 L 138 140",
      // Right side
      "M 180 80 L 180 102 L 195 102 L 195 128",
      "M 188 85 L 188 108 L 200 108 L 200 132",
      "M 175 95 L 190 95 L 190 125 L 202 125",
      "M 185 110 L 198 110 L 198 138",
    ],
    uniqueElement: (
      <>
        {/* Curved screens behind with sales charts + HUD tablet */}
        {/* Top curved screens - growth charts */}
        <path d="M 30 30 Q 50 22 70 28 Q 90 34 110 25 Q 120 20 130 24"
          fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"
          strokeDasharray="6 5" style={{ animation: "ag-circuit-flow 5.5s linear infinite" }} />
        <path d="M 200 28 Q 220 20 240 26 Q 260 32 280 22 Q 295 16 310 22"
          fill="none" stroke="rgba(252,211,77,0.45)" strokeWidth="1.4"
          strokeDasharray="5 6" style={{ animation: "ag-circuit-flow-rev 6s linear 0.5s infinite" }} />
        {/* Data dots on screens */}
        <circle cx="50" cy="24" r="1" fill="rgba(251,191,36,0.65)" style={{ animation: "ag-node-pulse 3s ease-in-out 0s infinite" }} />
        <circle cx="90" cy="32" r="1.2" fill="rgba(252,211,77,0.6)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.7s infinite" }} />
        <circle cx="240" cy="24" r="1" fill="rgba(251,191,36,0.65)" style={{ animation: "ag-node-pulse 2.8s ease-in-out 1s infinite" }} />
        <circle cx="280" cy="25" r="0.8" fill="rgba(252,211,77,0.6)" style={{ animation: "ag-node-pulse 4s ease-in-out 0.5s infinite" }} />
        {/* HUD tablet in his hand - right side */}
        <rect x="225" y="95" width="35" height="25" rx="2" fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 4.5s ease-in-out infinite" }} />
        <path d="M 230 102 Q 240 98 250 105" fill="none" stroke="rgba(251,191,36,0.45)" strokeWidth="1.0"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow 4s linear infinite" }} />

        {/* === DONUT CHARTS on curved screens === */}
        {/* Left screen donut (x=75, y=28) */}
        <circle cx="75" cy="28" r="7" fill="none" stroke="rgba(251,191,36,0.38)" strokeWidth="1.5" />
        <circle cx="75" cy="28" r="7" fill="none" stroke="rgba(251,191,36,0.45)" strokeWidth="1.5"
          strokeDasharray="14 30" style={{ animation: "ag-circuit-flow 6s linear infinite" }} />
        {/* Right screen donut (x=260, y=25) */}
        <circle cx="260" cy="25" r="6" fill="none" stroke="rgba(252,211,77,0.38)" strokeWidth="1.2" />
        <circle cx="260" cy="25" r="6" fill="none" stroke="rgba(252,211,77,0.4)" strokeWidth="1.2"
          strokeDasharray="12 26" style={{ animation: "ag-circuit-flow-rev 5.5s linear infinite" }} />

        {/* === MORE CHART LINES on center screens (x=130-190, y=15-42) === */}
        <path d="M 135 35 Q 150 25 165 32 Q 178 38 188 28"
          fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth="0.8"
          strokeDasharray="4 5" style={{ animation: "ag-circuit-flow 6.5s linear 1s infinite" }} />
        <circle cx="152" cy="28" r="0.8" fill="rgba(251,191,36,0.5)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />
        <circle cx="175" cy="35" r="0.8" fill="rgba(252,211,77,0.45)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />

        {/* === WORKSTATION SCREEN GLOWS — behind him === */}
        {/* Left workstations (x=20-50, y=92-115) */}
        <rect x="22" y="95" width="22" height="14" rx="1" fill="none" stroke="rgba(251,191,36,0.38)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 0.5s infinite" }} />
        <rect x="25" y="98" width="10" height="1.5" rx={0.5} fill="rgba(251,191,36,0.5)"
          style={{ animation: "ag-node-pulse 4s ease-in-out 0.5s infinite" }} />
        {/* Right workstations (x=290-318, y=85-108) */}
        <rect x="292" y="88" width="22" height="14" rx="1" fill="none" stroke="rgba(252,211,77,0.38)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 6s ease-in-out 1s infinite" }} />
        <rect x="295" y="92" width="12" height="1.5" rx={0.5} fill="rgba(252,211,77,0.42)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />
      </>
    ),
    uniqueDesc: "Écrans courbes ventes + tablette HUD interactive",
  },

  // ─── 10. BLE — Louise (CLO) — INDIGO ───
  {
    code: "BLE",
    name: "Louise",
    role: "CLO AI — Directrice Juridique",
    image: "/agents/generated/clo-louise-standby-v3.png?v=5",
    dotColor: "#818cf8",
    dotColorLight: "#a5b4fc",
    badgeGrad: "linear-gradient(135deg, #4338ca, #6366f1)",
    suitPaths: [
      // Indigo geometric suit pattern
      "M 155 78 L 155 100 L 142 100 L 142 125",
      "M 148 85 L 148 108 L 135 108 L 135 132",
      "M 162 92 L 148 92 L 148 118 L 135 118",
      "M 152 105 L 140 105 L 140 135",
      // Right side
      "M 178 76 L 178 98 L 192 98 L 192 122",
      "M 185 82 L 185 105 L 198 105 L 198 128",
      "M 172 95 L 188 95 L 188 120 L 200 120",
      "M 180 108 L 195 108 L 195 135",
    ],
    uniqueElement: (
      <>
        {/* Legal dashboard hologram to her right */}
        <rect x="245" y="48" width="55" height="38" rx="3" fill="none" stroke="rgba(129,140,248,0.4)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 5s ease-in-out infinite" }} />
        {/* Data lines on screen */}
        <path d="M 250 55 Q 265 50 280 58 Q 290 62 298 55"
          fill="none" stroke="rgba(129,140,248,0.5)" strokeWidth="1.4"
          strokeDasharray="5 5" style={{ animation: "ag-circuit-flow 5s linear infinite" }} />
        <path d="M 250 65 Q 262 60 278 68 Q 288 72 295 65"
          fill="none" stroke="rgba(165,180,252,0.4)" strokeWidth="1.2"
          strokeDasharray="4 6" style={{ animation: "ag-circuit-flow-rev 6s linear 0.5s infinite" }} />
        {/* Mini bars */}
        {[252, 260, 268, 276, 284].map((x, i) => (
          <rect key={`ble-bar-${i}`} x={x} y={82 - [10, 16, 8, 14, 12][i]} width={4} height={[10, 16, 8, 14, 12][i]}
            rx={1} fill="rgba(129,140,248,0.3)"
            style={{ transformOrigin: `${x + 2}px 82px`, animation: `ag-bar-breathe ${3 + i * 0.3}s ease-in-out ${i * 0.25}s infinite` }} />
        ))}
        {/* Document icon glow */}
        <rect x="255" y="52" width="8" height="10" rx="1" fill="none" stroke="rgba(165,180,252,0.45)" strokeWidth="0.8"
          style={{ animation: "ag-node-pulse 4s ease-in-out 1s infinite" }} />

        {/* === BOOK SPINE HIGHLIGHTS — left bookshelves (x=8-55, y=18-145) === */}
        {[{x:12,y:22},{x:18,y:35},{x:14,y:48},{x:20,y:60},{x:10,y:72},{x:16,y:85},{x:22,y:98},{x:12,y:110},{x:18,y:122}].map((p, i) => (
          <rect key={`ble-book-${i}`} x={p.x} y={p.y} width="2" height="8" rx={0.5}
            fill="rgba(129,140,248,0.38)"
            style={{ animation: `ag-node-pulse ${4 + (i % 4) * 0.5}s ease-in-out ${i * 0.5}s infinite` }} />
        ))}
        {/* Shelf lines */}
        {[30, 55, 80, 105, 128].map((y, i) => (
          <line key={`ble-shelf-${i}`} x1="5" y1={y} x2="45" y2={y}
            stroke="rgba(129,140,248,0.3)" strokeWidth="0.8" />
        ))}

        {/* === CITY WINDOW GLOW — right side through glass (x=280-325, y=30-90) === */}
        {/* Building silhouette lights */}
        {[{x:288,y:45},{x:295,y:38},{x:302,y:50},{x:310,y:42},{x:315,y:55},{x:290,y:62},{x:305,y:65}].map((p, i) => (
          <rect key={`ble-city-${i}`} x={p.x} y={p.y} width="3" height="2" rx={0.5}
            fill="rgba(253,224,71,0.38)"
            style={{ animation: `ag-node-pulse ${3 + i * 0.4}s ease-in-out ${i * 0.5}s infinite` }} />
        ))}

        {/* === MORE DASHBOARD DATA — second panel (x=245-300, y=92-115) === */}
        <path d="M 250 98 Q 262 92 278 100 Q 288 105 296 98"
          fill="none" stroke="rgba(129,140,248,0.35)" strokeWidth="1.0"
          strokeDasharray="3 4" style={{ animation: "ag-circuit-flow 5.5s linear 1.5s infinite" }} />
        <circle cx="268" cy="95" r="0.8" fill="rgba(165,180,252,0.45)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />
      </>
    ),
    uniqueDesc: "Dashboard juridique holographique + graphiques",
  },

  // ─── 11. BSE — SecBot (CISO) — ZINC ───
  {
    code: "BSE",
    name: "Sébastien",
    role: "CISO AI — Directeur Cybersécurité",
    image: "/agents/generated/ciso-secbot-standby-v3.png?v=5",
    dotColor: "#a1a1aa",
    dotColorLight: "#d4d4d8",
    badgeGrad: "linear-gradient(135deg, #52525b, #71717a)",
    suitPaths: [
      // Zinc/silver circuit vest
      "M 160 82 L 160 105 L 148 105 L 148 128",
      "M 155 88 L 155 112 L 142 112 L 142 135",
      "M 165 98 L 152 98 L 152 125 L 140 125",
      "M 158 115 L 145 115 L 145 142",
      // Right side
      "M 180 80 L 180 102 L 192 102 L 192 125",
      "M 188 85 L 188 108 L 200 108 L 200 132",
      "M 175 95 L 190 95 L 190 122 L 202 122",
    ],
    uniqueElement: (
      <>
        {/* Shield icon pulsing - right side */}
        <path d="M 250 82 L 250 68 L 260 62 L 270 68 L 270 82 Q 260 92 250 82 Z"
          fill="none" stroke="rgba(161,161,170,0.6)" strokeWidth="1.4"
          style={{ animation: "ag-shield-pulse 4s ease-in-out infinite" }} />
        <path d="M 254 78 L 254 72 L 260 68 L 266 72 L 266 78 Q 260 84 254 78 Z"
          fill="none" stroke="rgba(212,212,216,0.5)" strokeWidth="1.0"
          style={{ animation: "ag-shield-pulse 3.5s ease-in-out 0.5s infinite" }} />
        {/* Shield center dot */}
        <circle cx="260" cy="75" r="1.5" fill="rgba(161,161,170,0.7)"
          style={{ animation: "ag-node-pulse 3s ease-in-out infinite" }} />
        {/* World map threat lines - behind on monitors */}
        <path d="M 15 42 Q 40 32 65 40 Q 85 46 105 38"
          fill="none" stroke="rgba(248,113,113,0.45)" strokeWidth="1.0"
          strokeDasharray="4 4" style={{ animation: "ag-circuit-flow 6s linear infinite" }} />
        <path d="M 20 55 Q 50 48 80 54 Q 100 58 115 50"
          fill="none" stroke="rgba(161,161,170,0.4)" strokeWidth="1.0"
          strokeDasharray="3 5" style={{ animation: "ag-circuit-flow-rev 7s linear 1s infinite" }} />
        {/* Threat dots on monitors */}
        <circle cx="30" cy="38" r="1" fill="rgba(248,113,113,0.6)" style={{ animation: "ag-node-pulse 2.5s ease-in-out 0s infinite" }} />
        <circle cx="70" cy="42" r="0.8" fill="rgba(248,113,113,0.7)" style={{ animation: "ag-node-pulse 3s ease-in-out 0.8s infinite" }} />
        <circle cx="95" cy="40" r="1" fill="rgba(248,113,113,0.6)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 1.5s infinite" }} />
        {/* Alert status text glow */}
        <rect x="248" y="95" width="30" height="6" rx="1" fill="rgba(161,161,170,0.55)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.5s infinite" }} />

        {/* === MONITOR SCAN LINES — across multiple screens (left wall x=5-140, y=30-120) === */}
        {/* Horizontal data scroll on monitors */}
        {[{x1:8,y:35,x2:60},{x1:65,y:38,x2:135},{x1:8,y:65,x2:60},{x1:65,y:68,x2:135},{x1:8,y:95,x2:60},{x1:65,y:98,x2:135}].map((l, i) => (
          <line key={`bse-scan-${i}`} x1={l.x1} y1={l.y} x2={l.x2} y2={l.y}
            stroke="rgba(161,161,170,0.38)" strokeWidth="0.8"
            strokeDasharray="8 15"
            style={{ animation: `ag-circuit-flow ${5 + i * 0.5}s linear ${i * 0.4}s infinite` }} />
        ))}

        {/* === MORE THREAT DOTS across monitors === */}
        {[{x:45,y:48},{x:82,y:52},{x:110,y:45},{x:25,y:75},{x:95,y:80},{x:120,y:72},{x:40,y:105},{x:85,y:108}].map((p, i) => (
          <circle key={`bse-threat-${i}`} cx={p.x} cy={p.y} r="0.7"
            fill={i % 2 === 0 ? "rgba(248,113,113,0.45)" : "rgba(251,191,36,0.35)"}
            style={{ animation: `ag-node-pulse ${2.5 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }} />
        ))}

        {/* === DATA STREAMS on right monitors (x=260-320, y=35-85) === */}
        <path d="M 265 42 Q 280 38 295 45 Q 310 50 318 42"
          fill="none" stroke="rgba(161,161,170,0.3)" strokeWidth="1.0"
          strokeDasharray="3 5" style={{ animation: "ag-circuit-flow 5s linear 0.5s infinite" }} />
        <path d="M 268 58 Q 282 52 298 60 Q 312 66 320 58"
          fill="none" stroke="rgba(212,212,216,0.55)" strokeWidth="1.0"
          strokeDasharray="2 4" style={{ animation: "ag-circuit-flow-rev 6s linear 1s infinite" }} />
        {/* Right monitor data points */}
        <circle cx="280" cy="40" r="0.8" fill="rgba(161,161,170,0.5)"
          style={{ animation: "ag-node-pulse 3s ease-in-out 0.3s infinite" }} />
        <circle cx="305" cy="48" r="0.8" fill="rgba(248,113,113,0.4)"
          style={{ animation: "ag-node-pulse 2.5s ease-in-out 1s infinite" }} />

        {/* === HEXAGONAL NETWORK — around shield (x=235-285, y=55-100) === */}
        <path d="M 242 68 L 248 62 L 255 65 L 255 72 L 248 75 L 242 72 Z"
          fill="none" stroke="rgba(161,161,170,0.5)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 1s infinite" }} />
        <path d="M 265 62 L 271 56 L 278 59 L 278 66 L 271 69 L 265 66 Z"
          fill="none" stroke="rgba(161,161,170,0.38)" strokeWidth="0.8"
          style={{ animation: "ag-ring-pulse 5.5s ease-in-out 1.5s infinite" }} />
      </>
    ),
    uniqueDesc: "Bouclier cybersécurité + menaces carte mondiale",
    identityPos: "right",
  },

  // ─── 12. BFA — Factory Bot — SLATE ───
  {
    code: "BFA",
    name: "Fabien",
    role: "CPO AI — Directeur Production",
    image: "/agents/generated/factory-bot-standby-v3.png?v=5",
    dotColor: "#94a3b8",
    dotColorLight: "#cbd5e1",
    badgeGrad: "linear-gradient(135deg, #475569, #64748b)",
    suitPaths: [
      // Slate/industrial circuit coveralls
      "M 175 72 L 175 95 L 188 95 L 188 118",
      "M 182 78 L 182 100 L 195 100 L 195 122",
      "M 170 88 L 185 88 L 185 115 L 198 115",
      "M 178 102 L 192 102 L 192 130",
      // Left side
      "M 158 75 L 158 98 L 145 98 L 145 120",
      "M 152 82 L 152 105 L 140 105 L 140 125",
      "M 162 92 L 148 92 L 148 118",
    ],
    uniqueElement: (
      <>
        {/* Holographic tablet/production status - upper left */}
        <rect x="100" y="35" width="55" height="38" rx="3" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 5s ease-in-out infinite" }} />
        {/* Production line chart */}
        <path d="M 105 60 Q 118 52 130 58 Q 140 62 150 55"
          fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.4"
          strokeDasharray="5 5" style={{ animation: "ag-circuit-flow 5s linear infinite" }} />
        <path d="M 108 55 Q 120 48 132 52 Q 142 55 148 50"
          fill="none" stroke="rgba(203,213,225,0.4)" strokeWidth="1.0"
          strokeDasharray="3 6" style={{ animation: "ag-circuit-flow-rev 6.5s linear 0.5s infinite" }} />
        {/* Status dots */}
        <circle cx="112" cy="42" r="1.5" fill="rgba(52,211,153,0.6)" style={{ animation: "ag-node-pulse 3s ease-in-out infinite" }} />
        <circle cx="135" cy="40" r="1" fill="rgba(148,163,184,0.7)" style={{ animation: "ag-node-pulse 3.5s ease-in-out 0.5s infinite" }} />
        {/* Welding sparks - right side */}
        <circle cx="265" cy="110" r="0.8" fill="rgba(251,191,36,0.8)"
          style={{ animation: "ag-spark 2s ease-out 0s infinite" }} />
        <circle cx="270" cy="115" r="0.6" fill="rgba(253,224,71,0.7)"
          style={{ animation: "ag-spark 2.5s ease-out 0.6s infinite" }} />
        <circle cx="262" cy="118" r="0.7" fill="rgba(251,191,36,0.75)"
          style={{ animation: "ag-spark 2.2s ease-out 1.2s infinite" }} />
        <circle cx="268" cy="108" r="0.5" fill="rgba(253,224,71,0.7)"
          style={{ animation: "ag-spark 2.8s ease-out 1.8s infinite" }} />
        <circle cx="275" cy="112" r="0.6" fill="rgba(251,191,36,0.8)"
          style={{ animation: "ag-spark 2.3s ease-out 0.4s infinite" }} />

        {/* === CNC MACHINE INDICATOR LEDs — left equipment (x=10-60, y=55-105) === */}
        {[{x:15,y:60},{x:25,y:68},{x:10,y:78},{x:30,y:82},{x:18,y:92},{x:40,y:72},{x:50,y:88}].map((p, i) => (
          <circle key={`bfa-led-${i}`} cx={p.x} cy={p.y} r="0.8"
            fill={i % 3 === 0 ? "rgba(52,211,153,0.45)" : "rgba(59,130,246,0.4)"}
            style={{ animation: `ag-node-pulse ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}

        {/* === BLUE EQUIPMENT GLOW — CNC machine (x=25-55, y=75-100) === */}
        <rect x="28" y="78" width="24" height="18" rx="2" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 5s ease-in-out 0.5s infinite" }} />

        {/* === CONTROL PANEL — right side (x=280-318, y=88-125) === */}
        <rect x="285" y="92" width="28" height="20" rx="2" fill="none" stroke="rgba(59,130,246,0.55)" strokeWidth="1.0"
          style={{ animation: "ag-ring-pulse 6s ease-in-out 1s infinite" }} />
        {/* Control panel indicator lights */}
        {[{x:290,y:96},{x:298,y:96},{x:306,y:96}].map((p, i) => (
          <circle key={`bfa-ctrl-${i}`} cx={p.x} cy={p.y} r="1"
            fill={["rgba(52,211,153,0.5)","rgba(251,191,36,0.5)","rgba(59,130,246,0.5)"][i]}
            style={{ animation: `ag-node-pulse ${2 + i * 0.5}s ease-in-out ${i * 0.4}s infinite` }} />
        ))}
        {/* Control panel text lines */}
        <rect x="288" y="102" width="16" height="1.5" rx={0.5} fill="rgba(148,163,184,0.5)"
          style={{ animation: "ag-node-pulse 4s ease-in-out 0.5s infinite" }} />
        <rect x="288" y="106" width="12" height="1.5" rx={0.5} fill="rgba(148,163,184,0.38)"
          style={{ animation: "ag-node-pulse 3.5s ease-in-out 1s infinite" }} />

        {/* === SAFETY GOGGLES reflection — on head (x=145-165, y=20-30) === */}
        <ellipse cx="155" cy="24" rx="6" ry="2" fill="rgba(148,163,184,0.3)"
          style={{ animation: "ag-node-pulse 6s ease-in-out 2s infinite" }} />

        {/* === MORE WELDING SPARKS — scattered === */}
        <circle cx="258" cy="122" r="0.5" fill="rgba(253,224,71,0.6)"
          style={{ animation: "ag-spark 1.8s ease-out 0.2s infinite" }} />
        <circle cx="278" cy="105" r="0.4" fill="rgba(251,191,36,0.7)"
          style={{ animation: "ag-spark 2.5s ease-out 0.9s infinite" }} />
      </>
    ),
    uniqueDesc: "Tablette production holographique + étincelles soudure",
  },
];

// ════════════════════════════════════════════════════════════════
// AGENT CARD COMPONENT
// ════════════════════════════════════════════════════════════════

export function AgentAnimatedCard({ agent, index }: { agent: AgentConfig; index: number }) {
  // Generate unique IDs for this agent's paths
  const pid = agent.code.toLowerCase();

  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.3)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
    }}>
      {/* 16:9 Image Container */}
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        position: "relative",
        overflow: "hidden",
        background: "#0a0e1a",
      }}>
        {/* Agent Image */}
        <img
          src={agent.image}
          alt={`${agent.name} — ${agent.role}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* SVG Overlay — Circuit Dots + Unique Element */}
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
            <filter id="ag-glow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Suit Circuit Paths (invisible, used by animateMotion) ── */}
          {agent.suitPaths.map((d, i) => (
            <path key={`${pid}-p${i}`} id={`${pid}-p${i}`} d={d} fill="none" stroke="none" />
          ))}

          {/* ── Traveling Dots on Suit Circuits ── */}
          {agent.suitPaths.map((_, i) => {
            const dur1 = 5.4 + (i % 5) * 0.5;
            const dur2 = dur1;
            const begin1 = (i * 0.7) % 4;
            const begin2 = begin1 + dur1 * 0.5;
            return (
              <g key={`${pid}-dots-${i}`}>
                <circle r="0.7" fill={agent.dotColor} filter="url(#ag-glow)" opacity="0.7">
                  <animateMotion dur={`${dur1}s`} repeatCount="indefinite" begin={`${begin1}s`}>
                    <mpath href={`#${pid}-p${i}`} />
                  </animateMotion>
                </circle>
                {i % 2 === 0 && (
                  <circle r="0.5" fill={agent.dotColorLight} filter="url(#ag-glow)" opacity="0.5">
                    <animateMotion dur={`${dur2}s`} repeatCount="indefinite" begin={`${begin2}s`}>
                      <mpath href={`#${pid}-p${i}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

          {/* ── Unique Element for this agent ── */}
          {agent.uniqueElement}
        </svg>

        {/* Vignette */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,14,26,0.3) 100%)",
          pointerEvents: "none",
        }} />

        {/* Dark gradient at bottom for waveform */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          zIndex: 4,
          background: "linear-gradient(to top, rgba(6,10,20,0.7) 0%, rgba(6,10,20,0.55) 50%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Waveform Siri — voice stream effect at bottom */}
        <svg
          viewBox="0 0 330 185"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id={`ag-wave-${pid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor={agent.dotColor} stopOpacity="0.5" />
              <stop offset="50%" stopColor={agent.dotColorLight} stopOpacity="0.45" />
              <stop offset="80%" stopColor={agent.dotColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id={`ag-wglow-${pid}`}>
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Main wave */}
          <path d="M 10 175 Q 30 168 50 175 Q 70 182 90 170 Q 110 158 130 172 Q 150 182 170 165 Q 190 148 210 168 Q 230 182 250 170 Q 270 158 290 172 Q 310 182 320 175"
            fill="none" stroke={`url(#ag-wave-${pid})`} strokeWidth="1.5" strokeLinecap="round"
            filter={`url(#ag-wglow-${pid})`}
            style={{ animation: "ag-wave-flow 4s ease-in-out infinite" }}
          />
          {/* Ghost wave 1 */}
          <path d="M 10 175 Q 35 165 55 175 Q 75 185 95 168 Q 115 152 135 170 Q 155 185 175 162 Q 195 142 215 165 Q 235 185 255 168 Q 275 152 295 170 Q 315 185 320 175"
            fill="none" stroke={agent.dotColor} strokeWidth="0.8" strokeLinecap="round" opacity="0.2"
            style={{ animation: "ag-wave-flow 5s ease-in-out 0.5s infinite" }}
          />
          {/* Ghost wave 2 */}
          <path d="M 10 175 Q 25 170 45 175 Q 65 180 85 172 Q 105 164 125 174 Q 145 180 165 170 Q 185 158 205 172 Q 225 180 245 172 Q 265 164 285 174 Q 305 180 320 175"
            fill="none" stroke={agent.dotColorLight} strokeWidth="1.0" strokeLinecap="round" opacity="0.15"
            style={{ animation: "ag-wave-flow 6s ease-in-out 1s infinite" }}
          />
        </svg>

        {/* Identity overlay — bottom left */}
        <div style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {/* Numbered badge */}
          <div style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: agent.badgeGrad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}>{index + 1}</div>
          {/* Name + role */}
          <div style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            borderRadius: 8,
            padding: "5px 10px",
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{agent.name}</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{agent.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════

export function AgentGalleryPage() {
  return (
    <PageLayout maxWidth="5xl" header={
      <PageHeader
        icon={Users}
        title="Galerie des Agents AI"
        subtitle="12 agents animés — GhostX Team"
      />
    }>
      <style>{AG_KEYFRAMES}</style>

      {/* Grid — 2 columns for nice 16:9 display */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}>
        {AGENTS.map((agent, i) => (
          <AgentAnimatedCard key={agent.code} agent={agent} index={i} />
        ))}
      </div>
    </PageLayout>
  );
}
