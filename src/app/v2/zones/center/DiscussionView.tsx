/**
 * DiscussionView.tsx — Mes Discussions (harmonise S71)
 * MEME DESIGN que chantier/projet/mission/tache (HierarchieTab pattern)
 * NavigationToolbar: Par Chantier | Par Bot | Par Type | Par Statut | Tous
 * BotBadgeFull: "Tim — CTO" partout
 * 4 vues: Cards, List, Kanban (colonnes par status), Spreadsheet
 * CREDO phase, branches, promotion en mission, archivage
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  MessageSquare, PlusCircle, Trash2,
  Link2, AlertCircle, Rocket, Archive,
  Search, LayoutGrid, List, Table2, Columns, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronRight, FolderOpen,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChantiers, useProjets, useMissions } from "../../api/hooks";
import { api } from "../../api/client";
import type { Thread } from "../../api/types";
import { BOT_NAME, BOT_ROLE, classifyThread, DISCUSSION_TYPE_CONFIG } from "../../api/types";
import type { DiscussionTypeId } from "../../api/types";
import { BotBadgeFull } from "./shared/BotBadgeFull";
import { NavigationToolbar } from "./shared/NavigationToolbar";
import type { NavMode, BreadcrumbItem } from "./shared/NavigationToolbar";
import { BOT_INFO } from "./shared/section-config";

// ── Discussion type → category mapping ──
const TYPE_TO_CATEGORY: Record<string, string> = {
  operationnel: "operationnel", reflexion: "strategique", blueprint: "strategique",
  focus: "operationnel", conference: "operationnel", vision: "strategique",
  code: "operationnel", document: "operationnel", libre: "operationnel",
};

// ── Bot gradient map (for card headers) ──
const BOT_GRADIENTS: Record<string, string> = {
  CEOB: "from-blue-600 to-blue-500", CTOB: "from-violet-600 to-violet-500",
  CFOB: "from-emerald-600 to-emerald-500", CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500", COOB: "from-orange-600 to-orange-500",
  CPOB: "from-slate-600 to-slate-500", CHROB: "from-teal-600 to-teal-500",
  CINOB: "from-rose-600 to-rose-500", CROB: "from-amber-600 to-amber-500",
  CLOB: "from-indigo-600 to-indigo-500", CISOB: "from-zinc-600 to-zinc-500",
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

// ── CREDO dots ──
const CREDO_PHASES = ["C", "R", "E", "D", "O"];
const PHASE_COLORS: Record<string, string> = {
  C: "bg-blue-400", R: "bg-emerald-400", E: "bg-amber-400", D: "bg-orange-400", O: "bg-red-400",
};

function CREDODots({ currentPhase }: { currentPhase?: string }) {
  const phaseIdx = currentPhase ? CREDO_PHASES.indexOf(currentPhase) : -1;
  return (
    <div className="flex items-center gap-0.5">
      {CREDO_PHASES.map((p, i) => (
        <span key={p} className={cn("w-1.5 h-1.5 rounded-full", i <= phaseIdx ? PHASE_COLORS[p] : "bg-gray-200")} title={`Phase ${p}`} />
      ))}
    </div>
  );
}

// ── Status badge ──
const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  active:    { label: "Active",   bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  parked:    { label: "Parquee",  bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  completed: { label: "Terminee", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  resolved:  { label: "Resolue",  bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  rejected:  { label: "Rejetee",  bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
  archived:  { label: "Archivee", bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200" },
};

type SortField = "titre" | "date" | "phase" | "echanges" | "bot" | "type";
type SortDir = "asc" | "desc";
type ViewMode = "cards" | "list" | "kanban" | "spreadsheet";

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════

interface DiscussionViewProps {
  botFilter?: string;
  chantierId?: number;
  hideHeader?: boolean;
  /** Navigation mode imposed by parent (sub-tabs in DepartmentTourDeControle) */
  navMode?: NavMode;
}

export function DiscussionView({ botFilter, chantierId, hideHeader, navMode: navModeProp }: DiscussionViewProps = {}) {
  const {
    threads, activeThreadId,
    parkThread, resumeThread, deleteThread, newConversation,
  } = useChatContext();
  const { setActiveView } = useFrameMaster();
  const { chantiers } = useChantiers();
  const { projets } = useProjets();
  const { missions } = useMissions();

  // Navigation state
  const [navModeLocal, setNavModeLocal] = useState<NavMode>("tous");
  const navMode = navModeProp || navModeLocal;
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

  // Reset state when parent changes sub-tab
  useEffect(() => {
    setBreadcrumb([]);
    setBotFilterLocal(null);
    setTypeFilterLocal(null);
    setCategoryFilter(null);
    setStatusFilter(null);
  }, [navModeProp]);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [botFilterLocal, setBotFilterLocal] = useState<string | null>(null);
  const [typeFilterLocal, setTypeFilterLocal] = useState<DiscussionTypeId | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [promoting, setPromoting] = useState<string | null>(null);

  const goToChat = () => setActiveView("live-chat");

  const handleAction = (threadId: string, action: "continuer" | "reprendre" | "revoir") => {
    if (action === "reprendre" || action === "revoir") resumeThread(threadId);
    goToChat();
  };

  const handlePromote = useCallback(async (thread: Thread) => {
    if (promoting) return;
    setPromoting(thread.id);
    try {
      const createRes = await api.createDiscussion({
        external_id: thread.id,
        titre: thread.title,
        bot_primaire: thread.primaryBot,
        section: thread.flowSection,
        flow_type: thread.flowType,
      }).catch(() => null);

      let dbId = createRes?.id;
      if (!dbId) {
        const all = await api.listDiscussions();
        const found = all.find((d: any) => d.external_id === thread.id);
        dbId = found?.id;
      }
      if (!dbId) return;

      const res = await api.promoteDiscussion(dbId, thread.title);
      if (res?.mission_id) parkThread(thread.id);
    } catch (err) {
      console.error("Erreur promotion:", err);
    } finally {
      setPromoting(null);
    }
  }, [promoting, parkThread]);

  const handleArchive = useCallback(async (thread: Thread) => {
    try {
      const createRes = await api.createDiscussion({
        external_id: thread.id,
        titre: thread.title,
        bot_primaire: thread.primaryBot,
      }).catch(() => null);

      let dbId = createRes?.id;
      if (!dbId) {
        const all = await api.listDiscussions();
        const found = all.find((d: any) => d.external_id === thread.id);
        dbId = found?.id;
      }
      if (dbId) await api.archiveDiscussion(dbId);
      parkThread(thread.id);
    } catch (err) {
      console.error("Erreur archivage:", err);
    }
  }, [parkThread]);

  // ── Enrich threads with type ──
  const enriched = useMemo(() =>
    threads.map(t => ({ ...t, _type: classifyThread(t) })),
    [threads]
  );

  // ── Drill-down filter from breadcrumb ──
  const drillFilter = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : null;

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    let items = [...enriched];

    if (botFilter) items = items.filter(t => t.primaryBot === botFilter);
    if (botFilterLocal) items = items.filter(t => t.primaryBot === botFilterLocal);
    if (typeFilterLocal) items = items.filter(t => t._type === typeFilterLocal);
    if (categoryFilter) items = items.filter(t => TYPE_TO_CATEGORY[t._type] === categoryFilter);

    // Drill-down filter
    if (drillFilter) {
      if (drillFilter.level === "chantier") {
        if (drillFilter.id === -1) items = items.filter(t => !t.parentChantier);
        else items = items.filter(t => Number(t.parentChantier) === drillFilter.id);
      } else if (drillFilter.level === "projet") {
        if (drillFilter.id === -1) items = items.filter(t => !t.missionId);
        else {
          // Find missions belonging to this projet
          const missionIdsForProjet = new Set(missions.filter((m: any) => m.projet_id === drillFilter.id).map((m: any) => m.id));
          items = items.filter(t => t.missionId && missionIdsForProjet.has(Number(t.missionId)));
        }
      } else if (drillFilter.level === "mission") {
        if (drillFilter.id === -1) items = items.filter(t => !t.missionId);
        else items = items.filter(t => Number(t.missionId) === drillFilter.id);
      }
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === "en-cours") items = items.filter(t => t.status === "active");
      else if (statusFilter === "en-attente") items = items.filter(t => t.status === "parked");
      else if (statusFilter === "terminees") items = items.filter(t => t.status === "completed" || t.status === "resolved" || t.status === "rejected");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (BOT_NAME[t.primaryBot] || "").toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "titre": cmp = a.title.localeCompare(b.title); break;
        case "date": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
        case "phase": cmp = (CREDO_PHASES.indexOf(a.credoPhase || "C")) - (CREDO_PHASES.indexOf(b.credoPhase || "C")); break;
        case "echanges": cmp = a.messages.filter(m => m.role === "user").length - b.messages.filter(m => m.role === "user").length; break;
        case "bot": cmp = a.primaryBot.localeCompare(b.primaryBot); break;
        case "type": cmp = a._type.localeCompare(b._type); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [enriched, botFilter, botFilterLocal, typeFilterLocal, categoryFilter, drillFilter, statusFilter, search, sortField, sortDir, missions]);

  // ── Counts ──
  const baseItems = useMemo(() => {
    let items = enriched;
    if (botFilter) items = items.filter(t => t.primaryBot === botFilter);
    return items;
  }, [enriched, botFilter]);

  const counts = useMemo(() => ({
    all: baseItems.length,
    "en-cours": baseItems.filter(t => t.status === "active").length,
    "en-attente": baseItems.filter(t => t.status === "parked").length,
    terminees: baseItems.filter(t => t.status === "completed" || t.status === "resolved" || t.status === "rejected").length,
  }), [baseItems]);

  // ── Unique bots (for secondary filter) ──
  const uniqueBots = useMemo(() => {
    const bots = new Set<string>();
    baseItems.forEach(t => { if (t.primaryBot) bots.add(t.primaryBot); });
    return Array.from(bots).sort();
  }, [baseItems]);

  // ── Type counts (for secondary filter) ──
  const typeCounts = useMemo(() => {
    const map = new Map<DiscussionTypeId, number>();
    baseItems.forEach(t => map.set(t._type, (map.get(t._type) || 0) + 1));
    return map;
  }, [baseItems]);

  // ── Chantier groups ──
  const chantierGroups = useMemo(() => {
    const groups: { chantierId: number; titre: string; count: number }[] = [];
    const parentIds = new Set<number>();
    baseItems.forEach(t => { if (t.parentChantier) parentIds.add(Number(t.parentChantier)); });
    parentIds.forEach(cid => {
      const ch = chantiers.find((c: any) => c.id === cid);
      groups.push({ chantierId: cid, titre: ch?.titre || `Chantier #${cid}`, count: baseItems.filter(t => Number(t.parentChantier) === cid).length });
    });
    return groups.sort((a, b) => b.count - a.count);
  }, [baseItems, chantiers]);

  // ── Projet groups (threads linked via mission→projet) ──
  const projetGroups = useMemo(() => {
    const groups: { projetId: number; titre: string; count: number }[] = [];
    // Build mission→projet map
    const missionToProjet = new Map<number, number>();
    missions.forEach((m: any) => { if (m.projet_id) missionToProjet.set(m.id, m.projet_id); });
    // Count threads per projet
    const projetCounts = new Map<number, number>();
    let orphanCount = 0;
    baseItems.forEach(t => {
      const mid = t.missionId ? Number(t.missionId) : null;
      const pid = mid ? missionToProjet.get(mid) : null;
      if (pid) projetCounts.set(pid, (projetCounts.get(pid) || 0) + 1);
      else orphanCount++;
    });
    projetCounts.forEach((count, pid) => {
      const p = projets.find((pr: any) => pr.id === pid);
      groups.push({ projetId: pid, titre: p?.titre || `Projet #${pid}`, count });
    });
    return groups.sort((a, b) => b.count - a.count);
  }, [baseItems, missions, projets]);

  // ── Mission groups ──
  const missionGroups = useMemo(() => {
    const groups: { missionId: number; titre: string; count: number }[] = [];
    const missionIds = new Set<number>();
    baseItems.forEach(t => { if (t.missionId) missionIds.add(Number(t.missionId)); });
    missionIds.forEach(mid => {
      const m = missions.find((mi: any) => mi.id === mid);
      groups.push({ missionId: mid, titre: m?.titre || `Mission #${mid}`, count: baseItems.filter(t => Number(t.missionId) === mid).length });
    });
    return groups.sort((a, b) => b.count - a.count);
  }, [baseItems, missions]);

  // ── Navigation handlers ──
  const handleModeChange = (mode: NavMode) => {
    if (!navModeProp) setNavModeLocal(mode);
    setBreadcrumb([]);
    setBotFilterLocal(null);
    setTypeFilterLocal(null);
    setCategoryFilter(null);
    setStatusFilter(null);
  };

  const handleDrillDown = (level: string, id: number, titre: string) => {
    setBreadcrumb(prev => [...prev, { level, id, titre }]);
  };

  const handleBack = () => {
    setBreadcrumb(prev => prev.slice(0, -1));
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

  return (
    <div className="space-y-3 p-4">

      {/* ══ HEADER TITRE ══ */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-3 rounded-lg flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-white shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">Discussions</h2>
            <p className="text-xs text-white/70">{filtered.length} discussion{filtered.length > 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* ══ BREADCRUMB (drill-down) ══ */}
      <NavigationToolbar breadcrumb={breadcrumb} onBack={handleBack} />

      {/* ══ TOOLBAR — search + status + create + view modes ══ */}
      {(navMode === "tous" || breadcrumb.length > 0 || navMode === "par-chantier" || navMode === "par-projet" || navMode === "par-mission" || navMode === "par-tache") && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
            </div>

            <div className="flex items-center gap-1">
              {([
                { id: null, label: "Tous", count: counts.all },
                { id: "en-cours", label: "En cours", count: counts["en-cours"] },
                { id: "en-attente", label: "En attente", count: counts["en-attente"] },
                { id: "terminees", label: "Terminees", count: counts.terminees },
              ] as const).map(f => (
                <button key={f.id ?? "all"} onClick={() => setStatusFilter(f.id)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full border transition-colors cursor-pointer",
                    statusFilter === f.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <button onClick={() => { newConversation(); goToChat(); }}
              className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0">
              <PlusCircle className="h-3.5 w-3.5" /> Nouvelle
            </button>

            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {([
                { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
                { mode: "list" as const, icon: List, title: "Liste" },
                { mode: "kanban" as const, icon: Columns, title: "Kanban" },
                { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
              ]).map(({ mode, icon: Icon, title }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
                  title={title}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            <span className="text-[9px] font-bold text-gray-400">{filtered.length} items</span>
          </div>

          {/* ── Secondary filters: Agent + Type ── */}
          <div className="flex items-center gap-3 flex-wrap">
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
            {typeCounts.size > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Type:</span>
                <button onClick={() => setTypeFilterLocal(null)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                    !typeFilterLocal ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                  Tous
                </button>
                {Array.from(typeCounts.entries()).map(([typeId, count]) => {
                  const cfg = DISCUSSION_TYPE_CONFIG[typeId];
                  return (
                    <button key={typeId} onClick={() => setTypeFilterLocal(typeId)}
                      className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                        typeFilterLocal === typeId ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                      {cfg.emoji} {cfg.label} ({count})
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

      {/* ══ MODE: PAR CHANTIER — cards chantiers pour drill-down ══ */}
      {navMode === "par-chantier" && breadcrumb.length === 0 && (
        chantierGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <MessageSquare className="h-8 w-8" />
            <span className="text-sm">Aucune discussion rattachee a un chantier</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {chantierGroups.map(g => (
              <button key={g.chantierId}
                onClick={() => handleDrillDown("chantier", g.chantierId, g.titre)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all cursor-pointer text-left group">
                <FolderOpen className="h-4 w-4 text-cyan-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate group-hover:text-cyan-700">{g.titre}</p>
                  <p className="text-[9px] text-gray-400">{g.count} discussion{g.count > 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-cyan-500 shrink-0" />
              </button>
            ))}
          </div>
        )
      )}

      {/* ══ MODE: PAR PROJET — cards projets pour drill-down ══ */}
      {navMode === "par-projet" && breadcrumb.length === 0 && (
        projetGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <MessageSquare className="h-8 w-8" />
            <span className="text-sm">Aucune discussion rattachee a un projet</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {projetGroups.map(g => (
              <button key={g.projetId}
                onClick={() => handleDrillDown("projet", g.projetId, g.titre)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all cursor-pointer text-left group">
                <FolderOpen className="h-4 w-4 text-violet-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate group-hover:text-violet-700">{g.titre}</p>
                  <p className="text-[9px] text-gray-400">{g.count} discussion{g.count > 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-500 shrink-0" />
              </button>
            ))}
          </div>
        )
      )}

      {/* ══ MODE: PAR MISSION — cards missions pour drill-down ══ */}
      {navMode === "par-mission" && breadcrumb.length === 0 && (
        missionGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <MessageSquare className="h-8 w-8" />
            <span className="text-sm">Aucune discussion rattachee a une mission</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {missionGroups.map(g => (
              <button key={g.missionId}
                onClick={() => handleDrillDown("mission", g.missionId, g.titre)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer text-left group">
                <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate group-hover:text-amber-700">{g.titre}</p>
                  <p className="text-[9px] text-gray-400">{g.count} discussion{g.count > 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-amber-500 shrink-0" />
              </button>
            ))}
          </div>
        )
      )}

      {/* ══ MODE: PAR TACHE — empty state (pas de tache_id sur les threads pour l'instant) ══ */}
      {navMode === "par-tache" && breadcrumb.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <MessageSquare className="h-8 w-8" />
          <span className="text-sm">Aucune discussion rattachee a une tache</span>
        </div>
      )}

      {/* ══ STATS GRID ══ */}
      {!hideHeader && navMode === "tous" && (
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2.5 rounded-lg border bg-blue-50 border-blue-100">
            <div className="text-lg font-bold text-blue-600">{counts.all}</div>
            <div className="text-[9px] font-medium text-blue-600">TOTAL</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border bg-cyan-50 border-cyan-100">
            <div className="text-lg font-bold text-cyan-600">{counts["en-cours"]}</div>
            <div className="text-[9px] font-medium text-cyan-600">ACTIVES</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border bg-amber-50 border-amber-100">
            <div className="text-lg font-bold text-amber-600">{counts["en-attente"]}</div>
            <div className="text-[9px] font-medium text-amber-600">EN ATTENTE</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border bg-emerald-50 border-emerald-100">
            <div className="text-lg font-bold text-emerald-600">{counts.terminees}</div>
            <div className="text-[9px] font-medium text-emerald-600">TERMINEES</div>
          </div>
        </div>
      )}

      {/* ══ CONTENT (when showing items — tous mode, drilled down, or filtered) ══ */}
      {(navMode === "tous" || breadcrumb.length > 0 || botFilterLocal || typeFilterLocal) && (
        <>
          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">{search ? `Aucun resultat pour "${search}"` : "Aucune discussion"}</p>
              <p className="text-[9px] mt-1 opacity-70">Demarrez une discussion avec votre Bot Team C-Level</p>
            </div>
          )}

          {/* CARDS VIEW */}
          {viewMode === "cards" && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filtered.map(t => {
                const userMsgCount = t.messages.filter(m => m.role === "user").length;
                const sb = STATUS_BADGE[t.status] || STATUS_BADGE.active;
                const isActive = t.id === activeThreadId;
                const gradient = BOT_GRADIENTS[t.primaryBot] || "from-blue-600 to-blue-500";
                const typeCfg = DISCUSSION_TYPE_CONFIG[t._type];

                return (
                  <div key={t.id} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                    <div className={cn("px-3 py-2.5 flex items-center gap-2 bg-gradient-to-r", gradient)}>
                      <MessageSquare className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="text-xs font-bold text-white flex-1 truncate">{t.title}</span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", sb.bg, sb.text, sb.border)}>{sb.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
                      <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                    </div>

                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <BotBadgeFull botCode={t.primaryBot} />
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", typeCfg.color)}>
                          {typeCfg.emoji} {typeCfg.label}
                        </span>
                        <CREDODots currentPhase={t.credoPhase} />
                        <span className="text-[9px] text-gray-400">{userMsgCount} ech.</span>
                        <span className="text-[9px] text-gray-400">{formatRelativeTime(t.updatedAt)}</span>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 mt-1.5 transition-opacity">
                        {t.status === "active" && (
                          <button onClick={(e) => { e.stopPropagation(); handlePromote(t); }} disabled={promoting === t.id}
                            className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-full hover:bg-violet-100 transition-colors cursor-pointer disabled:opacity-50">
                            <Rocket className="h-3.5 w-3.5" />
                            {promoting === t.id ? "Promotion..." : "Promouvoir"}
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleArchive(t); }}
                          className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                          <Archive className="h-3.5 w-3.5" /> Archiver
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                          className="p-0.5 rounded hover:bg-red-50 cursor-pointer" title="Supprimer">
                          <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === "list" && filtered.length > 0 && (
            <div className="space-y-1">
              {filtered.map(t => {
                const userMsgCount = t.messages.filter(m => m.role === "user").length;
                const isActive = t.id === activeThreadId;
                const typeCfg = DISCUSSION_TYPE_CONFIG[t._type];

                return (
                  <div key={t.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                    <span className={cn("w-2 h-2 rounded-full shrink-0",
                      t.status === "active" ? "bg-blue-500" : t.status === "parked" ? "bg-amber-400" : "bg-gray-300"
                    )} />
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                    <span className="text-xs font-bold flex-1 truncate text-gray-800">{t.title}</span>
                    <BotBadgeFull botCode={t.primaryBot} />
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", typeCfg.color)}>{typeCfg.emoji}</span>
                    <CREDODots currentPhase={t.credoPhase} />
                    <span className="text-[9px] text-gray-400">{userMsgCount} ech.</span>
                    <span className="text-[9px] text-gray-400">{formatRelativeTime(t.updatedAt)}</span>
                    {t.parentChantier ? (
                      <Link2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    )}
                    <div className="flex items-center gap-1 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleArchive(t); }} className="p-0.5 rounded hover:bg-gray-100 cursor-pointer" title="Archiver">
                        <Archive className="h-3.5 w-3.5 text-gray-300 hover:text-gray-600" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }} className="p-0.5 rounded hover:bg-red-50 cursor-pointer" title="Supprimer">
                        <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-500" />
                      </button>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* KANBAN VIEW */}
          {viewMode === "kanban" && filtered.length > 0 && (() => {
            const KANBAN_COLS = [
              { key: "active", label: "En cours", gradient: "from-cyan-600 to-cyan-500", items: filtered.filter(t => t.status === "active") },
              { key: "parked", label: "En attente", gradient: "from-amber-500 to-amber-400", items: filtered.filter(t => t.status === "parked") },
              { key: "completed", label: "Terminees", gradient: "from-emerald-500 to-emerald-400", items: filtered.filter(t => t.status === "completed" || t.status === "resolved") },
              { key: "rejected", label: "Rejetees", gradient: "from-red-500 to-red-400", items: filtered.filter(t => t.status === "rejected") },
            ].filter(c => c.items.length > 0);
            return (
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${KANBAN_COLS.length}, minmax(200px, 1fr))` }}>
                {KANBAN_COLS.map(col => (
                  <div key={col.key} className="flex flex-col gap-1.5">
                    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-t-lg bg-gradient-to-r", col.gradient)}>
                      <span className="text-xs font-bold text-white flex-1">{col.label}</span>
                      <span className="text-[9px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">{col.items.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {col.items.map(t => (
                        <div key={t.id} className="p-2.5 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer bg-white"
                          onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                          <p className="text-xs font-bold text-gray-800 line-clamp-2">{t.title}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <BotBadgeFull botCode={t.primaryBot} compact />
                            <CREDODots currentPhase={t.credoPhase} />
                            <span className="text-[9px] text-gray-400 ml-auto">{formatRelativeTime(t.updatedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* SPREADSHEET VIEW */}
          {viewMode === "spreadsheet" && filtered.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-[9px] table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <SortTh field="titre" label="Titre" cls="w-[32%] px-3" />
                    <SortTh field="bot" label="Bot" cls="w-[14%]" />
                    <SortTh field="type" label="Type" cls="w-[10%]" />
                    <SortTh field="phase" label="Phase" cls="w-[8%]" />
                    <SortTh field="echanges" label="Ech." cls="w-[6%]" />
                    <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">Statut</th>
                    <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[8%]">Lien</th>
                    <SortTh field="date" label="Maj" cls="w-[10%]" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const userMsgCount = t.messages.filter(m => m.role === "user").length;
                    const sb = STATUS_BADGE[t.status] || STATUS_BADGE.active;
                    const typeCfg = DISCUSSION_TYPE_CONFIG[t._type];
                    return (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                        onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                        <td className="px-3 py-2 font-medium text-gray-800 truncate">{t.title}</td>
                        <td className="px-2 py-2"><BotBadgeFull botCode={t.primaryBot} /></td>
                        <td className="px-2 py-2">
                          <span className={cn("px-1.5 py-0.5 rounded-full font-medium", typeCfg.color)}>{typeCfg.label}</span>
                        </td>
                        <td className="px-2 py-2"><CREDODots currentPhase={t.credoPhase} /></td>
                        <td className="px-2 py-2 text-gray-500">{userMsgCount}</td>
                        <td className="px-2 py-2">
                          <span className={cn("px-1.5 py-0.5 rounded font-bold", sb.bg, sb.text)}>{sb.label}</span>
                        </td>
                        <td className="px-2 py-2">
                          {t.parentChantier ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-0.5"><Link2 className="h-3.5 w-3.5" /> Oui</span>
                          ) : (
                            <span className="text-gray-400">Non</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-gray-400">{formatRelativeTime(t.updatedAt)}</td>
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
