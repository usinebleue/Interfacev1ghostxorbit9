/**
 * SectionMonReseau.tsx — [5] Mon Reseau
 * Navigue vers MonReseauView avec le bon tab actif
 * Sprint C — Restructuration Plateforme
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Network,
  Handshake,
  Shield,
  Flame,
  Rocket,
  Award,
  BarChart3,
  Newspaper,
  Calendar,
  Globe,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { ReseauSection } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const ITEMS: { id: ReseauSection; label: string; icon: React.ElementType; color: string }[] = [
  { id: "profil", label: "Mon Profil", icon: Shield, color: "text-blue-500" },
  { id: "cellules", label: "Mes Cellules", icon: Handshake, color: "text-emerald-500" },
  { id: "jumelage", label: "Jumelage", icon: Network, color: "text-amber-500" },
  { id: "chantiers", label: "Chantiers Reseau", icon: Flame, color: "text-orange-500" },
  { id: "pionniers", label: "Pionniers", icon: Rocket, color: "text-indigo-500" },
  { id: "gouvernance", label: "Gouvernance", icon: Award, color: "text-violet-500" },
  { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-cyan-500" },
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper, color: "text-blue-500" },
  { id: "evenements", label: "Evenements", icon: Calendar, color: "text-rose-500" },
  { id: "industrie", label: "Industrie", icon: Globe, color: "text-indigo-500" },
];

export function SectionMonReseau({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeReseauSection, navigateReseau } = useFrameMaster();

  const isActive = (itemId: ReseauSection) =>
    activeView === "mon-reseau" && activeReseauSection === itemId;

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Network className="h-3.5 w-3.5 mx-auto" />
        </div>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateReseau(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                isActive(item.id) && "bg-accent"
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
        Mon Reseau
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigateReseau(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  isActive(item.id) && "bg-accent font-medium"
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
