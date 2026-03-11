/**
 * SectionMonReseau.tsx — [5] Mon Reseau
 * Fusion de SectionOrbit9 + SectionTrgIndustries
 * 7 items: Profil, Cellules, Jumelage, Pionniers, Gouvernance, Dashboard, Industrie
 * Sprint C — Restructuration Plateforme
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Network,
  User,
  Handshake,
  Sparkles,
  Crown,
  Rocket,
  BarChart3,
  Globe,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const ITEMS = [
  { id: "profil", label: "Mon Profil", icon: User, color: "text-blue-500" },
  { id: "cellules", label: "Mes Cellules", icon: Handshake, color: "text-emerald-500" },
  { id: "jumelage", label: "Jumelage", icon: Sparkles, color: "text-amber-500" },
  { id: "pionniers", label: "Pionniers", icon: Rocket, color: "text-indigo-500" },
  { id: "gouvernance", label: "Gouvernance", icon: Crown, color: "text-violet-500" },
  { id: "marketplace", label: "Dashboard", icon: BarChart3, color: "text-orange-500" },
  { id: "industrie", label: "Industrie", icon: Globe, color: "text-cyan-500" },
];

export function SectionMonReseau({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeOrbit9Section, navigateOrbit9 } = useFrameMaster();

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
              onClick={() => navigateOrbit9(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                activeOrbit9Section === item.id && "bg-accent"
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
                onClick={() => navigateOrbit9(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  activeOrbit9Section === item.id && "bg-accent font-medium"
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
