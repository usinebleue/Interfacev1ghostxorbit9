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
  Check,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useIsMobile } from "../components/ui/use-mobile";
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
  ConceptionWizard,
  PhaseConceptionDocument,
  PhaseConceptionTableur,
  PhaseConceptionPresentation,
  PhaseConceptionCode,
  PhaseConceptionJumelage,
  ChantierDrillDown,
  PhaseExecution,
  FocusDiscussionView,
} from "./simulation/sim-content-map";

// ═══ V3 Phase Views ═══
import { LivePhaseView } from "./phases/LivePhaseView";
import { LiveReflexionView } from "./phases/LiveReflexionView";
import { UnifiedPhaseView } from "./phases/UnifiedPhaseView";
import { DocumentWorkspaceView } from "./phases/DocumentWorkspaceView";
import { useWorkspaceCapture } from "./hooks/useWorkspaceCapture";
import { useLiveKitMeeting } from "./hooks/useLiveKitMeeting";
import { MeetingVideoStrip } from "./meeting/MeetingVideoStrip";

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
    workflowItems,
    activeDocumentKey,
    activeDocumentSection,
    activeMeeting,
    setActiveMeeting,
    setMeetingControls,
  } = useAmorcer();

  const { sendMessage, newConversation } = useChatContext();
  const isMobile = useIsMobile();

  // ═══ AUTO-CAPTURE — TOUJOURS actif, pas juste quand LivePhaseView est monté ═══
  useWorkspaceCapture();

  // ═══ MEETING LIVEKIT — intégré dans le workspace (pas de silo MeetingRoomView) ═══
  const meeting = useLiveKitMeeting();

  // Auto-start meeting quand activeMeeting change (fallback — ConferenceAIView appelle onStartMeeting directement dans le click handler)
  // Avec le batching React 18, si onStartMeeting est appelé dans le même click, meetingStatus sera déjà "creating" ici → pas de double-start
  useEffect(() => {
    if (activeMeeting && meeting.meetingStatus === "idle") {
      meeting.startMeeting(activeMeeting.type, activeMeeting.title);
    }
  }, [activeMeeting]); // eslint-disable-line react-hooks/exhaustive-deps

  // Propager le slug de la réunion créée vers activeMeeting (pour le polling transcript)
  useEffect(() => {
    if (meeting.meetingData?.slug && activeMeeting && !activeMeeting.slug) {
      setActiveMeeting({ ...activeMeeting, slug: meeting.meetingData.slug });
    }
  }, [meeting.meetingData?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-clear activeMeeting quand la réunion se termine
  useEffect(() => {
    if (meeting.meetingStatus === "ended") {
      // Reset après le délai de 2s du hook (il repasse à "idle")
      const t = setTimeout(() => setActiveMeeting(null), 2500);
      return () => clearTimeout(t);
    }
  }, [meeting.meetingStatus, setActiveMeeting]);

  // ═══ SYNC meeting controls vers AmorcerContext (pour MeetingMiniBar mobile) ═══
  useEffect(() => {
    if (meeting.meetingStatus !== "idle") {
      setMeetingControls({
        meetingStatus: meeting.meetingStatus,
        micEnabled: meeting.micEnabled,
        cameraEnabled: meeting.cameraEnabled,
        elapsedTime: meeting.elapsedTime,
        participants: meeting.participants,
        toggleMic: meeting.toggleMic,
        toggleCamera: meeting.toggleCamera,
        endMeeting: meeting.endMeeting,
      });
    } else {
      setMeetingControls(null);
    }
  }, [meeting.meetingStatus, meeting.micEnabled, meeting.cameraEnabled, meeting.elapsedTime, meeting.participants, setMeetingControls]);

  // Cleanup meeting controls au démontage
  useEffect(() => { return () => setMeetingControls(null); }, [setMeetingControls]);

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

  // Auto-switch execution tab quand demandé par DiscussionWindow (thread resume)
  useEffect(() => {
    if (rightSection !== "execution") return;
    try {
      const requested = sessionStorage.getItem("bt_exec_tab_request");
      if (requested) {
        setExecutionTab(requested);
        sessionStorage.removeItem("bt_exec_tab_request");
      }
    } catch { /* noop */ }
  }, [rightSection, setExecutionTab]);

  // Handler réel — ouvre la vue focus workspace + envoie un vrai message au chat
  const PHASE_PROMPT: Record<string, string> = {
    discussion: "Parlons de",
    reflexion: "Analyse approfondie :",
    creation: "Conception pour",
    execution: "Plan d'exécution pour",
    retroaction: "Bilan et rétroaction sur",
  };
  const handleWorkAction = (phase: string, context: string, deliverable?: string, ft?: string | undefined) => {
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

    if (phase === "creation" && deliverable) {
      // Conception avec livrable → Blueprint réel
      setRightSection("blueprint");
    } else if (phase === "execution" || phase === "retroaction") {
      // Exécution/Rétroaction = PHASE view, jamais dans rightSection (anti-persistence)
      setRightSection(null);
      setExecutionTab(phase === "retroaction" ? "retroaction" : "live");
    } else {
      // Discussion, Réflexion, Conception →
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

  // Sprint 6: execution/retroaction routing
  // "execution" rightSection est set aux POINTS DE TRANSITION (handleWorkAction, onPhaseComplete, progress bar, sidebar)
  // Le stale localStorage est nettoyé dans AmorcerContext initialization (lsSet + guard)

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
        const sectionLabel = (activeSection && SECTION_LABEL[activeSection]) ? SECTION_LABEL[activeSection] : PHASE_CONFIG[activePhase]?.label || "Tableau de bord";
        const DELIVERABLE_TITLE: Record<string, string> = { document: "Cahier de projet Boreal", spreadsheet: "Tableau de bord financier Boreal", presentation: "Pitch Deck CA Boreal", code: "Dashboard IoT Boreal", jumelage: "Jumelage SMART Orbit⁹" };
        const titleText = activeSection === "orbit9"
          ? "Orbit⁹"
          : `${sectionLabel} — ${deptLabel}`;
        const showBlueprintTabs = activeSection === "blueprint";
        const showOrbit9Tabs = activeSection === "orbit9";
        const showExecutionTabs = activeSection === "execution" || (!rightSection && (activePhase === "execution" || activePhase === "retroaction"));
        return (
          <div className={cn("h-12 shrink-0 flex items-center gap-2 border-b border-gray-200 bg-[#00B4D8]/[0.12]", "px-3")}>
            {!isMobile && <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />}
            <span className={cn("font-bold text-gray-900 shrink-0", isMobile ? "text-xs" : "text-sm")}>{titleText}</span>
            {/* Sous-tabs Blueprint */}
            {showBlueprintTabs && (
              <>
                {!isMobile && <div className="w-px h-5 bg-gray-300 mx-1.5" />}
                <div className="flex items-center gap-1">
                  {BLUEPRINT_HEADER_TABS.filter(t => !t.ceoOnly || activeBotCode === "CEOB").map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setBlueprintHeaderView(tab.key)}
                      className={cn(
                        "rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer",
                        isMobile ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
                        blueprintHeaderView === tab.key
                          ? "bg-[#073E5A] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <tab.icon className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                      {!isMobile && (tab.key === "blueprint" ? (DEPT_SHORT_LABEL[activeBotCode] || "Direction") : tab.label)}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Sous-tabs Orbit9 — même pattern que Blueprint */}
            {showOrbit9Tabs && (
              <>
                {!isMobile && <div className="w-px h-5 bg-gray-300 mx-1.5" />}
                <div className="flex items-center gap-1">
                  {O9_HEADER_TABS.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setO9Section(tab.key)}
                      className={cn(
                        "rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer",
                        isMobile ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
                        o9Section === tab.key
                          ? "bg-[#073E5A] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <tab.icon className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                      {!isMobile && tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Sous-tabs Exécution — même pattern que Orbit9/Blueprint */}
            {showExecutionTabs && (
              <>
                {!isMobile && <div className="w-px h-5 bg-gray-300 mx-1.5" />}
                <div className="flex items-center gap-1">
                  {EXECUTION_HEADER_TABS.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setExecutionTab(tab.key)}
                      className={cn(
                        "rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer",
                        isMobile ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
                        executionTab === tab.key
                          ? "bg-[#073E5A] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <tab.icon className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                      {!isMobile && tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {!isMobile && activeSection !== "orbit9" && activePhase === "discussion" && reflexionContext && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-sky-600">{reflexionContext}</span>
              </>
            )}
            {!isMobile && activeSection !== "orbit9" && activePhase === "reflexion" && reflexionContext && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-orange-600">{reflexionContext}</span>
              </>
            )}
            {!isMobile && activeSection !== "orbit9" && activePhase === "creation" && activeDeliverable && !rightSection && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-amber-600">{DELIVERABLE_TITLE[activeDeliverable] || activeDeliverable}</span>
              </>
            )}
            {!isMobile && activeSection !== "orbit9" && activePhase !== "observation" && activePhase !== "reflexion" && activePhase !== "creation" && activePhase !== "discussion" && !rightSection && (
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

      {/* ═══ BARRE DE PROGRESSION 5 PHASES ═══ */}
      {!rightSection && !isOrbit9 && !isDash && (() => {
        const WORKFLOW_PHASES: { key: string; label: string }[] = [
          { key: "discussion", label: "Discussion" },
          { key: "reflexion", label: "Réflexion" },
          { key: "creation", label: "Conception" },
          { key: "execution", label: "Exécution" },
          { key: "retroaction", label: "Rétroaction" },
        ];
        const phaseOrder = WORKFLOW_PHASES.map(p => p.key);
        const activeIdx = phaseOrder.indexOf(activePhase);
        return (
          <div className="h-9 px-3 shrink-0 flex items-center gap-1 border-b border-gray-200 bg-white">
            {WORKFLOW_PHASES.map((wp, i) => {
              const pc2 = PHASE_CONFIG[wp.key as PhaseKey];
              const isCurrent = wp.key === activePhase;
              const isDone = i < activeIdx;
              const isFuture = i > activeIdx;
              const count = workflowItems.filter(w => w.phase === wp.key).length;
              const cascadeCount = workflowItems.filter(w => w.phase === wp.key && w.type === "cascade").length;
              return (
                <button
                  key={wp.key}
                  onClick={() => {
                    setActivePhase(wp.key as PhaseKey);
                    setRightSection(null); // phases rendues via activePhase, jamais rightSection
                    if (wp.key === "execution" || wp.key === "retroaction") {
                      setExecutionTab(wp.key === "retroaction" ? "retroaction" : "live");
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer",
                    isCurrent ? `${pc2.btnBg} ${pc2.btnText} ${pc2.btnBorder} border shadow-sm` :
                    isDone ? "bg-green-50 text-green-700 border border-green-200" :
                    "text-gray-400 hover:bg-gray-50 border border-transparent"
                  )}
                >
                  {isDone ? <Check className="h-3 w-3 text-green-500" /> : <pc2.Icon className={cn("h-3 w-3", isCurrent ? pc2.text : "text-gray-300")} />}
                  <span>{wp.label}</span>
                  {count > 0 && <span className={cn("text-[9px] px-1 rounded-full", isCurrent ? pc2.badge : "bg-gray-100 text-gray-500")}>{count}</span>}
                  {!isCurrent && cascadeCount > 0 && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded-full">{cascadeCount}</span>}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* ═══ SLOT MOBILE SIDEBAR — portal target pour MobileSidebarSheet ═══ */}
      {isMobile && <div id="mobile-sidebar-slot" className="shrink-0" />}

      {/* ═══ CONTENU DYNAMIQUE ═══ */}
      <div ref={rightRef} className="flex-1 overflow-auto bg-gray-50">
        {rightSection ? (
          /* Blueprint sections */
          <div className={"max-w-4xl mx-auto px-6 py-4 pb-12 sim-blueprint-pastel"}>
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
              {rightSection === "conferenceai" && <ConferenceAIView headerGradient="from-blue-600 to-blue-500" onNavigateToStore={() => setRightSection("playbooks")} onStartMeeting={meeting.startMeeting} botCode={activeBotCode} />}
              {/* ExecutionView rendu via activePhase ci-dessous — plus jamais via rightSection */}
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
          <div className={"max-w-4xl mx-auto px-6 py-4 pb-12"}>
            <Orbit9View />
          </div>
        ) : isDash ? (
          /* Dashboard views (Observation, Attention, Moderation) */
          <div className={"max-w-4xl mx-auto px-6 py-4 pb-12"}>
            <VueEnsemble phase={activePhase} chatStage={chatStage} onStartReflexion={startReflexion} onStartSimulation={(type) => startDeliverable(type)} />
          </div>
        ) : activePhase === "discussion" ? (
          /* Discussion — workspace PASSIF (reçoit le contenu de la discussion) — PAS de gate sur reflexionContext */
          <LivePhaseView
            phaseKey="discussion"
            context={reflexionContext || "Discussion en cours"}
            onPhaseComplete={() => { setActivePhase("reflexion"); setRightSection(null); }}
          />
        ) : activePhase === "reflexion" ? (
          /* Réflexion — LiveReflexionView avec techniques (SCAMPER, 5 Pourquoi, modes, etc.) */
          <LiveReflexionView
            context={reflexionContext}
            onPhaseComplete={() => {
              // Inter-phase flow: notes épinglées de Réflexion → premier prompt Conception
              const reflexionNotes = workflowItems.filter(w => w.phase === "reflexion");
              startConception();
              if (reflexionNotes.length > 0) {
                const ctx = reflexionNotes.map(n => n.text).join("\n- ");
                sendMessage(`Contexte de réflexion :\n- ${ctx}\n\nPassons à la conception.`, activeBotCode);
              }
            }}
          />
        ) : activePhase === "creation" && activeDocumentKey ? (
          /* Conception — Blueprint Atelier dans le workspace (Sprint 5) */
          <DocumentWorkspaceView
            documentKey={activeDocumentKey}
            botCode={activeBotCode}
            initialSectionId={activeDocumentSection || undefined}
            context={reflexionContext}
            onPhaseComplete={() => { setActivePhase("execution"); setRightSection(null); setExecutionTab("live"); }}
          />
        ) : activePhase === "creation" && activeDeliverable === "document" ? (
          <PhaseConceptionDocument stage={Math.max(deliverableStage, 1)} onBack={() => setActiveDeliverable(null)} onStartJumelage={() => startDeliverable("jumelage")} />
        ) : activePhase === "creation" && activeDeliverable === "spreadsheet" ? (
          <PhaseConceptionTableur stage={Math.max(deliverableStage, 1)} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" && activeDeliverable === "presentation" ? (
          <PhaseConceptionPresentation stage={Math.max(deliverableStage, 1)} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" && activeDeliverable === "code" ? (
          <PhaseConceptionCode stage={Math.max(deliverableStage, 1)} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" && activeDeliverable === "jumelage" ? (
          <PhaseConceptionJumelage stage={Math.max(deliverableStage, 1)} onBack={() => setActiveDeliverable(null)} />
        ) : activePhase === "creation" ? (
          /* Conception — 4 étapes auto-capture */
          <LivePhaseView
            phaseKey="creation"
            context={reflexionContext}
            onPhaseComplete={() => { setActivePhase("execution"); setRightSection(null); setExecutionTab("live"); }}
          />
        ) : (activePhase === "execution" || activePhase === "retroaction") ? (
          /* Exécution / Rétroaction — PHASE view (rendu via activePhase, jamais rightSection) */
          <div className={"max-w-4xl mx-auto px-6 py-4 pb-12"}>
            <ExecutionView botCode={activeBotCode} showHeader activeTab={executionTab} onTabChange={setExecutionTab} onAction={handleWorkAction} />
          </div>
        ) : (
          /* Fallback — Discussion sans contexte ou état inattendu → Cockpit */
          <div className={"max-w-4xl mx-auto px-6 py-4 pb-12"}>
            <CanvasActionProvider>
              <FocusAwareContent>
                <CockpitView embedded initialDept={activeBotCode} onAction={handleWorkAction} />
              </FocusAwareContent>
            </CanvasActionProvider>
          </div>
        )}
      </div>

      {/* ═══ MEETING VIDEO STRIP — caméras en bas du workspace pendant une réunion (desktop only, mobile = MeetingMiniBar) ═══ */}
      {!isMobile && <MeetingVideoStrip
        meetingStatus={meeting.meetingStatus}
        meetingTitle={activeMeeting?.title || ""}
        participants={meeting.participants}
        micEnabled={meeting.micEnabled}
        cameraEnabled={meeting.cameraEnabled}
        elapsedTime={meeting.elapsedTime}
        onToggleMic={meeting.toggleMic}
        onToggleCamera={meeting.toggleCamera}
        onEndMeeting={meeting.endMeeting}
      />}
    </div>
  );
}
