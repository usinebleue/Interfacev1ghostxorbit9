/**
 * SectionMonEntreprise.tsx — [1] Mon Entreprise
 * Click unique → Departement CarlOS (CEOB) avec 11 tabs
 * V2 — Restructure 12 departements identiques
 */

import { Building2 } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

export function SectionMonEntreprise({ collapsed }: Props) {
  const { activeView, activeBotCode, navigateToDepartment } = useFrameMaster();

  const isActive = activeView === "department" && activeBotCode === "CEOB";

  const handleClick = () => {
    navigateToDepartment("CEOB");
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <button
          onClick={handleClick}
          className={cn(
            "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
            isActive && "bg-accent"
          )}
          title="Mon Departement"
        >
          <Building2 className={cn("h-3.5 w-3.5", isActive ? "text-blue-600" : "text-muted-foreground")} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:text-foreground transition-colors",
        isActive ? "text-foreground bg-accent" : "text-muted-foreground"
      )}
    >
      <Building2 className="h-3.5 w-3.5" />
      Mon Departement
    </button>
  );
}
