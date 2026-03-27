/**
 * DocumentsView.tsx — Vue unifiee des documents (anti-silo)
 * Merge bureau_items (type=document) + docforge_libraries en une seule vue.
 * 3 types: Source (import), Fabrication (cree), Vue live (temps reel).
 * Utilise par: departement tab "Documents", Mon Bureau "Mes Documents", chantier drill-down.
 */

import { useState, useMemo } from "react";
import {
  FileText, Download, FileEdit, BarChart3,
  Search, LayoutGrid, List, Table2,
  ArrowUpDown, ArrowUp, ArrowDown,
  ChevronRight, Inbox, Loader2,
  Clock,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { useBureau } from "../../../api/hooks";
import { useDocForge } from "../../../api/hooks";
import type { BureauItem } from "../../../api/types";
import type { DocForgeLibrary } from "../../../api/types";

// ══ Unified document type ══

type DocType = "source" | "fabrication" | "live";

interface UnifiedDoc {
  id: string;
  type: DocType;
  titre: string;
  description: string;
  status: string;
  bot: string;
  chantier_id: number | null;
  projet_id: number | null;
  progression: number;
  created_at: string;
  updated_at: string;
  /** Original source for drilldown */
  _raw: BureauItem | DocForgeLibrary;
}

// ══ Type badge config ══

const TYPE_CONFIG: Record<DocType, { icon: typeof FileText; label: string; bg: string; text: string }> = {
  source:       { icon: Download,  label: "Source",       bg: "bg-amber-50",   text: "text-amber-700" },
  fabrication:  { icon: FileEdit,  label: "Fabrication",  bg: "bg-blue-50",    text: "text-blue-700" },
  live:         { icon: BarChart3, label: "Vue live",     bg: "bg-violet-50",  text: "text-violet-700" },
};

const STATUS_COLORS: Record<string, string> = {
  actif: "bg-blue-100 text-blue-700",
  brouillon: "bg-gray-100 text-gray-600",
  en_cours: "bg-amber-100 text-amber-700",
  complet: "bg-emerald-100 text-emerald-700",
  publie: "bg-emerald-100 text-emerald-700",
  archive: "bg-gray-100 text-gray-500",
};

// Bot metadata
const BOT_NAMES: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Tim", CFOB: "Frank", CMOB: "Mathilde",
  CSOB: "Simone", COOB: "Olivier", CPOB: "Paco", CHROB: "Helene",
  CINOB: "Ines", CROB: "Rich", CLOB: "Loulou", CISOB: "Sebastien",
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "A l'instant";
  if (mins < 60) return `${mins} min`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
}

// ══ Progress from DocForge status ══

function docForgeProgression(lib: DocForgeLibrary): number {
  if (lib.status === "publie" || lib.status === "published") return 100;
  return lib.completude_pct || 0;
}

function bureauProgression(item: BureauItem): number {
  if (item.status === "integre" || item.status === "complete") return 100;
  if (item.status === "analyse") return 50;
  return 0;
}

// ════════════════════════════════════════════════════════
// PROPS
// ════════════════════════════════════════════════════════

interface DocumentsViewProps {
  /** Filtre par bot (departement) */
  botFilter?: string;
  /** Filtre par chantier */
  chantierId?: number;
  /** Filtre par projet */
  projetId?: number;
}

type SortField = "titre" | "date" | "type" | "bot" | "progression";
type SortDir = "asc" | "desc";
type ViewMode = "cards" | "list" | "spreadsheet";

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════

export function DocumentsView({ botFilter, chantierId, projetId }: DocumentsViewProps = {}) {
  const { items: bureauItems, loading: loadingB } = useBureau("document");
  const { libraries, loading: loadingD } = useDocForge();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const loading = loadingB || loadingD;

  // ── Merge both sources into unified docs ──
  const allDocs = useMemo<UnifiedDoc[]>(() => {
    const docs: UnifiedDoc[] = [];

    // Bureau items (type "document") → Source
    for (const item of bureauItems) {
      docs.push({
        id: `bureau-${item.id}`,
        type: "source",
        titre: item.titre,
        description: item.description || "",
        status: item.status || "actif",
        bot: item.bot || "CEOB",
        chantier_id: item.chantier_id ?? null,
        projet_id: item.projet_id ?? null,
        progression: bureauProgression(item),
        created_at: item.created_at,
        updated_at: item.updated_at,
        _raw: item,
      });
    }

    // DocForge libraries → Fabrication
    for (const lib of libraries) {
      docs.push({
        id: `docforge-${lib.id}`,
        type: "fabrication",
        titre: lib.titre,
        description: lib.description || "",
        status: lib.status || "brouillon",
        bot: lib.bot_primaire || "CPOB",
        chantier_id: lib.chantier_id ?? null,
        projet_id: lib.projet_id ?? null,
        progression: docForgeProgression(lib),
        created_at: lib.created_at,
        updated_at: lib.updated_at,
        _raw: lib,
      });
    }

    return docs;
  }, [bureauItems, libraries]);

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    let items = [...allDocs];

    if (botFilter) items = items.filter(d => d.bot === botFilter);
    if (chantierId != null) items = items.filter(d => d.chantier_id === chantierId);
    if (projetId != null) items = items.filter(d => d.projet_id === projetId);
    if (typeFilter) items = items.filter(d => d.type === typeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(d =>
        d.titre.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (BOT_NAMES[d.bot] || "").toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "titre": cmp = a.titre.localeCompare(b.titre); break;
        case "date": cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(); break;
        case "type": cmp = a.type.localeCompare(b.type); break;
        case "bot": cmp = a.bot.localeCompare(b.bot); break;
        case "progression": cmp = a.progression - b.progression; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [allDocs, botFilter, chantierId, projetId, typeFilter, search, sortField, sortDir]);

  // Counts for filter pills
  const counts = {
    all: allDocs.length,
    source: allDocs.filter(d => d.type === "source").length,
    fabrication: allDocs.filter(d => d.type === "fabrication").length,
    live: allDocs.filter(d => d.type === "live").length,
  };

  // Sort header helper
  const SortTh = ({ field, label, cls }: { field: SortField; label: string; cls?: string }) => {
    const active = sortField === field;
    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <th
        className={cn("text-left px-2 py-2 font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100 transition-colors text-[9px]", cls)}
        onClick={() => { if (active) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } }}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-blue-500" : "text-gray-300")} />
        </span>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement des documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-1">
          {([
            { id: null, label: "Tous", count: counts.all },
            { id: "source" as DocType, label: "Sources", count: counts.source },
            { id: "fabrication" as DocType, label: "Fabrication", count: counts.fabrication },
          ]).map(f => (
            <button key={f.id ?? "all"} onClick={() => setTypeFilter(f.id)}
              className={cn("px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
                typeFilter === f.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {([
            { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
            { mode: "list" as const, icon: List, title: "Liste" },
            { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
          ]).map(({ mode, icon: Icon, title }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
              title={title}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <span className="text-[9px] font-bold text-gray-400">{filtered.length} docs</span>
      </div>

      {/* ══ EMPTY STATE ══ */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Inbox className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">{search ? `Aucun resultat pour "${search}"` : "Aucun document"}</p>
          <p className="text-[9px] mt-1 opacity-70">Les documents uploades et crees apparaitront ici</p>
        </div>
      )}

      {/* ══ CARDS VIEW ══ */}
      {viewMode === "cards" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(d => {
            const tc = TYPE_CONFIG[d.type];
            const TypeIcon = tc.icon;
            const gradient = d.type === "source" ? "from-amber-600 to-amber-500"
              : d.type === "fabrication" ? "from-blue-600 to-blue-500"
              : "from-violet-600 to-violet-500";

            return (
              <div key={d.id} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all group cursor-pointer">
                {/* GRADIENT HEADER */}
                <div className={cn("px-4 py-3 flex items-center gap-3 bg-gradient-to-r", gradient)}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20">
                    <TypeIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white flex-1 truncate">{d.titre}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">{tc.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                </div>

                {/* BODY */}
                <div className="px-4 py-3 space-y-1.5">
                  {d.description && (
                    <p className="text-[9px] text-gray-500 line-clamp-2">{d.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Bot badge */}
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                      {BOT_NAMES[d.bot] || d.bot}
                    </span>
                    {/* Status */}
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", STATUS_COLORS[d.status] || "bg-gray-100 text-gray-600")}>
                      {d.status}
                    </span>
                    {/* Time */}
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="h-3.5 w-3.5" /> {formatRelativeTime(d.updated_at)}
                    </span>
                  </div>
                  {/* Progression bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className={cn("h-1.5 rounded-full transition-all",
                        d.progression >= 100 ? "bg-emerald-500" : d.progression > 0 ? "bg-blue-500" : "bg-gray-300"
                      )} style={{ width: `${d.progression}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{d.progression}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ LIST VIEW ══ */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="space-y-1">
          {filtered.map(d => {
            const tc = TYPE_CONFIG[d.type];
            const TypeIcon = tc.icon;
            return (
              <div key={d.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <TypeIcon className={cn("h-3.5 w-3.5 shrink-0", tc.text)} />
                <span className="text-[9px] font-bold flex-1 truncate text-gray-800">{d.titre}</span>
                <span className={cn("text-[8px] font-medium px-1.5 py-0.5 rounded-full border", tc.bg, tc.text)}>{tc.label}</span>
                <span className="text-[9px] text-gray-400">{BOT_NAMES[d.bot] || d.bot}</span>
                <span className="text-[8px] text-gray-400">{d.progression}%</span>
                <span className="text-[8px] text-gray-400">{formatRelativeTime(d.updated_at)}</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* ══ SPREADSHEET VIEW ══ */}
      {viewMode === "spreadsheet" && filtered.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-[9px] table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <SortTh field="titre" label="Titre" cls="w-[35%] px-3" />
                <SortTh field="type" label="Type" cls="w-[12%]" />
                <SortTh field="bot" label="Bot" cls="w-[12%]" />
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">Statut</th>
                <SortTh field="progression" label="Prog." cls="w-[12%]" />
                <SortTh field="date" label="Maj" cls="w-[10%]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const tc = TYPE_CONFIG[d.type];
                return (
                  <tr key={d.id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-800 truncate">{d.titre}</td>
                    <td className="px-2 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded-full border font-medium", tc.bg, tc.text)}>{tc.label}</span>
                    </td>
                    <td className="px-2 py-2 text-gray-600">{BOT_NAMES[d.bot] || d.bot}</td>
                    <td className="px-2 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded font-bold", STATUS_COLORS[d.status] || "bg-gray-100 text-gray-600")}>{d.status}</span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className={cn("h-1.5 rounded-full",
                            d.progression >= 100 ? "bg-emerald-500" : "bg-blue-500"
                          )} style={{ width: `${d.progression}%` }} />
                        </div>
                        <span className="font-bold text-gray-500">{d.progression}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-gray-400">{formatRelativeTime(d.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
