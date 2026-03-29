/**
 * SidebarLeft.tsx — Sidebar gauche Plan V6
 * 4 espaces: Mon Departement, Mes Salles, Mon Equipe, Mon Reseau
 * + Master GHML (reference, collapsed en bas)
 * Sprint F1 — Reorganisation Navigation
 */

import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useTenant } from "../../context/TenantContext";
import { SectionMonEntreprise } from "./SectionMonEntreprise";
// SectionMonBureau retirée — contenu absorbé dans les tabs département
import { SectionMesSalles } from "./SectionMesSalles";
import { SectionMonEquipe } from "./SectionMonEquipe";
import { SectionMonReseau } from "./SectionMonReseau";
import { SectionMasterGHML } from "./SectionMasterGHML";
import { SectionReglages } from "./SectionReglages";

export function SidebarLeft() {
  const { leftSidebarCollapsed } = useFrameMaster();
  const { isDieu } = useTenant();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 5 espaces + Master GHML scrollables */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-2">
          <SectionMonEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMesSalles collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMonEquipe collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMonReseau collapsed={collapsed} />
          {isDieu && (
            <>
              <Separator className="my-2" />
              <SectionMasterGHML collapsed={collapsed} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Reglages — fixe en bas */}
      <SectionReglages collapsed={collapsed} />
    </div>
  );
}
