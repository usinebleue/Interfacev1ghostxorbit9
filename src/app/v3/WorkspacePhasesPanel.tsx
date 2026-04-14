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
  Flame,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAmorcer } from "./AmorcerContext";
import { CanvasActionProvider } from "../v2/context/CanvasActionContext";

// ═══ V3 Core — source unique types/constantes ═══
import type { PhaseKey, HeaderView } from "./core/types";
import { PHASE_CONFIG } from "./core/phases";
import { DEPT_DASH_ICON, DEPT_SHORT_LABEL } from "./sections/shared/dept-data";

// ═══ V3 Sections — composants cristallisés ═══
import { CockpitView } from "./sections/CockpitView";
import { BlueprintView, BLUEPRINT_HEADER_TABS } from "./sections/BlueprintView";
import { DataRoomView } from "./sections/DataRoomView";
import { PlaybookStoreView } from "./sections/PlaybookStoreView";
import { ConferenceAIView } from "./sections/ConferenceAIView";
import { ChantierView } from "./sections/ChantierView";

// ═══ Simulation — composants demos (séparés du code cristallisé) ═══
import {
  VueEnsemble,
  ReflexionMagazine,
  ChantierDrillDown,
  IconCatalog,
  Orbit9SocialHome,
  Orbit9BlueprintCollaboration,
  MesCellules,
  VITAADashboard,
  MonProfilOrbit9,
  Orbit9Gouvernance,
  JumelageOrbit9,
  PionniersOrbit9,
  CreerCellulePage,
  ORBIT9_CELLULES,
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
    startReflexion,
  } = useAmorcer();

  const rightRef = useRef<HTMLDivElement>(null);
  const [blueprintHeaderView, setBlueprintHeaderView] = useState<HeaderView>("blueprint");
  const [blueprintStats, setBlueprintStats] = useState<{ tier: string; tierLabel: string; score: number } | null>(null);

  const pc = PHASE_CONFIG[activePhase];
  const isOrbit9 = cockpitTab === "orbit9";
  const isDash = activePhase === "observation" || activePhase === "attention" || activePhase === "moderation";

  // Scroll to top on phase/section change
  useEffect(() => {
    rightRef.current && (rightRef.current.scrollTop = 0);
  }, [activePhase, rightSection]);

  // Auto-scroll right panel to follow chat progression (200ms delay for DOM render)
  useEffect(() => {
    if (rightRef.current) {
      setTimeout(() => {
        if (rightRef.current) {
          rightRef.current.scrollTo({ top: rightRef.current.scrollHeight, behavior: "smooth" });
        }
      }, 200);
    }
  }, [chatStage]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">

      {/* ═══ HEADER DÉPARTEMENT PASTEL h-12 ═══ */}
      {(() => {
        const SECTION_ICON: Record<string, React.ElementType> = { cockpit: Gauge, chantiers: Flame, blueprint: Layers, dataroom: Database, playbooks: BookOpen, conferenceai: Video };
        const DeptIcon = isOrbit9 ? Atom : (rightSection && SECTION_ICON[rightSection]) ? SECTION_ICON[rightSection] : (DEPT_DASH_ICON[activeBotCode] || Home);
        const deptLabel = isOrbit9 ? "" : (DEPT_SHORT_LABEL[activeBotCode] || "");
        const O9_LABEL: Record<string, string> = { dashboard: "Dashboard", blueprint: "Blueprint", cellules: "Cellules", jumelage: "Jumelage", gouvernance: "Gouvernance", pionniers: "Pionniers", vitaa: "VITAA", perso: "Mon profil", feed: "Nouvelles", evenements: "Événements", "creer-cellule": "Créer une cellule" };
        const sectionLabel = isOrbit9
          ? (O9_LABEL[o9Section] || "Orbit⁹")
          : rightSection === "cockpit" ? "Cockpit" : rightSection === "chantiers" ? "Chantiers" : rightSection === "blueprint" ? "Blueprint" : rightSection === "dataroom" ? "Data Room" : rightSection === "playbooks" ? "Playbook Store" : rightSection === "conferenceai" ? "Conference AI" : activePhase === "reflexion" ? "Réflexion" : "Cockpit";
        const titleText = isOrbit9
          ? `Orbit⁹ — ${sectionLabel}`
          : `Département ${deptLabel} — ${sectionLabel}`;
        const showBlueprintTabs = !isOrbit9 && rightSection === "blueprint";
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
            {!isOrbit9 && activePhase === "reflexion" && reflexionContext && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-orange-600">{reflexionContext}</span>
              </>
            )}
            {!isOrbit9 && activePhase !== "observation" && activePhase !== "reflexion" && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className={cn("text-[11px] font-medium", pc.text)}>{pc.label}</span>
              </>
            )}
            <div className="flex-1" />
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
            </CanvasActionProvider>
          </div>
        ) : isOrbit9 ? (
          /* Orbit9 sections — COPIE EXACTE SimAmorcer L813-826 */
          <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
            <CanvasActionProvider>
              {o9Section === "dashboard" && <Orbit9SocialHome />}
              {o9Section === "blueprint" && <Orbit9BlueprintCollaboration />}
              {o9Section === "cellules" && <MesCellules onSelect={() => {}} activePhase={activePhase} />}
              {o9Section === "vitaa" && <VITAADashboard selectedCellule={ORBIT9_CELLULES[0]} />}
              {o9Section === "perso" && <MonProfilOrbit9 />}
              {o9Section === "gouvernance" && <Orbit9Gouvernance />}
              {o9Section === "jumelage" && <JumelageOrbit9 />}
              {o9Section === "pionniers" && <PionniersOrbit9 />}
              {o9Section === "creer-cellule" && <CreerCellulePage />}
            </CanvasActionProvider>
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
