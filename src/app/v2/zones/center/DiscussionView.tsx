/**
 * DiscussionView.tsx — Mes Discussions (Mon Bureau)
 * MEME DESIGN que chantier/projet/mission/tache:
 * Toolbar (search + sort + status filter + view mode) + gradient cards + list + tableur
 * 3-state: En cours / En attente / Terminees
 * Drill-down: parent chantier/projet visible, CREDO phase, branches
 */

import { useState, useMemo } from "react";
import {
  MessageSquare, Clock, CheckCircle, PlusCircle, Trash2,
  ArrowRight, MessageCircle, Link2, AlertCircle,
  Search, LayoutGrid, List, Table2, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { Thread } from "../../api/types";

// ── Bot metadata ──
const BOT_META: Record<string, { emoji: string; name: string; color: string }> = {
  CEOB: { emoji: "👔", name: "CarlOS",    color: "text-blue-700 bg-blue-50 border-blue-200" },
  CTOB: { emoji: "💻", name: "Tim",       color: "text-violet-700 bg-violet-50 border-violet-200" },
  CFOB: { emoji: "💰", name: "Frank",     color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CMOB: { emoji: "📣", name: "Mathilde",  color: "text-pink-700 bg-pink-50 border-pink-200" },
  CSOB: { emoji: "🎯", name: "Simone",    color: "text-red-700 bg-red-50 border-red-200" },
  COOB: { emoji: "⚙️", name: "Olivier",   color: "text-orange-700 bg-orange-50 border-orange-200" },
  CROB: { emoji: "📈", name: "Rich",      color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  CHROB: { emoji: "👥", name: "Helene",   color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  CISOB: { emoji: "🛡️", name: "Securite", color: "text-gray-700 bg-gray-50 border-gray-200" },
  CLOB: { emoji: "⚖️", name: "Loulou",   color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
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

// ── Status badge (meme pattern que chantiers) ──
const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: "Active",   bg: "bg-blue-100",    text: "text-blue-700" },
  parked:    { label: "Parquee",  bg: "bg-amber-100",   text: "text-amber-700" },
  completed: { label: "Terminee", bg: "bg-emerald-100", text: "text-emerald-700" },
  resolved:  { label: "Resolue",  bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected:  { label: "Rejetee",  bg: "bg-red-100",     text: "text-red-700" },
};

type SortField = "titre" | "date" | "phase" | "echanges" | "bot";
type SortDir = "asc" | "desc";
type ViewMode = "cards" | "list" | "spreadsheet";

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════

export function DiscussionView() {
  const {
    threads, activeThreadId,
    parkThread, resumeThread, deleteThread, newConversation,
  } = useChatContext();
  const { setActiveView } = useFrameMaster();

  // Toolbar state
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const goToChat = () => setActiveView("live-chat");

  const handleAction = (threadId: string, action: "continuer" | "reprendre" | "revoir") => {
    if (action === "reprendre" || action === "revoir") resumeThread(threadId);
    goToChat();
  };

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    let items = [...threads];

    // Status filter
    if (statusFilter) {
      if (statusFilter === "en-cours") items = items.filter(t => t.status === "active");
      else if (statusFilter === "en-attente") items = items.filter(t => t.status === "parked");
      else if (statusFilter === "terminees") items = items.filter(t => t.status === "completed" || t.status === "resolved" || t.status === "rejected");
      else if (statusFilter === "orphelin") items = items.filter(t => !t.parentChantier);
      else if (statusFilter === "rattache") items = items.filter(t => !!t.parentChantier);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (BOT_META[t.primaryBot]?.name || "").toLowerCase().includes(q)
      );
    }

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      const aCount = a.messages.filter(m => m.role === "user").length;
      const bCount = b.messages.filter(m => m.role === "user").length;
      switch (sortField) {
        case "titre": cmp = a.title.localeCompare(b.title); break;
        case "date": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
        case "phase": cmp = (CREDO_PHASES.indexOf(a.credoPhase || "C")) - (CREDO_PHASES.indexOf(b.credoPhase || "C")); break;
        case "echanges": cmp = aCount - bCount; break;
        case "bot": cmp = a.primaryBot.localeCompare(b.primaryBot); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [threads, statusFilter, search, sortField, sortDir]);

  // Counts for filter pills
  const counts = {
    all: threads.length,
    "en-cours": threads.filter(t => t.status === "active").length,
    "en-attente": threads.filter(t => t.status === "parked").length,
    terminees: threads.filter(t => t.status === "completed" || t.status === "resolved" || t.status === "rejected").length,
    orphelin: threads.filter(t => !t.parentChantier).length,
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

      {/* ══ TOOLBAR — meme pattern que chantiers ══ */}
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

        {/* Status filter pills */}
        <div className="flex items-center gap-1">
          {([
            { id: null, label: "Tous", count: counts.all },
            { id: "en-cours", label: "En cours", count: counts["en-cours"] },
            { id: "en-attente", label: "En attente", count: counts["en-attente"] },
            { id: "terminees", label: "Terminees", count: counts.terminees },
            { id: "orphelin", label: "Orphelin", count: counts.orphelin },
          ] as const).map(f => (
            <button key={f.id ?? "all"} onClick={() => setStatusFilter(f.id)}
              className={cn("px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
                statusFilter === f.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* + Nouvelle */}
        <button
          onClick={() => { newConversation(); goToChat(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Nouvelle
        </button>

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

        <span className="text-[9px] font-bold text-gray-400">{filtered.length} items</span>
      </div>

      {/* ══ EMPTY STATE ══ */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">{search ? `Aucun resultat pour "${search}"` : "Aucune discussion"}</p>
          <p className="text-[9px] mt-1 opacity-70">Demarrez une discussion avec votre Bot Team C-Level</p>
        </div>
      )}

      {/* ══ CARDS VIEW — gradient cards meme pattern chantier ══ */}
      {viewMode === "cards" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(t => {
            const bot = BOT_META[t.primaryBot] || BOT_META.CEOB;
            const userMsgCount = t.messages.filter(m => m.role === "user").length;
            const sb = STATUS_BADGE[t.status] || STATUS_BADGE.active;
            const isActive = t.id === activeThreadId;
            const gradient = t.status === "active" ? "from-cyan-600 to-cyan-500"
              : t.status === "parked" ? "from-amber-500 to-amber-400"
              : "from-gray-500 to-gray-400";

            return (
              <div key={t.id} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all group cursor-pointer"
                onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                {/* GRADIENT HEADER */}
                <div className={cn("px-3 py-2 flex items-center gap-2 bg-gradient-to-r", gradient)}>
                  <MessageSquare className="h-3.5 w-3.5 text-white shrink-0" />
                  <span className="text-[9px] font-bold text-white flex-1 truncate">{t.title}</span>
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full", sb.bg, sb.text)}>{sb.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
                  <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                </div>

                {/* BODY */}
                <div className="px-3 py-2 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Bot badge */}
                    <span className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[9px] font-medium", bot.color)}>
                      {bot.emoji} {bot.name}
                    </span>
                    {/* CREDO dots */}
                    <CREDODots currentPhase={t.credoPhase} />
                    {/* Exchanges */}
                    <span className="text-[9px] text-gray-400">{userMsgCount} ech.</span>
                    {/* Time */}
                    <span className="text-[9px] text-gray-400">{formatRelativeTime(t.updatedAt)}</span>
                    {/* Rattachement */}
                    {t.parentChantier ? (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <Link2 className="h-3.5 w-3.5" /> Rattache
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
                        <AlertCircle className="h-3.5 w-3.5" /> Orphelin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ LIST VIEW — compact single-line meme pattern chantier ══ */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="space-y-1">
          {filtered.map(t => {
            const bot = BOT_META[t.primaryBot] || BOT_META.CEOB;
            const userMsgCount = t.messages.filter(m => m.role === "user").length;
            const isActive = t.id === activeThreadId;

            return (
              <div key={t.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                {/* Status dot */}
                <span className={cn("w-2 h-2 rounded-full shrink-0",
                  t.status === "active" ? "bg-blue-500" : t.status === "parked" ? "bg-amber-400" : "bg-gray-300"
                )} />
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                <span className="text-[9px] font-bold flex-1 truncate text-gray-800">{t.title}</span>
                <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full border", bot.color)}>{bot.name}</span>
                <CREDODots currentPhase={t.credoPhase} />
                <span className="text-[8px] text-gray-400">{userMsgCount} ech.</span>
                <span className="text-[8px] text-gray-400">{formatRelativeTime(t.updatedAt)}</span>
                {t.parentChantier ? (
                  <Link2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                )}
                {/* Actions on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* ══ SPREADSHEET VIEW — tableur meme pattern chantier ══ */}
      {viewMode === "spreadsheet" && filtered.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-[9px] table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <SortTh field="titre" label="Titre" cls="w-[40%] px-3" />
                <SortTh field="bot" label="Bot" cls="w-[12%]" />
                <SortTh field="phase" label="Phase" cls="w-[10%]" />
                <SortTh field="echanges" label="Ech." cls="w-[8%]" />
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">Statut</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">Lien</th>
                <SortTh field="date" label="Maj" cls="w-[10%]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const bot = BOT_META[t.primaryBot] || BOT_META.CEOB;
                const userMsgCount = t.messages.filter(m => m.role === "user").length;
                const sb = STATUS_BADGE[t.status] || STATUS_BADGE.active;
                return (
                  <tr key={t.id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    onClick={() => handleAction(t.id, t.status === "active" ? "continuer" : t.status === "parked" ? "reprendre" : "revoir")}>
                    <td className="px-3 py-2 font-medium text-gray-800 truncate">{t.title}</td>
                    <td className="px-2 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded-full border font-medium", bot.color)}>{bot.name}</span>
                    </td>
                    <td className="px-2 py-2"><CREDODots currentPhase={t.credoPhase} /></td>
                    <td className="px-2 py-2 text-gray-500">{userMsgCount}</td>
                    <td className="px-2 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded font-bold", sb.bg, sb.text)}>{sb.label}</span>
                    </td>
                    <td className="px-2 py-2">
                      {t.parentChantier ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-0.5"><Link2 className="h-3.5 w-3.5" /> Rattache</span>
                      ) : (
                        <span className="text-gray-400">Orphelin</span>
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
    </div>
  );
}
