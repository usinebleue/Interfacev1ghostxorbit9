/**
 * TransitionContext.tsx — Contexte de transition inter-modes
 * Porte les donnees d'un mode a l'autre (tension, insights, scores)
 * Gere le breadcrumb et les guards anti-boucle
 * Sprint A — Frame Master V2
 */

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ───

export type ModeId = "credo" | "cahier" | "debat" | "crise" | "brainstorm" | "analyse" | "strategie" | "innovation" | "deep" | "decision" | "hub";

export interface TransitionData {
  /** La tension/question originale de l'utilisateur */
  tension?: string;
  /** Insights collectes dans le mode source */
  insights?: string[];
  /** Scores/donnees structurees du mode source */
  scores?: Record<string, number>;
  /** Mode source */
  sourceMode?: ModeId;
  /** Raison de la transition */
  transitionReason?: string;
}

export interface BreadcrumbEntry {
  mode: ModeId;
  label: string;
  depth: number;
}

interface TransitionContextValue {
  /** Donnees portees entre modes */
  transitionData: TransitionData | null;
  /** Breadcrumb — historique des modes visites */
  breadcrumb: BreadcrumbEntry[];
  /** Profondeur actuelle (max 3) */
  depth: number;
  /** Peut-on encore transitionner ? (guard anti-boucle) */
  canTransition: boolean;
  /** Initier une transition vers un autre mode */
  transitionTo: (targetMode: ModeId, data?: TransitionData) => void;
  /** Retourner au hub */
  returnToHub: () => void;
  /** Retourner au mode precedent */
  goBack: () => void;
  /** Reset complet */
  reset: () => void;
  /** Mode actuel */
  currentMode: ModeId;
  /** Setter pour le mode actuel (utilise par ScenarioHub) */
  setCurrentMode: (mode: ModeId) => void;
  /** Message anti-boucle */
  antiLoopMessage: string | null;
}

const MAX_DEPTH = 3;

const MODE_LABELS: Record<ModeId, string> = {
  hub: "Hub",
  credo: "CREDO",
  cahier: "Cahier SMART",
  debat: "Debat",
  crise: "Crise",
  brainstorm: "Brainstorm",
  analyse: "Analyse",
  strategie: "Strategie",
  innovation: "Innovation",
  deep: "Deep Resonance",
  decision: "Decision",
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

// ─── Provider ───

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<ModeId>("hub");
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([]);
  const [transitionData, setTransitionData] = useState<TransitionData | null>(null);
  const [antiLoopMessage, setAntiLoopMessage] = useState<string | null>(null);

  const depth = breadcrumb.length;
  const canTransition = depth < MAX_DEPTH;

  const transitionTo = useCallback((targetMode: ModeId, data?: TransitionData) => {
    if (depth >= MAX_DEPTH) {
      setAntiLoopMessage(
        `Tu es a ${MAX_DEPTH} niveaux de profondeur (${breadcrumb.map(b => b.label).join(" > ")}). Finalise le mode actuel ou retourne au Hub.`
      );
      return;
    }

    setAntiLoopMessage(null);
    setBreadcrumb(prev => [
      ...prev,
      { mode: currentMode, label: MODE_LABELS[currentMode], depth: prev.length },
    ]);
    setTransitionData({
      ...data,
      sourceMode: currentMode,
    });
    setCurrentMode(targetMode);
  }, [currentMode, depth, breadcrumb]);

  const returnToHub = useCallback(() => {
    setCurrentMode("hub");
    setBreadcrumb([]);
    setTransitionData(null);
    setAntiLoopMessage(null);
  }, []);

  const goBack = useCallback(() => {
    if (breadcrumb.length === 0) {
      setCurrentMode("hub");
      return;
    }
    const prev = breadcrumb[breadcrumb.length - 1];
    setBreadcrumb(bc => bc.slice(0, -1));
    setCurrentMode(prev.mode);
    setAntiLoopMessage(null);
  }, [breadcrumb]);

  const reset = useCallback(() => {
    setCurrentMode("hub");
    setBreadcrumb([]);
    setTransitionData(null);
    setAntiLoopMessage(null);
  }, []);

  return (
    <TransitionContext.Provider value={{
      transitionData,
      breadcrumb,
      depth,
      canTransition,
      transitionTo,
      returnToHub,
      goBack,
      reset,
      currentMode,
      setCurrentMode,
      antiLoopMessage,
    }}>
      {children}
    </TransitionContext.Provider>
  );
}

// ─── Hook ───

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used within TransitionProvider");
  return ctx;
}

export { MODE_LABELS };
