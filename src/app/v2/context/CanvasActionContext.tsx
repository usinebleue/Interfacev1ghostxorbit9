/**
 * CanvasActionContext.tsx — Bus d'actions canevas (CREDO Trisociation)
 *
 * Les 3 couches CREDO declenchent des actions sur le canevas central:
 *   Bouche  (Vente)    → navigate, split_screen (expose, demontre)
 *   Cerveau (Idees)    → push_content, execute (elabore, decide, opere)
 *   Coeur   (Coaching) → context_widget, annotate (eleve, debloque)
 *
 * Producteurs: LiveChat, VoicePolling, InputBar, n'importe quel composant
 * Consommateurs: CenterZone (navigation), OverlayLayer (widgets, annotations)
 *
 * Sprint B — CarlOS Noyau Omnipresent (D-081)
 */

import { createContext, useContext, useCallback, useRef, useState } from "react";
import type { CanvasAction } from "../api/types";

interface CanvasActionState {
  /** Derniere action recue (pour reaction immediate) */
  lastAction: CanvasAction | null;
  /** File d'actions en attente (pour batch processing) */
  pendingActions: CanvasAction[];
  /** Historique des 20 dernieres actions (debug + contexte) */
  history: CanvasAction[];
  /** Widget contextuel actif (overlay sur le canevas) */
  activeWidget: CanvasAction | null;
  /** Annotation active (highlight sur element) */
  activeAnnotation: CanvasAction | null;
}

interface CanvasActionActions {
  /** Dispatch une action vers le canevas */
  dispatch: (action: CanvasAction) => void;
  /** Dispatch plusieurs actions (batch — ex: reponse API avec 3 couches) */
  dispatchBatch: (actions: CanvasAction[]) => void;
  /** Consommer (pop) la prochaine action pending */
  consumeNext: () => CanvasAction | null;
  /** Fermer le widget contextuel actif */
  dismissWidget: () => void;
  /** Fermer l'annotation active */
  dismissAnnotation: () => void;
  /** Vider la file */
  clearPending: () => void;
}

type CanvasActionContextType = CanvasActionState & CanvasActionActions;

const CanvasActionCtx = createContext<CanvasActionContextType | null>(null);

const MAX_HISTORY = 20;

export function CanvasActionProvider({ children }: { children: React.ReactNode }) {
  const [lastAction, setLastAction] = useState<CanvasAction | null>(null);
  const [activeWidget, setActiveWidget] = useState<CanvasAction | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<CanvasAction | null>(null);
  const pendingRef = useRef<CanvasAction[]>([]);
  const historyRef = useRef<CanvasAction[]>([]);
  const [, forceUpdate] = useState(0);

  const processAction = useCallback((action: CanvasAction) => {
    // Ajouter a l'historique
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), action];

    // Router par type
    switch (action.type) {
      case "context_widget":
        setActiveWidget(action);
        break;
      case "annotate":
        setActiveAnnotation(action);
        // Auto-dismiss apres 8s
        setTimeout(() => setActiveAnnotation(null), 8000);
        break;
      case "navigate":
      case "push_content":
      case "split_screen":
      case "execute":
        // Ces actions sont consommees par CenterZone via lastAction
        pendingRef.current = [...pendingRef.current, action];
        break;
    }

    setLastAction(action);
  }, []);

  const dispatch = useCallback((action: CanvasAction) => {
    console.log(`[CanvasAction] ${action.layer}/${action.type}`, action);
    processAction(action);
    forceUpdate((n) => n + 1);
  }, [processAction]);

  const dispatchBatch = useCallback((actions: CanvasAction[]) => {
    for (const action of actions) {
      processAction(action);
    }
    if (actions.length > 0) {
      console.log(`[CanvasAction] Batch: ${actions.length} actions`, actions.map((a) => `${a.layer}/${a.type}`));
      forceUpdate((n) => n + 1);
    }
  }, [processAction]);

  const consumeNext = useCallback((): CanvasAction | null => {
    if (pendingRef.current.length === 0) return null;
    const [next, ...rest] = pendingRef.current;
    pendingRef.current = rest;
    forceUpdate((n) => n + 1);
    return next;
  }, []);

  const dismissWidget = useCallback(() => setActiveWidget(null), []);
  const dismissAnnotation = useCallback(() => setActiveAnnotation(null), []);
  const clearPending = useCallback(() => {
    pendingRef.current = [];
    forceUpdate((n) => n + 1);
  }, []);

  return (
    <CanvasActionCtx.Provider
      value={{
        lastAction,
        pendingActions: pendingRef.current,
        history: historyRef.current,
        activeWidget,
        activeAnnotation,
        dispatch,
        dispatchBatch,
        consumeNext,
        dismissWidget,
        dismissAnnotation,
        clearPending,
      }}
    >
      {children}
    </CanvasActionCtx.Provider>
  );
}

export function useCanvasActions(): CanvasActionContextType {
  const ctx = useContext(CanvasActionCtx);
  if (!ctx) throw new Error("useCanvasActions must be inside CanvasActionProvider");
  return ctx;
}
