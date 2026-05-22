/**
 * ChantiersAccueilView.tsx — Dashboard unifié "Chantiers"
 *
 * Mix cockpit-style dashboard + ChantierView avec drill-down complet.
 *
 * Structure:
 *   COMMAND card (si mission active) → Hero compact → 4 KPI cards (2x2) → AgentPixels (en direct)
 *   → Boutons (Nouveau chantier + Blueprint seed)
 *   → ChantierView (cartes, filtres, tri, drill-down chantier→projet→mission→tâche)
 *   → Activité récente (décisions réelles depuis /api/v1/decisions)
 *
 * Note: PhaseKey reste "execution" — Section label: "Chantiers"
 */

import { useState, useEffect } from "react";
import {
  Flame, Target, AlertTriangle,
  TrendingUp, CheckCircle2, Clock,
  BarChart3, Plus, ArrowRight,
  Zap, Settings, Layers,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";
import { AgentPixelGrid } from "./AgentPixelGrid";
import { ChantierView } from "./ChantierView";
import { CommandMissionCard } from "./OperationsView";
import type { CommandStatusResponse } from "../../v2/api/types";
import { api } from "../../v2/api/client";

// ═══ Props ═══

interface ChantiersAccueilViewProps {
  botCode: string;
  onAction?: (phase: string, context: string) => void;
  commandMission?: CommandStatusResponse | null;
}

// ═══ Composant principal ═══

export function ChantiersAccueilView({ botCode, onAction, commandMission }: ChantiersAccueilViewProps) {
  // Fetch real chantiers from API
  const { data: rawChantiers, isLive } = useDataSource<any[]>("execution-live", []);
  const { data: rawMissions } = useDataSource<any[]>("missions", []);

  // Real decisions for activity feed
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  useEffect(() => {
    api.listDecisions({ limit: 5 })
      .then(res => setRecentDecisions((res as any).decisions ?? []))
      .catch(() => {});
  }, []);

  // Blueprint seed handler
  const [seeding, setSeeding] = useState(false);
  const handleSeedBlueprint = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await api.seedFromBlueprint();
    } catch { /* noop */ } finally {
      setSeeding(false);
    }
  };

  // Zero-state KPIs quand aucune donnée live
  const ZERO_KPIS = [
    { label: "Chantiers", value: "0", icon: Flame, delta: "aucun actif", up: false, color: "text-orange-600" },
    { label: "Missions", value: "0", icon: Target, delta: "aucune en cours", up: false, color: "text-blue-600" },
    { label: "Complétées", value: "0", icon: Settings, delta: "missions terminées", up: false, color: "text-cyan-600" },
    { label: "Progression", value: "—", icon: BarChart3, delta: "moyenne chantiers", up: false, color: "text-emerald-600" },
  ];

  // Dynamic KPIs from real data (or zero-state)
  const dynamicKpis = isLive ? [
    { label: "Chantiers", value: String(rawChantiers.length), icon: Flame, delta: `${rawChantiers.filter((c: any) => c.chaleur === "brule").length} brûlent`, up: rawChantiers.length > 0, color: "text-orange-600" },
    { label: "Missions", value: String(Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "active" || m.status === "a-faire").length : 0), icon: Target, delta: `${Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "a-faire").length : 0} à faire`, up: false, color: "text-blue-600" },
    { label: "Complétées", value: String(Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "completee").length : 0), icon: Settings, delta: "missions terminées", up: true, color: "text-cyan-600" },
    { label: "Progression", value: rawChantiers.length > 0 ? `${Math.round(rawChantiers.reduce((s: number, c: any) => s + (c.progression || 0), 0) / rawChantiers.length)}%` : "—", icon: BarChart3, delta: "moyenne chantiers", up: true, color: "text-emerald-600" },
  ] : ZERO_KPIS;

  const ACTIVITY_ICON: Record<string, { icon: React.ElementType; color: string }> = {
    livrable: { icon: CheckCircle2, color: "text-emerald-500" },
    decision: { icon: Zap, color: "text-blue-500" },
    alerte: { icon: AlertTriangle, color: "text-red-500" },
    completion: { icon: CheckCircle2, color: "text-emerald-600" },
    creation: { icon: Flame, color: "text-orange-500" },
  };

  return (
    <div className="space-y-4">
      {/* ═══ COMMAND MISSION CARD — mission COMMAND active ═══ */}
      {commandMission && !commandMission.completed && (
        <CommandMissionCard mission={commandMission} />
      )}

      {/* ═══ DASHBOARD TOP — Hero + KPIs + Agents en direct ═══ */}

      {/* Hero — Living Hero compact vert */}
      <LivingHero
        blur1="bg-green-100/70"
        blur2="bg-emerald-100/60"
        title="Vos chantiers, mobilisés."
        description="Dashboard en direct — chantiers, missions et progression."
        badge={<DomainBadge domain="execution-live" />}
      >
        <div className="relative max-w-sm h-[140px]">
          <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-emerald-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobilisation</h4>
              <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-500 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[75%] bg-emerald-400 rounded-full" /></div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-green-400 rounded-full shadow-[0_0_10px_#34d399] anim-progress" /></div>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* 4 KPI cards — style cockpit */}
      <div className="grid grid-cols-2 gap-3">
        {dynamicKpis.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {kpi.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
                <span className={cn("text-[9px] font-medium", kpi.up ? "text-emerald-600" : "text-amber-600")}>{kpi.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agents en direct — vue pixel live */}
      <AgentPixelGrid />

      {/* Boutons d'action */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 text-green-700 hover:bg-green-100 hover:border-green-400 transition-all cursor-pointer"
          onClick={() => onAction?.("discussion", "creation_chantier")}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-bold">Nouveau chantier</span>
        </button>
        <button
          type="button"
          disabled={seeding}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer text-xs font-medium disabled:opacity-50"
          onClick={handleSeedBlueprint}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{seeding ? "Initialisation…" : "Initialiser depuis le Blueprint de l'organisation"}</span>
        </button>
      </div>

      {/* ═══ CHANTIERS — Vue complète avec drill-down ═══ */}
      <ChantierView botCode={botCode} showHeader={false} onAction={onAction} onSeedBlueprint={handleSeedBlueprint} />

      {/* ═══ ACTIVITÉ RÉCENTE ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-bold text-gray-900">Activité récente</span>
          <span className="text-[9px] text-gray-400">{recentDecisions.length} événements</span>
        </div>
        {recentDecisions.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-[10px]">Aucune activité récente</div>
        ) : (
          <div className="space-y-1.5">
            {recentDecisions.map((item: any) => {
              const actConf = ACTIVITY_ICON[item.type_decision] || { icon: ArrowRight, color: "text-gray-400" };
              return (
                <div key={item.id} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:bg-gray-50 hover:shadow-md transition-all">
                  <actConf.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", actConf.color)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-gray-800">{item.titre || item.description || "Décision"}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-orange-50 text-orange-600">
                        {item.section || "chantier"}
                      </span>
                      <span className="text-[9px] text-gray-400">{item.bot_code || ""}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">
                    {item.date_decision ? new Date(item.date_decision).toLocaleDateString("fr-CA") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
