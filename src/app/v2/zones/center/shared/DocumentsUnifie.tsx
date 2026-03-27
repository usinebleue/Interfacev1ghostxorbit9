/**
 * DocumentsUnifie.tsx — Vue unifiee des documents (harmonise S71)
 * Combine: DocForge libraries + Documents importes
 * NavigationToolbar: Par Chantier | Par Bot | Par Type | Par Statut | Tous
 * BotBadgeFull: "Tim — CTO" partout
 * 4 vues: Cards, List, Kanban, Spreadsheet
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText, Sparkles, Upload, Inbox,
  LayoutGrid, List, Columns, Table2,
  ChevronRight, Trash2, ArrowUp, ArrowDown, ArrowUpDown,
  Loader2, Plus, Search, FolderOpen,
  SortAsc, SortDesc, ChevronDown,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { useDocForge, useBureau, useChantiers, useProjets, useMissions } from "../../../api/hooks";
import { useCanvasActions } from "../../../context/CanvasActionContext";
import { useFrameMaster } from "../../../context/FrameMasterContext";
import { BOT_INFO } from "./section-config";
import { BotBadgeFull } from "./BotBadgeFull";
import { NavigationToolbar } from "./NavigationToolbar";
import type { NavMode, BreadcrumbItem } from "./NavigationToolbar";
import { DOCUMENT_TYPE_CONFIG } from "../../../api/types";
import type { DocumentTypeId } from "../../../api/types";

/* ═══════════════════════════════════════════ */
/* TYPES                                       */
/* ═══════════════════════════════════════════ */

type DocType = "docforge" | "importe";
type DocStatus = "brouillon" | "en_cours" | "review" | "publie" | "importe";
type ViewMode = "cards" | "list" | "kanban" | "spreadsheet";
type SortField = "titre" | "date" | "statut" | "type" | "bot" | "progression";
type SortDir = "asc" | "desc";

interface UnifiedDoc {
  id: string;
  titre: string;
  description: string;
  type: DocType;
  status: DocStatus;
  bot: string | null;
  chantier_id: number | null;
  projet_id: number | null;
  completude_pct: number;
  nb_blocs: number;
  file_type: string | null;
  taille: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  _raw: unknown;
}

/* ═══════════════════════════════════════════ */
/* STATUS CONFIG                               */
/* ═══════════════════════════════════════════ */

const STATUS_LABELS: Record<DocStatus, string> = {
  brouillon: "Brouillon", en_cours: "En cours", review: "A reviser", publie: "Publie", importe: "Importe",
};

const STATUS_COLORS: Record<DocStatus, string> = {
  brouillon: "bg-gray-100 text-gray-600 border-gray-200", en_cours: "bg-blue-100 text-blue-700 border-blue-200",
  review: "bg-amber-100 text-amber-700 border-amber-200", publie: "bg-green-100 text-green-700 border-green-200",
  importe: "bg-slate-100 text-slate-600 border-slate-200",
};

const TYPE_COLORS: Record<DocType, { bg: string; text: string; gradient: string }> = {
  docforge: { bg: "bg-teal-50", text: "text-teal-600", gradient: "from-teal-600 to-teal-500" },
  importe: { bg: "bg-slate-50", text: "text-slate-600", gradient: "from-slate-600 to-slate-500" },
};

const TYPE_LABELS: Record<DocType, string> = { docforge: "Genere", importe: "Importe" };
const TYPE_ICONS: Record<DocType, React.ElementType> = { docforge: Sparkles, importe: Upload };

const KANBAN_COLS: { key: DocStatus; label: string; color: string }[] = [
  { key: "brouillon", label: "Brouillon", color: "border-t-gray-400" },
  { key: "en_cours", label: "En cours", color: "border-t-blue-500" },
  { key: "review", label: "A reviser", color: "border-t-amber-500" },
  { key: "publie", label: "Publie", color: "border-t-emerald-500" },
  { key: "importe", label: "Importe", color: "border-t-slate-400" },
];

/* ═══════════════════════════════════════════ */
/* COMPOSANT PRINCIPAL                         */
/* ═══════════════════════════════════════════ */

interface DocumentsUnifieProps {
  botFilter?: string;
  onAction?: (doc: UnifiedDoc) => void;
  hideHeader?: boolean;
  typeFilter?: "docforge" | "importe";
  /** Navigation mode imposed by parent */
  navMode?: NavMode;
}

export function DocumentsUnifie({ botFilter, onAction, hideHeader, typeFilter: typeFilterProp, navMode: navModeProp }: DocumentsUnifieProps) {
  const { libraries, loading: dfLoading, deleteLibrary } = useDocForge();
  const { items: bureauDocs, loading: buLoading } = useBureau("document");
  const { chantiers: allChantiers } = useChantiers();
  const { projets: allProjets } = useProjets();
  const { missions: allMissions } = useMissions();
  const { dispatch } = useCanvasActions();
  const { setActiveView } = useFrameMaster();

  // Navigation state
  const [navModeLocal, setNavModeLocal] = useState<NavMode>("tous");
  const navMode = navModeProp || navModeLocal;
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

  // Reset state when parent changes sub-tab
  useEffect(() => {
    setBreadcrumb([]);
    setBotFilterLocal(null);
    setTypeFilter(null);
    setCategoryFilter(null);
    setStatusFilter(null);
  }, [navModeProp]);

  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilterLocal, setTypeFilter] = useState<DocType | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const typeFilter = typeFilterProp || typeFilterLocal;
  const [botFilterLocal, setBotFilterLocal] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const chantierMap = useMemo(() => {
    const m = new Map<number, string>();
    allChantiers.forEach(ch => m.set(ch.id, ch.titre));
    return m;
  }, [allChantiers]);

  // ─── Unify data sources ───
  const allDocs = useMemo<UnifiedDoc[]>(() => {
    const unified: UnifiedDoc[] = [];
    for (const lib of libraries) {
      const st = (lib.status === "draft" ? "brouillon" : lib.status) as DocStatus;
      unified.push({
        id: `df-${lib.id}`, titre: lib.titre, description: lib.description || "",
        type: "docforge", status: st === "publie" || st === "en_cours" || st === "review" || st === "brouillon" ? st : "en_cours",
        bot: lib.bot_primaire || null, chantier_id: lib.chantier_id, projet_id: lib.projet_id,
        completude_pct: lib.completude_pct || 0, nb_blocs: lib.nb_blocs || 0,
        file_type: null, taille: null, tags: lib.tags || [],
        created_at: lib.created_at, updated_at: lib.updated_at, _raw: lib,
      });
    }
    for (const doc of bureauDocs) {
      const meta = (doc.metadata || {}) as Record<string, any>;
      unified.push({
        id: `bu-${doc.id}`, titre: doc.titre, description: doc.description || "",
        type: "importe", status: "importe",
        bot: doc.bot || null, chantier_id: doc.chantier_id || null, projet_id: doc.projet_id || null,
        completude_pct: 100, nb_blocs: 0,
        file_type: meta.file_type || null, taille: meta.taille || null,
        tags: doc.tags || [], created_at: doc.created_at, updated_at: doc.updated_at, _raw: doc,
      });
    }
    return unified;
  }, [libraries, bureauDocs]);

  // ─── Drill-down filter ───
  const drillFilter = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : null;

  // ─── Filter + Sort ───
  const filtered = useMemo(() => {
    let result = allDocs;
    if (botFilter && botFilter !== "CEOB") result = result.filter(d => !d.bot || d.bot === botFilter);
    if (botFilterLocal) result = result.filter(d => d.bot === botFilterLocal);
    if (drillFilter) {
      if (drillFilter.level === "chantier") {
        if (drillFilter.id === -1) result = result.filter(d => !d.chantier_id);
        else result = result.filter(d => d.chantier_id === drillFilter.id);
      } else if (drillFilter.level === "projet") {
        if (drillFilter.id === -1) result = result.filter(d => !d.projet_id);
        else result = result.filter(d => d.projet_id === drillFilter.id);
      }
    }
    if (statusFilter) result = result.filter(d => d.status === statusFilter);
    if (typeFilter) result = result.filter(d => d.type === typeFilter);
    if (categoryFilter) result = result.filter(d => d.tags.includes(categoryFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.titre.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "titre": cmp = a.titre.localeCompare(b.titre, "fr"); break;
        case "date": cmp = (a.updated_at || "").localeCompare(b.updated_at || ""); break;
        case "statut": cmp = a.status.localeCompare(b.status); break;
        case "type": cmp = a.type.localeCompare(b.type); break;
        case "bot": cmp = (a.bot || "").localeCompare(b.bot || ""); break;
        case "progression": cmp = a.completude_pct - b.completude_pct; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [allDocs, botFilter, botFilterLocal, drillFilter, statusFilter, typeFilter, categoryFilter, search, sortField, sortDir]);

  // ─── Base items (before nav filters, for counts) ───
  const baseItems = useMemo(() => {
    let items = allDocs;
    if (botFilter && botFilter !== "CEOB") items = items.filter(d => !d.bot || d.bot === botFilter);
    return items;
  }, [allDocs, botFilter]);

  const counts = useMemo(() => ({
    total: baseItems.length,
    brouillon: baseItems.filter(d => d.status === "brouillon").length,
    en_cours: baseItems.filter(d => d.status === "en_cours").length,
    publie: baseItems.filter(d => d.status === "publie").length,
    importe: baseItems.filter(d => d.status === "importe").length,
    docforge: baseItems.filter(d => d.type === "docforge").length,
    importeType: baseItems.filter(d => d.type === "importe").length,
  }), [baseItems]);


  // ─── Unique bots (for secondary filter) ───
  const uniqueBots = useMemo(() => {
    const bots = new Set<string>();
    baseItems.forEach(d => { if (d.bot) bots.add(d.bot); });
    return Array.from(bots).sort();
  }, [baseItems]);

  // ─── Chantier groups ───
  const chantierGroups = useMemo(() => {
    const groups: { chantierId: number; titre: string; count: number }[] = [];
    const parentIds = new Set<number>();
    baseItems.forEach(d => { if (d.chantier_id) parentIds.add(d.chantier_id); });
    parentIds.forEach(cid => {
      groups.push({ chantierId: cid, titre: chantierMap.get(cid) || `Chantier #${cid}`, count: baseItems.filter(d => d.chantier_id === cid).length });
    });
    return groups.sort((a, b) => b.count - a.count);
  }, [baseItems, chantierMap]);

  // ─── Projet groups ───
  const projetGroups = useMemo(() => {
    const groups: { projetId: number; titre: string; count: number }[] = [];
    const projetIds = new Set<number>();
    baseItems.forEach(d => { if (d.projet_id) projetIds.add(d.projet_id); });
    projetIds.forEach(pid => {
      const p = allProjets.find((pr: any) => pr.id === pid);
      groups.push({ projetId: pid, titre: p?.titre || `Projet #${pid}`, count: baseItems.filter(d => d.projet_id === pid).length });
    });
    return groups.sort((a, b) => b.count - a.count);
  }, [baseItems, allProjets]);

  // ─── Mission groups (via projet→missions) ───
  const missionGroups = useMemo(() => {
    const groups: { missionId: number; titre: string; count: number }[] = [];
    // Documents don't have direct mission_id, derive from projet
    // For now show missions that have documents in their projet
    const missionMap = new Map<number, { titre: string; projetId: number }>();
    allMissions.forEach((m: any) => missionMap.set(m.id, { titre: m.titre, projetId: m.projet_id }));
    // Group placeholder — documents link to projets, not missions directly
    // Show "Par Mission" as future feature
    return groups;
  }, [allMissions]);

  // ─── Navigation handlers ───
  const handleModeChange = (mode: NavMode) => {
    if (!navModeProp) setNavModeLocal(mode);
    setBreadcrumb([]);
    setStatusFilter(null);
    setBotFilterLocal(null);
    setTypeFilter(null);
    setCategoryFilter(null);
  };

  const handleBack = () => {
    if (breadcrumb.length > 0) setBreadcrumb(prev => prev.slice(0, -1));
  };

  // ─── Handlers ───
  const handleClick = (doc: UnifiedDoc) => {
    if (onAction) { onAction(doc); return; }
    if (doc.type === "docforge") {
      const lib = doc._raw as any;
      dispatch({ type: "focus", layer: "cerveau", data: { title: doc.titre, element_type: "document_editor", data: { library: lib, mode: "library" } }, bot: doc.bot || "CPOB" });
    } else if (doc.type === "importe") {
      const bu = doc._raw as any;
      const meta = bu.metadata || {};
      if (meta.file_path) window.open(api.bureauDownloadUrl(meta.file_path), "_blank");
    }
  };

  const handleCreate = () => {
    dispatch({ type: "focus", layer: "cerveau", data: { title: "Nouveau document", element_type: "document_editor", data: { mode: "scratch" } }, bot: botFilter || "CPOB" });
  };

  const handleDelete = (doc: UnifiedDoc) => {
    if (doc.type === "docforge") {
      const lib = doc._raw as any;
      deleteLibrary(lib.id);
    }
  };

  const loading = dfLoading || buLoading;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement des documents...</span>
      </div>
    );
  }

  const formatDate = (d: string) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }); } catch { return "—"; }
  };

  /* ═══════════════════════════════════════════ */
  /* RENDER HELPERS                              */
  /* ═══════════════════════════════════════════ */

  const renderCard = (doc: UnifiedDoc) => {
    const tc = TYPE_COLORS[doc.type];
    const TypeIcon = TYPE_ICONS[doc.type];
    const botInfo = doc.bot ? BOT_INFO[doc.bot] : null;

    return (
      <div key={doc.id} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => handleClick(doc)}>
        <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2", tc.gradient)}>
          <TypeIcon className="h-3.5 w-3.5 text-white shrink-0" />
          <p className="text-xs font-bold text-white truncate flex-1">{doc.titre}</p>
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", STATUS_COLORS[doc.status])}>{STATUS_LABELS[doc.status]}</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white shrink-0" />
        </div>
        <div className="px-3 py-2.5">
          {doc.description && <p className="text-[9px] text-gray-500 line-clamp-1 mb-1">{doc.description}</p>}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", tc.bg, tc.text)}>{TYPE_LABELS[doc.type]}</span>
            {doc.bot && <BotBadgeFull botCode={doc.bot} />}
            {doc.file_type && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{doc.file_type}</span>}
            {doc.taille && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{doc.taille}</span>}
          </div>
          {doc.type === "docforge" && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className={cn("h-2 rounded-full transition-all", doc.completude_pct >= 100 ? "bg-emerald-500" : doc.completude_pct > 0 ? "bg-blue-500" : "bg-gray-300")} style={{ width: `${Math.min(doc.completude_pct, 100)}%` }} />
              </div>
              <span className="text-[9px] font-bold text-gray-500">{doc.completude_pct}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListItem = (doc: UnifiedDoc) => {
    const tc = TYPE_COLORS[doc.type];
    const TypeIcon = TYPE_ICONS[doc.type];

    return (
      <div key={doc.id} onClick={() => handleClick(doc)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer group">
        <div className={cn("w-2 h-2 rounded-full shrink-0", doc.status === "publie" ? "bg-emerald-500" : doc.status === "en_cours" ? "bg-blue-500" : doc.status === "review" ? "bg-amber-400" : "bg-gray-300")} />
        <TypeIcon className={cn("h-3.5 w-3.5 shrink-0", tc.text)} />
        <span className="text-[9px] font-bold text-gray-800 flex-1 truncate">{doc.titre}</span>
        {doc.bot && <BotBadgeFull botCode={doc.bot} />}
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", STATUS_COLORS[doc.status])}>{STATUS_LABELS[doc.status]}</span>
        {doc.type === "docforge" && <span className="text-[8px] text-gray-400">{doc.completude_pct}%</span>}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all">
          <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-500" />
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
      </div>
    );
  };

  /* ═══════════════════════════════════════════ */
  /* MAIN JSX                                    */
  /* ═══════════════════════════════════════════ */

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 rounded-lg flex items-center gap-3">
          <FileText className="h-5 w-5 text-white shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">Documents</h2>
            <p className="text-[9px] text-white/70">{filtered.length} document{filtered.length > 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* ── Breadcrumb (drill-down) ── */}
      <NavigationToolbar breadcrumb={breadcrumb} onBack={handleBack} />

      {/* ══ TOOLBAR — search + filters + view modes ══ */}
      {(navMode === "tous" || navMode === "templates" || breadcrumb.length > 0 || navMode === "par-chantier" || navMode === "par-projet" || navMode === "par-mission" || navMode === "par-tache") && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="text" placeholder="Rechercher documents..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{filtered.length} items</span>
            <SortDropdown sortField={sortField} sortDir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} />
            <button onClick={handleCreate} className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Creer
            </button>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {([["cards", LayoutGrid], ["list", List], ["kanban", Columns], ["spreadsheet", Table2]] as [ViewMode, React.ElementType][]).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Status + Type filter pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {[
                { val: null as string | null, label: "Tous", count: counts.total },
                { val: "en_cours", label: "En cours", count: counts.en_cours },
                { val: "brouillon", label: "Brouillon", count: counts.brouillon },
                { val: "publie", label: "Publies", count: counts.publie },
                { val: "importe", label: "Importes", count: counts.importe },
              ].map(chip => (
                <button key={chip.val ?? "all"} onClick={() => setStatusFilter(chip.val)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                    statusFilter === chip.val ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                  {chip.label} ({chip.count})
                </button>
              ))}
            </div>
            {!typeFilterProp && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Type:</span>
                {[
                  { val: null as DocType | null, label: "Tous" },
                  { val: "docforge" as DocType, label: `Generes (${counts.docforge})` },
                  { val: "importe" as DocType, label: `Importes (${counts.importeType})` },
                ].map(chip => (
                  <button key={chip.val ?? "all-type"} onClick={() => setTypeFilter(chip.val)}
                    className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                      typeFilter === chip.val ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
            {uniqueBots.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Agent:</span>
                <button onClick={() => setBotFilterLocal(null)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                    !botFilterLocal ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                  Tous
                </button>
                {uniqueBots.map(bot => {
                  const info = BOT_INFO[bot];
                  return (
                    <button key={bot} onClick={() => setBotFilterLocal(bot)}
                      className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                        botFilterLocal === bot ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                      {info?.label || bot}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-gray-400 font-medium">Categorie:</span>
              {([
                { val: null as string | null, label: "Toutes" },
                { val: "strategique", label: "Strategique" },
                { val: "operationnel", label: "Operationnel" },
                { val: "conformite", label: "Conformite" },
                { val: "diagnostic", label: "Diagnostic" },
              ]).map(chip => (
                <button key={chip.val ?? "all-cat"} onClick={() => setCategoryFilter(chip.val)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                    categoryFilter === chip.val ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══ MODE: PAR CHANTIER — cards chantiers ══ */}
      {navMode === "par-chantier" && breadcrumb.length === 0 && (
        chantierGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <Inbox className="h-8 w-8" />
            <span className="text-sm">Aucun document rattache a un chantier</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {chantierGroups.map(g => (
              <button key={g.chantierId}
                onClick={() => setBreadcrumb([{ level: "chantier", id: g.chantierId, titre: g.titre }])}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer text-left group">
                <FolderOpen className="h-4 w-4 text-teal-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate group-hover:text-teal-700">{g.titre}</p>
                  <p className="text-[9px] text-gray-400">{g.count} document{g.count > 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-teal-500 shrink-0" />
              </button>
            ))}
          </div>
        )
      )}

      {/* ══ MODE: PAR PROJET — cards projets pour drill-down ══ */}
      {navMode === "par-projet" && breadcrumb.length === 0 && (
        projetGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <Inbox className="h-8 w-8" />
            <span className="text-sm">Aucun document rattache a un projet</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {projetGroups.map(g => (
              <button key={g.projetId}
                onClick={() => setBreadcrumb([{ level: "projet", id: g.projetId, titre: g.titre }])}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all cursor-pointer text-left group">
                <FolderOpen className="h-4 w-4 text-violet-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate group-hover:text-violet-700">{g.titre}</p>
                  <p className="text-[9px] text-gray-400">{g.count} document{g.count > 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-500 shrink-0" />
              </button>
            ))}
          </div>
        )
      )}

      {/* ══ MODE: PAR MISSION — empty state (pas de mission_id sur les docs pour l'instant) ══ */}
      {navMode === "par-mission" && breadcrumb.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">Aucun document rattache a une mission</span>
        </div>
      )}

      {/* ══ MODE: PAR TACHE — empty state ══ */}
      {navMode === "par-tache" && breadcrumb.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">Aucun document rattache a une tache</span>
        </div>
      )}

      {/* ══ CONTENT (tous mode, drilled down, filtered, or templates) ══ */}
      {(navMode === "tous" || navMode === "templates" || breadcrumb.length > 0 || botFilterLocal || typeFilterLocal) && (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">{search ? `Aucun resultat pour "${search}"` : "Aucun document"}</span>
              <span className="text-[9px] text-gray-300">Creez un document ou importez-en un</span>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{filtered.map(renderCard)}</div>
          ) : viewMode === "list" ? (
            <div className="space-y-1">{filtered.map(renderListItem)}</div>
          ) : viewMode === "kanban" ? (
            <div className="grid grid-cols-5 gap-2 overflow-x-auto">
              {KANBAN_COLS.map(col => {
                const colDocs = filtered.filter(d => d.status === col.key);
                return (
                  <div key={col.key} className={cn("border rounded-lg bg-gray-50/50 min-w-[180px]", `border-t-2 ${col.color}`)}>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">{col.label}</span>
                      <span className="text-[9px] font-bold text-gray-400">{colDocs.length}</span>
                    </div>
                    <div className="px-2 pb-2 space-y-2 max-h-[500px] overflow-auto">{colDocs.map(renderCard)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto bg-white">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <SortTh field="titre" current={sortField} dir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} w="w-[35%]">Titre</SortTh>
                    <SortTh field="type" current={sortField} dir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} w="w-[10%]">Type</SortTh>
                    <SortTh field="statut" current={sortField} dir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} w="w-[10%]">Statut</SortTh>
                    <SortTh field="bot" current={sortField} dir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} w="w-[12%]">Bot</SortTh>
                    <SortTh field="progression" current={sortField} dir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} w="w-[12%]">Progres</SortTh>
                    <th className="text-left px-2 py-2 text-[9px] font-bold text-gray-500 uppercase w-[10%]">Taille</th>
                    <SortTh field="date" current={sortField} dir={sortDir} onSort={(f, d) => { setSortField(f); setSortDir(d); }} w="w-[10%]">Date</SortTh>
                    <th className="w-[3%]" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => {
                    const tc = TYPE_COLORS[doc.type];
                    return (
                      <tr key={doc.id} onClick={() => handleClick(doc)} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer group">
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            {React.createElement(TYPE_ICONS[doc.type], { className: cn("h-3.5 w-3.5 shrink-0", tc.text) })}
                            <span className="text-[9px] font-medium text-gray-800 truncate">{doc.titre}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5"><span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", tc.bg, tc.text)}>{TYPE_LABELS[doc.type]}</span></td>
                        <td className="px-2 py-1.5"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", STATUS_COLORS[doc.status])}>{STATUS_LABELS[doc.status]}</span></td>
                        <td className="px-2 py-1.5">{doc.bot ? <BotBadgeFull botCode={doc.bot} compact /> : <span className="text-[9px] text-gray-300">—</span>}</td>
                        <td className="px-2 py-1.5">
                          {doc.type === "docforge" ? (
                            <div className="flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", doc.completude_pct >= 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${Math.min(doc.completude_pct, 100)}%` }} />
                              </div>
                              <span className="text-[8px] text-gray-500">{doc.completude_pct}%</span>
                            </div>
                          ) : <span className="text-[8px] text-gray-300">—</span>}
                        </td>
                        <td className="px-2 py-1.5"><span className="text-[8px] text-gray-500">{doc.taille || "—"}</span></td>
                        <td className="px-2 py-1.5"><span className="text-[8px] text-gray-500">{formatDate(doc.updated_at)}</span></td>
                        <td className="px-2 py-1.5">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded transition-all">
                            <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* HELPER: Sort dropdown                       */
/* ═══════════════════════════════════════════ */

function SortDropdown({ sortField, sortDir, onSort }: { sortField: SortField; sortDir: SortDir; onSort: (f: SortField, d: SortDir) => void }) {
  const [open, setOpen] = useState(false);
  const options: { field: SortField; label: string }[] = [
    { field: "titre", label: "Nom" }, { field: "date", label: "Date" },
    { field: "statut", label: "Statut" }, { field: "type", label: "Type" }, { field: "progression", label: "Progression" },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
        {sortDir === "asc" ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
          {options.map(opt => (
            <button key={opt.field} onClick={() => { onSort(opt.field, sortField === opt.field && sortDir === "asc" ? "desc" : "asc"); setOpen(false); }}
              className={cn("w-full text-left px-3 py-1.5 text-[9px] font-medium hover:bg-gray-50 transition-colors cursor-pointer", sortField === opt.field ? "text-blue-600 bg-blue-50" : "text-gray-600")}>
              {opt.label} {sortField === opt.field && (sortDir === "asc" ? "↑" : "↓")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* HELPER: Sortable table header               */
/* ═══════════════════════════════════════════ */

function SortTh({ field, current, dir, onSort, w, children }: {
  field: SortField; current: SortField; dir: SortDir;
  onSort: (f: SortField, d: SortDir) => void; w: string; children: React.ReactNode;
}) {
  const active = current === field;
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={cn("text-left px-2 py-2 text-[9px] font-bold uppercase cursor-pointer select-none hover:bg-gray-100 transition-colors", w, active ? "text-blue-500" : "text-gray-500")}
      onClick={() => onSort(field, active && dir === "asc" ? "desc" : "asc")}>
      <div className="flex items-center gap-1">
        {children}
        <Icon className={cn("h-3.5 w-3.5", active ? "text-blue-500" : "text-gray-300")} />
      </div>
    </th>
  );
}
