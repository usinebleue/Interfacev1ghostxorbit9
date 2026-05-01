/**
 * registry.ts — Registre des domaines de données V3
 *
 * Chaque domaine déclare:
 * - endpoint API (null si pas d'API backend)
 * - status actuel (simu → mixte → live)
 * - hook V2 existant pour référence
 *
 * Pour basculer un domaine en LIVE:
 *   1. Changer status: "simu" → "live"
 *   2. Rebuild (npx vite build)
 *   3. Le badge passe automatiquement de gris SIMU à vert LIVE
 */

import type { DomainEntry, SourceStatus } from "./types";

export const REGISTRY: Record<string, DomainEntry> = {
  // ═══ Domaines avec endpoint API (branchables) ═══
  "chantiers": {
    key: "chantiers",
    label: "Chantiers",
    endpoint: "/api/v1/chantiers",
    status: "live",
    v2Hook: "useChantiers",
  },
  "projets": {
    key: "projets",
    label: "Projets",
    endpoint: "/api/v1/projets",
    status: "live",
    v2Hook: "useProjets",
  },
  "missions": {
    key: "missions",
    label: "Missions",
    endpoint: "/api/v1/missions-user",
    status: "live",
    v2Hook: "useMissions",
  },
  "taches": {
    key: "taches",
    label: "Tâches",
    endpoint: "/api/v1/taches-user",
    status: "live",
    v2Hook: "useTachesUser",
  },
  "discussions": {
    key: "discussions",
    label: "Discussions",
    endpoint: "/api/v1/discussions",
    status: "live",
    v2Hook: "useDiscussions",
  },
  "bureau": {
    key: "bureau",
    label: "Mon Bureau",
    endpoint: "/api/v1/bureau",
    status: "simu",
    v2Hook: "useBureau",
  },
  "decisions": {
    key: "decisions",
    label: "Décisions",
    endpoint: "/api/v1/decisions",
    status: "live",
    v2Hook: "useDecisionLog",
  },
  "tensions": {
    key: "tensions",
    label: "Tensions",
    endpoint: "/api/v1/tensions",
    status: "simu",
    v2Hook: "useTensions",
  },
  "diagnostics": {
    key: "diagnostics",
    label: "Diagnostics",
    endpoint: "/api/v1/diagnostic-ia",
    status: "simu",
    v2Hook: "useDiagnostic",
  },
  "templates": {
    key: "templates",
    label: "Templates",
    endpoint: "/api/v1/templates-catalogue",
    status: "simu",
    v2Hook: "useUnifiedTemplates",
  },
  "orbit9-members": {
    key: "orbit9-members",
    label: "Membres Orbit9",
    endpoint: "/api/v1/orbit9/members",
    status: "live",
  },
  "orbit9-matches": {
    key: "orbit9-matches",
    label: "Matches Orbit9",
    endpoint: "/api/v1/orbit9/matches",
    status: "live",
  },

  // ═══ Domaines sans endpoint API (simu seulement pour l'instant) ═══
  "cockpit-sections": {
    key: "cockpit-sections",
    label: "Cockpit départements",
    endpoint: null,
    status: "simu",
  },
  "cockpit-extras": {
    key: "cockpit-extras",
    label: "Cockpit blocs supplémentaires",
    endpoint: null,
    status: "simu",
  },
  "blueprint-sections": {
    key: "blueprint-sections",
    label: "Blueprint sections",
    endpoint: null,
    status: "simu",
  },
  "comites": {
    key: "comites",
    label: "Comités",
    endpoint: null,
    status: "simu",
  },
  "conseil-admin": {
    key: "conseil-admin",
    label: "Conseil d'administration",
    endpoint: null,
    status: "simu",
  },
  "retroaction": {
    key: "retroaction",
    label: "Rétroaction",
    endpoint: null,
    status: "simu",
  },
  "operations": {
    key: "operations",
    label: "Opérations",
    endpoint: null,
    status: "simu",
  },
  "execution-live": {
    key: "execution-live",
    label: "Exécution en direct",
    endpoint: "/api/v1/chantiers",
    status: "live",
  },
  "orbit9-dashboard": {
    key: "orbit9-dashboard",
    label: "Dashboard Orbit9",
    endpoint: null,
    status: "simu",
  },
  "orbit9-opportunites": {
    key: "orbit9-opportunites",
    label: "Opportunités Orbit9",
    endpoint: null,
    status: "simu",
  },
};

/** Helper: obtenir le statut d'un domaine */
export function getDomainStatus(domain: string): SourceStatus {
  return REGISTRY[domain]?.status ?? "simu";
}

/** Helper: lister tous les domaines par statut */
export function getDomainsByStatus(status: SourceStatus): DomainEntry[] {
  return Object.values(REGISTRY).filter(e => e.status === status);
}
