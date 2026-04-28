/**
 * ExecutionView.tsx — Section "Exécution" unifiée (Option C)
 *
 * Wrapper léger qui route vers les 4 onglets:
 *   - En direct (ExecutionLiveTab)
 *   - Chantiers (ChantierView — ZÉRO modification)
 *   - Opérations (OperationsView — ZÉRO modification)
 *   - Rétroaction (RetroactionTab)
 *
 * Le tab state est géré par le PARENT (WorkspacePhasesPanel)
 * Pattern: même que BlueprintView (reçoit activeTab du parent)
 *
 * Source: MEGA-PROMPT-DEEP-SEARCH-EXECUTION-VS-OPERATIONS.md (Option C)
 */

import type { PhaseKey } from "../core/types";

// ═══ Sous-composants — imports directs ═══
import { ExecutionLiveTab } from "./ExecutionLiveTab";
import { ChantierView } from "./ChantierView";
import { OperationsView } from "./OperationsView";
import { RetroactionTab } from "./RetroactionTab";

// ═══ Props ═══

interface ExecutionViewProps {
  botCode: string;
  showHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onAction?: (phase: PhaseKey, context: string) => void;
}

// ═══ Composant principal ═══

export function ExecutionView({ botCode, showHeader, activeTab, onTabChange, onAction }: ExecutionViewProps) {
  const tab = activeTab ?? "live";

  return (
    <>
      {tab === "live" && (
        <ExecutionLiveTab botCode={botCode} />
      )}
      {tab === "chantiers" && (
        <ChantierView botCode={botCode} showHeader={showHeader} onAction={onAction} />
      )}
      {tab === "operations" && (
        <OperationsView botCode={botCode} showHeader={showHeader} onAction={onAction} />
      )}
      {tab === "retroaction" && (
        <RetroactionTab botCode={botCode} />
      )}
    </>
  );
}
