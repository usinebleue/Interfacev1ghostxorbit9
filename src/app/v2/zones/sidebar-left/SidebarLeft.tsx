/**
 * SidebarLeft.tsx — Sidebar gauche
 * 5 sections: Mon Bureau, Mes Rooms, Mon Equipe, Mon Reseau, Mon Industrie
 * + Mes Reglages (en bas, fixe)
 * Sprint B — D-109 restructuration
 */

import { Settings } from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { SectionEspaceBureau } from "./SectionEspaceBureau";
import { SectionRooms } from "./SectionRooms";
import { SectionEntreprise } from "./SectionEntreprise";
import { SectionOrbit9 } from "./SectionOrbit9";
import { SectionTrgIndustries } from "./SectionTrgIndustries";
import { SectionMasterGHML } from "./SectionMasterGHML";
import { cn } from "../../../components/ui/utils";

export function SidebarLeft() {
  const { leftSidebarCollapsed, activeView, setActiveView } = useFrameMaster();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 5 sections scrollables */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-2">
          <SectionEspaceBureau collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionRooms collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionOrbit9 collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionTrgIndustries collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMasterGHML collapsed={collapsed} />
        </div>
      </ScrollArea>

      {/* Mes Reglages — fixe en bas */}
      <div className="border-t px-1 py-2">
        <button
          onClick={() => setActiveView("agent-settings")}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
            activeView === "agent-settings" && "bg-accent font-medium"
          )}
          title="Mes Réglages"
        >
          {collapsed ? (
            <Settings className="h-3.5 w-3.5 text-gray-400 mx-auto" />
          ) : (
            <>
              <Settings className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate text-gray-500">Mes Réglages</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
