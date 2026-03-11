/**
 * SectionRooms.tsx — "Mes Rooms" dans sidebar gauche (D-109)
 * 3 items: Board Room, War Room, Think Room
 * Position: entre Mon Bureau et Mon Entreprise
 * Pattern: SectionEspaceBureau (collapsible)
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Crown,
  AlertTriangle,
  Lightbulb,
  DoorOpen,
  Video,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { ActiveView } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const ROOM_ITEMS: { id: ActiveView; label: string; icon: React.ElementType; color: string }[] = [
  { id: "meeting-room", label: "Réunion CarlOS", icon: Video, color: "text-blue-600" },
  { id: "board-room", label: "Board Room", icon: Crown, color: "text-amber-600" },
  { id: "war-room", label: "War Room", icon: AlertTriangle, color: "text-red-500" },
  { id: "think-room", label: "Think Room", icon: Lightbulb, color: "text-amber-500" },
];

export function SectionRooms({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, setActiveView } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <DoorOpen className="h-3.5 w-3.5 mx-auto text-amber-500" />
        </div>
        {ROOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                activeView === item.id && "bg-accent"
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
        Mes Rooms
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ROOM_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  activeView === item.id && "bg-accent font-medium"
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
