/**
 * FrameMasterAmorcer.tsx — Root Layout V3
 * Layout ResizablePanel — 3 zones redimensionnables et rétractables
 * Architecture V3 — Intégration Backend
 *
 *   Zone 1 (~15%)  : ControlTowerPanel  (navigation) — collapsible
 *   Zone 2 (~35%)  : DiscussionWindow   (vrai LiveChat V2) — collapsible
 *   Zone 3 (~50%)  : WorkspacePhasesPanel (atelier AMORCER) — collapsible
 *
 * Wrappé par AmorcerProvider pour état partagé entre zones.
 * BotCodeSync synchronise V3 → V2 (unidirectionnel, Fix R1+R2).
 * / = V3 (défaut), /v2 = ancienne interface.
 */

import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { ControlTowerPanel } from "./ControlTowerPanel";
import { DiscussionWindow } from "./DiscussionWindow";
import { WorkspacePhasesPanel } from "./WorkspacePhasesPanel";
import { AmorcerProvider, useAmorcer } from "./AmorcerContext";
import { useFrameMaster } from "../v2/context/FrameMasterContext";
import { getSectionGPS } from "./core/section-registry";
import { useIsMobile } from "../components/ui/use-mobile";
import { AmorcerLayoutMobile } from "./AmorcerLayoutMobile";

// ═══ Mapping V3 rightSection → V2 activeView (fallback quand pas dans section-registry) ═══
const V3_TO_V2_VIEW: Record<string, string> = {
  cockpit: "department",
  blueprint: "blueprint",
  dataroom: "espace-bureau",
  playbooks: "espace-bureau",
  conferenceai: "conference-ai",
  execution: "department",
  "bureau-agenda": "espace-bureau",
  admin: "admin",
  bureau: "espace-bureau",
  dashboard: "dashboard",
  "mon-reseau": "mon-reseau",
  "salles-hub": "salles-hub",
  "board-room": "board-room",
  "war-room": "war-room",
  "think-room": "think-room",
  "diagnostic-ia": "diagnostic-ia",
  "mon-equipe": "mon-equipe",
  "mon-entreprise": "mon-entreprise",
  reglages: "reglages",
  "agent-settings": "agent-settings",
};

/**
 * BotCodeSync — Bridge unidirectionnel V3 → V2 (invisible)
 * Fix R1: useRef guard anti-boucle infinie
 * Fix R2: mapping rightSection → activeView pour bons prompts backend
 * RÈGLE: V3 = MAÎTRE, V2 = ESCLAVE. JAMAIS de reverse sync.
 */
function BotCodeSync() {
  const { activeBotCode, rightSection, cockpitTab, o9Section } = useAmorcer();
  const { setActiveBotCode, setActiveView } = useFrameMaster();

  const prevBotRef = useRef(activeBotCode);
  const prevSectionRef = useRef(rightSection);
  const prevO9Ref = useRef(o9Section);
  const prevTabRef = useRef(cockpitTab);

  // Sync activeBotCode V3 → V2 (toujours pousser — React bail-out si même valeur)
  useEffect(() => {
    prevBotRef.current = activeBotCode;
    setActiveBotCode(activeBotCode);
  }, [activeBotCode, setActiveBotCode]);

  // Sync rightSection + cockpitTab + o9Section → V2 activeView (Fix R2)
  useEffect(() => {
    const sectionChanged = rightSection !== prevSectionRef.current;
    const o9Changed = o9Section !== prevO9Ref.current;
    const tabChanged = cockpitTab !== prevTabRef.current;
    if (!sectionChanged && !o9Changed && !tabChanged) return;

    prevSectionRef.current = rightSection;
    prevO9Ref.current = o9Section;
    prevTabRef.current = cockpitTab;

    if (cockpitTab === "orbit9" || (rightSection && rightSection.startsWith("orbit9"))) {
      setActiveView("orbit9-detail" as any);
      return;
    }
    if (!rightSection) {
      setActiveView("department");
      return;
    }
    const gps = getSectionGPS(rightSection);
    if (gps) {
      setActiveView(gps.view as any);
      return;
    }
    const v2View = V3_TO_V2_VIEW[rightSection];
    if (v2View) {
      setActiveView(v2View as any);
      return;
    }
    setActiveView("department");
  }, [rightSection, cockpitTab, o9Section, setActiveView]);

  return null;
}

export function FrameMasterAmorcer() {
  return (
    <AmorcerProvider>
      <BotCodeSync />
      <AmorcerLayout />
    </AmorcerProvider>
  );
}

const DELIVERABLE_LABELS: Record<string, string> = {
  document: "Document", spreadsheet: "Tableur", presentation: "Presentation",
  code: "Code", jumelage: "Jumelage",
};

function AmorcerLayout() {
  const { rightSection, setActivePhase, setRightSection, setReflexionContext, startDeliverable } = useAmorcer();
  const { setLeftCollapsed } = useFrameMaster();
  const isMobile = useIsMobile();

  // --- DocForge: proposition livrable via bandeau ---
  const [deliverableProposal, setDeliverableProposal] = useState<{ type: string; draftId?: number; titre?: string; sectionsCount?: number; botName?: string } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.deliverableType) {
        setDeliverableProposal({
          type: detail.deliverableType,
          draftId: detail.draftLibraryId,
          titre: detail.draftTitre,
          sectionsCount: detail.draftSectionsCount,
          botName: detail.botName,
        });
      }
    };
    window.addEventListener("bt-start-deliverable", handler);
    return () => window.removeEventListener("bt-start-deliverable", handler);
  }, []);

  // Écouter les transitions de phase CREDO → Workspace (CustomEvent depuis CanvasActionContext)
  // PROTÉGÉ: ne switch PAS si l'utilisateur est déjà dans un workflow actif
  const { activePhase } = useAmorcer();
  useEffect(() => {
    const handler = (e: Event) => {
      const { phase, context } = (e as CustomEvent).detail || {};
      if (!phase) return;
      // Exécution/Rétroaction = phases EXPLICITES uniquement (progress bar, sidebar, boutons)
      // JAMAIS auto-transition depuis le backend — ça hijack le workspace
      if (phase === "execution" || phase === "retroaction") return;
      // Ne pas interrompre un workflow actif (reflexion, creation)
      const inWorkflow = activePhase && !["observation", "attention", "moderation", "discussion"].includes(activePhase);
      if (inWorkflow) {
        console.log(`[FrameMaster] phase_transition BLOQUÉ: déjà en ${activePhase}, ignoré ${phase}`);
        return;
      }
      setActivePhase(phase);
      setReflexionContext(context || "discussion en cours");
      setRightSection(null);
    };
    window.addEventListener("bt-work-phase-transition", handler);
    return () => window.removeEventListener("bt-work-phase-transition", handler);
  }, [setActivePhase, setReflexionContext, setRightSection, activePhase]);

  // Mobile → layout 3 onglets plein ecran (desktop inchange)
  if (isMobile) return <AmorcerLayoutMobile />;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
        {/* Layout 3 Zones — Resizable + Collapsible */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">

          {/* ZONE 1 : Sidebar Gauche — collapsible */}
          <ResizablePanel
            defaultSize={18} minSize={10} maxSize={30}
            collapsible collapsedSize={4}
            onCollapse={() => setLeftCollapsed(true)}
            onExpand={() => setLeftCollapsed(false)}
          >
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
              {deliverableProposal && (
                <div className="mx-4 mt-2 mb-1 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {deliverableProposal.draftId && deliverableProposal.botName
                        ? `${deliverableProposal.botName} a prepare: ${deliverableProposal.titre || DELIVERABLE_LABELS[deliverableProposal.type] || deliverableProposal.type}, ${deliverableProposal.sectionsCount || "?"} sections`
                        : `Ouvrir l'atelier ${DELIVERABLE_LABELS[deliverableProposal.type] || deliverableProposal.type} ?`
                      }
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { startDeliverable(deliverableProposal.type, deliverableProposal.draftId); setDeliverableProposal(null); }}
                      className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {deliverableProposal.draftId ? "Ouvrir le brouillon" : "Oui, ouvrir"}
                    </button>
                    <button
                      onClick={() => setDeliverableProposal(null)}
                      className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
              )}
              <WorkspacePhasesPanel />
            </section>
          </ResizablePanel>

        </ResizablePanelGroup>
    </div>
  );
}
