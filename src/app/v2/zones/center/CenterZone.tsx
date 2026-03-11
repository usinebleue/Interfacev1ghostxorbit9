/**
 * CenterZone.tsx — Router entre Dashboard, Department, Discussion, LiveChat, Canvas
 * InputBar fixe en bas (meme niveau que "Ma Productivite" dans sidebar)
 * V2: push_content panel, CREDO phase indicator, split-screen mode
 * Sprint B — CarlOS Noyau Omnipresent (D-081)
 */

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  BarChart3,
  ListOrdered,
  Table2,
  Bot,
  Pin,
  Loader2,
  CheckCircle2,
  Mic,
  RotateCcw,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import type { ActiveView } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import { DashboardView } from "./DashboardView";
import { CockpitView } from "./CockpitView";
import { HealthView } from "./HealthView";
import { DepartmentTourDeControle } from "./DepartmentTourDeControle";
import { DiscussionView } from "./DiscussionView";
import { BranchPatternsDemo } from "./BranchPatternsDemo";
import { CahierSmartDemo } from "./CahierSmartDemo";
import { ScenarioHub } from "./ScenarioHub";
import { LiveChat } from "./LiveChat";
import { SmartCanvas } from "./SmartCanvas";
import { DepartmentDetailView } from "./DepartmentDetailView";
// InputBar moved to SidebarRight (Sprint Final V1)
import { Orbit9DetailView } from "./orbit9/Orbit9DetailView";
import { AgentSettingsView } from "./AgentSettingsView";
import { EspaceBureauView } from "./EspaceBureauView";
import { BluePrintView } from "./BluePrintView";
import { BoardRoomView } from "./BoardRoomView";
import { WarRoomView } from "./WarRoomView";
import { ThinkRoomView } from "./ThinkRoomView";
import { MesChantiersView } from "./MesChantiersView";
import { FocusModeLayout } from "./FocusModeLayout";
import { PageTypePage } from "./orbit9/PageTypePage";
import { BibleTechniquePage } from "./orbit9/BibleTechniquePage";
import { BibleGHMLPage } from "./orbit9/BibleGHMLPage";
import { MasterRoadmapPage } from "./orbit9/MasterRoadmapPage";
import { MasterStrategiePage } from "./orbit9/MasterStrategiePage";
import { MasterOrbit9Page } from "./orbit9/MasterOrbit9Page";
import { MasterCommunicationPage } from "./orbit9/MasterCommunicationPage";
import { MasterDettePage } from "./orbit9/MasterDettePage";
import { MasterRoutinePage } from "./orbit9/MasterRoutinePage";
import { MasterMinedorPage } from "./orbit9/MasterMinedorPage";
import { MasterTrainingPage } from "./orbit9/MasterTrainingPage";
import { MasterProfilsPage } from "./orbit9/MasterProfilsPage";
import { MasterParcoursPage } from "./orbit9/MasterParcoursPage";
import { MasterNavigationPage } from "./orbit9/MasterNavigationPage";
import { MasterAnglesMortsPage } from "./orbit9/MasterAnglesMortsPage";
import { MasterCapacitesPage } from "./orbit9/MasterCapacitesPage";
import { MasterInstanceFondsPage } from "./orbit9/MasterInstanceFondsPage";
import MasterDiagnosticsPage from "./orbit9/MasterDiagnosticsPage";
import MasterPlaybooksPage from "./orbit9/MasterPlaybooksPage";
import MasterBibliothequeExecPage from "./orbit9/MasterBibliothequeExecPage";
import MasterMarketing360Page from "./orbit9/MasterMarketing360Page";
import MasterGuidesLegauxPage from "./orbit9/MasterGuidesLegauxPage";
import MasterCortexRobotPage from "./orbit9/MasterCortexRobotPage";
import MasterHydroQuebecPage from "./orbit9/MasterHydroQuebecPage";
import { MasterFlowsPage } from "./orbit9/MasterFlowsPage";
import { MasterCartographieIndustriellePage } from "./orbit9/MasterCartographieIndustriellePage";
import { MasterOracle9ConceptPage } from "./orbit9/MasterOracle9Page";
import { MasterBibleVisuelleLivePage } from "./orbit9/MasterBibleVisuelleLivePage";
import { MasterBibleVisuelCiblePage } from "./orbit9/MasterBibleVisuelCiblePage";
import { MasterBibleOfficielle } from "./orbit9/MasterBibleOfficielle";
import { FlowUsineBleuePage } from "./orbit9/FlowUsineBleuePage";
import { AnimationShowcasePage } from "./orbit9/AnimationShowcasePage";
import { AgentGalleryPage } from "./orbit9/AgentGalleryPage";
import { AccueilHeroPage } from "./orbit9/AccueilHeroPage";
import { PlaybookUsineBleuePage } from "./orbit9/PlaybookUsineBleuePage";
import { BlueprintReseauPage } from "./orbit9/BlueprintReseauPage";
import { FESidebarDroitePage } from "./orbit9/FESidebarDroitePage";
import { FEMonReseauPage } from "./orbit9/FEMonReseauPage";
import { CarlosCodesView } from "./CarlosCodesView";
import { DiagnosticIAPage } from "./diagnostic/DiagnosticIAPage";
import { DiagnosticHubPage } from "./diagnostic/DiagnosticHubPage";
import { ConferenceAIView } from "./ConferenceAIView";
import { useFlowGPS } from "../../api/hooks";

/** Couleur identitaire par bot — bande fine en haut du canevas */
const BOT_BAND_COLORS: Record<string, string> = {
  CEOB: "bg-blue-500",
  CTOB: "bg-violet-500",
  CFOB: "bg-emerald-500",
  CMOB: "bg-pink-500",
  CSOB: "bg-red-500",
  COOB: "bg-orange-500",
  CPOB: "bg-slate-400",
  CHROB: "bg-teal-500",
  CINOB: "bg-rose-500",
  CROB: "bg-amber-500",
  CLOB: "bg-indigo-500",
  CISOB: "bg-zinc-400",
};

/** Labels CREDO par couche */
const CREDO_LABELS: Record<string, Record<string, string>> = {
  bouche:  { C: "Connecter",  R: "Rechercher", E: "Exposer",    D: "Demontrer",  O: "Obtenir" },
  cerveau: { C: "Clarifier",  R: "Reflechir",  E: "Elaborer",   D: "Decider",    O: "Operer" },
  coeur:   { C: "Comprendre", R: "Resonner",   E: "Elever",     D: "Debloquer",  O: "Ouvrir" },
};

const CREDO_COLORS: Record<string, string> = {
  C: "bg-blue-500",
  R: "bg-violet-500",
  E: "bg-amber-500",
  D: "bg-emerald-500",
  O: "bg-green-600",
};

/** Icone par type de contenu pousse */
const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  recommendations: ListOrdered,
  tableau: Table2,
  metriques: BarChart3,
  plan_action: FileText,
  vocal: Mic,
  video: Bot,
};

/** FlowProgressBar — barre de progression pour sections ACTION */
function FlowProgressBar({ sectionKey }: { sectionKey: string }) {
  const { steps, currentStepIndex, isAction, completed, reset } = useFlowGPS(sectionKey);
  if (!isAction || steps.length === 0) return null;

  return (
    <div className="bg-white border-b px-4 py-2 shrink-0 flex items-center gap-2">
      {steps.map((step, i) => {
        const isDone = i < currentStepIndex || completed;
        const isCurrent = i === currentStepIndex && !completed;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <div className={cn("w-6 h-0.5 rounded-full", isDone ? "bg-green-300" : "bg-gray-200")} />
            )}
            <span className={cn(
              "text-[9px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all",
              isDone && "bg-green-100 text-green-700",
              isCurrent && "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
              !isDone && !isCurrent && "bg-gray-50 text-gray-400"
            )}>
              {step}
            </span>
          </div>
        );
      })}
      {currentStepIndex > 0 && !completed && (
        <button
          onClick={reset}
          className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors"
          title="Recommencer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
      {completed && (
        <span className="ml-auto flex items-center gap-1 text-[9px] text-green-600 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" /> Termine
        </span>
      )}
    </div>
  );
}

export function CenterZone() {
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();
  const {
    navigateAction, clearNavigateAction, consumeNext,
    activeWidget, activeAnnotation,
    pushedContent, credoPhases,
    executeAction,
    focusData, clearFocusMode,
    dismissWidget, dismissAnnotation,
    dismissPushedContent,
    dismissExecuteAction,
  } = useCanvasActions();
  const botBand = BOT_BAND_COLORS[activeBotCode];
  // liveChatMode removed — chat is in sidebar now
  const [pinnedContent, setPinnedContent] = useState(false);

  // --- Consommer les canvas actions navigate ---
  // Utilise navigateAction (state dedie) au lieu de lastAction
  // pour survivre au batching React quand plusieurs actions arrivent ensemble
  useEffect(() => {
    if (!navigateAction || !navigateAction.view) return;
    const params = navigateAction.params as Record<string, unknown> | undefined;
    const botCode = params?.bot as string | undefined;
    if (botCode && (navigateAction.view === "department" || navigateAction.view === "detail")) {
      navigateToDepartment(botCode, navigateAction.view as ActiveView);
    } else {
      setActiveView(navigateAction.view as ActiveView);
    }
    clearNavigateAction();
    consumeNext();
  }, [navigateAction, setActiveView, navigateToDepartment, clearNavigateAction, consumeNext]);

  // Quitter le Focus Mode automatiquement quand on navigue via sidebar
  useEffect(() => {
    if (focusData) clearFocusMode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const handleStartChat = (_mode: string) => {
    // Chat is now always visible in sidebar — just signal the canvas
    setActiveView("live-chat");
  };

  // Determiner si on montre l'indicateur CREDO (quand pas en phase default C/C/C)
  const showCredoIndicator = credoPhases.bouche !== "C" || credoPhases.cerveau !== "C" || credoPhases.coeur !== "C";

  const renderMainView = () => (
    <>
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "cockpit" && <CockpitView />}
      {activeView === "health" && <HealthView />}
      {activeView === "department" && <DepartmentTourDeControle />}
      {activeView === "discussion" && <DiscussionView />}
      {activeView === "branches" && <BranchPatternsDemo />}
      {activeView === "cahier" && <CahierSmartDemo />}
      {activeView === "scenarios" && <ScenarioHub />}
      {activeView === "detail" && <DepartmentDetailView />}
      {activeView === "live-chat" && <LiveChat />}
      {activeView === "orbit9-detail" && <Orbit9DetailView />}
      {activeView === "agent-settings" && <AgentSettingsView />}
      {activeView === "espace-bureau" && <EspaceBureauView />}
      {activeView === "blueprint" && <BluePrintView />}
      {activeView === "board-room" && <BoardRoomView />}
      {activeView === "war-room" && <WarRoomView />}
      {activeView === "think-room" && <ThinkRoomView />}
      {activeView === "mes-chantiers" && <MesChantiersView />}
      {activeView === "bible-visuelle" && <PageTypePage />}
      {activeView === "bible-technique" && <BibleTechniquePage />}
      {activeView === "bible-ghml" && <BibleGHMLPage />}
      {activeView === "master-roadmap" && <MasterRoadmapPage />}
      {activeView === "master-strategie" && <MasterStrategiePage />}
      {activeView === "master-orbit9" && <MasterOrbit9Page />}
      {activeView === "master-communication" && <MasterCommunicationPage />}
      {activeView === "master-dette" && <MasterDettePage />}
      {activeView === "master-routine" && <MasterRoutinePage />}
      {activeView === "master-minedor" && <MasterMinedorPage />}
      {activeView === "master-training" && <MasterTrainingPage />}
      {activeView === "master-profils" && <MasterProfilsPage />}
      {activeView === "master-parcours" && <MasterParcoursPage />}
      {activeView === "master-navigation" && <MasterNavigationPage />}
      {activeView === "master-angles-morts" && <MasterAnglesMortsPage />}
      {activeView === "master-capacites" && <MasterCapacitesPage />}
      {activeView === "master-instance-fonds" && <MasterInstanceFondsPage />}
      {activeView === "master-diagnostics" && <MasterDiagnosticsPage />}
      {activeView === "master-playbooks" && <MasterPlaybooksPage />}
      {activeView === "master-bibliotheque-exec" && <MasterBibliothequeExecPage />}
      {activeView === "master-marketing-360" && <MasterMarketing360Page />}
      {activeView === "master-guides-legaux" && <MasterGuidesLegauxPage />}
      {activeView === "master-cortex-robot" && <MasterCortexRobotPage />}
      {activeView === "master-hydro-quebec" && <MasterHydroQuebecPage />}
      {activeView === "master-flows" && <MasterFlowsPage />}
      {activeView === "master-cartographie" && <MasterCartographieIndustriellePage />}
      {activeView === "master-oracle9" && <MasterOracle9ConceptPage />}
      {activeView === "master-bible-live" && <MasterBibleVisuelleLivePage />}
      {activeView === "bible-visuelle-cible" && <MasterBibleVisuelCiblePage />}
      {activeView === "bible-officielle" && <MasterBibleOfficielle />}
      {activeView === "flow-usine-bleue" && <FlowUsineBleuePage />}
      {activeView === "animation-showcase" && <AnimationShowcasePage />}
      {activeView === "agent-gallery" && <AgentGalleryPage />}
      {activeView === "accueil-hero" && <AccueilHeroPage />}
      {activeView === "playbook-usine-bleue" && <PlaybookUsineBleuePage />}
      {activeView === "blueprint-reseau" && <BlueprintReseauPage />}
      {activeView === "fe-sidebar-droite" && <FESidebarDroitePage />}
      {activeView === "fe-mon-reseau" && <FEMonReseauPage />}
      {activeView === "carlos-codes" && <CarlosCodesView />}
      {activeView === "diagnostic-ia" && <DiagnosticIAPage />}
      {activeView === "diagnostic-hub" && <DiagnosticHubPage />}
      {activeView === "meeting-room" && <ConferenceAIView />}
      {activeView === "canvas" && (
        <SmartCanvas
          onStartChat={handleStartChat}
          onOpenScenarios={() => setActiveView("scenarios")}
        />
      )}
    </>
  );

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative">
      {/* Bandes couleur identitaire du bot actif — haut + gauche + droite du canevas */}
      {botBand && <div className={cn("h-1 shrink-0", botBand)} />}
      {botBand && <div className={cn("absolute left-0 top-0 bottom-0 w-1 z-10 pointer-events-none", botBand)} />}
      {botBand && <div className={cn("absolute right-0 top-0 bottom-0 w-1 z-10 pointer-events-none", botBand)} />}

      {/* Flow GPS bar — progression par etapes pour sections ACTION */}
      <FlowProgressBar sectionKey={activeView} />

      {/* Phase indicator — interne, sans labels visibles */}
      {showCredoIndicator && (
        <div className="bg-white border-b px-3 py-1 shrink-0 flex items-center gap-3">
          <Bot className="h-3.5 w-3.5 text-gray-400" />
        </div>
      )}

      {/* Vue principale — Priority 1: Focus Mode, Priority 2: split-screen, Priority 3: normal */}
      <div className="flex-1 overflow-hidden flex">
        {focusData ? (
          /* ── Focus Mode: element ancre plein canvas (chat dans sidebar) ── */
          <div className="flex-1 overflow-hidden">
            <FocusModeLayout focusData={focusData} onClose={clearFocusMode} />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {renderMainView()}
          </div>
        )}
      </div>

      {/* Overlay: Push Content Panel — Actif pour Dev Channel (Claude Code → Carl) */}
      {pushedContent && !focusData && (
        <div className={cn(
          "absolute top-12 right-3 z-50 w-80 max-h-[60vh] animate-in slide-in-from-right-4 duration-300",
          pinnedContent ? "opacity-100" : "opacity-95 hover:opacity-100"
        )}>
          <div className="bg-white border border-blue-200 rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-3 py-2 flex items-center gap-2">
              <img
                src={BOT_AVATAR[pushedContent.bot] || BOT_AVATAR["CEOB"]}
                alt={pushedContent.bot}
                className="w-5 h-5 rounded-full ring-1 ring-white/30"
              />
              <span className="text-xs font-bold text-white flex-1 truncate">{pushedContent.titre}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPinnedContent(!pinnedContent)}
                  className={cn(
                    "p-0.5 rounded transition-colors cursor-pointer",
                    pinnedContent ? "text-white bg-white/20" : "text-white/50 hover:text-white"
                  )}
                  title={pinnedContent ? "Desepingler" : "Epingler"}
                >
                  <Pin className="h-3 w-3" />
                </button>
                <button
                  onClick={() => { dismissPushedContent(); setPinnedContent(false); }}
                  className="text-white/50 hover:text-white cursor-pointer p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            {/* Content type badges */}
            <div className="flex gap-1 px-3 pt-2">
              {pushedContent.contentTypes.map((ct) => {
                const CIcon = CONTENT_TYPE_ICONS[ct] || FileText;
                return (
                  <span key={ct} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                    <CIcon className="h-2.5 w-2.5" />
                    {ct}
                  </span>
                );
              })}
            </div>
            {/* Content preview */}
            <div className="px-3 py-2 max-h-[40vh] overflow-auto">
              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {pushedContent.contenu}
              </div>
              {pushedContent.fullLength > 500 && (
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  ... {pushedContent.fullLength - 500} caracteres de plus dans le chat
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay: Execute Action — DESACTIVE (Carl: pas de pop-ups) */}
      {false && executeAction && !focusData && (
        <div className="absolute bottom-16 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl shadow-xl px-4 py-3 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">CarlOS execute</p>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {executeAction.message || "Action en cours..."}
                </p>
              </div>
              <button
                onClick={dismissExecuteAction}
                className="text-white/50 hover:text-white cursor-pointer p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
              <CheckCircle2 className="h-3.5 w-3.5 text-white/40" />
            </div>
          </div>
        </div>
      )}

      {/* Overlay: Widget contextuel CarlOS — DESACTIVE (Carl: pas de pop-ups) */}
      {false && activeWidget && !focusData && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border border-blue-200 rounded-xl shadow-lg px-4 py-3 max-w-md">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 text-sm mt-0.5">
                {(activeWidget.data as Record<string, unknown>)?.action_type === "document" ? "📄" :
                 (activeWidget.data as Record<string, unknown>)?.action_type === "analyse" ? "🔍" : "💡"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">CarlOS</p>
                <p className="text-xs text-gray-600 mt-0.5">{activeWidget.message}</p>
              </div>
              <button
                onClick={dismissWidget}
                className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay: Annotation — DESACTIVE (Carl: pas de pop-ups) */}
      {false && activeAnnotation && !focusData && (
        <div className="absolute top-14 right-4 z-40 animate-in slide-in-from-right-4 duration-300">
          <div className={cn(
            "border rounded-lg shadow-md px-3 py-2 max-w-xs",
            (activeAnnotation.data as Record<string, unknown>)?.coaching_type === "celebration"
              ? "bg-green-50 border-green-300"
              : (activeAnnotation.data as Record<string, unknown>)?.coaching_type === "coaching"
              ? "bg-blue-50 border-blue-300"
              : "bg-amber-50 border-amber-300"
          )}>
            <div className="flex items-start gap-2">
              <span className="text-xs mt-0.5">
                {(activeAnnotation.data as Record<string, unknown>)?.coaching_type === "celebration" ? "🎉" :
                 (activeAnnotation.data as Record<string, unknown>)?.coaching_type === "coaching" ? "💙" : "✨"}
              </span>
              <p className={cn(
                "text-xs",
                (activeAnnotation.data as Record<string, unknown>)?.coaching_type === "celebration"
                  ? "text-green-800"
                  : (activeAnnotation.data as Record<string, unknown>)?.coaching_type === "coaching"
                  ? "text-blue-800"
                  : "text-amber-800"
              )}>
                {activeAnnotation.message}
              </p>
              <button
                onClick={dismissAnnotation}
                className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
