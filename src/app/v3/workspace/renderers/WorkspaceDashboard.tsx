/**
 * WorkspaceDashboard.tsx — Renderer dashboard KPIs V1
 *
 * Dashboard simple avec KPI cards vides. Carl Q5 = sections vides à remplir.
 * Pattern: KPI cards standard depuis design-system.md (grid-cols-4, gradient header).
 * Basé sur CockpitView KPI cards.
 */

import { BarChart3, TrendingUp, Target, Clock, AlertTriangle } from "lucide-react";
import type { RendererProps } from "../types";

// KPIs placeholder par défaut (vides — V1 simple)
const DEFAULT_KPIS = [
  { label: "Progression", value: "—", sublabel: "À définir", icon: TrendingUp, color: "blue" },
  { label: "Objectifs", value: "—", sublabel: "À définir", icon: Target, color: "emerald" },
  { label: "Temps", value: "—", sublabel: "À définir", icon: Clock, color: "orange" },
  { label: "Alertes", value: "0", sublabel: "Aucune", icon: AlertTriangle, color: "red" },
];

const COLOR_MAP: Record<string, { gradient: string; text: string }> = {
  blue:    { gradient: "from-blue-600 to-blue-500",    text: "text-blue-600" },
  emerald: { gradient: "from-emerald-600 to-emerald-500", text: "text-emerald-600" },
  orange:  { gradient: "from-orange-600 to-orange-500",  text: "text-orange-600" },
  red:     { gradient: "from-red-600 to-red-500",      text: "text-red-600" },
};

export function WorkspaceDashboard({ sectionConfig }: RendererProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <BarChart3 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">{sectionConfig.label}</span>
        </div>

        {/* KPI Grid */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {DEFAULT_KPIS.map((kpi) => {
              const colors = COLOR_MAP[kpi.color] || COLOR_MAP.blue;
              return (
                <div key={kpi.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${colors.gradient}`}>
                    <kpi.icon className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">{kpi.label}</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className={`text-2xl font-bold ${colors.text}`}>{kpi.value}</div>
                    <div className="text-[10px] text-gray-500">{kpi.sublabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone contenu vide */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="p-6 text-center">
          <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400 italic">
            Les métriques seront alimentées au fur et à mesure de la progression
          </p>
        </div>
      </div>
    </div>
  );
}
