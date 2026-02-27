/**
 * SidebarLeft.tsx — Sidebar gauche
 * Mon Entreprise + Mon Reseau Orbit 9 (scrollable)
 * Ma Productivite deplacee dans sidebar droite (vocal 18:08)
 * Sprint A — Frame Master V2
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
      {/* Sections scrollables : Entreprise + Orbit 9 */}
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
