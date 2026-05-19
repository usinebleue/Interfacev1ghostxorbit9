/**
 * ProgressMiniPhased.tsx — Barre de progression avec couleur de phase
 *
 * Extrait de ChantierView / ExecutionLiveTab / OperationsView (3 copies identiques)
 * Source unique — pattern PHASE_COLORS dot color
 */

import { cn } from "../../../components/ui/utils";
import { PHASE_COLORS, type PhaseKey } from "./dept-data";

export function ProgressMiniPhased({ value, phase }: { value: number; phase?: PhaseKey }) {
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
