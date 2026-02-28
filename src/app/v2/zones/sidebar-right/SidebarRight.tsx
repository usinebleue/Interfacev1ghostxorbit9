/**
 * SidebarRight.tsx — Sidebar droite avec boxes empilees
 * Mode collapsed = icones seulement (meme pattern que sidebar gauche)
 * Bandes de couleur pour separer les sections
 * Layout : [ScrollArea: Agents + Context + Collaborateurs] + [Ma Productivite fixe en bas]
 * Sprint A — Frame Master V2
 */

import {
  ShieldAlert,
  LayoutGrid,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { ActiveAgentsPanel } from "./ActiveAgentsPanel";
import { ContextBoxes } from "./ContextBoxes";
import { DiscussionsPanel } from "./DiscussionsPanel";
import { SectionProductivite } from "../sidebar-left/SectionProductivite";

interface Props {
  collapsed?: boolean;
}

export function SidebarRight({ collapsed = false }: Props) {
  // Mode collapsed — icones seulement (meme pattern que sidebar gauche)
  if (collapsed) {
    return (
      <div className="h-full flex flex-col bg-white py-2">
        <div className="flex-1 space-y-1 px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors relative">
                <ShieldAlert className="h-4 w-4 text-purple-500" />
                <span className="absolute top-0.5 right-0 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  4
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Sentinel — Alertes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <LayoutGrid className="h-4 w-4 text-blue-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Contexte</TooltipContent>
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

        {/* Ma Productivite — toujours visible en bas meme en collapsed */}
        <Separator className="my-1" />
        <div className="px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <Briefcase className="h-4 w-4 text-orange-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Ma Productivite</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Mode ouvert — sections avec lignes de couleur comme separateurs
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sections scrollables en haut */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pt-4 pb-2">
          {/* Section Sentinel */}
          <div className="mx-3 mb-1">
            <ActiveAgentsPanel />
          </div>

          {/* Separateur violet */}
          <div className="h-[2px] bg-purple-500 my-2" />

          {/* Section Contexte */}
          <div className="mx-3 mb-1">
            <ContextBoxes />
          </div>

          {/* Separateur bleu */}
          <div className="h-[2px] bg-blue-500 my-2" />

          {/* Section Discussions (remplace Collaborateurs — Orbit9 plus tard) */}
          <div className="mx-3 mb-1">
            <DiscussionsPanel />
          </div>
        </div>
      </ScrollArea>

      {/* Ma Productivite — FIXE en bas, separateur orange */}
      <div className="h-[2px] bg-orange-500" />
      <div className="shrink-0 px-3 py-3 flex flex-col justify-center min-h-[136px]">
        <SectionProductivite collapsed={false} fixed={true} />
      </div>
    </div>
  );
}
