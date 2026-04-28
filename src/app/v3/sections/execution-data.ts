/**
 * execution-data.ts — Types et constantes pour la section Exécution V3
 *
 * Pattern: COPIE de orbit9-data.ts O9_HEADER_TABS
 * Source: MEGA-PROMPT-DEEP-SEARCH-EXECUTION-VS-OPERATIONS.md (Option C)
 *
 * Utilisé par: ExecutionView, WorkspacePhasesPanel (header tabs)
 */

import { Zap, Flame, Settings, BarChart3 } from "lucide-react";

// ═══ Types ═══

export type ExecutionTabKey = "live" | "chantiers" | "operations" | "retroaction";

// ═══ EXECUTION_HEADER_TABS — Pour le header h-12 de WorkspacePhasesPanel ═══
// Pattern: COPIE de O9_HEADER_TABS / BLUEPRINT_HEADER_TABS
export const EXECUTION_HEADER_TABS: { key: ExecutionTabKey; label: string; icon: React.ElementType }[] = [
  { key: "live",         label: "En direct",    icon: Zap },
  { key: "chantiers",    label: "Chantiers",    icon: Flame },
  { key: "operations",   label: "Opérations",   icon: Settings },
  { key: "retroaction",  label: "Rétroaction",  icon: BarChart3 },
];
