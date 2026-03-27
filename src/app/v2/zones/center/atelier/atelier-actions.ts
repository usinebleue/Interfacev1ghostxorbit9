/**
 * atelier-actions.ts — Actions contextuelles par (mode, stage)
 * Pattern universel: 1 action primaire + 0-2 secondaires par stage
 * Sprint B — Atelier Simulations
 */

export interface ActionConfig {
  label: string;
  variant: "primary" | "secondary";
}

/** Action configs par phase CREDO */
export const CREDO_ACTIONS: Record<string, ActionConfig[]> = {
  C: [{ label: "Analyser...", variant: "primary" }],
  R: [{ label: "Etape suivante", variant: "primary" }],
  E: [
    { label: "Etape suivante", variant: "primary" },
    { label: "Challenger", variant: "secondary" },
  ],
  D: [{ label: "Synthetiser", variant: "primary" }],
  O: [
    { label: "Nouveau mode", variant: "primary" },
    { label: "Recommencer", variant: "secondary" },
  ],
};

/** Couleurs des boutons d'action */
export const ACTION_STYLES = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
  secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
} as const;
