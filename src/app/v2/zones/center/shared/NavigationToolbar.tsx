/**
 * NavigationToolbar.tsx — Types de navigation + breadcrumb drill-down
 * NavMode: les modes hierarchiques (chantier/projet/mission/tache) + tous
 * Les modes secondaires (bot/type/statut) sont dans le CrudToolbar
 */

import { ArrowLeft, FolderOpen } from "lucide-react";

export type NavMode = "tous" | "par-chantier" | "par-projet" | "par-mission" | "par-tache" | "par-bot" | "par-type" | "par-statut" | "templates";

export interface BreadcrumbItem {
  level: string;
  id: number;
  titre: string;
}

interface NavigationToolbarProps {
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
}

/** Breadcrumb only — tabs are handled by SectionHeader in DepartmentTourDeControle */
export function NavigationToolbar({ breadcrumb, onBack }: NavigationToolbarProps) {
  if (breadcrumb.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Retour
      </button>
      <span className="text-[9px] text-gray-400">|</span>
      {breadcrumb.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <span className="text-[9px] text-gray-300">&rsaquo;</span>}
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-bold text-blue-800">{item.titre}</span>
        </span>
      ))}
    </div>
  );
}
