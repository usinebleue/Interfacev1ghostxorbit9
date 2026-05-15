/**
 * hooks.ts — React hooks pour l'API GhostX
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { api } from "./client";
import type { StreamDoneEvent } from "./client";
import type {
  BotInfo,
  HealthResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ClientSummary,
  Thread,
  ThreadStatus,
  ReflectionMode,
  MessageType,
  Crystal,
  MultiChatRequest,
  PerspectiveItem,
  CanvasAction,
  TeamProposal,
  BureauItem,
  BureauItemCreate,
  BureauItemUpdate,
  PlaneTache,
  PlaneTacheDetail,
  PlaneTacheCreate,
  Discussion,
  DiscussionTypeId,
} from "./types";
import { classifyThread } from "./types";

// ── Sprint 3 — OpenClaw gateway routing ──
// Phase 1: non-CEO bots use OpenClaw. Phase 2: CEO after CREDO validation.
const OPENCLAW_ENABLED_BOTS = new Set(["BCT", "BCF", "BCM", "BCS", "BOO", "CPOB", "CHROB", "CROB", "CISOB", "CLOB", "CINOB"]);
const OPENCLAW_FORCE_ALL = import.meta.env.VITE_OPENCLAW_ALL === "true";
const OPENCLAW_DISABLED = import.meta.env.VITE_OPENCLAW_DISABLED === "true";

function shouldUseOpenClaw(botCode?: string): boolean {
  if (OPENCLAW_DISABLED) return false;
  if (OPENCLAW_FORCE_ALL) return true;
  return OPENCLAW_ENABLED_BOTS.has(botCode || "");
}

// Options contextuelles par defaut — arbre de developpement de la pensee (wireframe p.3)
// Options hardcodées RETIRÉES — le backend drive les suggestions via msg.options
// Si le backend n'envoie pas d'options, on n'affiche RIEN (pas de random générique)

// ── Mode de reflexion live — config par mode ──

interface ModeConfig {
  options: string[];
  coachingIntro: string;
  coachingConverge: string;
  synthesisPrompt: string;
  autoConsultBots: string[];   // bots auto-consultes dans ce mode
  maxExchanges: number;        // avant nudge convergence
}

const MODE_LIVE_CONFIG: Record<string, ModeConfig> = {
  credo: {
    options: ["Approfondir cette idee", "Voir les implications", "Prochaines etapes?", "Challenger"],
    coachingIntro: "",
    coachingConverge: "On a bien explore. Pret pour la synthese?",
    synthesisPrompt: "Synthetise: (1) Tension identifiee, (2) Recherche faite, (3) Options exposees, (4) Meilleure option demontree, (5) Prochaines etapes concretes.",
    autoConsultBots: [],
    maxExchanges: 15,
  },
  debat: {
    options: ["Argument pour", "Argument contre", "Trouver un compromis", "Verdict final"],
    coachingIntro: "",
    coachingConverge: "Les arguments sont clairs des 2 cotes. On passe au verdict?",
    synthesisPrompt: "Synthetise le debat: Position A (arguments + forces), Position B (arguments + forces), Verdict (quelle position est la plus solide et pourquoi), Decision recommandee.",
    autoConsultBots: ["CFOB", "CSOB"],
    maxExchanges: 16,
  },
  brainstorm: {
    options: ["Plus d'idees!", "Combiner 2 idees", "Idee folle", "Assez — on trie"],
    coachingIntro: "",
    coachingConverge: "On a assez d'idees. On passe au tri?",
    synthesisPrompt: "Classe les idees par potentiel (fort/moyen/faible). Top 3 idees avec justification. Prochaine etape pour chaque top idee.",
    autoConsultBots: ["CMOB", "CTOB"],
    maxExchanges: 12,
  },
  crise: {
    options: ["Impact immediat?", "Qui est affecte?", "Plan B", "Action dans les 30 min"],
    coachingIntro: "",
    coachingConverge: "Situation evaluee. On passe au plan d'action immediat?",
    synthesisPrompt: "Plan de crise: (1) Severite 1-10, (2) Actions immediates (30 min), (3) Communication a faire, (4) Responsable de chaque action, (5) Suivi dans 24h.",
    autoConsultBots: ["COOB"],
    maxExchanges: 10,
  },
  analyse: {
    options: ["Cause racine?", "Données manquantes", "Comparer avec un benchmark", "Conclusions?"],
    coachingIntro: "",
    coachingConverge: "L'analyse est solide. On formule les conclusions?",
    synthesisPrompt: "Analyse structurée: (1) Problème décomposé, (2) Causes racines identifiées, (3) Données clés, (4) Conclusions, (5) Recommandations actionnables.",
    autoConsultBots: ["CTOB", "CFOB"],
    maxExchanges: 14,
  },
  decision: {
    options: ["Quels critères?", "Risques de chaque option", "Comparer Go vs No-Go", "Ma décision"],
    coachingIntro: "",
    coachingConverge: "Les options sont évaluées. Prêt à trancher?",
    synthesisPrompt: "Matrice de décision: Options évaluées (critères, risques, potentiel). Recommandation avec niveau de confiance. Conditions de succès du Go. Plan B si No-Go.",
    autoConsultBots: ["CFOB", "CSOB"],
    maxExchanges: 12,
  },
  strategie: {
    options: ["Forces et faiblesses", "Opportunités du marché", "Menaces à anticiper", "Plan d'exécution"],
    coachingIntro: "",
    coachingConverge: "La stratégie se dessine. On formalise le plan?",
    synthesisPrompt: "Plan stratégique: (1) Forces et faiblesses, (2) 3 axes prioritaires, (3) Quick wins (30 jours), (4) Moyen terme (90 jours), (5) Indicateurs de succès.",
    autoConsultBots: ["CSOB", "CFOB"],
    maxExchanges: 14,
  },
  innovation: {
    options: ["Technique disruptive?", "Qui fait ça ailleurs?", "Prototype minimal", "Potentiel marché"],
    coachingIntro: "",
    coachingConverge: "On a identifié des pistes. On sélectionne la plus prometteuse?",
    synthesisPrompt: "Innovation brief: (1) Opportunité identifiée, (2) Solution proposée, (3) Différenciateur clé, (4) Premier prototype (description), (5) Marché potentiel, (6) Prochaine étape concrète.",
    autoConsultBots: ["CTOB", "CMOB"],
    maxExchanges: 14,
  },
  deep: {
    options: ["Creuse plus profond", "Lien inattendu?", "Analogie avec un autre domaine", "Insight a retenir"],
    coachingIntro: "",
    coachingConverge: "Des insights profonds emergent. On cristallise?",
    synthesisPrompt: "Insights: (1) Ce qui n'etait pas evident, (2) Connexions inattendues, (3) Question que personne ne posait, (4) Recommandation contre-intuitive, (5) Ce que ca change pour la suite.",
    autoConsultBots: ["CSOB"],
    maxExchanges: 12,
  },
};

// --- useBots ---

export function useBots() {
  const [bots, setBots] = useState<BotInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listBots()
      .then((res) => {
        setBots(res.bots);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { bots, loading, error };
}

// --- useHealth ---

export function useHealth(intervalMs = 30000) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = () => {
      api
        .health()
        .then(setHealth)
        .catch((err) => setError(err.message));
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { health, error };
}

// --- localStorage helpers for threads ---

const THREADS_KEY = "ghostx-threads";
const ACTIVE_THREAD_KEY = "ghostx-active-thread";

function loadThreads(): Thread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveThreads(threads: Thread[]) {
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch { /* noop */ }
}

function loadActiveThreadId(): string | null {
  try { return localStorage.getItem(ACTIVE_THREAD_KEY); }
  catch { return null; }
}

function saveActiveThreadId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_THREAD_KEY, id);
    else localStorage.removeItem(ACTIVE_THREAD_KEY);
  } catch { /* noop */ }
}

function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Fire-and-forget sync d'un thread vers la table discussions en PostgreSQL */
function syncThreadToApi(thread: Thread) {
  try {
    const statusMap: Record<string, string> = {
      active: "active",
      parked: "parked",
      completed: "closed_promoted",
    };
    api.syncDiscussion({
      external_id: thread.id,
      titre: thread.title,
      status: statusMap[thread.status] || thread.status,
      bot_primaire: thread.primaryBot || "CEOB",
      work_phase: thread.workPhase || "",
      message_count: thread.messages?.length || 0,
    }).catch(() => {}); // fire-and-forget
  } catch { /* noop */ }
}

/** Titre temporaire — nettoyage basique en attendant le titre IA */
function generateThreadTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Nouvelle discussion";

  let text = firstUser.content;

  // Retirer les formules de politesse et fillers francais
  text = text
    .replace(/^(salut|bonjour|allo|hey|ok|bon)\s*,?\s*/i, "")
    .replace(/^(je voudrais|j'aimerais|est-ce qu[e']|qu'est-ce qu[e']|pourrais-tu|peux-tu|dis-moi|parle-moi de)\s*/i, "")
    .replace(/^(on pourrait|il faudrait|on devrait|je pense qu[e']|j'ai besoin)\s*/i, "")
    .replace(/\s*(s'il te plait|svp|merci|please|stp)\s*/gi, "")
    .trim();

  // Retirer les articles en debut
  text = text.replace(/^(le |la |les |un |une |des |du |de la |l')/i, "");

  // Guard: si le texte est vide après nettoyage
  if (!text) return "Nouvelle discussion";

  // Majuscule
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Premiere phrase seulement
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  return firstSentence.length > 50 ? firstSentence.slice(0, 47) + "..." : firstSentence || "Nouvelle discussion";
}

/**
 * Generer un titre intelligent via CarlOS (Gemini Flash — gratuit)
 * Fire-and-forget: le titre est mis a jour en background apres la 1ere reponse
 */
async function generateSmartTitle(userMessage: string, botResponse: string): Promise<string> {
  try {
    const res = await api.chat({
      message: `[SYSTEME — ne reponds PAS comme un assistant, reponds UNIQUEMENT avec un titre court]
Genere un titre de 3 a 6 mots pour identifier cette discussion.
Le titre doit etre concret et specifique (pas generique).
Exemples bons: "Budget R&D Q2", "Embauche developpeur senior", "Crise serveur production"
Exemples mauvais: "Discussion importante", "Nouvelle idee", "Question"

Utilisateur: ${userMessage.slice(0, 300)}
Reponse du bot: ${botResponse.slice(0, 300)}

Titre:`,
      user_id: 1,
      agent: "CEOB",
      direct: true,
    });

    // Nettoyer la reponse — garder seulement la premiere ligne, retirer guillemets
    let title = res.response
      .split("\n")[0]
      .trim()
      .replace(/^["'«]|["'»]$/g, "")
      .replace(/^titre\s*:\s*/i, "")
      .trim();

    // Securite: si le bot a genere une reponse trop longue, c'est pas un titre
    if (title.length > 60 || title.length < 3) {
      return "";
    }

    return title;
  } catch {
    return "";
  }
}

// --- Parse API options from response (📌 1 · ... | 2 · ...) ---

function parseApiOptions(responseText: string): { cleanText: string; parsedOptions: string[] } {
  const lines = responseText.split("\n");
  const parsedOptions: string[] = [];
  const cleanLines: string[] = [];

  // Collect → lines at the end to detect web-format proposals
  const arrowOptions: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Strip [TACHE] internal markers — never show to user (peut être précédé de • ou -)
    if (/\[TACHE\]/i.test(trimmed)) {
      continue;
    }

    // Detect Telegram-style options: 📌 1 · Option A | 2 · Option B | 3 · Option C
    if (/^\p{Emoji}?\s*1\s*[·.]\s*/u.test(trimmed) && /\|/.test(trimmed)) {
      const parts = trimmed.split(/\s*\|\s*/);
      for (const part of parts) {
        const cleaned = part.replace(/^\p{Emoji}?\s*\d+\s*[·.]\s*/u, "").trim();
        if (cleaned) parsedOptions.push(cleaned);
      }
    }
    // Detect REGLE_3_PROPOSITIONS format: 1. Label | 2. Label | 3. Label
    else if (/^\d+\.\s+.+\|/.test(trimmed) && !trimmed.startsWith("[")) {
      const parts = trimmed.split(/\s*\|\s*/);
      for (const part of parts) {
        const cleaned = part.replace(/^\d+\.\s*/, "").trim();
        if (cleaned) parsedOptions.push(cleaned);
      }
    }
    // Detect web-format proposals: → Action text
    else if (/^→\s+/.test(trimmed)) {
      const cleaned = trimmed.replace(/^→\s+/, "").trim();
      if (cleaned) arrowOptions.push(cleaned);
    } else {
      cleanLines.push(line);
    }
  }

  // Arrow options only count if we got 2-4 of them (real proposals, not random arrows)
  if (parsedOptions.length === 0 && arrowOptions.length >= 2 && arrowOptions.length <= 4) {
    parsedOptions.push(...arrowOptions);
  } else if (arrowOptions.length > 0 && parsedOptions.length === 0) {
    // Put arrow lines back if not enough to be proposals
    for (const opt of arrowOptions) {
      cleanLines.push(`→ ${opt}`);
    }
  }

  // Numbered list at end of message: 1. Option\n2. Option\n3. Option
  // Mirrors backend _extraire_options() "Format liste" detection
  if (parsedOptions.length === 0) {
    const numberedLines: { idx: number; label: string }[] = [];
    for (let i = cleanLines.length - 1; i >= Math.max(cleanLines.length - 25, 0); i--) {
      const stripped = cleanLines[i].trim();
      const m = stripped.match(/^\d+[.)]\s+(.+)/);
      if (m) {
        let label = m[1].replace(/^\*+|\*+$/g, "").replace(/[:\s]+$/, "").trim();
        // Reject questions and overly long labels
        if (label.includes("?") || label.length > 80 || label.split(/\s+/).length > 10) {
          // Try short label before : or —
          const short = label.split(/\s*[:\u2014\u2013]\s*/)[0].replace(/^\*+|\*+$/g, "").trim();
          if (short && short !== label && !short.includes("?") && short.length <= 80) {
            label = short;
          } else {
            continue;
          }
        }
        numberedLines.unshift({ idx: i, label });
      } else if (!stripped) {
        // blank line before numbered block — stop scanning
        if (numberedLines.length > 0) break;
      } else {
        // Non-numbered, non-blank line — stop if we already collected some
        if (numberedLines.length > 0) break;
      }
    }
    if (numberedLines.length >= 2 && numberedLines.length <= 6) {
      for (const nl of numberedLines) parsedOptions.push(nl.label);
      // Remove those lines from cleanLines
      const firstIdx = numberedLines[0].idx;
      cleanLines.splice(firstIdx);
    }
  }

  // Fallback: detect 2-4 short plain-text lines at end of message (no numbering, no arrows)
  // Mirrors backend _extraire_options() raw text detection
  if (parsedOptions.length === 0) {
    const tailCandidates: { idx: number; text: string }[] = [];
    for (let i = cleanLines.length - 1; i >= Math.max(cleanLines.length - 8, 0); i--) {
      const stripped = cleanLines[i].trim();
      if (!stripped) {
        if (tailCandidates.length > 0) break; // blank line = delimiter before options
        continue;
      }
      // Short line (< 60 chars), no sentence-ending punctuation, no list markers
      if (
        stripped.length < 60 &&
        stripped.length > 3 &&
        !/[.?!:]$/.test(stripped) &&
        !/^[•\-*–·]/.test(stripped) &&
        !/^\d+[.)]\s/.test(stripped) &&
        !/[?]/.test(stripped) &&
        stripped.split(/\s+/).length <= 10
      ) {
        tailCandidates.unshift({ idx: i, text: stripped });
      } else {
        break;
      }
    }
    if (tailCandidates.length >= 2 && tailCandidates.length <= 4) {
      for (const c of tailCandidates) {
        parsedOptions.push(c.text.replace(/^\*+|\*+$/g, "").trim());
      }
      // Remove those lines from cleanLines
      const firstIdx = tailCandidates[0].idx;
      cleanLines.splice(firstIdx);
    }
  }

  // Trim trailing blank lines
  while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === "") {
    cleanLines.pop();
  }

  return { cleanText: cleanLines.join("\n"), parsedOptions };
}

// --- Focus Card helpers (module-level) ---

const FOCUS_QUESTIONS: Record<string, string> = {
  kpi_ceo: "Qu'est-ce qui capte ton attention dans ce tableau de bord? On explore ensemble?",
  kpi_cfo: "Ces chiffres financiers — est-ce qu'il y a une tension ou une opportunité que tu veux déballer?",
  kpi_cto: "Côté tech — est-ce qu'il y a un risque, une dette ou une opportunité que tu veux activer?",
  kpi_cmo: "Marketing — qu'est-ce qui te tient le plus à coeur en ce moment dans ces données?",
  kpi_cso: "Stratégie — qu'est-ce qui te dérange ou t'emballe dans ce portrait?",
  pipeline: "Le pipeline — y'a-t-il un prospect ou une opportunité sur laquelle tu veux qu'on se concentre?",
  projets: "Ces projets — lequel a le plus besoin de ton attention maintenant?",
  calendrier: "Ton calendrier — est-ce qu'il y a un événement ou une décision imminente qu'on devrait préparer?",
  industrie: "Ces données industrie — y'a-t-il un signal faible ou une tendance que tu veux approfondir?",
  ops: "Opérations — où est-ce que ça bloque, ou qu'est-ce qu'on pourrait optimiser?",
  docforge_library: "Salut Carl! Je suis Paco. On va construire cette bibliothèque ensemble. Par quoi on commence?",
  document_editor: "Salut Carl! Je suis Paco. On monte ce document ensemble. Dis-moi comment tu veux proceder — from scratch ou on va chercher du contenu existant?",
};

const FOCUS_QUICK_ACTIONS: Record<string, string[]> = {
  kpi_ceo: ["Diagnostic complet", "Points critiques", "Quick wins"],
  kpi_cfo: ["Analyse cashflow", "Risques financiers", "Optimisations"],
  kpi_cto: ["Audit tech", "Priorités Q2", "Risques"],
  kpi_cmo: ["Analyse campagnes", "Pipeline leads", "Contenu"],
  kpi_cso: ["Analyse concurrentielle", "Opportunités", "Risques"],
  pipeline: ["Top opportunités", "Pourquoi ça stagne?", "Plan closing"],
  projets: ["Projets en retard", "Ressources", "Livraisons"],
  calendrier: ["Préparer la semaine", "Points importants", "Déléguer"],
  industrie: ["Tendances clés", "Impact sur nous", "Actions"],
  ops: ["Goulots d'étranglement", "Automatiser quoi?", "KPIs"],
  docforge_library: ["Scanner Drive", "Voir les sections", "Contradictions", "Exporter PDF"],
  document_editor: ["Scanner Drive", "Remplir le briefing", "Voir les sections", "Exporter PDF"],
};

function extractFocusItems(data: unknown): Array<{ label: string; value: string }> {
  if (!data || typeof data !== "object") return [];
  // Blocs département: { items: [{ primary, secondary, value, pct }] }
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.items)) {
    return (d.items as Array<Record<string, unknown>>)
      .slice(0, 3)
      .map((item) => ({
        label: String(item.primary || "—"),
        value: String(item.value || (item.pct !== undefined ? `${item.pct}%` : item.secondary || "")),
      }));
  }
  if (Array.isArray(data)) {
    return (data as Array<Record<string, unknown>>)
      .slice(0, 3)
      .map((item) => ({
        label: String(item.nom || item.name || item.titre || item.primary || "—"),
        value: String(item.valeur || item.value || item.statut || item.status || ""),
      }));
  }
  return Object.entries(d)
    .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
    .slice(0, 3)
    .map(([k, v]) => ({
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(v),
    }));
}

// --- useChat ---

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [threads, setThreads] = useState<Thread[]>(() => loadThreads());
  const [activeThreadId, setActiveThreadIdRaw] = useState<string | null>(() => loadActiveThreadId());
  // Roster de bots actifs — max 3, CarlOS en défaut
  const [activeRoster, setActiveRoster] = useState<string[]>(["CEOB"]);
  // CREDO phase — synced from backend responses
  const [lastCREDOPhase, setLastCREDOPhase] = useState<string | null>(null);
  // Sprint Discussion 1 — exchange count + product flag for phase-gating
  const [exchangeCount, setExchangeCount] = useState(0);
  const [hasProduct, setHasProduct] = useState(false);
  const idCounter = useRef(0);
  const hasAutoRestored = useRef(false);

  // Canvas Actions — callback ref pour dispatch vers le bus
  const canvasActionsCallbackRef = useRef<((actions: CanvasAction[]) => void) | null>(null);
  const setCanvasActionsCallback = useCallback((cb: (actions: CanvasAction[]) => void) => {
    canvasActionsCallbackRef.current = cb;
  }, []);

  // Wrapper: persist activeThreadId to localStorage on every change
  const setActiveThreadId = useCallback((id: string | null) => {
    setActiveThreadIdRaw(id);
    saveActiveThreadId(id);
  }, []);

  // Auto-restore: if there's an active thread in localStorage, reload its messages on mount
  useEffect(() => {
    if (hasAutoRestored.current) return;
    hasAutoRestored.current = true;

    try {
      const savedId = loadActiveThreadId();
      if (!savedId) return;

      const savedThreads = loadThreads();
      const thread = savedThreads.find((t) => t.id === savedId);
      if (thread && thread.messages && thread.messages.length > 0) {
        // Valider que les messages ont la structure minimale requise
        const validMessages = thread.messages.filter(
          (m: ChatMessage) => m && typeof m.role === "string" && typeof m.content === "string" && m.id
        );
        if (validMessages.length > 0) {
          // S'assurer que timestamp est un Date (pas un string du JSON)
          const fixedMessages = validMessages.map((m: ChatMessage) => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp || Date.now()),
          }));
          setMessages(fixedMessages);
          setActiveThreadIdRaw(savedId);
          idCounter.current = fixedMessages.length;
        } else {
          saveActiveThreadId(null);
          setActiveThreadIdRaw(null);
        }
      } else {
        saveActiveThreadId(null);
        setActiveThreadIdRaw(null);
      }
    } catch (err) {
      console.error("[useChat] Auto-restore failed, clearing state:", err);
      saveActiveThreadId(null);
      setActiveThreadIdRaw(null);
      // Nettoyer les threads corrompus
      try { localStorage.removeItem(THREADS_KEY); } catch { /* noop */ }
    }
  }, []);

  // BUG FIX S74: Safety net — auto-reset isTyping if stuck for 45+ seconds
  useEffect(() => {
    if (!isTyping) return;
    const timeout = setTimeout(() => {
      console.warn("[useChat] isTyping stuck for 45s — auto-resetting");
      setIsTyping(false);
      streamAbort.current = null;
    }, 45_000);
    return () => clearTimeout(timeout);
  }, [isTyping]);

  // Persist threads to localStorage + sync metadata to PostgreSQL
  const prevThreadsRef = useRef<string>("");
  useEffect(() => {
    saveThreads(threads);
    // Sync changed threads to API (debounced via comparison)
    const key = threads.map((t) => `${t.id}:${t.status}:${t.title}:${t.messages?.length || 0}:${t.workPhase || ""}`).join("|");
    if (key !== prevThreadsRef.current) {
      prevThreadsRef.current = key;
      // Sync all non-empty threads
      for (const t of threads) {
        if (t.messages && t.messages.length > 0) {
          syncThreadToApi(t);
        }
      }
    }
  }, [threads]);

  // Load thread metadata from API on mount (recover threads lost from localStorage)
  const hasLoadedFromApi = useRef(false);
  useEffect(() => {
    if (hasLoadedFromApi.current) return;
    hasLoadedFromApi.current = true;
    api.listDiscussions().then((apiDiscussions) => {
      if (!apiDiscussions || apiDiscussions.length === 0) return;
      setThreads((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const recovered = apiDiscussions
          .filter((d) => !existingIds.has(d.external_id) && d.status !== "closed_archived")
          .map((d) => ({
            id: d.external_id,
            title: d.titre,
            status: (d.status === "closed_promoted" ? "completed" : d.status) as ThreadStatus,
            messages: [] as ChatMessage[],
            primaryBot: d.bot_primaire,
            workPhase: d.work_phase,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            mode: "credo" as const,
          }));
        if (recovered.length > 0) {
          console.log(`[useChat] Recovered ${recovered.length} threads from API`);
          return [...prev, ...recovered];
        }
        return prev;
      });
    }).catch(() => {}); // API down = no merge
  }, []);

  // Update active thread messages when messages change (ne pas ecraser le titre smart)
  useEffect(() => {
    if (activeThreadId && messages.length > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages, updatedAt: new Date().toISOString() }
            : t
        )
      );
    }
  }, [messages, activeThreadId]);

  // ── Suspension Intelligente — drift detection ──
  const driftWarningCount = useRef(0);
  // Phase 2B — Track mission nudge (avoid repeating)
  const missionNudgeShownAt = useRef(0); // msg count when nudge was shown

  function detectDrift(originalTension: string, currentMsg: string): boolean {
    // Extract significant words (>3 chars, not stopwords)
    const stopwords = new Set(["avec", "pour", "dans", "cette", "quel", "quels", "quelle", "quelles", "comment", "pourquoi", "aussi", "mais", "plus", "nous", "vous", "sont", "etre", "avoir", "faire", "peut", "comme", "tout", "bien", "tres", "alors"]);
    const extractWords = (s: string) =>
      s.toLowerCase().replace(/[^a-zàâéèêëïîôùûüçœ]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !stopwords.has(w));

    const origWords = new Set(extractWords(originalTension));
    const currWords = extractWords(currentMsg);
    if (origWords.size === 0 || currWords.length === 0) return false;

    // Calculate overlap ratio
    const overlap = currWords.filter((w) => origWords.has(w)).length;
    const ratio = overlap / currWords.length;

    // If less than 15% overlap and more than 3 exchanges happened, it's a drift
    return ratio < 0.15 && currWords.length >= 4;
  }

  // Inject a coaching message from CarlOS (system-level guidance)
  const injectCoaching = useCallback(
    (text: string, options?: string[]) => {
      const coachMsg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role: "system",
        content: text,
        timestamp: new Date(),
        agent: "CEOB",
        msgType: "coaching",
        options,
      };
      setMessages((prev) => [...prev, coachMsg]);
    },
    []
  );

  // ── Injecter un message team_proposal dans le chat ──
  const injectTeamProposal = useCallback((proposal: TeamProposal, agent: string) => {
    const msg: ChatMessage = {
      id: `msg-${++idCounter.current}`,
      role: "assistant",
      content: proposal.explication,
      timestamp: new Date(),
      agent,
      msgType: "team_proposal" as MessageType,
      teamProposal: proposal,
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Track branch depth
  const currentBranchDepth = useRef(0);

  // Track streaming state — message ID currently being streamed
  const streamingMsgId = useRef<string | null>(null);
  const streamAbort = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      text: string,
      agent?: string,
      ghost?: string,
      mode?: string,
      meta?: { msgType?: MessageType; parentId?: string; branchLabel?: string; activeView?: string; activeSubSection?: string; workspacePhase?: string; techniqueActive?: string; techniqueStep?: number; techniqueContext?: string }
    ) => {
      const msgType = meta?.msgType || "normal";
      const branchDepth = msgType === "challenge" || msgType === "consultation"
        ? currentBranchDepth.current + 1
        : currentBranchDepth.current;

      // Anti-boucle: max 3 niveaux de profondeur
      if (branchDepth > 3) {
        injectCoaching(
          "Tu es a 3 niveaux de profondeur. C'est assez — finalise le mode actuel ou retourne a la question principale.",
          ["Synthese finale", "Retour au sujet principal"]
        );
        return;
      }

      if (msgType === "challenge" || msgType === "consultation") {
        currentBranchDepth.current = branchDepth;
      }

      const userMsg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role: "user",
        content: text,
        timestamp: new Date(),
        msgType,
        parentId: meta?.parentId,
        branchDepth,
        branchLabel: meta?.branchLabel,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // S109 — Thinking steps contextuels enrichis: 7 etapes variees, 1.8s cycle
      const _THINK_STOPS = new Set([
        "dans","pour","avec","comment","quel","quelle","cette","votre","notre",
        "quels","quelles","faire","faut","veux","voudrais","aimerais","peux",
        "peut","dois","doit","aussi","encore","comme","juste","vraiment",
        "toujours","suis","sont","être","etre","avoir","tout","tous",
        "mais","puis","donc","alors","meme","tres","plus","moins",
      ]);
      const _buildThinkingSteps = (ag: string, userMsg: string): string[] => {
        const words = userMsg
          .replace(/[?!.,;:'"()]/g, "")
          .split(" ")
          .filter(w => w.length > 3 && !_THINK_STOPS.has(w.toLowerCase()));
        const sujet = words.slice(0, 3).join(" ") || "votre question";
        const sujet2 = words.slice(1, 4).join(" ") || sujet;
        const _expertise: Record<string, [string, string, string]> = {
          CEOB: ["Vision strategique", "Scenarios de croissance", "Alignement des priorites"],
          CTOB: ["Architecture technique", "Faisabilite et risques", "Solutions technologiques"],
          CFOB: ["Modelisation financiere", "Analyse cout-benefice", "Projection des resultats"],
          CMOB: ["Positionnement marche", "Strategie d'acquisition", "Impact sur la marque"],
          CSOB: ["Cartographie des risques", "Scenarios concurrentiels", "Avantages strategiques"],
          COOB: ["Processus operationnels", "Allocation des ressources", "Plan d'execution"],
          CPOB: ["Chaine de valeur", "Optimisation des flux", "Gains de productivite"],
          CHROB: ["Dynamique d'equipe", "Competences requises", "Strategie de talent"],
          CINOB: ["Veille sectorielle", "Tendances emergentes", "Opportunites de marche"],
          CROB: ["Pipeline de revenus", "Leviers de conversion", "Croissance des ventes"],
          CLOB: ["Cadre reglementaire", "Analyse de conformite", "Protection juridique"],
          CISOB: ["Evaluation de securite", "Vulnerabilites potentielles", "Mesures de protection"],
        };
        const angles = _expertise[ag] || ["Analyse approfondie", "Evaluation des options", "Synthese"];
        return [
          `Lecture: ${sujet}`,
          `Contexte et enjeux`,
          angles[0],
          `${sujet2} — options`,
          angles[1],
          `Evaluation des scenarios`,
          `${angles[2]} — formulation`,
        ];
      };
      const _steps = _buildThinkingSteps(agent, text);
      setThinkingSteps([_steps[0]]);
      let _thinkIdx = 1;
      const _thinkTimer = setInterval(() => {
        if (_thinkIdx < _steps.length) {
          setThinkingSteps([_steps[_thinkIdx]]);
          _thinkIdx++;
        } else {
          clearInterval(_thinkTimer);
        }
      }, 1800);

      // Auto-create thread on first message
      if (!activeThreadId) {
        const newId = generateThreadId();
        const thread: Thread = {
          id: newId,
          title: generateThreadTitle([userMsg]),
          status: "active",
          messages: [userMsg],
          mode: (mode as Thread["mode"]) || "credo",
          primaryBot: agent || "CEOB",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setThreads((prev) => [...prev, thread]);
        setActiveThreadId(newId);

        // Phase 1B — Auto-link thread to pending mission (from MesChantiersView)
        try {
          const pendingMissionId = sessionStorage.getItem("ghostx-pending-mission-link");
          if (pendingMissionId) {
            sessionStorage.removeItem("ghostx-pending-mission-link");
            // Set missionId on the thread locally
            setThreads((prev) =>
              prev.map((t) => t.id === newId ? { ...t, missionId: pendingMissionId } : t)
            );
            api.linkThreadToMission(parseInt(pendingMissionId), newId).catch(() => {});
          }
        } catch { /* noop */ }

        // Auto-link thread to parent chantier (from handleWorkAction phase buttons)
        try {
          const pendingChantier = sessionStorage.getItem("ghostx-pending-chantier-link");
          const pendingSection = sessionStorage.getItem("ghostx-pending-flow-section");
          if (pendingChantier) {
            sessionStorage.removeItem("ghostx-pending-chantier-link");
            sessionStorage.removeItem("ghostx-pending-flow-section");
            setThreads((prev) =>
              prev.map((t) => t.id === newId ? { ...t, parentChantier: pendingChantier, flowSection: pendingSection || undefined } : t)
            );
          }
        } catch { /* noop */ }
      }

      console.log("[hooks.sendMessage] agent:", agent, "text:", text.slice(0, 30));
      const req: ChatRequest = {
        message: text,
        user_id: 1,
        agent,
        ghost,
        mode: mode || undefined,
        direct: true,
        msg_type: msgType !== "normal" ? msgType : undefined,
        parent_id: meta?.parentId,
        branch_depth: branchDepth,
        // D-101 — GPS du Flow
        active_view: meta?.activeView,
        active_sub_section: meta?.activeSubSection,
        // Mega Plan V5 — workspace phase
        workspace_phase: meta?.workspacePhase,
        // Sprint 2A — Techniques interactives
        technique_active: meta?.techniqueActive,
        technique_step: meta?.techniqueStep,
        technique_context: meta?.techniqueContext,
        // S102 — conversation-level message count (pas session-wide)
        conversation_msg_count: messages.filter((m: any) => m.role === "user").length + 1,
      };

      // Create placeholder bot message for streaming
      const botMsgId = `msg-${++idCounter.current}`;
      const botMsgBase: ChatMessage = {
        id: botMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        agent: agent || "CEOB",
        msgType: msgType === "challenge" ? "challenge" : msgType === "consultation" ? "consultation" : msgType === "synthesis" ? "synthesis" : "normal",
        parentId: meta?.parentId,
        branchDepth,
        branchLabel: meta?.branchLabel,
        isStreaming: true,
      };

      // Add empty bot message that will fill progressively
      setMessages((prev) => [...prev, botMsgBase]);
      streamingMsgId.current = botMsgId;

      const modeConf = MODE_LIVE_CONFIG[mode || "credo"] || MODE_LIVE_CONFIG.credo;

      // Try streaming first, fallback to standard chat
      // Sprint 3 — Route via OpenClaw gateway for non-CEO bots
      const useOC = shouldUseOpenClaw(agent);
      try {
        await new Promise<void>((resolve, reject) => {
          const controller = (useOC ? api.chatOpenClaw : api.chatStream).call(api, req, {
            onStatus: () => {
              // Frontend timer handles thinking steps (nginx buffers SSE status events)
            },
            onToken: (_chunk: string, accumulated: string) => {
              // Clear thinking animation + timer au premier token
              if (accumulated.length === _chunk.length) {
                clearInterval(_thinkTimer);
                setThinkingSteps([]);
              }
              // Strip [TACHE] lines during streaming so they never appear
              const cleaned = accumulated.split("\n").filter(l => !/\[TACHE\]/i.test(l)).join("\n");
              // Update the bot message content progressively
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, content: cleaned } : m
                )
              );
            },
            onDone: (data: StreamDoneEvent) => {
              // Sync CREDO phase from backend
              const backendPhase = data.bubble_context?.credo_phase || data.phase_credo;
              if (backendPhase) setLastCREDOPhase(backendPhase);
              // Sprint Discussion 1 — sync exchange_count + has_product
              if (data.exchange_count !== undefined) setExchangeCount(data.exchange_count);
              if (data.has_product !== undefined) setHasProduct(data.has_product);

              // Final update with all metadata
              // TOUJOURS strip [TACHE] du texte, même quand le backend envoie des options explicites
              let cleanText = data.response.split("\n").filter((l: string) => !/\[TACHE\]/i.test(l)).join("\n").trim();
              // S2.3 — Strip residual <artifact> tags from chat display (keep content inside)
              cleanText = cleanText.replace(/<\/?artifact[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();
              let parsedOptions: string[] = [];

              if (data.options && data.options.length > 0) {
                parsedOptions = data.options.map((o) => o.label);
              } else {
                const parsed = parseApiOptions(cleanText);
                cleanText = parsed.cleanText;
                parsedOptions = parsed.parsedOptions;
              }

              // Options: backend explicit > parsed du texte > rien (pas de defaults hardcodés)
              const options = parsedOptions.length > 0 ? parsedOptions : undefined;

              // Filtrer les canvas_actions pour enlever les meta-actions (phase_update)
              const visibleActions = (data.canvas_actions || []).filter(
                (a: CanvasAction) => !((a.data as Record<string, unknown>)?.type === "phase_update")
              );

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId
                    ? {
                        ...m,
                        content: cleanText,
                        agent: data.agent || agent || "CEOB",
                        ghost: data.ghost_actif,
                        tier: data.tier,
                        latence_ms: data.latence_ms,
                        options: options || undefined,
                        isStreaming: false,
                        canvasActions: visibleActions.length > 0 ? visibleActions : undefined,
                        isDiagnostic: data.is_diagnostic || false,
                        bubbleContext: data.bubble_context || undefined,
                        cascadeSuggestions: data.cascade_suggestions?.length ? data.cascade_suggestions : undefined,
                        scaffoldProgress: data.scaffold_progress || undefined,
                        cristallisationSuggestion: data.cristallisation_suggestion || undefined,
                        cascadeItems: data.cascade_items?.length ? data.cascade_items : undefined,
                        workspace_block: data.workspace_block || undefined,
                        workspace_blocks: data.workspace_blocks || undefined,
                        workspace_block_skip: data.workspace_block_skip || false,
                      }
                    : m
                )
              );

              streamingMsgId.current = null;

              // Canvas Actions — dispatch vers le bus
              // GUARD: Pas de canvas actions pendant une discussion (cause des pop-ups + switch de département non voulus)
              // EXCEPTION: is_code_task bypass le guard — CarlOS delegue a Claude Code
              const isInChat = meta?.activeView === "live-chat" || !meta?.activeView;
              if (data.is_code_task && data.canvas_actions?.length && canvasActionsCallbackRef.current) {
                const codeAction = data.canvas_actions.find(a => a.view === "carlos-codes");
                if (codeAction?.data) {
                  const taskId = (codeAction.data as Record<string, string>).task_id;
                  localStorage.setItem("carlos-codes-active-task", taskId);
                  localStorage.setItem("carlos-codes-active-desc", data.response || "");
                }
                canvasActionsCallbackRef.current(data.canvas_actions);
              } else if (data.canvas_actions && data.canvas_actions.length > 0 && canvasActionsCallbackRef.current) {
                // Laisser passer phase_transition + start_deliverable même en chat, bloquer le reste si isInChat
                const filteredActions = isInChat
                  ? data.canvas_actions.filter((a: any) => a.type === "phase_transition" || a.type === "start_deliverable")
                  : data.canvas_actions;
                if (filteredActions.length > 0) {
                  canvasActionsCallbackRef.current(filteredActions);
                }
              }

              // Team proposal — injecter apres la reponse du bot
              if (data.team_proposal) {
                setTimeout(() => {
                  injectTeamProposal(data.team_proposal!, data.agent);
                }, 400);
              }

              // Post-stream: coaching, sentinelle, drift detection
              const allMsgs = [...messages, userMsg];
              const botCount = allMsgs.filter((m) => m.role === "assistant").length + 1;
              const userMsgs = allMsgs.filter((m) => m.role === "user");

              // Greeting detection — reset coaching counters on new topic
              const isGreeting = /^(allo|salut|bonjour|hey|hi|hello|yo|coucou|bonsoir)\b/i.test(text.trim());
              if (isGreeting) {
                driftWarningCount.current = 0;
                missionNudgeShownAt.current = 0;
              }

              if (botCount === 1) {
                // Titre intelligent genere par CarlOS apres le 1er echange
                generateSmartTitle(text, cleanText).then((smartTitle) => {
                  if (smartTitle) {
                    setThreads((prev) =>
                      prev.map((t) =>
                        t.id === activeThreadId ? { ...t, title: smartTitle } : t
                      )
                    );
                  }
                });

                // Auto-consult DÉSACTIVÉ — Carl: "les bots doivent être coordonnés, pas en parallèle automatique"
                // Le user choisit manuellement qui consulter via le bouton Consulter
                if (false && modeConf.autoConsultBots.length > 0 && msgType === "normal") {
                  // ... code gardé mais désactivé
                }
              } else if (!isGreeting && botCount >= modeConf.maxExchanges) {
                setTimeout(() => {
                  injectCoaching(modeConf.coachingConverge, ["Synthese", "Continuer l'exploration"]);
                }, 500);
              }

              if (data.sentinel_alert) {
                const sa = data.sentinel_alert;
                setTimeout(() => {
                  injectCoaching(sa.message, sa.suggestions.length > 0 ? sa.suggestions : undefined);
                }, 700);
              }

              if (!data.sentinel_alert && !isGreeting && userMsgs.length >= 8 && msgType === "normal") {
                const originalTension = userMsgs[0]?.content || "";
                const isDrifting = detectDrift(originalTension, text);
                if (isDrifting) {
                  driftWarningCount.current++;
                  if (driftWarningCount.current === 1) {
                    setTimeout(() => {
                      injectCoaching(
                        "On s'eloigne du sujet initial. Tu veux continuer sur cette tangente ou revenir a ta tension de depart?",
                        ["Revenir au sujet", "Parker et continuer ici", "C'est lie, continue"]
                      );
                    }, 600);
                  } else if (driftWarningCount.current >= 2) {
                    setTimeout(() => {
                      injectCoaching(
                        "Ca fait 2 fois qu'on derive. Je te propose de parker cette discussion et d'en ouvrir une nouvelle pour ce nouveau sujet.",
                        ["Parker et nouveau thread", "Forcer la synthese", "Laisser-moi continuer"]
                      );
                    }, 600);
                  }
                }
              }

              // Phase 2B — Nudge "en faire une mission?" apres 12+ messages user sans mission liee
              const currentThread = threads.find((t) => t.id === activeThreadId);
              if (
                !isGreeting &&
                userMsgs.length >= 12 &&
                msgType === "normal" &&
                !currentThread?.missionId &&
                missionNudgeShownAt.current === 0
              ) {
                missionNudgeShownAt.current = userMsgs.length;
                setTimeout(() => {
                  injectCoaching(
                    "On a bien explore ce sujet. Tu veux en faire une mission? Ca va me permettre de suivre l'avancement.",
                    ["Oui, creer la mission", "Pas encore"]
                  );
                }, 800);
              } else if (
                userMsgs.length >= 20 &&
                !currentThread?.missionId &&
                missionNudgeShownAt.current > 0 &&
                missionNudgeShownAt.current <= 12
              ) {
                missionNudgeShownAt.current = userMsgs.length;
                setTimeout(() => {
                  injectCoaching(
                    "Cette discussion a du contenu solide. On la structure en mission pour ne rien perdre?",
                    ["Oui, creer la mission", "Non merci"]
                  );
                }, 800);
              }

              resolve();
            },
            onError: (error: string) => {
              clearInterval(_thinkTimer);
              reject(new Error(error));
            },
          });
          streamAbort.current = controller;
        });
      } catch (err) {
        // Streaming failed — fallback to standard chat
        clearInterval(_thinkTimer);
        streamingMsgId.current = null;

        try {
          const res = await api.chat(req);

          let cleanText = res.response;
          let parsedOptions: string[] = [];

          if (res.options && res.options.length > 0) {
            parsedOptions = res.options.map((o) => o.label);
          } else {
            const parsed = parseApiOptions(res.response);
            cleanText = parsed.cleanText;
            parsedOptions = parsed.parsedOptions;
          }

          // Options: backend explicit > parsed du texte > rien
          const options = parsedOptions.length > 0 ? parsedOptions : undefined;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    content: cleanText,
                    agent: res.agent,
                    ghost: res.ghost_actif,
                    tier: res.tier,
                    latence_ms: res.latence_ms,
                    options: options || undefined,
                    isStreaming: false,
                    isDiagnostic: res.is_diagnostic || false,
                    cascadeSuggestions: res.cascade_suggestions?.length ? res.cascade_suggestions : undefined,
                    scaffoldProgress: res.scaffold_progress || undefined,
                    cristallisationSuggestion: res.cristallisation_suggestion || undefined,
                    cascadeItems: res.cascade_items?.length ? res.cascade_items : undefined,
                  }
                : m
            )
          );

          // Team proposal fallback path
          if (res.team_proposal) {
            setTimeout(() => {
              injectTeamProposal(res.team_proposal!, res.agent);
            }, 400);
          }
        } catch (fallbackErr) {
          // Both streaming and fallback failed
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    content: `Erreur: ${fallbackErr instanceof Error ? fallbackErr.message : "Connexion impossible"}`,
                    isStreaming: false,
                  }
                : m
            )
          );
        }
      } finally {
        setIsTyping(false);
        setThinkingSteps([]);
        streamAbort.current = null;
      }
    },
    [activeThreadId, messages, injectCoaching, injectTeamProposal]
  );

  // ── Roster management — max 3 bots ──

  const addBotToRoster = useCallback((code: string) => {
    setActiveRoster((prev) => {
      if (prev.includes(code)) return prev;
      if (prev.length >= 3) return prev; // max 3
      const newRoster = [...prev, code];

      // Animation d'ajout — multi-thinking variant "join" (comme les simulations)
      // content = bot code → le rendu affiche "X rejoint la discussion" avec avatar spinner
      const joinId = `msg-join-${Date.now()}`;
      const joinMsg: ChatMessage = {
        id: joinId,
        role: "assistant",
        content: code,
        timestamp: new Date(),
        agent: code,
        msgType: "multi-thinking" as any,
      };
      setMessages((prevMsgs) => [...prevMsgs, joinMsg]);

      // S102 — Fallback: auto-remove apres 8s si l'intro ne remplace pas le join
      setTimeout(() => {
        setMessages((prevMsgs) => prevMsgs.filter((m) => m.id !== joinId));
      }, 8000);

      return newRoster;
    });
  }, []);

  const removeBotFromRoster = useCallback((code: string) => {
    setActiveRoster((prev) => {
      if (prev.length <= 1) return prev; // garder au moins 1 bot
      return prev.filter((c) => c !== code);
    });
  }, []);

  const acceptTeamProposal = useCallback((bots: string[]) => {
    const limited = bots.slice(0, 3);
    setActiveRoster(limited.length > 0 ? limited : ["CEOB"]);
  }, []);

  // ── Auto-introduction — quand un nouveau bot rejoint, il lit la conversation et se présente ──
  const prevRosterRef = useRef<string[]>(["CEOB"]);
  useEffect(() => {
    const prevRoster = prevRosterRef.current;
    const newBot = activeRoster.find((code) => !prevRoster.includes(code));
    prevRosterRef.current = [...activeRoster];

    // Pas d'intro si pas de nouveau bot ou pas de conversation en cours
    if (!newBot) return;
    const realMsgs = messages.filter(
      (m) => (m.role === "user" || m.role === "assistant") &&
        m.content && !["multi-thinking", "typing"].includes((m.msgType as string) || "")
    );
    if (realMsgs.length === 0) return;

    // Après l'animation (3s), demander au bot de se présenter
    const introTimer = setTimeout(async () => {
      // Typing animation pendant l'appel API
      const typingId = `msg-typing-intro-${Date.now()}`;
      // S102 — Remplacer le join message par typing (meme slot, pas de gap visuel)
      setMessages((prev) => {
        const hasJoin = prev.some((m) => (m.msgType as string) === "multi-thinking" && m.content === newBot);
        if (hasJoin) {
          return prev.map((m) =>
            ((m.msgType as string) === "multi-thinking" && m.content === newBot)
              ? { id: typingId, role: "assistant" as const, content: "", timestamp: new Date(), agent: newBot, msgType: "typing" as any }
              : m
          );
        }
        return [...prev, { id: typingId, role: "assistant" as const, content: "", timestamp: new Date(), agent: newBot, msgType: "typing" as any }];
      });

      try {
        const history = realMsgs.slice(-10).map((m) => ({
          role: m.role, content: m.content.slice(0, 500), agent: m.agent,
        }));

        const res = await api.chatMulti({
          message: "Tu viens de rejoindre une discussion en cours entre Carl et tes collègues. " +
            "Présente brièvement (3-4 phrases max) ce que tu peux apporter sur le sujet en cours, basé sur ton expertise. " +
            "Sois direct et concis. Ne répète pas ce qui a été dit. Propose 2-3 pistes concrètes de ta perspective.",
          user_id: 1,
          agents: [newBot],
          history,
        });

        if (res.perspectives.length > 0) {
          const persp = res.perspectives[0];
          const modeConf = MODE_LIVE_CONFIG.credo;
          const introMsg: ChatMessage = {
            id: `msg-${++idCounter.current}`,
            role: "assistant",
            content: persp.contenu,
            timestamp: new Date(),
            agent: persp.agent,
            tier: persp.tier,
            options: persp.options.length > 0 ? persp.options.map((o) => o.label) : modeConf.options,
            msgType: "consultation",
            branchLabel: `Introduction — ${persp.nom}`,
          };
          // S102 — Remplacer typing par intro (meme slot, transition fluide)
          setMessages((prev) => prev.map((m) => m.id === typingId ? introMsg : m));
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== typingId));
        }
      } catch (e) {
        // S102 — Retirer le typing en cas d'erreur
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
        console.error("Bot intro failed:", e);
      }
    }, 3200); // 3.2s = juste après la fin de l'animation join (3s)

    return () => clearTimeout(introTimer);
  }, [activeRoster]); // eslint-disable-line react-hooks/exhaustive-deps

  const newConversation = useCallback((initialBot?: string, workPhase?: string) => {
    // Park current thread if it has messages
    if (activeThreadId && messages.length > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "parked" as ThreadStatus, workPhase: workPhase || t.workPhase } : t
        )
      );
    }
    setMessages([]);
    setActiveThreadId(null);
    setActiveRoster([initialBot || "CEOB"]);
    idCounter.current = 0;
    driftWarningCount.current = 0;
    missionNudgeShownAt.current = 0;
  }, [activeThreadId, messages]);

  const parkThread = useCallback((initialBot?: string, workPhase?: string) => {
    if (activeThreadId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "parked" as ThreadStatus, messages, workPhase: workPhase || t.workPhase } : t
        )
      );
      setMessages([]);
      setActiveThreadId(null);
      setActiveRoster([initialBot || "CEOB"]);
      idCounter.current = 0;
    }
  }, [activeThreadId, messages]);

  const resumeThread = useCallback((threadId: string, currentWorkPhase?: string): string | undefined => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return undefined;

    // Park current if needed — save current workPhase
    if (activeThreadId && messages.length > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "parked" as ThreadStatus, messages, workPhase: currentWorkPhase || t.workPhase } : t
        )
      );
    }

    setMessages(thread.messages);
    setActiveThreadId(threadId);
    idCounter.current = thread.messages.length;

    // Restore roster to thread's primaryBot
    if (thread.primaryBot) {
      setActiveRoster([thread.primaryBot]);
    }

    // Mark resumed thread as active
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, status: "active" as ThreadStatus } : t
      )
    );

    // Return the resumed thread's workPhase so caller can restore it (default "discussion")
    return thread.workPhase || "discussion";
  }, [threads, activeThreadId, messages]);

  const completeThread = useCallback(() => {
    if (activeThreadId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "completed" as ThreadStatus, messages } : t
        )
      );
      setMessages([]);
      setActiveThreadId(null);
      idCounter.current = 0;
    }
  }, [activeThreadId, messages]);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      setMessages([]);
      setActiveThreadId(null);
      idCounter.current = 0;
    }
  }, [activeThreadId]);

  // B.1 — Multi-perspectives : consulter N bots en parallele
  // S102-B — Feature flag: bulle consolidee vs N bulles separees
  const MULTI_CONSOLIDATED = true;

  const sendMultiPerspective = useCallback(
    async (text: string, agents: string[], mode?: string, opts?: { primaryAgent?: string; workspacePhase?: string }) => {
      if (agents.length < 1) return;

      // 1. Toujours ajouter le message user (bulle visible dans la discussion)
      const userMsg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role: "user",
        content: text,
        timestamp: new Date(),
        msgType: "normal",
      };
      setMessages((prev) => [...prev, userMsg]);

      // Auto-create thread if needed
      if (!activeThreadId) {
        const newId = generateThreadId();
        const thread: Thread = {
          id: newId,
          title: generateThreadTitle([userMsg]),
          status: "active",
          messages: [userMsg],
          mode: (mode as Thread["mode"]) || "credo",
          primaryBot: agents[0] || "CEOB",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setThreads((prev) => [...prev, thread]);
        setActiveThreadId(newId);
      }

      // Animation consultation multi-agent (comme les simulations)
      const consultBubbleId = `msg-consult-${Date.now()}`;
      const consultMsg: ChatMessage = {
        id: consultBubbleId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        agent: agents[0],
        msgType: "multi-thinking" as any,
      };
      // S102-B.2 — Stocker le message user pour extraction mots-cles dans la bulle multi-thinking
      (consultMsg as any).userText = text;
      setMessages((prev) => [...prev, consultMsg]);
      setIsTyping(true);

      try {
        // Passer les derniers messages comme historique pour que les bots connaissent le contexte
        const recentMsgs = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .filter((m) => m.msgType !== "multi-thinking" && m.msgType !== "typing" && m.msgType !== "coaching")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 500), agent: m.agent }));

        const req: MultiChatRequest = {
          message: text,
          user_id: 1,
          agents,
          mode: mode || undefined,
          history: recentMsgs.length > 0 ? recentMsgs : undefined,
          primary_agent: opts?.primaryAgent || agents[0],   // S102-B
          workspace_phase: opts?.workspacePhase,             // S102-B
        };
        const res = await api.chatMulti(req);

        // Retirer l'animation consultation
        setMessages((prev) => prev.filter((m) => m.id !== consultBubbleId));

        // ═══ S102-B — Bulle consolidee (flag ON + multi-bot) ═══
        if (MULTI_CONSOLIDATED && res.perspectives.length > 1) {
          const primary = res.perspectives.find((p) => p.is_primary) || res.perspectives[res.perspectives.length - 1];
          const secondaries = res.perspectives.filter((p) => p.agent !== primary.agent);

          const modeConf = MODE_LIVE_CONFIG[mode || "credo"] || MODE_LIVE_CONFIG.credo;
          const consolidatedMsg: ChatMessage = {
            id: `msg-${++idCounter.current}`,
            role: "assistant",
            content: primary.contenu,
            timestamp: new Date(),
            agent: primary.agent,
            tier: primary.tier,
            options: primary.options.length > 0
              ? primary.options.map((o) => o.label)
              : modeConf.options,
            msgType: "multi-enriched" as any,
            branchLabel: `${primary.nom} + ${secondaries.length} expert${secondaries.length > 1 ? "s" : ""}`,
          };
          // Stocker metadata consolidee (via any cast — non-standard fields)
          (consolidatedMsg as any).secondaryInputs = secondaries.map((s) => ({
            agent: s.agent, nom: s.nom, contenu: s.contenu,
          }));
          (consolidatedMsg as any).modeActif = res.mode_actif;
          (consolidatedMsg as any).modeSteps = res.mode_steps;
          setMessages((prev) => [...prev, consolidatedMsg]);
        } else {
          // ═══ ANCIEN — N bulles separees (code S102, INTACT) ═══
          for (let i = 0; i < res.perspectives.length; i++) {
            const persp = res.perspectives[i];

            // Délai entre les réponses (sauf la première) — effet séquentiel
            if (i > 0) {
              const typingId = `msg-typing-${persp.agent}`;
              const typingMsg: ChatMessage = {
                id: typingId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                agent: persp.agent,
                msgType: "typing" as any,
              };
              setMessages((prev) => [...prev, typingMsg]);
              await new Promise((r) => setTimeout(r, 1500));
              setMessages((prev) => prev.filter((m) => m.id !== typingId));
            }

            const modeConf = MODE_LIVE_CONFIG[mode || "credo"] || MODE_LIVE_CONFIG.credo;
            const options = persp.options.length > 0
              ? persp.options.map((o) => o.label)
              : modeConf.options;

            const botMsg: ChatMessage = {
              id: `msg-${++idCounter.current}`,
              role: "assistant",
              content: persp.contenu,
              timestamp: new Date(),
              agent: persp.agent,
              tier: persp.tier,
              options,
              msgType: "consultation",
              branchLabel: `Consultation — ${persp.nom}`,
              branchDepth: 1,
            };
            setMessages((prev) => [...prev, botMsg]);
          }

          // Barre de synthese apres multi-bot (ancien)
          if (res.perspectives.length > 1) {
            const syntheseMsg: ChatMessage = {
              id: `msg-synthese-${Date.now()}`,
              role: "assistant",
              content: "",
              timestamp: new Date(),
              agent: "SYSTEM",
              msgType: "synthesis-bar" as any,
              options: [
                "Fusionner et synthétiser les avis",
                "Challenger les deux positions",
                "Plan d'action combiné",
              ],
            };
            setMessages((prev) => [...prev, syntheseMsg]);
          }
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== consultBubbleId));
        const errMsg: ChatMessage = {
          id: `msg-${++idCounter.current}`,
          role: "assistant",
          content: `Erreur multi-perspectives: ${err instanceof Error ? err.message : "Connexion impossible"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [activeThreadId, messages]
  );

  // Voice transcript injection — called by VideoCallWidget/DiscussionWindow when voice events arrive
  // Unification voice/text: accepts full metadata for parity with text chat bubbles
  interface VoiceMessageMeta {
    options?: any[];
    canvasActions?: any[];
    teamProposal?: any;
    phaseCredo?: string;
    bubbleContext?: any;
    isDiagnostic?: boolean;
    ghostActif?: string | null;
    tier?: string;
    latenceMs?: number;
    cascadeSuggestions?: any[];
    scaffoldProgress?: any;
  }

  const injectVoiceMessage = useCallback(
    (role: "user" | "assistant", content: string, agent?: string, meta?: VoiceMessageMeta) => {
      // Thinking indicator — meme comportement que le chat texte
      // User parle → bot reflechit (typing=true), bot repond → typing=false
      if (role === "user") setIsTyping(true);
      if (role === "assistant") setIsTyping(false);

      // Options: extract labels from option objects (backend sends {label, emoji, ...})
      const optionLabels = (meta?.options || []).map((o: any) => typeof o === "string" ? o : (o.label || o));

      const msg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role,
        content,
        timestamp: new Date(),
        agent: role === "assistant" ? (agent || "CEOB") : undefined,
        msgType: "voice" as MessageType,
        options: optionLabels,
        bubbleContext: meta?.bubbleContext,
        isDiagnostic: meta?.isDiagnostic,
        ghost: meta?.ghostActif,
        tier: meta?.tier,
        latence_ms: meta?.latenceMs,
        cascadeSuggestions: meta?.cascadeSuggestions,
        scaffoldProgress: meta?.scaffoldProgress,
      };
      setMessages((prev) => [...prev, msg]);

      // CREDO sync — meme logique que onDone dans sendMessage
      if (meta?.phaseCredo) {
        setLastCREDOPhase(meta.phaseCredo);
      }

      // Canvas actions — dispatch via le bus (phase_transition seulement en chat)
      if (meta?.canvasActions && meta.canvasActions.length > 0 && canvasActionsCallbackRef.current) {
        const filteredActions = meta.canvasActions.filter((a: any) => a.type === "phase_transition");
        if (filteredActions.length > 0) {
          canvasActionsCallbackRef.current(filteredActions);
        }
      }

      // Team proposal — injecter apres la reponse du bot (delai 400ms comme le texte)
      if (meta?.teamProposal && role === "assistant") {
        setTimeout(() => {
          injectTeamProposal(meta.teamProposal!, agent || "CEOB");
        }, 400);
      }

      // Auto-create thread if first voice message AND no active thread
      if (!activeThreadId && role === "user") {
        const newId = generateThreadId();
        const thread: Thread = {
          id: newId,
          title: `Appel vocal — ${new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}`,
          status: "active",
          messages: [msg],
          mode: "credo",
          primaryBot: agent || "CEOB",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setThreads((prev) => [...prev, thread]);
        setActiveThreadId(newId);
      }
    },
    [activeThreadId, injectTeamProposal]
  );

  // Focus card injection — démarre TOUJOURS une nouvelle discussion dédiée à l'élément cliqué
  // Appelé depuis ChatProvider après newConversation() (qui parke le fil en cours si nécessaire)
  const injectFocusCard = useCallback(
    (fd: { title: string; elementType: string; data: unknown; bot: string }) => {
      const items = extractFocusItems(fd.data);
      const question = FOCUS_QUESTIONS[fd.elementType] || "Qu'est-ce qu'on explore ensemble sur ce sujet?";
      const quickActions = FOCUS_QUICK_ACTIONS[fd.elementType] || ["Analyser", "Stratégie", "Quick wins"];

      const msg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role: "assistant",
        content: question,
        timestamp: new Date(),
        agent: fd.bot || "CEOB",
        msgType: "focus_card" as MessageType,
        focusCardData: { title: fd.title, elementType: fd.elementType, items, quickActions },
      };

      // Nouveau thread dédié à cet élément (toujours — newConversation a déjà parké le précédent)
      const newId = generateThreadId();
      const thread: Thread = {
        id: newId,
        title: fd.title,
        status: "active",
        messages: [msg],
        mode: "credo",
        primaryBot: fd.bot || "CEOB",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages([msg]);                              // remplace (pas append) — fil propre
      setThreads((prev) => [...prev, thread]);
      setActiveThreadId(newId);
    },
    [] // pas de dépendances — utilise setters fonctionnels uniquement
  );

  // Sprint 2 — rename thread title
  const renameThread = useCallback((threadId: string, newTitle: string) => {
    setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, title: newTitle } : t));
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    sendMultiPerspective,
    injectVoiceMessage,
    injectTeamProposal,
    injectFocusCard,
    newConversation,
    threads,
    activeThreadId,
    parkThread,
    resumeThread,
    completeThread,
    deleteThread,
    renameThread,
    setCanvasActionsCallback,
    // Chef d'Orchestre
    activeRoster,
    addBotToRoster,
    removeBotFromRoster,
    acceptTeamProposal,
    // CREDO phase synced from backend
    lastCREDOPhase,
    // Sprint Discussion 1 — phase-gating data
    exchangeCount,
    hasProduct,
    // Animations de réflexion dynamiques
    thinkingSteps,
  };
}

// --- useClients ---

export function useClients() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listClients()
      .then((res) => {
        setClients(res.clients);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { clients, loading, error };
}

// --- useCrystals — banque d'idees cristallisees ---

const CRYSTALS_KEY = "ghostx-crystals";

export function useCrystals() {
  const [crystals, setCrystals] = useState<Crystal[]>(() => {
    try {
      const raw = localStorage.getItem(CRYSTALS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(CRYSTALS_KEY, JSON.stringify(crystals)); }
    catch { /* noop */ }
  }, [crystals]);

  const addCrystal = useCallback((crystal: Omit<Crystal, "id" | "date">) => {
    const newCrystal: Crystal = {
      ...crystal,
      id: `crystal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      date: new Date().toISOString(),
    };
    setCrystals((prev) => [newCrystal, ...prev]);
    return newCrystal;
  }, []);

  const deleteCrystal = useCallback((id: string) => {
    setCrystals((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const exportCrystals = useCallback(() => {
    const text = crystals.map((c) =>
      `## ${c.titre}\n*${c.bot} — ${c.mode} — ${new Date(c.date).toLocaleDateString("fr-CA")}*\n\n${c.contenu}\n\n---`
    ).join("\n\n");
    return text;
  }, [crystals]);

  return { crystals, addCrystal, deleteCrystal, exportCrystals };
}


// --- useTemplates — Templates Lego (bridge_documents) ---

export function useTemplates() {
  const [templates, setTemplates] = useState<import("./types").TemplateInfo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listTemplates()
      .then((res) => {
        setTemplates(res.templates || []);
        setCategories(res.categories || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const previewTemplate = useCallback(async (alias: string) => {
    return api.previewTemplate(alias);
  }, []);

  const generateDocument = useCallback(async (data: import("./types").DocumentGenerateRequest) => {
    return api.generateDocument(data);
  }, []);

  return { templates, categories, total, loading, error, refresh, previewTemplate, generateDocument };
}


// --- useBureau — Projets, Documents, Outils (PostgreSQL) ---

export function useBureau(typeFilter?: "projet" | "document" | "outil") {
  const [items, setItems] = useState<BureauItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listBureauItems(typeFilter)
      .then((res) => {
        setItems(res.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [typeFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createItem = useCallback(async (data: BureauItemCreate) => {
    const item = await api.createBureauItem(data);
    setItems((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateItem = useCallback(async (id: number, data: BureauItemUpdate) => {
    const item = await api.updateBureauItem(id, data);
    setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
    return item;
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    await api.deleteBureauItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const uploadFile = useCallback(async (file: File, titre?: string) => {
    const item = await api.uploadBureauFile(file, titre);
    setItems((prev) => [item, ...prev]);
    return item;
  }, []);

  return { items, loading, error, refresh, createItem, updateItem, deleteItem, uploadFile };
}


// --- useTaches — Taches Plane.so ---

export function useTaches() {
  const [taches, setTaches] = useState<PlaneTache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTache, setSelectedTache] = useState<PlaneTacheDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listTaches()
      .then((res) => {
        setTaches(res.taches);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectTache = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getTache(id);
      setSelectedTache(detail);
    } catch (err) {
      setSelectedTache(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeTache = useCallback(() => {
    setSelectedTache(null);
  }, []);

  const createTache = useCallback(async (data: PlaneTacheCreate) => {
    const result = await api.createTache(data);
    refresh();
    return result;
  }, [refresh]);

  const completeTache = useCallback(async (id: string) => {
    await api.completeTache(id);
    setTaches((prev) => prev.filter((t) => t.id !== id));
    if (selectedTache?.id === id) setSelectedTache(null);
  }, [selectedTache]);

  const commentTache = useCallback(async (id: string, text: string) => {
    await api.commentTache(id, text);
    // Refresh detail if viewing this tache
    if (selectedTache?.id === id) {
      const detail = await api.getTache(id);
      setSelectedTache(detail);
    }
  }, [selectedTache]);

  return {
    taches, loading, error, refresh,
    selectedTache, loadingDetail, selectTache, closeTache,
    createTache, completeTache, commentTache,
  };
}


// ═══════════════════════════════════════════════════════════════
// Decision Log — Protocole Gouvernance CarlOS (D-098)
// ═══════════════════════════════════════════════════════════════

export function useDecisionLog(filters?: {
  bot_code?: string;
  type_decision?: string;
  section?: string;
}) {
  const [decisions, setDecisions] = useState<import("./types").DecisionLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.listDecisions({
        bot_code: filters?.bot_code,
        type_decision: filters?.type_decision,
        section: filters?.section,
        limit: 100,
      });
      setDecisions(res.decisions || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement decisions");
    } finally {
      setLoading(false);
    }
  }, [filters?.bot_code, filters?.type_decision, filters?.section]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDecision = useCallback(async (data: import("./types").DecisionLogCreate) => {
    const res = await api.createDecision(data);
    await refresh();
    return res.id;
  }, [refresh]);

  const reverseDecision = useCallback(async (id: number) => {
    await api.reverseDecision(id);
    await refresh();
  }, [refresh]);

  return {
    decisions, total, loading, error, refresh,
    createDecision, reverseDecision,
  };
}


// ═══════════════════════════════════════════════════════════════
// useTensions — D-100 (TENSION → MISSION → DÉCISION)
// ═══════════════════════════════════════════════════════════════

export function useTensions(filters?: {
  status?: string;
  type_vitaa?: string;
  intensite?: string;
}) {
  const [tensions, setTensions] = useState<import("./types").Tension[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.listTensions({
        status: filters?.status,
        type_vitaa: filters?.type_vitaa,
        intensite: filters?.intensite,
        limit: 100,
      });
      setTensions(res.tensions || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement tensions");
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.type_vitaa, filters?.intensite]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTension = useCallback(async (data: import("./types").TensionCreate) => {
    const res = await api.createTension(data);
    await refresh();
    return res;
  }, [refresh]);

  const classifyMessage = useCallback(async (message: string) => {
    return api.classifyTension(message);
  }, []);

  const resolveTension = useCallback(async (id: number) => {
    await api.resolveTension(id);
    await refresh();
  }, [refresh]);

  const launchMission = useCallback(async (id: number) => {
    const res = await api.launchMissionFromTension(id);
    await refresh();
    return res;
  }, [refresh]);

  return {
    tensions, total, loading, error, refresh,
    createTension, classifyMessage, resolveTension, launchMission,
  };
}

// ══════════════════════════════════════════════
// Flow GPS — progression par etapes pour sections ACTION
// ══════════════════════════════════════════════

// Configs par section ACTION (fallback si API pas disponible)
const FLOW_CONFIGS: Record<string, { steps: string[]; flowType: string }> = {
  "board-room": { steps: ["Accueil", "Ordre du jour", "Debat CA", "Vote", "Decisions"], flowType: "action" },
  "jumelage": { steps: ["Accueil", "Profil", "Matching", "Rencontre", "Suivi"], flowType: "action" },
  "strategique": { steps: ["Brief", "Analyse", "Modele", "Validation", "Livraison"], flowType: "action" },
  "scenarios": { steps: ["Contexte", "Hypotheses", "Simulation", "Resultats", "Decision"], flowType: "action" },
  "cellules": { steps: ["Objectif", "Membres", "Mandat", "Lancement"], flowType: "action" },
  "pipeline": { steps: ["Prospect", "Qualification", "Proposition", "Negociation", "Cloture"], flowType: "action" },
};

const ACTION_SECTIONS = new Set(Object.keys(FLOW_CONFIGS));

export function useFlowGPS(sectionKey: string) {
  const isAction = ACTION_SECTIONS.has(sectionKey);
  const localConfig = FLOW_CONFIGS[sectionKey];

  const [steps, setSteps] = useState<string[]>(localConfig?.steps || []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Try to fetch from API on mount
  useEffect(() => {
    if (!isAction) return;
    api.flowGetStep(sectionKey)
      .then((data) => {
        setCurrentStepIndex(data.step_index);
        setCompleted(data.completed);
      })
      .catch(() => { /* API not available, use local state */ });

    api.flowGetConfig(sectionKey)
      .then((data) => {
        if (data.steps?.length) setSteps(data.steps);
      })
      .catch(() => { /* fallback to FLOW_CONFIGS */ });
  }, [sectionKey, isAction]);

  const advance = useCallback(async () => {
    if (completed || loading) return;
    setLoading(true);
    try {
      const data = await api.flowAdvance(sectionKey);
      setCurrentStepIndex(data.step_index);
      setCompleted(data.completed);
    } catch {
      // Fallback: local advance
      setCurrentStepIndex((prev) => {
        const next = Math.min(prev + 1, steps.length - 1);
        if (next >= steps.length - 1) setCompleted(true);
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [sectionKey, completed, loading, steps.length]);

  const reset = useCallback(async () => {
    setLoading(true);
    try {
      await api.flowReset(sectionKey);
    } catch { /* fallback */ }
    setCurrentStepIndex(0);
    setCompleted(false);
    setLoading(false);
  }, [sectionKey]);

  const refreshStep = useCallback(async () => {
    try {
      const data = await api.flowGetStep(sectionKey);
      setCurrentStepIndex(data.step_index);
      setCompleted(data.completed);
    } catch { /* ignore */ }
  }, [sectionKey]);

  return {
    steps,
    currentStep: steps[currentStepIndex] || "",
    currentStepIndex,
    totalSteps: steps.length,
    progressPct: steps.length > 0 ? Math.round((currentStepIndex / (steps.length - 1)) * 100) : 0,
    isAction,
    completed,
    loading,
    advance,
    reset,
    refreshStep,
  };
}

// ══════════════════════════════════════════════
// Chantiers & Missions hooks
// ══════════════════════════════════════════════

export function useChantiers() {
  const [chantiers, setChantiers] = useState<import("./types").Chantier[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listChantiers();
      // Trier: brule → couve → meurt
      const order: Record<string, number> = { brule: 0, couve: 1, meurt: 2 };
      setChantiers((data.chantiers || []).sort((a, b) => (order[a.chaleur] ?? 3) - (order[b.chaleur] ?? 3)));
    } catch {
      setChantiers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (titre: string, chaleur: string = "couve") => {
    const ch = await api.createChantier({ titre, chaleur });
    await refresh();
    return ch;
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await api.deleteChantier(id);
    await refresh();
  }, [refresh]);

  return { chantiers, loading, refresh, create, remove };
}

// ══════════════════════════════════════════════
// useProjets — CRUD projets (Espace Unifié)
// ══════════════════════════════════════════════

export function useProjets(chantierId?: number) {
  const [projets, setProjets] = useState<import("./types").Projet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listProjets(chantierId);
      setProjets(Array.isArray(data) ? data : []);
    } catch {
      setProjets([]);
    } finally {
      setLoading(false);
    }
  }, [chantierId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data: import("./types").ProjetCreate) => {
    const result = await api.createProjet({ ...data, chantier_id: data.chantier_id ?? chantierId });
    await refresh();
    return result;
  }, [chantierId, refresh]);

  const remove = useCallback(async (id: number) => {
    await api.deleteProjet(id);
    await refresh();
  }, [refresh]);

  return { projets, loading, refresh, create, remove };
}

// ══════════════════════════════════════════════
// useIdees — CRUD idees (migration Crystals → DB)
// ══════════════════════════════════════════════

export function useIdees(filters?: { chantier_id?: number; projet_id?: number; mission_id?: number }) {
  const [idees, setIdees] = useState<import("./types").Idee[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listIdees(filters);
      setIdees(Array.isArray(data) ? data : []);
    } catch {
      setIdees([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.chantier_id, filters?.projet_id, filters?.mission_id]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data: import("./types").IdeeCreate) => {
    const result = await api.createIdee(data);
    await refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await api.deleteIdee(id);
    await refresh();
  }, [refresh]);

  return { idees, loading, refresh, create, remove };
}

export function useMissions(chantierId?: number, projetId?: number) {
  const [missions, setMissions] = useState<import("./types").Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listMissions(chantierId, projetId);
      setMissions(data.missions || []);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [chantierId, projetId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (titre: string, botPrimaire?: string) => {
    const m = await api.createMission({ titre, chantier_id: chantierId, projet_id: projetId, bot_primaire: botPrimaire });
    await refresh();
    return m;
  }, [chantierId, projetId, refresh]);

  const remove = useCallback(async (id: number) => {
    await api.deleteMission(id);
    await refresh();
  }, [refresh]);

  return { missions, loading, refresh, create, remove };
}

// ══════════════════════════════════════════════
// useTachesUser — 4e niveau GHML
// ══════════════════════════════════════════════

export function useTachesUser(filters?: { mission_id?: number; projet_id?: number; chantier_id?: number; status?: string }) {
  const [taches, setTaches] = useState<import("./types").TacheUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTachesUser(filters);
      setTaches(Array.isArray(data) ? data : []);
    } catch {
      setTaches([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.mission_id, filters?.projet_id, filters?.chantier_id, filters?.status]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data: Partial<import("./types").TacheUser>) => {
    const result = await api.createTacheUser(data);
    await refresh();
    return result;
  }, [refresh]);

  const complete = useCallback(async (id: number) => {
    await api.completeTacheUser(id);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await api.deleteTacheUser(id);
    await refresh();
  }, [refresh]);

  return { taches, loading, refresh, create, complete, remove };
}

// ══════════════════════════════════════════════
// useDiscussions — persistance metadonnees discussions
// ══════════════════════════════════════════════

export function useDiscussions(status?: string) {
  const [discussions, setDiscussions] = useState<import("./types").Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listDiscussions(status);
      setDiscussions(Array.isArray(data) ? data : []);
    } catch {
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (externalId: string, titre?: string, botPrimaire?: string) => {
    const result = await api.createDiscussion({
      external_id: externalId,
      titre: titre || "Discussion sans titre",
      bot_primaire: botPrimaire,
    });
    await refresh();
    return result;
  }, [refresh]);

  const promote = useCallback(async (discussionId: number, titreMission?: string) => {
    const result = await api.promoteDiscussion(discussionId, titreMission);
    await refresh();
    return result;
  }, [refresh]);

  const archive = useCallback(async (discussionId: number) => {
    await api.archiveDiscussion(discussionId);
    await refresh();
  }, [refresh]);

  return { discussions, loading, refresh, create, promote, archive };
}

// ══════════════════════════════════════════════
// useMergedDiscussions — fusionne threads (localStorage) + discussions (DB)
// ══════════════════════════════════════════════

export interface MergedDiscussion {
  thread: Thread;
  dbDiscussion: Discussion | null;
  discussionType: DiscussionTypeId;
  chantier_id: number | null;
  projet_id: number | null;
  mission_id: number | null;
}

export function useMergedDiscussions(threads: Thread[]) {
  const { discussions, loading, archive } = useDiscussions();

  const merged = useMemo(() => {
    const dbMap = new Map<string, Discussion>();
    discussions.forEach(d => dbMap.set(d.external_id, d));

    return threads.map((thread): MergedDiscussion => {
      const db = dbMap.get(thread.id) || null;
      return {
        thread,
        dbDiscussion: db,
        discussionType: classifyThread(thread),
        chantier_id: db?.contexte?.chantier_id as number | null ?? null,
        projet_id: db?.contexte?.projet_id as number | null ?? null,
        mission_id: db?.mission_id ?? null,
      };
    });
  }, [threads, discussions]);

  return { merged, loading, archive };
}

// ══════════════════════════════════════════════
// useCommandMission — BLOC 1 : polling COMMAND status
// ══════════════════════════════════════════════

export function useCommandMission(missionId: number | null) {
  const [status, setStatus] = useState<import("./types").CommandStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(() => {
    if (!missionId) return;
    setLoading(true);

    const poll = async () => {
      try {
        const data = await api.commandStatus(missionId);
        setStatus(data);
        if (data.completed || data.error) {
          // Stop polling once complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    poll(); // immediate first poll
    intervalRef.current = setInterval(poll, 3000);
  }, [missionId]);

  // Auto-start polling when missionId changes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (missionId) {
      startPolling();
    } else {
      setStatus(null);
      setLoading(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [missionId, startPolling]);

  const launch = useCallback(async (message: string, urgency = "routine") => {
    const res = await api.commandStart(message, urgency);
    return res.mission_id;
  }, []);

  return { status, loading, launch };
}


// ══════════════════════════════════════════════
// useModeBranch — BLOC 2 : fork mode autonome
// ══════════════════════════════════════════════

export function useModeBranch() {
  const [activeBranch, setActiveBranch] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if there's an active branch on mount
  useEffect(() => {
    api.flowBranchStatus(1)
      .then((data) => {
        if (data.has_active_branch && data.branch) {
          setActiveBranch(data.branch);
        }
      })
      .catch(() => {});
  }, []);

  const branch = useCallback(async (mode: string, credoPhase?: string, credoSection?: string) => {
    setLoading(true);
    try {
      const res = await api.flowBranch({ mode, user_id: 1, credo_phase: credoPhase, credo_section: credoSection });
      if (res.ok) setActiveBranch(res.branch);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const advance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.flowBranchAdvance(1);
      if (res.completed) {
        setActiveBranch(null);
      } else if (res.branch) {
        setActiveBranch(res.branch);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(async () => {
    setLoading(true);
    try {
      await api.flowBranchComplete(1);
      setActiveBranch(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    setLoading(true);
    try {
      await api.flowBranchCancel(1);
      setActiveBranch(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { activeBranch, loading, branch, advance, complete, cancel };
}


// ══════════════════════════════════════════════
// useBriefings — BLOC 3 : briefings compiles
// ══════════════════════════════════════════════

export function useBriefings() {
  const [briefings, setBriefings] = useState<import("./types").Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listBriefings();
      setBriefings(res.briefings || []);
    } catch {
      setBriefings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const compileDaily = useCallback(async () => {
    setCompiling(true);
    try {
      const res = await api.compileDaily();
      await refresh();
      return res;
    } finally {
      setCompiling(false);
    }
  }, [refresh]);

  const compileBoardMeeting = useCallback(async () => {
    setCompiling(true);
    try {
      const res = await api.compileBoardMeeting();
      await refresh();
      return res;
    } finally {
      setCompiling(false);
    }
  }, [refresh]);

  return { briefings, loading, compiling, refresh, compileDaily, compileBoardMeeting };
}


// ══════════════════════════════════════════════
// useSuggestions — BLOC 4 : suggestions proactives
// ══════════════════════════════════════════════

export function useSuggestions(botCode?: string) {
  const [data, setData] = useState<import("./types").SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.suggestions(1, botCode || undefined)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [botCode]);

  return { data, loading };
}


// ══════════════════════════════════════════════
// useQuestionnaire — BLOC 6 : questionnaire diagnostic
// ══════════════════════════════════════════════

export function useQuestionnaire() {
  const [inSession, setInSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const start = useCallback(async (clientSlug?: string) => {
    setLoading(true);
    try {
      const texte = clientSlug || "";
      const res = await api.questionnaire("/questionnaire", texte);
      setLastResponse(res.reponse);
      setInSession(res.en_session);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const answer = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const res = await api.questionnaire("/questionnaire", text);
      setLastResponse(res.reponse);
      setInSession(res.en_session);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  return { inSession, loading, lastResponse, start, answer };
}


// ══════════════════════════════════════════════
// useCahierPdf — BLOC 5 : generation + download cahier
// ══════════════════════════════════════════════

export function useCahierPdf() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<import("./types").CahierStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = useCallback(async (clientSlug: string) => {
    setLoading(true);
    try {
      const res = await api.startCahier({ client_slug: clientSlug });
      setJobId(res.job_id);
      return res.job_id;
    } catch {
      setLoading(false);
      return null;
    }
  }, []);

  // Poll status when jobId is set
  useEffect(() => {
    if (!jobId) return;
    const poll = async () => {
      try {
        const s = await api.getCahierStatus(jobId);
        setStatus(s);
        if (s.status === "ready" || s.status === "error") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [jobId]);

  const downloadUrl = jobId ? api.cahierDownloadUrl(jobId) : null;

  return { jobId, status, loading, generate, downloadUrl };
}

// ══════════════════════════════════════════════
// useDiagnostic — GET/POST /diagnostic
// ══════════════════════════════════════════════

export function useDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<import("./types").DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (clientSlug = "usine-bleue") => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDiagnostic(clientSlug);
      setDiagnostic(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur diagnostic");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (clientSlug = "usine-bleue", type = "express") => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createDiagnostic({ client_slug: clientSlug, type });
      setDiagnostic(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur creation diagnostic");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { diagnostic, loading, error, fetch, create };
}

// ══════════════════════════════════════════════
// useCalendar — GET/POST /calendar/*
// ══════════════════════════════════════════════

export function useCalendar() {
  const [events, setEvents] = useState<import("./types").CalendarEvent[]>([]);
  const [slots, setSlots] = useState<import("./types").CalendarFreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.calendarToday();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calendrier indisponible");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFree = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const data = await api.calendarFree(date);
      setSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur creneaux");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (req: import("./types").CalendarCreateRequest) => {
    setLoading(true);
    try {
      const ev = await api.calendarCreate(req);
      setEvents(prev => [...prev, ev]);
      return ev;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur creation evenement");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, slots, loading, error, fetchToday, fetchFree, create };
}

// ══════════════════════════════════════════════
// usePhone — phone outbound + active room + SMS
// ══════════════════════════════════════════════

export function usePhone() {
  const [activeRoom, setActiveRoom] = useState<import("./types").PhoneActiveRoomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkActiveRoom = useCallback(async () => {
    try {
      const data = await api.phoneActiveRoom();
      setActiveRoom(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur telephone");
      return null;
    }
  }, []);

  const callOutbound = useCallback(async (to: string, botCode = "CEOB") => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.phoneOutbound({ to, bot_code: botCode });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur appel sortant");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendSms = useCallback(async (to: string, body: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.smsSend({ to, body });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur SMS");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { activeRoom, loading, error, checkActiveRoom, callOutbound, sendSms };
}

// ══════════════════════════════════════════════
// useOrbit9Qualification — GET/POST /orbit9/qualification/{id}
// ══════════════════════════════════════════════

export function useOrbit9Qualification(memberId: number | null) {
  const [state, setState] = useState<import("./types").QualificationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.orbit9QualificationGet(memberId);
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur qualification");
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    if (memberId) fetch();
  }, [memberId, fetch]);

  const advance = useCallback(async () => {
    if (!memberId) return null;
    setLoading(true);
    try {
      const data = await api.orbit9QualificationAdvance(memberId);
      setState(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur avancement");
      return null;
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  return { state, loading, error, fetch, advance };
}

// ══════════════════════════════════════════════
// useCommandDetect — POST /command/detect
// ══════════════════════════════════════════════

export function useCommandDetect() {
  const [result, setResult] = useState<import("./types").CommandDetectResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const detect = useCallback(async (message: string) => {
    setLoading(true);
    try {
      const data = await api.commandDetect(message);
      setResult(data);
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, detect };
}


// ══════════════════════════════════════════════
// useDocForge — DocForge Bibliothèque Intelligente
// ══════════════════════════════════════════════

export function useDocForge() {
  const [libraries, setLibraries] = useState<import("./types").DocForgeLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getDocForgeLibraries()
      .then((res) => {
        setLibraries(res.libraries || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLibrary = useCallback(async (data: { titre: string; template_alias?: string; description?: string; tags?: string[] }) => {
    const res = await api.createDocForgeLibrary(data);
    refresh();
    return res;
  }, [refresh]);

  const deleteLibrary = useCallback(async (id: number) => {
    await api.deleteDocForgeLibrary(id);
    setLibraries((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { libraries, loading, error, refresh, createLibrary, deleteLibrary };
}

// --- useUnifiedTemplates — DocForge V4: merge 3 template sources, functional categories ---

const DEPT_MAP: Record<string, string> = {
  "CEO": "CEOB", "CTO": "CTOB", "CFO": "CFOB", "CMO": "CMOB",
  "CSO": "CSOB", "COO": "COOB", "FACTORY": "CPOB", "INTERNE-UB": "CEOB",
  "CHRO": "CHROB", "CINO": "CINOB", "CRO": "CROB", "CLO": "CLOB", "CISO": "CISOB",
};

export const DEPT_LABELS: Record<string, string> = {
  "CEOB": "CarlOS", "CTOB": "Tim", "CFOB": "Frank",
  "CMOB": "Mathilde", "CSOB": "Simone", "COOB": "Olivier",
  "CPOB": "Paco", "CHROB": "Helene", "CINOB": "Ines",
  "CROB": "Rich", "CLOB": "Loulou", "CISOB": "Sebastien",
};

/** Deduit une categorie fonctionnelle a partir du nom/titre du template */
function inferCategorieFonctionnelle(nom: string): string {
  const n = nom.toLowerCase();
  if (n.includes("plan")) return "plan";
  if (n.includes("analyse") || n.includes("diagnostic")) return "analyse";
  if (n.includes("rapport") || n.includes("bilan")) return "rapport";
  if (n.includes("audit")) return "audit";
  if (n.includes("politique") || n.includes("regle")) return "politique";
  if (n.includes("contrat") || n.includes("entente")) return "contrat";
  if (n.includes("cahier") || n.includes("guide") || n.includes("manuel")) return "guide";
  if (n.includes("registre") || n.includes("tableau")) return "registre";
  if (n.includes("formulaire") || n.includes("fiche")) return "formulaire";
  if (n.includes("decision") || n.includes("reunion")) return "rapport";
  if (n.includes("budget") || n.includes("prevision") || n.includes("financ")) return "budget";
  if (n.includes("strateg")) return "strategie";
  if (n.includes("inventaire")) return "registre";
  if (n.includes("programme") || n.includes("calendrier")) return "plan";
  return "document";
}

export function useUnifiedTemplates() {
  const [templates, setTemplates] = useState<import("./types").UnifiedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [departements, setDepartements] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.listTemplates().catch(() => ({ templates: [], categories: [], total: 0 })),
      api.listTemplatesDocumentaires().catch(() => []),
      api.docForgeTemplatesV2().catch(() => ({ templates: [], count: 0 })),
    ]).then(([legoRes, blueprintList, docforgeRes]) => {
      const unified: import("./types").UnifiedTemplate[] = [];

      // 1. Lego templates (72) — categorie = department code → remap to functional
      for (const t of (legoRes.templates || [])) {
        unified.push({
          id: t.alias,
          alias: t.alias,
          titre: t.nom,
          categorie: inferCategorieFonctionnelle(t.nom),
          departement: DEPT_MAP[t.categorie] || "CPOB",
          source: "lego",
          bot_recommande: DEPT_MAP[t.categorie] || "CPOB",
          chemin: t.chemin,
        });
      }

      // 2. Blueprint templates (141)
      for (const t of (blueprintList || [])) {
        unified.push({
          id: t.id,
          alias: t.id,
          titre: t.titre,
          description: t.description,
          categorie: inferCategorieFonctionnelle(t.titre),
          departement: t.departement,
          source: "blueprint",
          bot_recommande: t.departement || "CPOB",
          nb_sections: t.sections?.length || 0,
          sections: t.sections,
          pages_estimees: t.pages_estimees,
          frequence: t.frequence,
          niveau_hierarchie: t.niveau_hierarchie,
          tags: t.tags,
          documents_lies: t.documents_lies,
          source_donnees: t.source_donnees,
        });
      }

      // 3. DocForge templates (8) — categorie fonctionnelle, pas "DocForge"
      for (const t of (docforgeRes.templates || [])) {
        unified.push({
          id: `df-${t.id}`,
          alias: t.alias,
          titre: t.titre,
          description: t.description,
          categorie: inferCategorieFonctionnelle(t.titre),
          departement: t.bot_recommande,
          source: "docforge",
          bot_recommande: t.bot_recommande || "CPOB",
          nb_sections: t.nb_sections,
          keywords: t.keywords,
          mega_prompt: t.mega_prompt,
          sections: t.sections,
        });
      }

      setTemplates(unified);

      // Extract unique categories and departements
      const cats = [...new Set(unified.map(t => t.categorie).filter(Boolean))];
      const depts = [...new Set(unified.map(t => t.departement).filter(Boolean) as string[])];
      setCategories(cats.sort());
      setDepartements(depts.sort());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { templates, categories, departements, loading, refresh, deptLabels: DEPT_LABELS };
}

// --- useUnifiedCatalogue — Combine templates + playbooks + diagnostics en 1 source ---

export type CatalogueItemType = "template" | "playbook" | "diagnostic";

export interface UnifiedCatalogueItem {
  id: string;
  titre: string;
  description?: string;
  type: CatalogueItemType;
  categorie?: string;
  departement?: string;
  bot_recommande?: string;
  bots?: string[];
  sections?: unknown[];
  nb_sections?: number;
  pages_estimees?: number;
  nb_questions?: number;
  nb_projets?: number;
  nb_missions?: number;
  niveau?: string;
  duree_minutes?: number;
  frequence?: string;
  populaire?: boolean;
  // Payload original pour l'action au clic
  _raw: unknown;
}

export function useUnifiedCatalogue(deptFilter?: string) {
  const [items, setItems] = useState<UnifiedCatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const deptQs = deptFilter ? `?departement=${deptFilter}` : "";
    Promise.all([
      api.listTemplatesDocumentaires().catch(() => []),
      api.listPlaybooks().catch(() => []),
      api.listDiagnosticsEnrichis(deptFilter).catch(() => []),
    ]).then(([templates, playbooks, diagnostics]) => {
      const unified: UnifiedCatalogueItem[] = [];

      // Templates documentaires (141+)
      for (const t of (templates || []) as any[]) {
        unified.push({
          id: `tpl-${t.id}`,
          titre: t.titre,
          description: t.description,
          type: "template",
          categorie: t.categorie,
          departement: t.departement,
          bot_recommande: t.departement,
          sections: t.sections,
          nb_sections: t.sections?.length,
          pages_estimees: t.pages_estimees,
          frequence: t.frequence,
          _raw: t,
        });
      }

      // Playbooks (29)
      for (const p of (playbooks || []) as any[]) {
        unified.push({
          id: `pb-${p.id}`,
          titre: p.titre || p.nom,
          description: p.description,
          type: "playbook",
          categorie: p.categorie,
          departement: p.departement,
          bots: p.bots,
          nb_projets: p.nb_projets,
          nb_missions: p.nb_missions,
          niveau: p.niveau,
          populaire: p.populaire,
          _raw: p,
        });
      }

      // Diagnostics enrichis (43)
      for (const d of (diagnostics || []) as any[]) {
        unified.push({
          id: `diag-${d.id}`,
          titre: d.titre || d.nom,
          description: d.description,
          type: "diagnostic",
          categorie: d.categorie,
          departement: d.departement,
          bot_recommande: d.bot_primaire,
          nb_questions: d.nb_questions,
          duree_minutes: d.duree_minutes,
          _raw: d,
        });
      }

      // Filter by department if needed
      const result = deptFilter
        ? unified.filter(i => !i.departement || i.departement === deptFilter || (i.bots && i.bots.includes(deptFilter)))
        : unified;

      setItems(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [deptFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, refresh };
}

export function useDocForgeLibrary(libraryId: number | null) {
  const [library, setLibrary] = useState<import("./types").DocForgeLibrary | null>(null);
  const [blocks, setBlocks] = useState<import("./types").DocForgeBlock[]>([]);
  const [facts, setFacts] = useState<import("./types").DocForgeFact[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!libraryId) return;
    setLoading(true);
    try {
      const [lib, blk, fct] = await Promise.all([
        api.getDocForgeLibrary(libraryId),
        api.docForgeBlocks(libraryId),
        api.docForgeFacts(libraryId),
      ]);
      setLibrary(lib);
      setBlocks(blk.blocks || []);
      setFacts(fct.facts || []);
    } catch (err) {
      console.error("useDocForgeLibrary:", err);
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approveBlock = useCallback(async (blockId: number) => {
    await api.docForgeBlockApprove(blockId);
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, status: "approuve" } : b));
  }, []);

  const rejectBlock = useCallback(async (blockId: number) => {
    await api.docForgeBlockReject(blockId);
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, status: "rejete" } : b));
  }, []);

  const resolveFact = useCallback(async (factId: number, valeur: string) => {
    await api.docForgeFactResolve(factId, valeur);
    setFacts((prev) => prev.map((f) => f.id === factId ? { ...f, status: "confirme", valeur_resolue: valeur } : f));
  }, []);

  const process = useCallback(async (overrideId?: number) => {
    const id = overrideId || libraryId;
    if (!id) return;
    await api.docForgeProcess(id);
  }, [libraryId]);

  const ingestText = useCallback(async (texte: string, titre?: string) => {
    if (!libraryId) return;
    await api.docForgeIngestText(libraryId, texte, titre);
    refresh();
  }, [libraryId, refresh]);

  const ingestDrive = useCallback(async (folderId: string) => {
    if (!libraryId) return;
    await api.docForgeIngestDrive(libraryId, folderId);
  }, [libraryId]);

  return { library, blocks, facts, loading, refresh, approveBlock, rejectBlock, resolveFact, process, ingestText, ingestDrive };
}

// ═══════════════════════════════════════
// D2 — Approvals
// ═══════════════════════════════════════

export function useApprovals(status: string = "pending") {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getApprovals(status);
      setApprovals(res.approvals || []);
    } catch (err) {
      console.error("useApprovals:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approve = useCallback(async (approvalId: number, note: string = "") => {
    await api.approveAction(approvalId, note);
    setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
  }, []);

  const reject = useCallback(async (approvalId: number, note: string = "") => {
    await api.rejectAction(approvalId, note);
    setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
  }, []);

  return { approvals, loading, refresh, approve, reject };
}

// ═══════════════════════════════════════
// D3 — Notifications
// ═══════════════════════════════════════

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [res, countRes] = await Promise.all([
        api.getNotifications(),
        api.getNotificationCount(),
      ]);
      setNotifications(res.notifications || []);
      setUnreadCount(countRes.count || 0);
    } catch (err) {
      console.error("useNotifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't poll without a valid JWT — prevents 401 loop
    const jwt = localStorage.getItem("ghostx-jwt");
    if (!jwt) return;
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markRead = useCallback(async (notifId: number) => {
    await api.markNotificationRead(notifId);
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, lu: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}

// ═══════════════════════════════════════
// D3 — Standing Orders
// ═══════════════════════════════════════

export function useStandingOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getStandingOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error("useStandingOrders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data: {
    bot_code: string;
    type_ordre: string;
    config?: Record<string, unknown>;
    schedule?: Record<string, unknown>;
  }) => {
    const res = await api.createStandingOrder(data);
    refresh();
    return res.id;
  }, [refresh]);

  const pause = useCallback(async (orderId: number) => {
    await api.pauseStandingOrder(orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "pause" } : o));
  }, []);

  const resume = useCallback(async (orderId: number) => {
    await api.resumeStandingOrder(orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "actif" } : o));
  }, []);

  const remove = useCallback(async (orderId: number) => {
    await api.deleteStandingOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const pauseAll = useCallback(async () => {
    await api.pauseAllStandingOrders();
    setOrders((prev) => prev.map((o) => ({ ...o, status: "pause" })));
  }, []);

  return { orders, loading, refresh, create, pause, resume, remove, pauseAll };
}
