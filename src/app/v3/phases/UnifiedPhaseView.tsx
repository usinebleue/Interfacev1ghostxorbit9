/**
 * UnifiedPhaseView.tsx — UN composant pour Réflexion ET Conception
 *
 * Architecture artefacts progressifs:
 * - Prop phaseKey sélectionne les sections (reflexion ou creation)
 * - Hero compact (couleur phase)
 * - Sidebar SF w-[180px] — sections avec badges status
 * - Content: WorkspaceSection pour la section active
 * - Capture automatique des réponses bot via useWorkspaceCapture
 */

import { useState } from "react";
import { Brain, ArrowRight, Hammer, Rocket, Check } from "lucide-react";
import { SF } from "../core/styles";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";
import { useWorkspaceCapture } from "../hooks/useWorkspaceCapture";
import { PHASE_SECTIONS } from "./phase-sections";
import { WorkspaceSection } from "./WorkspaceSection";

interface UnifiedPhaseViewProps {
  phaseKey: "reflexion" | "creation";
  context: string | null;
  onPhaseComplete?: () => void;
}

const PHASE_META = {
  reflexion: {
    title: "R\u00e9flexion",
    color: "orange",
    heroBg: "bg-orange-200",
    heroAccent: "bg-amber-200",
    heroIcon: "bg-orange-50 border-orange-100",
    progressBg: "bg-orange-100",
    progressFill: "bg-orange-400",
    completeCta: "Pr\u00eat pour la Conception",
    completeDesc: "Transformez vos analyses en plan d\u2019action concret",
  },
  creation: {
    title: "Conception",
    color: "yellow",
    heroBg: "bg-yellow-200",
    heroAccent: "bg-amber-200",
    heroIcon: "bg-yellow-50 border-yellow-100",
    progressBg: "bg-yellow-100",
    progressFill: "bg-yellow-500",
    completeCta: "Lancer le Chantier",
    completeDesc: "Toutes les sections sont cristallis\u00e9es. Pr\u00eat pour l\u2019ex\u00e9cution.",
  },
} as const;

export function UnifiedPhaseView({ phaseKey, context, onPhaseComplete }: UnifiedPhaseViewProps) {
  const sections = PHASE_SECTIONS[phaseKey] || [];
  const meta = PHASE_META[phaseKey];
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  const { sendMessage } = useChatContext();
  const { activeBotCode, pendingCapture, setPendingCapture, getCristallise } = useAmorcer();

  // Activate the capture hook (watches messages)
  useWorkspaceCapture();

  // Count cristallised sections
  const cristallisedCount = sections.filter(s => getCristallise(s.id) !== null).length;
  const progress = Math.round((cristallisedCount / sections.length) * 100);
  const allComplete = cristallisedCount === sections.length;

  const activeS = sections.find(s => s.id === activeSection) || sections[0];

  const handleLaunch = (sectionId: string, prompt: string) => {
    const contextSuffix = context ? ` (contexte : ${context})` : "";
    sendMessage(prompt + contextSuffix, activeBotCode);
    setPendingCapture(sectionId);
  };

  const handleAction = (sectionId: string, prompt: string) => {
    const contextSuffix = context ? ` (contexte : ${context})` : "";
    sendMessage(prompt + contextSuffix, activeBotCode);
    setPendingCapture(sectionId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
      {/* ═══ HERO COMPACT ═══ */}
      <div className="relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all px-5 py-4 flex items-center gap-4 overflow-hidden">
        <div className={`absolute -top-6 -right-6 w-24 h-24 ${meta.heroBg} rounded-full blur-2xl opacity-40`} />
        <div className={`absolute -bottom-4 right-12 w-16 h-16 ${meta.heroAccent} rounded-full blur-xl opacity-30`} />
        <div className={`relative z-10 p-2 rounded-xl ${meta.heroIcon} border`}>
          {activeS && <activeS.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />}
        </div>
        <div className="relative z-10 flex-1">
          <h2 className="text-sm font-bold text-gray-900">{meta.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{context || "Analyse en cours"}</p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <div className={`w-28 h-2 ${meta.progressBg} rounded-full overflow-hidden`}>
            <div className={`h-full ${meta.progressFill} rounded-full transition-all`} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-900">{cristallisedCount}/{sections.length}</span>
        </div>
      </div>

      {/* ═══ SIDEBAR + CONTENT ═══ */}
      <div className="flex gap-3">
        {/* Sidebar */}
        <div className={SF.sidebarW}>
          {sections.map(s => {
            const isActive = s.id === activeSection;
            const hasCristallise = getCristallise(s.id) !== null;
            const isPending = pendingCapture === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`${SF.btnBase} ${isActive ? SF.btnActive : SF.btnInactive}`}
              >
                <s.icon className={isActive ? SF.iconActive : SF.iconInactive} />
                <span className={isActive ? SF.labelActive : SF.labelInactive}>{s.title}</span>
                {hasCristallise && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                  </span>
                )}
                {isPending && !hasCristallise && (
                  <span className="ml-auto w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={SF.content}>
          {activeS && (
            <WorkspaceSection
              section={activeS}
              cristallise={getCristallise(activeS.id)}
              isPending={pendingCapture === activeS.id}
              phaseColor={meta.color}
              onLaunch={handleLaunch}
              onAction={handleAction}
            />
          )}

          {/* Phase complete CTA */}
          {allComplete && onPhaseComplete && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-[#00B4D8]/10 p-5 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {phaseKey === "reflexion" ? (
                  <>
                    <Brain className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <ArrowRight className="h-4 w-4 text-gray-400 stroke-[2.5]" />
                    <Hammer className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  </>
                ) : (
                  <>
                    <Hammer className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <ArrowRight className="h-4 w-4 text-gray-400 stroke-[2.5]" />
                    <Rocket className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                  </>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{meta.completeCta}</p>
                <p className="text-xs text-gray-500">{meta.completeDesc}</p>
              </div>
              <button
                onClick={onPhaseComplete}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                {meta.completeCta}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
