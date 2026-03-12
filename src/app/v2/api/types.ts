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
  // D-101 — GPS du Flow
  active_view?: string;
  active_sub_section?: string;
}

// --- Équipe 3 Bots (Chef d'Orchestre) ---

export interface BotRoleTeam {
  code: string;          // "CTOB"
  name: string;          // "Thierry"
  emoji: string;         // "💻"
  role_tag: "PRIMAIRE" | "ANGLE MORT";
  raison: string;        // Pourquoi ce bot est là
}

export interface TeamProposal {
  bots: BotRoleTeam[];   // Toujours 3 bots
  explication: string;   // Explication LLM en langage naturel
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
  // G — Chef d'Orchestre
  team_proposal?: TeamProposal | null;
  is_diagnostic?: boolean;
  // D-101 — GPS du Flow
  flow_type?: "data" | "action" | null;
  flow_step?: string | null;
  flow_bot_primaire?: string | null;
  // D-101 — Cascade tensions (suggestions de branches vers d'autres sections)
  cascade_suggestions?: CascadeSuggestion[];
  // D-108 — Contexte de bulle dynamique (footer enrichi)
  bubble_context?: BubbleContext | null;
  // S43 — Scaffold progress (anti-hallucination)
  scaffold_progress?: ScaffoldProgress | null;
}

// --- Scaffold (Anti-Hallucination) ---

export interface ScaffoldProgress {
  ancrage: boolean;
  intention: boolean;
  contraintes: boolean;
  completude: number;  // 0, 1, 2 ou 3
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
}

// --- Templates ---

export interface TemplateInfo {
  nom: string;
  categorie: string;
  alias: string;
  chemin: string;
  existe: boolean;
}

export interface TemplateListResponse {
  templates: TemplateInfo[];
  total: number;
  categories: string[];
}

export interface TemplatePreview {
  alias: string;
  nom: string;
  categorie: string;
  contenu_md: string;
  placeholders: string[];
  narratives: { ligne: number; description: string }[];
}

export interface DocumentGenerateRequest {
  template_alias: string;
  donnees: Record<string, string>;
  client: string;
}

export interface DocumentGenerateResponse {
  titre: string;
  nom_fichier: string;
  taille: number;
  format: string;
  taux_remplissage: number;
  download_url: string;
}

// --- Document Workflow (Phase 2 — Lego interactif) ---

export interface DocumentBlock {
  id: string;           // "section-0", "section-1", etc.
  title: string;        // Titre H2/H3
  content: string;      // Contenu markdown de la section
  level: number;        // 2 pour H2, 3 pour H3
  status: "empty" | "draft" | "completed" | "challenged";
}

export type DocumentWorkflowStep = "briefing" | "editing" | "review" | "export";

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
  | "normal"         // question/reponse standard
  | "challenge"      // user a challenge un bot
  | "nuancer"        // user veut nuancer (validation Gemini)
  | "consultation"   // reponse d'un bot consulte (multi-perspective)
  | "synthesis"      // synthese auto-generee par CarlOS
  | "coaching"       // message proactif de CarlOS (encadrement)
  | "decision"       // noeud de decision (options a choisir)
  | "voice"          // transcript vocal (appel LiveKit)
  | "focus_card"     // carte focus injectee depuis le dashboard
  | "team_proposal"  // G — CarlOS propose une equipe 3 bots
  | "diagnostic"     // G — CarlOS pose des questions avant de repondre
  | "plan_action"    // G — Gemini: plan d'action concret
  | "evaluer_risques"// G — Gemini: matrice de risques
  | "deleguer"       // G — Gemini: brief de delegation
  | "scenario_et_si" // G — Gemini: scenarios hypothetiques
  | "fusionner"      // G — Gemini: fusion perspectives multi-bot
  | "fil_parallele"  // G — Gemini: fil de reflexion parallele
  | "command_progress" // COMMAND — progress card pendant execution
  | "command_stage";   // COMMAND — resultat d'un stage termine

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
  branchLabel?: string;    // "Challenge #2 — CTOB", "Consultation CFO"
  // Streaming
  isStreaming?: boolean;    // true pendant le streaming SSE en cours
  // Canvas Actions associees a cette reponse
  canvasActions?: CanvasAction[];
  // Focus Card data (msgType === "focus_card")
  focusCardData?: {
    title: string;
    elementType: string;
    items: Array<{ label: string; value: string }>;
    quickActions: string[];
  };
  // G — Chef d'Orchestre
  teamProposal?: TeamProposal;   // msgType === "team_proposal"
  isDiagnostic?: boolean;        // CarlOS a posé des questions au lieu de répondre
  // D-108 — Contexte dynamique (footer enrichi)
  bubbleContext?: BubbleContext;
  // Cascade suggestions inter-departements
  cascadeSuggestions?: CascadeSuggestion[];
  // S43 — Scaffold progress
  scaffoldProgress?: ScaffoldProgress;
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
  // D-101 — GPS du Flow: lien vers la mission parente
  missionId?: string;
  flowSection?: string;     // "finance", "board-room", etc.
  flowType?: "data" | "action" | "mode_branch";
}

// ─── Missions — structure hiérarchique ───
// Mission = objectif stratégique qui contient N discussions (threads)
// Nomenclature: Mission > Discussion > Branche

export type MissionStatus = "active" | "en_cours" | "en_attente" | "completee" | "archivee";
export type ChantierStatus = "active" | "en_attente" | "completee" | "archivee";
export type ChantierHeat = "brule" | "couve" | "meurt" | "inconnu";
export type EtatCroissance = "inconnu" | "demarrage" | "croissance" | "maturite";
export type OnboardingStep = "accueil" | "identite" | "croissance" | "vitaa" | "herrmann" | "objectifs" | "chantiers" | "complete";
export type MemberType = "manufacturier" | "fournisseur" | "expert_solo" | "entreprise_pro" | "";

// ─── Scores VITAA ───
export interface ScoresVITAA {
  vente: number;
  idee: number;
  temps: number;
  argent: number;
  actif: number;
}

// ─── Profil Herrmann ───
export interface ProfilHerrmann {
  bleu: number;     // analytique
  vert: number;     // organisé
  rouge: number;    // relationnel
  jaune: number;    // visionnaire
}

// ─── Diagnostic Vivant (D-108) ───
// Se raffine à CHAQUE interaction. Session 1 = 10%, Session 50 = 90%.
export interface DiagnosticVivant {
  id: number;
  userId: number;
  memberType: MemberType;
  secteur: string;
  etatCroissance: EtatCroissance;
  scoresVitaa: ScoresVITAA;
  chaleur: ChantierHeat;
  profilHerrmann: ProfilHerrmann;
  objectifImmediat: string;
  vision12Mois: string;
  deltaNotes: string;
  precisionPct: number;          // 0-100 — combien CarlOS connait le user
  onboardingComplete: boolean;
  onboardingStep: OnboardingStep;
  contexte: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Participant (Espace Unifié — multi-participants bots + humains) ───
export interface Participant {
  type: "bot" | "humain";
  code?: string;    // bot code (CEOB, CTOB...) — seulement si type=bot
  nom?: string;     // human name — seulement si type=humain
  role: string;     // "pilote" | "sponsor" | "responsable" | "support" | "observateur"
}

// ─── Chantier (D-108) ───
// Stratégique — semaines/mois. Trié par chaleur VITAA dans la sidebar.
// Ex: "Expansion marché US", "Certification ISO", "Transformation numérique"
// NOTE: field names match the API response (snake_case)
export type ChantierType = "strategique" | "technologique" | "organisationnel" | "culturel" | "environnemental" | "operationnel";

export interface Chantier {
  id: number;
  user_id?: number;
  titre: string;
  description: string;
  chaleur: ChantierHeat;
  type_chantier?: ChantierType;
  scores_vitaa?: ScoresVITAA;
  progression: number;           // 0-100 (moyenne des missions)
  status: ChantierStatus;
  bot_codes?: string[];          // bots impliqués (multi-département)
  section_primaire?: string;
  source?: "onboarding" | "tension" | "manuel";
  missions?: Mission[];          // populated frontend-side
  tags?: string[];
  objectifs?: string[];
  echeance?: string | null;
  budget_estime?: string;
  indicateurs_cles?: string[];
  risques?: string[];
  participants?: Participant[];
  missions_count?: number;
  created_at: string;
  updated_at: string;
}

// ─── Projet (Espace Unifié — niveau organisationnel) ───
export interface Projet {
  id: number;
  user_id?: number;
  chantier_id?: number | null;
  titre: string;
  description: string;
  status: string;
  progression: number;
  bot_primaire: string;
  bot_codes?: string[];
  participants?: Participant[];
  objectifs?: string[];
  echeance?: string | null;
  tags?: string[];
  section?: string;
  source?: string;
  contexte?: Record<string, unknown>;
  missions_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjetCreate {
  titre: string;
  description?: string;
  chantier_id?: number;
  bot_primaire?: string;
  bot_codes?: string[];
  participants?: Participant[];
  objectifs?: string[];
  echeance?: string;
  tags?: string[];
  section?: string;
  contexte?: Record<string, unknown>;
}

// ─── Mission (D-108) ───
// Tactique — jours/semaines. Rattachée à un chantier ou libre.
// Ex: "Étude de marché US", "Recruter VP Ventes", "Audit fournisseurs"
// NOTE: field names match the API response (snake_case)
export interface Mission {
  id: number;
  user_id?: number;
  chantier_id?: number | null;   // null = mission libre
  projet_id?: number | null;     // null = skip-level
  titre: string;
  description: string;
  status: MissionStatus;
  progression: number;           // 0-100
  bot_primaire: string;
  section?: string;
  flow_type?: "data" | "action" | "mode_branch";
  tension_id?: number | null;
  command_mission_id?: number | null;
  thread_ids: string[];          // discussions (frontend thread UUIDs)
  priorite: number;              // 0-100
  participants?: Participant[];
  tags?: string[];
  contexte?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

// ─── Discussion (metadonnees persistees — messages en localStorage) ───
// Pipeline: Discussion → Mission → Chantier

export type DiscussionStatus = "active" | "parked" | "closed_promoted" | "closed_archived";

export interface Discussion {
  id: number;
  user_id?: number;
  external_id: string;           // UUID du thread frontend
  titre: string;
  status: DiscussionStatus;
  mission_id?: number | null;    // rempli quand promue
  bot_primaire: string;
  section?: string;
  flow_type?: "data" | "action" | "mode_branch";
  message_count: number;
  last_user_message_at?: string | null;
  participants?: Participant[];
  tags?: string[];
  contexte?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
}

// ─── Contexte de bulle dynamique ───
// Footer enrichi par bulle : GPS section, CREDO phase, mode réflexion, mission
export interface BubbleContext {
  section?: string | null;
  flow_type?: "data" | "action" | null;
  flow_step?: string | null;
  credo_phase?: string | null;
  mode?: string | null;
  is_branch?: boolean;
  precision_pct?: number;
  chantier_nom?: string | null;
  // S43 — QC Sentinel feedback
  command_active?: boolean;
  command_urgency?: string;
  command_bots?: string[];
  command_qc?: CommandQCStatus;
}

export interface CommandQCStatus {
  stage: string;           // "scan" | "strategy" | "execution" | "bilan" | "done"
  checks_passed: number;
  checks_total: number;
  warnings?: string[];
  retries?: number;
}

export interface CascadeSuggestion {
  target_section: string;
  message: string;
  view: string;
  sub_section: string;
}


// --- Avatar Map (vrais fichiers dans /public/agents/) ---

export const BOT_AVATAR: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-profil-v3.png",
  CTOB: "/agents/generated/cto-thierry-profil-v3.png",
  CFOB: "/agents/generated/cfo-francois-profil-v3.png",
  CMOB: "/agents/generated/cmo-martine-profil-v3.png",
  CSOB: "/agents/generated/cso-sophie-profil-v3.png",
  COOB: "/agents/generated/coo-olivier-profil-v3.png",
  CPOB: "/agents/generated/factory-bot-profil-v3.png",
  CHROB: "/agents/generated/chro-helene-profil-v3.png",
  CINOB: "/agents/generated/cino-ines-profil-v3.png",
  CROB: "/agents/generated/cro-raphael-profil-v3.png",
  CLOB: "/agents/generated/clo-louise-profil-v3.png",
  CISOB: "/agents/generated/ciso-secbot-profil-v3.png",
};

// --- Sous-titre par bot (affiche dans le header) ---

export const BOT_SUBTITLE: Record<string, string> = {
  CEOB: "CarlOS AI — Chef d'orchestre",
  CTOB: "Technologie & Innovation",
  CFOB: "Finance & Tresorerie",
  CMOB: "Marketing & Croissance",
  CSOB: "Strategie & Ventes",
  COOB: "Operations & Production",
  CPOB: "Automatisation & Usine",
  CHROB: "Ressources Humaines",
  CINOB: "Innovation & R&D",
  CROB: "Revenus & Croissance",
  CLOB: "Juridique & Conformite",
  CISOB: "Securite & Cyber",
};

// Legacy alias
export const AVATAR_MAP = BOT_AVATAR;

// --- Emoji fallback ---

export const BOT_EMOJI: Record<string, string> = {
  CEOB: "👔",
  CTOB: "💻",
  CFOB: "💰",
  CMOB: "📢",
  CSOB: "🎯",
  COOB: "⚙️",
  CROB: "📈",
  CHROB: "👥",
  CISOB: "🛡️",
  CLOB: "⚖️",
  CPOB: "🏭",
  CINOB: "🖥️",
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
  | "annotate"         // Coeur: highlight/badge sur un element
  | "focus";           // Focus Mode: ancre un element + ouvre LiveChat en dessous

export type CredoLayer = "bouche" | "cerveau" | "coeur";

export interface CanvasAction {
  type: CanvasActionType;
  layer: CredoLayer;             // quelle couche CREDO declenche
  view?: string;                 // vue cible (ActiveView)
  params?: Record<string, unknown>;  // parametres specifiques a l'action
  data?: unknown;                // contenu a injecter
  message?: string;              // message humain (coaching, annotation)
  priority?: "low" | "normal" | "high";  // urgence
  bot?: string;                  // bot source (CEOB, CTOB, etc.)
}

// --- Idee (migration Crystals localStorage → PostgreSQL) ---

export interface Idee {
  id: number;
  titre: string;
  contenu: string;
  source: string;
  bot: string;
  mode: string;
  tags: string[];
  chantier_id?: number | null;
  projet_id?: number | null;
  mission_id?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface IdeeCreate {
  titre: string;
  contenu?: string;
  source?: string;
  bot?: string;
  mode?: string;
  tags?: string[];
  chantier_id?: number;
  projet_id?: number;
  mission_id?: number;
}

// --- Playbooks ---

export interface PlaybookSummary {
  id: string;
  type_chantier: string;
  titre_template: string;
  description: string;
  bots_suggeres: string[];
  nb_projets: number;
  nb_missions: number;
}

export interface PlaybookDeployResult {
  status: string;
  chantier_id: number;
  projets: { id: number; titre: string }[];
  missions: { id: number; titre: string; projet_id: number }[];
  playbook_id: string;
}

// --- Catalogues (Diagnostics, Missions, Templates Projets) ---

export interface DiagnosticDataPoint {
  cle: string;
  label: string;
  type: string;
  options?: string[];
  benchmark_industrie: string;
  critique: boolean;
  unite: string;
}

export interface DiagnosticGap {
  gap: string;
  impact: string;
  fournisseurs_types: string[];
  chantier_suggere: string;
  playbook_suggere: string;
}

export interface DiagnosticDocument {
  type: string;
  titre: string;
  description: string;
  pages_estimees?: number;
}

export interface DiagnosticCatalogue {
  id: string;
  titre: string;
  description: string;
  departement: string;
  bot_primaire: string;
  bots_support: string[];
  industrie: string | null;
  duree_minutes: number;
  nb_questions: number;
  valeur_potentielle: string;
  gradient: string;
  data_points: DiagnosticDataPoint[];
  gaps_typiques: DiagnosticGap[];
  documents_generes: DiagnosticDocument[];
}

export interface GapFournisseur {
  id: string;
  titre: string;
  description: string;
  departement: string;
  bot_primaire: string;
  industrie: string | null;
  gaps: Array<{
    gap: string;
    impact: string;
    score_urgence?: number;
    fournisseurs_types: string[];
    budget_typique?: string;
    delai_typique?: string;
  }>;
}

export interface MissionCatalogue {
  id: string;
  titre: string;
  description: string;
  bot_primaire: string;
  bots_support: string[];
  categorie: string;
  taches_types: string[];
  documents_suggeres: Array<{ type: string; titre: string; description: string }>;
  frequence_typique: string;
  duree_typique: string;
}

export interface TemplateProjetCatalogue {
  id: string;
  titre: string;
  description: string;
  type_chantier_typique: string;
  industrie: string | null;
  bot_primaire: string;
  bots_support: string[];
  missions_suggerees: Array<{
    titre: string;
    description: string;
    bot_primaire: string;
    taches_types: string[];
    documents_suggeres: Array<{ type: string; titre: string; description: string }>;
  }>;
  kpis: string[];
  duree_estimee: string;
}

export interface TemplateDocSection {
  ordre: number;
  titre_section: string;
  description: string;
  type_contenu: string;
  champs_cles: string[];
  exemple_contenu: string;
}

export interface TemplateDocumentaire {
  id: string;
  departement: string;
  titre: string;
  description: string;
  categorie: string;
  frequence: string;
  pages_estimees: string;
  niveau_hierarchie: string;
  sections: TemplateDocSection[];
  tags: string[];
  documents_lies: string[];
  source_donnees: string;
}

// --- Bureau (Espace Bureau) ---

export interface BureauItem {
  id: number;
  type_item: "document" | "outil";
  titre: string;
  description: string;
  status: string;
  bot: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  mission_id?: number | null;
  chantier_id?: number | null;
  projet_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface BureauItemCreate {
  type_item: "document" | "outil";
  titre: string;
  description?: string;
  status?: string;
  bot?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  mission_id?: number;
  chantier_id?: number;
  projet_id?: number;
}

export interface BureauItemUpdate {
  titre?: string;
  description?: string;
  status?: string;
  bot?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  mission_id?: number;
  chantier_id?: number;
  projet_id?: number;
}

export interface BureauListResponse {
  items: BureauItem[];
  total: number;
}

// --- Taches Plane.so ---

export interface PlaneTache {
  id: string;
  name: string;
  priority: string;
  sequence_id: number | null;
  state: string | null;
  labels: string[];
  created_at: string;
  updated_at: string;
}

export interface PlaneTacheDetail {
  id: string;
  name: string;
  description_html: string;
  priority: string;
  state: string | null;
  sequence_id: number | null;
  labels: string[];
  created_at: string;
  updated_at: string;
  comments: Array<{ id: string; comment: string; created_at: string }>;
}

export interface PlaneTacheCreate {
  titre: string;
  description?: string;
  priorite?: string;
  agent?: string;
}

export interface PlaneTacheListResponse {
  taches: PlaneTache[];
  total: number;
}

// --- Decision Log (D-098 Gouvernance CarlOS) ---

export type DecisionType = 'action' | 'navigation' | 'creation' | 'modification' | 'suppression' | 'recommandation';
export type AutonomyLevel = 'observer' | 'copilot' | 'autopilot';

export interface DecisionLogEntry {
  id: number;
  bot_code: string;
  type_decision: DecisionType;
  section: string;
  titre: string;
  description: string;
  contexte: Record<string, unknown>;
  resultat: Record<string, unknown>;
  reversible: boolean;
  reversed: boolean;
  reversed_at?: string | null;
  autonomy_level: AutonomyLevel;
  created_at: string;
}

export interface DecisionLogCreate {
  bot_code: string;
  type_decision: DecisionType;
  titre: string;
  description?: string;
  section?: string;
  contexte?: Record<string, unknown>;
  resultat?: Record<string, unknown>;
  reversible?: boolean;
  autonomy_level?: AutonomyLevel;
}

export interface DecisionLogListResponse {
  decisions: DecisionLogEntry[];
  total: number;
}

// --- Tensions (D-100 — TENSION → MISSION → DÉCISION) ---

export type VitaaPilier = "vente" | "idee" | "temps" | "argent" | "actif";
export type TriangleDuFeu = "brule" | "couve" | "meurt";
export type TensionStatus = "active" | "en_mission" | "resolue" | "escaladee" | "archivee";
export type TensionSource = "chat" | "voice" | "dashboard" | "bot_alert" | "board" | "auto";

export interface Tension {
  id: number;
  user_id: number;
  type_vitaa: VitaaPilier;
  intensite: TriangleDuFeu;
  source: TensionSource;
  titre: string;
  description: string;
  bot_codes: string[];
  mission_id: number | null;
  status: TensionStatus;
  contexte: Record<string, unknown>;
  created_at: string | null;
  resolved_at: string | null;
}

export interface TensionCreate {
  type_vitaa: VitaaPilier;
  intensite?: TriangleDuFeu;
  titre: string;
  description?: string;
  source?: TensionSource;
  bot_codes?: string[];
  contexte?: Record<string, unknown>;
}

export interface TensionClassifyResult {
  type_vitaa: VitaaPilier;
  intensite: TriangleDuFeu;
  confidence: number;
  piliers_detectes: Record<string, number>;
  bot_codes: string[];
}

export interface TensionListResponse {
  tensions: Tension[];
  total: number;
}

// --- Orbit9 (Members, Cellules, Matches, Trisociation) ---

export interface Orbit9Member {
  id: number;
  nom: string;
  secteur: string;
  ville: string;
  status: "actif" | "invite" | "inactif";
  role: string;
  avatar: string;
  nb_bots: number;
  nb_employes: number;
  chiffre_affaires: string;
  specialites: string[];
  vitaa_scores: Record<string, number>;
  contact_email: string;
  qualification_step: string;
  created_at: string;
}

export interface Orbit9Cellule {
  id: number;
  nom: string;
  type_cellule: string;
  secteur_focus: string;
  fondateur_id: number | null;
  membre_ids: number[];
  max_membres: number;
  status: string;
  gouvernance: Record<string, unknown>;
  duree_projet: string;
  created_at: string;
}

export interface Orbit9MatchCandidat {
  member_id: number;
  nom: string;
  score: number;
  raison: string;
}

export interface Orbit9Match {
  id: number;
  demandeur_id: number;
  besoin: string;
  criteres: string[];
  candidats: Orbit9MatchCandidat[];
  gagnant_ids: number[];
  status: string;
  trisociation_room: string;
  scout_results: { nom: string; secteur: string; contact: string; raison: string }[];
  created_at: string;
}

export interface TrisociationResponse {
  room_name: string;
  token: string;
  livekit_url: string;
  match_id: number;
}

export interface Orbit9MemberListResponse {
  members: Orbit9Member[];
  total: number;
}

export interface Orbit9MatchListResponse {
  matches: Orbit9Match[];
  total: number;
}

export interface Orbit9CelluleListResponse {
  cellules: Orbit9Cellule[];
  total: number;
}

// --- Jumelage Live (questions + scoring detaille) ---

export interface JumelageReponse {
  member_id: number;
  nom: string;
  reponse: string;
  score: number;
}

export interface JumelageQuestion {
  id: number;
  question: string;
  reponses: JumelageReponse[];
}

export interface JumelageQuestionsResponse {
  questions: JumelageQuestion[];
}

export interface ScoringCategory {
  label: string;
  weight: string;
}

export interface ScoringResult {
  nom: string;
  member_id: number;
  scores: number[];
  total: number;
}

export interface JumelageScoringResponse {
  categories: ScoringCategory[];
  results: ScoringResult[];
}

// --- COMMAND Mission (BLOC 1) ---

export interface CommandStartRequest {
  message: string;
  urgency?: "routine" | "tactical" | "crisis";
  scan_bots?: string[];
  user_id?: number;
}

export interface CommandStartResponse {
  mission_id: number;
  status: string;
  scan_bots: string[];
  urgency: string;
}

export interface CommandStatusResponse {
  id: number;
  stage: string;
  message_original: string;
  scan_bots: string[];
  stage_results: Record<string, unknown>;
  summary: string;
  completed: boolean;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

export type CommandStageKey = "scan" | "strategy" | "execution" | "bilan";

export interface CommandMissionListResponse {
  missions: CommandStatusResponse[];
  total: number;
}

// --- Mode Branch (BLOC 2) ---

export interface ModeBranchRequest {
  mode: string;
  user_id?: number;
  credo_phase?: string;
  credo_section?: string;
}

export interface ModeBranchState {
  mode: string;
  current_step: string;
  step_index: number;
  total_steps: number;
  steps: string[];
}

// --- Briefings (BLOC 3) ---

export interface Briefing {
  id: number;
  bot_code: string;
  type_briefing: string;
  titre: string;
  contenu: string;
  data: Record<string, unknown>;
  periode_debut: string | null;
  periode_fin: string | null;
  created_at: string;
}

export interface BriefingListResponse {
  briefings: Briefing[];
  total: number;
}

// --- Suggestions (BLOC 4) ---

export interface SuggestionItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  mode: string | null;
  action: string;
  priority: number;
}

export interface SuggestionsResponse {
  greeting: string;
  suggestions: SuggestionItem[];
  active_projects: Array<{ slug: string; nom: string; secteur: string; stage: string }>;
  session_count: number;
}

// --- Questionnaire (BLOC 6) ---

export interface QuestionnaireRequest {
  commande?: string;
  texte: string;
  user_id?: number;
}

export interface QuestionnaireResponse {
  reponse: string;
  en_session: boolean;
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

// --- Diagnostic (GET/POST /diagnostic) ---

export interface DiagnosticRequest {
  user_id?: number;
  client_slug?: string;
  type?: string;
}

export interface DiagnosticResponse {
  id?: number;
  client_slug: string;
  type: string;
  scores: Record<string, number>;
  triangle_feu: string;
  recommandations: string[];
  created_at?: string;
}

// --- Calendar (3 endpoints) ---

export interface CalendarEvent {
  id?: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export interface CalendarFreeSlot {
  start: string;
  end: string;
  duration_minutes: number;
}

export interface CalendarCreateRequest {
  summary: string;
  start: string;
  end: string;
  description?: string;
  attendees?: string[];
}

// --- Phone / SMS ---

export interface PhoneOutboundRequest {
  to: string;
  bot_code?: string;
  user_id?: number;
}

export interface PhoneOutboundResponse {
  status: string;
  room_name?: string;
  call_sid?: string;
}

export interface PhoneActiveRoomResponse {
  active: boolean;
  room_name?: string;
  bot_code?: string;
  started_at?: string;
}

export interface SmsRequest {
  to: string;
  body: string;
  user_id?: number;
}

export interface SmsResponse {
  status: string;
  message_sid?: string;
}

// --- Orbit9 Qualification ---

export interface QualificationState {
  member_id: number;
  current_step: number;
  total_steps: number;
  steps_completed: string[];
  steps_remaining: string[];
  completed: boolean;
}

// --- Command Detect ---

export interface CommandDetectRequest {
  message: string;
  user_id?: number;
}

export interface CommandDetectResponse {
  command_active: boolean;
  urgency: string;
  scan_bots: string[];
  raison: string;
}

// --- Diagnostic IA ---

export interface DiagnosticIA {
  id: number;
  user_id: number;
  nom_entreprise: string;
  secteur: string;
  nb_employes: string;
  chiffre_affaires: string;
  defi_principal: string;
  profil_type: string;
  taille_categorie: string;
  nb_departements: number;
  reponses: Record<string, number>;
  scores_departements: Record<string, number>;
  score_absorption: number;
  score_dia: number;
  score_sei: number;
  niveau: string;
  top_gaps: { botCode: string; score: number; label: string }[];
  ghost_team: { botCode: string; score: number; raison: string; priorite: string }[];
  status: string;
  departement_courant: number;
  contact_nom: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}
