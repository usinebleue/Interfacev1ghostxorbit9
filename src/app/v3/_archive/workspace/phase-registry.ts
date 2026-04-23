/**
 * phase-registry.ts — Registre des 5 phases d'action + Opérations
 *
 * Config pure, zéro JSX.
 * Chaque phase = objet déclaratif avec sections TOC, renderers, livrables.
 * Le WorkspaceFrame lit ce registre et rend dynamiquement.
 *
 * Source: ARCHITECTURE WORKSPACE DYNAMIQUE — Brain Team V3
 * Validé par Carl: Q1=oui (commencer par Réflexion), Q5=vide (sections à remplir manuellement)
 */

import type { WorkspacePhaseConfig, WorkspacePhaseKey } from "./types";

// ═══ PHASE 1 — DISCUSSION (bleu ciel) ═══
const DISCUSSION: WorkspacePhaseConfig = {
  key: "discussion",
  label: "Discussion",
  icon: "MessageCircle",
  colorKey: "discussion",
  contextLevel: "any",
  nextPhase: "reflexion",
  livrables: ["note", "diagnostic"],
  sections: [
    { id: "contexte",        label: "Contexte",            icon: "FileText",       renderer: "editor" },
    { id: "diagnostic",      label: "Diagnostic",          icon: "Stethoscope",    renderer: "multi-bot" },
    { id: "enjeux",          label: "Enjeux identifiés",   icon: "AlertTriangle",  renderer: "checklist" },
    { id: "recommandations", label: "Recommandations",     icon: "Lightbulb",      renderer: "document" },
    { id: "decision",        label: "Décision",            icon: "CheckCircle",    renderer: "form" },
  ],
};

// ═══ PHASE 2 — RÉFLEXION (orange) ═══
const REFLEXION: WorkspacePhaseConfig = {
  key: "reflexion",
  label: "Réflexion",
  icon: "Brain",
  colorKey: "reflexion",
  contextLevel: "chantier",
  nextPhase: "conception",
  livrables: ["diagnostic", "rapport"],
  sections: [
    { id: "vue-ensemble",    label: "Vue d'ensemble",      icon: "LayoutDashboard", renderer: "dashboard" },
    { id: "diagnostic-deep", label: "Diagnostic approfondi", icon: "Stethoscope",   renderer: "multi-bot" },
    { id: "brainstorm",      label: "Brainstorm SCAMPER",  icon: "Sparkles",       renderer: "matrix" },
    { id: "cinq-pourquoi",   label: "5 Pourquoi",          icon: "HelpCircle",     renderer: "editor" },
    { id: "recherche",       label: "Recherche",           icon: "Search",         renderer: "editor" },
    { id: "synthese",        label: "Synthèse recherche",  icon: "FileText",       renderer: "document" },
    { id: "challenge",       label: "Challenge",           icon: "Swords",         renderer: "multi-bot" },
    { id: "pre-rapport",     label: "Pré-rapport",         icon: "ClipboardList",  renderer: "document" },
    { id: "conclusions",     label: "Conclusions & Actions", icon: "ListChecks",   renderer: "checklist" },
  ],
};

// ═══ PHASE 3 — CONCEPTION (jaune) ═══
const CONCEPTION: WorkspacePhaseConfig = {
  key: "conception",
  label: "Conception",
  icon: "Hammer",
  colorKey: "creation",
  contextLevel: "chantier",
  nextPhase: "execution",
  livrables: ["plan", "budget", "document"],
  sections: [
    { id: "architecture",    label: "Architecture",        icon: "Building2",      renderer: "editor" },
    { id: "objectifs-smart", label: "Objectifs SMART",     icon: "Target",         renderer: "form" },
    { id: "analyse-swot",    label: "Analyse SWOT",        icon: "Grid2x2",        renderer: "matrix" },
    { id: "plan-action",     label: "Plan d'action",       icon: "ListChecks",     renderer: "checklist" },
    { id: "budget",          label: "Budget & Ressources", icon: "DollarSign",     renderer: "form", requiredRole: ["CFOB"] },
    { id: "document",        label: "Document principal",  icon: "FileText",       renderer: "editor" },
    { id: "revue",           label: "Revue & Validation",  icon: "ShieldCheck",    renderer: "multi-bot" },
    { id: "export",          label: "Template & Export",   icon: "Download",       renderer: "document", optional: true },
  ],
};

// ═══ PHASE 4 — EXÉCUTION (vert) ═══
const EXECUTION: WorkspacePhaseConfig = {
  key: "execution",
  label: "Exécution",
  icon: "Rocket",
  colorKey: "execution",
  contextLevel: "chantier",
  nextPhase: "retroaction",
  livrables: ["document"],
  sections: [
    { id: "dashboard-cmd",   label: "Dashboard COMMAND",   icon: "Gauge",          renderer: "dashboard" },
    { id: "missions",        label: "Missions actives",    icon: "KanbanSquare",   renderer: "kanban" },
    { id: "delegation",      label: "Délégation",          icon: "UserCheck",      renderer: "checklist" },
    { id: "automatisation",  label: "Automatisation",      icon: "Bot",            renderer: "checklist" },
    { id: "blocages",        label: "Blocages & Escalades", icon: "AlertOctagon",  renderer: "timeline" },
    { id: "suivi",           label: "Suivi temps/budget",  icon: "TrendingUp",     renderer: "dashboard" },
    { id: "livrables",       label: "Livrables",           icon: "Package",        renderer: "document", optional: true },
  ],
};

// ═══ PHASE 5 — RÉTROACTION (émeraude) ═══
const RETROACTION: WorkspacePhaseConfig = {
  key: "retroaction",
  label: "Rétroaction",
  icon: "BarChart3",
  colorKey: "retroaction",
  contextLevel: "chantier",
  nextPhase: "operations",
  livrables: ["bilan", "operation"],
  sections: [
    { id: "bilan",           label: "Bilan global",        icon: "BarChart3",      renderer: "dashboard" },
    { id: "rapport-final",   label: "Rapport final",       icon: "FileText",       renderer: "document" },
    { id: "kpis-impact",     label: "KPIs d'impact",       icon: "TrendingUp",     renderer: "dashboard" },
    { id: "lecons",          label: "Leçons apprises",     icon: "GraduationCap",  renderer: "editor" },
    { id: "retrospective",   label: "Rétrospective équipe", icon: "Users",         renderer: "multi-bot" },
    { id: "perennisation",   label: "Pérennisation",       icon: "RefreshCw",      renderer: "form" },
    { id: "archivage",       label: "Archivage",           icon: "Archive",        renderer: "checklist" },
  ],
};

// ═══ PHASE 6 — OPÉRATIONS (cyan) — même pattern hiérarchique que chantiers ═══
const OPERATIONS: WorkspacePhaseConfig = {
  key: "operations",
  label: "Opérations",
  icon: "RefreshCw",
  colorKey: "operations",
  contextLevel: "any",
  nextPhase: null,
  livrables: ["bilan", "operation"],
  sections: [
    { id: "vue-ensemble",    label: "Vue d'ensemble",      icon: "Gauge",          renderer: "dashboard" },
    { id: "hierarchie",      label: "Hiérarchie",          icon: "ListChecks",     renderer: "hierarchie" },
    { id: "cycle-en-cours",  label: "Cycle en cours",      icon: "ListChecks",     renderer: "checklist" },
    { id: "historique",      label: "Historique cycles",   icon: "BarChart3",      renderer: "timeline" },
    { id: "delegation",      label: "Délégation",          icon: "UserCheck",      renderer: "checklist" },
    { id: "alertes",         label: "Alertes & Escalades", icon: "Bell",           renderer: "timeline" },
    { id: "optimisation",    label: "Optimisation",        icon: "Sparkles",       renderer: "multi-bot" },
    { id: "perennisation",   label: "Pérennisation inverse", icon: "RefreshCw",    renderer: "form" },
  ],
};

// ═══ REGISTRE COMPLET ═══
export const WORKSPACE_PHASES: Record<WorkspacePhaseKey, WorkspacePhaseConfig> = {
  discussion: DISCUSSION,
  reflexion: REFLEXION,
  conception: CONCEPTION,
  execution: EXECUTION,
  retroaction: RETROACTION,
  operations: OPERATIONS,
};

/** Liste ordonnée des phases d'action (sans opérations) */
export const ACTION_PHASE_ORDER: WorkspacePhaseKey[] = [
  "discussion",
  "reflexion",
  "conception",
  "execution",
  "retroaction",
];

/** Obtenir la config d'une phase */
export function getPhaseConfig(key: WorkspacePhaseKey): WorkspacePhaseConfig {
  return WORKSPACE_PHASES[key];
}

/** Obtenir la section suivante dans une phase */
export function getNextSection(
  phaseKey: WorkspacePhaseKey,
  currentSectionId: string
): string | null {
  const phase = WORKSPACE_PHASES[phaseKey];
  const idx = phase.sections.findIndex((s) => s.id === currentSectionId);
  if (idx < 0 || idx >= phase.sections.length - 1) return null;
  return phase.sections[idx + 1].id;
}

/** Obtenir la section précédente dans une phase */
export function getPrevSection(
  phaseKey: WorkspacePhaseKey,
  currentSectionId: string
): string | null {
  const phase = WORKSPACE_PHASES[phaseKey];
  const idx = phase.sections.findIndex((s) => s.id === currentSectionId);
  if (idx <= 0) return null;
  return phase.sections[idx - 1].id;
}
