/**
 * SectionEspaceBureau.tsx — "Mon Espace" dans sidebar gauche
 * 2 groupes: Pipeline (Chantiers→Projets→Missions→Discussions) + Ressources (Idees, Documents, Outils, Taches, Agenda, Templates)
 * Sprint B — Espace Unifie
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
  CalendarDays,
  Flame,
  Target,
  MessageSquare,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EspaceSection, DiscussionTab } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const PIPELINE_ITEMS: { id: DiscussionTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "discussions", label: "Discussions", icon: MessageSquare, color: "text-violet-500" },
  { id: "missions", label: "Missions", icon: Target, color: "text-green-500" },
  { id: "projets", label: "Projets", icon: FolderKanban, color: "text-indigo-500" },
  { id: "chantiers", label: "Chantiers", icon: Flame, color: "text-red-500" },
];

const RESSOURCE_ITEMS: { id: EspaceSection; label: string; icon: React.ElementType; color: string }[] = [
  { id: "idees", label: "Idees", icon: Sparkles, color: "text-amber-500" },
  { id: "documents", label: "Documents", icon: FileText, color: "text-green-500" },
  { id: "outils", label: "Outils", icon: Wrench, color: "text-orange-500" },
  { id: "taches", label: "Taches", icon: CheckSquare, color: "text-purple-500" },
  { id: "agenda", label: "Agenda", icon: CalendarDays, color: "text-rose-500" },
];

export function SectionEspaceBureau({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeEspaceSection, activeDiscussionTab, navigateEspace, navigateDiscussionTab, setActiveView } = useFrameMaster();

  const handlePipelineClick = (tab: DiscussionTab) => {
    navigateDiscussionTab(tab);
    setActiveView("mes-chantiers");
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Briefcase className="h-3.5 w-3.5 mx-auto" />
        </div>
        {PIPELINE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handlePipelineClick(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                activeView === "mes-chantiers" && activeDiscussionTab === item.id && "bg-accent"
              )}
              title={item.label}
            >
              <Icon className={cn("h-3.5 w-3.5", item.color)} />
            </button>
          );
        })}
        <div className="border-t border-gray-100 my-1" />
        {RESSOURCE_ITEMS.map((item) => {
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
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Mon Espace
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {/* Pipeline */}
          <div className="px-2 pt-1 pb-0.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Pipeline</span>
          </div>
          {PIPELINE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handlePipelineClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  activeView === "mes-chantiers" && activeDiscussionTab === item.id && "bg-accent font-medium"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Separateur */}
          <div className="border-t border-gray-100 my-1.5 mx-2" />

          {/* Ressources */}
          <div className="px-2 pt-0.5 pb-0.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ressources</span>
          </div>
          {RESSOURCE_ITEMS.map((item) => {
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
