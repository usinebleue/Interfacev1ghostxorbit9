/**
 * ChantiersAccueilView.tsx — Dashboard unifié "Chantiers"
 *
 * Mix cockpit-style dashboard + ChantierView avec drill-down complet.
 *
 * Structure:
 *   Hero compact → 4 KPI cards (2x2) → AgentPixels (en direct)
 *   → Bouton "+ Nouveau chantier"
 *   → ChantierView (cartes, filtres, tri, drill-down chantier→projet→mission→tâche)
 *   → Activité récente
 *
 * Note: PhaseKey reste "execution" — Section label: "Chantiers"
 */

import {
  Flame, Target, AlertTriangle,
  TrendingUp, CheckCircle2, Clock,
  BarChart3, Plus, ArrowRight,
  Zap, Settings,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { MOCK_KPIS, MOCK_ACTIVITY } from "../data/mock/execution.mock";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";
import { AgentPixelGrid } from "./AgentPixelGrid";
import { ChantierView } from "./ChantierView";

// ═══ Props ═══

interface ChantiersAccueilViewProps {
  botCode: string;
  onAction?: (phase: string, context: string) => void;
}

// ═══ Composant principal ═══

export function ChantiersAccueilView({ botCode, onAction }: ChantiersAccueilViewProps) {
  // Fetch real chantiers from API
  const { data: rawChantiers, isLive } = useDataSource<any[]>("execution-live", []);
  const { data: rawMissions } = useDataSource<any[]>("missions", []);

  // Dynamic KPIs from real data (or mock fallback)
  const dynamicKpis = isLive ? [
    { label: "Chantiers", value: String(rawChantiers.length), icon: Flame, delta: `${rawChantiers.filter((c: any) => c.chaleur === "brule").length} brûlent`, up: rawChantiers.length > 0, color: "text-orange-600" },
    { label: "Missions", value: String(Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "active" || m.status === "a-faire").length : 0), icon: Target, delta: `${Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "a-faire").length : 0} à faire`, up: false, color: "text-blue-600" },
    { label: "Complétées", value: String(Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "completee").length : 0), icon: Settings, delta: "missions terminées", up: true, color: "text-cyan-600" },
    { label: "Progression", value: rawChantiers.length > 0 ? `${Math.round(rawChantiers.reduce((s: number, c: any) => s + (c.progression || 0), 0) / rawChantiers.length)}%` : "—", icon: BarChart3, delta: "moyenne chantiers", up: true, color: "text-emerald-600" },
  ] : MOCK_KPIS;

  const ACTIVITY_ICON: Record<string, { icon: React.ElementType; color: string }> = {
    livrable: { icon: CheckCircle2, color: "text-emerald-500" },
    decision: { icon: Zap, color: "text-blue-500" },
    alerte: { icon: AlertTriangle, color: "text-red-500" },
    completion: { icon: CheckCircle2, color: "text-emerald-600" },
    creation: { icon: Flame, color: "text-orange-500" },
  };

  return (
    <div className="space-y-4">
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

      {/* Bouton Nouveau chantier — ouvre une discussion CREDO guidée */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 text-green-700 hover:bg-green-100 hover:border-green-400 transition-all cursor-pointer"
        onClick={() => {
          if (onAction) {
            onAction("discussion", "creation_chantier");
          }
        }}
      >
        <Plus className="h-4 w-4" />
        <span className="text-xs font-bold">Nouveau chantier</span>
      </button>

      {/* ═══ CHANTIERS — Vue complète avec drill-down ═══ */}
      {/* ChantierView intégré directement: cartes, filtres, tri, drill-down chantier→projet→mission→tâche */}
      <ChantierView botCode={botCode} showHeader={false} onAction={onAction} />

      {/* ═══ ACTIVITÉ RÉCENTE ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-bold text-gray-900">Activité récente</span>
          <span className="text-[9px] text-gray-400">{MOCK_ACTIVITY.length} événements</span>
        </div>
        <div className="space-y-1.5">
          {MOCK_ACTIVITY.map(item => {
            const actConf = ACTIVITY_ICON[item.type] || { icon: ArrowRight, color: "text-gray-400" };
            return (
              <div key={item.id} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:bg-gray-50 hover:shadow-md transition-all">
                <actConf.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", actConf.color)} />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-gray-800">{item.message}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", item.source === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>
                      {item.sourceName}
                    </span>
                    <span className="text-[9px] text-gray-400">{item.auteur}</span>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 shrink-0">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
