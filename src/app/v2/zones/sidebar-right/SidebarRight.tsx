/**
 * SidebarRight.tsx — Sidebar droite V2 — 3 sections claires
 * 1. CarlOS Pulse — alertes intelligentes (vide par defaut)
 * 2. Mes Discussions — threads actifs/parkes
 * 3. Mon Espace — idees, projets, documents, taches, outils factory
 * Tout scroll ensemble, plus de section fixe en bas
 * Sprint B — Reorganisation sidebar droite
 */

import {
  Activity,
  MessageSquare,
  Briefcase,
  Radio,
} from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { CarlOsPulse } from "./CarlOsPulse";
import { DiscussionsPanel } from "./DiscussionsPanel";
import { MonEspace } from "./MonEspace";
import { LiveControlsPanel } from "./LiveControlsPanel";
import { useChatContext } from "../../context/ChatContext";

interface Props {
  collapsed?: boolean;
}

export function SidebarRight({ collapsed = false }: Props) {
  const { autoTTSEnabled, toggleAutoTTS } = useChatContext();

  // Mode collapsed — icones seulement
  if (collapsed) {
    return (
      <div className="h-full flex flex-col bg-white py-2">
        <div className="flex-1 space-y-1 px-1">
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

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <Briefcase className="h-4 w-4 text-orange-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Mon Espace</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors relative">
                <Radio className="h-4 w-4 text-green-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">CarlOS Live</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Mode ouvert — 3 sections, tout scroll ensemble
  return (
    <div className="h-full flex flex-col bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div className="pt-4 pb-4">
          {/* Section 1 — CarlOS Pulse */}
          <div className="mx-3 mb-1">
            <CarlOsPulse />
          </div>

          {/* Separateur vert */}
          <div className="h-[2px] bg-green-400 my-3" />

          {/* Section 2 — Mes Discussions */}
          <div className="mx-3 mb-1">
            <DiscussionsPanel />
          </div>

          {/* Separateur bleu */}
          <div className="h-[2px] bg-blue-400 my-3" />

          {/* Section 3 — Mon Espace */}
          <div className="mx-3 mb-1">
            <MonEspace />
          </div>
        </div>
      </ScrollArea>

      {/* CarlOS Live — panneau cockpit fixe en bas */}
      <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
      <div className="shrink-0">
        <LiveControlsPanel autoTTSEnabled={autoTTSEnabled} onToggleAutoTTS={toggleAutoTTS} />
      </div>
    </div>
  );
}
