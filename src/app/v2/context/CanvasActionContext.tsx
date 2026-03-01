/**
 * CanvasActionContext.tsx — Bus d'actions canevas (CREDO Trisociation V2)
 *
 * Les 3 couches CREDO declenchent des actions sur le canevas central:
 *   Bouche  (Vente)    → navigate, split_screen (expose, demontre)
 *   Cerveau (Idees)    → push_content, execute (elabore, decide, opere)
 *   Coeur   (Coaching) → context_widget, annotate (eleve, debloque)
 *
 * V2: push_content panel, phases CREDO tracker, split_screen mode
 *
 * Sprint B — CarlOS Noyau Omnipresent (D-081)
 */

import { createContext, useContext, useCallback, useRef, useState } from "react";
import type { CanvasAction } from "../api/types";

/** Phases CREDO sur 3 couches simultanees */
export interface CredoPhases {
  bouche: string;   // C | R | E | D | O
  cerveau: string;
  coeur: string;
}

/** Contenu pousse par CarlOS vers le canevas */
export interface PushedContent {
  titre: string;
  contenu: string;
  contentTypes: string[];
  fullLength: number;
  bot: string;
  timestamp: number;
}

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
  /** Contenu pousse par CarlOS (panel lateral) */
  pushedContent: PushedContent | null;
  /** Phases CREDO actives (3 couches) */
  credoPhases: CredoPhases;
  /** Mode split-screen actif */
  splitScreen: boolean;
  /** Action d'execution en cours (overlay de confirmation/progress) */
  executeAction: CanvasAction | null;
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
  /** Fermer le panel pushed content */
  dismissPushedContent: () => void;
  /** Toggle split-screen */
  toggleSplitScreen: () => void;
  /** Dismiss execute action overlay */
  dismissExecuteAction: () => void;
  /** Vider la file */
  clearPending: () => void;
}

type CanvasActionContextType = CanvasActionState & CanvasActionActions;

const CanvasActionCtx = createContext<CanvasActionContextType | null>(null);

const MAX_HISTORY = 20;
const DEFAULT_PHASES: CredoPhases = { bouche: "C", cerveau: "C", coeur: "C" };

export function CanvasActionProvider({ children }: { children: React.ReactNode }) {
  const [lastAction, setLastAction] = useState<CanvasAction | null>(null);
  const [activeWidget, setActiveWidget] = useState<CanvasAction | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<CanvasAction | null>(null);
  const [pushedContent, setPushedContent] = useState<PushedContent | null>(null);
  const [credoPhases, setCredoPhases] = useState<CredoPhases>(DEFAULT_PHASES);
  const [splitScreen, setSplitScreen] = useState(false);
  const [executeAction, setExecuteAction] = useState<CanvasAction | null>(null);
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
      case "annotate": {
        // Check if this is a phase_update meta-action
        const data = action.data as Record<string, unknown> | undefined;
        if (data?.type === "phase_update" && data?.credo_phases) {
          const phases = data.credo_phases as Record<string, string>;
          setCredoPhases({
            bouche: phases.bouche || "C",
            cerveau: phases.cerveau || "C",
            coeur: phases.coeur || "C",
          });
          return; // Don't show as annotation
        }
        setActiveAnnotation(action);
        // Auto-dismiss apres 8s
        setTimeout(() => setActiveAnnotation(null), 8000);
        break;
      }
      case "push_content": {
        // Extraire les donnees du contenu pousse
        const pushData = action.data as Record<string, unknown> | undefined;
        if (pushData) {
          setPushedContent({
            titre: (pushData.titre as string) || "Contenu CarlOS",
            contenu: (pushData.contenu as string) || "",
            contentTypes: (pushData.content_types as string[]) || [],
            fullLength: (pushData.full_length as number) || 0,
            bot: action.bot || "BCO",
            timestamp: Date.now(),
          });
        }
        break;
      }
      case "split_screen":
        setSplitScreen(true);
        break;
      case "navigate":
        // Consommee par CenterZone via lastAction
        pendingRef.current = [...pendingRef.current, action];
        break;
      case "execute":
        // Afficher overlay d'execution avec auto-dismiss 6s
        setExecuteAction(action);
        setTimeout(() => setExecuteAction(null), 6000);
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
  const dismissPushedContent = useCallback(() => setPushedContent(null), []);
  const toggleSplitScreen = useCallback(() => setSplitScreen((v) => !v), []);
  const dismissExecuteAction = useCallback(() => setExecuteAction(null), []);
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
        pushedContent,
        credoPhases,
        splitScreen,
        executeAction,
        dispatch,
        dispatchBatch,
        consumeNext,
        dismissWidget,
        dismissAnnotation,
        dismissPushedContent,
        toggleSplitScreen,
        dismissExecuteAction,
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
