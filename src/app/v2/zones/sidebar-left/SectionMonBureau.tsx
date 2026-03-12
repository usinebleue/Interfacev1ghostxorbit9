/**
 * SectionMonBureau.tsx — [2] Mon Bureau
 * 5 items: Idees, Documents, Outils, Taches, Agenda
 * Extrait de SectionEspaceBureau (partie Ressources)
 * Sprint C — Restructuration Plateforme
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Briefcase,
  Sparkles,
  FileText,
  Wrench,
  CheckSquare,
  CalendarDays,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EspaceSection, ActiveView } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

type BureauItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  espaceSection?: EspaceSection;
  view?: ActiveView;
  botCode?: string;
};

const ITEMS: BureauItem[] = [
  { id: "direction", label: "Direction", icon: Briefcase, color: "text-blue-600", view: "department", botCode: "CEOB" },
  { id: "idees", label: "Idees", icon: Sparkles, color: "text-amber-500", espaceSection: "idees" },
  { id: "documents", label: "Documents", icon: FileText, color: "text-green-500", espaceSection: "documents" },
  { id: "outils", label: "Outils", icon: Wrench, color: "text-orange-500", espaceSection: "outils" },
  { id: "taches", label: "Taches", icon: CheckSquare, color: "text-purple-500", espaceSection: "taches" },
  { id: "agenda", label: "Agenda", icon: CalendarDays, color: "text-rose-500", espaceSection: "agenda" },
];

export function SectionMonBureau({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeBotCode, activeEspaceSection, navigateEspace, navigateToDepartment } = useFrameMaster();

  const handleClick = (item: BureauItem) => {
    if (item.botCode) {
      navigateToDepartment(item.botCode, item.view!);
    } else if (item.espaceSection) {
      navigateEspace(item.espaceSection);
    }
  };

  const isActive = (item: BureauItem) => {
    if (item.botCode) return activeView === "department" && activeBotCode === item.botCode;
    return activeView === "espace-bureau" && activeEspaceSection === item.espaceSection;
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <FolderOpen className="h-3.5 w-3.5 mx-auto" />
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
        Mon Bureau
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
