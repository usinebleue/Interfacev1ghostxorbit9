/**
 * SectionOrbit9.tsx — "Mon Reseau Orbit 9" — 8 items
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Handshake,
  Crown,
  Rocket,
  Store,
  Calendar,
  Newspaper,
  Gauge,
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
  { id: "matching", label: "Matching Agent", icon: Search },
  { id: "collaboration", label: "Collaboration", icon: Handshake },
  { id: "gouvernance", label: "Gouvernance", icon: Crown },
  { id: "pionniers", label: "Pionniers Bleus", icon: Rocket },
  { id: "marketplace", label: "Bot Marketplace", icon: Store },
  { id: "evenements", label: "Evenements", icon: Calendar },
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper },
  { id: "benchmark", label: "Benchmark", icon: Gauge },
];

export function SectionOrbit9({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { setActiveView } = useFrameMaster();

  const handleItemClick = (id: string) => {
    setSelected(id);
    setActiveView("scenarios");
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Rocket className="h-3 w-3 mx-auto" />
        </div>
        {ORBIT9_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                selected === item.id && "bg-accent"
              )}
              title={item.label}
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
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
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  selected === item.id && "bg-accent font-medium"
                )}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
