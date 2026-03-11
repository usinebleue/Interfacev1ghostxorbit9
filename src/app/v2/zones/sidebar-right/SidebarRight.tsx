/**
 * SidebarRight.tsx — Sidebar droite V7
 * Layout: Pulse → Video → Tabs (Chat | Memoire) → contenu
 * CarlOS = cerveau unique — chat + memoire cross-canal dans le meme sidebar
 */

import { useState } from "react";
import {
  Activity,
  MessageSquare,
  Brain,
  Video,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { cn } from "../../../components/ui/utils";
import { CarlOsPulse } from "./CarlOsPulse";
import { VideoCallWidget } from "./VideoCallWidget";
import { ChatBox } from "./ChatBox";
import { MemoryPanel } from "./MemoryPanel";

interface Props {
  collapsed?: boolean;
}

type SidebarTab = "chat" | "memory";

export function SidebarRight({ collapsed = false }: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");

  // Mode collapsed — icones seulement
  if (collapsed) {
    return (
      <div className="h-full flex flex-col bg-white py-2 overflow-hidden">
        <div className="flex-1 space-y-1 px-1 overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <Video className="h-4 w-4 text-purple-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">CarlOS Live</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <Activity className="h-4 w-4 text-green-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">CarlOS Pulse</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Chat CarlOS</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <Brain className="h-4 w-4 text-purple-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Memoire</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Mode ouvert — Pulse → Video → Tabs → Content
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Pulse — bande mince */}
      <div className="px-3 py-1 shrink-0">
        <CarlOsPulse compact />
      </div>

      {/* Video/Voice */}
      <div className="mx-3 shrink-0">
        <VideoCallWidget />
      </div>

      {/* Tab switcher — Chat | Memoire */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-t shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-medium transition-colors",
            activeTab === "chat" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab("memory")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-medium transition-colors",
            activeTab === "memory" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Brain className="h-3.5 w-3.5" />
          Memoire
        </button>
      </div>

      {/* Content — Chat ou Memoire */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? <ChatBox /> : <MemoryPanel />}
      </div>
    </div>
  );
}
