/**
 * SidebarRight.tsx — Sidebar droite V5
 * Sprint Final V1 — Chatbox input + Communication dans le sidebar droit
 * Layout: Pulse(thin) → Video → InputBar(chatbox) → Missions/Chantiers/Discussions
 * NOTE: PAS de bulles/messages ici — juste la zone de texte (vocal Carl 21:18)
 */

import {
  Activity,
  MessageSquare,
  Video,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { CarlOsPulse } from "./CarlOsPulse";
import { VideoCallWidget } from "./VideoCallWidget";
import { DiscussionsPanel } from "./DiscussionsPanel";
import { InputBar } from "../center/InputBar";

interface Props {
  collapsed?: boolean;
}

export function SidebarRight({ collapsed = false }: Props) {
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
            <TooltipContent side="left">Mes Missions</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Mode ouvert — Pulse → Video → InputBar(chatbox) → Missions/Chantiers/Discussions
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

      {/* Separator */}
      <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mx-3 my-1 shrink-0" />

      {/* Chatbox — juste la zone de texte, PAS de bulles */}
      <div className="shrink-0 mx-3 my-1">
        <InputBar compact />
      </div>

      {/* Separator */}
      <div className="h-[1px] bg-gray-200 mx-3 shrink-0" />

      {/* Missions/Chantiers/Discussions — prend le reste de l'espace */}
      <div className="flex-1 min-h-0 overflow-auto mx-3 py-2">
        <DiscussionsPanel />
      </div>
    </div>
  );
}
