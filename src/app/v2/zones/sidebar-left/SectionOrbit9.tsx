/**
 * SectionOrbit9.tsx — "Mon Reseau Orbit 9"
 * 4 items directs dans le sidebar (pas de groupes)
 * Sprint B — Reorganisation vocal Carl 13:14:24
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Network,
  Handshake,
  Crown,
  Store,
  Rocket,
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

const ORBIT9_ITEMS = [
  { id: "marketplace", label: "Marketplace", icon: Store, color: "text-orange-500" },
  { id: "cellules", label: "Cellules Orbit9", icon: Handshake, color: "text-emerald-500" },
  { id: "gouvernance", label: "Gouvernance", icon: Crown, color: "text-violet-500" },
  { id: "pionniers", label: "Pionniers", icon: Rocket, color: "text-indigo-500" },
];

export function SectionOrbit9({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeOrbit9Section, navigateOrbit9 } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Network className="h-3 w-3 mx-auto" />
        </div>
        {ORBIT9_ITEMS.map((item) => {
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
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Mon Reseau Orbit 9
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ORBIT9_ITEMS.map((item) => {
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
