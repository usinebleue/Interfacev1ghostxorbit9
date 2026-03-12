/**
 * FrameMaster.tsx — Shell 3 zones avec TopBar eclatee
 * Chaque panel a sa propre section de TopBar au-dessus de son contenu
 * Sprint C — Restructuration Plateforme
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
import { TopBarLeft, TopBarCenter, TopBarRight } from "../zones/TopBar";
import { SidebarLeft } from "../zones/sidebar-left/SidebarLeft";
import { CenterZone } from "../zones/center/CenterZone";
import { SidebarRight } from "../zones/sidebar-right/SidebarRight";
import { FrameMasterMobile } from "./FrameMasterMobile";
import { useGlassesEvents } from "../hooks/useGlassesEvents";

export function FrameMaster() {
  const isMobile = useIsMobile();
  // Poll glasses push events (Ray-Ban Meta → frontend canvas actions)
  useGlassesEvents(1, true);
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

  /* Style inline pour les grip indicators */
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
      {/* BODY — 3 colonnes resizable, chaque colonne a sa TopBar + contenu */}
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="frame-master-v2"
        className="flex-1"
      >
        {/* SIDEBAR GAUCHE */}
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
          <div className="h-full flex flex-col overflow-hidden">
            <TopBarLeft />
            <div className="flex-1 overflow-hidden border-r border-gray-200">
              <SidebarLeft />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="cursor-col-resize" />

        {/* ZONE CENTRALE */}
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="h-full flex flex-col">
            <TopBarCenter />
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

        {/* SIDEBAR DROITE */}
        <ResizablePanel
          defaultSize={22}
          minSize={4}
          maxSize={35}
          collapsible
          collapsedSize={4}
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
          className="min-w-[56px]"
        >
          <div className="h-full flex flex-col overflow-hidden">
            <TopBarRight />
            <div className="flex-1 overflow-hidden border-l border-gray-200">
              <SidebarRight collapsed={rightCollapsed} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
