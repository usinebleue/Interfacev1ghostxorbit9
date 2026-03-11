/**
 * DiagnosticHubPage.tsx — Diagnostic Hub centralisé
 * 3 tabs: Vue d'ensemble | Mes Diagnostics | Par département
 * Remplace "Santé Globale" comme point d'entrée diagnostics
 */

import { useState, useEffect } from "react";
import {
  Stethoscope, Activity, LayoutGrid, TrendingUp, Target, AlertTriangle,
  BarChart3, Zap,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { api } from "../../../api/client";
import { BOT_AVATAR } from "../../../api/types";
import type { DiagnosticIA } from "../../../api/types";
import { DiagnosticIAPage } from "./DiagnosticIAPage";
import { getNiveau } from "./diagnostic-questions";

// ── Types ──
type HubTab = "overview" | "diagnostics" | "departements";

const HUB_TABS: { id: HubTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Activity },
  { id: "diagnostics", label: "Mes Diagnostics", icon: Stethoscope },
  { id: "departements", label: "Par département", icon: LayoutGrid },
];

// ── Dept display config ──
const DEPT_DISPLAY: Record<string, { label: string; gradient: string; bot: string }> = {
  direction:   { label: "Direction (CEO)",     gradient: "from-slate-700 to-slate-600",   bot: "BCO" },
  finance:     { label: "Finance (CFO)",       gradient: "from-emerald-600 to-teal-500",  bot: "BCF" },
  technologie: { label: "Technologie (CTO)",   gradient: "from-blue-700 to-indigo-600",   bot: "BCT" },
  marketing:   { label: "Marketing (CMO)",     gradient: "from-fuchsia-600 to-pink-500",  bot: "BCM" },
  strategie:   { label: "Stratégie (CSO)",     gradient: "from-violet-700 to-purple-600", bot: "BCS" },
  operations:  { label: "Opérations (COO)",    gradient: "from-orange-600 to-orange-500", bot: "BOO" },
  production:  { label: "Production (CPO)",    gradient: "from-slate-600 to-slate-500",   bot: "BFA" },
  rh:          { label: "RH (CHRO)",           gradient: "from-teal-600 to-teal-500",     bot: "BHR" },
  innovation:  { label: "Innovation (CINO)",   gradient: "from-rose-600 to-rose-500",     bot: "BIO" },
  ventes:      { label: "Ventes (CRO)",        gradient: "from-amber-600 to-amber-500",   bot: "BRO" },
  legal:       { label: "Légal (CLO)",         gradient: "from-indigo-600 to-indigo-500", bot: "BLE" },
  securite:    { label: "Sécurité (CISO)",     gradient: "from-zinc-700 to-zinc-600",     bot: "BSE" },
};

// ── KPI Card ──
function KpiCard({ icon: Icon, label, value, sub, gradient }: {
  icon: React.ElementType; label: string; value: string; sub: string; gradient: string;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className={cn("flex items-center gap-2 px-3 py-2", gradient)}>
        <Icon className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <div className="px-3 py-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-[9px] text-gray-500">{sub}</div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════

export function DiagnosticHubPage() {
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [lastDiag, setLastDiag] = useState<DiagnosticIA | null>(null);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.diagnosticIAList(1, "complete");
        const items = data.items || [];
        setTotalCompleted(items.length);
        if (items.length > 0) {
          // Most recent completed diagnostic
          setLastDiag(items[items.length - 1]);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab]); // refresh when switching back

  const niveau = lastDiag ? getNiveau(lastDiag.score_dia) : null;

  // Radar chart data from scores_departements
  const radarData = lastDiag?.scores_departements
    ? Object.entries(lastDiag.scores_departements).map(([key, score]) => ({
        dept: DEPT_DISPLAY[key]?.label?.split(" ")[0] || key,
        score,
        fullMark: 100,
      }))
    : [];

  // Top 3 gaps
  const topGaps = lastDiag?.top_gaps?.slice(0, 3) || [];

  // Ghost team recommendation
  const ghostTeam = lastDiag?.ghost_team?.slice(0, 3) || [];

  return (
    <PageLayout maxWidth="5xl" spacing="space-y-2.5">
      {/* ── GRADIENT HEADER + TABS ── */}
      <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300",
        activeTab === "overview" ? "from-blue-600 to-indigo-500" :
        activeTab === "diagnostics" ? "from-violet-600 to-purple-500" :
        "from-emerald-600 to-teal-500"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Diagnostic Hub</h2>
              <p className="text-sm text-white/70">
                {activeTab === "overview" ? "Vue d'ensemble de votre santé d'entreprise" :
                 activeTab === "diagnostics" ? "Lancez et gérez vos diagnostics" :
                 "Scores détaillés par département"}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {HUB_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                    activeTab === tab.id
                      ? "bg-white/25 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white/80"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* TAB 1 — VUE D'ENSEMBLE                    */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <Stethoscope className="h-5 w-5 text-gray-300 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          ) : !lastDiag ? (
            /* No diagnostic yet — CTA */
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Stethoscope className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Aucun diagnostic complété</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Lancez votre premier diagnostic pour obtenir une vue complète de la santé de votre entreprise.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("diagnostics")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Lancer un diagnostic
              </button>
            </div>
          ) : (
            <>
              {/* 4 KPI cards */}
              <div className="grid grid-cols-4 gap-2.5">
                <KpiCard
                  icon={Target}
                  label="Score DIA"
                  value={`${lastDiag.score_dia}/100`}
                  sub="Score global du dernier diagnostic"
                  gradient="bg-gradient-to-r from-blue-600 to-blue-500"
                />
                <KpiCard
                  icon={TrendingUp}
                  label="Niveau"
                  value={niveau?.label || "—"}
                  sub={niveau?.description || ""}
                  gradient={`bg-gradient-to-r ${
                    (lastDiag.score_dia || 0) >= 80 ? "from-blue-600 to-blue-500" :
                    (lastDiag.score_dia || 0) >= 60 ? "from-green-600 to-green-500" :
                    (lastDiag.score_dia || 0) >= 40 ? "from-yellow-600 to-yellow-500" :
                    "from-red-600 to-red-500"
                  }`}
                />
                <KpiCard
                  icon={BarChart3}
                  label="Diagnostics"
                  value={String(totalCompleted)}
                  sub={`diagnostic${totalCompleted !== 1 ? "s" : ""} complété${totalCompleted !== 1 ? "s" : ""}`}
                  gradient="bg-gradient-to-r from-violet-600 to-violet-500"
                />
                <KpiCard
                  icon={AlertTriangle}
                  label="Gap non exploité"
                  value={`${100 - (lastDiag.score_sei || 0)}%`}
                  sub="Potentiel d'amélioration SEI"
                  gradient="bg-gradient-to-r from-amber-600 to-amber-500"
                />
              </div>

              {/* Radar + Quick Wins */}
              <div className="grid grid-cols-5 gap-2.5">
                {/* Radar — col-span-3 */}
                <div className="col-span-3 bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 border-b border-blue-100 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Radar départements</span>
                  </div>
                  {radarData.length > 0 ? (
                    <div className="p-2.5" style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: "#6b7280" }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <Radar
                            dataKey="score"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-400">Pas de données radar</div>
                  )}
                </div>

                {/* Quick Wins — col-span-2 */}
                <div className="col-span-2 bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-2.5 py-1.5 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">
                      Top Gaps — Actions prioritaires
                    </span>
                  </div>
                  <div className="p-2.5 space-y-2">
                    {topGaps.length > 0 ? topGaps.map((gap, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white border">
                        <img
                          src={BOT_AVATAR[gap.botCode] || BOT_AVATAR["BCO"]}
                          alt={gap.botCode}
                          className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-800">{gap.label}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", gap.score < 40 ? "bg-red-400" : gap.score < 60 ? "bg-amber-400" : "bg-green-400")}
                                style={{ width: `${gap.score}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">{gap.score}/100</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-gray-400 text-center py-4">Aucun gap identifié</p>
                    )}

                    {/* Ghost Team recommandée */}
                    {ghostTeam.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ghost Team recommandée</p>
                        <div className="flex gap-1.5">
                          {ghostTeam.map((bot, i) => (
                            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">
                              <img
                                src={BOT_AVATAR[bot.botCode] || BOT_AVATAR["BCO"]}
                                alt={bot.botCode}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-[9px] font-medium text-blue-700">{bot.botCode}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* TAB 2 — MES DIAGNOSTICS (composant entier)*/}
      {/* ══════════════════════════════════════════ */}
      {activeTab === "diagnostics" && (
        <DiagnosticIAPage />
      )}

      {/* ══════════════════════════════════════════ */}
      {/* TAB 3 — PAR DÉPARTEMENT                    */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === "departements" && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <LayoutGrid className="h-5 w-5 text-gray-300 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          ) : !lastDiag?.scores_departements ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <LayoutGrid className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Aucun score par département</h3>
                <p className="text-sm text-gray-500 mt-1">Complétez un diagnostic pour voir vos scores par département.</p>
              </div>
              <button
                onClick={() => setActiveTab("diagnostics")}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Lancer un diagnostic
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(lastDiag.scores_departements)
                .sort(([, a], [, b]) => b - a)
                .map(([key, score]) => {
                  const cfg = DEPT_DISPLAY[key];
                  const botCode = cfg?.bot || "BCO";
                  return (
                    <div key={key} className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3">
                      <img
                        src={BOT_AVATAR[botCode] || BOT_AVATAR["BCO"]}
                        alt={botCode}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-800">{cfg?.label || key}</span>
                          <span className={cn("text-xs font-bold",
                            score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600"
                          )}>{score}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all",
                              score >= 70 ? "bg-green-400" : score >= 40 ? "bg-amber-400" : "bg-red-400"
                            )}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[8px] px-1.5 shrink-0",
                        score >= 70 ? "text-green-600 bg-green-50 border-green-200" :
                        score >= 40 ? "text-amber-600 bg-amber-50 border-amber-200" :
                        "text-red-600 bg-red-50 border-red-200"
                      )}>
                        {score >= 70 ? "sain" : score >= 40 ? "attention" : "critique"}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
