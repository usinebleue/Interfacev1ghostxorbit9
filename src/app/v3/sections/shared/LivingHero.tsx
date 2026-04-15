/**
 * LivingHero.tsx — Banner animé partagé par toutes les section views
 *
 * Extrait de BlueprintDepartement.tsx L64-180
 * Utilisé par: CockpitView, BlueprintView, DataRoomView, PlaybookStoreView, ConferenceAIView, ChantierView
 */

import { useEffect } from "react";
import { cn } from "../../../components/ui/utils";

// ═══ CSS Animations (injectées une seule fois dans le DOM) ═══
const LIVING_HEROES_STYLES = `
.bg-pattern-grid { background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px); background-size: 24px 24px; }
.glass-base { background: rgba(255,255,255,0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 10px 40px rgba(0,0,0,0.06); border-radius: 16px; }
.glass-intense { background: rgba(255,255,255,0.2); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: inset 0 0 20px rgba(255,255,255,0.5); }
/* COCKPIT */
@keyframes radar-scan { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes bar-grow { 0%, 100% { height: var(--min-h); opacity: 0.8; } 50% { height: var(--max-h); opacity: 1; } }
@keyframes draw-curve { 0%, 100% { stroke-dashoffset: 150; } 50% { stroke-dashoffset: 0; } }
.anim-radar { animation: radar-scan 12s linear infinite; transform-origin: center; }
.anim-bar-1 { animation: bar-grow 8s ease-in-out infinite; --min-h: 30%; --max-h: 50%; }
.anim-bar-2 { animation: bar-grow 10s ease-in-out infinite 2s; --min-h: 40%; --max-h: 75%; }
.anim-bar-3 { animation: bar-grow 9s ease-in-out infinite 1s; --min-h: 60%; --max-h: 100%; }
.anim-curve { stroke-dasharray: 150; animation: draw-curve 10s ease-in-out infinite; }
/* CONFERENCE AI */
@keyframes packet-travel { 0% { offset-distance: 0%; opacity: 0; transform: scale(0.8); } 20% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 15px currentColor; } 80% { opacity: 1; transform: scale(1.2); } 100% { offset-distance: 100%; opacity: 0; transform: scale(0.8); } }
.anim-packet-1 { offset-path: path('M 60 75 L 140 25'); animation: packet-travel 7s ease-in-out infinite; }
.anim-packet-2 { offset-path: path('M 140 25 L 220 75'); animation: packet-travel 8s ease-in-out infinite 3s; }
.anim-packet-3 { offset-path: path('M 220 75 L 140 125'); animation: packet-travel 6.5s ease-in-out infinite 1.5s; }
.anim-packet-4 { offset-path: path('M 140 125 L 60 75'); animation: packet-travel 7.5s ease-in-out infinite 4s; }
@keyframes wave-pulse { 0%, 100% { transform: scaleY(0.7); opacity: 0.6; } 50% { transform: scaleY(1.3); opacity: 1; } }
/* BLUEPRINT */
.org-node { background: rgba(255,255,255,0.8); border: 2px solid rgba(255,255,255,0); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: all 0.5s ease; }
@keyframes org-pulse-root { 0%, 100% { border-color: rgba(99,102,241,0.2); box-shadow: none; } 10%, 30% { border-color: rgba(99,102,241,1); box-shadow: 0 0 15px rgba(99,102,241,0.5); } }
@keyframes org-pulse-child { 0%, 100% { border-color: rgba(56,189,248,0.2); box-shadow: none; } 10%, 30% { border-color: rgba(56,189,248,1); box-shadow: 0 0 15px rgba(56,189,248,0.5); } }
@keyframes flow-down { 0% { height: 0%; opacity: 0; } 10% { height: 0%; opacity: 1; } 40% { height: 100%; opacity: 1; } 50%, 100% { height: 100%; opacity: 0; } }
@keyframes flow-across { 0% { width: 0%; opacity: 0; } 10% { width: 0%; opacity: 1; } 40% { width: 100%; opacity: 1; } 50%, 100% { width: 100%; opacity: 0; } }
.anim-org-root { animation: org-pulse-root 6s infinite 0s; }
.anim-org-line-vert { animation: flow-down 6s infinite 1.5s; }
.anim-org-line-hor { animation: flow-across 6s infinite 2.5s; }
.anim-org-child-1 { animation: org-pulse-child 6s infinite 3.5s; }
.anim-org-child-2 { animation: org-pulse-child 6s infinite 3.8s; }
.anim-org-child-3 { animation: org-pulse-child 6s infinite 4.1s; }
/* DATA ROOM */
@keyframes laser-scan { 0%, 100% { top: 5%; opacity: 0; } 10%, 90% { opacity: 1; } 50% { top: 95%; } }
.anim-laser { animation: laser-scan 8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
@keyframes binary-fade { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.7; } }
.anim-binary { animation: binary-fade 3s ease-in-out infinite; }
@keyframes vault-lock-outer { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes vault-lock-inner { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
.anim-vault-out { animation: vault-lock-outer 40s linear infinite; }
.anim-vault-in { animation: vault-lock-inner 30s linear infinite; }
/* PLAYBOOK STORE */
.pb-node { background: rgba(255,255,255,0.8); border: 2px solid rgba(34,211,238,0.2); border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: all 0.5s ease; }
@keyframes trigger-node { 0%, 100% { border-color: rgba(34,211,238,0.2); box-shadow: none; filter: brightness(1); } 10%, 20% { border-color: rgba(34,211,238,1); box-shadow: 0 0 15px rgba(34,211,238,0.5); filter: brightness(1.1); } }
@keyframes trigger-pulse { 0%, 5%, 35%, 100% { opacity: 0; transform: scale(0.5); } 10%, 25% { opacity: 1; transform: scale(1.5); } }
@keyframes flow-line { 0% { width: 0%; opacity: 0; } 10% { width: 0%; opacity: 1; } 40% { width: 100%; opacity: 1; } 50%, 100% { width: 100%; opacity: 0; } }
.anim-p-node-1 { animation: trigger-node 8s infinite 0s; }
.anim-p-line-1 { animation: flow-line 8s infinite 1s; }
.anim-p-pulse-1 { animation: trigger-pulse 8s infinite 0.8s; }
.anim-p-node-2 { animation: trigger-node 8s infinite 3s; }
.anim-p-line-2 { animation: flow-line 8s infinite 4s; }
.anim-p-pulse-2 { animation: trigger-pulse 8s infinite 3.8s; }
.anim-p-node-3 { border-color: rgba(59,130,246,0.3); }
.anim-p-node-3-activate { animation: trigger-node 8s infinite 6s; }
/* CHANTIERS */
@keyframes block-rise { 0%, 100% { height: 10px; opacity: 0.5; } 50% { height: var(--h); opacity: 1; } }
.anim-block-1 { animation: block-rise 8s cubic-bezier(0.4, 0, 0.2, 1) infinite; --h: 40px; }
.anim-block-2 { animation: block-rise 9s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.5s; --h: 70px; }
.anim-block-3 { animation: block-rise 7s cubic-bezier(0.4, 0, 0.2, 1) infinite 3s; --h: 50px; }
@keyframes progress-slide { 0%, 100% { width: 10%; } 50% { width: 90%; } }
.anim-progress { animation: progress-slide 10s ease-in-out infinite; }
/* AGENDA */
@keyframes clock-spin { 100% { transform: rotate(360deg); } }
.anim-clock-outer { animation: clock-spin 40s linear infinite; }
.anim-clock-inner { animation: clock-spin 25s linear infinite reverse; }
@keyframes ticker-slide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(180px); } }
.anim-ticker { animation: ticker-slide 15s ease-in-out infinite; }
/* ADMIN */
@keyframes admin-shield-pulse { 0%, 100% { filter: drop-shadow(0 0 4px rgba(100,116,139,0.3)); } 50% { filter: drop-shadow(0 0 18px rgba(100,116,139,0.7)); } }
@keyframes admin-scan-line { 0%, 100% { top: 10%; opacity: 0; } 10%, 90% { opacity: 0.8; } 50% { top: 85%; } }
@keyframes admin-node-blink { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
.anim-admin-shield { animation: admin-shield-pulse 5s ease-in-out infinite; }
.anim-admin-scan { animation: admin-scan-line 6s cubic-bezier(0.4,0,0.2,1) infinite; }
.anim-admin-node-1 { animation: admin-node-blink 3s ease-in-out infinite; }
.anim-admin-node-2 { animation: admin-node-blink 4s ease-in-out infinite 1s; }
.anim-admin-node-3 { animation: admin-node-blink 3.5s ease-in-out infinite 2s; }
.anim-admin-node-4 { animation: admin-node-blink 4.5s ease-in-out infinite 0.5s; }
/* BTML BRAIN — Intelligence d'affaires */
@keyframes btml-brain-glow { 0%, 100% { filter: drop-shadow(0 0 4px rgba(147,51,234,0.2)); stroke-opacity: 0.4; } 50% { filter: drop-shadow(0 0 20px rgba(147,51,234,0.6)); stroke-opacity: 0.9; } }
@keyframes btml-synapse { 0%, 100% { stroke-dashoffset: 50; opacity: 0.15; } 35%, 65% { stroke-dashoffset: 0; opacity: 0.9; } }
@keyframes btml-neuron-fire { 0%, 100% { filter: drop-shadow(0 0 2px currentColor); opacity: 0.4; } 50% { filter: drop-shadow(0 0 12px currentColor); opacity: 1; } }
@keyframes btml-icon-pop { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 1; } }
@keyframes btml-orbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.anim-btml-brain { animation: btml-brain-glow 7s ease-in-out infinite; }
.anim-btml-syn-1 { stroke-dasharray: 50; animation: btml-synapse 5s ease-in-out infinite; }
.anim-btml-syn-2 { stroke-dasharray: 50; animation: btml-synapse 6s ease-in-out infinite 1.2s; }
.anim-btml-syn-3 { stroke-dasharray: 50; animation: btml-synapse 5.5s ease-in-out infinite 2.4s; }
.anim-btml-syn-4 { stroke-dasharray: 50; animation: btml-synapse 7s ease-in-out infinite 3.6s; }
.anim-btml-syn-5 { stroke-dasharray: 50; animation: btml-synapse 4.5s ease-in-out infinite 4.8s; }
.anim-btml-syn-6 { stroke-dasharray: 50; animation: btml-synapse 6.5s ease-in-out infinite 0.6s; }
.anim-btml-node-1 { animation: btml-neuron-fire 4s ease-in-out infinite 0.3s; }
.anim-btml-node-2 { animation: btml-neuron-fire 5s ease-in-out infinite 1.5s; }
.anim-btml-node-3 { animation: btml-neuron-fire 4.5s ease-in-out infinite 2.7s; }
.anim-btml-node-4 { animation: btml-neuron-fire 3.5s ease-in-out infinite 3.9s; }
.anim-btml-node-5 { animation: btml-neuron-fire 5.5s ease-in-out infinite 5.1s; }
.anim-btml-node-6 { animation: btml-neuron-fire 4s ease-in-out infinite 0.9s; }
.anim-btml-orbit { animation: btml-orbit 60s linear infinite; transform-origin: center; }
.anim-btml-icon-1 { animation: btml-icon-pop 4s ease-in-out infinite 0.5s; }
.anim-btml-icon-2 { animation: btml-icon-pop 5s ease-in-out infinite 2s; }
.anim-btml-icon-3 { animation: btml-icon-pop 4.5s ease-in-out infinite 3.5s; }
/* ORBIT9 STELLAR */
@keyframes celestial-spin { 100% { transform: rotate(360deg); } }
@keyframes celestial-spin-rev { 100% { transform: rotate(-360deg); } }
.anim-orb-1 { animation: celestial-spin 35s linear infinite; transform-origin: 100px 100px; }
.anim-orb-2 { animation: celestial-spin-rev 50s linear infinite; transform-origin: 100px 100px; }
.anim-orb-3 { animation: celestial-spin 65s linear infinite; transform-origin: 100px 100px; }
@keyframes dot-alive { 0%, 100% { filter: drop-shadow(0 0 5px currentColor); } 50% { filter: drop-shadow(0 0 20px currentColor); } }
.anim-dot { animation: dot-alive 4s ease-in-out infinite; }
`;

let heroStylesInjected = false;
export function injectHeroStyles() {
  if (heroStylesInjected) return;
  heroStylesInjected = true;
  const s = document.createElement("style");
  s.textContent = LIVING_HEROES_STYLES;
  document.head.appendChild(s);
}

// ═══ LIVING HERO WRAPPER — V20 Carl's exact layout ═══
export function LivingHero({ blur1, blur2, subtitleColor, subtitle, title, description, scaleClass, children }: {
  blur1: string;
  blur2: string;
  subtitleColor: string;
  subtitle: string;
  title: string;
  description: string;
  scaleClass?: string;
  children?: React.ReactNode;
}) {
  useEffect(() => { injectHeroStyles(); }, []);
  return (
    <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm py-5 px-8 overflow-hidden min-h-[110px] flex items-center">
      <div className={cn("absolute rounded-full blur-[100px] opacity-60", blur1)} style={{ top: '-50%', left: '-10%', width: '50%', height: '200%' }} />
      <div className={cn("absolute rounded-full blur-[120px] opacity-50", blur2)} style={{ bottom: '-50%', right: '10%', width: '60%', height: '200%' }} />
      <div className="absolute inset-0 bg-pattern-grid opacity-[0.35]" />
      {/* Illustration */}
      <div className={cn("absolute top-0 bottom-0 flex items-center transform origin-right pointer-events-none", scaleClass === "scale-[0.80]" ? "right-0 scale-[0.80]" : "right-[1rem] scale-[0.70]")}>
        {children}
      </div>
      {/* Text */}
      <div className="relative z-20 w-full pr-[250px]">
        <p className={cn("uppercase tracking-widest text-[9px] font-bold mb-1", subtitleColor)}>{subtitle}</p>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">{title}</h2>
        <p className="text-slate-500 text-[12.5px] font-medium leading-snug">{description}</p>
      </div>
    </div>
  );
}
