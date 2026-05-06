/**
 * phase-router.ts — Detection intelligente de phase par mots-cles
 *
 * Analyse le texte d'un message ou d'une action pour determiner
 * la phase de travail appropriee (reflexion, creation, execution, retroaction).
 * Retourne null si aucune phase claire n'est detectee (= discussion par defaut).
 */

import type { PhaseKey } from "./types";

// === Patterns regex par phase ===

const REFLEXION_PATTERNS = /brainstorm|diagnostic|audit|analyse|analys[eo]ns|[eé]value|[eé]valuer|scan|compare|compar[eo]ns|risque|veille|benchmark|identifi|probl[eè]me|examine|[eé]tat des lieux|situation actuelle|qu.est-ce qui|pourquoi|comment [çc]a va|swot|tendance|concurren|positionnement|cartographi|pipeline.*vente|stack|performance|goulot|capacit[eé]|brevets?|cyber|conformit|r[eé]glement/i;

const CREATION_PATTERNS = /planifi|strat[eé]gi|con[çc]oi|concevo|d[eé]velopp|budget|pr[eé]vision|prototype|design|organis|structur|cr[eé][eo]|pr[eé]pare|lance.*campagne|lance.*produit|sprint|roadmap|plan de|[eé]labor|monte|b[aâ]ti|checklist|controle qualit|maintenance|formation|onboarding|recrutement|5s|lean|plan.*continuit|sensibilisation|incident.*response|campagne|contenu|r[eé]seaux sociaux|crm/i;

const EXECUTION_PATTERNS = /lanc[eé]|ex[eé]cut|impl[eé]ment|fixe?|debug|r[eé]sou|d[eé]ploi|migr[eé]|appliqu|d[eé]marre|active|configure|installe|corrige|optimis.*op[eé]ration|litige|closing|prospect/i;

const RETROACTION_PATTERNS = /bilan|r[eé]sultat|mesur|retour|apprentissage|am[eé]lio.*r[eé]sultat|qu.est-ce qui a march|le[çc]on|post-mortem|r[eé]trospective|retour.*exp[eé]rience|kpi.*r[eé]sultat/i;

// === Biais par bot — DÉSACTIVÉ ===
// Les phases changent UNIQUEMENT par action explicite de l'utilisateur.
// Carl: "c'est MOI qui décide quand avancer de phase"
const BOT_PHASE_BIAS: Partial<Record<string, PhaseKey>> = {};

// === Fonction principale ===

/**
 * Detecte la phase de travail appropriee a partir du texte d'un message.
 *
 * @param text - Le message ou description d'action
 * @param botCode - Code du bot actif (optionnel, pour le biais)
 * @returns PhaseKey detectee ou null (= rester en discussion)
 */
export function detectPhaseFromMessage(text: string, botCode?: string): PhaseKey | null {
  if (!text || text.length < 3) return null;

  const normalized = text.toLowerCase();

  // Compter les hits par phase
  const scores: Record<string, number> = {
    reflexion: 0,
    creation: 0,
    execution: 0,
    retroaction: 0,
  };

  if (REFLEXION_PATTERNS.test(normalized)) scores.reflexion += 1;
  if (CREATION_PATTERNS.test(normalized)) scores.creation += 1;
  if (EXECUTION_PATTERNS.test(normalized)) scores.execution += 1;
  if (RETROACTION_PATTERNS.test(normalized)) scores.retroaction += 1;

  // Trouver la phase avec le plus de hits
  const maxScore = Math.max(...Object.values(scores));

  if (maxScore === 0) {
    // Aucun match — utiliser le biais bot si disponible
    if (botCode && BOT_PHASE_BIAS[botCode]) {
      return BOT_PHASE_BIAS[botCode]!;
    }
    return null;
  }

  // Egalite — priorite: reflexion > creation > execution > retroaction
  const priority: PhaseKey[] = ["reflexion", "creation", "execution", "retroaction"];
  for (const p of priority) {
    if (scores[p] === maxScore) return p;
  }

  return null;
}
