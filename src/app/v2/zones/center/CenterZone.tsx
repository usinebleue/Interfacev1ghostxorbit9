/**
 * CenterZone.tsx — Router entre Dashboard, Department, Discussion, LiveChat, Canvas
 * InputBar fixe en bas (meme niveau que "Ma Productivite" dans sidebar)
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
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
  const { messages } = useChatContext();
  const botBand = BOT_BAND_COLORS[activeBotCode];
  const [liveChatMode, setLiveChatMode] = useState("analyse");
  const hasActiveDiscussion = messages.length > 0 && activeView !== "live-chat";

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
        {activeView === "canvas" && (
          <SmartCanvas
            onStartChat={handleStartChat}
            onOpenScenarios={() => setActiveView("scenarios")}
          />
        )}
      </div>

      {/* Badge flottant — discussion en cours (visible quand on navigue ailleurs) */}
      {hasActiveDiscussion && (
        <button
          onClick={() => setActiveView("live-chat")}
          className="absolute top-14 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all animate-in fade-in slide-in-from-right-4 duration-300 cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Discussion en cours ({messages.length})
        </button>
      )}

      {/* InputBar fixe en bas — toujours visible */}
      <InputBar />
    </div>
  );
}
