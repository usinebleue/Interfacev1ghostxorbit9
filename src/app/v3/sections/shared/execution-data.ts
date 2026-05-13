/**
 * execution-data.ts — Types + mock data pour Agent Pixel + Execution
 *
 * AgentPixelState: etat temps-reel d'un agent en action (D2/D3)
 * PriorityItem: items de la vue Execution Live
 * ActivityItem: flux d'activite recente
 */

// ═══ Agent Pixel — Vue aerienne des agents au travail ═══

export interface AgentPixelState {
  bot_code: string;
  task_id: string;
  task_title: string;
  task_type: string;        // "document" | "spreadsheet" | "code" | "presentation" | "jumelage"
  step: number;
  total_steps: number;
  status: "thinking" | "executing" | "waiting" | "done" | "error";
  thought_preview: string;  // Derniers ~200 chars generes
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  model: string;
  started_at: string;       // ISO timestamp
  updated_at?: string;
  trigger: "manual" | "standing_order" | "autonomous";
  standing_order_id?: number;
}

// ═══ Notifications agent ═══

export interface AgentNotification {
  id: number;
  tenant_id: number;
  user_id: number;
  bot_code: string;
  type_notif: string;
  titre: string;
  message: string;
  data: Record<string, unknown>;
  lu: boolean;
  created_at: string;
}

// ═══ Standing Orders ═══

export interface StandingOrder {
  id: number;
  tenant_id: number;
  user_id: number;
  bot_code: string;
  type_ordre: string;
  config: Record<string, unknown>;
  schedule: Record<string, unknown>;
  status: "actif" | "pause" | "archive";
  last_execution: string | null;
  next_execution: string | null;
  execution_count: number;
  max_executions: number | null;
  created_at: string;
}

// ═══ Execution Live — Priority Items ═══

export interface PriorityItem {
  id: number | string;
  titre: string;
  type: "chantier" | "operation" | "mission";
  urgence: "critique" | "haute" | "normale";
  phase: "planification" | "execution" | "validation" | "livraison";
  progression: number;
  echeance: string;
  botCode?: string;
}

export interface ActivityItem {
  id: string;
  type: "livrable" | "decision" | "alerte" | "completion" | "creation";
  texte: string;
  bot: string;
  time: string;
}

// ═══ Mock data — Agent Pixels ═══

export const MOCK_AGENT_PIXELS: AgentPixelState[] = [
  {
    bot_code: "CEOB",
    task_id: "px-001",
    task_title: "Memo strategique Q3",
    task_type: "document",
    step: 3,
    total_steps: 5,
    status: "executing",
    thought_preview: "Analyse des KPIs Q2 pour identifier les 3 priorites strategiques du prochain trimestre...",
    tokens_in: 2100,
    tokens_out: 380,
    cost_usd: 0.004,
    model: "gemini-2.0-flash",
    started_at: new Date().toISOString(),
    trigger: "standing_order",
    standing_order_id: 7,
  },
  {
    bot_code: "CFOB",
    task_id: "px-002",
    task_title: "Budget previsionnel Q3",
    task_type: "spreadsheet",
    step: 6,
    total_steps: 8,
    status: "executing",
    thought_preview: "Verification croisee des projections avec les donnees comptables...",
    tokens_in: 1240,
    tokens_out: 380,
    cost_usd: 0.003,
    model: "gemini-2.0-flash",
    started_at: new Date().toISOString(),
    trigger: "autonomous",
  },
  {
    bot_code: "CTOB",
    task_id: "px-003",
    task_title: "",
    task_type: "document",
    step: 0,
    total_steps: 0,
    status: "waiting",
    thought_preview: "",
    tokens_in: 0,
    tokens_out: 0,
    cost_usd: 0,
    model: "gemini-2.0-flash",
    started_at: new Date().toISOString(),
    trigger: "manual",
  },
  {
    bot_code: "CMOB",
    task_id: "px-004",
    task_title: "Campagne marketing Q3",
    task_type: "presentation",
    step: 2,
    total_steps: 6,
    status: "executing",
    thought_preview: "Segmentation des audiences cibles pour la campagne manufacturiere REAI...",
    tokens_in: 890,
    tokens_out: 210,
    cost_usd: 0.002,
    model: "gemini-2.0-flash",
    started_at: new Date().toISOString(),
    trigger: "manual",
  },
];

// ═══ Mock data — Priorities ═══

export const MOCK_PRIORITIES: PriorityItem[] = [
  { id: 1, titre: "Migration infrastructure V2", type: "chantier", urgence: "critique", phase: "execution", progression: 72, echeance: "15 juin" },
  { id: 2, titre: "Lancement Module Orbit9", type: "chantier", urgence: "haute", phase: "planification", progression: 25, echeance: "30 juil" },
  { id: 3, titre: "Rapport trimestriel Q2", type: "operation", urgence: "haute", phase: "execution", progression: 60, echeance: "1 juil" },
  { id: 4, titre: "Audit securite annuel", type: "operation", urgence: "normale", phase: "validation", progression: 85, echeance: "20 juin" },
  { id: 5, titre: "Partenariat REAI Phase 2", type: "chantier", urgence: "haute", phase: "planification", progression: 15, echeance: "1 sept" },
];

// ═══ Mock data — Activity Feed ═══

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "livrable", texte: "Rapport Analyse Marche v2 — publie", bot: "CEOB", time: "Il y a 12 min" },
  { id: "a2", type: "decision", texte: "Budget marketing Q3 approuve ($45K)", bot: "CFOB", time: "Il y a 28 min" },
  { id: "a3", type: "creation", texte: "Nouveau chantier: Integration API partenaire", bot: "CTOB", time: "Il y a 1h" },
  { id: "a4", type: "alerte", texte: "Deadline sprint B.4.7 dans 48h", bot: "COOB", time: "Il y a 2h" },
  { id: "a5", type: "completion", texte: "Migration base donnees — complete", bot: "CTOB", time: "Il y a 3h" },
];
