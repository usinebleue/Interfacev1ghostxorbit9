/**
 * SectionMesSalles.tsx — [3] Mes Salles
 * 1 seul item → Hub de salles au centre (9 categories)
 * Plan V6 — Sprint F1
 */

import {
  DoorOpen,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

export function SectionMesSalles({ collapsed }: Props) {
  const { activeView, setActiveView } = useFrameMaster();

  const isActive = activeView === "salles-hub" || activeView === "meeting-room" || activeView === "conference-ai" || activeView === "board-room" || activeView === "war-room" || activeView === "think-room";

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <button
          onClick={() => setActiveView("salles-hub")}
          className={cn(
            "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
            isActive && "bg-accent"
          )}
          title="Mes Salles"
        >
          <DoorOpen className="h-3.5 w-3.5 text-amber-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-1">
      <button
        onClick={() => setActiveView("salles-hub")}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
          isActive && "bg-accent font-medium"
        )}
      >
        <DoorOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span className="truncate text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mes Salles</span>
      </button>
    </div>
  );
}
