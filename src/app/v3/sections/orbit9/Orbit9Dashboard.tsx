/**
 * Orbit9Dashboard.tsx — Vue d'ensemble réseau (Pattern A = CockpitView)
 *
 * Structure IDENTIQUE à CockpitView:
 * 5 KPIs (bg-[#00B4D8]/10 header) → Bande vedette CockpitSignalCard (grid-cols-3)
 * → Sidebar w-[180px] + CockpitCard grid-cols-2 + drill-down CockpitBlocDetail
 *
 * Utilisé par: Orbit9View (o9Section === "dashboard")
 */

import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { SF } from "../../core/styles";
import { DEPT_GRADIENT } from "../shared/dept-data";
import type { PhaseKey } from "../shared/dept-data";

import {
  O9_DASHBOARD_KPIS,
  O9_DASH_ROW1,
  O9_DASH_ROW2,
  O9_DASH_ROW3,
  O9_DASH_SIDEBAR,
} from "./orbit9-data";

import {
  CockpitCard,
  CockpitSignalCard,
  CockpitSectionHeader,
  CockpitBlocDetail,
} from "./orbit9-helpers";

import type { DashboardBlocConfig } from "./orbit9-helpers";

export function Orbit9Dashboard() {
  const [activeSidebarId, setActiveSidebarId] = useState("signaux");
  const [selectedBloc, setSelectedBloc] = useState<DashboardBlocConfig | null>(null);

  const gradient = DEPT_GRADIENT["ORBIT9"] || DEPT_GRADIENT.CEOB;

  const handleAction = (phase: PhaseKey, context: string) => {
    console.log("Orbit9 action:", phase, context);
  };

  // Signaux = row1[0] → bande vedette. Reste = 8 blocs en grid.
  const signalItems = O9_DASH_ROW1[0]?.items || [];
  const gridBlocs = [
    ...O9_DASH_ROW1.slice(1),
    ...O9_DASH_ROW2,
    ...O9_DASH_ROW3,
  ];

  const scrollTo = (id: string) => {
    setActiveSidebarId(id);
    setSelectedBloc(null);
    const el = document.getElementById(`o9-dash-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4">
      {/* ═══ 5 KPIs RÉSEAU — Pattern EXACT CockpitView VITAA ═══ */}
      <div id="o9-dash-kpis" className="grid grid-cols-5 gap-3">
        {O9_DASHBOARD_KPIS.map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className={cn("text-xs flex items-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ BANDE VEDETTE — CockpitSignalCard (Pattern CockpitView) ═══ */}
      {signalItems.length > 0 && (
        <div>
          <CockpitSectionHeader icon={AlertTriangle} title="À porter attention" count={signalItems.length} />
          <div className="grid grid-cols-3 gap-3">
            {signalItems.map((item, i) => (
              <CockpitSignalCard key={i} item={item} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR + CONTENU (pattern CockpitView) ═══ */}
      <div className="flex gap-3">
        {/* Sidebar scroll-to navigation */}
        <div className={cn("w-[180px] shrink-0 space-y-0.5 transition-all", selectedBloc && "pt-8")}>
          {O9_DASH_SIDEBAR.map((item, idx) => {
            if (!item) {
              return <div key={`sep-${idx}`} className={SF.separator} />;
            }
            const Icon = item.icon;
            const isActive = activeSidebarId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}
              >
                <Icon className={cn(isActive ? SF.iconActive : SF.iconInactive)} />
                <span className={cn(isActive ? SF.labelActive : SF.labelInactive)}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu — CockpitCard grid 2 cols OU drill-down CockpitBlocDetail */}
        <div className="flex-1 min-w-0 space-y-3">
          {selectedBloc ? (
            <CockpitBlocDetail
              config={selectedBloc}
              deptLabel="Orbit9"
              deptGradient={gradient}
              onBack={() => setSelectedBloc(null)}
              onAction={handleAction}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gridBlocs.map((bloc, i) => (
                <CockpitCard
                  key={i}
                  config={bloc}
                  onAction={handleAction}
                  onHeaderClick={() => setSelectedBloc(bloc)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
