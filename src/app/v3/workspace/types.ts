/**
 * types.ts — Types du Workspace Dynamique V3
 *
 * Architecture 3 couches:
 * 1. Registre de phases (config pure, zéro JSX)
 * 2. WorkspaceFrame (composant universel DocForge)
 * 3. Renderers de contenu (par type)
 */

import type { ActionMode } from "../core/types";

// ═══ Phase étendue (5 actions + opérations) ═══
export type WorkspacePhaseKey = ActionMode | "operations";

// ═══ Types de renderers disponibles ═══
export type ContentRenderer =
  | "editor"       // Éditeur texte riche (DocForge)
  | "checklist"    // Liste de validation à cocher
  | "dashboard"    // KPIs + métriques
  | "timeline"     // Timeline chronologique
  | "multi-bot"    // Grille multi-perspectives (3+ bots)
  | "matrix"       // Matrice d'analyse (SWOT, risques)
  | "document"     // Document structuré en lecture
  | "form"         // Formulaire de saisie
  | "kanban"       // Vue kanban (colonnes)
  | "hierarchie";  // Drill-down 4 niveaux (même pattern que chantiers)

// ═══ Section TOC (sidebar gauche du workspace) ═══
export interface WorkspaceTocSection {
  id: string;
  label: string;
  icon: string;                        // Nom lucide-react (résolu au rendu)
  renderer: ContentRenderer;
  subSections?: WorkspaceTocSection[];
  requiredRole?: string[];             // Bots requis (ex: ["CFOB"] pour budget)
  optional?: boolean;
}

// ═══ Type de livrable ═══
export type LivrableType =
  | "note"
  | "diagnostic"
  | "rapport"
  | "plan"
  | "budget"
  | "document"
  | "template"
  | "bilan"
  | "operation";

// ═══ Config d'une phase workspace ═══
export interface WorkspacePhaseConfig {
  key: WorkspacePhaseKey;
  label: string;
  icon: string;                        // Nom lucide-react
  colorKey: string;                    // Clé dans PHASE_CONFIG pour réutiliser les couleurs

  // Sections TOC
  sections: WorkspaceTocSection[];

  // Types de livrables
  livrables: LivrableType[];

  // Transition
  nextPhase: WorkspacePhaseKey | null;

  // Contexte requis
  contextLevel: "chantier" | "projet" | "mission" | "tache" | "any";
}

// ═══ Props du WorkspaceFrame ═══
export interface WorkspaceFrameProps {
  phase: WorkspacePhaseKey;
  botCode: string;
  contextId?: number;
  contextType?: "chantier" | "projet" | "mission" | "tache";
  onPhaseComplete?: (nextPhase: WorkspacePhaseKey) => void;
}

// ═══ Props standard des renderers ═══
export interface RendererProps {
  sectionConfig: WorkspaceTocSection;
  phaseKey: WorkspacePhaseKey;
  botCode: string;
  contextId?: number;
  data?: Record<string, unknown>;
  onUpdate?: (data: Record<string, unknown>) => void;
}

// ═══ État d'une section (progression) ═══
export type SectionStatus = "empty" | "in_progress" | "completed";

export interface SectionState {
  id: string;
  status: SectionStatus;
  data?: Record<string, unknown>;
}
