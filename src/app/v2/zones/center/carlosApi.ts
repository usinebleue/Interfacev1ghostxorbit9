/**
 * carlosApi.ts — Client API pour communiquer avec le backend CarlOS
 * Appelle api_rest.py sur le port 8000
 */

const API_BASE = "/api/v1";
const API_KEY = "ghostx-dev-key-2026";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
};

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════

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
}

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
  active_projects: Array<{
    slug: string;
    nom: string;
    secteur: string;
    stage: string;
  }>;
  session_count: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
  budget_jour_usd: number;
  budget_max_usd: number;
  requetes_jour: number;
  souls_charges: number;
  db_connectee: boolean;
}

// ══════════════════════════════════════════════
// API Calls
// ══════════════════════════════════════════════

export async function sendMessage(
  message: string,
  options: {
    userId?: number;
    mode?: string;
    agent?: string;
    ghost?: string;
    direct?: boolean;
  } = {},
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      user_id: options.userId ?? 1,
      mode: options.mode ?? "analyse",
      agent: options.agent ?? null,
      ghost: options.ghost ?? null,
      direct: options.direct ?? true,
    }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchSuggestions(userId: number = 1): Promise<SuggestionsResponse> {
  const res = await fetch(`${API_BASE}/suggestions?user_id=${userId}`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
