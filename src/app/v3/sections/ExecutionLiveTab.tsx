/**
 * ExecutionLiveTab.tsx — Onglet "En direct" de la section Exécution
 *
 * Dashboard unifié: KPIs + Priorités mixtes (CAPEX/OPEX) + Activité récente
 * Structure: LivingHero compact vert → Sidebar w-[180px] + Contenu
 * Pattern: COPIE de OperationsView (hero + sidebar + contenu)
 */

import { useState } from "react";
import {
  Home, Flame, Settings, Target, AlertTriangle,
  TrendingUp, CheckCircle2, Clock, ArrowRight,
  BarChart3, Zap, ListChecks, Cpu,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { useIsMobile } from "../../components/ui/use-mobile";
import { LivingHero } from "./shared/LivingHero";
import { ProgressMiniPhased } from "./shared/ProgressMiniPhased";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { PHASE_COLORS, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { ViewModeToolbar, type ViewMode } from "./shared/ViewModeToolbar";
import { SF } from "../core/styles";

import {
  MOCK_KPIS, MOCK_PRIORITIES, MOCK_ACTIVITY,
  type PriorityItem, type ActivityItem,
} from "../data/mock/execution.mock";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";
import { AgentPixelGrid } from "./AgentPixelGrid";

// ═══ Helpers: transformer données API → PriorityItem ═══

function chaleurToUrgence(chaleur: string): "critique" | "haute" | "normale" {
  if (chaleur === "brule") return "critique";
  if (chaleur === "couve") return "haute";
  return "normale";
}

function statusToPhase(status: string, progression: number): PhaseKey {
  if (status === "completee" || status === "done") return "retroaction";
  if (status === "en-cours" || status === "in_progress") return "execution";
  if (status === "active") return progression >= 80 ? "retroaction" : progression >= 20 ? "execution" : "creation";
  if (status === "pause") return "reflexion";
  return "discussion";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function apiChantiersToPriorities(chantiers: any[]): PriorityItem[] {
  if (!Array.isArray(chantiers) || chantiers.length === 0) return [];
  return chantiers.map((c) => ({
    id: c.id,
    titre: c.titre || "Sans titre",
    type: "chantier" as const,
    phase: statusToPhase(c.status || "active", c.progression || 0),
    progression: c.progression ?? 0,
    urgence: chaleurToUrgence(c.chaleur || ""),
    botPrimaire: (c.bot_codes && c.bot_codes[0]) || "CEOB",
    echeance: c.echeance || "—",
    description: c.description || "",
  }));
}

function apiMissionsToPriorities(missions: any[]): PriorityItem[] {
  if (!Array.isArray(missions) || missions.length === 0) return [];
  // Only active/in-progress missions, max 10 for dashboard
  return missions
    .filter((m) => m.status === "active" || m.status === "a-faire" || m.status === "en-cours")
    .slice(0, 10)
    .map((m) => ({
      id: 10000 + m.id,
      titre: m.titre || "Mission sans titre",
      type: "operation" as const,
      phase: statusToPhase(m.status || "active", m.progression || 0),
      progression: m.progression ?? 0,
      urgence: (m.priorite >= 80 ? "critique" : m.priorite >= 50 ? "haute" : "normale") as PriorityItem["urgence"],
      botPrimaire: m.bot_primaire || "CEOB",
      echeance: m.completed_at ? m.completed_at.slice(0, 10) : "—",
      description: m.description || "",
    }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ═══ Types ═══

type LiveFilter = "tout" | "capex" | "opex";
type LiveSidebarItem = "overview" | "priorites" | "activite" | "agents";

// ProgressMiniPhased — importé depuis shared/ProgressMiniPhased.tsx

// ═══ Composant principal ═══

export function ExecutionLiveTab({ botCode }: { botCode: string }) {
  // Fetch real chantiers from API (registry "execution-live" → /api/v1/chantiers)
  const { data: rawChantiers, isLive } = useDataSource<any[]>("execution-live", []);
  // Fetch real missions for KPI count
  const { data: rawMissions } = useDataSource<any[]>("missions", []);

  // Transform API chantiers + missions → PriorityItem[] (or fallback to mock)
  const priorities: PriorityItem[] = isLive && rawChantiers.length > 0
    ? [...apiChantiersToPriorities(rawChantiers), ...apiMissionsToPriorities(Array.isArray(rawMissions) ? rawMissions : [])]
    : MOCK_PRIORITIES;

  // Dynamic KPIs from real data (or mock fallback)
  const dynamicKpis = isLive ? [
    { label: "Chantiers", value: String(rawChantiers.length), icon: Flame, delta: `${rawChantiers.filter((c: any) => c.chaleur === "brule").length} brûlent`, up: rawChantiers.length > 0, color: "text-orange-600" },
    { label: "Missions", value: String(Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "active" || m.status === "a-faire").length : 0), icon: Target, delta: `${Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "a-faire").length : 0} à faire`, up: false, color: "text-blue-600" },
    { label: "Complétées", value: String(Array.isArray(rawMissions) ? rawMissions.filter((m: any) => m.status === "completee").length : 0), icon: Settings, delta: "missions terminées", up: true, color: "text-cyan-600" },
    { label: "Progression", value: rawChantiers.length > 0 ? `${Math.round(rawChantiers.reduce((s: number, c: any) => s + (c.progression || 0), 0) / rawChantiers.length)}%` : "—", icon: BarChart3, delta: "moyenne chantiers", up: true, color: "text-emerald-600" },
  ] : MOCK_KPIS;

  const isMobile = useIsMobile();
  const [sidebarItem, setSidebarItem] = useState<LiveSidebarItem>("overview");
  const [filter, setFilter] = useState<LiveFilter>("tout");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const filteredPriorities = priorities.filter(p => {
    if (filter === "capex") return p.type === "chantier";
    if (filter === "opex") return p.type === "operation";
    return true;
  });

  const URGENCE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    critique: { color: "text-red-700", bg: "bg-red-100", label: "Critique" },
    haute: { color: "text-orange-700", bg: "bg-orange-100", label: "Haute" },
    normale: { color: "text-gray-600", bg: "bg-gray-100", label: "Normale" },
  };

  const ACTIVITY_ICON: Record<string, { icon: React.ElementType; color: string }> = {
    livrable: { icon: CheckCircle2, color: "text-emerald-500" },
    decision: { icon: Zap, color: "text-blue-500" },
    alerte: { icon: AlertTriangle, color: "text-red-500" },
    completion: { icon: CheckCircle2, color: "text-emerald-600" },
    creation: { icon: Flame, color: "text-orange-500" },
  };

  return (
    <div className="space-y-4">
      {/* Hero — Living Hero compact vert */}
      <LivingHero
        blur1="bg-green-100/70"
        blur2="bg-emerald-100/60"
        title="Votre entreprise, mobilisée."
        description="CAPEX + OPEX — priorités et progression."
        badge={<DomainBadge domain="execution-live" />}
      >
        <div className="relative w-[360px] h-[140px]">
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

      {/* 4 KPI cards — pattern Cockpit (header bleu pastel) */}
      <div className="grid grid-cols-2 gap-3">
        {dynamicKpis.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-gray-200 shadow-sm bg-white">
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

      {/* Sidebar + Contenu */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* Sidebar — MobileSidebarSheet sur mobile, SF.sidebarW sur desktop */}
        {(() => {
          const sidebarContent = (<>
            <div className={SF.sectionLabel}>Navigation</div>
            {([
              { key: "overview" as const, label: "Vue d'ensemble", icon: Home, count: null },
              { key: "agents" as const, label: "Agents en direct", icon: Cpu, count: null },
              { key: "priorites" as const, label: "Priorités", icon: AlertTriangle, count: filteredPriorities.length },
              { key: "activite" as const, label: "Activité récente", icon: Clock, count: MOCK_ACTIVITY.length /* TODO: wire to decision_log */ },
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
            <div className={SF.sectionLabel}>Filtre</div>
            {([
              { key: "tout" as const, label: "Tout" },
              { key: "capex" as const, label: "CAPEX (Chantiers)" },
              { key: "opex" as const, label: "OPEX (Opérations)" },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(SF.btnBase, filter === f.key ? SF.btnActive : SF.btnInactive)}
              >
                <span className={filter === f.key ? SF.labelActive : SF.labelInactive}>{f.label}</span>
              </button>
            ))}
          </>);
          const activeLabel = sidebarItem === "overview" ? "Vue d'ensemble" : sidebarItem === "priorites" ? "Priorités" : "Activité récente";
          return isMobile ? (
            <MobileSidebarSheet currentLabel={activeLabel} itemCount={6}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Section Agents en direct */}
          {(sidebarItem === "overview" || sidebarItem === "agents") && (
            <AgentPixelGrid />
          )}

          {/* Section Priorités */}
          {(sidebarItem === "overview" || sidebarItem === "priorites") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-900">Priorités</span>
              </div>
              <ViewModeToolbar viewMode={viewMode} onViewMode={setViewMode} count={filteredPriorities.length} label="éléments" />

              {/* Mode liste */}
              {viewMode === "list" && (
                <div className="space-y-1">
                  {filteredPriorities.map(item => {
                    const urg = URGENCE_CONFIG[item.urgence];
                    const phaseConf = PHASE_COLORS[item.phase];
                    return (
                      <div key={item.id} className={SF.listRow}>
                        {item.type === "chantier" ? <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" /> : <Settings className="h-3.5 w-3.5 text-cyan-500 shrink-0" />}
                        <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.titre}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", urg.bg, urg.color)}>{urg.label}</span>
                        {phaseConf && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", phaseConf.badge)}><span className={cn("w-1.5 h-1.5 rounded-full", phaseConf.dot)} />{phaseConf.label}</span>}
                        <div className="w-16 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
                        <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>
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
                      <th className={SF.tableTh}>Urgence</th>
                      <th className={SF.tableTh}>Phase</th>
                      <th className={cn(SF.tableTh, "w-24")}>Progression</th>
                      <th className={SF.tableTh}>Échéance</th>
                    </tr></thead>
                    <tbody>
                      {filteredPriorities.map(item => {
                        const urg = URGENCE_CONFIG[item.urgence];
                        const phaseConf = PHASE_COLORS[item.phase];
                        return (
                          <tr key={item.id} className={SF.tableTr}>
                            <td className={cn(SF.tableTd, "font-medium text-gray-900")}>{item.titre}</td>
                            <td className={SF.tableTd}><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", item.type === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>{item.type === "chantier" ? "CAPEX" : "OPEX"}</span></td>
                            <td className={SF.tableTd}><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", urg.bg, urg.color)}>{urg.label}</span></td>
                            <td className={SF.tableTd}>{phaseConf && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", phaseConf.badge)}>{phaseConf.label}</span>}</td>
                            <td className={SF.tableTd}><ProgressMiniPhased value={item.progression} phase={item.phase} /></td>
                            <td className={cn(SF.tableTd, "text-gray-500")}>{item.echeance}</td>
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
                  {filteredPriorities.map(item => {
                    const urg = URGENCE_CONFIG[item.urgence];
                    const phaseConf = PHASE_COLORS[item.phase];
                    return (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            {item.type === "chantier"
                              ? <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                              : <Settings className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                            }
                            <span className="text-[11px] font-bold text-gray-900 flex-1 truncate">{item.titre}</span>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", urg.bg, urg.color)}>{urg.label}</span>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", item.type === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>
                              {item.type === "chantier" ? "CAPEX" : "OPEX"}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mb-2">{item.description}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <ProgressMiniPhased value={item.progression} phase={item.phase} />
                            </div>
                            {phaseConf && (
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1", phaseConf.tag)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", phaseConf.dot)} />
                                {phaseConf.label}
                              </span>
                            )}
                            {BOT_AVATAR_MAP[item.botPrimaire] && (
                              <img src={BOT_AVATAR_MAP[item.botPrimaire]} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200" />
                            )}
                            <span className="text-[9px] text-gray-400">{item.echeance}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section Activité récente */}
          {(sidebarItem === "overview" || sidebarItem === "activite") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-900">Activité récente</span>
                <span className="text-[9px] text-gray-400">{MOCK_ACTIVITY.length} événements</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_ACTIVITY.filter(a => {
                  if (filter === "capex") return a.source === "chantier";
                  if (filter === "opex") return a.source === "operation";
                  return true;
                }).map(item => {
                  const actConf = ACTIVITY_ICON[item.type] || { icon: ArrowRight, color: "text-gray-400" };
                  return (
                    <div key={item.id} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:bg-gray-50 transition-colors">
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
          )}
        </div>
      </div>
    </div>
  );
}
