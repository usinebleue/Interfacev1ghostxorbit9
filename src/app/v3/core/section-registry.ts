/**
 * section-registry.ts — Catalogue central de TOUTES les sections V3
 *
 * ALIGNÉ SUR FLOW_CONFIG backend (agents.py L585-961)
 * Chaque section est déclarée UNE FOIS avec son GPS backend.
 *
 * AJOUTER UNE SECTION = 1 entrée ici + 1 composant dans sections/
 * RÈGLE: les clés id correspondent aux clés FLOW_CONFIG backend.
 */

import type { ActiveView } from "./types";

// ═══ Définition d'une section ═══
export interface SectionDef {
  id: string;                     // Clé EXACTE du FLOW_CONFIG backend
  label: string;                  // Label affiché (français)
  group: SectionGroup;            // Onglet de navigation
  order: number;                  // Ordre dans le groupe
  gpsView: ActiveView;            // active_view envoyé au backend
  gpsSub?: string;                // active_sub_section envoyé au backend
  flowType: "data" | "action";    // Type backend
  botPrimaire: string;            // Bot code par défaut (depuis FLOW_CONFIG)
  botSecondaires?: string[];      // Bots support
  drillLevels?: number;           // Niveaux de drill-down (défaut: 1)
  steps?: number;                 // Nombre d'étapes (sections ACTION seulement)
}

export type SectionGroup =
  | "departement"    // 12 départements
  | "bureau"         // Mon Bureau (6)
  | "plateforme"     // Cockpit, Dashboard, Santé, etc.
  | "orbit9"         // Réseau Orbit9
  | "rooms"          // Board Room, War Room, Think Room
  | "flows"          // Blueprint Live, Scénarios, Pipeline, etc.
  | "admin";         // Admin, Réglages, Help (à venir)

// ═══ REGISTRE COMPLET — aligné agents.py FLOW_CONFIG ═══

export const SECTIONS: SectionDef[] = [

  // ── 12 Départements (DATA) ──────────────────────────────────────
  { id: "ventes",        label: "Ventes",        group: "departement", order: 1,  gpsView: "department", gpsSub: "ventes",        flowType: "data", botPrimaire: "CROB",  botSecondaires: ["CMOB", "CSOB"] },
  { id: "marketing",     label: "Marketing",     group: "departement", order: 2,  gpsView: "department", gpsSub: "marketing",     flowType: "data", botPrimaire: "CMOB",  botSecondaires: ["CCOB", "CROB"] },
  { id: "finance",       label: "Finance",       group: "departement", order: 3,  gpsView: "department", gpsSub: "finance",       flowType: "data", botPrimaire: "CFOB",  botSecondaires: ["CEOB", "COOB"] },
  { id: "execution",     label: "Exécution",     group: "departement", order: 4,  gpsView: "department", gpsSub: "execution",     flowType: "data", botPrimaire: "COOB",  botSecondaires: ["CPOB", "CTOB"] },
  { id: "technologie",   label: "Technologie",   group: "departement", order: 5,  gpsView: "department", gpsSub: "technologie",   flowType: "data", botPrimaire: "CTOB",  botSecondaires: ["CINOB", "CISOB"] },
  { id: "strategie",     label: "Stratégie",     group: "departement", order: 6,  gpsView: "department", gpsSub: "strategie",     flowType: "data", botPrimaire: "CSOB",  botSecondaires: ["CEOB", "CFOB"] },
  { id: "innovation",    label: "Innovation",    group: "departement", order: 7,  gpsView: "department", gpsSub: "innovation",    flowType: "data", botPrimaire: "CINOB", botSecondaires: ["CTOB", "CMOB"] },
  { id: "rh",            label: "RH",            group: "departement", order: 8,  gpsView: "department", gpsSub: "rh",            flowType: "data", botPrimaire: "CHROB", botSecondaires: ["COOB", "CEOB"] },
  { id: "juridique",     label: "Juridique",     group: "departement", order: 9,  gpsView: "department", gpsSub: "juridique",     flowType: "data", botPrimaire: "CLOB",  botSecondaires: ["CFOB", "CEOB"] },
  { id: "securite",      label: "Sécurité",      group: "departement", order: 10, gpsView: "department", gpsSub: "securite",      flowType: "data", botPrimaire: "CISOB", botSecondaires: ["CTOB", "CINOB"] },
  { id: "communication", label: "Communication", group: "departement", order: 11, gpsView: "department", gpsSub: "communication", flowType: "data", botPrimaire: "CCOB",  botSecondaires: ["CMOB", "CHROB"] },
  { id: "usine",         label: "Usine",         group: "departement", order: 12, gpsView: "department", gpsSub: "usine",         flowType: "data", botPrimaire: "CPOB",  botSecondaires: ["COOB", "CINOB"] },

  // ── Mon Bureau (6 sous-sections DATA) ───────────────────────────
  { id: "bureau-idees",     label: "Idées",      group: "bureau", order: 1, gpsView: "espace-bureau", gpsSub: "idees",     flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CINOB", "CMOB"] },
  { id: "bureau-projets",   label: "Projets",    group: "bureau", order: 2, gpsView: "espace-bureau", gpsSub: "projets",   flowType: "data", botPrimaire: "COOB", botSecondaires: ["CEOB", "CFOB"] },
  { id: "bureau-documents", label: "Documents",  group: "bureau", order: 3, gpsView: "espace-bureau", gpsSub: "documents", flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CLOB", "CCOB"] },
  { id: "bureau-taches",    label: "Tâches",     group: "bureau", order: 4, gpsView: "espace-bureau", gpsSub: "taches",    flowType: "data", botPrimaire: "COOB", botSecondaires: ["CEOB"] },
  { id: "bureau-outils",    label: "Outils",     group: "bureau", order: 5, gpsView: "espace-bureau", gpsSub: "outils",    flowType: "data", botPrimaire: "CTOB", botSecondaires: ["CINOB"] },
  { id: "bureau-agenda",    label: "Agenda",     group: "bureau", order: 6, gpsView: "espace-bureau", gpsSub: "agenda",    flowType: "data", botPrimaire: "CEOB", botSecondaires: ["COOB"] },

  // ── Plateforme (sections DATA globales) ─────────────────────────
  { id: "cockpit",     label: "Cockpit",            group: "plateforme", order: 1, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CFOB", "COOB"] },
  { id: "dashboard",   label: "Dashboard",          group: "plateforme", order: 2, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB" },
  { id: "sante",       label: "Santé",              group: "plateforme", order: 3, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CFOB", "COOB"] },
  { id: "marketplace", label: "Marketplace",        group: "plateforme", order: 4, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CROB", "CSOB"] },
  { id: "gouvernance", label: "Gouvernance",        group: "plateforme", order: 5, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CLOB", "CFOB"] },
  { id: "pionniers",   label: "Pionniers",          group: "plateforme", order: 6, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CMOB"] },
  { id: "nouvelles",   label: "Nouvelles",          group: "plateforme", order: 7, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CCOB"] },
  { id: "evenements",  label: "Événements",         group: "plateforme", order: 8, gpsView: "cockpit",      flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CCOB", "CMOB"] },
  { id: "industrie",   label: "Dashboard Industrie", group: "plateforme", order: 9, gpsView: "cockpit",     flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CSOB", "CINOB"] },

  // ── Orbit9 (sections réseau) ────────────────────────────────────
  // NOTE CARL: Ces sous-sections seront éventuellement fusionnées en UNE SEULE
  // section "Orbit9" avec des sous-sections internes (pas des sections séparées).
  // Pour l'instant on les garde séparées pour le registry mais la consolidation est prévue.
  { id: "orbit9-dashboard",    label: "Accueil Orbit⁹",    group: "orbit9", order: 1, gpsView: "orbit9", gpsSub: "dashboard",    flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-blueprint",    label: "Blueprint Orbit⁹",  group: "orbit9", order: 2, gpsView: "orbit9", gpsSub: "blueprint",    flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-cellules",     label: "Mes Cellules",      group: "orbit9", order: 3, gpsView: "orbit9", gpsSub: "cellules",     flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-jumelage",     label: "Jumelage",          group: "orbit9", order: 4, gpsView: "orbit9", gpsSub: "jumelage",     flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-gouvernance",  label: "Gouvernance",       group: "orbit9", order: 5, gpsView: "orbit9", gpsSub: "gouvernance",  flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-pionniers",    label: "Pionniers",         group: "orbit9", order: 6, gpsView: "orbit9", gpsSub: "pionniers",    flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-vitaa",        label: "VITAA",             group: "orbit9", order: 7, gpsView: "orbit9", gpsSub: "vitaa",        flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-profil",       label: "Mon Profil",        group: "orbit9", order: 8,  gpsView: "orbit9", gpsSub: "perso",        flowType: "data", botPrimaire: "CEOB" },
  { id: "orbit9-opportunites", label: "Opportunités",      group: "orbit9", order: 9,  gpsView: "orbit9", gpsSub: "opportunites", flowType: "data", botPrimaire: "CEOB", botSecondaires: ["CROB", "CSOB"] },

  // ── Rooms (ACTION flows — Mon Entreprise) ───────────────────────
  { id: "board-room", label: "Board Room", group: "rooms", order: 1, gpsView: "board-room", flowType: "action", botPrimaire: "CEOB", botSecondaires: ["CSOB", "CFOB"], steps: 5 },
  { id: "war-room",   label: "War Room",   group: "rooms", order: 2, gpsView: "war-room",   flowType: "action", botPrimaire: "CEOB", botSecondaires: ["COOB", "CSOB", "CFOB"], steps: 6 },
  { id: "think-room", label: "Think Room",  group: "rooms", order: 3, gpsView: "think-room", flowType: "action", botPrimaire: "CEOB", botSecondaires: ["CSOB", "CTOB", "CFOB"], steps: 6 },

  // ── Flows ACTION (guidés par CarlOS) ────────────────────────────
  { id: "jumelage",       label: "Jumelage",         group: "flows", order: 1, gpsView: "orbit9",    gpsSub: "jumelage",    flowType: "action", botPrimaire: "CEOB", botSecondaires: ["CSOB", "CROB"], steps: 5 },
  { id: "blueprint-live", label: "Blueprint Live",   group: "flows", order: 2, gpsView: "blueprint", gpsSub: "live",        flowType: "action", botPrimaire: "CEOB", botSecondaires: ["CFOB", "CSOB"], steps: 5 },
  { id: "scenarios",      label: "Scénarios",        group: "flows", order: 3, gpsView: "blueprint", gpsSub: "scenarios",   flowType: "action", botPrimaire: "CSOB", botSecondaires: ["CEOB", "CFOB"], steps: 5 },
  { id: "cellules",       label: "Créer Cellule",    group: "flows", order: 4, gpsView: "orbit9",    gpsSub: "cellules",    flowType: "action", botPrimaire: "CEOB", botSecondaires: ["COOB", "CHROB"], steps: 4 },
  { id: "pipeline",       label: "Pipeline",         group: "flows", order: 5, gpsView: "cockpit",   gpsSub: "pipeline",    flowType: "action", botPrimaire: "COOB", botSecondaires: ["CEOB", "CROB"], steps: 5 },
  { id: "onboarding",     label: "Onboarding",       group: "flows", order: 6, gpsView: "cockpit",   gpsSub: "onboarding",  flowType: "action", botPrimaire: "CEOB", steps: 8 },

  // ── Admin (God Mode — sections DATA) ──────────────────────────
  { id: "admin-dashboard",  label: "Dashboard",              group: "admin", order: 1, gpsView: "cockpit", gpsSub: "admin-dashboard",  flowType: "data", botPrimaire: "CEOB" },
  { id: "admin-instances",  label: "Instances",              group: "admin", order: 2, gpsView: "cockpit", gpsSub: "admin-instances",  flowType: "data", botPrimaire: "CEOB" },
  { id: "admin-users",      label: "Utilisateurs",           group: "admin", order: 3, gpsView: "cockpit", gpsSub: "admin-users",      flowType: "data", botPrimaire: "CEOB" },
  { id: "admin-packages",   label: "Packages & Pricing",     group: "admin", order: 4, gpsView: "cockpit", gpsSub: "admin-packages",   flowType: "data", botPrimaire: "CEOB" },
  { id: "admin-monitoring", label: "Monitoring",             group: "admin", order: 5, gpsView: "cockpit", gpsSub: "admin-monitoring", flowType: "data", botPrimaire: "CEOB" },
  { id: "admin-knowledge",  label: "Centre de connaissances", group: "admin", order: 6, gpsView: "cockpit", gpsSub: "admin-knowledge", flowType: "data", botPrimaire: "CEOB" },
  { id: "cerveau-btml",     label: "Cerveau BTML",           group: "admin", order: 7, gpsView: "cockpit", gpsSub: "cerveau-btml",    flowType: "data", botPrimaire: "CTOB" },
];

// ═══ HELPERS ═══

/** Trouver une section par son ID */
export function getSection(id: string): SectionDef | undefined {
  return SECTIONS.find(s => s.id === id);
}

/** Lister les sections d'un groupe, triées par order */
export function getSectionsByGroup(group: SectionGroup): SectionDef[] {
  return SECTIONS.filter(s => s.group === group).sort((a, b) => a.order - b.order);
}

/** Obtenir les paramètres GPS pour le backend */
export function getSectionGPS(id: string): { view: ActiveView; sub: string | null } | undefined {
  const section = getSection(id);
  if (!section) return undefined;
  return { view: section.gpsView, sub: section.gpsSub ?? null };
}

/** Trouver la section d'un département par bot code */
export function getDeptSection(botCode: string): SectionDef | undefined {
  return SECTIONS.find(s => s.group === "departement" && s.botPrimaire === botCode);
}

/** Lister toutes les sections DATA */
export function getDataSections(): SectionDef[] {
  return SECTIONS.filter(s => s.flowType === "data");
}

/** Lister toutes les sections ACTION */
export function getActionSections(): SectionDef[] {
  return SECTIONS.filter(s => s.flowType === "action");
}
