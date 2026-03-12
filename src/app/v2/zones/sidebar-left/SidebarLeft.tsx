/**
 * SidebarLeft.tsx — Sidebar gauche restructuree
 * 6 sections: Mon Entreprise, Mon Bureau, Mes Salles, Mon Equipe AI, Mon Reseau, Reglages
 * + Master GHML (reference, collapsed en bas)
 * Sprint C — Restructuration Plateforme
 */

import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { SectionMonEntreprise } from "./SectionMonEntreprise";
import { SectionMonBureau } from "./SectionMonBureau";
import { SectionMesSalles } from "./SectionMesSalles";
import { SectionMonEquipeAI } from "./SectionMonEquipeAI";
import { SectionMonReseau } from "./SectionMonReseau";
import { SectionMasterGHML } from "./SectionMasterGHML";
import { SectionReglages } from "./SectionReglages";

export function SidebarLeft() {
  const { leftSidebarCollapsed } = useFrameMaster();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 5 sections principales + Master GHML scrollables */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-2">
          <SectionMonBureau collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMonEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMesSalles collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMonEquipeAI collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMonReseau collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionMasterGHML collapsed={collapsed} />
        </div>
      </ScrollArea>

      {/* Reglages — fixe en bas */}
      <SectionReglages collapsed={collapsed} />
    </div>
  );
}
