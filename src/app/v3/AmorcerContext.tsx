/**
 * AmorcerContext.tsx — État partagé entre les 3 zones V3
 * Architecture V3 — Zéro Destruction
 *
 * Gère: activePhase, rightSection, activeBotCode, cockpitTab,
 *        chatStage, reflexionContext, o9Section
 * Consommé par: DiscussionWindow, WorkspacePhasesPanel, ControlTowerPanel
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { PhaseKey } from "./core/types";

// ═══ localStorage persistence (Fix R5 — état survit au refresh) ═══
const LS_PREFIX = "v3:";
function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(LS_PREFIX + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {}
}

// ═══ URL sync — section visible dans la barre d'adresse ═══
// Bot code → slug URL court
const BOT_TO_SLUG: Record<string, string> = {
  CEOB: "ceo", CTOB: "cto", CFOB: "cfo", CMOB: "cmo", CSOB: "cso", COOB: "coo",
  CPOB: "cpo", CHROB: "chro", CINOB: "cino", CROB: "cro", CLOB: "clo", CISOB: "ciso",
};
const SLUG_TO_BOT: Record<string, string> = Object.fromEntries(
  Object.entries(BOT_TO_SLUG).map(([code, slug]) => [slug, code])
);
// Section ID → slug URL (français, lisible)
const SECTION_TO_SLUG: Record<string, string> = {
  cockpit: "cockpit", execution: "execution", blueprint: "blueprint",
  dataroom: "donnees", playbooks: "playbook", conferenceai: "reunion",
  "bureau-agenda": "agenda", admin: "admin", bureau: "bureau",
  reglages: "reglages", "bible-officielle": "bible-officielle",
  scenarios: "scenarios", ateliers: "ateliers", "mon-reseau": "mon-reseau",
  "salles-hub": "salles-hub", "board-room": "board-room", "war-room": "war-room",
  "think-room": "think-room", "diagnostic-ia": "diagnostic-ia",
  "mon-equipe": "mon-equipe", "mon-entreprise": "mon-entreprise",
  "agent-settings": "agent-settings", dashboard: "dashboard", orbit9: "orbit9",
};
const SLUG_TO_SECTION: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_TO_SLUG).map(([id, slug]) => [slug, id])
);
function sectionToSlug(sectionId: string): string {
  return SECTION_TO_SLUG[sectionId] || sectionId;
}
const RESERVED_PATHS = ["v2", "meeting", "simulation"];
// Slugs de bots connus (pour distinguer /cmo/cockpit de /cockpit)
const ALL_BOT_SLUGS = new Set(Object.values(BOT_TO_SLUG));

function parseURL(): { dept: string | null; section: string | null; sub: string | null } {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path || RESERVED_PATHS.some(p => path.startsWith(p))) return { dept: null, section: null, sub: null };
  const parts = path.split("/");

  // Check if first segment is a department slug
  if (ALL_BOT_SLUGS.has(parts[0])) {
    const dept = SLUG_TO_BOT[parts[0]] || null;
    const section = parts[1] ? (SLUG_TO_SECTION[parts[1]] || parts[1]) : null;
    const sub = parts[2] || null;
    return { dept, section, sub };
  }

  // No dept prefix — just section/sub
  const section = SLUG_TO_SECTION[parts[0]] || parts[0];
  const sub = parts[1] || null;
  return { dept: null, section, sub };
}

// Active bot code stocké ici pour pushSectionURL (mis à jour par setActiveBotCode)
let _activeBotSlug = "ceo";

/** Push dept/section/sub-section into the URL bar */
export function pushSectionURL(section: string, sub?: string | null) {
  const slug = sectionToSlug(section);
  const target = sub ? `/${_activeBotSlug}/${slug}/${sub}` : `/${_activeBotSlug}/${slug}`;
  if (window.location.pathname !== target) {
    window.history.pushState({ section, sub }, "", target);
  }
}

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

  // Focus type (adapte la sidebar de FocusDiscussionView)
  focusType: string;
  setFocusType: (t: string) => void;

  // Helpers
  startReflexion: (chantier: string) => void;
  advance: () => void;
  resetChat: () => void;
}

const AmorcerCtx = createContext<AmorcerState | null>(null);

export function AmorcerProvider({ children }: { children: ReactNode }) {
  const [activePhase, setActivePhaseRaw] = useState<PhaseKey>(() => lsGet("activePhase", "observation"));
  const [chatStage, setChatStage] = useState(0);
  const [typed, setTyped] = useState(false);
  const [reflexionContext, setReflexionContextRaw] = useState<string | null>(() => lsGet("reflexionContext", null));
  // Parse URL une seule fois au mount
  const [initialURL] = useState(() => parseURL());

  const [rightSection, setRightSectionRaw] = useState<string | null>(() => {
    if (initialURL.section === "orbit9") return null;
    // Si on est dans une phase focus (discussion, reflexion, etc.) avec un contexte,
    // ne PAS restaurer rightSection — laisser null pour que le workspace focus s'affiche
    const restoredPhase = lsGet<string>("activePhase", "observation");
    const restoredContext = lsGet<string | null>("reflexionContext", null);
    if (restoredContext && ["discussion", "reflexion", "creation", "retroaction"].includes(restoredPhase)) {
      return null;
    }
    return initialURL.section || lsGet("rightSection", "cockpit");
  });
  const [activeBotCode, setActiveBotCodeRaw] = useState(() => {
    const fromURL = initialURL.dept;
    const code = fromURL || lsGet("activeBotCode", "CEOB");
    _activeBotSlug = BOT_TO_SLUG[code] || "ceo";
    return code;
  });
  const [cockpitTab, setCockpitTabRaw] = useState(() => {
    if (initialURL.section === "orbit9") return "orbit9";
    return lsGet("cockpitTab", "bureau");
  });

  // Wrappers with localStorage + URL persistence
  const setRightSection = useCallback((s: string | null) => {
    setRightSectionRaw(s);
    if (s) {
      lsSet("rightSection", s);
      pushSectionURL(s);
    }
  }, []);

  // Écouter back/forward du navigateur
  useEffect(() => {
    const onPopState = () => {
      const { dept, section, sub } = parseURL();
      if (dept) {
        setActiveBotCodeRaw(dept);
        _activeBotSlug = BOT_TO_SLUG[dept] || "ceo";
      }
      if (section === "orbit9") {
        setCockpitTabRaw("orbit9");
        setRightSectionRaw(null);
        setO9SectionRaw(sub || "dashboard");
      } else {
        setCockpitTabRaw("bureau");
        setRightSectionRaw(section || lsGet("rightSection", "cockpit"));
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const setActiveBotCode = useCallback((code: string) => {
    setActiveBotCodeRaw(code);
    lsSet("activeBotCode", code);
    _activeBotSlug = BOT_TO_SLUG[code] || "ceo";
  }, []);
  const setCockpitTab = useCallback((t: string) => {
    setCockpitTabRaw(t);
    lsSet("cockpitTab", t);
    if (t === "orbit9") {
      const target = `/${_activeBotSlug}/orbit9`;
      if (window.location.pathname !== target) {
        window.history.pushState({ section: "orbit9" }, "", target);
      }
    }
  }, []);
  const [o9Section, setO9SectionRaw] = useState(() => {
    if (initialURL.section === "orbit9" && initialURL.sub) return initialURL.sub;
    return "dashboard";
  });
  const setO9Section = useCallback((s: string) => {
    setO9SectionRaw(s);
    const sub = s === "dashboard" ? null : s;
    const target = sub ? `/${_activeBotSlug}/orbit9/${sub}` : `/${_activeBotSlug}/orbit9`;
    if (window.location.pathname !== target) {
      window.history.pushState({ section: "orbit9", sub }, "", target);
    }
  }, []);

  // Conception state
  const [conceptionStage, setConceptionStage] = useState(0);

  // Deliverable conception state (Level 2)
  const [activeDeliverable, setActiveDeliverable] = useState<string | null>(null);
  const [deliverableStage, setDeliverableStage] = useState(0);

  // Focus type state — persisté en localStorage
  const [focusType, setFocusTypeRaw] = useState(() => lsGet("focusType", "chantier"));

  // SimV3 state
  const [simV3Active, setSimV3Active] = useState(false);
  const [simV3Stage, setSimV3Stage] = useState(-1);
  const [simV3Cristallises, setSimV3Cristallises] = useState<SimV3CristalliseItem[]>([]);
  const addSimV3Cristallise = useCallback((text: string, source: string, sectionId: string) => {
    setSimV3Cristallises((prev) => [...prev, { id: `c-${Date.now()}`, text, source, sectionId }]);
  }, []);

  // Wrappers avec localStorage pour activePhase, reflexionContext, focusType
  const setActivePhase = useCallback((p: PhaseKey) => {
    setActivePhaseRaw(p);
    lsSet("activePhase", p);
  }, []);
  const setReflexionContext = useCallback((c: string | null) => {
    setReflexionContextRaw(c);
    lsSet("reflexionContext", c);
  }, []);
  const setFocusType = useCallback((t: string) => {
    setFocusTypeRaw(t);
    lsSet("focusType", t);
  }, []);

  const resetChat = useCallback(() => {
    setActivePhase("observation");
    setChatStage(0);
    setTyped(false);
    setReflexionContext(null);
    setConceptionStage(0);
    setActiveDeliverable(null);
    setDeliverableStage(0);
    setFocusType("chantier");
  }, [setActivePhase, setReflexionContext, setFocusType]);

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
        focusType, setFocusType,
        simV3Active, setSimV3Active,
        simV3Stage, setSimV3Stage,
        simV3Cristallises, addSimV3Cristallise,
        startReflexion, advance, resetChat,
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
