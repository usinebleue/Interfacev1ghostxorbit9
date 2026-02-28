/**
 * SidebarLeft.tsx — Sidebar gauche
 * CarlOS Live (canvas) + Mon Entreprise + Mon Reseau Orbit 9 (scrollable)
 * Ma Productivite deplacee dans sidebar droite (vocal 18:08)
 * Sprint A — Frame Master V2
 */

import { Bot, LayoutDashboard, Activity } from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { SectionEntreprise } from "./SectionEntreprise";
import { SectionOrbit9 } from "./SectionOrbit9";
import { cn } from "../../../components/ui/utils";

export function SidebarLeft() {
  const { leftSidebarCollapsed, activeView, setActiveView } = useFrameMaster();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* CarlOS Quick Nav — toujours visible en haut */}
      <div className={cn("shrink-0 px-1 pt-2 pb-1 space-y-0.5", collapsed && "px-0.5")}>
        <button
          onClick={() => setActiveView("canvas")}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer",
            activeView === "canvas"
              ? "bg-blue-50 text-blue-700 font-medium"
              : "hover:bg-accent text-muted-foreground",
            collapsed && "justify-center px-1"
          )}
          title="CarlOS Live"
        >
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            activeView === "canvas"
              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gray-100"
          )}>
            <Bot className={cn("h-4 w-4", activeView === "canvas" ? "text-white" : "text-gray-500")} />
          </div>
          {!collapsed && <span>CarlOS Live</span>}
        </button>
        <button
          onClick={() => setActiveView("dashboard")}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
            activeView === "dashboard"
              ? "bg-accent font-medium"
              : "hover:bg-accent text-muted-foreground",
            collapsed && "justify-center px-1"
          )}
          title="Tableau de bord"
        >
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Tableau de bord</span>}
        </button>
        <button
          onClick={() => setActiveView("scenarios")}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
            activeView === "scenarios"
              ? "bg-accent font-medium"
              : "hover:bg-accent text-muted-foreground",
            collapsed && "justify-center px-1"
          )}
          title="Simulations"
        >
          <Activity className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Simulations</span>}
        </button>
      </div>

      <Separator className="my-1" />

      {/* Sections scrollables : Entreprise + Orbit 9 */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          <SectionEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionOrbit9 collapsed={collapsed} />
        </div>
      </ScrollArea>
    </div>
  );
}
