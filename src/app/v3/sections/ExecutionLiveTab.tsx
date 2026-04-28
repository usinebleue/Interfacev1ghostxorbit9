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
  BarChart3, Zap, ListChecks,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { PHASE_COLORS, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { SF } from "../core/styles";

// ═══ Types ═══

type LiveFilter = "tout" | "capex" | "opex";
type LiveSidebarItem = "overview" | "priorites" | "activite";

interface PriorityItem {
  id: number;
  titre: string;
  type: "chantier" | "operation";
  phase: PhaseKey;
  progression: number;
  urgence: "critique" | "haute" | "normale";
  botPrimaire: string;
  echeance: string;
  description: string;
}

interface ActivityItem {
  id: number;
  date: string;
  type: "livrable" | "decision" | "alerte" | "completion" | "creation";
  message: string;
  source: "chantier" | "operation";
  sourceName: string;
  auteur: string;
}

// ═══ Mock data — agrégation Chantiers + Opérations ═══

const MOCK_KPIS = [
  { label: "Chantiers actifs", value: "4", icon: Flame, delta: "+1 ce mois", up: true, color: "text-orange-600" },
  { label: "Missions en cours", value: "12", icon: Target, delta: "3 à livrer", up: false, color: "text-blue-600" },
  { label: "Opérations actives", value: "6", icon: Settings, delta: "98% SLA", up: true, color: "text-cyan-600" },
  { label: "Régularité globale", value: "87%", icon: BarChart3, delta: "+3 pts", up: true, color: "text-emerald-600" },
];

const MOCK_PRIORITIES: PriorityItem[] = [
  { id: 1, titre: "Implantation ERP Module Ventes", type: "chantier", phase: "execution", progression: 65, urgence: "critique", botPrimaire: "CTOB", echeance: "2026-05-15", description: "Migration CRM → ERP ventes. Phase Go-Live critique." },
  { id: 2, titre: "Cycle de facturation mensuel", type: "operation", phase: "execution", progression: 92, urgence: "haute", botPrimaire: "CFOB", echeance: "2026-04-30", description: "Processus récurrent — SLA 48h. Relance automatique." },
  { id: 3, titre: "Refonte site web corporatif", type: "chantier", phase: "creation", progression: 35, urgence: "haute", botPrimaire: "CMOB", echeance: "2026-06-01", description: "Design V3 + migration contenu. Maquettes en validation." },
  { id: 4, titre: "Pipeline CI/CD automatisation", type: "operation", phase: "execution", progression: 88, urgence: "normale", botPrimaire: "CTOB", echeance: "Récurrent", description: "Déploiement continu — tests + staging + prod." },
  { id: 5, titre: "Campagne acquisition Q2", type: "chantier", phase: "reflexion", progression: 15, urgence: "normale", botPrimaire: "CMOB", echeance: "2026-07-01", description: "Stratégie multicanal en planification." },
  { id: 6, titre: "Revue de performance mensuelle", type: "operation", phase: "execution", progression: 95, urgence: "haute", botPrimaire: "COOB", echeance: "2026-04-28", description: "Boucle PDCA — collecte KPIs + bilan direction." },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 1, date: "il y a 2h", type: "livrable", message: "Maquette homepage V3 livrée", source: "chantier", sourceName: "Refonte site web", auteur: "Mathilde (CMO)" },
  { id: 2, date: "il y a 3h", type: "decision", message: "Go-Live ERP reporté au 15 mai (validation QA)", source: "chantier", sourceName: "Implantation ERP", auteur: "CarlOS (CEO)" },
  { id: 3, date: "il y a 5h", type: "completion", message: "Cycle facturation avril — 98% conformité", source: "operation", sourceName: "Facturation mensuelle", auteur: "Frank (CFO)" },
  { id: 4, date: "hier", type: "alerte", message: "SLA relance dépassé de 4h sur 2 comptes", source: "operation", sourceName: "Facturation mensuelle", auteur: "Système" },
  { id: 5, date: "hier", type: "creation", message: "Nouveau chantier: Campagne acquisition Q2", source: "chantier", sourceName: "Campagne Q2", auteur: "Simone (CSO)" },
  { id: 6, date: "il y a 2j", type: "livrable", message: "Pipeline CI/CD V2 déployé — temps de build -40%", source: "operation", sourceName: "Pipeline CI/CD", auteur: "Tim (CTO)" },
  { id: 7, date: "il y a 2j", type: "decision", message: "Budget marketing Q2 approuvé: 45K$", source: "chantier", sourceName: "Campagne Q2", auteur: "CarlOS (CEO)" },
  { id: 8, date: "il y a 3j", type: "completion", message: "Revue performance mars terminée — 4 actions identifiées", source: "operation", sourceName: "Revue de performance", auteur: "Olivier (COO)" },
];

// ═══ Progress bar — copie ChantierView ═══
function ProgressMiniPhased({ value, phase }: { value: number; phase?: PhaseKey }) {
  const pct = Math.min(100, Math.max(0, value));
  const phaseColor = phase ? PHASE_COLORS[phase]?.dot : null;
  const fallback = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", phaseColor || fallback)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-bold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ═══ Composant principal ═══

export function ExecutionLiveTab({ botCode }: { botCode: string }) {
  const [sidebarItem, setSidebarItem] = useState<LiveSidebarItem>("overview");
  const [filter, setFilter] = useState<LiveFilter>("tout");

  const filteredPriorities = MOCK_PRIORITIES.filter(p => {
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
    <div>
      {/* Hero — Living Hero compact vert */}
      <LivingHero
        blur1="bg-green-100/70"
        blur2="bg-emerald-100/60"
        subtitleColor="text-emerald-600"
        subtitle="Exécution en temps réel"
        title="Tout ce qui mobilise votre entreprise."
        description="Vue consolidée de vos chantiers CAPEX et opérations OPEX — priorités, progression et activité récente."
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

      {/* 4 KPI cards compacts */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {MOCK_KPIS.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm p-3">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-xl font-extrabold text-gray-900">{kpi.value}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {kpi.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
              <span className={cn("text-[9px] font-medium", kpi.up ? "text-emerald-600" : "text-amber-600")}>{kpi.delta}</span>
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
            { key: "priorites" as const, label: "Priorités", icon: AlertTriangle, count: filteredPriorities.length },
            { key: "activite" as const, label: "Activité récente", icon: Clock, count: MOCK_ACTIVITY.length },
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
        </div>

        {/* Contenu principal */}
        <div className="flex-1 space-y-4">
          {/* Section Priorités */}
          {(sidebarItem === "overview" || sidebarItem === "priorites") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-900">Priorités</span>
                <span className="text-[9px] text-gray-400">{filteredPriorities.length} éléments</span>
              </div>
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
