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

// ═══ Blueprint header views ═══
export type HeaderView = "blueprint" | "ca" | "comites" | "personnel" | "bot";
