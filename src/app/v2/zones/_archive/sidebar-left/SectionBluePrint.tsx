/**
 * SectionBluePrint.tsx — "Mon Blue Print" dans sidebar gauche
 * 3 items: Live, Hub, Pipeline
 * Pattern: SectionEspaceBureau
 * Sprint C — Mon Blue Print (schema directeur)
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Activity,
  FileText,
  GitBranch,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { BlueprintSection } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const BLUEPRINT_ITEMS: { id: BlueprintSection; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: "live", label: "Live", desc: "Bots au travail", icon: Activity, color: "text-blue-500" },
  { id: "hub", label: "Hub", desc: "Templates & Documents", icon: FileText, color: "text-green-500" },
  { id: "pipeline", label: "Pipeline", desc: "Projets & Jumelages", icon: GitBranch, color: "text-purple-500" },
];

export function SectionBluePrint({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeBlueprintSection, navigateBlueprint } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <LayoutGrid className="h-3 w-3 mx-auto text-blue-500" />
        </div>
        {BLUEPRINT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateBlueprint(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                activeView === "blueprint" && activeBlueprintSection === item.id && "bg-accent"
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
        Mon Blue Print
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {BLUEPRINT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigateBlueprint(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  activeView === "blueprint" && activeBlueprintSection === item.id && "bg-accent font-medium"
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
