/**
 * TabTraining.tsx — Trial-Brain Stats + Missions Tim (God Mode only)
 * Sections empilees: KPI Cards + Missions d'entrainement
 */

import { useState, useEffect } from "react";
import { Brain, Cpu, Target, TrendingUp, Zap } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { StatusBadge, BotBadge, BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  mode: string;
  tenantId?: number;
}

// ═══════════════════════════════════════
// Status mapper
// ═══════════════════════════════════════

function mapStatus(s: string): "done" | "en-cours" | "a-faire" | "bloque" {
  switch (s) {
    case "completee": case "completed": case "done": return "done";
    case "en_cours": case "en-cours": case "active": case "running": return "en-cours";
    case "en_attente": case "a-faire": case "pending": return "a-faire";
    case "bloque": case "failed": return "bloque";
    default: return "a-faire";
  }
}

// ═══════════════════════════════════════
// TabTraining
// ═══════════════════════════════════════

export function TabTraining({ mode }: Props) {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(true);

  // ── Load training stats ──
  useEffect(() => {
    setLoadingStats(true);
    api.getTrainingStats()
      .then(data => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  // ── Load Tim missions ──
  useEffect(() => {
    setLoadingMissions(true);
    api.commandMissionsList(50)
      .then(data => {
        const all = data?.missions || [];
        setMissions(all.filter((m: any) =>
          Array.isArray(m.scan_bots) && m.scan_bots.some((b: any) =>
            (typeof b === "string" ? b : b?.code) === "CTOB"
          )
        ));
      })
      .catch(() => setMissions([]))
      .finally(() => setLoadingMissions(false));
  }, []);

  if (mode !== "god") return null;

  // ── Extract values from stats ──
  const totalRuns = stats?.total_runs ?? 0;
  const activeRuns = stats?.active_runs ?? 0;
  const completedRuns = stats?.completed_runs ?? 0;
  const bestLoss = stats?.best_loss != null ? String(stats.best_loss) : "\u2014";

  return (
    <div className="space-y-6">
      <TabSectionHeader icon={Brain} title="Trial-Brain" subtitle="Stats d'entrainement et missions Tim" gradient="from-violet-600 to-violet-500" />

      {/* ═══ Section 1 — KPI Cards ═══ */}
      {loadingStats ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {/* Runs — violet */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <Cpu className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Runs</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-violet-600">{totalRuns}</div>
              <div className="text-[9px] text-gray-500">total training runs</div>
            </div>
          </Card>

          {/* Actifs — emerald */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Actifs</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-emerald-600">{activeRuns}</div>
              <div className="text-[9px] text-gray-500">en cours</div>
            </div>
          </Card>

          {/* Completes — blue */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Target className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Completes</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-blue-600">{completedRuns}</div>
              <div className="text-[9px] text-gray-500">termines</div>
            </div>
          </Card>

          {/* Meilleur Loss — amber */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Meilleur Loss</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-amber-600">{bestLoss}</div>
              <div className="text-[9px] text-gray-500">meilleure perte</div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ Section 2 — Missions Tim ═══ */}
      <Card className="p-0 overflow-hidden">
        <BlockHeader
          icon={Brain}
          title="Missions d'entrainement"
          gradient="from-violet-600 to-violet-500"
          count={missions.length}
        />

        <div className="p-3 space-y-2">
          {loadingMissions ? (
            <LoadingState />
          ) : missions.length === 0 ? (
            <EmptyState message="Aucune mission Tim (CTOB)" />
          ) : (
            missions.map(m => {
              const stageKeys = Object.keys(m.stage_results || {});
              const totalStages = 4;
              const pct = m.completed ? 100 : Math.round((stageKeys.length / totalStages) * 100);
              const rawStatus = m.completed ? "completed" : m.error ? "failed" : m.stage || "pending";

              return (
                <Card key={m.id} className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                    <Brain className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white truncate flex-1">
                      {m.message_original || m.summary || `Mission #${m.id}`}
                    </span>
                    <StatusBadge status={mapStatus(rawStatus)} />
                  </div>
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.isArray(m.scan_bots) && m.scan_bots.map((b: any, i: number) => {
                        const bc = typeof b === "string" ? b : b?.code || "?";
                        return <BotBadge key={bc + i} code={bc} />;
                      })}
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500">{pct}%</span>
                    </div>
                    {/* Stage info */}
                    <div className="text-[9px] text-gray-500">
                      {m.started_at ? new Date(m.started_at).toLocaleDateString("fr-CA") : "\u2014"}
                      {m.stage ? ` \u2014 etape: ${m.stage}` : ""}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
