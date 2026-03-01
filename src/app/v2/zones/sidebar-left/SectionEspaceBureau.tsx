/**
 * SectionEspaceBureau.tsx — "Mon Espace Bureau" dans sidebar gauche
 * 5 items: Idees, Projets, Documents, Outils, Taches
 * Pattern: SectionOrbit9
 * Sprint B — Mon Espace Bureau
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Briefcase,
  Sparkles,
  FolderKanban,
  FileText,
  Wrench,
  CheckSquare,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EspaceSection } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const ESPACE_ITEMS: { id: EspaceSection; label: string; icon: React.ElementType; color: string }[] = [
  { id: "idees", label: "Idees", icon: Sparkles, color: "text-amber-500" },
  { id: "projets", label: "Projets", icon: FolderKanban, color: "text-blue-500" },
  { id: "documents", label: "Documents", icon: FileText, color: "text-green-500" },
  { id: "outils", label: "Outils", icon: Wrench, color: "text-orange-500" },
  { id: "taches", label: "Taches", icon: CheckSquare, color: "text-purple-500" },
];

export function SectionEspaceBureau({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeEspaceSection, navigateEspace } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Briefcase className="h-3 w-3 mx-auto" />
        </div>
        {ESPACE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateEspace(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                activeView === "espace-bureau" && activeEspaceSection === item.id && "bg-accent"
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
        Mon Bureau
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ESPACE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigateEspace(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  activeView === "espace-bureau" && activeEspaceSection === item.id && "bg-accent font-medium"
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
