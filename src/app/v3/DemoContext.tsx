/**
 * DemoContext.tsx — Coordonne le mode demo entre Discussion et Workspace
 *
 * Contexte leger separe de AmorcerContext.
 * Quand demoSimId != null, DiscussionWindow affiche DemoChatPlayer
 * et SimulationGallery override chatStage pour les Focus views.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface DemoState {
  demoSimId: string | null;
  demoStage: number;
  setDemoSimId: (id: string | null) => void;
  advanceDemo: () => void;
  resetDemo: () => void;
}

const DemoCtx = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoSimId, setDemoSimIdRaw] = useState<string | null>(null);
  const [demoStage, setDemoStage] = useState(0);

  const setDemoSimId = useCallback((id: string | null) => {
    setDemoSimIdRaw(id);
    setDemoStage(0);
  }, []);

  const advanceDemo = useCallback(() => {
    setDemoStage((s) => s + 1);
  }, []);

  const resetDemo = useCallback(() => {
    setDemoStage(0);
  }, []);

  return (
    <DemoCtx.Provider value={{ demoSimId, demoStage, setDemoSimId, advanceDemo, resetDemo }}>
      {children}
    </DemoCtx.Provider>
  );
}

export function useDemo(): DemoState {
  const ctx = useContext(DemoCtx);
  if (!ctx) throw new Error("useDemo must be inside DemoProvider");
  return ctx;
}
