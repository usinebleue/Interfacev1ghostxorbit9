/**
 * SidebarLeft.tsx — Sidebar gauche
 * Mon Entreprise (departements) + Mon Reseau Orbit 9 + TRG Industries
 * Chaque bot vit dans son departement — CarlOS = Direction
 * Sprint B — Reorganisation vocal Carl 13:14:24
 */

import { Palette } from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { SectionEntreprise } from "./SectionEntreprise";
import { SectionEspaceBureau } from "./SectionEspaceBureau";
import { SectionOrbit9 } from "./SectionOrbit9";
import { SectionTrgIndustries } from "./SectionTrgIndustries";
import { cn } from "../../../components/ui/utils";

export function SidebarLeft() {
  const { leftSidebarCollapsed, activeOrbit9Section, navigateOrbit9 } = useFrameMaster();
  const collapsed = leftSidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Sections scrollables : Entreprise + Bureau + Orbit 9 + TRG Industries */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-2">
          <SectionEntreprise collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionEspaceBureau collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionOrbit9 collapsed={collapsed} />
          <Separator className="my-2" />
          <SectionTrgIndustries collapsed={collapsed} />
          <Separator className="my-2" />
          {/* Page Type — reference design */}
          <div className="px-1">
            <button
              onClick={() => navigateOrbit9("page-type")}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                activeOrbit9Section === "page-type" && "bg-accent font-medium"
              )}
              title="Page Type"
            >
              {collapsed ? (
                <Palette className="h-3.5 w-3.5 text-gray-400 mx-auto" />
              ) : (
                <>
                  <Palette className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate text-gray-500">Page Type</span>
                </>
              )}
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
