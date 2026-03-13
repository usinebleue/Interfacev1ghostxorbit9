/**
 * SectionMonEntreprise.tsx — [1] Mon Entreprise
 * 4 items: Blueprint, Tableau de Bord, Ressources, Sante
 * Plan V6 — Sprint F1
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Layers,
  LayoutDashboard,
  FolderOpen,
  HeartPulse,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EntrepriseSection } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

type EntrepriseItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  section: EntrepriseSection;
};

const ITEMS: EntrepriseItem[] = [
  { id: "blueprint", label: "Blueprint", icon: Layers, color: "text-blue-600", section: "blueprint" },
  { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard, color: "text-amber-600", section: "dashboard" },
  { id: "ressources", label: "Ressources", icon: FolderOpen, color: "text-green-600", section: "ressources" },
  { id: "sante", label: "Sante", icon: HeartPulse, color: "text-rose-500", section: "sante" },
];

export function SectionMonEntreprise({ collapsed }: Props) {
  const [open, setOpen] = useState(true);
  const { activeView, activeEntrepriseSection, navigateEntreprise } = useFrameMaster();

  const handleClick = (item: EntrepriseItem) => {
    navigateEntreprise(item.section);
  };

  const isActive = (item: EntrepriseItem) => {
    if (item.section === "blueprint") {
      return (activeView === "mon-entreprise" && activeEntrepriseSection === "blueprint") || activeView === "blueprint";
    }
    if (item.section === "dashboard") {
      return (activeView === "mon-entreprise" && activeEntrepriseSection === "dashboard") || activeView === "cockpit";
    }
    if (item.section === "sante") {
      return (activeView === "mon-entreprise" && activeEntrepriseSection === "sante") || activeView === "health" || activeView === "diagnostic-ia";
    }
    return activeView === "mon-entreprise" && activeEntrepriseSection === item.section;
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
