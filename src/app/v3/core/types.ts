/**
 * types.ts — Source unique des types V3 Frame Amorcer
 *
 * RÈGLE: JAMAIS redéfinir ces types dans un composant.
 * TOUJOURS importer depuis ce fichier.
 */

// ═══ Phase AMORCER (8 phases — source: SimAmorcer L165) ═══
export type PhaseKey =
  | "attention"
  | "moderation"
  | "observation"
  | "reflexion"
  | "creation"
  | "execution"
  | "retroaction"
  | "discussion"
  | "operations";

// ═══ Phase Style (structure PC — source: SimAmorcer L172-181) ═══
export interface PhaseStyle {
  label: string;
  letter: string;
  Icon: React.ElementType;
  dot: string;
  badge: string;
  bg: string;
  border: string;
  text: string;
  btnBg: string;
  btnText: string;
  btnBorder: string;
  btnHover: string;
  line: string;
}

// ═══ Section View props standard ═══
export interface SectionProps {
  botCode: string;
  headerGradient?: string;
  showHeader?: boolean;
  hideHeader?: boolean;
  embedded?: boolean;
  onAction?: (phase: string, context?: string) => void;
}

// ═══ GPS types (alignés sur ChatRequest backend) ═══
export type ActiveView =
  | "department"
  | "cockpit"
  | "espace-bureau"
  | "blueprint"
  | "board-room"
  | "war-room"
  | "think-room"
  | "orbit9"
  | "playbooks"
  | "conferenceai";

export type ActiveSubSection = string | null;

// ═══ Drill-down niveaux ═══
export type DrillLevel = "section" | "focus" | "action";

// ═══ 5 modes d'action (poupées russes) ═══
export type ActionMode =
  | "discussion"
  | "reflexion"
  | "conception"
  | "execution"
  | "retroaction";

// ═══ Right section (ce que WorkspacePhasesPanel affiche) ═══
export type RightSection =
  | "cockpit"
  | "chantiers"
  | "blueprint"
  | "dataroom"
  | "playbooks"
  | "conferenceai"
  | "operations"
  | "icons"
  | "admin"
  | "cerveau-btml"
  | null;

// ═══ Orbit9 sections (UNIQUEMENT ce qui est propre à Orbit9 — pas de dédoublement) ═══
export type Orbit9Section =
  | "dashboard"
  | "blueprint"
  | "cellules"
  | "jumelage"
  | "gouvernance"
  | "pionniers"
  | "vitaa"
  | "perso"
  | "feed"
  | "evenements"
  | "creer-cellule"
  | "opportunites";

// ═══ Context mode ═══
export type ContextMode = "brainteam" | "orbit9";

// ═══ CREDO phases (discussion CREDO sub-phases) ═══
export type CredoPhaseKey = "C" | "R" | "E" | "D" | "O" | "done";

// ═══ Workflow items (captures pendant le flow 5 phases) ═══
export interface WorkflowItem {
  id: string;
  phase: string;        // "discussion" | "reflexion" | "creation" | "execution" | "retroaction"
  credoKey?: string;     // "C" | "R" | "E" | "D" | "O" (si capture pendant discussion)
  text: string;
  type: "insight" | "decision" | "action" | "question" | "branch" | "cascade";
  timestamp: number;
}

// ═══ Workspace Block types (workspace dynamique intelligent) ═══
export type WorkspaceBlockType =
  | "diagnostic" | "brainstorm" | "scamper" | "5pourquoi"
  | "plan_action" | "budget" | "timeline" | "metriques"
  | "projets" | "taches" | "recommandations" | "risques"
  | "benchmark" | "challenge" | "synthese" | "rapport" | "libre"
  | "debat" | "decision" | "crise" | "deep_search"
  | "docforge_section" | "docforge_code" | "docforge_tableur"
  | "etat_des_lieux" | "action_result";

// ═══ Action suggestions (boutons contextuels one-shot sur blocs experts) ═══
export interface ActionSuggestion {
  label: string;      // "Ajuster budget"
  prompt: string;     // Message envoye au bot
  target_bot: string; // Code bot cible
}

export interface WorkspaceBlock {
  id: string;
  discussionId?: string;  // UUID du thread associé (Discussion.external_id)
  type: WorkspaceBlockType;
  title: string;
  summary: string;
  structured_data?: Record<string, any>;
  credo_step: "C" | "R" | "E" | "D" | "O";
  credo_sub_section?: string;  // Sub-section within CREDO step (ex: "contexte", "enjeux", "experts")
  confidence: number;
  source: string;         // bot code
  sourceType: "chat" | "voice" | "meeting";
  sectionId?: string;     // Section workspace cible (ex: "credo-r-rechercher")
  timestamp: number;
  replace_block_id?: string;
  action_suggestions?: ActionSuggestion[];
  is_action_result?: boolean;
}

// ═══ Workspace Tasks — taches assignables aux bots/humains ═══
export interface WorkspaceTask {
  id: string;
  titre: string;
  description?: string;
  priorite: "haute" | "moyenne" | "basse";
  assignedBot?: string;
  assignedHuman?: string;
  status: "todo" | "en_cours" | "fait";
  echeance?: string;
  createdFrom?: string; // block ID source
  createdAt: number;
}

// ═══ W.0 — Sous-sections CREDO pour le workspace ═══
export interface CredoSubSection {
  id: string;
  label: string;
  iconName: string;  // lucide icon name (resolved in phase-config)
  description: string;
}

// ═══ Blueprint header views ═══
export type HeaderView = "blueprint" | "ca" | "comites" | "personnel" | "bot";
