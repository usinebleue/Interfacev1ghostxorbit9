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
} from "./types";

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
};
