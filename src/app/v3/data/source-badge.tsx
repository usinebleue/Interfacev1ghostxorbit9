/**
 * source-badge.tsx — Badge visuel SIMU | MIXTE | LIVE
 *
 * Affiche la provenance des données à côté du titre de section.
 * - SIMU (gris) = 100% données mock
 * - MIXTE (ambre) = partiellement branché au backend
 * - LIVE (vert) = 100% données backend
 */

import type { SourceStatus } from "./types";
import { REGISTRY } from "./registry";

const BADGE_STYLES: Record<SourceStatus, string> = {
  simu: "bg-gray-200 text-gray-600",
  mixte: "bg-amber-100 text-amber-700",
  live: "bg-emerald-100 text-emerald-700",
};

const BADGE_LABELS: Record<SourceStatus, string> = {
  simu: "SIMU",
  mixte: "MIXTE",
  live: "LIVE",
};

/** Badge pill inline — usage: <SourceBadge source={source} /> */
export function SourceBadge({ source, className }: { source: SourceStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider ${BADGE_STYLES[source]} ${className || ""}`}
    >
      {BADGE_LABELS[source]}
    </span>
  );
}

/** Badge qui lit le status directement depuis le registry par domaine */
export function DomainBadge({ domain, className }: { domain: string; className?: string }) {
  const entry = REGISTRY[domain];
  const status: SourceStatus = entry?.status ?? "simu";
  return <SourceBadge source={status} className={className} />;
}
