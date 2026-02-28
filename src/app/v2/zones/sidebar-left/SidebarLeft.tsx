/**
 * SidebarLeft.tsx — Sidebar gauche
 * Mon Entreprise (departements) + Mon Reseau Orbit 9 (scrollable)
 * Chaque bot vit dans son departement — CarlOS = Direction
 * Sprint B — Simplifie (vocal Carl: pas de sections separees)
 */

import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { SectionEntreprise } from "./SectionEntreprise";
import { SectionOrbit9 } from "./SectionOrbit9";

export function SidebarLeft() {
  const { leftSidebarCollapsed } = useFrameMaster();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sections scrollables : Entreprise (departements) + Orbit 9 */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          <SectionEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionOrbit9 collapsed={collapsed} />
        </div>
      </ScrollArea>
    </div>
  );
}
