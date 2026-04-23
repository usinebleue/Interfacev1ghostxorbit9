/**
 * AmorcerContext.tsx — État partagé entre les 3 zones V3
 * Architecture V3 — Zéro Destruction
 *
 * Gère: activePhase, rightSection, activeBotCode, cockpitTab,
 *        chatStage, reflexionContext, o9Section
 * Consommé par: DiscussionWindow, WorkspacePhasesPanel, ControlTowerPanel
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { PhaseKey } from "./core/types";

export interface SimV3CristalliseItem {
  id: string;
  text: string;
  source: string;
  sectionId: string;
}

interface AmorcerState {
  // Phase active AMORCER (7 phases)
  activePhase: PhaseKey;
  setActivePhase: (p: PhaseKey) => void;

  // Chat progression (mock demo)
  chatStage: number;
  setChatStage: React.Dispatch<React.SetStateAction<number>>;
  typed: boolean;
  setTyped: (v: boolean) => void;

  // Contexte de réflexion (quel chantier a déclenché la réflexion)
  reflexionContext: string | null;
  setReflexionContext: (c: string | null) => void;

  // Section active dans le right panel (blueprint, dashboard, etc.)
  rightSection: string | null;
  setRightSection: (s: string | null) => void;

  // Bot/département actif
  activeBotCode: string;
  setActiveBotCode: (code: string) => void;

  // Tab cockpit (brainteam vs orbit9)
  cockpitTab: string;
  setCockpitTab: (t: string) => void;

  // Section Orbit9
  o9Section: string;
  setO9Section: (s: string) => void;

  // Conception phase state (chat ↔ workspace sync)
  conceptionStage: number;
  setConceptionStage: React.Dispatch<React.SetStateAction<number>>;
  advanceConception: () => void;
  startConception: () => void;

  // Deliverable conception (Level 2 — document/tableur/presentation/code)
  activeDeliverable: string | null;
  setActiveDeliverable: (d: string | null) => void;
  deliverableStage: number;
  setDeliverableStage: React.Dispatch<React.SetStateAction<number>>;
  advanceDeliverable: () => void;
  startDeliverable: (deliverable: string) => void;

  // SimV3 shared state (chat ↔ right panel)
  simV3Active: boolean;
  setSimV3Active: (v: boolean) => void;
  simV3Stage: number;
  setSimV3Stage: React.Dispatch<React.SetStateAction<number>>;
  simV3Cristallises: SimV3CristalliseItem[];
  addSimV3Cristallise: (text: string, source: string, sectionId: string) => void;

  // Helpers
  startReflexion: (chantier: string) => void;
  advance: () => void;
}

const AmorcerCtx = createContext<AmorcerState | null>(null);

export function AmorcerProvider({ children }: { children: ReactNode }) {
  const [activePhase, setActivePhase] = useState<PhaseKey>("observation");
  const [chatStage, setChatStage] = useState(0);
  const [typed, setTyped] = useState(false);
  const [reflexionContext, setReflexionContext] = useState<string | null>(null);
  const [rightSection, setRightSection] = useState<string | null>("cockpit");
  const [activeBotCode, setActiveBotCode] = useState("CEOB");
  const [cockpitTab, setCockpitTab] = useState("bureau");
  const [o9Section, setO9Section] = useState("dashboard");

  // Conception state
  const [conceptionStage, setConceptionStage] = useState(0);

  // Deliverable conception state (Level 2)
  const [activeDeliverable, setActiveDeliverable] = useState<string | null>(null);
  const [deliverableStage, setDeliverableStage] = useState(0);

  // SimV3 state
  const [simV3Active, setSimV3Active] = useState(false);
  const [simV3Stage, setSimV3Stage] = useState(-1);
  const [simV3Cristallises, setSimV3Cristallises] = useState<SimV3CristalliseItem[]>([]);
  const addSimV3Cristallise = useCallback((text: string, source: string, sectionId: string) => {
    setSimV3Cristallises((prev) => [...prev, { id: `c-${Date.now()}`, text, source, sectionId }]);
  }, []);

  const startReflexion = useCallback((chantier: string) => {
    setReflexionContext(chantier);
    setActivePhase("reflexion");
    setRightSection(null);
  }, []);

  const advance = useCallback(() => {
    setTyped(false);
    setChatStage((s) => s + 1);
  }, []);

  const advanceConception = useCallback(() => {
    setTyped(false);
    setConceptionStage((s) => s + 1);
  }, []);

  const startConception = useCallback(() => {
    setActivePhase("creation");
    setRightSection(null);
    setConceptionStage(0);
    setActiveDeliverable(null);
    setTyped(false);
  }, []);

  const advanceDeliverable = useCallback(() => {
    setTyped(false);
    setDeliverableStage((s) => s + 1);
  }, []);

  const startDeliverable = useCallback((deliverable: string) => {
    setActiveDeliverable(deliverable);
    setDeliverableStage(0);
    setTyped(false);
  }, []);

  return (
    <AmorcerCtx.Provider
      value={{
        activePhase, setActivePhase,
        chatStage, setChatStage,
        typed, setTyped,
        reflexionContext, setReflexionContext,
        rightSection, setRightSection,
        activeBotCode, setActiveBotCode,
        cockpitTab, setCockpitTab,
        o9Section, setO9Section,
        conceptionStage, setConceptionStage,
        advanceConception, startConception,
        activeDeliverable, setActiveDeliverable,
        deliverableStage, setDeliverableStage,
        advanceDeliverable, startDeliverable,
        simV3Active, setSimV3Active,
        simV3Stage, setSimV3Stage,
        simV3Cristallises, addSimV3Cristallise,
        startReflexion, advance,
      }}
    >
      {children}
    </AmorcerCtx.Provider>
  );
}

export function useAmorcer(): AmorcerState {
  const ctx = useContext(AmorcerCtx);
  if (!ctx) throw new Error("useAmorcer must be inside AmorcerProvider");
  return ctx;
}
