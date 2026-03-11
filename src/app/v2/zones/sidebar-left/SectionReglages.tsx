/**
 * SectionReglages.tsx — [6] Reglages (fixe en bas du sidebar)
 * Sprint C — Restructuration Plateforme
 */

import { Settings, SlidersHorizontal } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

export function SectionReglages({ collapsed }: Props) {
  const { activeView, setActiveView } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="border-t px-1 py-2">
        <button
          onClick={() => setActiveView("agent-settings")}
          className={cn(
            "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
            activeView === "agent-settings" && "bg-accent"
          )}
          title="Reglages"
        >
          <Settings className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-t px-1 py-2">
      <button
        onClick={() => setActiveView("agent-settings")}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
          activeView === "agent-settings" && "bg-accent font-medium"
        )}
        title="Reglages"
      >
        <Settings className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="truncate text-gray-500">Reglages</span>
      </button>
    </div>
  );
}
