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
  CanvasAction,
  KitActiveResponse,
  KitSetResponse,
  TeamProposal,
  BureauItem,
  BureauItemCreate,
  BureauItemUpdate,
  BureauListResponse,
  PlaneTache,
  PlaneTacheDetail,
  PlaneTacheCreate,
  PlaneTacheListResponse,
  Tension,
  TensionCreate,
  TensionClassifyResult,
  TemplatePreview,
  DocumentGenerateRequest,
  DocumentGenerateResponse,
  Orbit9Member,
  Orbit9MemberListResponse,
  Orbit9Match,
  Orbit9MatchListResponse,
  Orbit9Cellule,
  Orbit9CelluleListResponse,
  TrisociationResponse,
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
  canvas_actions?: CanvasAction[];
  team_proposal?: TeamProposal | null;
  is_diagnostic?: boolean;
}

export type StreamCallback = {
  onToken: (text: string, accumulated: string) => void;
  onDone: (data: StreamDoneEvent) => void;
  onError: (error: string) => void;
};

// Chemin relatif — nginx reverse proxy vers FastAPI :8000
const BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "missing-key";

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

  /** Preview d'un template (contenu markdown + placeholders + narratives) */
  previewTemplate(alias: string): Promise<TemplatePreview> {
    return apiFetch<TemplatePreview>(`/templates/${encodeURIComponent(alias)}/preview`);
  },

  /** Generer un document PDF depuis un template */
  generateDocument(data: DocumentGenerateRequest): Promise<DocumentGenerateResponse> {
    return apiFetch<DocumentGenerateResponse>("/documents/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** URL de telechargement d'un document genere */
  documentDownloadUrl(filename: string): string {
    return `${BASE_URL}/documents/download/${encodeURIComponent(filename)}`;
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

  /** Kit entreprise actif + liste de tous les kits disponibles */
  getActiveKit(userId = 1): Promise<KitActiveResponse> {
    return apiFetch<KitActiveResponse>(`/kit/active?user_id=${userId}`);
  },

  /** Changer le kit entreprise actif */
  setKit(slug: string, userId = 1): Promise<KitSetResponse> {
    return apiFetch<KitSetResponse>(`/kit/set?user_id=${userId}&slug=${slug}`, {
      method: "POST",
    });
  },

  // --- Bureau (Espace Bureau) ---

  /** Lister les items bureau (projets, documents, outils) */
  listBureauItems(typeFilter?: string): Promise<BureauListResponse> {
    const qs = typeFilter ? `?type_item=${typeFilter}` : "";
    return apiFetch<BureauListResponse>(`/bureau${qs}`);
  },

  /** Creer un item bureau */
  createBureauItem(data: BureauItemCreate): Promise<BureauItem> {
    return apiFetch<BureauItem>("/bureau", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Modifier un item bureau */
  updateBureauItem(id: number, data: BureauItemUpdate): Promise<BureauItem> {
    return apiFetch<BureauItem>(`/bureau/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Supprimer un item bureau */
  deleteBureauItem(id: number): Promise<{ status: string; id: number }> {
    return apiFetch(`/bureau/${id}/delete`, { method: "POST" });
  },

  /** Upload un fichier document */
  async uploadBureauFile(file: File, titre?: string): Promise<BureauItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (titre) formData.append("titre", titre);

    const url = `${BASE_URL}/bureau/upload`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json();
  },

  /** URL de telechargement d'un fichier bureau */
  bureauDownloadUrl(filename: string): string {
    return `${BASE_URL}/bureau/download/${filename}`;
  },

  // --- Taches Plane.so ---

  /** Lister les taches ouvertes */
  listTaches(): Promise<PlaneTacheListResponse> {
    return apiFetch<PlaneTacheListResponse>("/taches");
  },

  /** Detail d'une tache */
  getTache(id: string): Promise<PlaneTacheDetail> {
    return apiFetch<PlaneTacheDetail>(`/taches/${id}`);
  },

  /** Creer une tache dans Plane.so */
  createTache(data: PlaneTacheCreate): Promise<{ id: string; identifier: string; name: string }> {
    return apiFetch(`/taches`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Marquer une tache comme completee */
  completeTache(id: string): Promise<{ id: string; status: string }> {
    return apiFetch(`/taches/${id}/complete`, { method: "POST" });
  },

  /** Ajouter un commentaire a une tache */
  commentTache(id: string, commentaire: string): Promise<{ id: string; status: string }> {
    return apiFetch(`/taches/${id}/comment`, {
      method: "POST",
      body: JSON.stringify({ commentaire }),
    });
  },

  // --- Decision Log (D-098 Gouvernance) ---

  /** Lister les decisions du journal CarlOS */
  listDecisions(params?: { bot_code?: string; type_decision?: string; section?: string; limit?: number; offset?: number }): Promise<import("./types").DecisionLogListResponse> {
    const qs = new URLSearchParams();
    if (params?.bot_code) qs.set("bot_code", params.bot_code);
    if (params?.type_decision) qs.set("type_decision", params.type_decision);
    if (params?.section) qs.set("section", params.section);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const q = qs.toString();
    return apiFetch(`/decisions${q ? `?${q}` : ""}`);
  },

  /** Detail d'une decision */
  getDecision(id: number): Promise<import("./types").DecisionLogEntry> {
    return apiFetch(`/decisions/${id}`);
  },

  /** Enregistrer une decision */
  createDecision(data: import("./types").DecisionLogCreate): Promise<{ id: number; status: string }> {
    return apiFetch("/decisions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Reverser (annuler) une decision */
  reverseDecision(id: number): Promise<{ id: number; status: string }> {
    return apiFetch(`/decisions/${id}/reverse`, {
      method: "POST",
    });
  },

  // ── TENSIONS (D-100) ───────────────────────────────────────

  /** Lister les tensions */
  listTensions(filters?: { status?: string; type_vitaa?: string; intensite?: string; limit?: number }): Promise<{ tensions: Tension[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.type_vitaa) params.set("type_vitaa", filters.type_vitaa);
    if (filters?.intensite) params.set("intensite", filters.intensite);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return apiFetch(`/tensions${qs ? `?${qs}` : ""}`);
  },

  /** Créer une tension */
  createTension(data: TensionCreate): Promise<Tension> {
    return apiFetch("/tensions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Obtenir le détail d'une tension */
  getTension(id: number): Promise<Tension> {
    return apiFetch(`/tensions/${id}`);
  },

  /** Auto-classifier un message en tension VITAA */
  classifyTension(message: string): Promise<TensionClassifyResult> {
    return apiFetch("/tensions/classify", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  /** Résoudre une tension */
  resolveTension(id: number): Promise<{ status: string; tension_id: number }> {
    return apiFetch(`/tensions/${id}/resolve`, {
      method: "POST",
    });
  },

  /** Lister les missions COMMAND recentes */
  commandMissions(limit = 20): Promise<Record<string, unknown>[]> {
    return apiFetch(`/command/missions?limit=${limit}`);
  },

  /** Lister les briefings compiles */
  commandBriefings(botCode?: string): Promise<Record<string, unknown>[]> {
    const qs = botCode ? `?bot_code=${encodeURIComponent(botCode)}` : "";
    return apiFetch(`/command/briefings${qs}`);
  },

  /** Lancer une mission COMMAND depuis une tension */
  launchMissionFromTension(id: number): Promise<{ tension_id: number; mission_id: number; scan_bots: string[]; urgency: string }> {
    return apiFetch(`/tensions/${id}/launch-mission`, {
      method: "POST",
    });
  },

  /** Obtenir un token LiveKit pour appel vocal/video */
  voiceToken(agentCode = "BCO", userId = 1, video = false): Promise<{ token: string; room_name: string; livekit_url: string; agent_code: string }> {
    return apiFetch("/voice/token", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, agent_code: agentCode, video }),
    });
  },

  // ── ORBIT9 (Members, Cellules, Matches, Trisociation) ─────

  /** Lister les membres du reseau Orbit9 */
  listOrbit9Members(status?: string): Promise<Orbit9MemberListResponse> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiFetch<Orbit9MemberListResponse>(`/orbit9/members${qs}`);
  },

  /** Creer un membre Orbit9 */
  createOrbit9Member(data: Partial<Orbit9Member>): Promise<Orbit9Member> {
    return apiFetch<Orbit9Member>("/orbit9/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Detail d'un membre Orbit9 */
  getOrbit9Member(id: number): Promise<Orbit9Member> {
    return apiFetch<Orbit9Member>(`/orbit9/members/${id}`);
  },

  /** Lister les cellules Orbit9 */
  listOrbit9Cellules(typeCellule?: string): Promise<Orbit9CelluleListResponse> {
    const qs = typeCellule ? `?type_cellule=${encodeURIComponent(typeCellule)}` : "";
    return apiFetch<Orbit9CelluleListResponse>(`/orbit9/cellules${qs}`);
  },

  /** Creer une cellule Orbit9 */
  createOrbit9Cellule(data: { nom: string; type_cellule?: string; secteur_focus?: string; fondateur_id?: number }): Promise<Orbit9Cellule> {
    return apiFetch<Orbit9Cellule>("/orbit9/cellules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Lancer un matching Orbit9 */
  launchOrbit9Match(besoin: string, criteres: string[], demandeurId: number): Promise<Orbit9Match> {
    return apiFetch<Orbit9Match>("/orbit9/match", {
      method: "POST",
      body: JSON.stringify({ demandeur_id: demandeurId, besoin, criteres }),
    });
  },

  /** Lister les matchings Orbit9 */
  listOrbit9Matches(status?: string): Promise<Orbit9MatchListResponse> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiFetch<Orbit9MatchListResponse>(`/orbit9/matches${qs}`);
  },

  /** Detail d'un matching Orbit9 */
  getOrbit9Match(id: number): Promise<Orbit9Match> {
    return apiFetch<Orbit9Match>(`/orbit9/matches/${id}`);
  },

  /** Selectionner les gagnants d'un match */
  selectOrbit9Winners(matchId: number, gagnantIds: number[]): Promise<Orbit9Match> {
    return apiFetch<Orbit9Match>(`/orbit9/matches/${matchId}/select`, {
      method: "POST",
      body: JSON.stringify({ gagnant_ids: gagnantIds }),
    });
  },

  /** Declencher le Bot Scout (scan ecosysteme) */
  triggerOrbit9Scout(matchId: number): Promise<{ match_id: number; prospects: unknown[]; status: string }> {
    return apiFetch(`/orbit9/scout/${matchId}`, { method: "POST" });
  },

  /** Inviter un fournisseur externe */
  inviteOrbit9Prospect(data: { nom: string; secteur?: string; contact_email?: string; match_id?: number }): Promise<Orbit9Member> {
    return apiFetch<Orbit9Member>("/orbit9/invite", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Demarrer une Trisociation LiveKit */
  startTrisociation(matchId: number): Promise<TrisociationResponse> {
    return apiFetch<TrisociationResponse>(`/orbit9/trisociation/start?match_id=${matchId}`, {
      method: "POST",
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
