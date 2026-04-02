/**
 * TabDeploy.tsx — Deploy & Operations admin
 * Sous-tabs: Pipeline | COMMAND | Playbooks | Briefings
 */

import { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Terminal,
  BookOpen,
  FileText,
  Inbox,
  Loader2,
  Rocket,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BotBadge, ChaleurBadge } from "../shared/SectionComponents";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "pipeline", label: "Pipeline", icon: Layers },
  { id: "command", label: "COMMAND", icon: Terminal },
  { id: "playbooks", label: "Playbooks", icon: BookOpen },
  { id: "briefings", label: "Briefings", icon: FileText },
];

export function TabDeploy({ mode, tenantId }: Props) {
  const [sub, setSub] = useState("pipeline");

  // --- Pipeline ---
  const [chantiers, setChantiers] = useState<any[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  // --- COMMAND ---
  const [missions, setMissions] = useState<any[]>([]);
  const [commandLoading, setCommandLoading] = useState(false);

  // --- Playbooks ---
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [playbooksLoading, setPlaybooksLoading] = useState(false);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  // --- Briefings ---
  const [briefings, setBriefings] = useState<any[]>([]);
  const [briefingsLoading, setBriefingsLoading] = useState(false);
  const [compilingDaily, setCompilingDaily] = useState(false);
  const [compilingBoard, setCompilingBoard] = useState(false);

  // --- Loaders ---

  const loadPipeline = useCallback(() => {
    setPipelineLoading(true);
    api.listChantiers()
      .then((data: any) => {
        const list = data?.chantiers || data;
        if (Array.isArray(list)) setChantiers(list);
      })
      .catch(() => setChantiers([]))
      .finally(() => setPipelineLoading(false));
  }, []);

  const loadCommand = useCallback(() => {
    setCommandLoading(true);
    api.commandMissionsList(20)
      .then((data: any) => {
        const list = data?.missions || data;
        if (Array.isArray(list)) setMissions(list);
      })
      .catch(() => setMissions([]))
      .finally(() => setCommandLoading(false));
  }, []);

  const loadPlaybooks = useCallback(() => {
    setPlaybooksLoading(true);
    api.listPlaybooks()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.playbooks || [];
        setPlaybooks(list);
      })
      .catch(() => setPlaybooks([]))
      .finally(() => setPlaybooksLoading(false));
  }, []);

  const loadBriefings = useCallback(() => {
    setBriefingsLoading(true);
    api.listBriefings()
      .then((data: any) => {
        const list = data?.briefings || data;
        if (Array.isArray(list)) setBriefings(list);
      })
      .catch(() => setBriefings([]))
      .finally(() => setBriefingsLoading(false));
  }, []);

  useEffect(() => {
    if (sub === "pipeline") loadPipeline();
    else if (sub === "command") loadCommand();
    else if (sub === "playbooks") loadPlaybooks();
    else if (sub === "briefings") loadBriefings();
  }, [sub, loadPipeline, loadCommand, loadPlaybooks, loadBriefings]);

  // --- Handlers ---

  const handleDeployPlaybook = async (id: string) => {
    setDeployingId(id);
    try {
      await api.deployPlaybook(id);
      loadPlaybooks();
    } catch {
      // silently fail
    } finally {
      setDeployingId(null);
    }
  };

  const handleCompileDaily = async () => {
    setCompilingDaily(true);
    try {
      await api.compileDaily();
      loadBriefings();
    } catch {
      // silently fail
    } finally {
      setCompilingDaily(false);
    }
  };

  const handleCompileBoard = async () => {
    setCompilingBoard(true);
    try {
      await api.compileBoardMeeting();
      loadBriefings();
    } catch {
      // silently fail
    } finally {
      setCompilingBoard(false);
    }
  };

  // --- Helpers ---

  const statusIcon = (status: string) => {
    switch (status) {
      case "done":
      case "completed":
      case "completee":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
      case "running":
      case "en-cours":
        return <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />;
      case "error":
      case "erreur":
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      case "pending":
      case "a-faire":
        return <Clock className="h-3.5 w-3.5 text-yellow-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "done":
      case "completed":
      case "completee":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "running":
      case "en-cours":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "error":
      case "erreur":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
      case "a-faire":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sub === t.id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* --- PIPELINE --- */}
      {sub === "pipeline" && (
        <div className="space-y-2">
          {pipelineLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : chantiers.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucun chantier</span>
            </div>
          ) : (
            chantiers.map((c: any) => {
              const completees = c.missions_completees ?? c.completees ?? 0;
              const total = c.missions_total ?? c.total_missions ?? 0;
              const pct = total > 0 ? Math.round((completees / total) * 100) : 0;
              return (
                <Card key={c.id} className="p-0 overflow-hidden">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 bg-gradient-to-r",
                    pct >= 100 ? "from-emerald-600 to-emerald-500" : pct >= 50 ? "from-blue-600 to-blue-500" : "from-amber-600 to-amber-500"
                  )}>
                    <Layers className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white truncate flex-1">
                      {c.titre || c.nom || `Chantier #${c.id}`}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-800">
                      {completees}/{total}
                    </span>
                  </div>
                  <div className="px-3 py-2.5 space-y-2">
                    {c.description && (
                      <p className="text-xs text-gray-600 truncate">{c.description}</p>
                    )}
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500"
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {c.chaleur && (
                          <ChaleurBadge chaleur={c.chaleur} />
                        )}
                        {c.bot_codes && Array.isArray(c.bot_codes) && c.bot_codes.length > 0 && (
                          <div className="flex items-center gap-1">
                            {c.bot_codes.map((code: string) => (
                              <BotBadge key={code} code={code} />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-gray-600">{pct}%</span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* --- COMMAND --- */}
      {sub === "command" && (
        <div className="space-y-2">
          {commandLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : missions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucune mission COMMAND</span>
            </div>
          ) : (
            missions.map((m: any) => (
              <Card key={m.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {statusIcon(m.stage || m.status || "pending")}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {m.message_original || m.titre || `Mission #${m.id}`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {m.urgency && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                            m.urgency === "urgente" || m.urgency === "critique"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : m.urgency === "importante"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          )}>
                            {m.urgency}
                          </span>
                        )}
                        {m.scan_bots && Array.isArray(m.scan_bots) && m.scan_bots.length > 0 && (
                          <div className="flex items-center gap-1">
                            {m.scan_bots.map((code: string) => (
                              <BotBadge key={code} code={code} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                    statusBadge(m.stage || m.status || "pending")
                  )}>
                    {m.stage || m.status || "pending"}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- PLAYBOOKS --- */}
      {sub === "playbooks" && (
        <div className="space-y-2">
          {playbooksLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : playbooks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucun playbook</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playbooks.map((p: any) => {
                const id = p.id || p.playbook_id || p.alias;
                return (
                  <Card key={id} className="p-0 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
                      <BookOpen className="h-4 w-4 text-white" />
                      <span className="text-sm font-bold text-white truncate">
                        {p.titre || p.nom || p.alias || `Playbook`}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 flex-1 flex flex-col">
                      {p.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{p.description}</p>
                      )}
                      {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-600 border-indigo-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => handleDeployPlaybook(String(id))}
                        disabled={deployingId === String(id)}
                        className={cn(
                          "flex items-center justify-center gap-1 mt-auto pt-2 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-colors",
                          deployingId === String(id)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                      >
                        {deployingId === String(id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Rocket className="h-3.5 w-3.5" />
                        )}
                        Deployer
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- BRIEFINGS --- */}
      {sub === "briefings" && (
        <div className="space-y-3">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCompileDaily}
              disabled={compilingDaily}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                compilingDaily
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {compilingDaily ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Compiler Daily
            </button>
            <button
              onClick={handleCompileBoard}
              disabled={compilingBoard}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                compilingBoard
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              )}
            >
              {compilingBoard ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              Compiler Board
            </button>
          </div>

          {/* Briefing list */}
          {briefingsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : briefings.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucun briefing compile</span>
            </div>
          ) : (
            briefings.map((b: any) => (
              <Card key={b.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {b.titre || b.type_briefing || `Briefing #${b.id}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-6">
                      {b.type_briefing && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                          b.type_briefing === "daily" ? "bg-blue-100 text-blue-700 border-blue-200"
                            : b.type_briefing === "board_meeting" ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        )}>
                          {b.type_briefing}
                        </span>
                      )}
                      {b.bot_code && (
                        <BotBadge code={b.bot_code} />
                      )}
                      {b.created_at && (
                        <span className="text-[9px] text-gray-400">
                          {new Date(b.created_at).toLocaleDateString("fr-CA")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {b.resume && (
                  <p className="text-xs text-gray-600 mt-1.5 ml-6 line-clamp-2">{b.resume}</p>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
