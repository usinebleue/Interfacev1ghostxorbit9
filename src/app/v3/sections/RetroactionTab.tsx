/**
 * RetroactionTab.tsx — Onglet "Rétroaction" de la section Exécution
 *
 * Bilans, apprentissages et recommandations IA.
 * Structure: LivingHero compact violet → Sidebar w-[180px] + Contenu
 * Pattern: COPIE de OperationsView (hero + sidebar + contenu)
 * Données: Réutilise pattern bilanOptimisation existant dans OperationsView mock
 */

import { useState } from "react";
import {
  Home, CheckCircle2, TrendingUp, TrendingDown,
  BarChart3, BookOpen, Lightbulb, AlertTriangle,
  ThumbsUp, ThumbsDown, ArrowRight, Bot,
  Calendar, Filter, Flame, Settings,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { PHASE_COLORS, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { ViewModeToolbar, type ViewMode } from "./shared/ViewModeToolbar";
import { SF } from "../core/styles";

import {
  MOCK_CYCLES, MOCK_APPRENTISSAGES, MOCK_RECOMMANDATIONS, MOCK_METRIQUES,
  type CompletedCycle, type Apprentissage, type Recommandation,
} from "../data/mock/execution.mock";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";

// ═══ Types ═══

type RetroSidebarItem = "overview" | "cycles" | "apprentissages" | "recommandations" | "metriques";
type RetroFilter = "tout" | "chantiers" | "operations";
type RetroPeriod = "mois" | "trimestre" | "annee";

// ═══ Composant principal ═══

export function RetroactionTab({ botCode }: { botCode: string }) {
  const { data: cycles } = useDataSource<CompletedCycle[]>("retroaction", MOCK_CYCLES);
  const [sidebarItem, setSidebarItem] = useState<RetroSidebarItem>("overview");
  const [filter, setFilter] = useState<RetroFilter>("tout");
  const [period, setPeriod] = useState<RetroPeriod>("trimestre");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const filteredCycles = cycles.filter(c => {
    if (filter === "chantiers") return c.type === "chantier";
    if (filter === "operations") return c.type === "operation";
    return true;
  });

  return (
    <div>
      {/* Hero — Living Hero compact violet */}
      <LivingHero
        blur1="bg-violet-100/70"
        blur2="bg-purple-100/60"
        title="Bilan & Leçons"
        description="Leçons apprises, recommandations IA."
        badge={<DomainBadge domain="retroaction" />}
      >
        <div className="relative w-[360px] h-[140px]">
          <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-violet-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bilans</h4>
              <div className="w-4 h-4 rounded bg-violet-100 text-violet-500 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4"/></svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[88%] bg-violet-400 rounded-full" /></div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-purple-400 rounded-full shadow-[0_0_10px_#a78bfa] anim-progress" /></div>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* 4 KPI cards — pattern Cockpit (header bleu pastel), au-dessus du sidebar comme En direct */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {MOCK_METRIQUES.map((m, i) => (
          <div key={i} className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              <m.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{m.label}</span>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{m.value}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {m.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={cn("text-[9px] font-medium", m.up ? "text-emerald-600" : "text-red-600")}>{m.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar + Contenu */}
      <div className="flex gap-4 mt-4">
        {/* Sidebar w-[180px] — copie SF pattern */}
        <div className={SF.sidebarW}>
          <div className={SF.sectionLabel}>Navigation</div>
          {([
            { key: "overview" as const, label: "Vue d'ensemble", icon: Home, count: null },
            { key: "cycles" as const, label: "Cycles complétés", icon: CheckCircle2, count: filteredCycles.length },
            { key: "apprentissages" as const, label: "Apprentissages", icon: BookOpen, count: MOCK_APPRENTISSAGES.length },
            { key: "recommandations" as const, label: "Recommandations", icon: Bot, count: MOCK_RECOMMANDATIONS.length },
            { key: "metriques" as const, label: "Métriques", icon: BarChart3, count: null },
          ]).map(item => (
            <button
              key={item.key}
              onClick={() => setSidebarItem(item.key)}
              className={cn(SF.btnBase, sidebarItem === item.key ? SF.btnActive : SF.btnInactive)}
            >
              <item.icon className={sidebarItem === item.key ? SF.iconActive : SF.iconInactive} />
              <span className={sidebarItem === item.key ? SF.labelActive : SF.labelInactive}>{item.label}</span>
              {item.count !== null && <span className={SF.count}>{item.count}</span>}
            </button>
          ))}

          <div className={SF.separator} />
          <div className={SF.sectionLabel}>Période</div>
          {([
            { key: "mois" as const, label: "Ce mois" },
            { key: "trimestre" as const, label: "Ce trimestre" },
            { key: "annee" as const, label: "Cette année" },
          ]).map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(SF.btnBase, period === p.key ? SF.btnActive : SF.btnInactive)}
            >
              <span className={period === p.key ? SF.labelActive : SF.labelInactive}>{p.label}</span>
            </button>
          ))}

          <div className={SF.separator} />
          <div className={SF.sectionLabel}>Type</div>
          {([
            { key: "tout" as const, label: "Tout" },
            { key: "chantiers" as const, label: "Chantiers" },
            { key: "operations" as const, label: "Opérations" },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(SF.btnBase, filter === f.key ? SF.btnActive : SF.btnInactive)}
            >
              <span className={filter === f.key ? SF.labelActive : SF.labelInactive}>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 space-y-4">
          {/* Cycles complétés */}
          {(sidebarItem === "overview" || sidebarItem === "cycles") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-gray-900">Cycles complétés</span>
              </div>
              <ViewModeToolbar viewMode={viewMode} onViewMode={setViewMode} count={filteredCycles.length} label="terminés" />

              {/* Mode liste */}
              {viewMode === "list" && (
                <div className="space-y-1">
                  {filteredCycles.map(cycle => {
                    const scoreColor = cycle.scorePerformance >= 90 ? "bg-emerald-100 text-emerald-700" : cycle.scorePerformance >= 75 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                    return (
                      <div key={cycle.id} className={SF.listRow}>
                        {cycle.type === "chantier" ? <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" /> : <Settings className="h-3.5 w-3.5 text-cyan-500 shrink-0" />}
                        <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{cycle.titre}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0", scoreColor)}>{cycle.scorePerformance}%</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0", cycle.type === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>{cycle.type === "chantier" ? "CAPEX" : "OPEX"}</span>
                        <span className="text-[9px] text-gray-400 shrink-0">{cycle.duree}</span>
                        <span className="text-[9px] text-gray-400 shrink-0">{cycle.dateCompletion}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mode tableau */}
              {viewMode === "table" && (
                <div className={SF.tableWrap}>
                  <table className={SF.tableFull}>
                    <thead><tr className={SF.tableHead}>
                      <th className={SF.tableTh}>Nom</th>
                      <th className={SF.tableTh}>Type</th>
                      <th className={SF.tableTh}>Score</th>
                      <th className={SF.tableTh}>Durée</th>
                      <th className={SF.tableTh}>Terminé le</th>
                    </tr></thead>
                    <tbody>
                      {filteredCycles.map(cycle => {
                        const scoreColor = cycle.scorePerformance >= 90 ? "bg-emerald-100 text-emerald-700" : cycle.scorePerformance >= 75 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                        return (
                          <tr key={cycle.id} className={SF.tableTr}>
                            <td className={cn(SF.tableTd, "font-medium text-gray-900")}>{cycle.titre}</td>
                            <td className={SF.tableTd}><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", cycle.type === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>{cycle.type === "chantier" ? "CAPEX" : "OPEX"}</span></td>
                            <td className={SF.tableTd}><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", scoreColor)}>{cycle.scorePerformance}%</span></td>
                            <td className={cn(SF.tableTd, "text-gray-500")}>{cycle.duree}</td>
                            <td className={cn(SF.tableTd, "text-gray-500")}>{cycle.dateCompletion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mode cartes (défaut) */}
              {viewMode === "cards" && (
                <div className="space-y-2">
                  {filteredCycles.map(cycle => (
                    <div key={cycle.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          {cycle.type === "chantier"
                            ? <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            : <Settings className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                          }
                          <span className="text-[11px] font-bold text-gray-900 flex-1 truncate">{cycle.titre}</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                            cycle.scorePerformance >= 90 ? "bg-emerald-100 text-emerald-700" :
                            cycle.scorePerformance >= 75 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {cycle.scorePerformance}%
                          </span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", cycle.type === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>
                            {cycle.type === "chantier" ? "CAPEX" : "OPEX"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-1.5">{cycle.resultats}</p>
                        <div className="flex items-center gap-3">
                          {BOT_AVATAR_MAP[cycle.botPrimaire] && (
                            <img src={BOT_AVATAR_MAP[cycle.botPrimaire]} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200" />
                          )}
                          <span className="text-[9px] text-gray-400">{cycle.duree}</span>
                          <span className="text-[9px] text-gray-400">Terminé le {cycle.dateCompletion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Apprentissages — 3 colonnes (positifs / négatifs / actions) */}
          {(sidebarItem === "overview" || sidebarItem === "apprentissages") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs font-bold text-gray-900">Apprentissages</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Positifs */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700">Ce qui a bien fonctionné</span>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_APPRENTISSAGES.filter(a => a.type === "positif").map((a, i) => (
                      <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-emerald-50 rounded-lg px-2.5 py-2 border border-emerald-100">
                        <div>{a.message}</div>
                        <div className="text-[9px] text-emerald-500 mt-1 font-medium">{a.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Négatifs */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-[10px] font-bold text-red-700">Ce qu'on doit améliorer</span>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_APPRENTISSAGES.filter(a => a.type === "negatif").map((a, i) => (
                      <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-red-50 rounded-lg px-2.5 py-2 border border-red-100">
                        <div>{a.message}</div>
                        <div className="text-[9px] text-red-500 mt-1 font-medium">{a.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-700">Actions à entreprendre</span>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_APPRENTISSAGES.filter(a => a.type === "action").map((a, i) => (
                      <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-blue-50 rounded-lg px-2.5 py-2 border border-blue-100">
                        <div>{a.message}</div>
                        <div className="text-[9px] text-blue-500 mt-1 font-medium">{a.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommandations IA */}
          {(sidebarItem === "overview" || sidebarItem === "recommandations") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs font-bold text-gray-900">Recommandations IA</span>
                <span className="text-[9px] text-gray-400">{MOCK_RECOMMANDATIONS.length} suggestions</span>
              </div>
              <div className="space-y-2">
                {MOCK_RECOMMANDATIONS.map((rec, i) => {
                  const prioColor = rec.priorite === "haute" ? "bg-red-100 text-red-700" : rec.priorite === "moyenne" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
                  return (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                      <div className="p-3 flex gap-3">
                        {BOT_AVATAR_MAP[rec.bot] && (
                          <img src={BOT_AVATAR_MAP[rec.bot]} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", prioColor)}>{rec.priorite}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600">{rec.categorie}</span>
                          </div>
                          <p className="text-[10px] text-gray-700 leading-relaxed">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
