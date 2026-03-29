/**
 * FrameMaster.tsx — Layout 2 zones: Cockpit | Canvas Central
 * Gauche: Cockpit (video + etat/discussions/equipe) — collapsible
 * Droite: TopBar nav + CenterZone (50+ vues) — pleine largeur
 * L'Atelier = split-screen FocusModeLayout dans CenterZone (pas un 3e panel)
 * Session 70 — Simplification post-vocal Carl 1h47
 */

import { useRef, useEffect, useCallback, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../components/ui/resizable";
import { useIsMobile } from "../../components/ui/use-mobile";
import { useFrameMaster } from "../context/FrameMasterContext";
import { TopBarCockpit } from "../zones/TopBar";
import { SidebarRight } from "../zones/sidebar-right/SidebarRight";
import { CenterZone } from "../zones/center/CenterZone";
import { FrameMasterMobile } from "./FrameMasterMobile";
import { useGlassesEvents } from "../hooks/useGlassesEvents";
import { useUrlSync } from "../hooks/useUrlSync";

export function FrameMaster() {
  const isMobile = useIsMobile();
  // Poll glasses push events (Ray-Ban Meta -> frontend canvas actions)
  useGlassesEvents(1, true);
  // Sync URL ↔ état navigation (back/forward + deep links)
  useUrlSync();
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
        autoSaveId="frame-master-v4"
        className="flex-1"
      >
        {/* ═══ PANEL GAUCHE — Cockpit ═══ */}
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

        {/* ═══ PANEL DROITE — Canvas Central (CenterZone gere TopBar en interne) ═══ */}
        <ResizablePanel defaultSize={84} minSize={60}>
          <div className="h-full overflow-hidden">
            <CenterZone />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
