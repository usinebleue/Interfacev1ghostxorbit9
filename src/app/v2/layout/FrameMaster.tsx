/**
 * FrameMaster.tsx — Layout 3 zones: Cockpit | Chat | Contenu
 * Gauche: Cockpit (video + etat/discussions/equipe) — collapsible
 * Centre: LiveChat permanent + InputBar
 * Droite: TopBar nav + CenterZone (50+ vues)
 * Session 70 — Layout 3 Zones
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
import { TopBarCockpit, TopBarChat, TopBarContent } from "../zones/TopBar";
import { SidebarRight } from "../zones/sidebar-right/SidebarRight";
import { CenterZone } from "../zones/center/CenterZone";
import { LiveChat } from "../zones/center/LiveChat";
import { FrameMasterMobile } from "./FrameMasterMobile";
import { useGlassesEvents } from "../hooks/useGlassesEvents";

export function FrameMaster() {
  const isMobile = useIsMobile();
  // Poll glasses push events (Ray-Ban Meta -> frontend canvas actions)
  useGlassesEvents(1, true);
  const {
    leftSidebarCollapsed,
    setLeftCollapsed,
    registerLeftPanel,
  } = useFrameMaster();

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const [leftCollapsed, setLocalLeftCollapsed] = useState(false);

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
    setLocalLeftCollapsed(true);
  }, [setLeftCollapsed]);

  const handleLeftExpand = useCallback(() => {
    setLeftCollapsed(false);
    setLocalLeftCollapsed(false);
  }, [setLeftCollapsed]);

  if (isMobile) {
    return <FrameMasterMobile />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="frame-master-v3"
        className="flex-1"
      >
        {/* ═══ PANEL GAUCHE — Cockpit (ancien SidebarRight) ═══ */}
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
            <TopBarCockpit collapsed={leftCollapsed} />
            <div className="flex-1 overflow-hidden border-r border-gray-200">
              <SidebarRight collapsed={leftCollapsed} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="cursor-col-resize" />

        {/* ═══ PANEL CENTRE — Chat permanent ═══ */}
        <ResizablePanel defaultSize={22} minSize={12} maxSize={40}>
          <div className="h-full flex flex-col overflow-hidden">
            <TopBarChat />
            <div className="flex-1 overflow-hidden border-x border-gray-200">
              <LiveChat />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="cursor-col-resize" />

        {/* ═══ PANEL DROITE — Contenu (nav + CenterZone intact) ═══ */}
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="h-full flex flex-col">
            <TopBarContent />
            <div className="flex-1 overflow-hidden">
              <CenterZone />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
