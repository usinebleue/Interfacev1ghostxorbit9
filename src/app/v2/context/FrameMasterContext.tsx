/**
 * FrameMasterContext.tsx — Etat global du Frame Master
 * Sprint A — Frame Master V2
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { BotInfo } from "../api/types";

export type ActiveView = "dashboard" | "cockpit" | "health" | "department" | "detail" | "discussion" | "branches" | "cahier" | "scenarios" | "live-chat" | "canvas";

interface FrameMasterState {
  activeBot: BotInfo | null;
  activeBotCode: string;
  activeView: ActiveView;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  hasSeenSimulation: boolean;
  currentUser: string;
}

interface FrameMasterActions {
  setActiveBot: (bot: BotInfo) => void;
  setActiveView: (view: ActiveView) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setAuthenticated: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setHasSeenSimulation: (v: boolean) => void;
  setLeftCollapsed: (v: boolean) => void;
  // Registre pour le panel imperatif
  registerLeftPanel: (api: { collapse: () => void; expand: () => void }) => void;
}

type FrameMasterContextType = FrameMasterState & FrameMasterActions;

const FrameMasterContext = createContext<FrameMasterContextType | null>(null);

export function FrameMasterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeBot, setActiveBotState] = useState<BotInfo | null>(null);
  const [activeBotCode, setActiveBotCode] = useState("BCO");
  const [activeView, setActiveView] = useState<ActiveView>("department"); // Ouvre sur Direction (BCO) par defaut
  const [leftSidebarCollapsed, setLeftCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightCollapsed] = useState(false);
  const [isAuthenticated, setAuthenticatedState] = useState(() => {
    try { return localStorage.getItem("ghostx-auth") === "authenticated"; }
    catch { return false; }
  });

  const setAuthenticated = useCallback((v: boolean) => {
    setAuthenticatedState(v);
    try {
      if (v) localStorage.setItem("ghostx-auth", "authenticated");
      else localStorage.removeItem("ghostx-auth");
    } catch { /* noop */ }
  }, []);
  const [isOnboarded, setOnboardedState] = useState(true);      // DEV: bypass onboarding

  const setOnboarded = useCallback((v: boolean) => {
    setOnboardedState(v);
    try { localStorage.setItem("ghostx-onboarded", String(v)); }
    catch { /* noop */ }
  }, []);

  // Simulation CREDO dans CenterZone — active quand onboarding sera live
  const [hasSeenSimulation, setHasSeenSimulationState] = useState(true); // DEV: bypass

  const setHasSeenSimulation = useCallback((v: boolean) => {
    setHasSeenSimulationState(v);
    try { localStorage.setItem("ghostx-simulation-done", String(v)); }
    catch { /* noop */ }
  }, []);

  const leftPanelRef = useRef<{ collapse: () => void; expand: () => void } | null>(null);

  const setActiveBot = useCallback((bot: BotInfo) => {
    setActiveBotState(bot);
    setActiveBotCode(bot.code);
  }, []);

  const registerLeftPanel = useCallback((api: { collapse: () => void; expand: () => void }) => {
    leftPanelRef.current = api;
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    if (leftPanelRef.current) {
      if (leftSidebarCollapsed) {
        leftPanelRef.current.expand();
      } else {
        leftPanelRef.current.collapse();
      }
    }
    setLeftCollapsed((v) => !v);
  }, [leftSidebarCollapsed]);

  const toggleRightSidebar = useCallback(
    () => setRightCollapsed((v) => !v),
    []
  );

  return (
    <FrameMasterContext.Provider
      value={{
        activeBot,
        activeBotCode,
        activeView,
        leftSidebarCollapsed,
        rightSidebarCollapsed,
        isAuthenticated,
        isOnboarded,
        hasSeenSimulation,
        currentUser: "Carl Fugere",
        setActiveBot,
        setActiveView,
        toggleLeftSidebar,
        toggleRightSidebar,
        setAuthenticated,
        setOnboarded,
        setHasSeenSimulation,
        setLeftCollapsed,
        registerLeftPanel,
      }}
    >
      {children}
    </FrameMasterContext.Provider>
  );
}

export function useFrameMaster(): FrameMasterContextType {
  const ctx = useContext(FrameMasterContext);
  if (!ctx)
    throw new Error("useFrameMaster must be inside FrameMasterProvider");
  return ctx;
}
