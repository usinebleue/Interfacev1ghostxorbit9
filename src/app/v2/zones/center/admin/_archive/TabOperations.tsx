/**
 * TabOperations.tsx — Operations admin (replaces TabDeploy)
 * Sections empilees: Pipeline | Missions COMMAND | Playbooks | Briefings
 */

import { useState, useEffect } from "react";
import { Rocket, Zap, BookOpen, FileText, Layers, Loader2, Play } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { StatusBadge, BotBadge, ChaleurBadge, BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";

interface Props {
  mode: string;
  tenantId?: number;
}

// ================================================================
// STATUS MAPPER (same as HierarchieGHML)
// ================================================================

function mapStatus(s: string): "done" | "en-cours" | "a-faire" | "bloque" {
  switch (s) {
    case "completee": case "completed": case "done": return "done";
    case "en_cours": case "en-cours": case "active": return "en-cours";
    case "en_attente": case "a-faire": case "a_faire": return "a-faire";
    case "bloque": case "archivee": return "bloque";
    default: return "a-faire";
  }
}

// ================================================================
// TAB OPERATIONS
// ================================================================

export function TabOperations({ mode, tenantId }: Props) {
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

  // --- Load all sections on mount ---

  useEffect(() => {
    setPipelineLoading(true);
    api.listChantiers()
      .then((data: any) => {
        const list = data?.chantiers || data;
        if (Array.isArray(list)) setChantiers(list);
      })
      .catch(() => setChantiers([]))
      .finally(() => setPipelineLoading(false));

    setCommandLoading(true);
    api.commandMissionsList(20)
      .then((data: any) => {
        const list = data?.missions || data;
        if (Array.isArray(list)) setMissions(list);
      })
      .catch(() => setMissions([]))
      .finally(() => setCommandLoading(false));

    setPlaybooksLoading(true);
    api.listPlaybooks()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.playbooks || [];
        setPlaybooks(list);
      })
      .catch(() => setPlaybooks([]))
      .finally(() => setPlaybooksLoading(false));

    setBriefingsLoading(true);
    api.listBriefings()
      .then((data: any) => {
        const list = data?.briefings || data;
        if (Array.isArray(list)) setBriefings(list);
      })
      .catch(() => setBriefings([]))
      .finally(() => setBriefingsLoading(false));
  }, []);

  // --- Handlers ---

  const handleDeployPlaybook = async (id: string) => {
    setDeployingId(id);
    try {
      await api.deployPlaybook(id);
      // Reload playbooks
      const data: any = await api.listPlaybooks();
      const list = Array.isArray(data) ? data : data?.playbooks || [];
      setPlaybooks(list);
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
      // Reload briefings
      const data: any = await api.listBriefings();
      const list = data?.briefings || data;
      if (Array.isArray(list)) setBriefings(list);
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
      // Reload briefings
      const data: any = await api.listBriefings();
      const list = data?.briefings || data;
      if (Array.isArray(list)) setBriefings(list);
    } catch {
      // silently fail
    } finally {
      setCompilingBoard(false);
    }
  };

  return (
    <div className="space-y-6">
      <TabSectionHeader icon={Rocket} title="Operations" subtitle="Pipeline, missions et deploiements" gradient="from-orange-600 to-orange-500" />

      {/* ================================================================ */}
      {/* SECTION 1 — Pipeline Chantiers */}
      {/* ================================================================ */}
      <div className="space-y-2">
        <Card className="p-0 overflow-hidden shadow-sm">
          <BlockHeader icon={Layers} title="Pipeline" gradient="from-blue-600 to-blue-500" count={chantiers.length} />
        </Card>

        {pipelineLoading ? (
          <LoadingState />
        ) : chantiers.length === 0 ? (
          <EmptyState message="Aucun chantier" />
        ) : (
          chantiers.map((c: any) => {
            const completees = c.missions_completees ?? c.completees ?? 0;
            const total = c.missions_total ?? c.total_missions ?? 0;
            const pct = total > 0 ? Math.round((completees / total) * 100) : 0;
            const status = c.status || (pct >= 100 ? "done" : pct > 0 ? "en_cours" : "a_faire");

            return (
              <Card key={c.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <Layers className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate flex-1">
                    {c.titre || c.nom || `Chantier #${c.id}`}
                  </span>
                  <StatusBadge status={mapStatus(status)} />
                </div>
                <div className="px-3 py-2 space-y-2">
                  {c.description && (
                    <p className="text-xs text-gray-600 truncate">{c.description}</p>
                  )}
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">{pct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.chaleur && (
                      <ChaleurBadge chaleur={c.chaleur} />
                    )}
                    {c.bot_codes && Array.isArray(c.bot_codes) && c.bot_codes.length > 0 && (
                      <div className="flex items-center gap-1">
                        {c.bot_codes.map((b: any, i: number) => {
                            const bc = typeof b === "string" ? b : b?.code || "?";
                            return <BotBadge key={bc + i} code={bc} />;
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ================================================================ */}
      {/* SECTION 2 — Missions COMMAND */}
      {/* ================================================================ */}
      <div className="space-y-2">
        <Card className="p-0 overflow-hidden shadow-sm">
          <BlockHeader icon={Zap} title="Missions COMMAND" gradient="from-orange-600 to-orange-500" count={missions.length} />
        </Card>

        {commandLoading ? (
          <LoadingState />
        ) : missions.length === 0 ? (
          <EmptyState message="Aucune mission COMMAND" />
        ) : (
          missions.map((m: any) => {
            const mStatus = m.stage || m.status || "pending";

            return (
              <Card key={m.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
                  <Zap className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate flex-1">
                    {m.message_original || m.titre || `Mission #${m.id}`}
                  </span>
                  <StatusBadge status={mapStatus(mStatus)} />
                </div>
                <div className="px-3 py-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                        {m.scan_bots.map((b: any, i: number) => {
                            const bc = typeof b === "string" ? b : b?.code || "?";
                            return <BotBadge key={bc + i} code={bc} />;
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ================================================================ */}
      {/* SECTION 3 — Playbooks */}
      {/* ================================================================ */}
      <div className="space-y-2">
        <Card className="p-0 overflow-hidden shadow-sm">
          <BlockHeader icon={BookOpen} title="Playbooks" gradient="from-indigo-600 to-indigo-500" count={playbooks.length} />
        </Card>

        {playbooksLoading ? (
          <LoadingState />
        ) : playbooks.length === 0 ? (
          <EmptyState message="Aucun playbook" />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {playbooks.map((p: any) => {
              const id = String(p.id || p.playbook_id || p.alias);

              return (
                <Card key={id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
                    <BookOpen className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white truncate flex-1">
                      {p.titre || p.nom || p.alias || "Playbook"}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex-1 flex flex-col space-y-1.5">
                    {p.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">{p.description}</p>
                    )}
                    {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-600 border-indigo-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleDeployPlaybook(id)}
                      disabled={deployingId === id}
                      className={cn(
                        "flex items-center justify-center gap-1 mt-auto pt-2 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-colors",
                        deployingId === id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      )}
                    >
                      {deployingId === id ? (
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

      {/* ================================================================ */}
      {/* SECTION 4 — Briefings */}
      {/* ================================================================ */}
      <div className="space-y-2">
        <Card className="p-0 overflow-hidden shadow-sm">
          <BlockHeader icon={FileText} title="Briefings" gradient="from-violet-600 to-violet-500" count={briefings.length} />
        </Card>

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
                : "bg-violet-600 text-white hover:bg-violet-700"
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
          <LoadingState />
        ) : briefings.length === 0 ? (
          <EmptyState message="Aucun briefing compile" />
        ) : (
          briefings.map((b: any) => (
            <Card key={b.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                <FileText className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white truncate flex-1">
                  {b.titre || b.type_briefing || `Briefing #${b.id}`}
                </span>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {b.type_briefing && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                      b.type_briefing === "daily" ? "bg-blue-100 text-blue-700 border-blue-200"
                        : b.type_briefing === "board_meeting" ? "bg-violet-100 text-violet-700 border-violet-200"
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
                {b.resume && (
                  <p className="text-xs text-gray-600 line-clamp-2">{b.resume}</p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
