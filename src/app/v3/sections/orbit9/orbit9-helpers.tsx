/**
 * orbit9-helpers.tsx — Composants partagés Orbit9
 *
 * Composants Orbit9-spécifiques + re-exports du GOLD STANDARD CockpitView.
 * Les composants génériques (CockpitCard, CockpitItemRow, etc.) viennent de CockpitView.
 *
 * Utilisé par: Orbit9Dashboard, Orbit9Blueprint, Orbit9Opportunites
 */

import { Star, Shield, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { TRUST_TIER_CONFIG } from "./orbit9-data";
import type { PionnierStatus, OpportunityStage } from "./orbit9-data";

// ═══ RE-EXPORTS depuis CockpitView (GOLD STANDARD) ═══
export {
  CockpitCard,
  CockpitItemRow,
  CockpitSignalCard,
  CockpitSectionHeader,
  CockpitBlocDetail,
  WorkActionsOverlay,
  WORK_ACTIONS,
} from "../CockpitView";
export type { DashboardBlocItem, DashboardBlocConfig } from "../CockpitView";

// ═══ TrustBadge — Badge de confiance (Or/Argent/Bronze) ═══

export function TrustBadge({ tier, score }: { tier: "or" | "argent" | "bronze"; score: number }) {
  const cfg = TRUST_TIER_CONFIG[tier];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
      <Star className="h-3.5 w-3.5 fill-current" />
      {cfg.label} {score.toFixed(1)}
    </span>
  );
}

// ═══ QualifiedBadge — "Qualifié Brain Team" ═══

export function QualifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      <Shield className="h-3.5 w-3.5" />
      Qualifié Brain Team
    </span>
  );
}

// ═══ O9ScoreBar — Barre de score avec % ═══

export function O9ScoreBar({ value, color = "bg-cyan-500", max = 100 }: { value: number; color?: string; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ═══ PionnierDot — Pastille pionniers (pris/prospect/disponible) ═══

const PIONNIER_STATUS: Record<PionnierStatus, { dot: string; label: string; text: string }> = {
  pris:        { dot: "bg-emerald-500", label: "Confirmé",  text: "text-emerald-700" },
  prospect:    { dot: "bg-amber-500",   label: "Prospect",  text: "text-amber-700" },
  disponible:  { dot: "bg-gray-300",    label: "Disponible", text: "text-gray-500" },
};

export function PionnierDot({ status }: { status: PionnierStatus }) {
  const cfg = PIONNIER_STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[9px] font-medium", cfg.text)}>
      <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ═══ StagePipeline — Pipeline 5 étapes visuelles ═══

export function StagePipeline({ currentStage }: { currentStage: OpportunityStage }) {
  const stages: OpportunityStage[] = ["decouverte", "qualification", "introduction", "collaboration", "integration"];
  const currentIdx = stages.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold",
            i <= currentIdx ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-400"
          )}>
            {i + 1}
          </div>
          {i < stages.length - 1 && (
            <div className={cn("w-4 h-0.5", i < currentIdx ? "bg-cyan-500" : "bg-gray-200")} />
          )}
        </div>
      ))}
    </div>
  );
}
