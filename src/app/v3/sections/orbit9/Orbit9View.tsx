/**
 * Orbit9View.tsx — Shell Orbit9 V3 (LivingHero + tabs internes + routing)
 *
 * Pattern: COPIE de BlueprintView.tsx (shell avec tabs internes)
 * Gradient: DEPT_COLORS["ORBIT9"] = from-cyan-600 to-blue-500
 *
 * Utilisé par: WorkspacePhasesPanel (quand isOrbit9 = true)
 */

import { useAmorcer } from "../../AmorcerContext";
import { LivingHero } from "../shared/LivingHero";
import { CanvasActionProvider } from "../../../v2/context/CanvasActionContext";

import { Orbit9Dashboard } from "./Orbit9Dashboard";
import { Orbit9Blueprint } from "./Orbit9Blueprint";
import { Orbit9Opportunites } from "./Orbit9Opportunites";

export function Orbit9View() {
  const { o9Section } = useAmorcer();

  return (
    <div className="space-y-4">
      {/* ═══ HERO V20 — Stellar Orbit (ORIGINAL SimAmorcer) ═══ */}
      <LivingHero blur1="bg-violet-100/70" blur2="bg-indigo-100/60" subtitleColor="text-violet-600" subtitle="Écosystème & Synergie" title="Votre galaxie d'opportunités, interconnectée." description="Les cellules gravitent autour du cœur. C'est l'essence du réseau global, le mouvement perpétuel." scaleClass="scale-[0.80]">
        <div className="relative flex items-center justify-center overflow-visible" style={{ width: 340, height: 160 }}>
          <svg viewBox="0 0 200 200" className="overflow-visible" style={{ width: 300, height: 300 }}>
            <circle cx="100" cy="100" r="16" fill="url(#o9-core-grad)" filter="drop-shadow(0 0 15px #a78bfa)"/>
            <circle cx="100" cy="100" r="18" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" className="anim-orb-1"/>
            <g className="anim-orb-1"><circle cx="100" cy="100" r="35" fill="none" stroke="#c084fc" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.6"/><circle cx="135" cy="100" r="4.5" fill="#d8b4fe" className="anim-dot" style={{ color: '#d8b4fe' }} /></g>
            <g className="anim-orb-2"><circle cx="100" cy="100" r="60" fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.4"/><circle cx="100" cy="40" r="5" fill="#6366f1" className="anim-dot" style={{ color: '#6366f1' }}/><circle cx="100" cy="160" r="3.5" fill="#818cf8" className="anim-dot" style={{ color: '#818cf8' }}/></g>
            <g className="anim-orb-3"><circle cx="100" cy="100" r="90" fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 6" opacity="0.8"/><circle cx="190" cy="100" r="18" fill="rgba(167, 139, 250, 0.15)"/><circle cx="190" cy="100" r="13" fill="none" stroke="#c084fc" strokeWidth="0.5"/><circle cx="190" cy="100" r="7" fill="#8b5cf6" className="anim-dot" style={{ color: '#8b5cf6' }}/><path d="M 116 100 L 183 100" fill="none" stroke="url(#o9-link-grad)" strokeWidth="1" opacity="0.5" /></g>
            <defs>
              <radialGradient id="o9-core-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffffff"/><stop offset="40%" stopColor="#d8b4fe"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>
              <linearGradient id="o9-link-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c084fc" stopOpacity="0"/><stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/><stop offset="100%" stopColor="#c084fc" stopOpacity="0"/></linearGradient>
            </defs>
          </svg>
        </div>
      </LivingHero>

      {/* ═══ CONTENU DYNAMIQUE — Tabs sont dans le header WorkspacePhasesPanel ═══ */}
      <CanvasActionProvider>
        {o9Section === "dashboard" && <Orbit9Dashboard />}
        {o9Section === "blueprint" && <Orbit9Blueprint />}
        {o9Section === "opportunites" && <Orbit9Opportunites />}
      </CanvasActionProvider>
    </div>
  );
}

