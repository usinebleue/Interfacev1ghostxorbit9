/**
 * contextual-actions.ts — Boutons d'action intelligents et contextuels sous les bulles chat
 *
 * RÈGLES:
 * 1. JAMAIS montrer "Passer en exécution" quand on est en discussion
 * 2. Les transitions de phase = seulement la PROCHAINE phase logique
 * 3. La transition apparaît seulement après assez de progression (chatStage)
 * 4. Les actions de contenu sont adaptées à la phase active
 * 5. Si pas de phase active (cockpit/observation) = options backend brutes, pas de transition
 */

/** Regex pour détecter les boutons de transition de phase */
const PHASE_TRANSITION_REGEX = /passer en mode (discussion|réflexion|conception|exécution|rétroaction)/i;

/** Label exact de transition pour chaque phase (doit matcher le regex dans handleOption) */
const PHASE_NEXT_LABEL: Record<string, string> = {
  discussion: "Passer en mode réflexion",
  reflexion: "Passer en mode conception",
  creation: "Passer en mode exécution",
  execution: "Passer en mode rétroaction",
  retroaction: "Retour au cockpit",
};

/** Minimum chatStage avant de proposer la transition */
const MIN_STAGE_FOR_TRANSITION: Record<string, number> = {
  discussion: 1,   // 1 échange suffit pour suggérer réflexion
  reflexion: 4,    // 4/8 étapes avant de suggérer conception
  creation: 2,     // 2 étapes avant de suggérer exécution
  execution: 2,    // 2 étapes avant de suggérer rétroaction
  retroaction: 2,  // 2 étapes avant de suggérer retour cockpit
};

/** Actions de contenu par défaut quand le backend n'envoie rien */
const PHASE_DEFAULT_ACTIONS: Record<string, string[]> = {
  discussion: ["Brainstorm", "Approfondir", "Challenger cette idée"],
  reflexion: ["SCAMPER", "5 Pourquoi", "6 Chapeaux", "Challenger"],
  creation: ["Détailler cette section", "Valider l'approche", "Structure du livrable"],
  execution: ["Étape suivante", "Vérifier les prérequis", "Risques à anticiper"],
  retroaction: ["Leçons apprises", "Points d'amélioration", "Bilan global"],
};

/** Actions Discussion adaptées au focusType (Sprint 5) */
const DISCUSSION_ACTIONS_BY_TYPE: Record<string, string[]> = {
  chantier: ["État du pipeline", "Métriques", "Prochaine étape", "Risques"],
  projet: ["Missions en cours", "Risques", "Timeline"],
  mission: ["Tâches restantes", "Blocages", "Livrables"],
  tache: ["Détail technique", "Prérequis", "Estimation"],
};

/** Phases de workflow actives (ont des transitions) */
const WORKFLOW_PHASES = ["discussion", "reflexion", "creation", "execution", "retroaction"];

/**
 * Calcule les boutons d'action contextuels pour une bulle de chat
 *
 * @param backendOptions - Options brutes envoyées par le backend (msg.options)
 * @param activePhase - Phase workspace active
 * @param chatStage - Progression dans la phase (0-indexed)
 * @param hasReflexionContext - Si un contexte de travail est établi
 * @returns Liste de labels de boutons (max 4)
 */
export function getContextualActions(
  backendOptions: string[] | undefined,
  activePhase: string,
  chatStage: number,
  hasReflexionContext: boolean,
  focusType?: string,
  activeDocumentSectionLabel?: string | null,
): string[] {
  // ═══ CAS 1: Pas dans un workflow actif → options backend telles quelles ═══
  // Exception: Discussion phase montre TOUJOURS les boutons enrichis (Brainstorm, etc.)
  if (!WORKFLOW_PHASES.includes(activePhase) || (!hasReflexionContext && activePhase !== "discussion")) {
    // Filtrer quand même les transitions de phase qui n'ont pas de sens
    if (backendOptions && backendOptions.length > 0) {
      return backendOptions.filter(opt => !PHASE_TRANSITION_REGEX.test(opt)).slice(0, 4);
    }
    return [];
  }

  // ═══ CAS 2: Workflow actif → boutons intelligents ═══
  const actions: string[] = [];

  // 2a. Garder les options backend qui ne sont PAS des transitions de phase
  if (backendOptions && backendOptions.length > 0) {
    for (const opt of backendOptions) {
      if (!PHASE_TRANSITION_REGEX.test(opt)) {
        actions.push(opt);
      }
    }
  }

  // 2b. Si aucune option backend utile, ajouter des defaults par phase
  if (actions.length === 0) {
    // Discussion adaptative: utiliser les actions spécifiques au focusType
    if (activePhase === "discussion" && focusType && DISCUSSION_ACTIONS_BY_TYPE[focusType]) {
      actions.push(...DISCUSSION_ACTIONS_BY_TYPE[focusType]);
    } else {
      const defaults = PHASE_DEFAULT_ACTIONS[activePhase];
      if (defaults) {
        actions.push(...defaults);
      }
    }
  }

  // 2c. "Cristalliser vers [Section]" quand un document est ouvert en Conception (Sprint 6)
  if (activePhase === "creation" && activeDocumentSectionLabel) {
    actions.push(`Cristalliser vers ${activeDocumentSectionLabel}`);
  }

  // 2d. Ajouter la transition de phase SI assez de progression
  const minStage = MIN_STAGE_FOR_TRANSITION[activePhase] ?? 2;
  if (chatStage >= minStage) {
    const nextLabel = PHASE_NEXT_LABEL[activePhase];
    if (nextLabel && !actions.includes(nextLabel)) {
      actions.push(nextLabel);
    }
  }

  // Max 4 boutons
  return actions.slice(0, 4);
}
