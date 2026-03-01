/**
 * client.ts — Client API fetch wrapper pour GhostX API REST
 * Sprint A — Frame Master V2
 */

import type {
  ChatRequest,
  ChatResponse,
  MultiChatRequest,
  MultiChatResponse,
  BotListResponse,
  BotActivateResponse,
  ClientListResponse,
  ClientDetail,
  HealthResponse,
  TemplateListResponse,
  CahierRequest,
  CahierJobResponse,
  CahierStatusResponse,
  ChatOption,
} from "./types";

// --- SSE Stream types ---

export interface StreamTokenEvent {
  t: string; // chunk de texte
}

export interface StreamDoneEvent {
  response: string;
  agent: string;
  tier: string;
  modele: string;
  tokens_input: number;
  tokens_output: number;
  cout_usd: number;
  latence_ms: number;
  ghost_actif: string | null;
  options?: ChatOption[];
  sentinel_alert?: { type: string; message: string; suggestions: string[] } | null;
  phase_credo?: string | null;
  mode_actif?: string | null;
}

export type StreamCallback = {
  onToken: (text: string, accumulated: string) => void;
  onDone: (data: StreamDoneEvent) => void;
  onError: (error: string) => void;
};

// Chemin relatif — nginx reverse proxy vers FastAPI :8000
const BASE_URL = "/api/v1";
const API_KEY = "ghostx-dev-key-2026";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

// --- API Client ---

export const api = {
  /** Health check (pas d'auth requise) */
  health(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>("/health");
  },

  /** Envoyer un message au pipeline CarlOS */
  chat(req: ChatRequest): Promise<ChatResponse> {
    return apiFetch<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** Multi-perspectives : consulter 2-3 bots en parallele */
  chatMulti(req: MultiChatRequest): Promise<MultiChatResponse> {
    return apiFetch<MultiChatResponse>("/chat/multi", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** Liste des 12+ Bots C-Level */
  listBots(): Promise<BotListResponse> {
    return apiFetch<BotListResponse>("/bots");
  },

  /** Activer un bot specifique */
  activateBot(code: string, userId = 1): Promise<BotActivateResponse> {
    return apiFetch<BotActivateResponse>(
      `/bots/${code}/activate?user_id=${userId}`,
      { method: "POST" }
    );
  },

  /** Liste des clients */
  listClients(): Promise<ClientListResponse> {
    return apiFetch<ClientListResponse>("/clients");
  },

  /** Detail d'un client */
  getClient(slug: string): Promise<ClientDetail> {
    return apiFetch<ClientDetail>(`/clients/${slug}`);
  },

  /** Liste des templates Lego */
  listTemplates(): Promise<TemplateListResponse> {
    return apiFetch<TemplateListResponse>("/templates");
  },

  /** Lancer la generation d'un cahier de projets */
  startCahier(req: CahierRequest): Promise<CahierJobResponse> {
    return apiFetch<CahierJobResponse>("/cahier", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** Statut d'un job de cahier */
  getCahierStatus(jobId: string): Promise<CahierStatusResponse> {
    return apiFetch<CahierStatusResponse>(`/cahier/${jobId}`);
  },

  /** Obtenir un token LiveKit pour appel vocal/video */
  voiceToken(agentCode = "BCO", userId = 1): Promise<{ token: string; room_name: string; livekit_url: string; agent_code: string }> {
    return apiFetch("/voice/token", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, agent_code: agentCode }),
    });
  },

  /** Chat avec streaming SSE — tokens en temps reel */
  chatStream(req: ChatRequest, callbacks: StreamCallback): AbortController {
    const controller = new AbortController();
    const url = `${BASE_URL}/chat/stream`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(req),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          callbacks.onError(`API ${res.status}: ${body}`);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          callbacks.onError("ReadableStream not supported");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const dataStr = line.slice(5).trim();
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);

                if (currentEvent === "token") {
                  accumulated += data.t;
                  callbacks.onToken(data.t, accumulated);
                } else if (currentEvent === "done") {
                  callbacks.onDone(data as StreamDoneEvent);
                } else if (currentEvent === "error") {
                  callbacks.onError(data.error || "Unknown stream error");
                }
              } catch {
                // Ignore malformed JSON lines
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          callbacks.onError(err.message || "Stream connection failed");
        }
      });

    return controller;
  },
};
