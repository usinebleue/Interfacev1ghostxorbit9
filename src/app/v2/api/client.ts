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
  JumelageQuestionsResponse,
  JumelageScoringResponse,
  BubbleContext,
  CascadeSuggestion,
  Chantier,
  Projet,
  Idee,
  Mission,
  Discussion,
  PlaybookSummary,
  PlaybookDeployResult,
  CommandStartResponse,
  CommandStatusResponse,
  BriefingListResponse,
  SuggestionsResponse,
  QuestionnaireResponse,
  ModeBranchRequest,
  DiagnosticCatalogue,
  GapFournisseur,
  MissionCatalogue,
  TemplateProjetCatalogue,
  TemplateDocumentaire,
  TacheUser,
  EntrepriseProfil,
  CanvasItemType,
  ScaffoldProgress,
  ConsultationSuggestion,
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
  is_code_task?: boolean;
  is_greeting?: boolean;
  // D-101 — GPS du Flow
  flow_type?: "data" | "action" | null;
  flow_step?: string | null;
  flow_bot_primaire?: string | null;
  // D-101 — Cascade tensions
  cascade_suggestions?: CascadeSuggestion[];
  // D-108 — Contexte de bulle dynamique
  bubble_context?: BubbleContext | null;
  // Sprint Discussion 1 — CREDO phase-gating
  exchange_count?: number;
  has_product?: boolean;
  // Mega Plan V5 — CarlOS GPS cristallisation suggestion
  cristallisation_suggestion?: { section_id: string; section_label: string; confidence: number } | null;
  // S43 — Scaffold progress (anti-hallucination)
  scaffold_progress?: ScaffoldProgress | null;
  // Zero-Silo — cascade items cross-section
  cascade_items?: Array<Record<string, unknown>> | null;
  // Zero-Silo — consultation suggestions cross-bot
  consultation_suggestions?: ConsultationSuggestion[] | null;
  // Sprint 2A — Workspace block + skip flag
  workspace_block?: Record<string, unknown> | null;
  // S2.3 — Multi-artifact support
  workspace_blocks?: Record<string, unknown>[] | null;
  workspace_block_skip?: boolean;
  // C.51 — Workspace block pending (crystallisation en cours)
  workspace_block_pending?: boolean;
}

// C.32 — Auto-consultation cross-bot event
export interface AutoConsultationEvent {
  bot_code: string;
  bot_nom: string;
  bot_titre: string;
  bot_emoji: string;
  reason: string;
  degree: string;
  from_bot: string;
  from_bot_nom: string;
  contenu: string;
  workspace_block?: Record<string, unknown>;
  options?: { label: string; value: string }[];
}

// C.34 — Bot Tools result event
export interface ToolResultEvent {
  bot_code: string;
  bot_nom: string;
  tools: { tool: string; status: string; result: unknown; error?: string }[];
  cleaned_response: string;
}

// C.3 — Auto-Monte C-Suite: suggestion d'activer un nouveau bot
export interface TeamSuggestionEvent {
  bot_code: string;
  bot_nom: string;
  bot_titre: string;
  reason: string;
  pitch: string;
  confidence: number;
  urgency: "haute" | "moyenne" | "basse";
  from_bot: string;
}

export interface CommandAvailableEvent {
  mission_title: string;
  scan_bots: string[];
  confidence: number;
  auto: boolean;
  urgency: string;
}

export interface CommandProgressEvent {
  event: string; // "started"|"scan_result"|"execution_result"|"tool_result"|"bilan_result"|"done"
  bot: string;
  mission_id?: number;
  plan?: string;
  tool?: string;
  success?: boolean;
  data?: string;
  category?: string;
  tools_count?: number;
}

export type StreamCallback = {
  onToken: (text: string, accumulated: string) => void;
  onDone: (data: StreamDoneEvent) => void;
  onError: (error: string) => void;
  onStatus?: (label: string) => void;
  onAutoConsultation?: (data: AutoConsultationEvent) => void;
  onToolResult?: (data: ToolResultEvent) => void;
  onTeamSuggestion?: (data: TeamSuggestionEvent) => void;
  onCommandAvailable?: (data: CommandAvailableEvent) => void;
  onCommandProgress?: (data: CommandProgressEvent) => void;
  onWorkspaceBlock?: (data: { workspace_block: Record<string, unknown> }) => void;
};

// Chemin relatif — nginx reverse proxy vers FastAPI :8000
const BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "missing-key";

// JWT token storage
function getJwtToken(): string | null {
  try { return localStorage.getItem("ghostx-jwt"); } catch { return null; }
}
function setJwtToken(token: string) {
  try { localStorage.setItem("ghostx-jwt", token); } catch { /* noop */ }
}
function clearJwtToken() {
  try { localStorage.removeItem("ghostx-jwt"); } catch { /* noop */ }
}

/** Extract user_id from JWT payload (F4 multi-user). Falls back to 1. */
function getCurrentUserId(): number {
  const jwt = getJwtToken();
  if (jwt) {
    try {
      const parts = jwt.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.user_id) return payload.user_id;
      }
    } catch { /* noop */ }
  }
  return 1;
}

let _refreshingToken: Promise<string | null> | null = null;

async function _tryRefreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("ghostx-jwt-refresh");
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        setJwtToken(data.access_token);
        return data.access_token;
      }
    }
  } catch { /* refresh failed */ }
  return null;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const jwt = getJwtToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // C.7 — JWT primary auth: use Bearer token when available, API key as fallback only
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : { "X-API-Key": API_KEY }),
    ...(options.headers as Record<string, string>),
  };

  let res = await fetch(url, { ...options, headers });

  // Auto-refresh JWT on 401
  if (res.status === 401 && jwt) {
    if (!_refreshingToken) _refreshingToken = _tryRefreshToken();
    const newJwt = await _refreshingToken;
    _refreshingToken = null;
    if (newJwt) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newJwt}` };
      res = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      // C.45 — JWT refresh échoué : fallback sur X-API-Key pour éviter le 401 (ex: Mathilde en mode réflexion)
      const fallbackHeaders = { ...headers, "X-API-Key": API_KEY };
      delete (fallbackHeaders as Record<string, string>).Authorization;
      res = await fetch(url, { ...options, headers: fallbackHeaders });
    }
  }

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

  /** Vision — envoyer une image (camera/lunettes) a CarlOS pour analyse */
  chatVision(image: string, message = "Qu'est-ce que tu vois?", agent = "CEOB"): Promise<{ response: string; agent: string }> {
    return apiFetch<{ response: string; agent: string }>("/chat/vision", {
      method: "POST",
      body: JSON.stringify({ image, message, agent, user_id: 1 }),
    });
  },

  /** Multi-perspectives : consulter 2-3 bots en parallele */
  chatMulti(req: MultiChatRequest): Promise<MultiChatResponse> {
    return apiFetch<MultiChatResponse>("/chat/multi", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** W.1b — Deep Search via Gemini grounding */
  deepSearch(req: { query: string; user_id?: number }): Promise<{ summary: string; sources: string; chunks: { text: string; url: string; title?: string }[] }> {
    return apiFetch("/search/deep", {
      method: "POST",
      body: JSON.stringify({ query: req.query, user_id: req.user_id || 1 }),
    });
  },

  /** Liste des 12+ Bots C-Level */
  listBots(): Promise<BotListResponse> {
    return apiFetch<BotListResponse>("/bots");
  },

  /** Activer un bot specifique */
  activateBot(code: string, userId = getCurrentUserId()): Promise<BotActivateResponse> {
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
  getActiveKit(userId = getCurrentUserId()): Promise<KitActiveResponse> {
    return apiFetch<KitActiveResponse>(`/kit/active?user_id=${userId}`);
  },

  /** Changer le kit entreprise actif */
  setKit(slug: string, userId = getCurrentUserId()): Promise<KitSetResponse> {
    return apiFetch<KitSetResponse>(`/kit/set?user_id=${userId}&slug=${slug}`, {
      method: "POST",
    });
  },

  // --- Bureau (Espace Bureau) ---

  /** Lister les items bureau (projets, documents, outils) */
  listBureauItems(typeFilter?: string, missionId?: number, chantierId?: number): Promise<BureauListResponse> {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type_item", typeFilter);
    if (missionId) params.set("mission_id", String(missionId));
    if (chantierId) params.set("chantier_id", String(chantierId));
    const qs = params.toString();
    return apiFetch<BureauListResponse>(`/bureau${qs ? `?${qs}` : ""}`);
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
    const uploadJwt = getJwtToken();
    const res = await fetch(url, {
      method: "POST",
      headers: uploadJwt ? { Authorization: `Bearer ${uploadJwt}` } : { "X-API-Key": API_KEY },
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

  /** Rapports produits automatiquement par les outils bots (T.3) */
  listBotDocuments(botCode?: string, typeDoc?: string): Promise<{ documents: any[]; count: number }> {
    const params = new URLSearchParams();
    if (botCode) params.set("bot_code", botCode);
    if (typeDoc) params.set("type_doc", typeDoc);
    const qs = params.toString();
    return apiFetch<{ documents: any[]; count: number }>(`/bot-documents${qs ? `?${qs}` : ""}`);
  },

  /** Initialise la structure Drive départementale pour un client (T.4) */
  initClientDrive(driveFolderId: string, userId = 1): Promise<{ created: string[]; errors: string[]; drive_folder_id: string }> {
    return apiFetch<{ created: string[]; errors: string[]; drive_folder_id: string }>("/drive/init-client", {
      method: "POST",
      body: JSON.stringify({ drive_folder_id: driveFolderId, user_id: userId }),
    });
  },

  /** Crée le dossier Drive "Usinebleue AI - Brain Team - {clientName}" (T.5) */
  initClientDriveByName(clientName: string, userId = 1): Promise<{ created: string[]; errors: string[]; drive_folder_id: string; folder_name: string }> {
    return apiFetch("/drive/init-client", {
      method: "POST",
      body: JSON.stringify({ client_name: clientName, user_id: userId }),
    });
  },

  /** Liste les fichiers/dossiers Drive via rclone (T.5) */
  listDriveFiles(path = ""): Promise<{ path: string; items: any[]; count: number }> {
    return apiFetch(`/drive/list${path ? `?path=${encodeURIComponent(path)}` : ""}`);
  },

  /** Statut de la connexion Drive de l'utilisateur */
  driveStatus(): Promise<{ connected: boolean; folder_id: string | null; share_email: string; file_count?: number; error?: string }> {
    return apiFetch("/drive/status");
  },

  /** Connecte un dossier Drive (URL complète ou ID brut) */
  driveConnect(folder: string): Promise<{ ok: boolean; folder_id?: string; items_count?: number; error?: string }> {
    return apiFetch("/drive/connect", { method: "POST", body: JSON.stringify({ folder }) });
  },

  // --- Intégrations tierces (T.5) ---

  /** Registre complet des providers disponibles */
  listIntegrations(): Promise<{ integrations: any[]; count: number }> {
    return apiFetch("/integrations");
  },

  /** Intégrations actives de l'utilisateur */
  getUserIntegrations(): Promise<{ integrations: any[] }> {
    return apiFetch("/integrations/user");
  },

  /** Sauvegarde une intégration (upsert) */
  saveIntegration(provider: string, config: Record<string, string>): Promise<{ ok: boolean; provider: string; name?: string; error?: string }> {
    return apiFetch(`/integrations/${provider}`, {
      method: "POST",
      body: JSON.stringify({ config }),
    });
  },

  /** Teste la connexion d'une intégration utilisateur */
  testUserIntegration(provider: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    return apiFetch(`/integrations/${provider}/test`, { method: "POST" });
  },

  /** Supprime une intégration */
  deleteIntegration(provider: string): Promise<{ ok: boolean; provider: string }> {
    return apiFetch(`/integrations/${provider}`, { method: "DELETE" });
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
  voiceToken(agentCode = "CEOB", userId = 1, video = false): Promise<{ token: string; room_name: string; livekit_url: string; agent_code: string }> {
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

  /** Generer les 5 questions de jumelage contextuelles */
  generateJumelageQuestions(matchId: number): Promise<JumelageQuestionsResponse> {
    return apiFetch<JumelageQuestionsResponse>(`/orbit9/matches/${matchId}/jumelage-questions`, {
      method: "POST",
    });
  },

  /** Generer le scoring detaille 8 categories */
  generateJumelageScoring(matchId: number): Promise<JumelageScoringResponse> {
    return apiFetch<JumelageScoringResponse>(`/orbit9/matches/${matchId}/score-detail`, {
      method: "POST",
    });
  },

  // ── FLOW GPS (sections ACTION — progression par etapes) ─────

  /** Recuperer la config du flow pour une section ACTION */
  flowGetConfig(sectionKey: string): Promise<{ section: string; steps: string[]; flow_type: string }> {
    return apiFetch(`/flow/${sectionKey}/config`);
  },

  /** Recuperer l'etape courante du flow */
  flowGetStep(sectionKey: string): Promise<{ section: string; current_step: string; step_index: number; total_steps: number; completed: boolean }> {
    return apiFetch(`/flow/${sectionKey}/step`);
  },

  /** Avancer le flow d'une etape */
  flowAdvance(sectionKey: string): Promise<{ section: string; current_step: string; step_index: number; total_steps: number; completed: boolean }> {
    return apiFetch(`/flow/${sectionKey}/advance`, { method: "POST" });
  },

  /** Remettre le flow a zero */
  flowReset(sectionKey: string): Promise<{ section: string; current_step: string; step_index: number }> {
    return apiFetch(`/flow/${sectionKey}/reset`, { method: "POST" });
  },

  // ── ENTREPRISE PROFIL (Sprint F2) ──────────────────────────

  /** Obtenir le profil entreprise */
  getEntrepriseProfil(tenantId = 1): Promise<{ status: string; profil: EntrepriseProfil | null }> {
    return apiFetch(`/entreprise-profil?tenant_id=${tenantId}`);
  },

  /** Sauvegarder le profil entreprise (create or update) */
  saveEntrepriseProfil(data: Partial<EntrepriseProfil>, tenantId = 1): Promise<{ status: string; id: number }> {
    return apiFetch(`/entreprise-profil?tenant_id=${tenantId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  // ── CANVAS ITEMS (Sprint F2) ──────────────────────────────

  /** Creer un canvas */
  createCanvas(data: { type_canvas: string; titre?: string; data?: Record<string, unknown> }): Promise<{ status: string; id: number }> {
    return apiFetch("/canvas", { method: "POST", body: JSON.stringify(data) });
  },

  /** Lister les canvas */
  listCanvas(typeCanvas?: string): Promise<CanvasItemType[]> {
    const qs = typeCanvas ? `?type_canvas=${typeCanvas}` : "";
    return apiFetch(`/canvas${qs}`);
  },

  /** Obtenir un canvas */
  getCanvas(canvasId: number): Promise<CanvasItemType> {
    return apiFetch(`/canvas/${canvasId}`);
  },

  /** Mettre a jour un canvas */
  updateCanvas(canvasId: number, data: Record<string, unknown>): Promise<{ status: string }> {
    return apiFetch(`/canvas/${canvasId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  /** Supprimer un canvas */
  deleteCanvas(canvasId: number): Promise<{ status: string }> {
    return apiFetch(`/canvas/${canvasId}`, { method: "DELETE" });
  },

  /** Obtenir ou creer un canvas par type (upsert) */
  getOrCreateCanvas(typeCanvas: string): Promise<CanvasItemType> {
    return apiFetch(`/canvas/by-type/${typeCanvas}`);
  },

  /** Canal 2 — Enrichir profil via web/Gemini */
  enrichProfil(data: { nom: string; industrie?: string; localisation?: string; extra?: string }): Promise<{ status: string; data?: Record<string, unknown>; updates: number; detail?: string }> {
    return apiFetch("/entreprise-profil/enrich", { method: "POST", body: JSON.stringify(data) });
  },

  /** Canal 3 — Extraire infos d'un document uploade */
  extractDocument(file: File): Promise<{ status: string; data?: Record<string, unknown>; updates: number; detail?: string }> {
    const form = new FormData();
    form.append("file", file);
    // apiFetch ajoute Content-Type: application/json, on doit faire un fetch brut pour FormData
    const base = (import.meta as Record<string, Record<string, string>>).env?.VITE_API_BASE || "";
    const apiKey = (import.meta as Record<string, Record<string, string>>).env?.VITE_API_KEY || "";
    const docJwt = getJwtToken();
    return fetch(`${base}/api/v1/entreprise-profil/extract-document`, {
      method: "POST",
      headers: docJwt ? { Authorization: `Bearer ${docJwt}` } : { "X-API-Key": apiKey },
      body: form,
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  },

  // ── CHANTIERS & MISSIONS ──────────────────────────────────

  /** Lister les chantiers */
  listChantiers(): Promise<{ chantiers: Chantier[] }> {
    return apiFetch<Chantier[]>("/chantiers").then(list => ({ chantiers: list }));
  },

  /** Creer un chantier (briefing complet) */
  createChantier(data: {
    titre: string;
    description?: string;
    chaleur?: string;
    bot_codes?: string[];
    section_primaire?: string;
    type_chantier?: string;
    tags?: string[];
    objectifs?: string[];
    echeance?: string;
    budget_estime?: string;
    indicateurs_cles?: string[];
    risques?: string[];
    participants?: Array<{ type: string; code?: string; nom?: string; role: string }>;
  }): Promise<{ status: string; id: number }> {
    return apiFetch("/chantiers", { method: "POST", body: JSON.stringify(data) });
  },

  /** Modifier un chantier */
  updateChantier(chantierId: number, data: Record<string, unknown>): Promise<{ status: string }> {
    return apiFetch(`/chantiers/${chantierId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  /** Supprimer un chantier (archive) */
  deleteChantier(chantierId: number): Promise<{ status: string }> {
    return apiFetch(`/chantiers/${chantierId}`, { method: "DELETE" });
  },

  /** Initialiser les chantiers depuis le Blueprint de l'organisation */
  seedFromBlueprint(): Promise<{ status: string; chantiers_created: number }> {
    return apiFetch("/chantiers/seed-from-blueprint", { method: "POST" });
  },

  /** Assigner un lot de missions orphelines à un chantier */
  assignMissionsToChantier(chantierId: number, missionIds: number[]): Promise<{ status: string; count: number }> {
    return apiFetch(`/chantiers/${chantierId}/assign-missions`, {
      method: "POST",
      body: JSON.stringify({ mission_ids: missionIds }),
    });
  },

  // ── PROJETS (Espace Unifié) ─────────────────────────────

  /** Lister les projets */
  listProjets(chantierId?: number): Promise<Projet[]> {
    const params = new URLSearchParams();
    if (chantierId) params.set("chantier_id", String(chantierId));
    const qs = params.toString();
    return apiFetch<Projet[]>(`/projets${qs ? `?${qs}` : ""}`);
  },

  /** Obtenir un projet avec ses missions */
  getProjet(projetId: number): Promise<Projet & { missions: Mission[] }> {
    return apiFetch(`/projets/${projetId}`);
  },

  /** Creer un projet */
  createProjet(data: {
    titre: string;
    description?: string;
    chantier_id?: number;
    bot_primaire?: string;
    bot_codes?: string[];
    participants?: Array<{ type: string; code?: string; nom?: string; role: string }>;
    objectifs?: string[];
    echeance?: string;
    tags?: string[];
  }): Promise<{ status: string; id: number }> {
    return apiFetch("/projets", { method: "POST", body: JSON.stringify(data) });
  },

  /** Modifier un projet */
  updateProjet(projetId: number, data: Record<string, unknown>): Promise<{ status: string }> {
    return apiFetch(`/projets/${projetId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  /** Supprimer un projet (archive) */
  deleteProjet(projetId: number): Promise<{ status: string }> {
    return apiFetch(`/projets/${projetId}`, { method: "DELETE" });
  },

  // ── MISSIONS ────────────────────────────────────────────

  /** Lister les missions */
  listMissions(chantierId?: number, projetId?: number): Promise<{ missions: Mission[] }> {
    const params = new URLSearchParams();
    if (chantierId) params.set("chantier_id", String(chantierId));
    if (projetId) params.set("projet_id", String(projetId));
    const qs = params.toString();
    return apiFetch<Mission[]>(`/missions-user${qs ? `?${qs}` : ""}`).then(list => ({ missions: list }));
  },

  /** Creer une mission (briefing complet) */
  createMission(data: {
    titre: string;
    description?: string;
    chantier_id?: number;
    projet_id?: number;
    bot_primaire?: string;
    priorite?: number;
    participants?: Array<{ type: string; code?: string; nom?: string; role: string }>;
    tags?: string[];
    contexte?: Record<string, unknown>;
  }): Promise<{ status: string; id: number }> {
    return apiFetch("/missions-user", { method: "POST", body: JSON.stringify(data) });
  },

  /** Modifier une mission */
  updateMission(missionId: number, data: Record<string, unknown>): Promise<{ status: string }> {
    return apiFetch(`/missions-user/${missionId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  /** Supprimer une mission (archive) */
  deleteMission(missionId: number): Promise<{ status: string }> {
    return apiFetch(`/missions-user/${missionId}`, { method: "DELETE" });
  },

  /** Lier un thread a une mission */
  linkThreadToMission(missionId: number, threadId: string): Promise<{ ok: boolean }> {
    return apiFetch(`/missions-user/${missionId}/thread`, { method: "POST", body: JSON.stringify({ thread_id: threadId }) });
  },

  // ── IDEES (migration Crystals localStorage → DB) ────────

  /** Lister les idées */
  listIdees(filters?: { chantier_id?: number; projet_id?: number; mission_id?: number }): Promise<Idee[]> {
    const params = new URLSearchParams();
    if (filters?.chantier_id) params.set("chantier_id", String(filters.chantier_id));
    if (filters?.projet_id) params.set("projet_id", String(filters.projet_id));
    if (filters?.mission_id) params.set("mission_id", String(filters.mission_id));
    const qs = params.toString();
    return apiFetch<Idee[]>(`/idees${qs ? `?${qs}` : ""}`);
  },

  /** Creer une idée */
  createIdee(data: {
    titre: string;
    contenu?: string;
    source?: string;
    bot?: string;
    mode?: string;
    tags?: string[];
    chantier_id?: number;
    projet_id?: number;
    mission_id?: number;
  }): Promise<{ status: string; id: number }> {
    return apiFetch("/idees", { method: "POST", body: JSON.stringify(data) });
  },

  /** Supprimer une idée */
  deleteIdee(ideeId: number): Promise<{ status: string }> {
    return apiFetch(`/idees/${ideeId}`, { method: "DELETE" });
  },

  // ── PLAYBOOKS ───────────────────────────────────────────────

  listPlaybooks(): Promise<PlaybookSummary[]> {
    return apiFetch("/playbooks");
  },

  deployPlaybook(playbookId: string, options?: {
    parent_chantier_id?: number;
    parent_projet_id?: number;
    parent_mission_id?: number;
  }): Promise<PlaybookDeployResult> {
    const params = new URLSearchParams();
    if (options?.parent_chantier_id) params.set("parent_chantier_id", String(options.parent_chantier_id));
    if (options?.parent_projet_id) params.set("parent_projet_id", String(options.parent_projet_id));
    if (options?.parent_mission_id) params.set("parent_mission_id", String(options.parent_mission_id));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/playbooks/deploy/${playbookId}${qs}`, { method: "POST" });
  },

  // ── TACHES (4e niveau GHML) ───────────────────────────────

  listTachesUser(filters?: { mission_id?: number; projet_id?: number; chantier_id?: number; status?: string }): Promise<TacheUser[]> {
    const params = new URLSearchParams();
    if (filters?.mission_id) params.set("mission_id", String(filters.mission_id));
    if (filters?.projet_id) params.set("projet_id", String(filters.projet_id));
    if (filters?.chantier_id) params.set("chantier_id", String(filters.chantier_id));
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/taches-user${qs}`);
  },

  getTacheUser(tacheId: number): Promise<TacheUser> {
    return apiFetch(`/taches-user/${tacheId}`);
  },

  createTacheUser(data: Partial<TacheUser>): Promise<{ status: string; id: number }> {
    return apiFetch("/taches-user", { method: "POST", body: JSON.stringify(data) });
  },

  updateTacheUser(tacheId: number, data: Partial<TacheUser>): Promise<{ status: string }> {
    return apiFetch(`/taches-user/${tacheId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteTacheUser(tacheId: number): Promise<{ status: string }> {
    return apiFetch(`/taches-user/${tacheId}`, { method: "DELETE" });
  },

  completeTacheUser(tacheId: number): Promise<{ status: string }> {
    return apiFetch(`/taches-user/${tacheId}/complete`, { method: "POST" });
  },

  // ── CATALOGUES (diagnostics, missions, templates projets) ──

  listDiagnosticsUniversels(): Promise<DiagnosticCatalogue[]> {
    return apiFetch("/diagnostics/catalogue/universels");
  },

  listDiagnosticsSectoriels(industrie?: string): Promise<DiagnosticCatalogue[]> {
    const qs = industrie ? `?industrie=${industrie}` : "";
    return apiFetch(`/diagnostics/catalogue/sectoriels${qs}`);
  },

  listGapsFournisseurs(departement?: string): Promise<GapFournisseur[]> {
    const qs = departement ? `?departement=${departement}` : "";
    return apiFetch(`/diagnostics/catalogue/gaps${qs}`);
  },

  listMissionsCatalogue(): Promise<MissionCatalogue[]> {
    return apiFetch("/missions/catalogue");
  },

  listTemplatesProjetsCatalogue(): Promise<TemplateProjetCatalogue[]> {
    return apiFetch("/templates-projets/catalogue");
  },

  listDiagnosticsEnrichis(departement?: string): Promise<DiagnosticCatalogue[]> {
    const qs = departement ? `?departement=${departement}` : "";
    return apiFetch(`/diagnostics/catalogue/enrichis${qs}`);
  },

  listTemplatesDocumentaires(departement?: string, categorie?: string): Promise<TemplateDocumentaire[]> {
    const params = new URLSearchParams();
    if (departement) params.set("departement", departement);
    if (categorie) params.set("categorie", categorie);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/templates-documentaires/catalogue${qs}`);
  },

  // ── DISCUSSIONS (persistance metadonnees) ─────────────────

  /** Lister les discussions */
  listDiscussions(status?: string): Promise<Discussion[]> {
    const qs = status ? `?status=${status}` : "";
    return apiFetch<Discussion[]>(`/discussions${qs}`);
  },

  /** Creer/enregistrer une discussion */
  createDiscussion(data: { external_id: string; titre?: string; bot_primaire?: string; section?: string; flow_type?: string }): Promise<{ status: string; id: number }> {
    return apiFetch("/discussions", { method: "POST", body: JSON.stringify(data) });
  },

  /** Mettre a jour une discussion */
  updateDiscussion(discussionId: number, data: Record<string, unknown>): Promise<{ status: string }> {
    return apiFetch(`/discussions/${discussionId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  /** Promouvoir une discussion en mission */
  promoteDiscussion(discussionId: number, titreMission?: string): Promise<{ status: string; mission_id: number }> {
    return apiFetch(`/discussions/${discussionId}/promote`, {
      method: "POST",
      body: JSON.stringify({ titre_mission: titreMission }),
    });
  },

  /** Archiver une discussion */
  archiveDiscussion(discussionId: number): Promise<{ status: string }> {
    return apiFetch(`/discussions/${discussionId}/archive`, { method: "POST" });
  },

  /** Sync discussion (upsert par external_id) — fire-and-forget depuis hooks */
  syncDiscussion(data: { external_id: string; titre?: string; status?: string; bot_primaire?: string; work_phase?: string; message_count?: number }): Promise<Record<string, unknown>> {
    return apiFetch("/discussions/sync", { method: "POST", body: JSON.stringify(data) });
  },

  /** Discussions stagnantes */
  staleDiscussions(heures = 48): Promise<Discussion[]> {
    return apiFetch<Discussion[]>(`/discussions/stale?heures=${heures}`);
  },

  // ── COMMAND (BLOC 1) ──────────────────────────────────────

  /** Lancer une mission COMMAND */
  commandStart(message: string, urgency = "routine", scanBots?: string[]): Promise<CommandStartResponse> {
    return apiFetch<CommandStartResponse>("/command/start", {
      method: "POST",
      body: JSON.stringify({ message, urgency, scan_bots: scanBots || [] }),
    });
  },

  /** Status d'une mission COMMAND en cours */
  commandStatus(missionId: number): Promise<CommandStatusResponse> {
    return apiFetch<CommandStatusResponse>(`/command/status/${missionId}`);
  },

  /** Lister les missions COMMAND recentes (deja existe mais on ajoute le typing) */
  commandMissionsList(limit = 20): Promise<{ missions: CommandStatusResponse[]; total: number }> {
    return apiFetch(`/command/missions?limit=${limit}`);
  },

  // ── MODES AUTONOMES (BLOC 2) ────────────────────────────────

  /** Creer une branche de mode autonome */
  flowBranch(req: ModeBranchRequest): Promise<{ ok: boolean; branch: Record<string, unknown> }> {
    return apiFetch("/flow/branch", { method: "POST", body: JSON.stringify(req) });
  },

  /** Avancer dans la branche active */
  flowBranchAdvance(userId = getCurrentUserId()): Promise<{ completed: boolean; branch?: Record<string, unknown>; resume?: Record<string, unknown> }> {
    return apiFetch(`/flow/branch/advance?user_id=${userId}`, { method: "POST" });
  },

  /** Status de la branche active */
  flowBranchStatus(userId = getCurrentUserId()): Promise<{ has_active_branch: boolean; branch: Record<string, unknown> | null }> {
    return apiFetch(`/flow/branch/status?user_id=${userId}`);
  },

  /** Completer la branche active */
  flowBranchComplete(userId = getCurrentUserId()): Promise<{ ok: boolean; resume: Record<string, unknown> }> {
    return apiFetch(`/flow/branch/complete?user_id=${userId}`, { method: "POST" });
  },

  /** Annuler la branche active */
  flowBranchCancel(userId = getCurrentUserId()): Promise<{ ok: boolean; resume: Record<string, unknown> }> {
    return apiFetch(`/flow/branch/cancel?user_id=${userId}`, { method: "POST" });
  },

  // ── BRIEFINGS (BLOC 3) ─────────────────────────────────────

  /** Lister les briefings compiles */
  listBriefings(botCode?: string, typeBriefing?: string, limit = 20): Promise<BriefingListResponse> {
    const params = new URLSearchParams();
    if (botCode) params.set("bot_code", botCode);
    if (typeBriefing) params.set("type_briefing", typeBriefing);
    params.set("limit", String(limit));
    return apiFetch<BriefingListResponse>(`/command/briefings?${params}`);
  },

  /** Compiler les briefings daily */
  compileDaily(): Promise<{ status: string; briefing_ids: number[]; count: number }> {
    return apiFetch("/command/compile/daily", { method: "POST" });
  },

  /** Compiler le briefing Board Meeting */
  compileBoardMeeting(): Promise<{ status: string; briefing_id?: number; message?: string }> {
    return apiFetch("/command/compile/board-meeting", { method: "POST" });
  },

  // ── SUGGESTIONS (BLOC 4) ───────────────────────────────────

  /** Suggestions proactives pour le canvas — filtre par departement */
  suggestions(userId = getCurrentUserId(), botCode?: string): Promise<SuggestionsResponse> {
    const qs = botCode ? `?user_id=${userId}&bot_code=${botCode}` : `?user_id=${userId}`;
    return apiFetch<SuggestionsResponse>(`/suggestions${qs}`);
  },

  // ── QUESTIONNAIRE (BLOC 6) ─────────────────────────────────

  /** Envoyer une action questionnaire */
  questionnaire(commande: string, texte = "", userId = getCurrentUserId()): Promise<QuestionnaireResponse> {
    return apiFetch<QuestionnaireResponse>("/questionnaire", {
      method: "POST",
      body: JSON.stringify({ commande, texte, user_id: userId }),
    });
  },

  /** URL de telechargement d'un cahier PDF */
  cahierDownloadUrl(jobId: string): string {
    return `${BASE_URL}/cahier/${jobId}/download`;
  },

  // ── DIAGNOSTIC ───────────────────────────────────────────────

  /** Recuperer le diagnostic actif */
  getDiagnostic(clientSlug = "usine-bleue"): Promise<import("./types").DiagnosticResponse> {
    return apiFetch(`/diagnostic?client_slug=${clientSlug}`);
  },

  /** Lancer un diagnostic */
  createDiagnostic(req: import("./types").DiagnosticRequest): Promise<import("./types").DiagnosticResponse> {
    return apiFetch("/diagnostic", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // ── CALENDAR ─────────────────────────────────────────────────

  /** Evenements du jour */
  calendarToday(): Promise<{ events: import("./types").CalendarEvent[] }> {
    return apiFetch("/calendar/today");
  },

  /** Evenements sur une plage de dates */
  calendarRange(start: string, end: string): Promise<{ events: { summary: string; start: string; end: string; date: string; formatted: string }[]; count: number }> {
    return apiFetch(`/calendar/range?start=${start}&end=${end}`);
  },

  /** Creneaux libres */
  calendarFree(date?: string): Promise<{ slots: import("./types").CalendarFreeSlot[] }> {
    const q = date ? `?date=${date}` : "";
    return apiFetch(`/calendar/free${q}`);
  },

  /** Creer un evenement */
  calendarCreate(req: import("./types").CalendarCreateRequest): Promise<import("./types").CalendarEvent> {
    return apiFetch("/calendar/create", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // ── PHONE / SMS ──────────────────────────────────────────────

  /** Lancer un appel sortant */
  phoneOutbound(req: import("./types").PhoneOutboundRequest): Promise<import("./types").PhoneOutboundResponse> {
    return apiFetch("/phone/outbound", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** Verifier si un appel est actif */
  phoneActiveRoom(): Promise<import("./types").PhoneActiveRoomResponse> {
    return apiFetch("/phone/active-room");
  },

  /** Envoyer un SMS */
  smsSend(req: import("./types").SmsRequest): Promise<import("./types").SmsResponse> {
    return apiFetch("/sms/send", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // ── ORBIT9 QUALIFICATION ─────────────────────────────────────

  /** Etat de qualification d'un membre */
  orbit9QualificationGet(memberId: number): Promise<import("./types").QualificationState> {
    return apiFetch(`/orbit9/qualification/${memberId}`);
  },

  /** Avancer la qualification d'un membre */
  orbit9QualificationAdvance(memberId: number): Promise<import("./types").QualificationState> {
    return apiFetch(`/orbit9/qualification/${memberId}`, { method: "POST" });
  },

  // ── TRUST RATING (F7) ──────────────────────────────────────────

  /** Creer une evaluation trust */
  trustReviewCreate(data: {
    reviewer_org_id: number;
    reviewed_org_id: number;
    reviewer_role?: string;
    score_qualite: number;
    score_delai: number;
    score_communication: number;
    score_prix: number;
    score_fiabilite: number;
    commentaire?: string;
    interaction_type?: string;
    interaction_id?: number;
  }): Promise<{ review: import("./types").TrustReview }> {
    return apiFetch("/trust-reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Lister les evaluations */
  trustReviewList(params?: {
    reviewed_org_id?: number;
    reviewer_org_id?: number;
    status?: string;
    limit?: number;
  }): Promise<{ reviews: import("./types").TrustReview[]; count: number }> {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return apiFetch(`/trust-reviews${qs}`);
  },

  /** Obtenir une evaluation */
  trustReviewGet(id: number): Promise<{ review: import("./types").TrustReview }> {
    return apiFetch(`/trust-reviews/${id}`);
  },

  /** Modifier une evaluation (moderation, reponse) */
  trustReviewUpdate(id: number, data: { status?: string; reponse?: string; flag_reason?: string }): Promise<{ review: import("./types").TrustReview }> {
    return apiFetch(`/trust-reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Supprimer une evaluation */
  trustReviewDelete(id: number): Promise<{ deleted: boolean }> {
    return apiFetch(`/trust-reviews/${id}`, { method: "DELETE" });
  },

  /** Sommaire trust d'une organisation */
  trustOrgSummary(orgId: number): Promise<import("./types").TrustOrgSummary> {
    return apiFetch(`/trust/org/${orgId}`);
  },

  /** Verifier si on peut evaluer */
  trustCanReview(orgId: number, targetOrgId: number): Promise<{ can_review: boolean; reason?: string }> {
    return apiFetch(`/trust/org/${orgId}/can-review/${targetOrgId}`);
  },

  // ── COMMAND DETECT ───────────────────────────────────────────

  /** Detecter si un message necessite COMMAND */
  commandDetect(message: string, userId = getCurrentUserId()): Promise<import("./types").CommandDetectResponse> {
    return apiFetch("/command/detect", {
      method: "POST",
      body: JSON.stringify({ message, user_id: userId }),
    });
  },

  /** Chat avec streaming SSE — tokens en temps reel */
  chatStream(req: ChatRequest, callbacks: StreamCallback): AbortController {
    const controller = new AbortController();
    const url = `${BASE_URL}/chat/stream`;

    // Global timeout: abort stream after 90s to prevent stuck UI
    const streamTimeout = setTimeout(() => {
      console.warn("[chatStream] Global 90s timeout — aborting stream");
      controller.abort();
    }, 90_000);

    const streamJwt = getJwtToken();
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // C.7 — JWT primary auth for streaming
        ...(streamJwt ? { Authorization: `Bearer ${streamJwt}` } : { "X-API-Key": API_KEY }),
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

        let doneReceived = false;

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
                } else if (currentEvent === "status") {
                  callbacks.onStatus?.(data.s);
                } else if (currentEvent === "done") {
                  doneReceived = true;
                  callbacks.onDone(data as StreamDoneEvent);
                } else if (currentEvent === "auto_consultation") {
                  callbacks.onAutoConsultation?.(data as AutoConsultationEvent);
                } else if (currentEvent === "tool_result") {
                  callbacks.onToolResult?.(data as ToolResultEvent);
                } else if (currentEvent === "team_suggestion") {
                  callbacks.onTeamSuggestion?.(data as TeamSuggestionEvent);
                } else if (currentEvent === "command_available") {
                  callbacks.onCommandAvailable?.(data as CommandAvailableEvent);
                } else if (currentEvent?.startsWith("command_")) {
                  callbacks.onCommandProgress?.({
                    event: currentEvent.replace("command_", ""),
                    bot: data.bot || "",
                    mission_id: data.mission_id,
                    plan: data.plan,
                    tool: data.tool,
                    success: data.success,
                    data: data.data,
                    category: data.category,
                    tools_count: data.tools_count,
                  } as CommandProgressEvent);
                } else if (currentEvent === "workspace") {
                  callbacks.onWorkspaceBlock?.(data as { workspace_block: Record<string, unknown> });
                } else if (currentEvent === "error") {
                  callbacks.onError(data.error || "Unknown stream error");
                }
              } catch {
                // Ignore malformed JSON lines
              }
            }
          }
        }

        clearTimeout(streamTimeout);

        // Safety net: if stream closed without sending event:done,
        // synthesize a done event from accumulated text to prevent UI from being stuck
        if (!doneReceived && accumulated.length > 0) {
          console.warn("[chatStream] Stream closed without done event — synthesizing from accumulated text");
          callbacks.onDone({
            response: accumulated,
            agent: req.agent || "CEOB",
          } as StreamDoneEvent);
        } else if (!doneReceived) {
          callbacks.onError("Stream closed without response");
        }
      })
      .catch((err) => {
        clearTimeout(streamTimeout);
        if (err.name !== "AbortError") {
          callbacks.onError(err.message || "Stream connection failed");
        }
      });

    return controller;
  },

  // ── Memory (cross-canal Telegram ↔ Web) ──

  async memorySearch(query: string, limit = 10): Promise<{ results: string[]; total: number }> {
    const params = new URLSearchParams({ query, limit: String(limit) });
    const res = await apiFetch(`/memory/search?${params}`);
    return res.json();
  },

  async memoryActivities(limit = 50, type?: string): Promise<{ activities: Record<string, unknown>[]; total: number }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (type) params.set("type", type);
    const res = await apiFetch(`/memory/activities?${params}`);
    return res.json();
  },

  async memorySummary(): Promise<Record<string, unknown>> {
    const res = await apiFetch("/memory/summary");
    return res.json();
  },

  async pulse(): Promise<{ items: { id: string; message: string; type: string; source: string; time: string }[]; total: number }> {
    const res = await apiFetch("/pulse");
    return res.json();
  },

  async onboardingSave(data: { step: string; responses: Record<string, string> }): Promise<{ status: string }> {
    const res = await apiFetch("/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 1, ...data }),
    });
    return res.json();
  },

  // ── Diagnostic IA ──

  async diagnosticIACreate(data: Record<string, unknown>): Promise<{ id: number; status: string }> {
    const res = await apiFetch("/diagnostic-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async diagnosticIAList(userId = 1, status?: string): Promise<{ items: import("./types").DiagnosticIA[]; total: number }> {
    const params = new URLSearchParams({ user_id: String(userId) });
    if (status) params.set("status", status);
    const res = await apiFetch(`/diagnostic-ia?${params}`);
    return res.json();
  },

  async diagnosticIAGet(id: number): Promise<import("./types").DiagnosticIA> {
    const res = await apiFetch(`/diagnostic-ia/${id}`);
    return res.json();
  },

  async diagnosticIAUpdate(id: number, data: Record<string, unknown>): Promise<{ ok: boolean }> {
    const res = await apiFetch(`/diagnostic-ia/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async diagnosticIADelete(id: number): Promise<{ ok: boolean }> {
    const res = await apiFetch(`/diagnostic-ia/${id}`, { method: "DELETE" });
    return res.json();
  },

  // ── MEETINGS (D-114) ──

  meetingCreate(req: { title: string; meeting_type?: string; bot_code?: string; bot_codes?: string[]; scheduled_at?: string }): Promise<any> {
    return apiFetch("/meetings", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  meetingList(status?: string): Promise<{ meetings: any[]; total: number }> {
    const params = status ? `?status=${status}` : "";
    return apiFetch(`/meetings${params}`);
  },

  meetingGet(slug: string): Promise<any> {
    return apiFetch(`/meetings/${slug}`);
  },

  meetingJoin(slug: string, req: { display_name: string }): Promise<{ token: string; room_name: string; livekit_url: string; identity: string; display_name: string }> {
    return apiFetch(`/meetings/${slug}/join`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  meetingStart(slug: string): Promise<{ ok: boolean; egress_id?: string }> {
    return apiFetch(`/meetings/${slug}/start`, { method: "POST" });
  },

  meetingEnd(slug: string): Promise<{ ok: boolean }> {
    return apiFetch(`/meetings/${slug}/end`, { method: "POST" });
  },

  meetingTranscript(slug: string): Promise<{ slug: string; entries: any[]; total: number }> {
    return apiFetch(`/meetings/${slug}/transcript`);
  },

  meetingPodcast(slug: string): Promise<any> {
    return apiFetch(`/meetings/${slug}/podcast`);
  },

  meetingPodcastRegenerate(slug: string): Promise<{ ok: boolean }> {
    return apiFetch(`/meetings/${slug}/podcast/regenerate`, { method: "POST" });
  },

  meetingInvite(slug: string, req: { emails: string[]; message?: string; scheduled_at?: string }): Promise<{ slug: string; invitations: any[] }> {
    return apiFetch(`/meetings/${slug}/invite`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  meetingInvitations(slug: string): Promise<{ slug: string; invitations: any[]; total: number }> {
    return apiFetch(`/meetings/${slug}/invitations`);
  },

  calendarSlots(date: string): Promise<{ date: string; slots: any[]; total: number }> {
    return apiFetch(`/calendar/slots?date=${date}`);
  },

  calendarCreateEvent(req: { meeting_slug: string; date: string; heure: string; duree?: number; attendees?: string[] }): Promise<any> {
    return apiFetch("/calendar/event", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // ═══════════════════════════════════════════
  // Multi-User MVP — Sprint F4
  // ═══════════════════════════════════════════

  getMe(): Promise<any> {
    return apiFetch("/auth/me");
  },

  switchTenant(tenantId: number): Promise<any> {
    return apiFetch("/auth/switch-tenant", {
      method: "POST",
      body: JSON.stringify({ tenant_id: tenantId }),
    });
  },

  // Tenants
  getTenants(): Promise<{ tenants: any[] }> {
    return apiFetch("/tenants");
  },

  getTenant(tenantId: number): Promise<any> {
    return apiFetch(`/tenants/${tenantId}`);
  },

  // Users (admin)
  getUsers(): Promise<{ users: any[] }> {
    return apiFetch("/users");
  },

  inviteUser(email: string, role: string = "membre", departmentScope?: string[]): Promise<any> {
    return apiFetch("/users/invite", {
      method: "POST",
      body: JSON.stringify({ email, role, department_scope: departmentScope }),
    });
  },

  updateMembership(userId: number, updates: { role?: string; department_scope?: string[]; autonomy_override?: string; actif?: boolean }): Promise<any> {
    return apiFetch(`/users/${userId}/membership`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Governance
  getApprovals(status: string = "pending"): Promise<{ approvals: any[] }> {
    return apiFetch(`/approvals?status=${status}`);
  },

  approveAction(approvalId: number, note: string = ""): Promise<any> {
    return apiFetch(`/approvals/${approvalId}/approve`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  rejectAction(approvalId: number, note: string = ""): Promise<any> {
    return apiFetch(`/approvals/${approvalId}/reject`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  getGovernanceConfig(): Promise<any> {
    return apiFetch("/governance/config");
  },

  setBotAutonomy(botCode: string, autonomyLevel: string, blockedActions?: string[], maxCost?: number): Promise<any> {
    return apiFetch("/governance/config", {
      method: "PUT",
      body: JSON.stringify({
        bot_code: botCode,
        autonomy_level: autonomyLevel,
        blocked_actions: blockedActions,
        max_cost: maxCost,
      }),
    });
  },

  getBotAutonomy(botCode: string): Promise<{ bot_code: string; autonomy_level: string }> {
    return apiFetch(`/governance/autonomy/${botCode}`);
  },

  // Auth sessions
  getActiveSessions(): Promise<any[]> {
    return apiFetch("/auth/sessions");
  },

  revokeSession(sessionId: number): Promise<any> {
    return apiFetch(`/auth/sessions/${sessionId}`, { method: "DELETE" });
  },

  // Chat H2H
  createChatRoom(name: string, typeRoom: string, memberIds: number[] = [], botCodes: string[] = []): Promise<any> {
    return apiFetch("/chat-rooms", {
      method: "POST",
      body: JSON.stringify({ name, type_room: typeRoom, member_ids: memberIds, bot_codes: botCodes }),
    });
  },

  getChatRooms(): Promise<{ rooms: any[] }> {
    return apiFetch("/chat-rooms");
  },

  getChatMessages(roomId: number, limit: number = 50): Promise<{ messages: any[] }> {
    return apiFetch(`/chat-rooms/${roomId}/messages?limit=${limit}`);
  },

  // Cross-Org / Fonds
  getFundPortfolio(): Promise<{ portfolio: any[] }> {
    return apiFetch("/cross-org/portfolio");
  },

  addToPortfolio(companyId: number, investmentAmount: number = 0, sharingLevel: string = "minimal"): Promise<any> {
    return apiFetch("/cross-org/portfolio", {
      method: "POST",
      body: JSON.stringify({ company_id: companyId, investment_amount: investmentAmount, sharing_level: sharingLevel }),
    });
  },

  getCompanySummary(companyId: number): Promise<{ summary: any }> {
    return apiFetch(`/cross-org/${companyId}/summary`);
  },

  getFundAlerts(): Promise<{ alerts: any[] }> {
    return apiFetch("/cross-org/alerts");
  },

  getFundSynergies(): Promise<{ synergies: any[] }> {
    return apiFetch("/cross-org/synergies");
  },

  // --- DocForge ---

  getDocForgeLibraries(status?: string): Promise<{ libraries: any[]; count: number }> {
    const q = status ? `?status=${status}` : "";
    return apiFetch(`/docforge/libraries${q}`);
  },

  createDocForgeLibrary(data: { titre: string; template_alias?: string; description?: string; tags?: string[]; bot_primaire?: string; source_folder_id?: string; exclusion_rules?: any[]; scan_config?: any }): Promise<{ id: number; ok: boolean }> {
    return apiFetch("/docforge/libraries", { method: "POST", body: JSON.stringify(data) });
  },

  getDocForgeLibrary(id: number): Promise<any> {
    return apiFetch(`/docforge/libraries/${id}`);
  },

  updateDocForgeLibrary(id: number, data: any): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/libraries/${id}`, { method: "POST", body: JSON.stringify(data) });
  },

  deleteDocForgeLibrary(id: number): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/libraries/${id}/delete`, { method: "POST" });
  },

  docForgeIngestDrive(libraryId: number, folderId: string): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/libraries/${libraryId}/ingest-drive`, { method: "POST", body: JSON.stringify({ folder_id: folderId }) });
  },

  docForgeIngestText(libraryId: number, texte: string, titre?: string): Promise<{ ok: boolean; block_id: number }> {
    return apiFetch(`/docforge/libraries/${libraryId}/ingest-text`, { method: "POST", body: JSON.stringify({ texte, titre: titre || "Texte collé" }) });
  },

  docForgeProcess(libraryId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/libraries/${libraryId}/process`, { method: "POST" });
  },

  docForgeProgress(libraryId: number): Promise<{ status: string; nb_blocs: number; nb_faits: number; completude_pct: number; nb_contradictions: number }> {
    return apiFetch(`/docforge/libraries/${libraryId}/progress`);
  },

  docForgeBlocks(libraryId: number, sectionId?: string, status?: string): Promise<{ blocks: any[]; count: number }> {
    const params = new URLSearchParams();
    if (sectionId) params.set("section_id", sectionId);
    if (status) params.set("status", status);
    const q = params.toString() ? `?${params}` : "";
    return apiFetch(`/docforge/libraries/${libraryId}/blocks${q}`);
  },

  docForgeBlockUpdate(blockId: number, data: any): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/blocks/${blockId}`, { method: "POST", body: JSON.stringify(data) });
  },

  docForgeBlockApprove(blockId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/blocks/${blockId}/approve`, { method: "POST" });
  },

  docForgeBlockReject(blockId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/blocks/${blockId}/reject`, { method: "POST" });
  },

  docForgeFacts(libraryId: number, status?: string): Promise<{ facts: any[]; count: number }> {
    const q = status ? `?status=${status}` : "";
    return apiFetch(`/docforge/libraries/${libraryId}/facts${q}`);
  },

  docForgeFactResolve(factId: number, valeur: string): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/facts/${factId}/resolve`, { method: "POST", body: JSON.stringify({ valeur_resolue: valeur, resolu_par: "carl" }) });
  },

  docForgePreview(libraryId: number): Promise<{ markdown: string; length: number }> {
    return apiFetch(`/docforge/libraries/${libraryId}/preview`);
  },

  docForgePublishDrive(libraryId: number, folderId: string): Promise<any> {
    return apiFetch(`/docforge/libraries/${libraryId}/publish-drive`, { method: "POST", body: JSON.stringify({ target_folder_id: folderId }) });
  },

  docForgeTemplates(): Promise<{ templates: any[] }> {
    return apiFetch("/docforge/templates");
  },

  // --- DocForge V2 — Templates DB ---

  docForgeTemplatesV2(typeTemplate?: string): Promise<{ templates: any[]; count: number }> {
    const q = typeTemplate ? `?type_template=${typeTemplate}` : "";
    return apiFetch(`/docforge/templates-v2${q}`);
  },
  docForgeTemplateV2Create(data: { alias: string; titre: string; description?: string; sections?: any[]; keywords?: string[]; mega_prompt?: string; bot_recommande?: string }): Promise<{ id: number; ok: boolean }> {
    return apiFetch("/docforge/templates-v2", { method: "POST", body: JSON.stringify(data) });
  },
  docForgeTemplateV2Get(id: number): Promise<any> {
    return apiFetch(`/docforge/templates-v2/${id}`);
  },
  docForgeTemplateV2Update(id: number, data: Record<string, any>): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/templates-v2/${id}`, { method: "POST", body: JSON.stringify(data) });
  },
  docForgeTemplateV2Delete(id: number): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/templates-v2/${id}/delete`, { method: "POST" });
  },
  docForgeTemplateV2Seed(): Promise<{ ok: boolean; created: number }> {
    return apiFetch("/docforge/templates-v2/seed", { method: "POST" });
  },

  // --- Drive browse/search ---

  driveBrowse(folderId: string): Promise<{ folder_id: string; folders: any[]; files: any[]; total_folders: number; total_files: number }> {
    return apiFetch("/drive/browse", { method: "POST", body: JSON.stringify({ folder_id: folderId }) });
  },
  driveSearch(folderId: string, keyword: string, maxResults?: number): Promise<{ folder_id: string; keyword: string; results: any[]; count: number }> {
    return apiFetch("/drive/search", { method: "POST", body: JSON.stringify({ folder_id: folderId, keyword, max_results: maxResults || 50 }) });
  },

  // --- Fondation Architecture ---

  getVerticals(): Promise<any[]> {
    return apiFetch("/verticals");
  },
  getRegions(params?: { level?: number; parent_id?: number; country_code?: string }): Promise<any[]> {
    const q = new URLSearchParams();
    if (params?.level) q.set("level", String(params.level));
    if (params?.parent_id) q.set("parent_id", String(params.parent_id));
    if (params?.country_code) q.set("country_code", params.country_code);
    const qs = q.toString();
    return apiFetch(`/regions${qs ? `?${qs}` : ""}`);
  },
  getSubscriptionTiers(): Promise<any[]> {
    return apiFetch("/subscription/tiers");
  },
  getSubscriptionCurrent(): Promise<any> {
    return apiFetch("/subscription/current");
  },
  baptizeBot(botName: string): Promise<{ status: string; bot_name: string }> {
    return apiFetch("/user/baptize", { method: "POST", body: JSON.stringify({ bot_name: botName }) });
  },
  setUserMode(mode: "perso" | "pro"): Promise<any> {
    return apiFetch("/user/mode", { method: "PUT", body: JSON.stringify({ mode }) });
  },
  getUtBalance(): Promise<any> {
    return apiFetch("/ut/balance");
  },
  getUtTransactions(): Promise<any[]> {
    return apiFetch("/ut/transactions");
  },
  getOrbit9Pioneers(verticalCode: string): Promise<{ vertical: string; pioneers: any[] }> {
    return apiFetch(`/orbit9/pioneers/${verticalCode}`);
  },

  // ═══════════════════════════════════════
  // Admin — Tenants CRUD
  // ═══════════════════════════════════════

  createTenant(data: Record<string, unknown>): Promise<any> {
    return apiFetch("/tenants", { method: "POST", body: JSON.stringify(data) });
  },
  updateTenant(id: number, data: Record<string, unknown>): Promise<any> {
    return apiFetch(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteTenant(id: number): Promise<{ ok: boolean }> {
    return apiFetch(`/tenants/${id}`, { method: "DELETE" });
  },

  // ═══════════════════════════════════════
  // Admin — Verticals CRUD
  // ═══════════════════════════════════════

  createVertical(data: Record<string, unknown>): Promise<any> {
    return apiFetch("/verticals", { method: "POST", body: JSON.stringify(data) });
  },
  updateVertical(id: number, data: Record<string, unknown>): Promise<any> {
    return apiFetch(`/verticals/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteVertical(id: number): Promise<{ ok: boolean }> {
    return apiFetch(`/verticals/${id}`, { method: "DELETE" });
  },

  // ═══════════════════════════════════════
  // Admin — System tools
  // ═══════════════════════════════════════

  listAuthEvents(limit = 50): Promise<any[]> {
    return apiFetch(`/auth/events?limit=${limit}`);
  },
  listPricingOverrides(): Promise<any[]> {
    return apiFetch("/admin/pricing");
  },
  createPricingOverride(data: Record<string, unknown>): Promise<any> {
    return apiFetch("/admin/pricing", { method: "POST", body: JSON.stringify(data) });
  },
  deletePricingOverride(id: number): Promise<{ ok: boolean }> {
    return apiFetch(`/admin/pricing/${id}`, { method: "DELETE" });
  },
  getSystemStatus(): Promise<any> {
    return apiFetch("/status");
  },
  getTrainingStats(): Promise<any> {
    return apiFetch("/training/stats");
  },
  getBibleTechnique(rescan = false): Promise<any> {
    return apiFetch(`/admin/bible-technique${rescan ? "?rescan=true" : ""}`);
  },

  // ═══════════════════════════════════════
  // Prospects
  // ═══════════════════════════════════════

  listProspectCampaigns(): Promise<any[]> {
    return apiFetch("/prospect/campaigns");
  },
  listProspectSessions(): Promise<any[]> {
    return apiFetch("/prospect/sessions");
  },
  listCampaignTargets(campaignId: number): Promise<any[]> {
    return apiFetch(`/prospect/campaigns/${campaignId}/targets`);
  },

  // ═══════════════════════════════════════
  // Telephonie
  // ═══════════════════════════════════════

  listPhoneAuth(): Promise<any[]> {
    return apiFetch("/phone/auth");
  },
  listPhoneSessions(): Promise<any[]> {
    return apiFetch("/phone/sessions");
  },
  listVocalSessions(): Promise<any[]> {
    return apiFetch("/voice/sessions");
  },

  // ═══════════════════════════════════════
  // Setup / Integrations
  // ═══════════════════════════════════════

  getTenantIntegrations(tenantId: number): Promise<any> {
    return apiFetch(`/tenants/${tenantId}/integrations`);
  },
  saveTenantIntegration(tenantId: number, key: string, data: Record<string, unknown>): Promise<any> {
    return apiFetch(`/tenants/${tenantId}/integrations/${key}`, { method: "PUT", body: JSON.stringify(data) });
  },
  testIntegration(tenantId: number, key: string): Promise<{ ok: boolean; message: string }> {
    return apiFetch(`/tenants/${tenantId}/integrations/${key}/test`, { method: "POST" });
  },

  // ═══════════════════════════════════════
  // Notifications (D3)
  // ═══════════════════════════════════════

  getNotifications(lu?: boolean): Promise<{ notifications: any[] }> {
    const params = lu !== undefined ? `?lu=${lu}` : "";
    return apiFetch(`/notifications${params}`);
  },
  markNotificationRead(notifId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/notifications/${notifId}/read`, { method: "POST" });
  },
  markAllNotificationsRead(): Promise<{ count: number }> {
    return apiFetch("/notifications/read-all", { method: "POST" });
  },
  getNotificationCount(): Promise<{ count: number }> {
    return apiFetch("/notifications/count");
  },

  // ═══════════════════════════════════════
  // Standing Orders (D3)
  // ═══════════════════════════════════════

  getStandingOrders(): Promise<{ orders: any[] }> {
    return apiFetch("/standing-orders");
  },
  createStandingOrder(data: {
    bot_code: string;
    type_ordre: string;
    config?: Record<string, unknown>;
    schedule?: Record<string, unknown>;
  }): Promise<{ id: number }> {
    return apiFetch("/standing-orders", { method: "POST", body: JSON.stringify(data) });
  },
  getStandingOrder(orderId: number): Promise<any> {
    return apiFetch(`/standing-orders/${orderId}`);
  },
  updateStandingOrder(orderId: number, data: Record<string, unknown>): Promise<{ ok: boolean }> {
    return apiFetch(`/standing-orders/${orderId}`, { method: "PUT", body: JSON.stringify(data) });
  },
  pauseStandingOrder(orderId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/standing-orders/${orderId}/pause`, { method: "POST" });
  },
  resumeStandingOrder(orderId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/standing-orders/${orderId}/resume`, { method: "POST" });
  },
  deleteStandingOrder(orderId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/standing-orders/${orderId}`, { method: "DELETE" });
  },
  pauseAllStandingOrders(): Promise<{ count: number }> {
    return apiFetch("/standing-orders/pause-all", { method: "POST" });
  },

  // ═══════════════════════════════════════
  // DocForge Library approve/reject (D2)
  // ═══════════════════════════════════════

  docForgeLibraryApprove(libraryId: number): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/libraries/${libraryId}/approve`, { method: "POST" });
  },
  docForgeLibraryReject(libraryId: number, feedback: string = ""): Promise<{ ok: boolean }> {
    return apiFetch(`/docforge/libraries/${libraryId}/reject`, { method: "POST", body: JSON.stringify({ feedback }) });
  },

  // ═══════════════════════════════════════
  // Discussion Report (Sprint 3B.1)
  // ═══════════════════════════════════════

  generateDiscussionReport(data: { blocks: Record<string, unknown>[]; bot_code: string; participants?: string[] }): Promise<{ block: Record<string, unknown> }> {
    return apiFetch("/workspace/discussion-report", { method: "POST", body: JSON.stringify(data) });
  },

  // ═══════════════════════════════════════
  // Section Action — inline approfondir/reformuler/challenger
  // ═══════════════════════════════════════

  sectionAction(data: {
    action: "approfondir" | "reformuler" | "challenger";
    section_title: string;
    section_content: string;
    block_id?: string;
    bot_code?: string;
  }): Promise<Record<string, unknown>> {
    return apiFetch("/workspace/section-action", { method: "POST", body: JSON.stringify(data) });
  },

  // ═══════════════════════════════════════
  // S117 Phase 4D — Workspace Blocks CRUD (PostgreSQL persistence)
  // ═══════════════════════════════════════

  saveWorkspaceBlocks(data: { discussion_id: string; blocks: Record<string, unknown>[]; user_id?: number; tenant_id?: number }): Promise<{ ok: boolean; saved: number }> {
    return apiFetch("/workspace/blocks/save", { method: "POST", body: JSON.stringify(data) });
  },

  loadWorkspaceBlocks(discussionId: string): Promise<{ blocks: Record<string, unknown>[]; count: number }> {
    return apiFetch(`/workspace/blocks/${discussionId}`);
  },

  updateBlockMaturity(blockId: number, maturity: string): Promise<{ ok: boolean }> {
    return apiFetch(`/workspace/blocks/${blockId}/maturity`, { method: "PATCH", body: JSON.stringify({ maturity }) });
  },

  /** C.56 — Chercher les chantiers existants qui matchent des workspace blocks */
  chantiersMatch(objectifs: string[], department?: string): Promise<{ matches: { chantier_id: number; titre: string; score: number; reason: string; status: string; section_primaire: string }[]; create_new: boolean }> {
    return apiFetch("/chantiers/suggest-match", {
      method: "POST",
      body: JSON.stringify({ objectifs, department: department || "", tags: [] }),
    });
  },

  /** C.56 — Créer un chantier depuis les workspace blocks */
  workspaceToChantier(workspaceBlocks: Record<string, unknown>[], threadId: string, botCode: string, discussionId?: number): Promise<{ chantier_id: number; titre: string; ok: boolean }> {
    return apiFetch("/workspace/to-chantier", {
      method: "POST",
      body: JSON.stringify({ workspace_blocks: workspaceBlocks, thread_id: threadId, bot_code: botCode, discussion_id: discussionId ?? null }),
    });
  },
};
