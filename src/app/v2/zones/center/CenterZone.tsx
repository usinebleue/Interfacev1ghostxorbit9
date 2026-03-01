/**
 * CenterZone.tsx — Router entre Dashboard, Department, Discussion, LiveChat, Canvas
 * InputBar fixe en bas (meme niveau que "Ma Productivite" dans sidebar)
 * Sprint A — Frame Master V2
 */

import { useState, useEffect } from "react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import type { ActiveView } from "../../context/FrameMasterContext";
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

export function CenterZone() {
  const { activeView, activeBotCode, setActiveView } = useFrameMaster();
  const { lastAction, consumeNext, activeWidget, activeAnnotation, dismissWidget, dismissAnnotation } = useCanvasActions();
  const botBand = BOT_BAND_COLORS[activeBotCode];
  const [liveChatMode, setLiveChatMode] = useState("analyse");

  // --- Consommer les canvas actions navigate/execute ---
  useEffect(() => {
    if (!lastAction) return;
    if (lastAction.type === "navigate" && lastAction.view) {
      setActiveView(lastAction.view as ActiveView);
      consumeNext();
    }
  }, [lastAction, setActiveView, consumeNext]);

  const handleStartChat = (mode: string) => {
    setLiveChatMode(mode);
    setActiveView("live-chat");
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative">
      {/* Bande couleur identitaire du bot actif — en haut du canevas */}
      {botBand && <div className={cn("h-1 shrink-0", botBand)} />}

      {/* Vue principale */}
      <div className="flex-1 overflow-hidden">
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
      </div>

      {/* Overlay: Widget contextuel CarlOS (Coeur/coaching) */}
      {activeWidget && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border border-blue-200 rounded-xl shadow-lg px-4 py-3 max-w-md">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 text-sm mt-0.5">💡</span>
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
        <div className="absolute top-14 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-amber-50 border border-amber-300 rounded-lg shadow-md px-3 py-2 max-w-xs">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-xs mt-0.5">⚠️</span>
              <p className="text-xs text-amber-800">{activeAnnotation.message}</p>
              <button
                onClick={dismissAnnotation}
                className="text-amber-400 hover:text-amber-600 text-xs cursor-pointer"
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
