/**
 * CrudToolbar.tsx — Barre search/sort/create/filter pour les tabs hierarchiques
 * Utilise par BlueprintView (Chantiers, Projets, Missions, Taches)
 */

import { useState } from "react";
import {
  Search, Plus, SortAsc, SortDesc, Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";

export type SortField = "titre" | "date" | "statut" | "priorite";
export type SortDir = "asc" | "desc";

interface CrudToolbarProps {
  /** Nombre total d'items */
  count: number;
  /** Label pluriel (ex: "projets") */
  label: string;
  /** Valeur du champ search */
  search: string;
  onSearchChange: (v: string) => void;
  /** Tri actif */
  sortField: SortField;
  sortDir: SortDir;
  onSortChange: (field: SortField, dir: SortDir) => void;
  /** Filtre par statut */
  statusFilter: string | null;
  onStatusFilterChange: (v: string | null) => void;
  /** Filtre par categorie */
  categorieFilter?: string | null;
  onCategorieFilterChange?: (v: string | null) => void;
  /** Callback bouton "+ Creer" */
  onCreate?: () => void;
  /** Cacher le bouton Creer */
  hideCreate?: boolean;
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "titre", label: "Nom" },
  { field: "date", label: "Date" },
  { field: "statut", label: "Statut" },
  { field: "priorite", label: "Priorite" },
];

const CATEGORIE_CHIPS = [
  { value: null, label: "Toutes" },
  { value: "interne", label: "Internes" },
  { value: "client", label: "Clients" },
  { value: "partenaire", label: "Partenaires" },
];

const STATUS_CHIPS = [
  { value: null, label: "Tous" },
  { value: "en-cours", label: "En cours" },
  { value: "a-faire", label: "A faire" },
  { value: "done", label: "Completes" },
  { value: "bloque", label: "Bloques" },
];

export function CrudToolbar({
  count,
  label,
  search,
  onSearchChange,
  sortField,
  sortDir,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  categorieFilter = null,
  onCategorieFilterChange,
  onCreate,
  hideCreate = false,
}: CrudToolbarProps) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="space-y-2">
      {/* Row 1: Search + Create + Sort */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher ${label}...`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
          />
        </div>

        {/* Count */}
        <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
          {count} {label}
        </span>

        {/* Sort toggle */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sortDir === "asc" ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.field}
                  onClick={() => {
                    const newDir = sortField === opt.field && sortDir === "asc" ? "desc" : "asc";
                    onSortChange(opt.field, newDir);
                    setShowSort(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-[9px] font-medium hover:bg-gray-50 transition-colors",
                    sortField === opt.field ? "text-blue-600 bg-blue-50" : "text-gray-600"
                  )}
                >
                  {opt.label} {sortField === opt.field && (sortDir === "asc" ? "↑" : "↓")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create button */}
        {!hideCreate && onCreate && (
          <button
            onClick={onCreate}
            className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Creer
          </button>
        )}
      </div>

      {/* Row 2: Filter chips (status + categorie) */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status chips */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value ?? "all"}
              onClick={() => onStatusFilterChange(chip.value)}
              className={cn(
                "px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border",
                statusFilter === chip.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Categorie chips */}
        {onCategorieFilterChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 font-medium">Cat:</span>
            {CATEGORIE_CHIPS.map((chip) => (
              <button
                key={chip.value ?? "all-cat"}
                onClick={() => onCategorieFilterChange(chip.value)}
                className={cn(
                  "px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border",
                  categorieFilter === chip.value
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
