/**
 * SectionTrgIndustries.tsx — "TRG Industries"
 * Nouvelle section sidebar — Nouvelles, Evenements, Benchmark, Dashboard
 * Sprint B — Vocal Carl 13:14:24
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Factory,
  Newspaper,
  Calendar,
  Gauge,
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

const TRG_ITEMS = [
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper, color: "text-blue-500" },
  { id: "evenements", label: "Evenements", icon: Calendar, color: "text-rose-500" },
  { id: "benchmark", label: "Benchmark VITAA", icon: Gauge, color: "text-amber-500" },
  { id: "trg-industrie", label: "Dashboard Industrie", icon: Globe, color: "text-indigo-500" },
];

export function SectionTrgIndustries({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeOrbit9Section, navigateOrbit9 } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Factory className="h-3 w-3 mx-auto" />
        </div>
        {TRG_ITEMS.map((item) => {
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
        TRG Industries
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {TRG_ITEMS.map((item) => {
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
