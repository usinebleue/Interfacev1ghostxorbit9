/**
 * WorkspacePhasesPanel.tsx — Atelier / Right Panel V3
 * Zone droite flex-1 — Tabs AMORCER + contenu dynamique
 * Architecture V3 — Zéro Destruction
 *
 * Greffe chirurgicale du ResizablePanel droit de SimAmorcer (L722-840)
 * - Header département pastel h-12
 * - Tabs AMORCER (7 phases) avec chevrons
 * - Switch: VueEnsemble (observation/attention/moderation) | ReflexionMagazine | ChantierDrillDown
 * - SectionViews: CockpitView, BlueprintView, DataRoomView, PlaybookStoreView, ConferenceAIView
 */

import { useState, useRef, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Atom,
  Palette,
  Gauge,
  Layers,
  Database,
  BookOpen,
  Video,
  Calendar,
  Flame,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAmorcer } from "./AmorcerContext";
import { CanvasActionProvider } from "../v2/context/CanvasActionContext";

// ═══ V3 Core — source unique types/constantes ═══
import type { PhaseKey, HeaderView } from "./core/types";
import { PHASE_CONFIG } from "./core/phases";
import { DEPT_DASH_ICON, DEPT_SHORT_LABEL } from "./sections/shared/dept-data";

// ═══ Workspace Dynamique ═══
import { WorkspaceFrame } from "./workspace/WorkspaceFrame";
import type { WorkspacePhaseKey } from "./workspace/types";

// ═══ V3 Sections — composants cristallisés ═══
import { CockpitView } from "./sections/CockpitView";
import { BlueprintView, BLUEPRINT_HEADER_TABS } from "./sections/BlueprintView";
import { DataRoomView } from "./sections/DataRoomView";
import { PlaybookStoreView } from "./sections/PlaybookStoreView";
import { ConferenceAIView } from "./sections/ConferenceAIView";
import { ChantierView } from "./sections/ChantierView";
import { OperationsView } from "./sections/OperationsView";
import { AgendaView } from "./sections/AgendaView";
import { AdminView } from "./sections/AdminView";
// CerveauBTMLView retiré — fusionné dans AdminView > Stack Technique

// ═══ Orbit9 V3 — composant cristallisé ═══
import { Orbit9View } from "./sections/orbit9/Orbit9View";
import { O9_HEADER_TABS } from "./sections/orbit9/orbit9-data";

// ═══ Simulation — composants demos (séparés du code cristallisé) ═══
import {
  VueEnsemble,
  ReflexionMagazine,
  ChantierDrillDown,
  IconCatalog,
} from "./simulation/sim-content-map";

export function WorkspacePhasesPanel() {
  const {
    activePhase,
    setActivePhase,
    chatStage,
    reflexionContext,
    setReflexionContext,
    rightSection,
    setRightSection,
    activeBotCode,
    cockpitTab,
    o9Section,
    setO9Section,
    startReflexion,
    workspacePhase,
    setWorkspacePhase,
  } = useAmorcer();

  const rightRef = useRef<HTMLDivElement>(null);
  const [blueprintHeaderView, setBlueprintHeaderView] = useState<HeaderView>("blueprint");
  const [blueprintStats, setBlueprintStats] = useState<{ tier: string; tierLabel: string; score: number } | null>(null);

  const pc = PHASE_CONFIG[activePhase];
  const isOrbit9 = cockpitTab === "orbit9";
  const isDash = activePhase === "observation" || activePhase === "attention" || activePhase === "moderation";

  // Scroll to top on phase change only (pas sur section nav — Carl veut pas d'ancre auto)
  useEffect(() => {
    rightRef.current && (rightRef.current.scrollTop = 0);
  }, [activePhase]);

  // Auto-scroll désactivé — chatStage simulation pas branchée sur le vrai chat

  // ═══ WORKSPACE DYNAMIQUE — Quand une phase workspace est active, le frame prend tout le panel ═══
  if (workspacePhase) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-gray-50">
        {/* DEV — Bouton retour (à retirer après validation) */}
        <div className="h-8 px-3 shrink-0 flex items-center border-b border-gray-200 bg-white">
          <button
            onClick={() => setWorkspacePhase(null)}
            className="text-[9px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
          >
            ← Retour vue normale
          </button>
        </div>
        <WorkspaceFrame
          phase={workspacePhase}
          botCode={activeBotCode}
          onPhaseComplete={(nextPhase: WorkspacePhaseKey) => {
            if (nextPhase === "operations") {
              setWorkspacePhase("operations");
            } else {
              setWorkspacePhase(nextPhase);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">

      {/* ═══ HEADER DÉPARTEMENT PASTEL h-12 ═══ */}
      {(() => {
        const SECTION_ICON: Record<string, React.ElementType> = { cockpit: Gauge, chantiers: Flame, blueprint: Layers, dataroom: Database, playbooks: BookOpen, conferenceai: Video, operations: Settings, "bureau-agenda": Calendar, admin: Shield, orbit9: Atom };
        const SECTION_LABEL: Record<string, string> = { cockpit: "Cockpit", chantiers: "Chantiers", blueprint: "Blueprint", dataroom: "Data Room", playbooks: "Playbook Store", conferenceai: "Conference AI", operations: "Opérations", "bureau-agenda": "Agenda", admin: "Administration", orbit9: "Orbit⁹" };
        // activeSection = source unique pour icon, label, tabs (orbit9 traité comme une section)
        const activeSection = (isOrbit9 && !rightSection) ? "orbit9" : rightSection;
        const DeptIcon = (activeSection && SECTION_ICON[activeSection]) ? SECTION_ICON[activeSection] : (DEPT_DASH_ICON[activeBotCode] || Home);
        const deptLabel = activeSection === "orbit9" ? "" : (DEPT_SHORT_LABEL[activeBotCode] || "");
        const sectionLabel = (activeSection && SECTION_LABEL[activeSection]) ? SECTION_LABEL[activeSection] : activePhase === "reflexion" ? "Réflexion" : "Cockpit";
        const titleText = activeSection === "orbit9"
          ? "Orbit⁹"
          : `Département ${deptLabel} — ${sectionLabel}`;
        const showBlueprintTabs = activeSection === "blueprint";
        const showOrbit9Tabs = activeSection === "orbit9";
        return (
          <div className="h-12 px-3 shrink-0 flex items-center gap-2 border-b border-gray-200 bg-[#00B4D8]/[0.12]">
            <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 shrink-0">{titleText}</span>
            {/* Sous-tabs Blueprint */}
            {showBlueprintTabs && (
              <>
                <div className="w-px h-5 bg-gray-300 mx-1.5" />
                <div className="flex items-center gap-1">
                  {BLUEPRINT_HEADER_TABS.filter(t => !t.ceoOnly || activeBotCode === "CEOB").map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setBlueprintHeaderView(tab.key)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                        blueprintHeaderView === tab.key
                          ? "bg-[#073E5A] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.key === "blueprint" ? (DEPT_SHORT_LABEL[activeBotCode] || "Direction") : tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Sous-tabs Orbit9 — même pattern que Blueprint */}
            {showOrbit9Tabs && (
              <>
                <div className="w-px h-5 bg-gray-300 mx-1.5" />
                <div className="flex items-center gap-1">
                  {O9_HEADER_TABS.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setO9Section(tab.key)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                        o9Section === tab.key
                          ? "bg-[#073E5A] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {activeSection !== "orbit9" && activePhase === "reflexion" && reflexionContext && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-orange-600">{reflexionContext}</span>
              </>
            )}
            {activeSection !== "orbit9" && activePhase !== "observation" && activePhase !== "reflexion" && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className={cn("text-[11px] font-medium", pc.text)}>{pc.label}</span>
              </>
            )}
            <div className="flex-1" />
            {/* DEV — Bouton test WorkspaceFrame (à retirer après validation) */}
            {!workspacePhase && (
              <button
                onClick={() => setWorkspacePhase("reflexion")}
                className="text-[9px] font-bold px-2 py-1 rounded-md bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 cursor-pointer transition-all"
              >
                Test WorkspaceFrame
              </button>
            )}
            {showBlueprintTabs && blueprintStats && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-gray-500">{blueprintStats.tierLabel}</span>
                <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded-full">{blueprintStats.score}%</span>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ CONTENU DYNAMIQUE ═══ */}
      <div ref={rightRef} className="flex-1 overflow-auto bg-gray-50">
        {rightSection === "icons" ? (
          /* Catalogue d'icônes officiel */
          <IconCatalog />
        ) : rightSection ? (
          /* Blueprint sections */
          <div className="max-w-4xl mx-auto px-6 py-4 pb-12 sim-blueprint-pastel">
            <style>{`
              .sim-blueprint-pastel [class*="bg-gradient-to-r"] {
                background-image: none !important;
                background-color: rgba(0, 180, 216, 0.1) !important;
              }
              .sim-blueprint-pastel [class*="bg-gradient-to-r"] * {
                color: #111827 !important;
              }
              .sim-blueprint-pastel [class*="bg-white\\/"] {
                background-color: rgba(0, 180, 216, 0.15) !important;
                color: #111827 !important;
              }
            `}</style>
            <CanvasActionProvider>
              {rightSection === "cockpit" && <CockpitView embedded initialDept={activeBotCode} onAction={(phase, context) => { setActivePhase(phase as PhaseKey); setReflexionContext(context); setRightSection(null); }} />}
              {rightSection === "blueprint" && <BlueprintView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" hideHeader activeHeaderView={blueprintHeaderView} onHeaderViewChange={setBlueprintHeaderView} onStats={setBlueprintStats} />}
              {rightSection === "dataroom" && <DataRoomView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" showHeader />}
              {rightSection === "playbooks" && <PlaybookStoreView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" showHeader />}
              {rightSection === "conferenceai" && <ConferenceAIView headerGradient="from-blue-600 to-blue-500" onNavigateToStore={() => setRightSection("playbooks")} botCode={activeBotCode} />}
              {rightSection === "chantiers" && <ChantierView botCode={activeBotCode} showHeader onAction={(phase, context) => { setActivePhase(phase as PhaseKey); setReflexionContext(context); setRightSection(null); }} />}
              {rightSection === "operations" && <OperationsView botCode={activeBotCode} showHeader onAction={(phase, context) => { setActivePhase(phase as PhaseKey); setReflexionContext(context); setRightSection(null); }} />}
              {rightSection === "bureau-agenda" && <AgendaView botCode={activeBotCode} showHeader onAction={(phase, context) => { setActivePhase(phase as PhaseKey); setReflexionContext(context); setRightSection(null); }} />}
              {rightSection === "admin" && <AdminView botCode={activeBotCode} showHeader onAction={(phase, context) => { setActivePhase(phase as PhaseKey); setReflexionContext(context); setRightSection(null); }} />}
              {/* cerveau-btml fusionné dans AdminView > Stack Technique */}
            </CanvasActionProvider>
          </div>
        ) : isOrbit9 ? (
          /* Orbit9 V3 — shell unique avec routing interne */
          <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
            <Orbit9View />
          </div>
        ) : isDash ? (
          /* Dashboard views (Observation, Attention, Moderation) */
          <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
            <VueEnsemble phase={activePhase} chatStage={chatStage} onStartReflexion={startReflexion} />
          </div>
        ) : activePhase === "reflexion" ? (
          /* Réflexion magazine */
          <ReflexionMagazine stage={chatStage} context={reflexionContext} />
        ) : (
          /* Création, Exécution, Rétroaction — drill-down */
          <ChantierDrillDown phase={activePhase} />
        )}
      </div>
    </div>
  );
}
