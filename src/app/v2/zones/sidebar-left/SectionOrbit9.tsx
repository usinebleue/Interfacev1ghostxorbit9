/**
 * SectionOrbit9.tsx — "Mon Reseau Orbit 9"
 * 3 groupes dans le sidebar, sous-sections dans la top bar du contenu
 * Sprint B — Navigation pattern identique aux departements
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Network,
  Rocket,
  BarChart3,
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

const ORBIT9_GROUPS = [
  { id: "reseau", label: "Reseau & Collab", icon: Network, color: "text-emerald-500", defaultSection: "collaboration" },
  { id: "croissance", label: "Croissance", icon: Rocket, color: "text-indigo-500", defaultSection: "pionniers" },
  { id: "intelligence", label: "Intelligence", icon: BarChart3, color: "text-violet-500", defaultSection: "benchmark" },
];

export function SectionOrbit9({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { navigateOrbit9 } = useFrameMaster();

  const handleGroupClick = (group: typeof ORBIT9_GROUPS[0]) => {
    setSelectedGroup(group.id);
    navigateOrbit9(group.defaultSection);
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Network className="h-3 w-3 mx-auto" />
        </div>
        {ORBIT9_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <button
              key={group.id}
              onClick={() => handleGroupClick(group)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                selectedGroup === group.id && "bg-accent"
              )}
              title={group.label}
            >
              <Icon className={cn("h-3.5 w-3.5", group.color)} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide">
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Mon Reseau Orbit 9
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ORBIT9_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <button
                key={group.id}
                onClick={() => handleGroupClick(group)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  selectedGroup === group.id && "bg-accent font-medium"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", group.color)} />
                <span className="truncate">{group.label}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
