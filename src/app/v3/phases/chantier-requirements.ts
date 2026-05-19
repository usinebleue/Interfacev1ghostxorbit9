/**
 * chantier-requirements.ts — Exigences et completude d'un chantier
 *
 * Mapping CREDO → donnees requises pour un chantier complet.
 * Derive de la structure ChantierView (ExecutionView).
 *
 * Utilise par LiveDiscussionView pour afficher la barre de completude
 * et les suggestions contextuelles par etape CREDO.
 */

import type { WorkspaceBlock, WorkspaceBlockType } from "../core/types";

export interface RequiredField {
  id: string;
  label: string;
  description: string;
  blockTypes: WorkspaceBlockType[];
  credoStep: "C" | "R" | "E" | "D" | "O";
  required: boolean;
  suggestedPrompt?: string;
}

export const CHANTIER_REQUIREMENTS: RequiredField[] = [
  // C — Comprendre
  { id: "contexte", label: "Contexte et situation", description: "Enjeux, contraintes, historique",
    blockTypes: ["diagnostic", "libre"], credoStep: "C", required: true,
    suggestedPrompt: "Decris le contexte et les enjeux principaux de cette situation." },
  { id: "tension", label: "Tension / probleme", description: "Le probleme central a resoudre",
    blockTypes: ["diagnostic", "libre"], credoStep: "C", required: true,
    suggestedPrompt: "Quel est le probleme central a resoudre ici ?" },

  // R — Rechercher
  { id: "diagnostic", label: "Diagnostic", description: "Analyse forces/faiblesses, etat des lieux",
    blockTypes: ["diagnostic"], credoStep: "R", required: true,
    suggestedPrompt: "Fais un diagnostic complet de la situation — forces, faiblesses, opportunites, menaces." },
  { id: "risques", label: "Risques identifies", description: "Menaces, vulnerabilites, angles morts",
    blockTypes: ["risques"], credoStep: "R", required: true,
    suggestedPrompt: "Quels sont les risques principaux et les angles morts a surveiller ?" },
  { id: "benchmark", label: "Benchmarks / donnees", description: "References marche, donnees comparatives",
    blockTypes: ["benchmark", "deep_search"], credoStep: "R", required: false,
    suggestedPrompt: "As-tu des references marche ou benchmarks comparables ?" },

  // E — Exposer
  { id: "options", label: "Options / solutions", description: "Solutions potentielles evaluees",
    blockTypes: ["recommandations", "brainstorm"], credoStep: "E", required: true,
    suggestedPrompt: "Quelles sont les options et solutions possibles ?" },
  { id: "objectifs", label: "Objectifs vises", description: "Ce qu'on veut atteindre, KPIs cibles",
    blockTypes: ["metriques", "libre"], credoStep: "E", required: true,
    suggestedPrompt: "Quels sont les objectifs concrets et KPIs vises ?" },

  // D — Demontrer
  { id: "plan-action", label: "Plan d'action", description: "Etapes concretes, taches, responsables",
    blockTypes: ["plan_action", "taches"], credoStep: "D", required: true,
    suggestedPrompt: "Propose un plan d'action concret avec les etapes et responsables." },
  { id: "budget", label: "Budget estime", description: "Couts, investissement, ROI projete",
    blockTypes: ["budget"], credoStep: "D", required: true,
    suggestedPrompt: "Quel serait le budget estime et le ROI projete ?" },
  { id: "timeline", label: "Timeline / jalons", description: "Echeancier, dates cles, milestones",
    blockTypes: ["timeline"], credoStep: "D", required: true,
    suggestedPrompt: "Propose un echeancier avec les jalons cles." },
  { id: "equipe", label: "Equipe / ressources", description: "Qui fait quoi, competences requises",
    blockTypes: ["libre"], credoStep: "D", required: false,
    suggestedPrompt: "De quelles ressources et competences a-t-on besoin ?" },

  // O — Objectif
  { id: "decisions", label: "Decisions prises", description: "Trail des decisions avec rationnel",
    blockTypes: ["decision", "libre"], credoStep: "O", required: true,
    suggestedPrompt: "Resume les decisions prises et leur rationnel." },
  { id: "plan-match", label: "Plan de match", description: "Prochains pas concrets et assignations",
    blockTypes: ["plan_action", "taches"], credoStep: "O", required: true,
    suggestedPrompt: "Quel est le plan de match — prochains pas concrets et qui fait quoi ?" },
];

export interface CompletenessResult {
  total: number;
  filled: number;
  percentage: number;
  missing: RequiredField[];
  filled_fields: RequiredField[];
  perStep: Record<string, { filled: number; total: number; missing: RequiredField[] }>;
}

export function computeCompleteness(
  blocks: WorkspaceBlock[],
  requirements = CHANTIER_REQUIREMENTS
): CompletenessResult {
  const required = requirements.filter(r => r.required);
  const filled: RequiredField[] = [];
  const missing: RequiredField[] = [];

  for (const req of required) {
    const hasBlock = blocks.some(b =>
      req.blockTypes.includes(b.type) && b.credo_step === req.credoStep
    );
    (hasBlock ? filled : missing).push(req);
  }

  const perStep: Record<string, { filled: number; total: number; missing: RequiredField[] }> = {};
  for (const step of ["C", "R", "E", "D", "O"] as const) {
    const stepReqs = required.filter(r => r.credoStep === step);
    const stepFilled = stepReqs.filter(r => filled.includes(r));
    const stepMissing = stepReqs.filter(r => missing.includes(r));
    perStep[step] = { filled: stepFilled.length, total: stepReqs.length, missing: stepMissing };
  }

  return {
    total: required.length,
    filled: filled.length,
    percentage: required.length > 0 ? Math.round((filled.length / required.length) * 100) : 0,
    missing,
    filled_fields: filled,
    perStep,
  };
}
