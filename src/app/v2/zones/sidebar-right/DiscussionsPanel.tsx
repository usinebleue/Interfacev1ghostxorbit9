/**
 * DiscussionsPanel.tsx — 3 tabs: Chantiers | Missions | Discussions
 * Sprint Final V1 — Backend-connected tabs, inline creation
 * Style: conserve le look original du sidebar, juste tabs ajoutées
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Trash2,
  Plus,
  Flame,
  Target,
  Loader2,
  MessageSquare,
  ChevronLeft,
  Check,
  X,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { DiscussionTab } from "../../context/FrameMasterContext";
import { useChantiers, useMissions } from "../../api/hooks";

const STATUS_CONFIG = {
  active: { label: "Actif", color: "bg-green-500" },
  parked: { label: "Parke", color: "bg-amber-500" },
  completed: { label: "Termine", color: "bg-gray-400" },
} as const;

const CHALEUR_CONFIG = {
  brule: { border: "border-l-red-500 bg-red-50/50", dot: "bg-red-500", label: "Brule" },
  couve: { border: "border-l-amber-400 bg-amber-50/30", dot: "bg-amber-400", label: "Couve" },
  meurt: { border: "border-l-gray-300 bg-gray-50", dot: "bg-gray-300", label: "Meurt" },
} as const;

const TAB_META: { id: DiscussionTab; label: string; icon: React.ElementType; color: string; activeBg: string; activeText: string }[] = [
  { id: "discussions", label: "Discussions", icon: MessageSquare, color: "text-violet-400", activeBg: "bg-violet-50 border border-violet-200", activeText: "text-violet-700" },
  { id: "missions", label: "Missions", icon: Target, color: "text-blue-400", activeBg: "bg-blue-50 border border-blue-200", activeText: "text-blue-700" },
  { id: "chantiers", label: "Chantiers", icon: Flame, color: "text-orange-400", activeBg: "bg-orange-50 border border-orange-200", activeText: "text-orange-700" },
];

/** Inline text input — remplace window.prompt() qui est bloque */
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
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 rounded border border-blue-200 animate-in fade-in duration-200">
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
        className="flex-1 bg-transparent text-xs outline-none placeholder:text-blue-300 text-gray-700 min-w-0"
      />
      <button onClick={handleSubmit} disabled={!value.trim()} className="p-0.5 text-blue-500 hover:text-blue-700 disabled:opacity-30 cursor-pointer">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button onClick={onCancel} className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DiscussionsPanel() {
  const { activeDiscussionTab: activeTab, navigateDiscussionTab: setActiveTab } = useFrameMaster();
  const [selectedChantierId, setSelectedChantierId] = useState<number | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [newChaleur, setNewChaleur] = useState<"brule" | "couve" | "meurt">("couve");

  const {
    messages, threads, activeThreadId,
    resumeThread, deleteThread, newConversation,
  } = useChatContext();

  const { chantiers, loading: loadingChantiers, create: createChantier, remove: removeChantier } = useChantiers();
  const { missions, loading: loadingMissions, create: createMission, remove: removeMission } = useMissions(selectedChantierId ?? undefined);

  const activeCount = threads.filter((t) => t.status === "active").length;
  const parkedCount = threads.filter((t) => t.status === "parked").length;

  const sortedThreads = [...threads].sort((a, b) => {
    const order: Record<string, number> = { active: 0, parked: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const handleNewChantier = useCallback(async (titre: string) => {
    await createChantier(titre, newChaleur);
    setShowInput(false);
    setNewChaleur("couve");
  }, [createChantier, newChaleur]);

  const handleNewMission = useCallback(async (titre: string) => {
    const m = await createMission(titre);
    if (m) newConversation();
    setShowInput(false);
  }, [createMission, newConversation]);

  const handleAdd = () => {
    if (activeTab === "discussions") newConversation();
    else setShowInput(true);
  };

  const tabCounts: Record<DiscussionTab, number> = {
    chantiers: chantiers.length,
    missions: missions.length,
    discussions: activeCount + parkedCount,
  };

  return (
    <div>
      {/* 3 tabs — arborescence Chantier → Mission → Discussion */}
      <div className="flex items-center gap-1 px-1 py-1">
        {TAB_META.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowInput(false); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs py-2 font-medium rounded transition-all cursor-pointer",
                isActive
                  ? cn(tab.activeBg, tab.activeText)
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "" : tab.color)} />
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <Badge variant="secondary" className="ml-0.5 text-[8px] px-1 py-0 h-3.5 bg-gray-100 text-gray-500">
                  {tabCounts[tab.id]}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Bouton "+" contextuel — sous les tabs */}
      <button
        onClick={handleAdd}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-blue-500 hover:bg-blue-50 rounded transition-colors cursor-pointer font-medium"
      >
        <Plus className="h-3.5 w-3.5" />
        {activeTab === "chantiers" ? "Nouveau chantier" : activeTab === "missions" ? "Nouvelle mission" : "Nouvelle discussion"}
      </button>

      {/* Tab content */}
      <div className="mt-1.5 space-y-1">

        {/* Inline input */}
        {showInput && activeTab === "chantiers" && (
          <div className="space-y-1">
            <InlineInput placeholder="Titre du chantier..." onSubmit={handleNewChantier} onCancel={() => { setShowInput(false); setNewChaleur("couve"); }} />
            <div className="flex items-center gap-1 px-2">
              {([["brule", "\uD83D\uDD25 Br\u00fble"], ["couve", "\uD83D\uDFE1 Couve"], ["meurt", "\u26AA Meurt"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setNewChaleur(val)}
                  className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer",
                    newChaleur === val
                      ? val === "brule" ? "bg-red-100 border-red-300 text-red-700" : val === "couve" ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-gray-100 border-gray-300 text-gray-600"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {showInput && activeTab === "missions" && (
          <InlineInput placeholder="Titre de la mission..." onSubmit={handleNewMission} onCancel={() => setShowInput(false)} />
        )}

        {/* ── Tab Chantiers ── */}
        {activeTab === "chantiers" && (
          <>
            {loadingChantiers ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : chantiers.length === 0 && !showInput ? (
              <div className="text-[9px] text-gray-400 px-2 py-3 text-center">
                Aucun chantier. Cliquez + pour en creer un.
              </div>
            ) : (
              chantiers.map((ch) => {
                const cfg = CHALEUR_CONFIG[ch.chaleur] || CHALEUR_CONFIG.couve;
                return (
                  <div
                    key={ch.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded text-xs border-l-[3px] transition-colors cursor-pointer text-left",
                      cfg.border, "hover:opacity-80"
                    )}
                    onClick={() => {
                      setSelectedChantierId(ch.id);
                      setActiveTab("missions");
                    }}
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">{ch.titre}</div>
                      <div className="text-[9px] text-gray-400">
                        {cfg.label}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeChantier(ch.id); }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── Tab Missions ── */}
        {activeTab === "missions" && (
          <>
            {selectedChantierId && (
              <button
                onClick={() => setSelectedChantierId(null)}
                className="flex items-center gap-1 text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer mb-1 font-medium"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Tous les chantiers
              </button>
            )}
            {loadingMissions ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : missions.length === 0 && !showInput ? (
              <div className="text-[9px] text-gray-400 px-2 py-3 text-center">
                Aucune mission. Cliquez + pour en creer une.
              </div>
            ) : (
              missions.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (m.thread_ids?.length) resumeThread(m.thread_ids[0]);
                    else newConversation();
                  }}
                >
                  <Target className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{m.titre}</div>
                    <div className="text-[9px] text-gray-400 flex items-center gap-1">
                      {m.bot_primaire && (
                        <span className="font-medium">{m.bot_primaire}</span>
                      )}
                      {m.progression != null && m.progression > 0 && (
                        <>
                          <span>·</span>
                          <span>{m.progression}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  {m.progression != null && m.progression > 0 && (
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${m.progression}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMission(m.id); }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ── Tab Discussions ── */}
        {activeTab === "discussions" && (
          <>
            {/* Discussion active (messages en cours, pas encore dans un thread) */}
            {messages.length > 0 && !activeThreadId && (
              <div className="group flex items-center gap-2 px-2 py-2 rounded text-xs bg-blue-50/50 border border-blue-100 cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {messages.find((m) => m.role === "user")?.content.slice(0, 40) || "Conversation"}...
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {messages.length} messages — en cours
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); newConversation(); }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Threads sauvegardes */}
            {sortedThreads.map((thread) => {
              const cfg = STATUS_CONFIG[thread.status] || STATUS_CONFIG.active;
              const isActive = thread.id === activeThreadId;

              return (
                <div
                  key={thread.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded text-xs transition-colors cursor-pointer",
                    isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  )}
                  onClick={() => resumeThread(thread.id)}
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{thread.title}</div>
                    <div className="text-[9px] text-gray-400 flex items-center gap-1">
                      <span>{thread.messages?.length || 0} msg</span>
                      <span>·</span>
                      <span>{cfg.label}</span>
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
            })}

            {/* Etat vide */}
            {threads.length === 0 && messages.length === 0 && (
              <div className="text-[9px] text-gray-400 px-2 py-3 text-center">
                Aucune discussion. Tape dans le chat pour commencer.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
