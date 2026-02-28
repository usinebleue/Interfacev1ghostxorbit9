/**
 * HeaderBar.tsx — Barre superieure fixe (h-14)
 * Fond Midnight Blue #073E5A uniforme sur toute la bande
 * Sprint A — Frame Master V2
 */

import { Gauge, Settings, LayoutDashboard, SlidersHorizontal, User, HeartPulse, Play, MessageSquare } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { BotPresenceIndicator } from "./BotPresenceIndicator";

const UB_BLUE = "#073E5A";

/** Header colonne GAUCHE — Logo Usine Bleue */
export function HeaderLeft({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="h-14 border-b border-white/10 flex items-center justify-center px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {collapsed ? (
        <img src="/logo-usine-bleue-icon.png" alt="Usine Bleue" className="h-7 object-contain" />
      ) : (
        <img src="/logo-usine-bleue.png" alt="Usine Bleue" className="h-8 object-contain" />
      )}
    </div>
  );
}

/** Header colonne CENTRE — Bot ID + Tour de Controle / Cockpit / Reglage Bot */
export function HeaderCenter() {
  const { activeBot, activeBotCode, activeView, setActiveView } = useFrameMaster();
  const { messages } = useChatContext();
  const hasActiveDiscussion = messages.length > 0 && activeView !== "live-chat";

  return (
    <div className="h-14 border-b border-white/10 flex items-center shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {/* Contenu header */}
      <div className="flex-1 flex items-center justify-between px-4">
        {/* Bot actif + Presence — gauche */}
        <BotPresenceIndicator bot={activeBot} dark />

        {/* Tour de Controle + Cockpit + Reglage Bot — droite */}
        <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView(activeBotCode === "BCO" ? "dashboard" : "department")}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Tour de Controle</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tour de Controle</TooltipContent>
        </Tooltip>

        {/* Discussion en cours — visible seulement quand on a quitte le LiveChat */}
        {hasActiveDiscussion && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-blue-300 hover:text-blue-200 hover:bg-white/10 relative"
                onClick={() => setActiveView("live-chat")}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Discussion</span>
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {messages.length}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Retourner a la discussion en cours</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView("cockpit")}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Cockpit</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cockpit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView("health")}
            >
              <HeartPulse className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Sante Globale</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sante Globale de l'entreprise</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Reglage Agent AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reglage de l'Agent AI</TooltipContent>
        </Tooltip>

        {/* Scenarios — galerie des 9 simulations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-green-400 hover:text-green-300 hover:bg-white/10"
              onClick={() => setActiveView("scenarios")}
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Scenarios</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>9 simulations — Modes de reflexion GhostX</TooltipContent>
        </Tooltip>
        </div>
      </div>
    </div>
  );
}

/** Header colonne DROITE — Gear + Profil */
export function HeaderRight({ collapsed = false }: { collapsed?: boolean }) {
  const { currentUser, setAuthenticated } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="h-14 border-b border-white/10 flex items-center justify-center px-1 shrink-0" style={{ backgroundColor: UB_BLUE }}>
        <div className="relative">
          <img src="/agents/carl-fugere.jpg" alt={currentUser} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-white/10 flex items-center justify-end px-3 gap-1 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reglages</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 gap-2 px-2 text-white/80 hover:text-white hover:bg-white/10">
            <div className="relative">
              <img src="/agents/carl-fugere.jpg" alt={currentUser} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
            </div>
            <span className="text-sm hidden xl:inline">{currentUser}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Mon profil</DropdownMenuItem>
          <DropdownMenuItem>Mon entreprise</DropdownMenuItem>
          <DropdownMenuItem>Abonnement</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAuthenticated(false)}>
            Se deconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Legacy — plus utilise directement, garde pour mobile */
export function HeaderBar() {
  return (
    <header className="h-14 border-b flex items-center px-4 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      <img src="/logo-usine-bleue.png" alt="Usine Bleue" className="h-8 object-contain" />
    </header>
  );
}
