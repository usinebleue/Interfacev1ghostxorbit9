/**
 * conference-workspace-map.ts — Mapping famille conférence → phase workspace
 *
 * Chaque famille de conférence (CREA, EXP, SAIS, etc.) est associée à une phase
 * workspace (discussion, reflexion, creation, execution, retroaction).
 * Les mots-clés Blueprint déclenchent la phase Conception + DocumentWorkspaceView.
 */

export const CONFERENCE_WORKSPACE_MAP: Record<string, {
  phase: string;
  documentKey?: string;
  executionTab?: string;
}> = {
  // Réflexion
  CREA:  { phase: "reflexion" },
  VERT:  { phase: "reflexion" },
  PERS:  { phase: "reflexion" },
  COG:   { phase: "reflexion" },
  // Conception
  SAIS:  { phase: "creation" },
  CONT:  { phase: "creation" },
  VENT:  { phase: "creation" },
  FOR:   { phase: "creation" },
  FORM:  { phase: "creation" },
  // Discussion
  EXP:   { phase: "discussion" },
  MED:   { phase: "discussion" },
  CRISE: { phase: "discussion" },
  REU:   { phase: "discussion" },
  ORB:   { phase: "discussion" },
  PRE:   { phase: "discussion" },
  RH:    { phase: "discussion" },
  // Exécution
  POD:   { phase: "execution", executionTab: "live" },
  // Rétroaction
  REC:   { phase: "retroaction", executionTab: "retroaction" },
};

// Rooms dédiées → phase workspace
export const ROOM_WORKSPACE_MAP: Record<string, { phase: string }> = {
  "board-room": { phase: "retroaction" },
  "war-room":   { phase: "discussion" },
  "think-room": { phase: "reflexion" },
};

// Mots-clés Blueprint → Conception + DocumentWorkspaceView
const BLUEPRINT_KEYWORDS = [
  "business model canvas", "blueprint", "plan stratégique",
  "plan d'affaires", "sommaire exécutif", "swot", "modèle d'affaires",
];

export function getWorkspaceTarget(
  family: string,
  playbookName: string,
  botCode: string
): { phase: string; documentKey?: string; executionTab?: string } {
  // Vérifier d'abord si c'est un Blueprint
  const nameLower = playbookName.toLowerCase();
  if (BLUEPRINT_KEYWORDS.some(kw => nameLower.includes(kw))) {
    return { phase: "creation", documentKey: `blueprint_${botCode}` };
  }
  return CONFERENCE_WORKSPACE_MAP[family] || { phase: "discussion" };
}
