/**
 * MesChantiersView.tsx — Mes Discussions (canevas central)
 * Pipeline de cristallisation: Discussion → Mission → Chantier
 * CarlOS = gardien de l'organisation — il guide la promotion et l'abandon
 * 3 tabs miroir sidebar droite: Discussions | Missions | Chantiers
 * Sprint Final V1
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Flame,
  Target,
  MessageSquare,
  ChevronRight,
  Plus,
  Loader2,
  Check,
  X,
  Trash2,
  Search,
  Bot,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import { useChantiers, useMissions } from "../../api/hooks";
import { useChatContext } from "../../context/ChatContext";
import { CarlOSPresence } from "./CarlOSPresence";

// ── Config ──

const CHALEUR_CONFIG = {
  brule: { gradient: "bg-gradient-to-r from-red-600 to-orange-500", dot: "bg-red-500", label: "Brule", border: "border-l-red-500", bg: "bg-red-50/50" },
  couve: { gradient: "bg-gradient-to-r from-amber-500 to-yellow-400", dot: "bg-amber-400", label: "Couve", border: "border-l-amber-400", bg: "bg-amber-50/30" },
  meurt: { gradient: "bg-gradient-to-r from-gray-400 to-gray-300", dot: "bg-gray-300", label: "Meurt", border: "border-l-gray-300", bg: "bg-gray-50" },
} as const;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-green-500" },
  completed: { label: "Termine", color: "bg-gray-400" },
  paused: { label: "En pause", color: "bg-amber-400" },
};

type TabId = "discussions" | "missions" | "chantiers";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "missions", label: "Missions", icon: Target },
  { id: "chantiers", label: "Chantiers", icon: Flame },
];

// ── Inline input ──

function InlineInput({ placeholder, onSubmit, onCancel }: {
  placeholder: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in duration-200">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-blue-300 text-gray-700 min-w-0"
      />
      <button onClick={handleSubmit} disabled={!value.trim()} className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-30 cursor-pointer">
        <Check className="h-4 w-4" />
      </button>
      <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main Component ──

export function MesChantiersView() {
  const [activeTab, setActiveTab] = useState<TabId>("discussions");
  const [showInput, setShowInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { chantiers, loading: loadingChantiers, create: createChantier } = useChantiers();
  const { missions, loading: loadingMissions, create: createMission } = useMissions();
  const {
    threads, activeThreadId,
    resumeThread, deleteThread, newConversation,
  } = useChatContext();

  const handleNewChantier = useCallback(async (nom: string) => {
    await createChantier(nom);
    setShowInput(false);
  }, [createChantier]);

  const handleNewMission = useCallback(async (nom: string) => {
    const m = await createMission(nom);
    if (m) newConversation();
    setShowInput(false);
  }, [createMission, newConversation]);

  // Filtrage
  const filteredThreads = threads.filter(t =>
    !searchTerm || (t.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMissions = missions.filter(m =>
    !searchTerm || m.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredChantiers = chantiers.filter(ch =>
    !searchTerm || ch.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Search placeholder par tab
  const searchPlaceholders: Record<TabId, string> = {
    discussions: "Rechercher une discussion...",
    missions: "Rechercher une mission...",
    chantiers: "Rechercher un chantier...",
  };

  // Bouton + par tab
  const addLabels: Record<TabId, string> = {
    discussions: "Nouvelle discussion",
    missions: "Nouvelle mission",
    chantiers: "Nouveau chantier",
  };

  const handleAdd = () => {
    if (activeTab === "discussions") {
      newConversation();
    } else {
      setShowInput(true);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="px-10 py-5 space-y-4 max-w-5xl mx-auto">

        <CarlOSPresence />

        {/* Tabs — miroir sidebar droite */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === "discussions" ? threads.length
              : tab.id === "missions" ? missions.length
              : chantiers.length;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(""); setShowInput(false); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                  isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header — search + add */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholders[activeTab]}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabels[activeTab]}
          </button>
        </div>

        {/* Inline input (missions + chantiers) */}
        {showInput && activeTab === "chantiers" && (
          <InlineInput placeholder="Nom du nouveau chantier..." onSubmit={handleNewChantier} onCancel={() => setShowInput(false)} />
        )}
        {showInput && activeTab === "missions" && (
          <InlineInput placeholder="Nom de la nouvelle mission..." onSubmit={handleNewMission} onCancel={() => setShowInput(false)} />
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: DISCUSSIONS                       */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "discussions" && (
          <div className="space-y-1.5">
            {filteredThreads.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucune discussion ne correspond." : "Aucune discussion. Lance une nouvelle conversation pour commencer."}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const msgCount = thread.messages?.length || 0;
                const shouldSuggestPromotion = msgCount >= 5;
                return (
                  <div
                    key={thread.id}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer border",
                      thread.id === activeThreadId
                        ? "bg-violet-50 border-violet-200"
                        : "bg-white hover:bg-gray-50 border-gray-100"
                    )}
                    onClick={() => resumeThread(thread.id)}
                  >
                    <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">{thread.title || "Discussion sans titre"}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-400">{msgCount} message{msgCount !== 1 ? "s" : ""}</span>
                        {shouldSuggestPromotion && (
                          <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <Bot className="h-3.5 w-3.5" />
                            Promouvoir en mission?
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: MISSIONS                          */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "missions" && (
          <div className="space-y-2">
            {loadingMissions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucune mission ne correspond." : "Aucune mission. Promeus une discussion ou cree une mission directement."}
              </div>
            ) : (
              filteredMissions.map((m) => {
                const statusCfg = STATUS_LABELS[m.status] || STATUS_LABELS.active;
                return (
                  <Card
                    key={m.id}
                    className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (m.thread_id) resumeThread(m.thread_id);
                      else newConversation();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Target className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700 truncate">{m.nom}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {m.bot_primaire && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{m.bot_primaire}</Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <div className={cn("w-1.5 h-1.5 rounded-full", statusCfg.color)} />
                            <span className="text-[9px] text-gray-400">{statusCfg.label}</span>
                          </div>
                          {m.thread_id && (
                            <div className="flex items-center gap-0.5 text-[9px] text-gray-400">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Discussion liee</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {m.progress_pct != null && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium text-gray-500">{m.progress_pct}%</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${m.progress_pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: CHANTIERS                         */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "chantiers" && (
          <div>
            {loadingChantiers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filteredChantiers.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucun chantier ne correspond." : "Aucun chantier. Les chantiers regroupent les missions qui convergent."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredChantiers.map((ch) => {
                  const cfg = CHALEUR_CONFIG[ch.chaleur] || CHALEUR_CONFIG.couve;
                  return (
                    <Card
                      key={ch.id}
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {/* Gradient header */}
                      <div className={cn("flex items-center gap-2.5 px-4 py-2.5", cfg.gradient)}>
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                          <Flame className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex-1 truncate">{ch.nom}</h3>
                        <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{ch.missions_count ?? 0}</span>
                      </div>
                      {/* Body */}
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                            <span className="text-xs text-gray-500">{cfg.label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Target className="h-3.5 w-3.5" />
                            <span>{ch.missions_count ?? 0} mission{(ch.missions_count ?? 0) !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </ScrollArea>
  );
}
