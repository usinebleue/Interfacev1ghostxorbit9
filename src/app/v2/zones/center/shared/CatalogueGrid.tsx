/**
 * CatalogueGrid.tsx — Grid cards reutilisable pour Documents / Playbooks / Diagnostics
 * Utilise par BlueprintView tabs 7-8-9
 */

import { useState, useMemo } from "react";
import { Search, FileText, Rocket, Stethoscope, Inbox, Loader2 } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { BOT_INFO } from "./section-config";

export type CatalogueType = "documents" | "playbooks" | "diagnostics";

interface CatalogueItem {
  id: string | number;
  titre: string;
  description?: string;
  categorie?: string;
  departement?: string;
  bot_primaire?: string;
  bots?: string[];
  duree?: string;
  duree_minutes?: number;
  nb_questions?: number;
  nb_projets?: number;
  nb_missions?: number;
  frequence?: string;
  niveau?: string;
  niveau_hierarchie?: string;
  pages_estimees?: number;
  sections?: unknown[];
  populaire?: boolean;
  valeur_potentielle?: string;
  data_points?: unknown[];
}

interface CatalogueGridProps {
  type: CatalogueType;
  items: CatalogueItem[];
  loading?: boolean;
  onAction?: (item: CatalogueItem) => void;
  actionLabel?: string;
  headerGradient?: string;
}

const TYPE_ICONS: Record<CatalogueType, React.ElementType> = {
  documents: FileText,
  playbooks: Rocket,
  diagnostics: Stethoscope,
};

const TYPE_GRADIENTS: Record<CatalogueType, string> = {
  documents: "from-teal-600 to-teal-500",
  playbooks: "from-indigo-600 to-indigo-500",
  diagnostics: "from-cyan-600 to-cyan-500",
};

const TYPE_LABELS: Record<CatalogueType, string> = {
  documents: "documents",
  playbooks: "playbooks",
  diagnostics: "diagnostics",
};

export function CatalogueGrid({
  type,
  items,
  loading = false,
  onAction,
  actionLabel,
  headerGradient,
}: CatalogueGridProps) {
  const [search, setSearch] = useState("");

  const gradient = headerGradient || TYPE_GRADIENTS[type];
  const Icon = TYPE_ICONS[type];

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.titre.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.categorie && item.categorie.toLowerCase().includes(q))
    );
  }, [items, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher ${TYPE_LABELS[type]}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
          />
        </div>
        <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
          {filtered.length} {TYPE_LABELS[type]}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">
            {search ? `Aucun resultat pour "${search}"` : `Aucun ${TYPE_LABELS[type]}`}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onAction?.(item)}
            >
              {/* Gradient header */}
              <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center justify-between", gradient)}>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-white shrink-0" />
                  <p className="text-xs font-bold text-white truncate">{item.titre}</p>
                </div>
                {item.populaire && (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0 ml-1">Populaire</span>
                )}
                {item.pages_estimees && (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0 ml-1">{item.pages_estimees} p.</span>
                )}
                {(item.data_points?.length || 0) > 0 && (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0 ml-1">{item.data_points?.length} KPIs</span>
                )}
              </div>

              {/* Body */}
              <div className="px-3 py-2.5 space-y-1.5">
                {item.description && (
                  <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                )}

                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.categorie && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{item.categorie}</span>
                  )}
                  {item.frequence && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{item.frequence}</span>
                  )}
                  {item.duree_minutes && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{item.duree_minutes} min</span>
                  )}
                  {item.duree && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{item.duree}</span>
                  )}
                  {item.nb_questions && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{item.nb_questions} questions</span>
                  )}
                  {item.niveau_hierarchie && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{item.niveau_hierarchie}</span>
                  )}
                  {item.niveau && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{item.niveau}</span>
                  )}
                  {item.sections && item.sections.length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">{item.sections.length} sections</span>
                  )}
                  {item.nb_projets && item.nb_missions && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{item.nb_projets} proj. · {item.nb_missions} missions</span>
                  )}
                </div>

                {/* Bot badges */}
                {item.bots && item.bots.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.bots.slice(0, 4).map((b) => {
                      const info = BOT_INFO[b];
                      return info ? (
                        <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">{info.short}</span>
                      ) : null;
                    })}
                  </div>
                )}

                {item.valeur_potentielle && (
                  <p className="text-[9px] text-emerald-600 line-clamp-1">{item.valeur_potentielle}</p>
                )}

                {/* Action button */}
                {onAction && actionLabel && (
                  <button
                    className="w-full mt-1 px-3 py-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={(e) => { e.stopPropagation(); onAction(item); }}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
