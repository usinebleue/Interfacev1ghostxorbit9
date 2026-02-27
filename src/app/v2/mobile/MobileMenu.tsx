/**
 * MobileMenu.tsx — Hamburger drawer (slide-in)
 * Utilise Sheet de ui/sheet.tsx
 * Sprint A — Frame Master V2
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { SidebarLeft } from "../zones/sidebar-left/SidebarLeft";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">UB</span>
            </div>
            GhostX
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          <SidebarLeft />
        </div>
      </SheetContent>
    </Sheet>
  );
}
