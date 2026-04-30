/**
 * CockpitView.tsx — Tableau de bord département
 *
 * Extrait de BlueprintDepartement.tsx L8494-9971 (1,478 lignes)
 * Structure: LivingHero → Grid VITAA → Vedettes grid-cols-3 → Sidebar w-[180px] + Contenu grid-cols-2
 */

import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "../../v2/zones/center/layouts";
import { useBots } from "../../v2/api/hooks";
import { useChantiers } from "../../v2/api/hooks";
import {
  Activity, AlertTriangle, Atom, Award, Banknote, BarChart3, Bell,
  BookOpen, Bot, Brain, Bug, Building2, Calendar, ChevronRight,
  ClipboardCheck, Clock, Cog, Cpu, Crown, Database, DollarSign,
  Eye, FileLock, FileText, Gauge, Gavel, Globe, GraduationCap,
  Hammer, Handshake, HardHat, Heart, Info, ListChecks, Lock,
  MessageCircle, Network, Newspaper, Package, PieChart, Play,
  Receipt, Rocket, Scale, Search, Settings, Shield, ShieldCheck,
  ShoppingBag, Sparkles, Star, TrendingDown, TrendingUp, Truck,
  User, Users, Wallet, Wrench, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";
import { DEPT_SHORT_LABEL, DEPT_FULL_LABEL, DEPT_GRADIENT, DEPT_DASH_ICON, PHASE_COLORS, type PhaseKey } from "./shared/dept-data";
import {
  type VitaaItem,
  type DashboardBlocItem,
  type DashboardBlocConfig,
  type DeptDashboardConfig,
  DEPT_DASHBOARD_SECTIONS,
  WORK_ACTIONS,
  DEPT_ORDER,
  COCKPIT_EXTRA_BLOCS,
} from "../data/mock/cockpit.mock";
export type { DashboardBlocItem, DashboardBlocConfig };
export { WORK_ACTIONS, DEPT_ORDER };


/* ── Mock data removed — now in ../data/mock/cockpit.mock.ts ── */

/** Rollover unique — 5 boutons d'action. UN composant, ZÉRO silo.
 *  position="center" (défaut) = centré vertical (pour lignes de liste)
 *  position="top"            = coin haut-droit (pour cards hautes) */
export function WorkActionsOverlay({ context, onAction, deliverable, position = "center" }: { context: string; onAction: (phase: PhaseKey, ctx: string, deliverable?: string) => void; deliverable?: string; position?: "center" | "top" }) {
  return (
    <div className={cn(
      "hidden group-hover:flex items-center gap-1 absolute right-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 px-1 py-0.5 z-20",
      position === "center" ? "top-1/2 -translate-y-1/2" : "top-2"
    )}>
      {WORK_ACTIONS.map(wa => (
        <button
          key={wa.key}
          onClick={(e) => { e.stopPropagation(); onAction(wa.key, context, deliverable); }}
          className={cn("p-1 rounded-md transition-colors cursor-pointer text-gray-700", wa.hover)}
          title={wa.label}
        >
          <wa.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

// ── CockpitItemRow — Ligne d'item réutilisable (box grid + drill-down detail) ──
// Structure plate : <li group relative> → contenu + WorkActionsOverlay sibling direct
export function CockpitItemRow({ item, index, onAction, showNumber }: {
  item: DashboardBlocItem;
  index: number;
  onAction?: (phase: PhaseKey, context: string, deliverable?: string) => void;
  showNumber?: boolean;
}) {
  const ps = item.phase ? PHASE_COLORS[item.phase] : null;
  return (
    <li className="group relative px-4 py-2 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2.5 text-xs text-gray-800">
        {showNumber && (
          <span className="text-[10px] font-bold text-white bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{index + 1}</span>
        )}
        {item.urgent && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Urgent" />}
        <div className="flex-1 min-w-0">
          {item.pct !== undefined ? (
            <>
              <div className="flex justify-between mb-0.5">
                <span className="font-medium">{item.primary}</span>
                <span className="font-bold">{item.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.pctColor || "bg-blue-500")} style={{ width: `${item.pct}%` }} />
              </div>
              {item.secondary && <p className="text-[11px] text-gray-400 mt-0.5">{item.secondary}</p>}
            </>
          ) : item.value ? (
            <>
              <div className="flex justify-between">
                <span className="font-medium">{item.primary}</span>
                <span className={cn("font-bold", item.valueColor || "text-gray-700")}>{item.value}</span>
              </div>
              <p className="text-[11px] text-gray-400">{item.secondary}</p>
            </>
          ) : (
            <>
              <span className="font-medium">{item.primary}</span>
              {item.secondary && <p className="text-[11px] text-gray-400">{item.secondary}</p>}
            </>
          )}
        </div>
        {ps && (
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
            <span className={cn("w-2 h-2 rounded-full", ps.dot)} />
            {ps.label}
          </span>
        )}
      </div>
      {onAction && <WorkActionsOverlay context={item.primary} onAction={onAction} deliverable={item.deliverable} />}
    </li>
  );
}

/** Derive le type de focus à partir du titre du bloc cockpit */
function deriveFocusType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("chantier")) return "chantier";
  if (t.includes("projet")) return "projet";
  if (t.includes("mission")) return "mission";
  if (t.includes("tâche") || t.includes("tache")) return "tache";
  if (t.includes("pipeline")) return "chantier";
  if (t.includes("simulation")) return "projet";
  return "kpi";
}

// ── CockpitCard — Pattern Playbook Store card (box dans la grid 2 cols) ──
// Pas de overflow-hidden sur le wrapper → WorkActionsOverlay visible
export function CockpitCard({ config, onAction, onHeaderClick }: {
  config: DashboardBlocConfig;
  onAction?: (phase: PhaseKey, context: string, deliverable?: string, focusType?: string) => void;
  onHeaderClick?: () => void;
}) {
  const Icon = config.icon;
  const ft = deriveFocusType(config.title);
  const itemAction = onAction ? (p: PhaseKey, c: string, d?: string) => onAction(p, c, d, ft) : undefined;
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
      <div
        className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl", onHeaderClick && "cursor-pointer hover:bg-[#00B4D8]/20 transition-colors")}
        onClick={onHeaderClick}
      >
        <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{config.title}</span>
        {config.count !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{config.count}</span>
        )}
        {onHeaderClick && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </div>
      <ul className="py-1">
        {config.items.map((item, i) => (
          <CockpitItemRow key={i} item={item} index={i} onAction={itemAction} />
        ))}
      </ul>
    </div>
  );
}

// ── CockpitSignalCard — Card vedette gradient "À porter attention" ──
// group relative sur le div principal, WorkActionsOverlay sibling direct, PAS de overflow-hidden
export function CockpitSignalCard({ item, onAction }: {
  item: DashboardBlocItem;
  onAction?: (phase: PhaseKey, context: string, deliverable?: string, focusType?: string) => void;
}) {
  const tag = getSignalTag(item);
  const itemAction = onAction ? (p: PhaseKey, c: string, d?: string) => onAction(p, c, d, "signal") : undefined;
  const ps = item.phase ? PHASE_COLORS[item.phase] : null;
  return (
    <div className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r", getSignalGradient(item))}>
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {item.urgent && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", tag.classes)}>{tag.label}</span>
        {ps && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            {ps.label}
          </span>
        )}
      </div>
      <h4 className="text-sm font-bold text-white leading-tight">{item.primary}</h4>
      <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed">{item.secondary}</p>
      {itemAction && <WorkActionsOverlay context={item.primary} onAction={itemAction} deliverable={item.deliverable} position="top" />}
    </div>
  );
}

// ── CockpitSectionHeader — Header de section (exact Playbook Store) ──
export function CockpitSectionHeader({ icon: Icon, title, count, color = "text-amber-500" }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", color)} /> {title}
      </h3>
      {count !== undefined && <span className="text-[9px] text-gray-400">{count}</span>}
    </div>
  );
}

// DashboardBloc legacy + DeptDashboardView — RETIRÉS (remplacés par CockpitView)



export function CockpitBlocDetail({ config, deptLabel, deptGradient, onBack, onAction }: {
  config: DashboardBlocConfig;
  deptLabel: string;
  deptGradient: string;
  onBack: () => void;
  onAction?: (phase: PhaseKey, context: string, deliverable?: string, focusType?: string) => void;
}) {
  const ft = deriveFocusType(config.title);
  const itemAction = onAction ? (p: PhaseKey, c: string, d?: string) => onAction(p, c, d, ft) : undefined;
  const Icon = config.icon;
  const urgentCount = config.items.filter(it => it.urgent).length;
  const withPhase = config.items.filter(it => it.phase);
  const phaseDistrib = withPhase.reduce((acc, it) => { if (it.phase) acc[it.phase] = (acc[it.phase] || 0) + 1; return acc; }, {} as Record<string, number>);
  const avgPct = config.items.filter(it => it.pct !== undefined).length > 0
    ? Math.round(config.items.filter(it => it.pct !== undefined).reduce((a, it) => a + (it.pct || 0), 0) / config.items.filter(it => it.pct !== undefined).length)
    : null;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour à la vue d&apos;ensemble
      </button>

      {/* Hero compact + Stats inline */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              <Icon className="h-5 w-5 text-white shrink-0" />
              {config.title}
            </h3>
            <span className="text-[10px] text-white/60 font-medium">{deptLabel}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-white/80"><ListChecks className="h-3.5 w-3.5" />{config.items.length} éléments</span>
            {config.count !== undefined && <span className="flex items-center gap-1 text-[10px] text-white/80"><Activity className="h-3.5 w-3.5" />{config.count} total</span>}
            {urgentCount > 0 && <span className="flex items-center gap-1 text-[10px] font-bold text-white"><AlertTriangle className="h-3.5 w-3.5" />{urgentCount} urgent{urgentCount > 1 ? "s" : ""}</span>}
            {avgPct !== null && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/15 text-white">{avgPct}% moy.</span>}
            {Object.entries(phaseDistrib).map(([phase, count]) => {
              const pc = PHASE_COLORS[phase as PhaseKey];
              return pc ? (
                <span key={phase} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1", pc.badge)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", pc.dot)} />
                  {pc.label} ({count})
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Liste détaillée — réutilise CockpitItemRow avec numéros */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl")}>
          <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1 truncate">Éléments — {config.title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{config.items.length} items</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {config.items.map((item, i) => (
            <CockpitItemRow key={i} item={item} index={i} onAction={itemAction} showNumber />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Gradient colors for signal vedette cards based on urgency/type
export function getSignalGradient(item: DashboardBlocItem): string {
  if (item.urgent || item.value === "Alerte") return "from-red-600 to-red-500";
  if (item.value === "Nouveau") return "from-emerald-600 to-emerald-500";
  if (item.value === "Tendance" || item.value === "Info" || item.value === "Stable" || item.value === "Suivi") return "from-blue-600 to-blue-500";
  if (item.value === "Étude" || item.value === "Requis") return "from-amber-600 to-amber-500";
  return "from-slate-600 to-slate-500";
}

// Tag label + style for signal vedette cards — consistent across all departments
export function getSignalTag(item: DashboardBlocItem): { label: string; classes: string } {
  if (item.urgent || item.value === "Alerte") return { label: "Alerte", classes: "bg-red-400/30 text-white" };
  if (item.value === "Nouveau") return { label: "Opportunité", classes: "bg-emerald-400/30 text-white" };
  if (item.value === "Tendance") return { label: "Tendance", classes: "bg-sky-400/30 text-white" };
  if (item.value === "Info" || item.value === "Stable" || item.value === "Suivi") return { label: "Veille", classes: "bg-sky-400/30 text-white" };
  if (item.value === "Étude" || item.value === "Requis") return { label: "À suivre", classes: "bg-amber-400/30 text-white" };
  return { label: "Veille", classes: "bg-white/15 text-white" };
}

export function CockpitView({ embedded = false, onAction, initialDept = "CEOB" }: { embedded?: boolean; onAction?: (phase: string, context: string, deliverable?: string, focusType?: string) => void; initialDept?: string }) {
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedBloc, setSelectedBloc] = useState<DashboardBlocConfig | null>(null);

  // ═══ Data source — simu→live switchable ═══
  const { data: cockpitSections, source: cockpitSource } = useDataSource("cockpit-sections", DEPT_DASHBOARD_SECTIONS);
  const { data: cockpitExtras } = useDataSource("cockpit-extras", COCKPIT_EXTRA_BLOCS);

  // ═══ API réelle — données vivantes ═══
  const { bots } = useBots();
  const { chantiers: apiChantiers } = useChantiers();

  // Compteurs réels par département
  const realCounts = useMemo(() => {
    const counts: Record<string, { chantiers: number; brule: number; missions: number }> = {};
    for (const ch of apiChantiers) {
      const deptCodes = ch.bot_codes?.length ? ch.bot_codes : ["CEOB"];
      for (const code of deptCodes) {
        if (!counts[code]) counts[code] = { chantiers: 0, brule: 0, missions: 0 };
        counts[code].chantiers++;
        if (ch.chaleur === "brule") counts[code].brule++;
        counts[code].missions += ch.missions_count || 0;
      }
    }
    return counts;
  }, [apiChantiers]);

  // Sync quand le bot change depuis l'extérieur
  useEffect(() => { setSelectedDept(initialDept); setSelectedBloc(null); }, [initialDept]);
  const config = cockpitSections[selectedDept] || cockpitSections.CEOB;
  const DeptIcon = DEPT_DASH_ICON[selectedDept] || Zap;
  const deptLabel = DEPT_SHORT_LABEL[selectedDept] || "Direction";
  const gradient = DEPT_GRADIENT[selectedDept] || DEPT_GRADIENT.CEOB;
  const handleAction = onAction as ((phase: PhaseKey, context: string, deliverable?: string, focusType?: string) => void) | undefined;

  // Signaux = row1[0] → bande vedette. Reste = 8 boxes + 2 extras = 10 boxes.
  const signalItems = config.row1[0]?.items || [];
  const gridBlocs = [
    ...(cockpitExtras[selectedDept] || []),
    ...config.row1.slice(1),
    ...config.row2,
    ...config.row3,
  ];

  const Wrapper = embedded ? "div" : PageLayout;
  const wrapperProps = embedded ? { className: "space-y-3" } : { maxWidth: "5xl" as const };

  return (
    <Wrapper {...wrapperProps as any}>
      {/* Hero — Living Heroes V20 Cockpit */}
      <LivingHero
        blur1="bg-blue-100" blur2="bg-cyan-100/50"
        title="Votre pouls, en direct."
        description="Alertes, signaux et KPIs. Décidez vite."
        badge={<DomainBadge domain="cockpit-sections" />}
      >
        <div className="relative w-[360px] h-[140px]">
          <div className="absolute right-[10px] bottom-[-20px] w-40 h-40 opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5"/><circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2"/><line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/><line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/><g className="anim-radar"><path d="M50 50 L50 5 A45 45 0 0 1 95 50 Z" fill="url(#radar-grad-ck)"/></g><defs><radialGradient id="radar-grad-ck" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></radialGradient></defs></svg>
          </div>
          <div className="glass-base absolute right-[60px] top-[10px] w-64 h-40 p-5 border-blue-100">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{fontFamily:'ui-monospace,monospace'}}>Vitesse de croissance</h4>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /><span className="text-[9px] font-bold text-blue-500 tracking-wider">EN DIRECT</span></div>
            </div>
            <div className="absolute inset-x-5 top-12 bottom-6 flex flex-col justify-between opacity-20"><div className="w-full h-px bg-blue-300" /><div className="w-full h-px bg-blue-300" /><div className="w-full h-px bg-blue-300" /></div>
            <div className="relative flex items-end justify-between gap-3 h-[60px] w-full mt-2">
              <div className="w-8 bg-gradient-to-t from-blue-100 to-blue-300 rounded-sm anim-bar-1" style={{height:'30%'}} />
              <div className="w-8 bg-gradient-to-t from-blue-100 to-blue-400 rounded-sm anim-bar-2" style={{height:'50%'}} />
              <div className="w-8 bg-gradient-to-t from-cyan-200 to-cyan-400 rounded-t-sm shadow-[0_0_15px_rgba(34,211,238,0.4)] anim-bar-3 relative" style={{height:'80%'}}><div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white rounded-full" /></div>
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M 10 70 Q 50 60 90 20" fill="none" stroke="url(#line-grad-ck)" strokeWidth="3" strokeLinecap="round" className="anim-curve"/><defs><linearGradient id="line-grad-ck" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient></defs></svg>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* VITAA 5 piliers */}
      <div className="grid grid-cols-5 gap-3">
        {config.vitaa.map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className={cn("text-xs flex items-center justify-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bande vedette — CockpitSignalCard */}
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

      {/* Sidebar départements + Contenu */}
      <div className="flex gap-3">
        {/* Sidebar départements — CEOB seulement (poupée russe: Direction voit tout, autres = scopé) */}
        {initialDept === "CEOB" && (
        <div className={cn("w-[180px] shrink-0 space-y-0.5 transition-all", selectedBloc && "pt-8")}>
          {DEPT_ORDER.map(code => {
            const isActive = selectedDept === code;
            const Icon = DEPT_DASH_ICON[code] || Zap;
            const label = DEPT_SHORT_LABEL[code] || code;
            const deptConfig = cockpitSections[code];
            const extras = cockpitExtras[code] || [];
            const itemCount = deptConfig ? [...deptConfig.row1.slice(1), ...deptConfig.row2, ...deptConfig.row3, ...extras].reduce((acc, b) => acc + b.items.length, 0) : 0;
            return (
              <button
                key={code}
                onClick={() => { setSelectedDept(code); setSelectedBloc(null); }}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{label}</span>
                  {realCounts[code]?.chantiers ? (
                    <span className="text-[9px] font-bold text-blue-500">{realCounts[code].chantiers}</span>
                  ) : (
                    <span className="text-[9px] text-gray-400">{itemCount}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        )}

        {/* Contenu — CockpitCard grid 2 cols OU drill-down CockpitBlocDetail */}
        <div className="flex-1 min-w-0 space-y-3">
          {selectedBloc ? (
            <CockpitBlocDetail config={selectedBloc} deptLabel={deptLabel} deptGradient={gradient} onBack={() => setSelectedBloc(null)} onAction={handleAction} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gridBlocs.map((bloc, i) => (
                <CockpitCard key={i} config={bloc} onAction={handleAction} onHeaderClick={() => setSelectedBloc(bloc)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

// ══════════════════════════════════════════
// COMPOSANT PRINCIPAL — Layout DocForge (Sidebar TOC + Contenu)
// ══════════════════════════════════════════

interface BlueprintViewProps {
  botCode: string;
  headerGradient: string;
  sizeTier?: SizeTier;
  /** Quand true, le header gradient interne est caché (intégré dans la top barre parent) */
  hideHeader?: boolean;
  /** State lifté: vue active (blueprint/ca/comites/personnel/bot) contrôlée par le parent */
  activeHeaderView?: HeaderView;
  /** Callback quand l'utilisateur change de sous-tab */
  onHeaderViewChange?: (view: HeaderView) => void;
  /** Callback pour remonter tier + score au parent */
  onStats?: (stats: { tier: string; tierLabel: string; score: number }) => void;
  /** Quand true, applique le style V2 (pattern Cockpit/Playbook Store) */
  useV2Style?: boolean;
  /** Quand true, rend SEULEMENT le contenu (grille sections + drill-down), sans sidebar/hero/KPIs */
  contentOnly?: boolean;
  /** Section active forcée depuis le parent (utilisé avec contentOnly pour synchroniser sidebar parent) */
  activeSectionId?: string;
}

