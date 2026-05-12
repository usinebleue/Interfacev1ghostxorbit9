/**
 * phase-config.ts — Configuration des 5 phases de travail
 *
 * Chaque phase a:
 * - Des couleurs (hero, sidebar, notes, transition)
 * - Des étapes (steps) avec id, titre, sous-titre, icône, minStage
 * - Un bouton de transition vers la phase suivante
 *
 * SOURCE: Copie exacte des simulations FocusXxxView.tsx (v3/simulation/)
 * + 8 étapes pour Réflexion (validées par Carl Session 100)
 */

import type { PhaseKey } from "../core/types";
import {
  MessageCircle, Target, TrendingUp, Layers,
  Brain, Stethoscope, Lightbulb, Search, Globe, FileBarChart, Swords, FileText,
  Hammer, LayoutGrid, FolderOpen, Package,
  Rocket, Users, Activity, FileCheck, BarChart3,
  BookOpen, Archive,
  Eye, Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ═══ Types ═══

export interface PhaseStep {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  minStage: number;
}

export interface PhaseColors {
  hero: { gradient1: string; gradient2: string; iconBg: string; iconText: string };
  sidebar: { active: string; activeText: string };
  notes: { border: string; bg: string; text: string; iconText: string };
  transition: { bg: string; border: string; text: string; hoverBg: string };
  badge: { bg: string; text: string };
}

export interface PhaseConfig {
  key: PhaseKey;
  label: string;
  icon: LucideIcon;
  colors: PhaseColors;
  steps: PhaseStep[];
  nextPhase: PhaseKey | null;
  nextPhaseLabel: string | null;
}

// ═══ Couleurs par phase (from simulations) ═══

const DISCUSSION_COLORS: PhaseColors = {
  hero: { gradient1: "bg-sky-100/70", gradient2: "bg-blue-100/40", iconBg: "bg-sky-100", iconText: "text-sky-600" },
  sidebar: { active: "bg-sky-50 border-sky-200", activeText: "text-sky-700" },
  notes: { border: "border-sky-200", bg: "bg-sky-50/50", text: "text-sky-700", iconText: "text-sky-500" },
  transition: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", hoverBg: "hover:bg-orange-100" },
  badge: { bg: "bg-sky-100", text: "text-sky-700" },
};

const REFLEXION_COLORS: PhaseColors = {
  hero: { gradient1: "bg-orange-100/70", gradient2: "bg-amber-100/40", iconBg: "bg-orange-100", iconText: "text-orange-600" },
  sidebar: { active: "bg-orange-50 border-orange-200", activeText: "text-orange-700" },
  notes: { border: "border-orange-200", bg: "bg-orange-50/50", text: "text-orange-700", iconText: "text-orange-500" },
  transition: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hoverBg: "hover:bg-amber-100" },
  badge: { bg: "bg-orange-100", text: "text-orange-700" },
};

const CONCEPTION_COLORS: PhaseColors = {
  hero: { gradient1: "bg-amber-100/70", gradient2: "bg-yellow-100/40", iconBg: "bg-amber-100", iconText: "text-amber-600" },
  sidebar: { active: "bg-amber-50 border-amber-200", activeText: "text-amber-700" },
  notes: { border: "border-amber-200", bg: "bg-amber-50/50", text: "text-amber-700", iconText: "text-amber-500" },
  transition: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", hoverBg: "hover:bg-green-100" },
  badge: { bg: "bg-amber-100", text: "text-amber-700" },
};

const EXECUTION_COLORS: PhaseColors = {
  hero: { gradient1: "bg-green-100/70", gradient2: "bg-emerald-100/40", iconBg: "bg-green-100", iconText: "text-green-600" },
  sidebar: { active: "bg-green-50 border-green-200", activeText: "text-green-700" },
  notes: { border: "border-green-200", bg: "bg-green-50/50", text: "text-green-700", iconText: "text-green-500" },
  transition: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", hoverBg: "hover:bg-purple-100" },
  badge: { bg: "bg-green-100", text: "text-green-700" },
};

const RETROACTION_COLORS: PhaseColors = {
  hero: { gradient1: "bg-purple-100/70", gradient2: "bg-violet-100/40", iconBg: "bg-purple-100", iconText: "text-purple-600" },
  sidebar: { active: "bg-purple-50 border-purple-200", activeText: "text-purple-700" },
  notes: { border: "border-purple-200", bg: "bg-purple-50/50", text: "text-purple-700", iconText: "text-purple-500" },
  transition: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", hoverBg: "hover:bg-gray-100" },
  badge: { bg: "bg-purple-100", text: "text-purple-700" },
};

// ═══ Steps par phase ═══

// 5 étapes CREDO — validées Plan Enrichissement Sprint 1
const DISCUSSION_STEPS: PhaseStep[] = [
  { id: "credo-c-comprendre", title: "Comprendre", subtitle: "Source de la tension/enjeu", icon: Eye, minStage: 0 },
  { id: "credo-r-rechercher", title: "Rechercher", subtitle: "Questions et angles morts", icon: Search, minStage: 1 },
  { id: "credo-e-exposer", title: "Exposer", subtitle: "Solutions potentielles primaires", icon: Lightbulb, minStage: 2 },
  { id: "credo-d-demontrer", title: "Démontrer", subtitle: "Capacité et ressources manquantes", icon: Shield, minStage: 3 },
  { id: "credo-o-objectif", title: "Objectif", subtitle: "Objectif final de la tension", icon: Target, minStage: 4 },
];

// 8 étapes — validées par Carl (Session 100)
const REFLEXION_STEPS: PhaseStep[] = [
  { id: "ref-1-diagnostic", title: "Diagnostic initial", subtitle: "Analyse de la situation", icon: Stethoscope, minStage: 0 },
  { id: "ref-2-brainstorm", title: "Brainstorm SCAMPER", subtitle: "Idées créatives tous angles", icon: Lightbulb, minStage: 1 },
  { id: "ref-3-synthese-brainstorm", title: "Synthèse brainstorm", subtitle: "Regroupement et priorisation", icon: Layers, minStage: 2 },
  { id: "ref-4-cinq-pourquoi", title: "Analyse 5 Pourquoi", subtitle: "Causes racines", icon: Search, minStage: 3 },
  { id: "ref-5-deep-search", title: "Deep Search", subtitle: "Données, benchmarks, pratiques", icon: Globe, minStage: 4 },
  { id: "ref-6-synthese-recherche", title: "Synthèse recherche", subtitle: "Croisement sources et constats", icon: FileBarChart, minStage: 5 },
  { id: "ref-7-challenge", title: "Challenge / Défense", subtitle: "Avocat du diable, angles morts", icon: Swords, minStage: 6 },
  { id: "ref-8-pre-rapport", title: "Pré-rapport", subtitle: "Synthèse et recommandations", icon: FileText, minStage: 7 },
];

const CONCEPTION_STEPS: PhaseStep[] = [
  { id: "conc-1-structure", title: "Structure", subtitle: "Vue d'ensemble du plan", icon: LayoutGrid, minStage: 0 },
  { id: "conc-2-objectifs", title: "Objectifs", subtitle: "Critères de succès", icon: Target, minStage: 1 },
  { id: "conc-3-plan-projet", title: "Plan de projet", subtitle: "Missions et ressources", icon: FolderOpen, minStage: 2 },
  { id: "conc-4-livrables", title: "Livrables", subtitle: "Sélection et planification", icon: Package, minStage: 3 },
];

const EXECUTION_STEPS: PhaseStep[] = [
  { id: "exec-1-briefing", title: "Briefing", subtitle: "Lancement et attribution", icon: Users, minStage: 0 },
  { id: "exec-2-suivi", title: "Suivi", subtitle: "Progression en cours", icon: Activity, minStage: 1 },
  { id: "exec-3-livrables", title: "Livrables", subtitle: "Résultats et validation", icon: FileCheck, minStage: 2 },
  { id: "exec-4-bilan", title: "Bilan", subtitle: "Mesure et ajustements", icon: BarChart3, minStage: 3 },
];

const RETROACTION_STEPS: PhaseStep[] = [
  { id: "retro-1-resultats", title: "Résultats", subtitle: "Mesure des outcomes", icon: BarChart3, minStage: 0 },
  { id: "retro-2-apprentissages", title: "Apprentissages", subtitle: "Leçons et patterns", icon: BookOpen, minStage: 1 },
  { id: "retro-3-recommandations", title: "Recommandations", subtitle: "Actions futures", icon: Lightbulb, minStage: 2 },
  { id: "retro-4-archivage", title: "Archivage", subtitle: "Cristallisation des acquis", icon: Archive, minStage: 3 },
];

// ═══ Configurations complètes ═══

export const PHASE_CONFIGS: Record<string, PhaseConfig> = {
  discussion: {
    key: "discussion",
    label: "Discussion",
    icon: MessageCircle,
    colors: DISCUSSION_COLORS,
    steps: DISCUSSION_STEPS,
    nextPhase: "creation",
    nextPhaseLabel: "Passer en Conception →",
  },
  // Sprint 2A Phase 4: reflexion fusionnée dans discussion — config conservée pour backward compat
  reflexion: {
    key: "reflexion",
    label: "Réflexion",
    icon: Brain,
    colors: REFLEXION_COLORS,
    steps: REFLEXION_STEPS,
    nextPhase: "creation",
    nextPhaseLabel: "Passer en Conception →",
  },
  creation: {
    key: "creation",
    label: "Conception",
    icon: Hammer,
    colors: CONCEPTION_COLORS,
    steps: CONCEPTION_STEPS,
    nextPhase: "execution",
    nextPhaseLabel: "Passer en Exécution →",
  },
  execution: {
    key: "execution",
    label: "Exécution",
    icon: Rocket,
    colors: EXECUTION_COLORS,
    steps: EXECUTION_STEPS,
    nextPhase: "retroaction",
    nextPhaseLabel: "Passer en Rétroaction →",
  },
  retroaction: {
    key: "retroaction",
    label: "Rétroaction",
    icon: BarChart3,
    colors: RETROACTION_COLORS,
    steps: RETROACTION_STEPS,
    nextPhase: null,
    nextPhaseLabel: "Retour au Cockpit",
  },
};

/** Get step IDs for a phase (used by useWorkspaceCapture) */
export function getPhaseStepIds(phase: string): string[] {
  const config = PHASE_CONFIGS[phase];
  if (!config) return [];
  return config.steps.map(s => s.id);
}

/** Get full step objects for a phase (used by cristallisation buttons in chat) */
export function getPhaseSteps(phase: string): PhaseStep[] {
  const config = PHASE_CONFIGS[phase];
  if (!config) return [];
  return config.steps;
}
