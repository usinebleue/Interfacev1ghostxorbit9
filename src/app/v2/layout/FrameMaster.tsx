/**
 * FrameMaster.tsx — Shell 4 zones (D-066)
 * Header DANS chaque panneau — les colonnes header s'alignent
 * automatiquement avec les colonnes body (wireframe p.2)
 * Sidebar gauche ET droite retractables en mode icones (meme pattern)
 * Style V1 : fond gris clair (bg-gray-50)
 * Sprint A — Frame Master V2
 */

import { useRef, useEffect, useCallback, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../components/ui/resizable";
import { useIsMobile } from "../../components/ui/use-mobile";
import { useFrameMaster } from "../context/FrameMasterContext";
import { HeaderLeft, HeaderCenter, HeaderRight } from "../zones/header/HeaderBar";
import { SidebarLeft } from "../zones/sidebar-left/SidebarLeft";
import { CenterZone } from "../zones/center/CenterZone";
import { SidebarRight } from "../zones/sidebar-right/SidebarRight";
import { FrameMasterMobile } from "./FrameMasterMobile";

export function FrameMaster() {
  const isMobile = useIsMobile();
  const {
    leftSidebarCollapsed,
    setLeftCollapsed,
    registerLeftPanel,
  } = useFrameMaster();

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  useEffect(() => {
    if (leftPanelRef.current) {
      registerLeftPanel({
        collapse: () => leftPanelRef.current?.collapse(),
        expand: () => leftPanelRef.current?.expand(),
      });
    }
  }, [registerLeftPanel]);

  const handleLeftCollapse = useCallback(() => {
    setLeftCollapsed(true);
  }, [setLeftCollapsed]);

  const handleLeftExpand = useCallback(() => {
    setLeftCollapsed(false);
  }, [setLeftCollapsed]);

  if (isMobile) {
    return <FrameMasterMobile />;
  }

  /* Style inline pour les grip indicators (les poignees de drag sur les lignes grises) */
  const gripStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    width: 12,
    height: 28,
    background: '#e5e7eb',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* BODY — 3 colonnes resizable, pleine hauteur */}
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="frame-master-layout"
        className="flex-1"
      >
        {/* SIDEBAR GAUCHE — Header Logo + Navigation */}
        <ResizablePanel
          ref={leftPanelRef}
          defaultSize={16}
          minSize={4}
          maxSize={25}
          collapsible
          collapsedSize={4}
          onCollapse={handleLeftCollapse}
          onExpand={handleLeftExpand}
          className="min-w-[56px]"
        >
          <div className="h-full flex flex-col">
            <HeaderLeft collapsed={leftSidebarCollapsed} />
            <div className="flex-1 overflow-hidden">
              <SidebarLeft />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="cursor-col-resize" />

        {/* ZONE CENTRALE — Header Bot ID + Contenu + InputBar */}
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="h-full flex flex-col">
            <HeaderCenter />
            <div className="flex-1 overflow-hidden" style={{ position: 'relative' }}>
              <CenterZone />
              {/* Ligne grise gauche du canvas */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, background: '#d1d5db', zIndex: 5 }} />
              {/* Grip indicator gauche */}
              <div style={{ ...gripStyle, left: 0 }}>
                <GripVertical style={{ width: 10, height: 10, color: '#9ca3af' }} />
              </div>
              {/* Ligne grise droite du canvas */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 1, background: '#d1d5db', zIndex: 5 }} />
              {/* Grip indicator droite */}
              <div style={{ ...gripStyle, right: 0 }}>
                <GripVertical style={{ width: 10, height: 10, color: '#9ca3af' }} />
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="cursor-col-resize" />

        {/* SIDEBAR DROITE — Header Profil + Contexte (meme pattern collapse que gauche) */}
        <ResizablePanel
          defaultSize={20}
          minSize={4}
          maxSize={30}
          collapsible
          collapsedSize={4}
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
          className="min-w-[56px]"
        >
          <div className="h-full flex flex-col">
            <HeaderRight collapsed={rightCollapsed} />
            <div className="flex-1 overflow-hidden">
              <SidebarRight collapsed={rightCollapsed} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
