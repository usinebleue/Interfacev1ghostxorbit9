/**
 * AmorcerContext.tsx — État partagé entre les 3 zones V3
 * Architecture V3 — Zéro Destruction
 *
 * Gère: activePhase, rightSection, activeBotCode, cockpitTab,
 *        chatStage, reflexionContext, o9Section
 * Consommé par: DiscussionWindow, WorkspacePhasesPanel, ControlTowerPanel
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { PhaseKey, CredoPhaseKey, WorkflowItem, WorkspaceBlock, WorkspaceBlockType } from "./core/types";
import type { MeetingStatus, ParticipantInfo } from "./hooks/useLiveKitMeeting";
import { api } from "../v2/api/client";

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

  // Helpers
  startReflexion: (chantier: string) => void;
  advance: () => void;
  resetChat: () => void;
}

const AmorcerCtx = createContext<AmorcerState | null>(null);

export function AmorcerProvider({ children }: { children: ReactNode }) {
  const [activePhase, setActivePhaseRaw] = useState<PhaseKey>(() => {
    const stored = lsGet<string>("activePhase", "observation");
    // Never restore execution/retroaction — always entered via explicit workflow transition
    if (stored === "execution" || stored === "retroaction") {
      lsSet("activePhase", "observation"); // Also clear localStorage
      return "observation" as PhaseKey;
    }
    return stored as PhaseKey;
  });
  const [chatStage, setChatStage] = useState(0);
  const [typed, setTyped] = useState(false);
  const [reflexionContext, setReflexionContextRaw] = useState<string | null>(() => lsGet("reflexionContext", null));
  // Parse URL une seule fois au mount
  const [initialURL] = useState(() => parseURL());

  const [rightSection, setRightSectionRaw] = useState<string | null>(() => {
    if (initialURL.section === "orbit9") return null;
    const restoredPhase = lsGet<string>("activePhase", "observation");
    const restoredContext = lsGet<string | null>("reflexionContext", null);
    // Phase focus avec contexte → null (workspace affiche la vue phase)
    if (restoredContext && ["discussion", "reflexion", "creation", "retroaction"].includes(restoredPhase)) {
      return null;
    }
    const stored = initialURL.section || lsGet("rightSection", "cockpit");
    // Never restore "execution" — always set at transition points (handleWorkAction, progress bar, onPhaseComplete)
    if (stored === "execution") {
      lsSet("rightSection", "cockpit"); // Also clear localStorage
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
      if (section === "orbit9") {
        setCockpitTabRaw("orbit9");
        setRightSectionRaw(null);
        setO9SectionRaw(sub || "dashboard");
      } else {
        setCockpitTabRaw("bureau");
        const resolved = section || lsGet("rightSection", "cockpit");
        setRightSectionRaw(resolved === "execution" ? "cockpit" : resolved);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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

  // ═══ saveCanvasNow — fire-and-forget sauvegarde immédiate ═══
  const saveCanvasNow = useCallback((botCode: string, phase: string) => {
    const blocks = blocksRef.current;
    const stage = chatStageRef.current;
    const wfItems = workflowItemsRef.current;
    if (blocks.length === 0 && stage === 0 && wfItems.length === 0) return;
    if (phase === "observation") return;
    const canvasKey = `workspace_phase_${botCode}_${phase}`;
    api.getOrCreateCanvas(canvasKey).then(canvas => {
      api.updateCanvas(canvas.id, { workspaceBlocks: blocks, chatStage: stage, workflowItems: wfItems });
    }).catch(() => { /* silent */ });
  }, []);

  const setActiveBotCode = useCallback((code: string) => {
    const prevBot = activeBotCodeRef.current;
    const prevPhase = activePhaseRef.current;
    // Save-before-clear: sauvegarder le canvas avant de changer de bot
    if (prevPhase !== "observation") {
      saveCanvasNow(prevBot, prevPhase);
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
    setChatStage(0);
    setConceptionStage(0);
    setTyped(false);
    setCredoPhase("C");
    setWorkflowItems([]);
    // Nettoyer workspace blocks au switch de bot
    setWorkspaceBlocks([]);
    try { localStorage.removeItem("workspaceBlocks"); } catch { /* silent */ }
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
      saveCanvasNow(prevBot, prevPhase);
    }
    setActivePhaseRaw(p);
    lsSet("activePhase", p);
    // Reset chatStage à chaque changement de phase — chaque phase repart de l'étape 0
    setChatStage(0);
    // Nettoyer les workspace blocks — chaque phase repart vide
    setWorkspaceBlocks([]);
    try { localStorage.removeItem("workspaceBlocks"); } catch { /* silent */ }
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

  // ═══ Workspace Blocks dynamiques (discussion) ═══
  const [workspaceBlocks, setWorkspaceBlocks] = useState<WorkspaceBlock[]>(() => {
    try {
      const stored = localStorage.getItem("workspaceBlocks");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Sync blocksRef avec workspaceBlocks (ref déclarée plus haut pour saveCanvasNow)
  blocksRef.current = workspaceBlocks;

  // Persist workspace blocks
  useEffect(() => {
    try {
      if (workspaceBlocks.length === 0) {
        localStorage.removeItem("workspaceBlocks");
      } else {
        localStorage.setItem("workspaceBlocks", JSON.stringify(workspaceBlocks));
      }
    } catch { /* silent */ }
  }, [workspaceBlocks]);

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

  // ═══ Canvas auto-save — persister workspaceBlocks en DB (debounce 2s) ═══
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (workspaceBlocks.length === 0) return;
    if (activePhase === "observation") return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const canvasKey = `workspace_phase_${activeBotCode}_${activePhase}`;
      api.getOrCreateCanvas(canvasKey).then(canvas => {
        api.updateCanvas(canvas.id, { workspaceBlocks, chatStage, workflowItems });
      }).catch(() => { /* silent */ });
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [workspaceBlocks, chatStage, activeBotCode, activePhase, workflowItems]);

  // ═══ Canvas auto-load — restaurer workspaceBlocks quand on entre dans une phase ═══
  const prevLoadPhaseRef = useRef(activePhase);
  useEffect(() => {
    if (activePhase === prevLoadPhaseRef.current) return;
    prevLoadPhaseRef.current = activePhase;
    if (activePhase === "observation") return;
    const canvasKey = `workspace_phase_${activeBotCode}_${activePhase}`;
    api.getOrCreateCanvas(canvasKey).then(canvas => {
      const data = canvas.data as any;
      if (data?.workspaceBlocks && Array.isArray(data.workspaceBlocks) && data.workspaceBlocks.length > 0) {
        setWorkspaceBlocks(data.workspaceBlocks);
      }
      if (typeof data?.chatStage === "number") setChatStage(data.chatStage);
    }).catch(() => { /* silent */ });
  }, [activePhase, activeBotCode]);

  const addWorkspaceBlock = useCallback((block: WorkspaceBlock) => {
    setWorkspaceBlocks((prev) => {
      // If replace_block_id, update the existing block
      if (block.replace_block_id) {
        const idx = prev.findIndex(b => b.id === block.replace_block_id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...block, id: block.replace_block_id };
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
    setActivePhase("observation");
    setChatStage(0);
    setTyped(false);
    setReflexionContext(null);
    setConceptionStage(0);
    setActiveDeliverable(null);
    setDeliverableStage(0);
    setFocusType("chantier");
    setCredoPhase("C");
    setWorkflowItems([]);
    // Clear workspace blocks — nouvelle discussion = workspace vide
    setWorkspaceBlocks([]);
    try { localStorage.removeItem("workspaceBlocks"); } catch { /* silent */ }
  }, [setActivePhase, setReflexionContext, setFocusType]);

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
        rightSection, setRightSection,
        activeBotCode, setActiveBotCode,
        cockpitTab, setCockpitTab,
        o9Section, setO9Section,
        conceptionStage, setConceptionStage,
        advanceConception, startConception,
        activeDeliverable, setActiveDeliverable,
        deliverableStage, setDeliverableStage,
        advanceDeliverable, startDeliverable, draftLibraryId,
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
