/**
 * MobileTabBarV3.tsx — Bottom tab bar mobile V3
 * 3 onglets : Controle (gauche), Discussion (centre), Workspace (droite)
 * + bouton toggle sidebar retractee a gauche
 * Pattern copie de v2/mobile/MobileTabBar.tsx
 */

import { MessageSquare, Wrench, TowerControl, PanelLeft } from "lucide-react";
import { cn } from "../components/ui/utils";

export type MobileTab = "controle" | "discussion" | "workspace";

const TABS: { id: MobileTab; label: string; icon: React.ElementType }[] = [
  { id: "controle",   label: "Controle",   icon: TowerControl },
  { id: "discussion",  label: "Discussion",  icon: MessageSquare },
  { id: "workspace",   label: "Workspace",   icon: Wrench },
];

interface MobileTabBarV3Props {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

export function MobileTabBarV3({ activeTab, onTabChange, sidebarVisible, onToggleSidebar }: MobileTabBarV3Props) {
  return (
    <nav className="h-14 border-t bg-background flex items-center shrink-0 z-10 pb-[env(safe-area-inset-bottom)]">

      {/* Toggle sidebar retractee — bouton permanent a gauche */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className={cn(
            "h-14 w-14 flex flex-col items-center justify-center shrink-0 transition-colors",
            sidebarVisible ? "text-blue-600" : "text-muted-foreground"
          )}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="text-[10px] leading-4">Menu</span>
        </button>
      )}

      {/* Separateur */}
      {onToggleSidebar && (
        <div className="w-px h-8 bg-gray-200 shrink-0" />
      )}

      {/* 3 onglets */}
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors",
            activeTab === tab.id
              ? "text-blue-600"
              : "text-muted-foreground"
          )}
        >
          <tab.icon className="h-5 w-5" />
          <span className="text-[10px]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
