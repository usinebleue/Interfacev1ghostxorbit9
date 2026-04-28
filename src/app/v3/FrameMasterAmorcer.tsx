/**
 * FrameMasterAmorcer.tsx — Root Layout V3
 * Layout ResizablePanel — 3 zones redimensionnables et rétractables
 * Architecture V3 — Zéro Destruction
 *
 *   Zone 1 (~15%)  : ControlTowerPanel  (navigation) — collapsible
 *   Zone 2 (~35%)  : DiscussionWindow   (vrai LiveChat + input) — collapsible
 *   Zone 3 (~50%)  : WorkspacePhasesPanel (atelier AMORCER) — collapsible
 *
 * Wrappé par AmorcerProvider pour état partagé entre zones.
 * Accessible via /amorcer — ne touche PAS à la V2.
 */

import { cn } from "../components/ui/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { ControlTowerPanel } from "./ControlTowerPanel";
import { DiscussionWindow } from "./DiscussionWindow";
import { WorkspacePhasesPanel } from "./WorkspacePhasesPanel";
import { AmorcerProvider, useAmorcer } from "./AmorcerContext";

export function FrameMasterAmorcer() {
  return (
    <AmorcerProvider>
      <AmorcerLayout />
    </AmorcerProvider>
  );
}

function AmorcerLayout() {
  const { rightSection } = useAmorcer();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Haut : Header */}
      <header className="shrink-0 h-14 border-b border-gray-200 flex items-center px-4 z-10 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-white font-bold text-xs">BT</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Brain Team</h1>
            <p className="text-[10px] text-gray-400">V3 — Amorcer</p>
          </div>
        </div>
        <div className="flex-1" />
      </header>

        {/* Layout 3 Zones — Resizable + Collapsible */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">

          {/* ZONE 1 : Sidebar Gauche — collapsible */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
            <aside className="h-full flex flex-col overflow-hidden">
              <ControlTowerPanel />
            </aside>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ZONE 2 : Chat Central */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
            <DiscussionWindow />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ZONE 3 : L'Atelier / Workspace Droit */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={65}>
            <section className="h-full flex flex-col overflow-hidden relative">
              <WorkspacePhasesPanel />
            </section>
          </ResizablePanel>

        </ResizablePanelGroup>
    </div>
  );
}
