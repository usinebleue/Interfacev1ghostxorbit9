/**
 * types.ts — Interfaces TypeScript miroir des modeles Pydantic (api_rest.py)
 * Sprint A — Frame Master V2
 */

// --- Chat ---

export interface ChatOption {
  id: number;
  label: string;
  description?: string;
}

export interface SentinelAlert {
  type: "repetition" | "over_challenge" | "long_thread" | "deep_branch";
  message: string;
  suggestions: string[];
}

export interface ChatRequest {
  message: string;
  user_id?: number;
  agent?: string;
  ghost?: string;
  mode?: string;
  direct?: boolean;
  // B.1 — metadata de branche
  msg_type?: string;
  parent_id?: string;
  branch_depth?: number;
}

export interface ChatResponse {
  response: string;
  agent: string;
  tier: string;
  modele: string;
  tokens_input: number;
  tokens_output: number;
  cout_usd: number;
  latence_ms: number;
  ghost_actif: string | null;
  // B.1 — reponses structurees
  options?: ChatOption[];
  sentinel_alert?: SentinelAlert | null;
  phase_credo?: string | null;
  mode_actif?: string | null;
  // Canvas Actions — CREDO Trisociation → Canevas
  canvas_actions?: CanvasAction[];
}

// --- Multi-Perspectives ---

export interface MultiChatRequest {
  message: string;
  user_id?: number;
  agents: string[];
  mode?: string;
  ghost?: string;
}

export interface PerspectiveItem {
  agent: string;
  nom: string;
  contenu: string;
  options: ChatOption[];
  tier: string;
  cout_usd: number;
}

export interface MultiChatResponse {
  perspectives: PerspectiveItem[];
  total_cout_usd: number;
  total_latence_ms: number;
}

// --- Bots ---

export interface BotInfo {
  code: string;
  nom: string;
  titre: string;
  role: string;
  departement: string;
  emoji: string;
  ghosts: string[];
  formule: string;
  actif: boolean;
}

export interface BotListResponse {
  bots: BotInfo[];
  total: number;
}

export interface BotActivateResponse {
  succes: boolean;
  message: string;
  agent_actif: string;
}

// --- Clients ---

export interface ClientSummary {
  slug: string;
  nom: string;
  secteur: string;
  region: string;
  stage: string;
  type: string;
}

export interface ClientDetail {
  slug: string;
  nom: string;
  secteur: string;
  donnees: Record<string, unknown> | null;
}

export interface ClientListResponse {
  clients: ClientSummary[];
  total: number;
}

// --- Health ---

export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
  budget_jour_usd: number;
  budget_max_usd: number;
  requetes_jour: number;
  souls_charges: number;
  db_connectee: boolean;
}

// --- Templates ---

export interface TemplateInfo {
  nom: string;
  categorie: string;
}

export interface TemplateListResponse {
  templates: TemplateInfo[];
  total: number;
}

// --- Cahier de Projets ---

export interface CahierRequest {
  client_slug: string;
  use_template?: boolean;
}

export interface CahierJobResponse {
  job_id: string;
  message: string;
}

export interface CahierStatusResponse {
  job_id: string;
  status: "pending" | "generating" | "ready" | "error";
  progress: string[];
  pdf_path: string | null;
  resume: string | null;
  error: string | null;
}

// --- Chat Message (frontend) ---

export type MessageType =
  | "normal"       // question/reponse standard
  | "challenge"    // user a challenge un bot
  | "consultation" // reponse d'un bot consulte (multi-perspective)
  | "synthesis"    // synthese auto-generee par CarlOS
  | "coaching"     // message proactif de CarlOS (encadrement)
  | "decision"     // noeud de decision (options a choisir)
  | "voice";       // transcript vocal (appel LiveKit)

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agent?: string;
  ghost?: string | null;
  tier?: string;
  latence_ms?: number;
  options?: string[];
  // Branch tracking
  msgType?: MessageType;
  parentId?: string;       // ID du message auquel celui-ci repond
  branchDepth?: number;    // 0 = trunk, 1 = sous-branche, 2 = sous-sous-branche
  branchLabel?: string;    // "Challenge #2 — BCT", "Consultation CFO"
  // Streaming
  isStreaming?: boolean;    // true pendant le streaming SSE en cours
  // Canvas Actions associees a cette reponse
  canvasActions?: CanvasAction[];
}

// --- Crystal (idee cristallisee) ---

export interface Crystal {
  id: string;
  titre: string;
  contenu: string;
  source: string;      // thread title
  bot: string;         // agent code
  mode: ReflectionMode;
  date: string;
  tags: string[];
}

// --- Thread (conversation branch) ---

export type ThreadStatus = "active" | "parked" | "completed";

export interface Thread {
  id: string;
  title: string;
  status: ThreadStatus;
  messages: ChatMessage[];
  mode: ReflectionMode;
  primaryBot: string;
  createdAt: string;
  updatedAt: string;
}

// --- Avatar Map (vrais fichiers dans /public/agents/) ---

export const BOT_AVATAR: Record<string, string> = {
  BCO: "/agents/ceo-carlos.png",
  BCT: "/agents/cto-thomas.png",
  BCF: "/agents/cfo-francois.png",
  BCM: "/agents/cmo-sofia.png",
  BCS: "/agents/cso-marc.png",
  BOO: "/agents/coo-lise.png",
  BHR: "/agents/David - CHRO.png",
  BIO: "/agents/Hélène - CIO.png",
  BCC: "/agents/CCO - Émilie.png",
  BPO: "/agents/CPO - Alex.png",
  BRO: "/agents/CRO - Julien.png",
  BLE: "/agents/CLO - Isabelle.png",
};

// --- Sous-titre par bot (affiche dans le header) ---

export const BOT_SUBTITLE: Record<string, string> = {
  BCO: "Agent AI manufacturier",
  BCT: "Technologie & Innovation",
  BCF: "Finance & Tresorerie",
  BCM: "Marketing & Croissance",
  BCS: "Strategie & Ventes",
  BOO: "Operations & Production",
  BFA: "Automatisation & Usine",
  BHR: "Ressources Humaines",
  BIO: "Systemes & Donnees",
  BCC: "Communication & Marque",
  BPO: "Innovation & Produits",
  BRO: "Revenus & Croissance",
  BLE: "Juridique & Conformite",
  BSE: "Securite & Cyber",
};

// Legacy alias
export const AVATAR_MAP = BOT_AVATAR;

// --- Emoji fallback ---

export const BOT_EMOJI: Record<string, string> = {
  BCO: "👔",
  BCT: "💻",
  BCF: "💰",
  BCM: "📢",
  BCS: "🎯",
  BOO: "⚙️",
  BRO: "📈",
  BHR: "👥",
  BSE: "🛡️",
  BLE: "⚖️",
  BPO: "💡",
  BFA: "🏭",
  BIO: "🖥️",
  BCC: "📡",
};

// --- Company Kit (client switcher) ---

export interface KitInfo {
  slug: string;
  nom: string;
  secteur: string;
  nb_employes: number;
  localisation: string;
  ticker: string;
}

export interface KitUserProfile {
  nom: string;
  titre: string;
  photo: string;
  vouvoiement: boolean;
}

// --- Dashboard KPIs par departement (depuis kit JSON) ---

export interface KpiCEO {
  score_sante_globale?: number;
  vitaa?: Record<string, number>;
  triangle_feu?: string;
  piliers_actifs?: number;
  decisions_ce_mois?: number;
  projets_actifs?: number;
  priorite_1?: string;
  [key: string]: unknown;
}

export interface KpiCFO {
  tresorerie?: number;
  burn_rate?: number;
  runway_mois?: number;
  mrr?: number;
  arr?: number;
  marge_brute_pct?: number;
  marge_ebitda_pct?: number;
  revenus_milliards_usd?: number;
  ebitda_milliards_usd?: number;
  benefice_net_milliards_usd?: number;
  free_cash_flow_milliards?: number;
  alerte?: string;
  [key: string]: unknown;
}

export interface KpiGeneric {
  [key: string]: unknown;
}

export interface KpisDepartements {
  CEO?: KpiCEO;
  CFO?: KpiCFO;
  CTO?: KpiGeneric;
  CMO?: KpiGeneric;
  CSO?: KpiGeneric;
  COO?: KpiGeneric;
  CRO?: KpiGeneric;
  CHRO?: KpiGeneric;
  [key: string]: KpiGeneric | undefined;
}

export interface VentesPipeline {
  pipeline_total?: number;
  pipeline_par_etape?: Record<string, { nb: number; valeur: number }>;
  top_prospects?: Array<{
    nom: string;
    secteur?: string;
    valeur: number;
    etape: string;
    probabilite?: number;
  }>;
  [key: string]: unknown;
}

export interface ProjetActif {
  nom: string;
  responsable?: string;
  statut?: string;
  avancement?: number;
  deadline?: string;
  budget?: number;
  depense?: number;
}

export interface EntrepriseInfo {
  nom: string;
  secteur?: string;
  nb_employes?: number;
  localisation?: string;
  ticker?: string;
  [key: string]: unknown;
}

export interface KitActiveResponse {
  user_id: number;
  kit: string | null;
  entreprise: EntrepriseInfo | null;
  user_profile: KitUserProfile | null;
  greeting: string;
  c_level_mapping: Record<string, string> | null;
  available: string[];
  kits_info: KitInfo[];
  // Dashboard data — Tour de Controle dynamique
  kpis_departements?: KpisDepartements | null;
  ventes?: VentesPipeline | null;
  projets_actifs?: ProjetActif[] | null;
  financier?: Record<string, unknown> | null;
  historique_mensuel?: Array<Record<string, unknown>> | null;
  contexte_sectoriel?: Record<string, unknown> | null;
}

export interface KitSetResponse {
  status: string;
  user_id: number;
  kit: string;
  entreprise: string;
}

// --- Canvas Actions (CREDO Trisociation → Canevas) ---

export type CanvasActionType =
  | "navigate"         // Bouche: ouvre une vue
  | "push_content"     // Cerveau: injecte du contenu dans une vue
  | "split_screen"     // Bouche: chat + vue cote a cote
  | "execute"          // Cerveau: lance une action (connexion, generation, etc.)
  | "context_widget"   // Coeur: affiche un widget contextuel overlay
  | "annotate";        // Coeur: highlight/badge sur un element

export type CredoLayer = "bouche" | "cerveau" | "coeur";

export interface CanvasAction {
  type: CanvasActionType;
  layer: CredoLayer;             // quelle couche CREDO declenche
  view?: string;                 // vue cible (ActiveView)
  params?: Record<string, unknown>;  // parametres specifiques a l'action
  data?: unknown;                // contenu a injecter
  message?: string;              // message humain (coaching, annotation)
  priority?: "low" | "normal" | "high";  // urgence
  bot?: string;                  // bot source (BCO, BCT, etc.)
}

// --- Reflection Modes ---

export type ReflectionMode =
  | "credo"
  | "debat"
  | "brainstorm"
  | "crise"
  | "analyse"
  | "decision"
  | "strategie"
  | "innovation"
  | "deep";

export const REFLECTION_MODES: {
  id: ReflectionMode;
  label: string;
  color: string;
}[] = [
  { id: "credo", label: "Standard", color: "bg-blue-600" },
  { id: "debat", label: "Debat", color: "bg-red-600" },
  { id: "brainstorm", label: "Brain", color: "bg-yellow-500" },
  { id: "crise", label: "Crise", color: "bg-orange-600" },
  { id: "analyse", label: "Analyse", color: "bg-green-600" },
  { id: "decision", label: "Decision", color: "bg-purple-600" },
  { id: "strategie", label: "Strat.", color: "bg-indigo-600" },
  { id: "innovation", label: "Innov.", color: "bg-pink-600" },
  { id: "deep", label: "Deep", color: "bg-cyan-600" },
];

// --- CREDO Phases ---

export type CREDOPhase = "C" | "R" | "E" | "D" | "O";

export const CREDO_PHASES: { id: CREDOPhase; label: string; color: string }[] =
  [
    { id: "C", label: "Connecter", color: "bg-blue-500" },
    { id: "R", label: "Rechercher", color: "bg-purple-500" },
    { id: "E", label: "Exposer", color: "bg-amber-500" },
    { id: "D", label: "Demontrer", color: "bg-green-500" },
    { id: "O", label: "Obtenir", color: "bg-red-500" },
  ];
