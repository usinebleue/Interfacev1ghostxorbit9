/**
 * CenterZone.tsx — Router entre Dashboard, Department, Discussion, LiveChat, Canvas
 * InputBar fixe en bas (meme niveau que "Ma Productivite" dans sidebar)
 * V2: push_content panel, CREDO phase indicator, split-screen mode
 * Sprint B — CarlOS Noyau Omnipresent (D-081)
 */

import { useState, useEffect } from "react";
import {
  X,
  SplitSquareHorizontal,
  FileText,
  BarChart3,
  ListOrdered,
  Table2,
  Bot,
  Pin,
  Loader2,
  CheckCircle2,
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
import { InputBar } from "./InputBar";
import { Orbit9DetailView } from "./orbit9/Orbit9DetailView";
import { AgentSettingsView } from "./AgentSettingsView";
import { EspaceBureauView } from "./EspaceBureauView";

/** Couleur identitaire par bot — bande fine en haut du canevas */
const BOT_BAND_COLORS: Record<string, string> = {
  BCO: "bg-blue-500",
  BCT: "bg-violet-500",
  BCF: "bg-emerald-500",
  BCM: "bg-pink-500",
  BCS: "bg-red-500",
  BOO: "bg-orange-500",
  BFA: "bg-slate-400",
  BHR: "bg-teal-500",
  BIO: "bg-cyan-500",
  BCC: "bg-rose-500",
  BPO: "bg-fuchsia-500",
  BRO: "bg-amber-500",
  BLE: "bg-indigo-500",
  BSE: "bg-zinc-400",
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
};

export function CenterZone() {
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();
  const {
    lastAction, consumeNext,
    activeWidget, activeAnnotation,
    pushedContent, credoPhases, splitScreen,
    executeAction,
    dismissWidget, dismissAnnotation,
    dismissPushedContent, toggleSplitScreen,
    dismissExecuteAction,
  } = useCanvasActions();
  const botBand = BOT_BAND_COLORS[activeBotCode];
  const [liveChatMode, setLiveChatMode] = useState("analyse");
  const [pinnedContent, setPinnedContent] = useState(false);

  // --- Consommer les canvas actions navigate/execute ---
  useEffect(() => {
    if (!lastAction) return;
    if (lastAction.type === "navigate" && lastAction.view) {
      const params = lastAction.params as Record<string, unknown> | undefined;
      const botCode = params?.bot as string | undefined;
      if (botCode && (lastAction.view === "department" || lastAction.view === "detail")) {
        navigateToDepartment(botCode, lastAction.view as ActiveView);
      } else {
        setActiveView(lastAction.view as ActiveView);
      }
      consumeNext();
    }
  }, [lastAction, setActiveView, navigateToDepartment, consumeNext]);

  const handleStartChat = (mode: string) => {
    setLiveChatMode(mode);
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
      {activeView === "live-chat" && (
        <LiveChat
          initialMode={liveChatMode}
          onBack={() => setActiveView("department")}
        />
      )}
      {activeView === "orbit9-detail" && <Orbit9DetailView />}
      {activeView === "agent-settings" && <AgentSettingsView />}
      {activeView === "espace-bureau" && <EspaceBureauView />}
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
      {/* Bande couleur identitaire du bot actif — en haut du canevas */}
      {botBand && <div className={cn("h-1 shrink-0", botBand)} />}

      {/* CREDO Phase Indicator — barre fine sous la bande bot */}
      {showCredoIndicator && (
        <div className="bg-white border-b px-3 py-1 shrink-0 flex items-center gap-3">
          <Bot className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium">CREDO</span>
          {(["bouche", "cerveau", "coeur"] as const).map((layer) => {
            const phase = credoPhases[layer];
            const label = CREDO_LABELS[layer]?.[phase] || phase;
            return (
              <div key={layer} className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 uppercase">{layer.slice(0, 1)}</span>
                <div className={cn("text-[9px] text-white px-1.5 py-0.5 rounded font-medium", CREDO_COLORS[phase] || "bg-gray-400")}>
                  {label}
                </div>
              </div>
            );
          })}
          <button
            onClick={toggleSplitScreen}
            className={cn(
              "ml-auto p-1 rounded transition-colors cursor-pointer",
              splitScreen ? "bg-blue-100 text-blue-600" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
            )}
            title="Split-screen"
          >
            <SplitSquareHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Vue principale — split-screen ou plein ecran */}
      <div className="flex-1 overflow-hidden flex">
        {splitScreen ? (
          <>
            {/* Gauche: Vue courante */}
            <div className="flex-1 overflow-hidden border-r border-gray-200">
              {renderMainView()}
            </div>
            {/* Droite: LiveChat */}
            <div className="w-[400px] overflow-hidden shrink-0">
              <LiveChat
                initialMode={liveChatMode}
                onBack={() => toggleSplitScreen()}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-hidden">
            {renderMainView()}
          </div>
        )}
      </div>

      {/* Overlay: Push Content Panel (slide-in depuis la droite) */}
      {pushedContent && (
        <div className={cn(
          "absolute top-12 right-3 z-50 w-80 max-h-[60vh] animate-in slide-in-from-right-4 duration-300",
          pinnedContent ? "opacity-100" : "opacity-95 hover:opacity-100"
        )}>
          <div className="bg-white border border-blue-200 rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-3 py-2 flex items-center gap-2">
              <img
                src={BOT_AVATAR[pushedContent.bot] || BOT_AVATAR["BCO"]}
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

      {/* Overlay: Execute Action (confirmation/progress) */}
      {executeAction && (
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

      {/* Overlay: Widget contextuel CarlOS (Cerveau/action) */}
      {activeWidget && (
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

      {/* Overlay: Annotation (Coeur/highlight) */}
      {activeAnnotation && (
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

      {/* InputBar fixe en bas — toujours visible */}
      <InputBar />
    </div>
  );
}
