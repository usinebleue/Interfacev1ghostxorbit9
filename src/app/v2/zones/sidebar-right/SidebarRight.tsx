/**
 * SidebarRight.tsx — Sidebar droite V3
 * 1. CarlOS Live — video bot + controles communication (unifie)
 * 2. CarlOS Pulse — alertes intelligentes
 * 3. Mes Discussions — threads actifs/parkes
 * Mon Espace = deplace dans sidebar gauche (Mon Bureau)
 * Sprint B — Reorganisation sidebar droite
 */

import {
  Activity,
  MessageSquare,
  Video,
} from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { CarlOsPulse } from "./CarlOsPulse";
import { VideoCallWidget } from "./VideoCallWidget";
import { DiscussionsPanel } from "./DiscussionsPanel";

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
            <TooltipContent side="left">Mes Discussions</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Mode ouvert — 3 sections, tout scroll ensemble
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="pt-4 pb-4">
          {/* Section 1 — CarlOS Live (video + controles) */}
          <div className="mx-3 mb-1">
            <VideoCallWidget />
          </div>

          {/* Separateur */}
          <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 my-3" />

          {/* Section 2 — CarlOS Pulse */}
          <div className="mx-3 mb-1">
            <CarlOsPulse />
          </div>

          {/* Separateur vert */}
          <div className="h-[2px] bg-green-400 my-3" />

          {/* Section 3 — Mes Discussions */}
          <div className="mx-3 mb-1">
            <DiscussionsPanel />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
