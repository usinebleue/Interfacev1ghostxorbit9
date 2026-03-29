/**
 * SectionComponents.tsx — Composants partages pour Strategique / Mon Bureau / Mon Reseau
 * StatusBadge, BotBadge, ChaleurBadge, PlaybookCard, TemplateSection, KPICard
 */

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, BookOpen, Sparkles, Package, Play, Loader2, CheckCircle2, Inbox } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import {
  STATUS_CONFIG, CHALEUR_CONFIG, BOT_INFO, TYPE_COLORS,
  PLAYBOOK_TEMPLATES,
} from "./section-config";
import type { PlaybookTemplate, KPIConfig, BreadcrumbItem } from "./section-types";

// ================================================================
// BADGES
// ================================================================

export function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", cfg.bg, cfg.text, cfg.border)}>
      {cfg.label}
    </span>
  );
}

export function BotBadge({ code }: { code: string | { code?: string; nom?: string } }) {
  const resolvedCode = typeof code === "object" ? (code?.code || "?") : code;
  const info = BOT_INFO[resolvedCode];
  if (!info) return <span className="text-[9px] text-gray-400">{resolvedCode}</span>;
  return (
    <span className={cn("text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", info.gradient)}>
      {info.label || resolvedCode}
    </span>
  );
}

const VISIBILITY_CONFIG = {
  interne:    { emoji: "\uD83D\uDD12", label: "Interne",    bg: "bg-gray-100",    text: "text-gray-600",  border: "border-gray-200" },
  equipe:     { emoji: "\uD83D\uDC65", label: "\u00C9quipe",     bg: "bg-blue-50",     text: "text-blue-600",  border: "border-blue-200" },
  client:     { emoji: "\uD83D\uDC41",  label: "Client",     bg: "bg-amber-50",    text: "text-amber-600", border: "border-amber-200" },
  partenaire: { emoji: "\uD83C\uDF10", label: "Partenaire", bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-200" },
  reseau:     { emoji: "\uD83D\uDD17", label: "R\u00E9seau",     bg: "bg-purple-50",   text: "text-purple-600", border: "border-purple-200" },
} as const;

export function VisibilityBadge({ visibility }: { visibility: keyof typeof VISIBILITY_CONFIG }) {
  const cfg = VISIBILITY_CONFIG[visibility] || VISIBILITY_CONFIG.interne;
  return (
    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded border inline-flex items-center gap-1", cfg.bg, cfg.text, cfg.border)}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

export function ChaleurBadge({ chaleur }: { chaleur: keyof typeof CHALEUR_CONFIG }) {
  const cfg = CHALEUR_CONFIG[chaleur];
  const Icon = cfg.icon;
  return (
    <span className={cn("flex items-center gap-1 text-[9px] font-bold", cfg.color)}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

// ================================================================
// PLAYBOOK CARDS
// ================================================================

export interface PlaybookDeployOptions {
  parent_chantier_id?: number;
  parent_projet_id?: number;
  parent_mission_id?: number;
}

export function PlaybookCard({ pb, compact = false, onDeploy }: {
  pb: PlaybookTemplate;
  compact?: boolean;
  onDeploy?: (playbookId: string, options?: PlaybookDeployOptions) => Promise<void>;
}) {
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const tc = TYPE_COLORS[pb.type] || TYPE_COLORS.strategique;

  const handleDeploy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeploy || deploying || deployed) return;
    setDeploying(true);
    try {
      await onDeploy(pb.id);
      setDeployed(true);
      setTimeout(() => setDeployed(false), 3000);
    } catch {
      // error handled by parent
    } finally {
      setDeploying(false);
    }
  }, [onDeploy, pb.id, deploying, deployed]);

  return (
    <Card className={cn("p-0 overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer group", tc.border)}>
      <div className="px-3 py-2 flex items-center gap-2">
        <Package className={cn("h-4 w-4 shrink-0", tc.text)} />
        <span className={cn("text-xs font-bold flex-1 truncate", tc.text)}>{pb.titre}</span>
        {pb.populaire && <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
        <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold border", tc.bg, tc.text, tc.border)}>{pb.type.toUpperCase()}</span>
        {onDeploy && (
          <button
            onClick={handleDeploy}
            disabled={deploying || deployed}
            className={cn(
              "flex items-center gap-1 text-[8px] font-bold px-2 py-1 rounded transition-all",
              deployed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            )}
          >
            {deploying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : deployed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {deploying ? "..." : deployed ? "OK" : "Deployer"}
          </button>
        )}
      </div>
      {!compact && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-[9px] text-gray-500 leading-relaxed">{pb.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {pb.bots.map((b) => <BotBadge key={b} code={b} />)}
          </div>
          <div className="flex items-center gap-3 text-[9px] text-gray-400">
            <span>{pb.nb_projets} projet{pb.nb_projets > 1 ? "s" : ""}</span>
            <span>{pb.nb_missions} mission{pb.nb_missions > 1 ? "s" : ""}</span>
            <span>{pb.duree}</span>
            {pb.industrie && <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded font-medium text-gray-500">{pb.industrie}</span>}
          </div>
        </div>
      )}
    </Card>
  );
}

/** Section Templates reutilisable pour chaque tab */
export function TemplateSection({ niveau, label, onDeploy }: {
  niveau: PlaybookTemplate["niveau"];
  label: string;
  onDeploy?: (playbookId: string, options?: PlaybookDeployOptions) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(true);
  const templates = PLAYBOOK_TEMPLATES.filter((p) => p.niveau === niveau);
  if (templates.length === 0) return null;

  return (
    <Card className="p-0 overflow-hidden border border-dashed border-indigo-200 bg-indigo-50/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-indigo-50/50 transition-colors"
      >
        <BookOpen className="h-4 w-4 text-indigo-500" />
        <span className="text-xs font-bold text-indigo-700">Templates {label}</span>
        <span className="text-[9px] px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold ml-1">{templates.length}</span>
        <span className="text-[9px] text-indigo-400 ml-auto">Kits Lego pre-fabriques</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {templates.map((pb) => (
            <PlaybookCard key={pb.id} pb={pb} onDeploy={onDeploy} />
          ))}
        </div>
      )}
    </Card>
  );
}

// ================================================================
// KPI CARD — Carte cliquable avec icone + valeur + label
// ================================================================

export function KPICard({ kpi }: { kpi: KPIConfig }) {
  const Icon = kpi.icon;
  return (
    <button
      onClick={kpi.onClick}
      className={cn(
        "text-left p-0 overflow-hidden rounded-lg border shadow-sm transition-all",
        kpi.onClick ? "hover:shadow-md cursor-pointer group" : "cursor-default"
      )}
    >
      <div className={cn("flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
        <Icon className="h-3.5 w-3.5 text-white" />
        <span className="text-[9px] font-bold text-white uppercase">{kpi.label}</span>
        {kpi.onClick && <ChevronRight className="h-3.5 w-3.5 text-white/50 ml-auto group-hover:text-white transition-colors" />}
      </div>
      <div className="px-3 py-2">
        <div className={cn("text-xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
        {kpi.sub && <div className="text-[9px] text-gray-400">{kpi.sub}</div>}
      </div>
    </button>
  );
}

// ================================================================
// BLOC — Card avec gradient header + liste items (pattern DepartmentTourDeControle)
// ================================================================

export interface BlocItem {
  primary: string;
  secondary: string;
  value?: string;
  valueColor?: string;
  pct?: number;
  pctColor?: string;
}

export interface BlocConfig {
  icon: React.ElementType;
  title: string;
  gradient: string;
  count?: number;
  items: BlocItem[];
}

export function BlockHeader({ icon: Icon, title, count, gradient }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  gradient: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r", gradient)}>
      <Icon className="h-4 w-4 text-white" />
      <h3 className="text-sm font-bold text-white flex-1">{title}</h3>
      {count !== undefined && (
        <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  );
}

export function Bloc({ config, onClick }: { config: BlocConfig; onClick?: () => void }) {
  return (
    <Card className={cn("p-0 overflow-hidden rounded-xl shadow-sm transition-shadow", onClick ? "cursor-pointer hover:shadow-md" : "")} onClick={onClick}>
      <BlockHeader icon={config.icon} title={config.title} count={config.count} gradient={config.gradient} />
      <ul className="px-3 py-3 space-y-2.5">
        {config.items.map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
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
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ================================================================
// LOADING & EMPTY STATES
// ================================================================

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Chargement...</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
      <Inbox className="h-8 w-8" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// ================================================================
// STAT GRID — 2 a 4 colonnes (pattern HierarchieGHML)
// ================================================================

export function StatGrid({ items }: { items: { value: number; label: string; color: string }[] }) {
  return (
    <div className={cn("grid gap-2",
      items.length === 2 ? "grid-cols-2" :
      items.length === 3 ? "grid-cols-3" :
      "grid-cols-4"
    )}>
      {items.map((s) => (
        <div key={s.label} className={cn("text-center p-2.5 rounded-lg border",
          `bg-${s.color}-50 border-${s.color}-100`
        )}>
          <div className={cn("text-lg font-bold", `text-${s.color}-600`)}>{s.value}</div>
          <div className={cn("text-[9px] font-medium", `text-${s.color}-600`)}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// TAB SECTION HEADER — meme pattern que DepartmentTourDeControle SectionHeader
// ================================================================

export function TabSectionHeader({ icon: Icon, title, subtitle, gradient }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  gradient: string;
}) {
  return (
    <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300", gradient)}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// BREADCRUMB
// ================================================================

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-1 text-[9px] flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={cn(
                "px-2 py-1 rounded font-bold transition-colors",
                item.color
                  ? `bg-${item.color}-100 text-${item.color}-700 hover:bg-${item.color}-200`
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {item.label}
            </button>
          ) : (
            <span className={cn(
              "px-2 py-1 rounded font-bold",
              item.color ? `bg-${item.color}-100 text-${item.color}-700` : "bg-gray-100 text-gray-600"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
