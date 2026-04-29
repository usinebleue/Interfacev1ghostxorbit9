/**
 * WorkspacePhasesPanel.tsx — Atelier / Right Panel V3
 * Zone droite flex-1 — Tabs AMORCER + contenu dynamique
 * Architecture V3 — Zéro Destruction
 *
 * Greffe chirurgicale du ResizablePanel droit de SimAmorcer (L722-840)
 * - Header département pastel h-12
 * - Tabs AMORCER (7 phases) avec chevrons
 * - Switch: VueEnsemble (observation/attention/moderation) | PhaseReflexion | ChantierDrillDown
 * - SectionViews: CockpitView, BlueprintView, DataRoomView, PlaybookStoreView, ConferenceAIView
 */

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
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
  Rocket,
  Shield,
  MessageCircle,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAmorcer, pushSectionURL } from "./AmorcerContext";
import { useChatContext } from "../v2/context/ChatContext";
import { CanvasActionProvider, useCanvasActions } from "../v2/context/CanvasActionContext";

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
import { ExecutionView } from "./sections/ExecutionView";
import { EXECUTION_HEADER_TABS } from "./sections/execution-data";
import { AgendaView } from "./sections/AgendaView";
import { AdminView } from "./sections/AdminView";

// ═══ Orbit9 V3 — composant cristallisé ═══
import { Orbit9View } from "./sections/orbit9/Orbit9View";
import { O9_HEADER_TABS } from "./sections/orbit9/orbit9-data";

// ═══ Simulation — composants demos (séparés du code cristallisé) ═══
import {
  VueEnsemble,
  PhaseReflexion,
  PhaseConception,
  PhaseConceptionDocument,
  PhaseConceptionTableur,
  PhaseConceptionPresentation,
  PhaseConceptionCode,
  PhaseConceptionJumelage,
  ChantierDrillDown,
  PhaseExecution,
  FocusDiscussionView,
} from "./simulation/sim-content-map";

// ═══ V2 Sections — lazy imports pour adapter V2→V3 (Fix R7) ═══
const LazyMonBureauView = lazy(() => import("../v2/zones/center/MonBureauView").then(m => ({ default: m.MonBureauView })));
const LazyDashboardView = lazy(() => import("../v2/zones/center/DashboardView").then(m => ({ default: m.DashboardView })));
const LazyDepartmentTDC = lazy(() => import("../v2/zones/center/DepartmentTourDeControle").then(m => ({ default: m.DepartmentTourDeControle })));
const LazyMonReseauView = lazy(() => import("../v2/zones/center/MonReseauView").then(m => ({ default: m.MonReseauView })));
const LazySallesHubView = lazy(() => import("../v2/zones/center/SallesHubView").then(m => ({ default: m.SallesHubView })));
const LazyBoardRoomView = lazy(() => import("../v2/zones/center/BoardRoomView").then(m => ({ default: m.BoardRoomView })));
const LazyWarRoomView = lazy(() => import("../v2/zones/center/WarRoomView").then(m => ({ default: m.WarRoomView })));
const LazyThinkRoomView = lazy(() => import("../v2/zones/center/ThinkRoomView").then(m => ({ default: m.ThinkRoomView })));
const LazyDiagnosticIAPage = lazy(() => import("../v2/zones/center/diagnostic/DiagnosticIAPage").then(m => ({ default: m.DiagnosticIAPage })));
const LazyAgentSettingsView = lazy(() => import("../v2/zones/center/AgentSettingsView").then(m => ({ default: m.AgentSettingsView })));
const LazySanteGlobaleView = lazy(() => import("../v2/zones/center/SanteGlobaleView").then(m => ({ default: m.SanteGlobaleView })));
const LazyScenarioHub = lazy(() => import("../v2/zones/center/ScenarioHub").then(m => ({ default: m.ScenarioHub })));
const LazyAtelierHub = lazy(() => import("../v2/zones/center/atelier/AtelierHub").then(m => ({ default: m.AtelierHub })));
const LazyBibleOfficielle = lazy(() => import("../v2/zones/center/orbit9/MasterBibleOfficielle").then(m => ({ default: m.MasterBibleOfficielle })));

// ═══ FocusModeLayout — lazy import pour Fix R4 (FocusMode dans panel V3) ═══
const LazyFocusModeLayout = lazy(() => import("../v2/zones/center/FocusModeLayout").then(m => ({ default: m.FocusModeLayout })));

/** Map V3 rightSection → lazy V2 component (Fix R7: fallback pour sections non-V3) */
const V2_SECTION_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  "bureau": LazyMonBureauView,
  "dashboard": LazyDashboardView,
  "department": LazyDepartmentTDC,
  "mon-reseau": LazyMonReseauView,
  "salles-hub": LazySallesHubView,
  "board-room": LazyBoardRoomView,
  "war-room": LazyWarRoomView,
  "think-room": LazyThinkRoomView,
  "diagnostic-ia": LazyDiagnosticIAPage,
  "agent-settings": LazyAgentSettingsView,
  "mon-entreprise": LazyDepartmentTDC,
  "mon-equipe": LazyDepartmentTDC,
  "sante": LazySanteGlobaleView,
  "reglages": LazyAgentSettingsView,
  "scenarios": LazyScenarioHub,
  "ateliers": LazyAtelierHub,
  "bible-officielle": LazyBibleOfficielle,
};

function V2SectionFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse text-sm">Chargement...</div>
    </div>
  );
}

/** Fix R4 — FocusMode dans le panel V3, pas en overlay plein écran */
function FocusAwareContent({ children }: { children: React.ReactNode }) {
  const { focusData, clearFocusMode } = useCanvasActions();
  if (focusData) {
    return (
      <Suspense fallback={<V2SectionFallback />}>
        <LazyFocusModeLayout focusData={focusData} onClose={clearFocusMode} />
      </Suspense>
    );
  }
  return <>{children}</>;
}


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
    conceptionStage,
    startConception,
    activeDeliverable,
    setActiveDeliverable,
    deliverableStage,
    startDeliverable,
    focusType,
    setFocusType,
  } = useAmorcer();

  const { sendMessage, newConversation } = useChatContext();
  const rightRef = useRef<HTMLDivElement>(null);

  // Sous-tabs avec sync URL — parser le path (peut avoir dept prefix: /cmo/blueprint/ca)
  const [blueprintHeaderView, setBlueprintHeaderViewRaw] = useState<HeaderView>(() => {
    const parts = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    // Trouver "blueprint" dans les segments, le sub est le segment suivant
    const bpIdx = parts.indexOf("blueprint");
    if (bpIdx >= 0 && parts[bpIdx + 1]) return parts[bpIdx + 1] as HeaderView;
    return "blueprint";
  });
  const setBlueprintHeaderView = useCallback((v: HeaderView) => {
    setBlueprintHeaderViewRaw(v);
    pushSectionURL("blueprint", v === "blueprint" ? null : v);
  }, []);
  const [blueprintStats, setBlueprintStats] = useState<{ tier: string; tierLabel: string; score: number } | null>(null);
  const [executionTab, setExecutionTabRaw] = useState<string>(() => {
    const parts = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    const exIdx = parts.indexOf("execution");
    if (exIdx >= 0 && parts[exIdx + 1]) return parts[exIdx + 1];
    return "live";
  });
  const setExecutionTab = useCallback((t: string) => {
    setExecutionTabRaw(t);
    pushSectionURL("execution", t === "live" ? null : t);
  }, []);

  // Handler réel — ouvre la vue focus workspace + envoie un vrai message au chat
  const PHASE_PROMPT: Record<string, string> = {
    discussion: "Parlons de",
    reflexion: "Analyse approfondie :",
    creation: "Conception pour",
    execution: "Plan d'exécution pour",
    retroaction: "Bilan et rétroaction sur",
  };
  const handleWorkAction = (phase: string, context: string, deliverable?: string, ft?: string) => {
    // 1. Parker le thread courant et créer un nouveau thread lié à l'élément
    try {
      sessionStorage.setItem("ghostx-pending-chantier-link", context);
      sessionStorage.setItem("ghostx-pending-flow-section", phase);
    } catch { /* noop */ }
    newConversation();

    // 2. Mettre à jour l'état V3
    setActivePhase(phase as PhaseKey);
    setReflexionContext(context);
    setFocusType(ft || "chantier");

    if (phase === "execution") {
      // Exécution → section réelle ExecutionView
      setRightSection("execution");
    } else if (phase === "creation" && deliverable) {
      // Conception avec livrable → Blueprint réel
      setRightSection("blueprint");
    } else {
      // Discussion, Réflexion, Conception, Rétroaction →
      // Lâcher la section pour afficher la vue focus modélisée dans le workspace
      // + envoyer un vrai message au chat (Zone 2)
      setRightSection(null);
    }

    // 3. Envoyer le message initial — délai pour que React flush le reset de newConversation()
    // Sans ce délai, sendMessage voit encore les anciens messages → coaching "39 échanges" se déclenche
    const prompt = PHASE_PROMPT[phase] || "Parlons de";
    setTimeout(() => sendMessage(`${prompt} ${context}`), 80);
  };

  const pc = PHASE_CONFIG[activePhase];
  const isOrbit9 = cockpitTab === "orbit9";
  const isDash = activePhase === "observation" || activePhase === "attention" || activePhase === "moderation";

  // Scroll to top on phase change only (pas sur section nav — Carl veut pas d'ancre auto)
  useEffect(() => {
    rightRef.current && (rightRef.current.scrollTop = 0);
  }, [activePhase]);

  // Auto-scroll désactivé — chatStage simulation pas branchée sur le vrai chat

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">

      {/* ═══ HEADER DÉPARTEMENT PASTEL h-12 ═══ */}
      {(() => {
        const SECTION_ICON: Record<string, React.ElementType> = { cockpit: Gauge, execution: Rocket, blueprint: Layers, dataroom: Database, playbooks: BookOpen, conferenceai: Video, "bureau-agenda": Calendar, admin: Shield, orbit9: Atom };
        const SECTION_LABEL: Record<string, string> = { cockpit: "Cockpit", execution: "Exécution", blueprint: "Blueprint", dataroom: "Données", playbooks: "Playbook", conferenceai: "Réunion", "bureau-agenda": "Agenda", admin: "Administration", orbit9: "Orbit⁹" };
        // activeSection = source unique pour icon, label, tabs (orbit9 traité comme une section)
        const activeSection = (isOrbit9 && !rightSection) ? "orbit9" : rightSection;
        const DeptIcon = (activeSection && SECTION_ICON[activeSection]) ? SECTION_ICON[activeSection] : (DEPT_DASH_ICON[activeBotCode] || Home);
        const deptLabel = activeSection === "orbit9" ? "" : (DEPT_SHORT_LABEL[activeBotCode] || "");
        const sectionLabel = (activeSection && SECTION_LABEL[activeSection]) ? SECTION_LABEL[activeSection] : activePhase === "discussion" ? "Discussion" : activePhase === "reflexion" ? "Réflexion" : activePhase === "creation" ? "Conception" : "Tableau de bord";
        const DELIVERABLE_TITLE: Record<string, string> = { document: "Cahier de projet Boreal", spreadsheet: "Tableau de bord financier Boreal", presentation: "Pitch Deck CA Boreal", code: "Dashboard IoT Boreal", jumelage: "Jumelage SMART Orbit⁹" };
        const titleText = activeSection === "orbit9"
          ? "Orbit⁹"
          : `Département ${deptLabel} — ${sectionLabel}`;
        const showBlueprintTabs = activeSection === "blueprint";
        const showOrbit9Tabs = activeSection === "orbit9";
        const showExecutionTabs = activeSection === "execution";
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
            {/* Sous-tabs Exécution — même pattern que Orbit9/Blueprint */}
            {showExecutionTabs && (
              <>
                <div className="w-px h-5 bg-gray-300 mx-1.5" />
                <div className="flex items-center gap-1">
                  {EXECUTION_HEADER_TABS.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setExecutionTab(tab.key)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                        executionTab === tab.key
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
            {activeSection !== "orbit9" && activePhase === "discussion" && reflexionContext && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-sky-600">{reflexionContext}</span>
              </>
            )}
            {activeSection !== "orbit9" && activePhase === "reflexion" && reflexionContext && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-orange-600">{reflexionContext}</span>
              </>
            )}
            {activeSection !== "orbit9" && activePhase === "creation" && activeDeliverable && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-amber-600">{DELIVERABLE_TITLE[activeDeliverable] || activeDeliverable}</span>
              </>
            )}
            {activeSection !== "orbit9" && activePhase !== "observation" && activePhase !== "reflexion" && activePhase !== "creation" && activePhase !== "discussion" && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className={cn("text-[11px] font-medium", pc.text)}>{pc.label}</span>
              </>
            )}
            <div className="flex-1" />
            {/* Indicateur discussion active — retour rapide */}
            {rightSection && reflexionContext && (activePhase === "discussion" || activePhase === "reflexion" || activePhase === "creation") && (
              <button
                onClick={() => setRightSection(null)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer shrink-0"
                title={`Retour à : ${reflexionContext}`}
              >
                <MessageCircle className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{reflexionContext}</span>
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
        {rightSection ? (
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
              <FocusAwareContent>
              {rightSection === "cockpit" && <CockpitView embedded initialDept={activeBotCode} onAction={handleWorkAction} />}
              {rightSection === "blueprint" && <BlueprintView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" hideHeader activeHeaderView={blueprintHeaderView} onHeaderViewChange={setBlueprintHeaderView} onStats={setBlueprintStats} />}
              {rightSection === "dataroom" && <DataRoomView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" showHeader />}
              {rightSection === "playbooks" && <PlaybookStoreView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" showHeader />}
              {rightSection === "conferenceai" && <ConferenceAIView headerGradient="from-blue-600 to-blue-500" onNavigateToStore={() => setRightSection("playbooks")} botCode={activeBotCode} />}
              {rightSection === "execution" && <ExecutionView botCode={activeBotCode} showHeader activeTab={executionTab} onTabChange={setExecutionTab} onAction={handleWorkAction} />}
              {rightSection === "bureau-agenda" && <AgendaView botCode={activeBotCode} showHeader onAction={handleWorkAction} />}
              {rightSection === "admin" && <AdminView botCode={activeBotCode} showHeader onAction={handleWorkAction} />}
              {/* V2 Section Adapter — fallback pour sections non-V3 (Fix R7) */}
              {rightSection && !["cockpit","blueprint","dataroom","playbooks","conferenceai","execution","bureau-agenda","admin"].includes(rightSection) && (() => {
                const V2Comp = V2_SECTION_MAP[rightSection];
                if (V2Comp) return <Suspense fallback={<V2SectionFallback />}><V2Comp /></Suspense>;
                return null;
              })()}
              </FocusAwareContent>
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
            <VueEnsemble phase={activePhase} chatStage={chatStage} onStartReflexion={startReflexion} onStartSimulation={(type) => startDeliverable(type)} />
          </div>
        ) : activePhase === "discussion" && reflexionContext ? (
          /* Focus Discussion — vue focus adaptative selon le type d'élément */
          <FocusDiscussionView
            context={reflexionContext}
            focusType={focusType}
            onBack={() => { setActivePhase("observation"); setReflexionContext(null); setRightSection("cockpit"); }}
            onAdvancePhase={(phase) => {
              setActivePhase(phase as PhaseKey);
              if (phase === "execution") setRightSection("execution");
            }}
            activePhase="discussion"
          />
        ) : activePhase === "reflexion" ? (
          /* Réflexion magazine */
          <PhaseReflexion stage={chatStage} context={reflexionContext} onStartConception={startConception} />
        ) : activePhase === "creation" && activeDeliverable === "document" ? (
          <PhaseConceptionDocument stage={deliverableStage} onBack={() => setActiveDeliverable(null)} onStartJumelage={() => startDeliverable("jumelage")} />
        ) : activePhase === "creation" && activeDeliverable === "spreadsheet" ? (
          <PhaseConceptionTableur stage={deliverableStage} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" && activeDeliverable === "presentation" ? (
          <PhaseConceptionPresentation stage={deliverableStage} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" && activeDeliverable === "code" ? (
          <PhaseConceptionCode stage={deliverableStage} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" && activeDeliverable === "jumelage" ? (
          <PhaseConceptionJumelage stage={deliverableStage} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" ? (
          /* Conception Level 1 — chantier (hero + sidebar + validation + livrables grid) */
          <PhaseConception stage={conceptionStage} context={reflexionContext} onStartExecution={() => { setActivePhase("execution"); setRightSection(null); }} onSelectDeliverable={(id) => startDeliverable(id)} />
        ) : activePhase === "execution" ? (
          /* Exécution — hero vert + sidebar SF 5 sections */
          <PhaseExecution stage={chatStage} />
        ) : (
          /* Rétroaction et autres — drill-down */
          <ChantierDrillDown phase={activePhase} />
        )}
      </div>
    </div>
  );
}
