/**
 * SectionComponents.tsx — Composants partages pour Strategique / Mon Bureau / Mon Reseau
 * StatusBadge, BotBadge, ChaleurBadge, PlaybookCard, TemplateSection, KPICard
 */

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, BookOpen, Sparkles, Package, Play, Loader2, CheckCircle2 } from "lucide-react";
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

export function BotBadge({ code }: { code: string }) {
  const info = BOT_INFO[code];
  if (!info) return <span className="text-[9px] text-gray-400">{code}</span>;
  return (
    <span className={cn("text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", info.gradient)}>
      {info.label}
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
