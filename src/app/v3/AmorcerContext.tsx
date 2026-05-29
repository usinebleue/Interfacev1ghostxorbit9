/**
 * AmorcerContext.tsx — État partagé entre les 3 zones V3
 * Architecture V3 — Zéro Destruction
 *
 * Gère: activePhase, rightSection, activeBotCode, cockpitTab,
 *        chatStage, reflexionContext, o9Section
 * Consommé par: DiscussionWindow, WorkspacePhasesPanel, ControlTowerPanel
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { PhaseKey, CredoPhaseKey, WorkflowItem, WorkspaceBlock, WorkspaceBlockType, WorkspaceTask } from "./core/types";
import type { MeetingStatus, ParticipantInfo } from "./hooks/useLiveKitMeeting";
import { api } from "../v2/api/client";
import { useChatContext } from "../v2/context/ChatContext";

export interface MeetingControlsState {
  meetingStatus: MeetingStatus;
  micEnabled: boolean;
  cameraEnabled: boolean;
  elapsedTime: number;
  participants: Map<string, ParticipantInfo>;
  toggleMic: () => void;
  toggleCamera: () => void;
  endMeeting: () => void;
}

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

// ═══ Thread-scoped phases — blocks liés au thread actif ══���
const THREAD_SCOPED_PHASES = ["discussion", "reflexion", "creation", "execution", "retroaction"];

/** Construire les clés de stockage selon le thread actif */
function getStorageKeys(threadId: string | null, botCode: string, phase: string) {
  if (threadId && THREAD_SCOPED_PHASES.includes(phase)) {
    return {
      lsKey: `wsBlocks:${threadId}`,
      canvasKey: `workspace_disc_${threadId}_${phase}`,
      cacheKey: `${threadId}_${phase}`,
    };
  }
  // Fallback legacy (pas de thread actif ou phase non-scoped)
  return {
    lsKey: "workspaceBlocks",
    canvasKey: `workspace_phase_${botCode}_${phase}`,
    cacheKey: `${botCode}_${phase}`,
  };
}

function parseURL(): { dept: string | null; section: string | null; sub: string | null } {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path || RESERVED_PATHS.some(p => path.startsWith(p))) return { dept: null, section: null, sub: null };
  const parts = path.split("/");

  // Check if first segment is a department slug
  if (ALL_BOT_SLUGS.has(parts[0])) {
    const dept = SLUG_TO_BOT[parts[0]] || null;
    // Route: /{bot}/discussion/{threadId} — deep link vers une discussion spécifique
    if (parts[1] === "discussion" && parts[2]) {
      return { dept, section: "discussion", sub: parts[2] };
    }
    const section = parts[1] ? (SLUG_TO_SECTION[parts[1]] || parts[1]) : null;
    const sub = parts[2] || null;
    return { dept, section, sub };
  }

  // Route: /discussion/{threadId} — sans préfixe bot
  if (parts[0] === "discussion" && parts[1]) {
    return { dept: null, section: "discussion", sub: parts[1] };
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

/** Push discussion thread URL */
export function pushDiscussionURL(threadId: string) {
  const target = `/${_activeBotSlug}/discussion/${threadId}`;
  if (window.location.pathname !== target) {
    window.history.pushState({ section: "discussion", threadId }, "", target);
  }
}

export interface SimV3CristalliseItem {
  id: string;
  text: string;
  source: string;
  sectionId: string;
  sourceType?: "chat" | "voice" | "meeting";
  contentTypes?: string[];  // S103 — types détectés par backend (tableau, code, metriques, etc.)
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

  // S117-B: Reflexion setup (qualification before launch) and flow (active mode execution)
  reflexionSetup: { mode: string; participants: string; experts: string[]; subject: string } | null;
  setReflexionSetup: (s: { mode: string; participants: string; experts: string[]; subject: string } | null) => void;
  reflexionFlow: { mode: string; stages: { id: string; title: string; subtitle?: string }[]; currentStage: number; results: Record<string, string> } | null;
  setReflexionFlow: (f: { mode: string; stages: { id: string; title: string; subtitle?: string }[]; currentStage: number; results: Record<string, string> } | null) => void;

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
  startDeliverable: (deliverable: string, draftLibraryId?: number) => void;
  draftLibraryId: number | null;
  // CPRJ — library auto-créée par LiveDocForgeLivrable (utilisée par useChat pour pipeline)
  activeDocForgeLibraryId: number | null;
  setActiveDocForgeLibraryId: (id: number | null) => void;

  // SimV3 shared state (chat ↔ right panel)
  simV3Active: boolean;
  setSimV3Active: (v: boolean) => void;
  simV3Stage: number;
  setSimV3Stage: React.Dispatch<React.SetStateAction<number>>;
  // Workspace capture (artefacts progressifs)
  pendingCapture: string | null;
  setPendingCapture: (sectionId: string | null) => void;
  getCristallise: (sectionId: string) => string | null;
  getCristalliseItem: (sectionId: string) => SimV3CristalliseItem | null;
  editCristallise: (sectionId: string, newText: string) => void;

  // Focus type (adapte la sidebar de FocusDiscussionView)
  focusType: string;
  setFocusType: (t: string) => void;

  // CREDO phase (sub-phase de Discussion)
  credoPhase: CredoPhaseKey;
  setCredoPhase: (p: CredoPhaseKey) => void;

  // Workflow items (captures pendant le flow 5 phases)
  workflowItems: WorkflowItem[];
  addWorkflowItem: (phase: string, text: string, type: WorkflowItem["type"], credoKey?: string) => void;
  removeWorkflowItem: (id: string) => void;
  clearWorkflowItems: () => void;

  // Workspace session (multi-communication partagé)
  workspaceSessionId: string | null;
  startWorkspaceSession: () => string;

  // Blueprint Atelier dans workspace (Sprint 5)
  activeDocumentKey: string | null;
  setActiveDocumentKey: (k: string | null) => void;
  activeDocumentSection: string | null;
  setActiveDocumentSection: (s: string | null) => void;

  // Réunion active (survit à la navigation entre sections)
  activeMeeting: { type: string; title: string; slug?: string; playbookId?: string; family?: string; botCodes?: string[] } | null;
  setActiveMeeting: (m: { type: string; title: string; slug?: string; playbookId?: string; family?: string; botCodes?: string[] } | null) => void;

  // Meeting controls partagés (WPP écrit, MeetingMiniBar lit)
  meetingControls: MeetingControlsState | null;
  setMeetingControls: (controls: MeetingControlsState | null) => void;

  // Workspace blocks dynamiques (discussion)
  workspaceBlocks: WorkspaceBlock[];
  addWorkspaceBlock: (block: WorkspaceBlock) => void;
  updateWorkspaceBlock: (id: string, updates: Partial<WorkspaceBlock>) => void;
  removeWorkspaceBlock: (id: string) => void;
  getBlocksByCredoStep: (step: string) => WorkspaceBlock[];
  getBlocksByType: (type: WorkspaceBlockType) => WorkspaceBlock[];

  // Discussion thread actif (scoping workspace blocks per-thread)
  activeDiscussionId: string | null;

  // Workspace tasks (taches assignables)
  workspaceTasks: WorkspaceTask[];
  addWorkspaceTask: (task: WorkspaceTask) => void;
  updateWorkspaceTask: (id: string, updates: Partial<WorkspaceTask>) => void;
  removeWorkspaceTask: (id: string) => void;

  // Helpers
  startReflexion: (chantier: string) => void;
  advance: () => void;
  resetChat: () => void;
}

const AmorcerCtx = createContext<AmorcerState | null>(null);

export function AmorcerProvider({ children }: { children: ReactNode }) {
  // ═══ Thread actif depuis ChatContext (scoping workspace blocks per-discussion) ═══
  const { activeThreadId, resumeThread } = useChatContext();
  const activeThreadIdRef = useRef(activeThreadId);
  activeThreadIdRef.current = activeThreadId;

  const [activePhase, setActivePhaseRaw] = useState<PhaseKey>(() => {
    const stored = lsGet<string>("activePhase", "observation");
    // URL-based: allow direct navigation to /ceo/execution/*
    const urlSection = parseURL().section;
    if (urlSection === "execution") {
      lsSet("activePhase", "execution");
      return "execution" as PhaseKey;
    }
    // URL-based: /discussion/{threadId} → démarrer en phase discussion
    if (urlSection === "discussion") {
      lsSet("activePhase", "discussion");
      return "discussion" as PhaseKey;
    }
    // Never restore execution/retroaction from localStorage — always entered via explicit workflow transition
    if (stored === "execution" || stored === "retroaction") {
      lsSet("activePhase", "observation"); // Also clear localStorage
      return "observation" as PhaseKey;
    }
    return stored as PhaseKey;
  });
  const [chatStage, setChatStage] = useState(0);
  const [typed, setTyped] = useState(false);
  const [reflexionContext, setReflexionContextRaw] = useState<string | null>(() => lsGet("reflexionContext", null));
  // S117-B: Reflexion setup + flow state
  const [reflexionSetup, setReflexionSetup] = useState<{ mode: string; participants: string; experts: string[]; subject: string } | null>(null);
  const [reflexionFlow, setReflexionFlow] = useState<{ mode: string; stages: { id: string; title: string; subtitle?: string }[]; currentStage: number; results: Record<string, string> } | null>(null);
  // Parse URL une seule fois au mount
  const [initialURL] = useState(() => parseURL());

  const [rightSection, setRightSectionRaw] = useState<string | null>(() => {
    if (initialURL.section === "orbit9") return null;
    // Discussion URL → workspace panel (pas cockpit)
    if (initialURL.section === "discussion") return null;
    const restoredPhase = lsGet<string>("activePhase", "observation");
    const restoredContext = lsGet<string | null>("reflexionContext", null);
    // Phase focus avec contexte → null (workspace affiche la vue phase)
    if (restoredContext && ["discussion", "reflexion", "creation", "retroaction"].includes(restoredPhase)) {
      return null;
    }
    const stored = initialURL.section || lsGet("rightSection", "cockpit");
    // Allow URL-based navigation to execution; block localStorage restoration
    if (stored === "execution") {
      if (initialURL.section === "execution") {
        return null; // ExecutionView renders via activePhase, not rightSection
      }
      lsSet("rightSection", "cockpit");
      return "cockpit";
    }
    return stored;
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
    lsSet("rightSection", s);
    if (s) {
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
      if (section === "discussion" && sub) {
        // Navigation vers une discussion spécifique
        resumeThread(sub);
        setActivePhaseRaw("discussion" as PhaseKey);
        lsSet("activePhase", "discussion");
        setRightSectionRaw(null);
      } else if (section === "orbit9") {
        setCockpitTabRaw("orbit9");
        setRightSectionRaw(null);
        setO9SectionRaw(sub || "dashboard");
      } else {
        setCockpitTabRaw("bureau");
        const resolved = section || lsGet("rightSection", "cockpit");
        // Execution/retroaction navigate via activePhase, not rightSection
        if (resolved === "execution" || resolved === "retroaction") {
          setActivePhaseRaw("execution" as PhaseKey);
          lsSet("activePhase", "execution");
          setRightSectionRaw(null);
        } else {
          setRightSectionRaw(resolved);
        }
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // ═══ URL restore — si /discussion/{threadId} → restaurer le thread au mount ═══
  const urlRestoredRef = useRef(false);
  useEffect(() => {
    if (urlRestoredRef.current) return;
    if (initialURL.section === "discussion" && initialURL.sub) {
      urlRestoredRef.current = true;
      resumeThread(initialURL.sub);
    } else if (activeThreadId && activePhase === "discussion") {
      // Thread actif depuis localStorage mais URL perdue (hard refresh → URL cockpit)
      // Re-pousser l'URL de discussion pour que le deep-link survive
      urlRestoredRef.current = true;
      pushDiscussionURL(activeThreadId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══ Refs pour valeurs courantes (useCallback capture stale values sans refs) ═══
  // Placés AVANT setActiveBotCode/setActivePhase pour éviter TDZ
  const activeBotCodeRef = useRef(activeBotCode);
  activeBotCodeRef.current = activeBotCode;
  const activePhaseRef = useRef(activePhase);
  activePhaseRef.current = activePhase;
  const chatStageRef = useRef(chatStage);
  chatStageRef.current = chatStage;
  const workflowItemsRef = useRef<WorkflowItem[]>([]);
  // blocksRef initialisé à [] — mis à jour plus bas quand workspaceBlocks est déclaré
  const blocksRef = useRef<WorkspaceBlock[]>([]);

  // ═══ Phase state cache — restauration synchrone au switch de phase (fix workspace vide) ═══
  // Clé: `${botCode}_${phase}` → { blocks, chatStage, workflowItems }
  const phaseStateCacheRef = useRef<Record<string, { blocks: WorkspaceBlock[]; chatStage: number; workflowItems: WorkflowItem[] }>>({});

  // ═══ saveCanvasNow — fire-and-forget sauvegarde immédiate (per-thread) ═══
  const saveCanvasNow = useCallback((botCode: string, phase: string, threadId?: string | null) => {
    const blocks = blocksRef.current;
    const stage = chatStageRef.current;
    const wfItems = workflowItemsRef.current;
    if (blocks.length === 0 && stage === 0 && wfItems.length === 0) return;
    if (phase === "observation") return;
    const { canvasKey } = getStorageKeys(threadId ?? null, botCode, phase);
    api.getOrCreateCanvas(canvasKey).then(canvas => {
      api.updateCanvas(canvas.id, { workspaceBlocks: blocks, chatStage: stage, workflowItems: wfItems });
    }).catch(() => { /* silent */ });
  }, []);

  const setActiveBotCode = useCallback((code: string) => {
    const prevBot = activeBotCodeRef.current;
    const prevPhase = activePhaseRef.current;
    // Save-before-clear: sauvegarder le canvas avant de changer de bot
    if (prevPhase !== "observation") {
      saveCanvasNow(prevBot, prevPhase, activeThreadIdRef.current);
      // Cache synchrone — restauration au retour sur ce bot+phase
      const { cacheKey } = getStorageKeys(activeThreadIdRef.current, prevBot, prevPhase);
      phaseStateCacheRef.current[cacheKey] = {
        blocks: blocksRef.current,
        chatStage: chatStageRef.current,
        workflowItems: workflowItemsRef.current,
      };
    }
    setActiveBotCodeRaw(code);
    lsSet("activeBotCode", code);
    _activeBotSlug = BOT_TO_SLUG[code] || "ceo";
    // Bug fix: reset workspace state au switch de bot
    setRightSectionRaw("cockpit"); lsSet("rightSection", "cockpit");
    setActivePhaseRaw("observation"); lsSet("activePhase", "observation");
    setFocusTypeRaw("chantier"); lsSet("focusType", "chantier");
    setReflexionContextRaw(null); lsSet("reflexionContext", null);
    setActiveDeliverable(null);
    setDeliverableStage(0);
    setDraftLibraryId(null);
    setActiveDocForgeLibraryId(null);
    setChatStage(0);
    setConceptionStage(0);
    setTyped(false);
    setCredoPhase("C");
    setWorkflowItems([]);
    // Nettoyer workspace blocks au switch de bot (observation = pas de blocks)
    setWorkspaceBlocks([]);
    const { lsKey } = getStorageKeys(activeThreadIdRef.current, prevBot, prevPhase);
    try { localStorage.removeItem(lsKey); } catch { /* silent */ }
    const target = `/${BOT_TO_SLUG[code] || "ceo"}/cockpit`;
    if (window.location.pathname !== target) {
      window.history.pushState({ section: "cockpit" }, "", target);
    }
  }, [saveCanvasNow]);
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
  const [draftLibraryId, setDraftLibraryId] = useState<number | null>(null);
  // CPRJ — library auto-créée par LiveDocForgeLivrable au mount (pipeline DocForge)
  const [activeDocForgeLibraryId, setActiveDocForgeLibraryId] = useState<number | null>(null);

  // Focus type state — persisté en localStorage
  const [focusType, setFocusTypeRaw] = useState(() => lsGet("focusType", "chantier"));

  // Blueprint Atelier dans workspace (Sprint 5)
  const [activeDocumentKey, setActiveDocumentKey] = useState<string | null>(null);
  const [activeDocumentSection, setActiveDocumentSection] = useState<string | null>(null);

  // SimV3 state (legacy sim — kept for backward compat)
  const [simV3Active, setSimV3Active] = useState(false);
  const [simV3Stage, setSimV3Stage] = useState(-1);

  // Workspace capture — pendingCapture tracks which section awaits a bot response
  const [pendingCapture, setPendingCapture] = useState<string | null>(null);

  // CREDO phase state
  const [credoPhase, setCredoPhase] = useState<CredoPhaseKey>("C");

  // Workflow items state
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  workflowItemsRef.current = workflowItems;
  const addWorkflowItem = useCallback((phase: string, text: string, type: WorkflowItem["type"], credoKey?: string) => {
    setWorkflowItems((prev) => [...prev, { id: `wi-${Date.now()}`, phase, text, type, credoKey, timestamp: Date.now() }]);
  }, []);
  const removeWorkflowItem = useCallback((id: string) => {
    setWorkflowItems((prev) => prev.filter(w => w.id !== id));
  }, []);
  const clearWorkflowItems = useCallback(() => setWorkflowItems([]), []);

  // Wrappers avec localStorage pour activePhase, reflexionContext, focusType
  const setActivePhase = useCallback((p: PhaseKey) => {
    const prevPhase = activePhaseRef.current;
    const prevBot = activeBotCodeRef.current;
    // Save-before-clear: sauvegarder le canvas avant de changer de phase
    if (prevPhase !== "observation" && prevPhase !== p) {
      saveCanvasNow(prevBot, prevPhase, activeThreadIdRef.current);
      // Cache synchrone — restauration instantanée au retour (fix workspace vide)
      const { cacheKey } = getStorageKeys(activeThreadIdRef.current, prevBot, prevPhase);
      phaseStateCacheRef.current[cacheKey] = {
        blocks: blocksRef.current,
        chatStage: chatStageRef.current,
        workflowItems: workflowItemsRef.current,
      };
    }
    setActivePhaseRaw(p);
    lsSet("activePhase", p);
    // Nettoyer le deliverable actif (évite que Jumelage/DocForge reste bloqué)
    setActiveDeliverable(null);
    setActiveDocForgeLibraryId(null);
    // Restaurer depuis le cache local (instantané) ou localStorage.
    // Observation est l'état par défaut — pas un signal de "départ à zéro".
    // Un thread actif avec des blocs en localStorage = reprise de thread, pas nouveau départ.
    const { cacheKey: newCacheKey, lsKey: newLsKey } = getStorageKeys(activeThreadIdRef.current, activeBotCodeRef.current, p);
    const cached = phaseStateCacheRef.current[newCacheKey];
    if (cached) {
      setWorkspaceBlocks(cached.blocks);
      setChatStage(cached.chatStage);
      setWorkflowItems(cached.workflowItems);
    } else {
      // Pas de cache en mémoire — essayer localStorage (couvre reprise de thread depuis accueil)
      let blocksFromLS = false;
      if (activeThreadIdRef.current) {
        try {
          const stored = localStorage.getItem(newLsKey);
          if (stored) {
            const blocks = JSON.parse(stored) as WorkspaceBlock[];
            if (blocks.length > 0) {
              setWorkspaceBlocks(blocks);
              blocksFromLS = true;
            }
          }
        } catch {}
      }
      if (!blocksFromLS) {
        setWorkspaceBlocks([]);
        setChatStage(0);
      }
    }
  }, [saveCanvasNow]);
  const setReflexionContext = useCallback((c: string | null) => {
    setReflexionContextRaw(c);
    lsSet("reflexionContext", c);
  }, []);
  const setFocusType = useCallback((t: string) => {
    setFocusTypeRaw(t);
    lsSet("focusType", t);
  }, []);

  // Réunion active (survit à la navigation entre sections)
  const [activeMeeting, setActiveMeeting] = useState<{ type: string; title: string; slug?: string; playbookId?: string; family?: string; botCodes?: string[] } | null>(null);

  // Meeting controls partagés (WorkspacePhasesPanel écrit, MeetingMiniBar lit)
  const [meetingControls, setMeetingControls] = useState<MeetingControlsState | null>(null);

  // Workspace session ID — identifie une session de travail partagée (multi-communication)
  const [workspaceSessionId, setWorkspaceSessionId] = useState<string | null>(null);
  const startWorkspaceSession = useCallback(() => {
    const id = `ws-${activeBotCode}-${Date.now()}`;
    setWorkspaceSessionId(id);
    return id;
  }, [activeBotCode]);

  // ═══ Workspace Blocks dynamiques (discussion) — scoped per-thread ═══
  const [workspaceBlocks, setWorkspaceBlocks] = useState<WorkspaceBlock[]>(() => {
    // Pas de thread en phase scoped = pas de blocks à restaurer
    if (!activeThreadId && THREAD_SCOPED_PHASES.includes(activePhase)) return [];
    // Protection anti-melange: si l'URL n'est PAS une discussion thread URL,
    // ne pas charger les blocs d'un ancien thread depuis localStorage.
    // Evite que les blocs de la discussion precedente restent colles apres hard refresh.
    if (activeThreadId && THREAD_SCOPED_PHASES.includes(activePhase)) {
      const urlInfo = parseURL();
      if (urlInfo.section !== "discussion" || urlInfo.sub !== activeThreadId) {
        // L'URL ne pointe pas vers ce thread → pas de restauration des blocs
        return [];
      }
    }
    const { lsKey } = getStorageKeys(activeThreadId, activeBotCode, activePhase);
    try {
      const stored = localStorage.getItem(lsKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Sync blocksRef avec workspaceBlocks (ref déclarée plus haut pour saveCanvasNow)
  blocksRef.current = workspaceBlocks;

  // Persist workspace blocks — clé per-thread
  useEffect(() => {
    // Ne pas persister vers clé globale quand pas de thread en phase scoped
    if (!activeThreadId && THREAD_SCOPED_PHASES.includes(activePhase)) return;
    const { lsKey } = getStorageKeys(activeThreadId, activeBotCode, activePhase);
    try {
      if (workspaceBlocks.length === 0) {
        localStorage.removeItem(lsKey);
      } else {
        localStorage.setItem(lsKey, JSON.stringify(workspaceBlocks));
      }
    } catch { /* silent */ }
  }, [workspaceBlocks, activeThreadId, activeBotCode, activePhase]);

  // ═══ getCristallise/getCristalliseItem — vues dérivées de workspaceBlocks ═══
  const getCristallise = useCallback((sectionId: string): string | null => {
    const block = workspaceBlocks.find(b => b.sectionId === sectionId);
    return block ? block.summary : null;
  }, [workspaceBlocks]);

  const getCristalliseItem = useCallback((sectionId: string): SimV3CristalliseItem | null => {
    const block = workspaceBlocks.find(b => b.sectionId === sectionId);
    if (!block) return null;
    return {
      id: block.id,
      text: block.summary,
      source: block.source,
      sectionId,
      sourceType: block.sourceType,
      contentTypes: block.structured_data?.content_types,
    };
  }, [workspaceBlocks]);

  const editCristallise = useCallback((sectionId: string, newText: string) => {
    setWorkspaceBlocks(prev =>
      prev.map(b => b.sectionId === sectionId ? { ...b, summary: newText } : b)
    );
  }, []);

  // ═══ Canvas auto-save — persister workspaceBlocks en DB (debounce 2s) — per-thread ═══
  // Hybrid: localStorage (instant, above) + canvas API + workspace_blocks PostgreSQL table
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (workspaceBlocks.length === 0) return;
    if (activePhase === "observation") return;
    // Ne pas sauvegarder vers canvas global quand pas de thread actif en phase scoped
    if (!activeThreadId && THREAD_SCOPED_PHASES.includes(activePhase)) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const { canvasKey } = getStorageKeys(activeThreadId, activeBotCode, activePhase);
      // Path 1: Canvas API (legacy — workspace data blob)
      api.getOrCreateCanvas(canvasKey).then(canvas => {
        api.updateCanvas(canvas.id, { workspaceBlocks, chatStage, workflowItems });
      }).catch(() => { /* silent */ });
      // Path 2: workspace_blocks PostgreSQL table (S117 — structured per-block persistence)
      if (activeThreadId) {
        const blocksPayload = workspaceBlocks.map((b, i) => ({
          type: b.type,
          title: b.title || "Bloc sans titre",
          summary: b.summary,
          structured_data: b.structured_data || {},
          credo_step: b.credo_step,
          credo_sub_section: b.credo_sub_section,
          maturity: b.maturity || "draft",
          source_bot: b.source,
          source_bot_name: b.sourceName,
          confidence: b.confidence,
          position: i,
        }));
        api.saveWorkspaceBlocks({ discussion_id: activeThreadId, blocks: blocksPayload }).catch(() => { /* silent */ });
      }
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [workspaceBlocks, chatStage, activeBotCode, activePhase, workflowItems, activeThreadId]);

  // ═══ Canvas auto-load — fallback si le cache local est vide (ex: refresh page) — per-thread ═══
  const prevLoadPhaseRef = useRef(activePhase);
  const prevThreadRef = useRef(activeThreadId);
  useEffect(() => {
    if (activePhase === prevLoadPhaseRef.current && activeThreadId === prevThreadRef.current) return;
    // Capturer AVANT de mettre à jour les refs — détecter la transition observation→discussion
    const wasObservation = prevLoadPhaseRef.current === "observation";
    prevLoadPhaseRef.current = activePhase;
    prevThreadRef.current = activeThreadId;
    if (activePhase === "observation") return;
    // Thread-scoped phases sans threadId = nouvelle discussion vide → PAS de load
    // (sinon getStorageKeys fallback vers canvas global qui contient d'anciens blocs)
    if (!activeThreadId && THREAD_SCOPED_PHASES.includes(activePhase)) return;
    // Observation est l'état par défaut — wasObservation→discussion peut être :
    // 1. Nouveau départ sans thread → skip (pas de blocs à restaurer)
    // 2. Reprise de thread existant → charger depuis PostgreSQL (async fallback)
    if (wasObservation && activePhase === "discussion") {
      if (!activeThreadId) return; // Vraiment nouveau → skip
      // Reprise : localStorage déjà tenté dans setActivePhase — fallback PostgreSQL async
      api.loadWorkspaceBlocks(activeThreadId).then(res => {
        if (res?.blocks?.length > 0) {
          const restored: WorkspaceBlock[] = res.blocks.map((b: any) => ({
            id: b.id?.toString() || `wb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: b.type || "libre",
            title: b.title || "Bloc",
            summary: b.summary || "",
            structured_data: b.structured_data || {},
            credo_step: b.credo_step,
            credo_sub_section: b.credo_sub_section,
            maturity: b.maturity || "draft",
            source: b.source_bot,
            sourceName: b.source_bot_name,
            confidence: b.confidence || 0,
            timestamp: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
          }));
          setWorkspaceBlocks(prev => prev.length > 0 ? prev : restored);
        }
      }).catch(() => {});
      return;
    }
    // Si le cache local a déjà restauré les blocks, pas besoin de l'API
    const { cacheKey, canvasKey } = getStorageKeys(activeThreadId, activeBotCode, activePhase);
    if (phaseStateCacheRef.current[cacheKey]?.blocks?.length) return;
    api.getOrCreateCanvas(canvasKey).then(canvas => {
      const data = canvas.data as any;
      if (data?.workspaceBlocks && Array.isArray(data.workspaceBlocks) && data.workspaceBlocks.length > 0) {
        // Ne pas écraser si des blocks ont été ajoutés entre-temps
        setWorkspaceBlocks(prev => prev.length > 0 ? prev : data.workspaceBlocks);
      }
      if (typeof data?.chatStage === "number") {
        setChatStage(prev => prev > 0 ? prev : data.chatStage);
      }
    }).catch(() => { /* silent */ });
  }, [activePhase, activeBotCode, activeThreadId]);

  // ═══ Thread switch — sauvegarder l'ancien thread, charger le nouveau ═══
  const prevActiveThreadIdRef = useRef(activeThreadId);
  useEffect(() => {
    const prevThreadId = prevActiveThreadIdRef.current;
    if (activeThreadId === prevThreadId) return;

    // 1. Flush save old thread's blocks
    if (prevThreadId && activePhase !== "observation") {
      saveCanvasNow(activeBotCode, activePhase, prevThreadId);
      const { cacheKey: oldCacheKey } = getStorageKeys(prevThreadId, activeBotCode, activePhase);
      phaseStateCacheRef.current[oldCacheKey] = {
        blocks: blocksRef.current,
        chatStage: chatStageRef.current,
        workflowItems: workflowItemsRef.current,
      };
    }

    prevActiveThreadIdRef.current = activeThreadId;

    // 2. TOUJOURS clear les blocks d'abord — evite que les anciens restent collés
    setWorkspaceBlocks([]);
    setChatStage(0);
    setCredoPhase("C");
    setWorkflowItems([]);

    // 3. Si pas de thread (nouvelle discussion) → fini, on a déjà clear
    if (!activeThreadId) {
      return;
    }

    // Si on est en phase observation, pas de blocks à charger — le switch vers
    // "discussion" (via useWorkspaceCapture auto-transition) déclenchera le load
    if (activePhase === "observation") {
      // Push URL quand même pour deep-link
      pushDiscussionURL(activeThreadId);
      return;
    }

    // 4. Restaurer les blocks du NOUVEAU thread (cache > localStorage > API)
    const { lsKey, cacheKey, canvasKey } = getStorageKeys(activeThreadId, activeBotCode, activePhase);
    const cached = phaseStateCacheRef.current[cacheKey];
    if (cached?.blocks?.length) {
      setWorkspaceBlocks(cached.blocks);
      setChatStage(cached.chatStage);
      setWorkflowItems(cached.workflowItems);
      // Push discussion URL
      if (THREAD_SCOPED_PHASES.includes(activePhase)) pushDiscussionURL(activeThreadId);
      return;
    }
    // Try localStorage
    try {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        const blocks = JSON.parse(stored);
        if (blocks.length > 0) {
          setWorkspaceBlocks(blocks);
          if (THREAD_SCOPED_PHASES.includes(activePhase)) pushDiscussionURL(activeThreadId);
          return;
        }
      }
    } catch {}

    // Fallback 1: workspace_blocks PostgreSQL table (S117 — structured, per-thread)
    api.loadWorkspaceBlocks(activeThreadId).then(res => {
      if (res?.blocks?.length > 0) {
        const restored: WorkspaceBlock[] = res.blocks.map((b: any) => ({
          id: b.id?.toString() || `wb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: b.type || "libre",
          title: b.title || "Bloc",
          summary: b.summary || "",
          structured_data: b.structured_data || {},
          credo_step: b.credo_step,
          credo_sub_section: b.credo_sub_section,
          maturity: b.maturity || "draft",
          source: b.source_bot,
          sourceName: b.source_bot_name,
          confidence: b.confidence || 0,
          timestamp: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
        }));
        setWorkspaceBlocks(prev => prev.length > 0 ? prev : restored);
        return; // PostgreSQL had data — skip canvas fallback
      }
      // Fallback 2: canvas API (legacy blob — ne PAS écraser si des blocks ont été ajoutés entre-temps)
      api.getOrCreateCanvas(canvasKey).then(canvas => {
        const data = canvas.data as any;
        if (data?.workspaceBlocks?.length > 0) {
          setWorkspaceBlocks(prev => prev.length > 0 ? prev : data.workspaceBlocks);
        }
        if (typeof data?.chatStage === "number") {
          setChatStage(prev => prev > 0 ? prev : data.chatStage);
        }
      }).catch(() => { /* silent */ });
    }).catch(() => {
      // PostgreSQL load failed — fall back to canvas API
      api.getOrCreateCanvas(canvasKey).then(canvas => {
        const data = canvas.data as any;
        if (data?.workspaceBlocks?.length > 0) {
          setWorkspaceBlocks(prev => prev.length > 0 ? prev : data.workspaceBlocks);
        }
        if (typeof data?.chatStage === "number") {
          setChatStage(prev => prev > 0 ? prev : data.chatStage);
        }
      }).catch(() => { /* silent */ });
    });

    // Push discussion URL when thread changes in a scoped phase
    if (THREAD_SCOPED_PHASES.includes(activePhase)) {
      pushDiscussionURL(activeThreadId);
    }
  }, [activeThreadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addWorkspaceBlock = useCallback((block: WorkspaceBlock) => {
    // Thread guard: rejeter les blocs d'une discussion précédente
    // (race condition: async captures arrivent après setWorkspaceBlocks([]))
    if (block.discussionId && activeThreadIdRef.current && block.discussionId !== activeThreadIdRef.current) {
      console.log(`[WorkspaceBlock] SKIP stale block from thread ${block.discussionId} (current: ${activeThreadIdRef.current}): ${block.title}`);
      return;
    }
    setWorkspaceBlocks((prev) => {
      const now = block.timestamp || Date.now();
      const timeLabel = new Date(now).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });

      // C.50 — ENRICH: le LLM a décidé d'enrichir un bloc existant
      if (block.operation === "ENRICH" && block.target_block_id) {
        const idx = prev.findIndex(b => b.id === block.target_block_id);
        if (idx >= 0) {
          const existing = prev[idx];
          const label = block.merge_label || "Enrichissement";
          const separator = `\n\n---\n\n#### ${label} — ${timeLabel}\n\n`;
          const mergedSummary = (existing.summary || "") + separator + (block.summary || "");
          const newTitle = (block.title || "").length > (existing.title || "").length ? block.title : existing.title;
          const copy = [...prev];
          copy[idx] = {
            ...existing,
            summary: mergedSummary,
            title: newTitle,
            timestamp: now,
            confidence: Math.max(existing.confidence || 0, block.confidence || 0),
            structured_data: block.structured_data || existing.structured_data,
          };
          console.log(`[WorkspaceBlock] ENRICH block ${block.target_block_id}: ${block.title}`);
          return copy;
        }
        // target block not found — fall through to CREATE
      }

      // C.50 — MERGE: le LLM a décidé de fusionner deux blocs existants
      if (block.operation === "MERGE" && block.target_block_id && block.merge_secondary_id) {
        const primaryIdx = prev.findIndex(b => b.id === block.target_block_id);
        if (primaryIdx >= 0) {
          const primary = prev[primaryIdx];
          const secondary = prev.find(b => b.id === block.merge_secondary_id);
          const fusionLabel = `\n\n---\n\n#### Fusion — ${timeLabel}\n\n`;
          const parts = [primary.summary, secondary?.summary, block.summary].filter(Boolean);
          const mergedSummary = parts.join(fusionLabel);
          const copy = prev
            .filter(b => b.id !== block.merge_secondary_id) // retirer le bloc secondaire
            .map(b => {
              if (b.id === block.target_block_id) {
                return {
                  ...b,
                  summary: mergedSummary,
                  title: block.title || b.title,
                  timestamp: now,
                  confidence: Math.max(b.confidence || 0, block.confidence || 0),
                  structured_data: block.structured_data || b.structured_data,
                };
              }
              return b;
            });
          console.log(`[WorkspaceBlock] MERGE ${block.target_block_id} + ${block.merge_secondary_id}`);
          return copy;
        }
        // primary block not found — fall through to CREATE
      }

      // If replace_block_id, update the existing block (full replacement)
      if (block.replace_block_id) {
        const idx = prev.findIndex(b => b.id === block.replace_block_id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...block, id: block.replace_block_id };
          return copy;
        }
      }
      // Dedup guard: skip if same source + same type + similar title within 60s
      // D-UX-03: fenêtre 60s (vs 5s avant) + fuzzy title (50 premiers chars, case-insensitive)
      // Évite que useWorkspaceCapture ET le SSE workspace_block event n'ajoutent 2 blocs identiques
      const titlePrefix = (t: string) => (t || "").toLowerCase().trim().slice(0, 50);
      const duplicate = prev.find(b =>
        b.source === block.source &&
        b.type === block.type &&
        titlePrefix(b.title) === titlePrefix(block.title) &&
        Math.abs((b.timestamp || 0) - now) < 60000
      );
      if (duplicate) {
        console.log(`[WorkspaceBlock] SKIP duplicate: ${block.title} (source=${block.source})`);
        return prev;
      }

      // ═══ MERGE LOGIC: 1 box max par bot + étape CREDO (log structuré) ═══
      // Les modes reflexion gardent leurs propres blocs (flow brainstorm/analyse).
      // Tout le reste (discussion + experts) du même bot au même step CREDO → MERGE dans le bloc existant.
      // Chaque entrée est un log entry avec label + timestamp.
      const isReflexionMode = block.credo_sub_section === "modes-reflexion";
      if (!isReflexionMode && block.source && block.credo_step) {
        const existing = prev.find(b =>
          b.source === block.source &&
          b.credo_step === block.credo_step &&
          b.type === block.type &&
          b.credo_sub_section !== "modes-reflexion"
        );
        if (existing) {
          // Merge: append new summary as a structured log entry (action label + timestamp)
          const timeLabel = new Date(now).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
          const label = block.merge_label || "Mise a jour";
          const separator = `\n\n---\n\n#### ${label} — ${timeLabel}\n\n`;
          const mergedSummary = (existing.summary || "") + separator + (block.summary || "");
          // Update title if new one is more specific
          const newTitle = (block.title || "").length > (existing.title || "").length ? (block.title || existing.title) : existing.title;
          const copy = [...prev];
          const idx = prev.indexOf(existing);
          copy[idx] = {
            ...existing,
            summary: mergedSummary,
            title: newTitle,
            timestamp: now, // Update timestamp to latest
            confidence: Math.max(existing.confidence || 0, block.confidence || 0),
            // Keep structured_data from the latest block if present
            structured_data: block.structured_data || existing.structured_data,
          };
          return copy;
        }
      }

      return [...prev, block];
    });
  }, []);

  const updateWorkspaceBlock = useCallback((id: string, updates: Partial<WorkspaceBlock>) => {
    setWorkspaceBlocks((prev) => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const removeWorkspaceBlock = useCallback((id: string) => {
    setWorkspaceBlocks((prev) => prev.filter(b => b.id !== id));
  }, []);

  const getBlocksByCredoStep = useCallback((step: string): WorkspaceBlock[] => {
    return workspaceBlocks.filter(b => b.credo_step === step);
  }, [workspaceBlocks]);

  const getBlocksByType = useCallback((type: WorkspaceBlockType): WorkspaceBlock[] => {
    return workspaceBlocks.filter(b => b.type === type);
  }, [workspaceBlocks]);

  // ═══ Workspace Tasks (taches assignables aux bots/humains) ═══
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>(() => {
    try {
      const stored = localStorage.getItem("workspaceTasks");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      if (workspaceTasks.length === 0) {
        localStorage.removeItem("workspaceTasks");
      } else {
        localStorage.setItem("workspaceTasks", JSON.stringify(workspaceTasks));
      }
    } catch { /* silent */ }
  }, [workspaceTasks]);

  const addWorkspaceTask = useCallback((task: WorkspaceTask) => {
    setWorkspaceTasks(prev => [...prev, task]);
  }, []);

  const updateWorkspaceTask = useCallback((id: string, updates: Partial<WorkspaceTask>) => {
    setWorkspaceTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const removeWorkspaceTask = useCallback((id: string) => {
    setWorkspaceTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ═══ Auto-contribute — POST nouveaux blocs vers workspace_contributions (4 canaux) ═══
  const prevBlockCountRef = useRef(0);
  useEffect(() => {
    if (workspaceBlocks.length <= prevBlockCountRef.current) {
      prevBlockCountRef.current = workspaceBlocks.length;
      return;
    }
    const newBlocks = workspaceBlocks.slice(prevBlockCountRef.current);
    prevBlockCountRef.current = workspaceBlocks.length;
    const API_BASE = import.meta.env.VITE_API_URL || "";
    const API_KEY = import.meta.env.VITE_API_KEY || "";
    for (const block of newBlocks) {
      fetch(`${API_BASE}/api/v1/workspace/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
        body: JSON.stringify({
          session_id: workspaceSessionId || `ws-${activeBotCode}-default`,
          phase: activePhase,
          section_id: block.sectionId || block.credo_step || "unknown",
          content: block.summary,
          source_type: block.sourceType || "chat",
          author_code: block.source || activeBotCode,
        }),
      }).catch(() => { /* silent */ });
    }
  }, [workspaceBlocks]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetChat = useCallback(() => {
    setActivePhaseRaw("observation");
    lsSet("activePhase", "observation");
    setChatStage(0);
    setTyped(false);
    setReflexionContextRaw(null);
    lsSet("reflexionContext", null);
    setConceptionStage(0);
    setActiveDeliverable(null);
    setDeliverableStage(0);
    setFocusTypeRaw("chantier");
    lsSet("focusType", "chantier");
    setCredoPhase("C");
    setWorkflowItems([]);
    // Clear workspace blocks + cache — nouvelle discussion = tout vide
    setWorkspaceBlocks([]);
    phaseStateCacheRef.current = {};
    // Nettoyer localStorage pour le thread courant
    if (activeThreadIdRef.current) {
      const { lsKey } = getStorageKeys(activeThreadIdRef.current, activeBotCodeRef.current, activePhaseRef.current);
      try { localStorage.removeItem(lsKey); } catch {}
    }
    try { localStorage.removeItem("workspaceBlocks"); } catch { /* silent — legacy cleanup */ }
  }, []);

  // Sprint 2A Phase 4: reflexion fusionnée dans discussion
  const startReflexion = useCallback((chantier: string) => {
    setReflexionContext(chantier);
    setActivePhase("discussion");
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

  const startDeliverable = useCallback((deliverable: string, draftId?: number) => {
    setActivePhase("creation");
    setRightSection(null);
    setActiveDeliverable(deliverable);
    setDeliverableStage(0);
    setTyped(false);
    setDraftLibraryId(draftId ?? null);
  }, []);

  return (
    <AmorcerCtx.Provider
      value={{
        activePhase, setActivePhase,
        chatStage, setChatStage,
        typed, setTyped,
        reflexionContext, setReflexionContext,
        reflexionSetup, setReflexionSetup,
        reflexionFlow, setReflexionFlow,
        rightSection, setRightSection,
        activeBotCode, setActiveBotCode,
        cockpitTab, setCockpitTab,
        o9Section, setO9Section,
        conceptionStage, setConceptionStage,
        advanceConception, startConception,
        activeDeliverable, setActiveDeliverable,
        deliverableStage, setDeliverableStage,
        advanceDeliverable, startDeliverable, draftLibraryId,
        activeDocForgeLibraryId, setActiveDocForgeLibraryId,
        focusType, setFocusType,
        credoPhase, setCredoPhase,
        workflowItems, addWorkflowItem, removeWorkflowItem, clearWorkflowItems,
        simV3Active, setSimV3Active,
        simV3Stage, setSimV3Stage,
        pendingCapture, setPendingCapture, getCristallise, getCristalliseItem, editCristallise,
        workspaceSessionId, startWorkspaceSession,
        activeDocumentKey, setActiveDocumentKey,
        activeDocumentSection, setActiveDocumentSection,
        activeMeeting, setActiveMeeting,
        meetingControls, setMeetingControls,
        workspaceBlocks, addWorkspaceBlock, updateWorkspaceBlock, removeWorkspaceBlock, getBlocksByCredoStep, getBlocksByType,
        activeDiscussionId: activeThreadId,
        workspaceTasks, addWorkspaceTask, updateWorkspaceTask, removeWorkspaceTask,
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

/** Safe version — returns null if outside AmorcerProvider (for V2 components shared with V3) */
export function useAmorcerSafe(): AmorcerState | null {
  return useContext(AmorcerCtx);
}

/** Exported for DemoContext stage override in SimulationGallery */
export { AmorcerCtx };
