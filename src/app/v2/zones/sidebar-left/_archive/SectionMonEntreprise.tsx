/**
 * SectionMonEntreprise.tsx — [1] Mon Entreprise
 * 5 items: Direction (CarlOS), Tour de Controle, Cockpit, Blueprint, Sante Globale
 * Sprint C — Restructuration Plateforme
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Briefcase,
  LayoutDashboard,
  Gauge,
  Layers,
  HeartPulse,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { ActiveView } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const ITEMS: { id: string; label: string; icon: React.ElementType; color: string; view: ActiveView; botCode?: string }[] = [
  { id: "tdc", label: "Tour de Controle", icon: LayoutDashboard, color: "text-slate-600", view: "dashboard" },
  { id: "cockpit", label: "Cockpit", icon: Gauge, color: "text-amber-600", view: "cockpit" },
  { id: "blueprint", label: "Blueprint", icon: Layers, color: "text-cyan-600", view: "blueprint" },
  { id: "sante", label: "Sante Globale", icon: HeartPulse, color: "text-rose-500", view: "health" },
];

export function SectionMonEntreprise({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();

  const handleClick = (item: typeof ITEMS[number]) => {
    if (item.botCode) {
      navigateToDepartment(item.botCode, item.view);
    } else {
      setActiveView(item.view);
    }
  };

  const isActive = (item: typeof ITEMS[number]) => {
    if (item.botCode) return activeView === "department" && activeBotCode === item.botCode;
    if (item.view === "health") return activeView === "health" || activeView === "diagnostic-hub" || activeView === "diagnostic-ia";
    return activeView === item.view;
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Building2 className="h-3.5 w-3.5 mx-auto" />
        </div>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                isActive(item) && "bg-accent"
              )}
              title={item.label}
            >
              <Icon className={cn("h-3.5 w-3.5", item.color)} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide">
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Mon Entreprise
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  isActive(item) && "bg-accent font-medium"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
