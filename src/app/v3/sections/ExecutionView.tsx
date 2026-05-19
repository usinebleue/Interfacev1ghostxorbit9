/**
 * ExecutionView.tsx — Section "Chantiers" unifiée
 *
 * Wrapper léger qui route vers les 3 onglets:
 *   - Accueil (ChantiersAccueilView — fusion En Direct + Chantiers)
 *   - Opérations (OperationsView — ZÉRO modification)
 *   - Rétroaction (RetroactionTab)
 *
 * Le tab state est géré par le PARENT (WorkspacePhasesPanel)
 * Pattern: même que BlueprintView (reçoit activeTab du parent)
 *
 * Note: PhaseKey reste "execution" pour compat — UI label: "Chantiers"
 */

import type { PhaseKey } from "../core/types";

// ═══ Sous-composants — imports directs ═══
import { ChantiersAccueilView } from "./ChantiersAccueilView";
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
  const tab = activeTab ?? "accueil";

  return (
    <>
      {tab === "accueil" && (
        <ChantiersAccueilView botCode={botCode} onAction={onAction} />
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
