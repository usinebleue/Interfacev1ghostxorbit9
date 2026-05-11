/**
 * MobileSidebarSheet.tsx — Hamburger + Sheet slide-in pour sidebars mobile V3
 *
 * Remplace les sidebars w-[180px] cachees sur mobile par un hamburger compact
 * qui ouvre un Sheet slide-in depuis la gauche (style Claude AI mobile).
 *
 * Le bouton est rendu via portal dans #mobile-sidebar-slot (WorkspacePhasesPanel)
 * pour qu'il apparaisse toujours entre la top barre et le contenu,
 * peu importe ou le composant est declare dans la vue.
 *
 * Usage:
 *   <MobileSidebarSheet currentLabel="Direction" itemCount={8}>
 *     {sidebarButtons}
 *   </MobileSidebarSheet>
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";

interface MobileSidebarSheetProps {
  /** Nom de la section active affiche dans la barre compacte */
  currentLabel: string;
  /** Icone optionnelle de la section active */
  icon?: React.ReactNode;
  /** Nombre total d'items dans la sidebar (badge) */
  itemCount?: number;
  /** Contenu de la sidebar (boutons, separateurs, etc.) */
  children: React.ReactNode;
}

export function MobileSidebarSheet({ currentLabel, icon, itemCount, children }: MobileSidebarSheetProps) {
  const [open, setOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("mobile-sidebar-slot");
    if (el) setPortalTarget(el);
  }, []);

  const triggerButton = (
    <button
      onClick={() => setOpen(true)}
      className="h-10 px-3 flex items-center gap-2 bg-white border-b border-gray-200 w-full cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <Menu className="h-4 w-4 text-gray-500 shrink-0" />
      <span className="text-[10px] font-semibold text-gray-500 shrink-0">Sous-sections</span>
      <span className="text-[10px] text-gray-300 shrink-0">·</span>
      {icon}
      <span className="text-[10px] font-medium text-gray-600 flex-1 text-left truncate">{currentLabel}</span>
      {itemCount !== undefined && itemCount > 0 && (
        <span className="text-[9px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium">{itemCount}</span>
      )}
      <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
    </button>
  );

  return (
    <>
      {/* Bouton hamburger — portal vers #mobile-sidebar-slot (entre top barre et contenu) */}
      {portalTarget ? createPortal(triggerButton, portalTarget) : triggerButton}

      {/* Sheet slide-in gauche */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-gray-100">
            <SheetTitle className="text-sm">Sous-sections</SheetTitle>
          </SheetHeader>
          <div
            className="overflow-y-auto flex-1 p-2 space-y-0.5"
            onClick={(e) => {
              // Fermer le Sheet quand on clique sur un bouton de navigation
              const target = e.target as HTMLElement;
              if (target.closest("button")) {
                setOpen(false);
              }
            }}
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
