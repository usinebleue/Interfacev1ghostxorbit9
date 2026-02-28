/**
 * simulation-types.ts — Types partages pour toutes les simulations
 * Sprint A — Frame Master V2
 */

export type CREDOPhase = "C" | "R" | "E" | "D" | "O" | "done";
export type CristalType = "idee" | "banque" | "document" | null;
export type SourceType = "doc" | "stat" | "data";

export interface Source {
  type: SourceType;
  label: string;
}

export interface ThinkingStep {
  icon: React.ElementType;
  text: string;
}

export interface Perspective {
  emoji: string;
  code: string;
  name: string;
  angle: string;
  text: string;
  verdict: string;
  color: "green" | "yellow" | "orange" | "red";
  sources: Source[];
}

export interface ConsultBot {
  emoji: string;
  name: string;
  code?: string;
}

export interface InlineOption {
  num: number;
  text: string;
  consequence: string;
}

export interface ThreadInfo {
  id: string;
  title: string;
  emoji: string;
  phase: CREDOPhase;
  status: "active" | "parked" | "completed";
  contributions: number;
}

export interface BotColorConfig {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  ring: string;
  dot: string;
  emoji: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ReflectionMode {
  id: string;
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  ring: string;
}
