/**
 * ProspectApi.ts — API client minimal pour le widget CarlOS Prospect
 * Endpoints PUBLICS — pas d'API key requise
 */

let API_URL = 'https://app.usinebleue.ai';

export function setApiUrl(url: string) {
  API_URL = url.replace(/\/+$/, '');
}

export interface ProspectSession {
  session_id: number;
  message: string;
  phase: string;
  playbook: {
    company_name: string;
    primary_color: string;
    logo_url: string | null;
  };
}

export interface MessageResponse {
  message: string;
  phase: string;
  progress: {
    step: number;
    total_steps: number;
    label: string;
    pct: number;
  };
}

export interface GainBar {
  label: string;
  valeur: number;
  valeur_formatted: string;
  color: string;
  icon: string;
  pct_of_total: number;
}

export interface GainsDashboard {
  title: string;
  bars: GainBar[];
  total_annuel: number;
  total_annuel_formatted: string;
  total_mensuel: number;
  total_mensuel_formatted: string;
}

export interface PreRapport {
  entreprise: string;
  score_dia: number;
  niveau: string;
  niveau_color: string;
  total_gains_annuel: number;
  total_gains_formatted: string;
  top_gains: { label: string; valeur: number; valeur_formatted: string }[];
  top_gaps: { dept: string; score: number }[];
  nb_departements_evalues: number;
  teaser: boolean;
  recommandations_floues: string[];
  cta_text: string;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createSession(
  channel = 'widget',
  sourceSite?: string,
  campaignId?: string,
  playbookId?: string
): Promise<ProspectSession> {
  return fetchJson('/api/v1/prospect/session', {
    method: 'POST',
    body: JSON.stringify({
      channel,
      source_site: sourceSite || window.location.href,
      campaign_id: campaignId || null,
      playbook_id: playbookId || null,
    }),
  });
}

export async function sendMessage(sessionId: number, message: string): Promise<MessageResponse> {
  return fetchJson(`/api/v1/prospect/session/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function captureContact(
  sessionId: number,
  data: { email?: string; tel?: string; nom?: string }
): Promise<{ ok: boolean }> {
  return fetchJson(`/api/v1/prospect/session/${sessionId}/capture`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getGains(sessionId: number): Promise<{ dashboard: GainsDashboard }> {
  return fetchJson(`/api/v1/prospect/session/${sessionId}/gains`);
}

export async function getPreRapport(sessionId: number): Promise<{ rapport: PreRapport }> {
  return fetchJson(`/api/v1/prospect/session/${sessionId}/pre-rapport`);
}
