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

function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateThreadTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Nouvelle conversation";
  const text = firstUser.content;
  return text.length > 50 ? text.slice(0, 50) + "..." : text;
}

// --- useChat ---

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(() => loadThreads());
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const idCounter = useRef(0);

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

        const botMsg: ChatMessage = {
          id: `msg-${++idCounter.current}`,
          role: "assistant",
          content: res.response,
          timestamp: new Date(),
          agent: res.agent,
          ghost: res.ghost_actif,
          tier: res.tier,
          latence_ms: res.latence_ms,
          options:
            DEFAULT_OPTIONS_BY_AGENT[agent || "BCO"] || FALLBACK_OPTIONS,
          msgType: msgType === "challenge" ? "challenge" : msgType === "consultation" ? "consultation" : "normal",
          parentId: meta?.parentId,
          branchDepth,
          branchLabel: meta?.branchLabel,
        };
        setMessages((prev) => [...prev, botMsg]);

        // CarlOS coaching: after first bot response, guide the user
        const allMsgs = [...messages, userMsg, botMsg];
        const botCount = allMsgs.filter((m) => m.role === "assistant").length;

        if (botCount === 1) {
          // First response — introduce branching
          setTimeout(() => {
            injectCoaching(
              "Tu peux challenger cette reponse, approfondir un point, ou consulter un autre specialiste. Explore les angles — je t'encadre.",
            );
          }, 500);
        } else if (botCount === 5) {
          // After 5 exchanges — nudge towards convergence
          setTimeout(() => {
            injectCoaching(
              "On a bien explore le sujet. Tu veux continuer ou on passe a la synthese?",
              ["Synthese", "Continuer l'exploration"]
            );
          }, 500);
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
