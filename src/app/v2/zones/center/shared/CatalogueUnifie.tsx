/**
 * CatalogueUnifie.tsx — Catalogue unifié templates + playbooks + diagnostics
 * Sprint 7 — BRISER LES SILOS
 * Un seul composant, 3 types, filtres type/dept/search
 */

import { useState, useMemo } from "react";
import { Search, FileText, Rocket, Stethoscope, Inbox, Loader2, Filter } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { BOT_INFO } from "./section-config";
import { useUnifiedCatalogue, type CatalogueItemType, type UnifiedCatalogueItem } from "../../../api/hooks";

const TYPE_ICONS: Record<CatalogueItemType, React.ElementType> = {
  template: FileText,
  playbook: Rocket,
  diagnostic: Stethoscope,
};

const TYPE_GRADIENTS: Record<CatalogueItemType, string> = {
  template: "from-violet-600 to-violet-500",
  playbook: "from-indigo-600 to-indigo-500",
  diagnostic: "from-blue-600 to-blue-500",
};

const TYPE_LABELS: Record<CatalogueItemType, string> = {
  template: "Templates",
  playbook: "Playbooks",
  diagnostic: "Diagnostics",
};

interface CatalogueUnifieProps {
  deptFilter?: string;
  onAction?: (item: UnifiedCatalogueItem) => void;
  showTypeFilter?: boolean;
}

export function CatalogueUnifie({ deptFilter, onAction, showTypeFilter = true }: CatalogueUnifieProps) {
  const { items, loading } = useUnifiedCatalogue(deptFilter);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CatalogueItemType | "all">("all");

  const filtered = useMemo(() => {
    let result = items;
    if (typeFilter !== "all") {
      result = result.filter(i => i.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.titre.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.categorie && i.categorie.toLowerCase().includes(q))
      );
    }
    return result;
  }, [items, typeFilter, search]);

  // Counts by type
  const counts = useMemo(() => ({
    all: items.length,
    template: items.filter(i => i.type === "template").length,
    playbook: items.filter(i => i.type === "playbook").length,
    diagnostic: items.filter(i => i.type === "diagnostic").length,
  }), [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement du catalogue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type filter pills */}
        {showTypeFilter && (
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            {(["all", "template", "playbook", "diagnostic"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
                  typeFilter === t
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                )}
              >
                {t === "all" ? "Tout" : TYPE_LABELS[t]} ({counts[t]})
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex-1 relative min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
          />
        </div>

        <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
          {filtered.length} items
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">
            {search ? `Aucun resultat pour "${search}"` : "Aucun element dans le catalogue"}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            const gradient = TYPE_GRADIENTS[item.type];
            const actionLabel = item.type === "template" ? "Generer" : item.type === "playbook" ? "Deployer" : "Lancer";

            return (
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
                </div>

                {/* Body */}
                <div className="px-3 py-2.5 space-y-1.5">
                  {item.description && (
                    <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-medium",
                      item.type === "template" ? "bg-teal-50 text-teal-600"
                        : item.type === "playbook" ? "bg-indigo-50 text-indigo-600"
                        : "bg-cyan-50 text-cyan-600"
                    )}>
                      {TYPE_LABELS[item.type]}
                    </span>
                    {item.categorie && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{item.categorie}</span>
                    )}
                    {item.frequence && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{item.frequence}</span>
                    )}
                    {item.duree_minutes && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{item.duree_minutes} min</span>
                    )}
                    {item.nb_questions && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{item.nb_questions} questions</span>
                    )}
                    {item.nb_sections && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">{item.nb_sections} sections</span>
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

                  {/* Action button */}
                  {onAction && (
                    <button
                      className="w-full mt-1 px-3 py-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      onClick={(e) => { e.stopPropagation(); onAction(item); }}
                    >
                      {actionLabel}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
