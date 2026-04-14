/**
 * use-action-mode.ts — Hook pour les 5 modes d'action
 *
 * Gère le cycle: discussion > réflexion > conception > exécution > rétroaction
 * Respect de la section registry (supportedActions).
 */

import { useState, useCallback, useMemo } from "react";
import type { ActionMode } from "../core/types";

const ACTION_ORDER: ActionMode[] = [
  "discussion",
  "reflexion",
  "conception",
  "execution",
  "retroaction",
];

export function useActionMode(supportedActions?: ActionMode[]) {
  const [activeAction, setActiveAction] = useState<ActionMode | null>(null);

  /** Actions disponibles (filtrées par ce que la section supporte) */
  const availableActions = useMemo(() => {
    if (!supportedActions || supportedActions.length === 0) return ACTION_ORDER;
    return ACTION_ORDER.filter(a => supportedActions.includes(a));
  }, [supportedActions]);

  /** Démarrer un mode d'action */
  const startAction = useCallback((mode: ActionMode) => {
    if (availableActions.includes(mode)) {
      setActiveAction(mode);
    }
  }, [availableActions]);

  /** Quitter le mode d'action */
  const exitAction = useCallback(() => {
    setActiveAction(null);
  }, []);

  /** Passer au mode suivant dans l'ordre */
  const nextAction = useCallback(() => {
    if (!activeAction) {
      setActiveAction(availableActions[0] || null);
      return;
    }
    const idx = availableActions.indexOf(activeAction);
    if (idx < availableActions.length - 1) {
      setActiveAction(availableActions[idx + 1]);
    }
  }, [activeAction, availableActions]);

  /** Est-on dans un mode d'action? */
  const isInAction = activeAction !== null;

  return {
    activeAction,
    startAction,
    exitAction,
    nextAction,
    isInAction,
    availableActions,
  };
}
