/**
 * FrameMasterContext.tsx — Etat global du Frame Master
 * Sprint A — Frame Master V2
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { BotInfo } from "../api/types";

export type ActiveView = "dashboard" | "cockpit" | "health" | "department" | "detail" | "discussion" | "branches" | "cahier" | "scenarios" | "live-chat" | "canvas" | "orbit9-detail" | "agent-settings" | "espace-bureau" | "blueprint" | "board-room" | "war-room" | "think-room" | "mes-chantiers" | "bible-visuelle" | "bible-technique" | "bible-ghml" | "master-roadmap" | "master-strategie" | "master-orbit9" | "master-communication" | "master-dette" | "master-routine" | "master-minedor" | "master-training" | "master-profils" | "master-parcours" | "master-navigation" | "master-angles-morts" | "master-capacites" | "master-instance-fonds" | "master-diagnostics" | "master-playbooks" | "master-bibliotheque-exec" | "master-marketing-360" | "master-guides-legaux" | "master-cortex-robot" | "master-hydro-quebec" | "master-flows" | "master-cartographie" | "master-oracle9" | "master-bible-live" | "bible-visuelle-cible" | "flow-usine-bleue" | "animation-showcase" | "agent-gallery" | "playbook-usine-bleue" | "fe-sidebar-droite" | "blueprint-reseau" | "fe-mon-reseau" | "accueil-hero" | "bible-officielle" | "carlos-codes" | "diagnostic-ia" | "diagnostic-hub" | "meeting-room";

export type EspaceSection = "idees" | "projets" | "documents" | "taches" | "outils" | "agenda" | "templates";

export type BlueprintSection = "live" | "hub" | "pipeline";

export type DiscussionTab = "chantiers" | "projets" | "missions" | "discussions";

interface FrameMasterState {
  activeBot: BotInfo | null;
  activeBotCode: string;
  activeView: ActiveView;
  activeOrbit9Section: string | null;
  activeEspaceSection: EspaceSection;
  activeBlueprintSection: BlueprintSection;
  activeDiscussionTab: DiscussionTab;
  /** D-109 — Source view quand on ouvre le LiveChat depuis une Room */
  chatSourceView: string | null;
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
  /** Navigate vers un departement par code bot (sans BotInfo complet) */
  navigateToDepartment: (botCode: string, view?: ActiveView) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setAuthenticated: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setHasSeenSimulation: (v: boolean) => void;
  setLeftCollapsed: (v: boolean) => void;
  navigateOrbit9: (sectionId: string) => void;
  navigateEspace: (section: EspaceSection) => void;
  navigateBlueprint: (section: BlueprintSection) => void;
  navigateDiscussionTab: (tab: DiscussionTab) => void;
  /** D-109 — Ouvre le LiveChat avec contexte de la source (board-room, war-room, etc.) */
  navigateToChat: (sourceView: string) => void;
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
  const [activeOrbit9Section, setActiveOrbit9Section] = useState<string | null>(null);
  const [activeEspaceSection, setActiveEspaceSection] = useState<EspaceSection>("idees");
  const [activeBlueprintSection, setActiveBlueprintSection] = useState<BlueprintSection>("live");
  const [activeDiscussionTab, setActiveDiscussionTab] = useState<DiscussionTab>("discussions");
  const [chatSourceView, setChatSourceView] = useState<string | null>(null);
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

  const navigateOrbit9 = useCallback((sectionId: string) => {
    setActiveOrbit9Section(sectionId);
    setActiveView("orbit9-detail");
  }, []);

  const navigateEspace = useCallback((section: EspaceSection) => {
    setActiveEspaceSection(section);
    setActiveView("espace-bureau");
  }, []);

  const navigateBlueprint = useCallback((section: BlueprintSection) => {
    setActiveBlueprintSection(section);
    setActiveView("blueprint");
  }, []);

  const navigateDiscussionTab = useCallback((tab: DiscussionTab) => {
    setActiveDiscussionTab(tab);
  }, []);

  const navigateToChat = useCallback((sourceView: string) => {
    setChatSourceView(sourceView);
    setActiveView("live-chat");
  }, []);

  const navigateToDepartment = useCallback((botCode: string, view: ActiveView = "department") => {
    setActiveBotCode(botCode);
    setActiveView(view);
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
        activeOrbit9Section,
        activeEspaceSection,
        activeBlueprintSection,
        activeDiscussionTab,
        chatSourceView,
        leftSidebarCollapsed,
        rightSidebarCollapsed,
        isAuthenticated,
        isOnboarded,
        hasSeenSimulation,
        currentUser: "Carl Fugere",
        setActiveBot,
        setActiveView,
        navigateToDepartment,
        toggleLeftSidebar,
        toggleRightSidebar,
        setAuthenticated,
        setOnboarded,
        setHasSeenSimulation,
        setLeftCollapsed,
        navigateOrbit9,
        navigateEspace,
        navigateBlueprint,
        navigateDiscussionTab,
        navigateToChat,
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
