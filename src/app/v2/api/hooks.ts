/**
 * hooks.ts — React hooks pour l'API GhostX
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "./types";

// Options contextuelles par defaut — arbre de developpement de la pensee (wireframe p.3)
const DEFAULT_OPTIONS_BY_AGENT: Record<string, string[]> = {
  CEOB: [
    "Approfondir cette idee",
    "Voir les implications financieres",
    "Quelles sont les prochaines etapes?",
    "Challenger cette approche",
  ],
  CTOB: [
    "Details techniques",
    "Options d'integration",
    "Risques et mitigation",
    "Timeline de mise en oeuvre",
  ],
  CFOB: [
    "Analyse de ROI",
    "Scenarios budgetaires",
    "Sources de financement",
    "Impact sur le cash flow",
  ],
  CMOB: [
    "Strategie de contenu",
    "Ciblage et personas",
    "KPIs et mesure",
    "Plan d'execution",
  ],
  CSOB: [
    "Analyse concurrentielle",
    "Opportunites de marche",
    "Plan d'action strategique",
    "Risques et contingences",
  ],
  COOB: [
    "Optimisation du process",
    "Ressources necessaires",
    "Indicateurs de performance",
    "Plan d'amelioration continue",
  ],
};
const FALLBACK_OPTIONS = [
  "Approfondir ce sujet",
  "Explorer une autre piste",
  "Quelles sont les options?",
  "Passer a l'action",
];

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
    maxExchanges: 6,
  },
  debat: {
    options: ["Argument pour", "Argument contre", "Trouver un compromis", "Verdict final"],
    coachingIntro: "",
    coachingConverge: "Les arguments sont clairs des 2 cotes. On passe au verdict?",
    synthesisPrompt: "Synthetise le debat: Position A (arguments + forces), Position B (arguments + forces), Verdict (quelle position est la plus solide et pourquoi), Decision recommandee.",
    autoConsultBots: ["CFOB", "CSOB"],
    maxExchanges: 8,
  },
  brainstorm: {
    options: ["Plus d'idees!", "Combiner 2 idees", "Idee folle", "Assez — on trie"],
    coachingIntro: "",
    coachingConverge: "On a assez d'idees. On passe au tri?",
    synthesisPrompt: "Classe les idees par potentiel (fort/moyen/faible). Top 3 idees avec justification. Prochaine etape pour chaque top idee.",
    autoConsultBots: ["CMOB", "CTOB"],
    maxExchanges: 5,
  },
  crise: {
    options: ["Impact immediat?", "Qui est affecte?", "Plan B", "Action dans les 30 min"],
    coachingIntro: "",
    coachingConverge: "Situation evaluee. On passe au plan d'action immediat?",
    synthesisPrompt: "Plan de crise: (1) Severite 1-10, (2) Actions immediates (30 min), (3) Communication a faire, (4) Responsable de chaque action, (5) Suivi dans 24h.",
    autoConsultBots: ["COOB"],
    maxExchanges: 4,
  },
  analyse: {
    options: ["Cause racine?", "Donnees manquantes", "Comparer avec un benchmark", "Conclusions?"],
    coachingIntro: "",
    coachingConverge: "L'analyse est solide. On formule les conclusions?",
    synthesisPrompt: "Analyse structuree: (1) Probleme decompose, (2) Causes racines identifiees, (3) Donnees cles, (4) Conclusions, (5) Recommandations actionnables.",
    autoConsultBots: ["CTOB", "CFOB"],
    maxExchanges: 6,
  },
  decision: {
    options: ["Quels criteres?", "Risques de chaque option", "Comparer Go vs No-Go", "Ma decision"],
    coachingIntro: "",
    coachingConverge: "Les options sont evaluees. Pret a trancher?",
    synthesisPrompt: "Matrice de decision: Options evaluees (criteres, risques, potentiel). Recommandation avec niveau de confiance. Conditions de succes du Go. Plan B si No-Go.",
    autoConsultBots: ["CFOB", "CSOB"],
    maxExchanges: 5,
  },
  strategie: {
    options: ["Forces et faiblesses", "Opportunites du marche", "Menaces a anticiper", "Plan d'execution"],
    coachingIntro: "",
    coachingConverge: "La strategie se dessine. On formalise le plan?",
    synthesisPrompt: "Plan strategique: (1) Forces et faiblesses, (2) 3 axes prioritaires, (3) Quick wins (30 jours), (4) Moyen terme (90 jours), (5) Indicateurs de succes.",
    autoConsultBots: ["CSOB", "CFOB"],
    maxExchanges: 7,
  },
  innovation: {
    options: ["Technique disruptive?", "Qui fait ca ailleurs?", "Prototype minimal", "Potentiel marche"],
    coachingIntro: "",
    coachingConverge: "On a identifie des pistes. On selectionne la plus prometteuse?",
    synthesisPrompt: "Innovation brief: (1) Opportunite identifiee, (2) Solution proposee, (3) Differenciateur cle, (4) Premier prototype (description), (5) Marche potentiel, (6) Prochaine etape concrete.",
    autoConsultBots: ["CTOB", "CMOB"],
    maxExchanges: 6,
  },
  deep: {
    options: ["Creuse plus profond", "Lien inattendu?", "Analogie avec un autre domaine", "Insight a retenir"],
    coachingIntro: "",
    coachingConverge: "Des insights profonds emergent. On cristallise?",
    synthesisPrompt: "Insights: (1) Ce qui n'etait pas evident, (2) Connexions inattendues, (3) Question que personne ne posait, (4) Recommandation contre-intuitive, (5) Ce que ca change pour la suite.",
    autoConsultBots: ["CSOB"],
    maxExchanges: 5,
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

  for (const line of lines) {
    const trimmed = line.trim();
    // Detect Telegram-style options: 📌 1 · Option A | 2 · Option B | 3 · Option C
    if (/^\p{Emoji}?\s*1\s*[·.]\s*/u.test(trimmed) && /\|/.test(trimmed)) {
      const parts = trimmed.split(/\s*\|\s*/);
      for (const part of parts) {
        const cleaned = part.replace(/^\p{Emoji}?\s*\d+\s*[·.]\s*/u, "").trim();
        if (cleaned) parsedOptions.push(cleaned);
      }
    } else {
      cleanLines.push(line);
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
  const [threads, setThreads] = useState<Thread[]>(() => loadThreads());
  const [activeThreadId, setActiveThreadIdRaw] = useState<string | null>(() => loadActiveThreadId());
  // Roster de bots actifs — max 3, CarlOS en défaut
  const [activeRoster, setActiveRoster] = useState<string[]>(["CEOB"]);
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

  // Persist threads to localStorage
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

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
      meta?: { msgType?: MessageType; parentId?: string; branchLabel?: string; activeView?: string; activeSubSection?: string }
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
      }

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
      try {
        await new Promise<void>((resolve, reject) => {
          const controller = api.chatStream(req, {
            onToken: (_chunk: string, accumulated: string) => {
              // Update the bot message content progressively
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, content: accumulated } : m
                )
              );
            },
            onDone: (data: StreamDoneEvent) => {
              // Final update with all metadata
              let cleanText = data.response;
              let parsedOptions: string[] = [];

              if (data.options && data.options.length > 0) {
                parsedOptions = data.options.map((o) => o.label);
              } else {
                const parsed = parseApiOptions(data.response);
                cleanText = parsed.cleanText;
                parsedOptions = parsed.parsedOptions;
              }

              const agentOptions = DEFAULT_OPTIONS_BY_AGENT[agent || "CEOB"];
              const options = parsedOptions.length > 0
                ? parsedOptions
                : msgType === "synthesis"
                  ? ["Cristalliser le resultat", "Passer au Cahier SMART", "Continuer l'exploration"]
                  : modeConf.options.length > 0 ? modeConf.options : (agentOptions || FALLBACK_OPTIONS);

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
                        agent: data.agent,
                        ghost: data.ghost_actif,
                        tier: data.tier,
                        latence_ms: data.latence_ms,
                        options,
                        isStreaming: false,
                        canvasActions: visibleActions.length > 0 ? visibleActions : undefined,
                        isDiagnostic: data.is_diagnostic || false,
                        bubbleContext: data.bubble_context || undefined,
                        cascadeSuggestions: data.cascade_suggestions?.length ? data.cascade_suggestions : undefined,
                        scaffoldProgress: data.scaffold_progress || undefined,
                      }
                    : m
                )
              );

              streamingMsgId.current = null;

              // Canvas Actions — dispatch vers le bus
              if (data.canvas_actions && data.canvas_actions.length > 0 && canvasActionsCallbackRef.current) {
                canvasActionsCallbackRef.current(data.canvas_actions);
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

                if (modeConf.autoConsultBots.length > 0 && msgType === "normal") {
                  const firstAutoBot = modeConf.autoConsultBots[0];
                  if (firstAutoBot && firstAutoBot !== agent) {
                    setTimeout(async () => {
                      try {
                        const autoReq: ChatRequest = { message: text, user_id: 1, agent: firstAutoBot, mode: mode || undefined, direct: true };
                        const autoRes = await api.chat(autoReq);
                        const autoMsg: ChatMessage = {
                          id: `msg-${++idCounter.current}`,
                          role: "assistant",
                          content: autoRes.response,
                          timestamp: new Date(),
                          agent: autoRes.agent,
                          ghost: autoRes.ghost_actif,
                          tier: autoRes.tier,
                          latence_ms: autoRes.latence_ms,
                          options: modeConf.options,
                          msgType: "consultation",
                          branchLabel: `Auto-consultation — ${firstAutoBot}`,
                          branchDepth: 1,
                        };
                        setMessages((prev) => [...prev, autoMsg]);
                      } catch { /* silent fail on auto-consult */ }
                    }, 1500);
                  }
                }
              } else if (botCount >= modeConf.maxExchanges) {
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

              if (!data.sentinel_alert && userMsgs.length >= 3 && msgType === "normal") {
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

              // Phase 2B — Nudge "en faire une mission?" apres 5+ messages user sans mission liee
              const currentThread = threads.find((t) => t.id === activeThreadId);
              if (
                userMsgs.length >= 5 &&
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
                userMsgs.length >= 10 &&
                !currentThread?.missionId &&
                missionNudgeShownAt.current > 0 &&
                missionNudgeShownAt.current <= 5
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
              reject(new Error(error));
            },
          });
          streamAbort.current = controller;
        });
      } catch (err) {
        // Streaming failed — fallback to standard chat
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

          const agentOptions = DEFAULT_OPTIONS_BY_AGENT[agent || "CEOB"];
          const options = parsedOptions.length > 0
            ? parsedOptions
            : msgType === "synthesis"
              ? ["Cristalliser le resultat", "Passer au Cahier SMART", "Continuer l'exploration"]
              : modeConf.options.length > 0 ? modeConf.options : (agentOptions || FALLBACK_OPTIONS);

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
                    options,
                    isStreaming: false,
                    isDiagnostic: res.is_diagnostic || false,
                    cascadeSuggestions: res.cascade_suggestions?.length ? res.cascade_suggestions : undefined,
                    scaffoldProgress: res.scaffold_progress || undefined,
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
      return [...prev, code];
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

  const newConversation = useCallback(() => {
    // Park current thread if it has messages
    if (activeThreadId && messages.length > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "parked" as ThreadStatus } : t
        )
      );
    }
    setMessages([]);
    setActiveThreadId(null);
    idCounter.current = 0;
  }, [activeThreadId, messages]);

  const parkThread = useCallback(() => {
    if (activeThreadId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "parked" as ThreadStatus, messages } : t
        )
      );
      setMessages([]);
      setActiveThreadId(null);
      idCounter.current = 0;
    }
  }, [activeThreadId, messages]);

  const resumeThread = useCallback((threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    // Park current if needed
    if (activeThreadId && messages.length > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, status: "parked" as ThreadStatus, messages } : t
        )
      );
    }

    setMessages(thread.messages);
    setActiveThreadId(threadId);
    idCounter.current = thread.messages.length;

    // Mark resumed thread as active
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, status: "active" as ThreadStatus } : t
      )
    );
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
  const sendMultiPerspective = useCallback(
    async (text: string, agents: string[], mode?: string) => {
      if (agents.length < 1) return;

      setIsTyping(true);

      // Auto-create thread if needed
      if (!activeThreadId) {
        const userMsg: ChatMessage = {
          id: `msg-${++idCounter.current}`,
          role: "user",
          content: text,
          timestamp: new Date(),
          msgType: "normal",
        };
        setMessages((prev) => [...prev, userMsg]);

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

      try {
        const req: MultiChatRequest = {
          message: text,
          user_id: 1,
          agents,
          mode: mode || undefined,
        };
        const res = await api.chatMulti(req);

        // Creer un message par perspective
        for (const persp of res.perspectives) {
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
      } catch (err) {
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

  // Voice transcript injection — called by VideoCallWidget when SSE events arrive
  const injectVoiceMessage = useCallback(
    (role: "user" | "assistant", content: string, agent?: string) => {
      const msg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role,
        content,
        timestamp: new Date(),
        agent: role === "assistant" ? (agent || "CEOB") : undefined,
        msgType: "voice" as MessageType,
      };
      setMessages((prev) => [...prev, msg]);

      // Auto-create thread if first voice message
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
    [activeThreadId]
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

  return {
    messages,
    isTyping,
    sendMessage,
    sendMultiPerspective,
    injectVoiceMessage,
    injectFocusCard,
    newConversation,
    threads,
    activeThreadId,
    parkThread,
    resumeThread,
    completeThread,
    deleteThread,
    setCanvasActionsCallback,
    // Chef d'Orchestre
    activeRoster,
    addBotToRoster,
    removeBotFromRoster,
    acceptTeamProposal,
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
  "blueprint": { steps: ["Brief", "Analyse", "Modele", "Validation", "Livraison"], flowType: "action" },
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

export function useSuggestions() {
  const [data, setData] = useState<import("./types").SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.suggestions(1)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

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
