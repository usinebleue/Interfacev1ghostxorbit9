/**
 * ViewModeToolbar.tsx — Bande d'outils d'affichage partagée (cards/list/table)
 *
 * Composant standardisé extrait de OperationsView/ChantierView.
 * Utilise les classes SF du système de design (styles.ts).
 * RÈGLE: JAMAIS dupliquer ce toolbar dans un composant — TOUJOURS importer ici.
 */

import { LayoutGrid, LayoutList, Table2 } from "lucide-react";
import { SF } from "../../core/styles";

// ═══ Types ═══

export type ViewMode = "cards" | "list" | "table";

interface ViewModeToolbarProps {
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
  count: number;
  label: string;
}

// ═══ Toolbar — Toggle cards/list/table + compteur ═══

const VIEWS = [
  { key: "cards" as const, icon: LayoutGrid, tip: "Cartes" },
  { key: "list" as const, icon: LayoutList, tip: "Liste" },
  { key: "table" as const, icon: Table2, tip: "Tableau" },
];

export function ViewModeToolbar({ viewMode, onViewMode, count, label }: ViewModeToolbarProps) {
  return (
    <div className={SF.viewToggleWrap}>
      <div className={SF.viewToggleGroup}>
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => onViewMode(v.key)}
            title={v.tip}
            className={viewMode === v.key ? SF.viewToggleBtnActive : SF.viewToggleBtnInactive}
          >
            <v.icon className={SF.viewToggleIcon} />
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <span className={SF.itemCount}>{count} {label}</span>
    </div>
  );
}
