/**
 * hooks.ts — React hooks pour l'API GhostX
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./client";
import type {
  BotInfo,
  HealthResponse,
  ChatMessage,
  ChatRequest,
  ClientSummary,
  Thread,
  ThreadStatus,
  ReflectionMode,
  MessageType,
  Crystal,
} from "./types";

// Options contextuelles par defaut — arbre de developpement de la pensee (wireframe p.3)
const DEFAULT_OPTIONS_BY_AGENT: Record<string, string[]> = {
  BCO: [
    "Approfondir cette idee",
    "Voir les implications financieres",
    "Quelles sont les prochaines etapes?",
    "Challenger cette approche",
  ],
  BCT: [
    "Details techniques",
    "Options d'integration",
    "Risques et mitigation",
    "Timeline de mise en oeuvre",
  ],
  BCF: [
    "Analyse de ROI",
    "Scenarios budgetaires",
    "Sources de financement",
    "Impact sur le cash flow",
  ],
  BCM: [
    "Strategie de contenu",
    "Ciblage et personas",
    "KPIs et mesure",
    "Plan d'execution",
  ],
  BCS: [
    "Analyse concurrentielle",
    "Opportunites de marche",
    "Plan d'action strategique",
    "Risques et contingences",
  ],
  BOO: [
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
    coachingIntro: "Mode CREDO — je vais te guider de la tension jusqu'a l'action concrete. Explore les angles, challenge, et je cristallise a la fin.",
    coachingConverge: "On a bien explore. Pret pour la synthese CREDO?",
    synthesisPrompt: "Synthetise en format CREDO: (C) Tension identifiee, (R) Recherche faite, (E) Expose des options, (D) Demonstration de la meilleure, (O) Obtenir — prochaines etapes concretes.",
    autoConsultBots: [],
    maxExchanges: 6,
  },
  debat: {
    options: ["Argument pour", "Argument contre", "Trouver un compromis", "Verdict final"],
    coachingIntro: "Mode Debat — je vais presenter 2 positions opposees. Challenge chaque cote, pousse les arguments.",
    coachingConverge: "Les arguments sont clairs des 2 cotes. On passe au verdict?",
    synthesisPrompt: "Synthetise le debat: Position A (arguments + forces), Position B (arguments + forces), Verdict (quelle position est la plus solide et pourquoi), Decision recommandee.",
    autoConsultBots: ["BCF", "BCS"],
    maxExchanges: 8,
  },
  brainstorm: {
    options: ["Plus d'idees!", "Combiner 2 idees", "Idee folle", "Assez — on trie"],
    coachingIntro: "Mode Brainstorm — toutes les idees sont bonnes, on filtre apres. Quantite avant qualite!",
    coachingConverge: "On a assez d'idees. On passe au tri et au clustering?",
    synthesisPrompt: "Classe les idees par potentiel (fort/moyen/faible). Top 3 idees avec justification. Prochaine etape pour chaque top idee.",
    autoConsultBots: ["BCM", "BCT"],
    maxExchanges: 5,
  },
  crise: {
    options: ["Impact immediat?", "Qui est affecte?", "Plan B", "Action dans les 30 min"],
    coachingIntro: "Mode Crise — priorite: stabiliser la situation. Pas de place pour la nuance, il faut agir.",
    coachingConverge: "Situation evaluee. On passe au plan d'action immediat?",
    synthesisPrompt: "Plan de crise: (1) Severite 1-10, (2) Actions immediates (30 min), (3) Communication a faire, (4) Responsable de chaque action, (5) Suivi dans 24h.",
    autoConsultBots: ["BOO"],
    maxExchanges: 4,
  },
  analyse: {
    options: ["Cause racine?", "Donnees manquantes", "Comparer avec un benchmark", "Conclusions?"],
    coachingIntro: "Mode Analyse — decomposons le probleme methodiquement. Facts d'abord, opinions ensuite.",
    coachingConverge: "L'analyse est solide. On formule les conclusions?",
    synthesisPrompt: "Analyse structuree: (1) Probleme decompose, (2) Causes racines identifiees, (3) Donnees cles, (4) Conclusions, (5) Recommandations actionnables.",
    autoConsultBots: ["BCT", "BCF"],
    maxExchanges: 6,
  },
  decision: {
    options: ["Quels criteres?", "Risques de chaque option", "Comparer Go vs No-Go", "Ma decision"],
    coachingIntro: "Mode Decision — on va structurer les options et les evaluer objectivement. Pas de gut feeling sans donnees.",
    coachingConverge: "Les options sont evaluees. Pret a trancher?",
    synthesisPrompt: "Matrice de decision: Options evaluees (criteres, risques, potentiel). Recommandation avec niveau de confiance. Conditions de succes du Go. Plan B si No-Go.",
    autoConsultBots: ["BCF", "BCS"],
    maxExchanges: 5,
  },
  strategie: {
    options: ["Forces et faiblesses", "Opportunites du marche", "Menaces a anticiper", "Plan d'execution"],
    coachingIntro: "Mode Strategie — vision long terme. On regarde le terrain avant de bouger.",
    coachingConverge: "La strategie se dessine. On formalise le plan?",
    synthesisPrompt: "Plan strategique: (1) SWOT synthetise, (2) 3 axes strategiques prioritaires, (3) Quick wins (30 jours), (4) Moyen terme (90 jours), (5) Indicateurs de succes.",
    autoConsultBots: ["BCS", "BCF"],
    maxExchanges: 7,
  },
  innovation: {
    options: ["Technique disruptive?", "Qui fait ca ailleurs?", "Prototype minimal", "Potentiel marche"],
    coachingIntro: "Mode Innovation — on cherche ce qui n'existe pas encore. Aucune idee trop folle.",
    coachingConverge: "On a identifie des pistes. On selectionne la plus prometteuse?",
    synthesisPrompt: "Innovation brief: (1) Opportunite identifiee, (2) Solution proposee, (3) Differenciateur cle, (4) Premier prototype (description), (5) Marche potentiel, (6) Prochaine etape concrete.",
    autoConsultBots: ["BCT", "BCM"],
    maxExchanges: 6,
  },
  deep: {
    options: ["Creuse plus profond", "Lien inattendu?", "Analogie avec un autre domaine", "Insight a retenir"],
    coachingIntro: "Mode Deep Resonance — on plonge dans les couches profondes. Intuition + reflexion croisee.",
    coachingConverge: "Des insights profonds emergent. On cristallise?",
    synthesisPrompt: "Deep insights: (1) Insight principal (ce qui n'etait pas evident), (2) Connexions inattendues decouvertes, (3) Question que personne ne posait, (4) Recommandation contre-intuitive, (5) Ce que ca change pour la suite.",
    autoConsultBots: ["BCS"],
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

function generateThreadTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Nouvelle conversation";
  const text = firstUser.content;
  return text.length > 50 ? text.slice(0, 50) + "..." : text;
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

// --- useChat ---

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(() => loadThreads());
  const [activeThreadId, setActiveThreadIdRaw] = useState<string | null>(() => loadActiveThreadId());
  const idCounter = useRef(0);
  const hasAutoRestored = useRef(false);

  // Wrapper: persist activeThreadId to localStorage on every change
  const setActiveThreadId = useCallback((id: string | null) => {
    setActiveThreadIdRaw(id);
    saveActiveThreadId(id);
  }, []);

  // Auto-restore: if there's an active thread in localStorage, reload its messages on mount
  useEffect(() => {
    if (hasAutoRestored.current) return;
    hasAutoRestored.current = true;

    const savedId = loadActiveThreadId();
    if (!savedId) return;

    const savedThreads = loadThreads();
    const thread = savedThreads.find((t) => t.id === savedId);
    if (thread && thread.messages && thread.messages.length > 0) {
      setMessages(thread.messages);
      setActiveThreadIdRaw(savedId);
      idCounter.current = thread.messages.length;
    } else {
      // Thread not found — clear stale reference
      saveActiveThreadId(null);
      setActiveThreadIdRaw(null);
    }
  }, []);

  // Persist threads to localStorage
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  // Update active thread messages when messages change
  useEffect(() => {
    if (activeThreadId && messages.length > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages, updatedAt: new Date().toISOString(), title: generateThreadTitle(messages) }
            : t
        )
      );
    }
  }, [messages, activeThreadId]);

  // ── Suspension Intelligente — drift detection ──
  const driftWarningCount = useRef(0);

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
        agent: "BCO",
        msgType: "coaching",
        options,
      };
      setMessages((prev) => [...prev, coachMsg]);
    },
    []
  );

  // Track branch depth
  const currentBranchDepth = useRef(0);

  const sendMessage = useCallback(
    async (
      text: string,
      agent?: string,
      ghost?: string,
      mode?: string,
      meta?: { msgType?: MessageType; parentId?: string; branchLabel?: string }
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
          title: text.length > 50 ? text.slice(0, 50) + "..." : text,
          status: "active",
          messages: [userMsg],
          mode: (mode as Thread["mode"]) || "credo",
          primaryBot: agent || "BCO",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setThreads((prev) => [...prev, thread]);
        setActiveThreadId(newId);
      }

      try {
        const req: ChatRequest = {
          message: text,
          user_id: 1,
          agent,
          ghost,
          mode: mode || undefined,
          direct: true,
        };
        const res = await api.chat(req);

        // Parse API options from response text (📌 format)
        const { cleanText, parsedOptions } = parseApiOptions(res.response);

        // Mode-specific options (parsed > mode > agent > fallback)
        const modeConf = MODE_LIVE_CONFIG[mode || "credo"] || MODE_LIVE_CONFIG.credo;
        const agentOptions = DEFAULT_OPTIONS_BY_AGENT[agent || "BCO"];
        const options = parsedOptions.length > 0
          ? parsedOptions
          : msgType === "synthesis"
            ? ["Cristalliser le resultat", "Passer au Cahier SMART", "Continuer l'exploration"]
            : modeConf.options.length > 0 ? modeConf.options : (agentOptions || FALLBACK_OPTIONS);

        const botMsg: ChatMessage = {
          id: `msg-${++idCounter.current}`,
          role: "assistant",
          content: cleanText,
          timestamp: new Date(),
          agent: res.agent,
          ghost: res.ghost_actif,
          tier: res.tier,
          latence_ms: res.latence_ms,
          options,
          msgType: msgType === "challenge" ? "challenge" : msgType === "consultation" ? "consultation" : msgType === "synthesis" ? "synthesis" : "normal",
          parentId: meta?.parentId,
          branchDepth,
          branchLabel: meta?.branchLabel,
        };
        setMessages((prev) => [...prev, botMsg]);

        // CarlOS coaching: mode-specific, after first bot response
        const allMsgs = [...messages, userMsg, botMsg];
        const botCount = allMsgs.filter((m) => m.role === "assistant").length;
        const userMsgs = allMsgs.filter((m) => m.role === "user");

        if (botCount === 1) {
          // First response — mode-specific intro
          setTimeout(() => {
            injectCoaching(modeConf.coachingIntro);
          }, 500);

          // Auto-consult bots for this mode (if configured)
          if (modeConf.autoConsultBots.length > 0 && msgType === "normal") {
            const firstAutoBot = modeConf.autoConsultBots[0];
            if (firstAutoBot && firstAutoBot !== agent) {
              // Auto-fire consultation to the first recommended bot
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
          // Mode-specific convergence nudge
          setTimeout(() => {
            injectCoaching(
              modeConf.coachingConverge,
              ["Synthese", "Continuer l'exploration"]
            );
          }, 500);
        }

        // ── Suspension Intelligente — drift detection ──
        if (userMsgs.length >= 3 && msgType === "normal") {
          const originalTension = userMsgs[0]?.content || "";
          const isDrifting = detectDrift(originalTension, text);

          if (isDrifting) {
            driftWarningCount.current++;

            if (driftWarningCount.current === 1) {
              // Premier avertissement — signal doux
              setTimeout(() => {
                injectCoaching(
                  "On s'eloigne du sujet initial. Tu veux continuer sur cette tangente ou revenir a ta tension de depart?",
                  ["Revenir au sujet", "Parker et continuer ici", "C'est lie, continue"]
                );
              }, 600);
            } else if (driftWarningCount.current >= 2) {
              // Deuxieme avertissement — auto-park propose
              setTimeout(() => {
                injectCoaching(
                  "Ca fait 2 fois qu'on derive. Je te propose de parker cette discussion et d'en ouvrir une nouvelle pour ce nouveau sujet.",
                  ["Parker et nouveau thread", "Forcer la synthese", "Laisser-moi continuer"]
                );
              }, 600);
            }
          }
        }
      } catch (err) {
        const errMsg: ChatMessage = {
          id: `msg-${++idCounter.current}`,
          role: "assistant",
          content: `Erreur: ${err instanceof Error ? err.message : "Connexion impossible"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [activeThreadId, messages, injectCoaching]
  );

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

  return {
    messages,
    isTyping,
    sendMessage,
    newConversation,
    threads,
    activeThreadId,
    parkThread,
    resumeThread,
    completeThread,
    deleteThread,
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
