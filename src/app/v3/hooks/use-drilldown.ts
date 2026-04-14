/**
 * use-drilldown.ts — Hook pour navigation poupées russes
 *
 * Gère un stack de niveaux: Section > Focus > Detail > ...
 * Utilisable par ChantierView (5 niveaux) et BlueprintView (2 niveaux).
 */

import { useState, useCallback, useMemo } from "react";

export interface DrillLevel {
  id: string;
  label: string;
}

export function useDrillDown(maxLevels = 5) {
  const [stack, setStack] = useState<DrillLevel[]>([]);

  /** Descendre d'un niveau */
  const pushLevel = useCallback((id: string, label: string) => {
    setStack(prev => {
      if (prev.length >= maxLevels) return prev;
      return [...prev, { id, label }];
    });
  }, [maxLevels]);

  /** Remonter d'un niveau */
  const popLevel = useCallback(() => {
    setStack(prev => prev.slice(0, -1));
  }, []);

  /** Revenir à la racine */
  const reset = useCallback(() => {
    setStack([]);
  }, []);

  /** Aller à un niveau spécifique du breadcrumb */
  const goToLevel = useCallback((index: number) => {
    setStack(prev => prev.slice(0, index + 1));
  }, []);

  /** Breadcrumb complet */
  const breadcrumb = useMemo(() => stack, [stack]);

  /** Niveau actuel (0 = racine) */
  const level = stack.length;

  /** Est-on à la racine? */
  const isRoot = level === 0;

  /** Est-on au niveau le plus profond? */
  const isDeepest = level >= maxLevels;

  /** ID du niveau actuel (ou null si racine) */
  const currentId = stack.length > 0 ? stack[stack.length - 1].id : null;

  /** Label du niveau actuel */
  const currentLabel = stack.length > 0 ? stack[stack.length - 1].label : null;

  return {
    pushLevel,
    popLevel,
    reset,
    goToLevel,
    breadcrumb,
    level,
    isRoot,
    isDeepest,
    currentId,
    currentLabel,
  };
}
