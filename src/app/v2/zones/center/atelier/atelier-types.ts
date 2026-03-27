/**
 * atelier-types.ts — Types partages pour tous les Ateliers split-screen
 * Sprint B — Atelier Simulations
 */

export type AtelierStage = number;

export interface AtelierAction {
  label: string;
  icon?: React.ElementType;
  variant: "primary" | "secondary" | "ghost";
  onClick: () => void;
}

export interface StageConfig {
  id: string;
  label: string;
  credoPhase: "C" | "R" | "E" | "D" | "O";
}

export interface AtelierMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  description: string;
  stageCount: number;
}

export interface ChatMessage {
  type: "user" | "bot" | "thinking" | "consult";
  botCode?: string;
  text?: string;
  phaseLabel?: string;
  thinkingSteps?: { icon: React.ElementType; text: string }[];
  consultBots?: { emoji: string; name: string; code?: string }[];
}
