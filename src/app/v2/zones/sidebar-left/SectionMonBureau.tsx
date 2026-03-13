/**
 * SectionMonBureau.tsx — [2] Mon Bureau
 * 6 items: Blueprint Perso, Taches, Documents, Agenda, Discussions, Notifications
 * Plan V6 — Sprint F1
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Target,
  FileText,
  CheckSquare,
  CalendarDays,
  MessageSquare,
  Bell,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { BureauSection } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

type BureauItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  section: BureauSection;
};

const ITEMS: BureauItem[] = [
  { id: "blueprint-perso", label: "Mon Blueprint", icon: Target, color: "text-blue-500", section: "blueprint-perso" },
  { id: "taches", label: "Mes Taches", icon: CheckSquare, color: "text-purple-500", section: "taches" },
  { id: "documents", label: "Mes Documents", icon: FileText, color: "text-green-500", section: "documents" },
  { id: "agenda", label: "Mon Agenda", icon: CalendarDays, color: "text-rose-500", section: "agenda" },
  { id: "discussions", label: "Mes Discussions", icon: MessageSquare, color: "text-amber-500", section: "discussions" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "text-orange-500", section: "notifications" },
];

export function SectionMonBureau({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeBureauSection, navigateBureau } = useFrameMaster();

  const handleClick = (item: BureauItem) => {
    navigateBureau(item.section);
  };

  const isActive = (item: BureauItem) => {
    return activeView === "espace-bureau" && activeBureauSection === item.section;
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
