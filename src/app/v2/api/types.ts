/**
 * types.ts — Interfaces TypeScript miroir des modeles Pydantic (api_rest.py)
 * Sprint A — Frame Master V2
 */

// --- Chat ---

export interface ChatRequest {
  message: string;
  user_id?: number;
  agent?: string;
  ghost?: string;
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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agent?: string;
  ghost?: string | null;
  tier?: string;
  latence_ms?: number;
  options?: string[];
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
  { id: "credo", label: "CREDO", color: "bg-blue-600" },
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
