/**
 * SidebarLeft.tsx — Sidebar gauche
 * Mon Entreprise (departements) + Mon Reseau Orbit 9 + TRG Industries
 * Chaque bot vit dans son departement — CarlOS = Direction
 * Sprint B — Reorganisation vocal Carl 13:14:24
 */

import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { SectionEntreprise } from "./SectionEntreprise";
import { SectionOrbit9 } from "./SectionOrbit9";
import { SectionTrgIndustries } from "./SectionTrgIndustries";

export function SidebarLeft() {
  const { leftSidebarCollapsed } = useFrameMaster();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sections scrollables : Entreprise + Orbit 9 + TRG Industries */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          <SectionEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionOrbit9 collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionTrgIndustries collapsed={collapsed} />
        </div>
      </ScrollArea>
    </div>
  );
}
