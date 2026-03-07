/**
 * BibleTechniquePage.tsx — Bible Technique GHML
 * Reference technique complete de la plateforme CarlOS / GhostX
 * 7 onglets : Bots & Skills | API & Endpoints | Backend | Base de Donnees | Infrastructure | Integrations | Securite
 * 12 Bots officiels — ZERO intrus (pas de BCC/BPO)
 */

import { useState } from "react";
import {
  Server, Users, Globe, Database, Shield, Cpu, Link2,
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  Terminal, HardDrive, Lock, Wifi, Layers,
  Mic, Video, Phone, Brain, Cloud, FileCode,
  Zap, Activity, Eye, Key, MonitorSpeaker, Radio,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ═══════════════════════════════════════════════════════════════
// DATA — 12 Official Bots
// ═══════════════════════════════════════════════════════════════

const BOTS_DATA = [
  {
    code: "BCO", name: "CarlOS", role: "CEO", color: "blue",
    trisociation: "Bezos + Munger + Churchill",
    soul: "/home/deploy/.openclaw/workspace-ceo/SOUL.md",
    soulSize: "10,130 chars, 12 sections",
    skills: ["Diagnostic VITAA", "Triangle du Feu", "CREDO orchestration", "Team assembly", "Decision scoring", "8+1 Modes de reflexion"],
  },
  {
    code: "BCT", name: "Thierry", role: "CTO", color: "violet",
    trisociation: "Musk + Curie + Vinci",
    soul: "/home/deploy/.openclaw/workspace-cto/SOUL.md",
    soulSize: "~8,000 chars",
    skills: ["Architecture tech", "Code review", "Innovation pipeline", "Stack evaluation", "Technical debt audit"],
  },
  {
    code: "BCF", name: "Francois", role: "CFO", color: "emerald",
    trisociation: "Buffett + Munger + Franklin",
    soul: "/home/deploy/.openclaw/workspace-cfo/SOUL.md",
    soulSize: "~7,500 chars",
    skills: ["Analyse financiere", "Budget planning", "Cash flow forecast", "ROI scoring", "Risk assessment"],
  },
  {
    code: "BCM", name: "Martine", role: "CMO", color: "pink",
    trisociation: "Disney + Jobs/Blakely + Oprah",
    soul: "/home/deploy/.openclaw/workspace-cmo/SOUL.md",
    soulSize: "~7,200 chars",
    skills: ["Marketing strategy", "Brand positioning", "Content pipeline", "Customer journey", "Growth hacking"],
  },
  {
    code: "BCS", name: "Sophie", role: "CSO", color: "red",
    trisociation: "Sun Tzu + Thiel + Chanel",
    soul: "/home/deploy/.openclaw/workspace-cso/SOUL.md",
    soulSize: "~7,800 chars",
    skills: ["Sales strategy", "Pipeline management", "Competitive analysis", "Deal closing", "Territory planning"],
  },
  {
    code: "BOO", name: "Olivier", role: "COO", color: "orange",
    trisociation: "Marc Aurele + Deming + Nightingale",
    soul: "/home/deploy/.openclaw/workspace-coo/SOUL.md",
    soulSize: "~7,000 chars",
    skills: ["Operations management", "Process optimization", "KPI tracking", "Supply chain", "Quality control"],
  },
  {
    code: "BFA", name: "Fabien", role: "CPO", color: "slate",
    trisociation: "Ford + Ohno + Goldratt",
    soul: "/home/deploy/.openclaw/workspace-factory/SOUL.md",
    soulSize: "~6,500 chars",
    skills: ["Automatisation usine", "Lean manufacturing", "Production planning", "Equipment ROI", "Capacity analysis"],
  },
  {
    code: "BHR", name: "Helene", role: "CHRO", color: "teal",
    trisociation: "Sandberg + Branson + Laszlo Bock",
    soul: "SOUL dynamique",
    soulSize: "~5,500 chars",
    skills: ["Recrutement", "Culture organisationnelle", "Formation", "Retention", "Conformite RH"],
  },
  {
    code: "BIO", name: "Ines", role: "CINO", color: "rose",
    trisociation: "Curie + Edison + Dyson",
    soul: "SOUL dynamique",
    soulSize: "~5,500 chars",
    skills: ["Innovation pipeline", "R&D management", "Patent strategy", "Tech scouting", "Prototype validation"],
  },
  {
    code: "BRO", name: "Raphael", role: "CRO", color: "amber",
    trisociation: "Bezos + Salesforce + HubSpot",
    soul: "SOUL dynamique",
    soulSize: "~5,500 chars",
    skills: ["Revenue operations", "Funnel optimization", "Cross-sell/Upsell", "Pricing strategy", "Churn prevention"],
  },
  {
    code: "BLE", name: "Louise", role: "CLO", color: "indigo",
    trisociation: "RGB + Compliance + Ethics",
    soul: "SOUL dynamique",
    soulSize: "~5,000 chars",
    skills: ["Conformite legale", "Contrats", "Propriete intellectuelle", "Risques juridiques", "Reglementation"],
  },
  {
    code: "BSE", name: "Sebastien", role: "CISO", color: "zinc",
    trisociation: "NSA + Schneier + Zero Trust",
    soul: "SOUL dynamique",
    soulSize: "~5,000 chars",
    skills: ["Cybersecurite", "Audit securite", "Incident response", "Data protection", "Compliance RGPD"],
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — API Endpoints
// ═══════════════════════════════════════════════════════════════

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  status: "live" | "en-cours" | "a-faire";
}

interface EndpointGroup {
  category: string;
  icon: React.ElementType;
  endpoints: Endpoint[];
}

const API_ENDPOINTS: EndpointGroup[] = [
  {
    category: "Auth",
    icon: Key,
    endpoints: [
      { method: "POST", path: "/api/v1/auth/login", description: "SHA256 credentials — server-side auth", status: "live" },
    ],
  },
  {
    category: "Chat",
    icon: Terminal,
    endpoints: [
      { method: "POST", path: "/api/v1/chat", description: "Send message (streaming SSE)", status: "live" },
      { method: "GET", path: "/api/v1/chat/history", description: "Get conversation history", status: "live" },
    ],
  },
  {
    category: "Voice",
    icon: Mic,
    endpoints: [
      { method: "POST", path: "/api/v1/voice/start", description: "Start LiveKit voice session", status: "live" },
      { method: "POST", path: "/api/v1/voice/event", description: "Voice event webhook (from agent)", status: "live" },
      { method: "GET", path: "/api/v1/voice/events/{room}", description: "Poll voice events (2s interval)", status: "live" },
    ],
  },
  {
    category: "Bureau",
    icon: FileCode,
    endpoints: [
      { method: "GET", path: "/api/v1/projets", description: "List user projects", status: "live" },
      { method: "POST", path: "/api/v1/projets", description: "Create project", status: "live" },
      { method: "GET", path: "/api/v1/documents", description: "List user documents", status: "live" },
      { method: "POST", path: "/api/v1/upload", description: "Upload file (multipart)", status: "live" },
      { method: "GET", path: "/api/v1/outils", description: "List user tools", status: "live" },
    ],
  },
  {
    category: "COMMAND",
    icon: Zap,
    endpoints: [
      { method: "POST", path: "/api/v1/command/live", description: "Live COMMAND execution", status: "live" },
      { method: "POST", path: "/api/v1/command/compile", description: "Compile COMMAND briefing", status: "live" },
      { method: "GET", path: "/api/v1/command/missions", description: "List missions", status: "live" },
      { method: "GET", path: "/api/v1/command/missions-user", description: "List user missions (by title)", status: "live" },
      { method: "DELETE", path: "/api/v1/command/missions/{id}", description: "Delete mission", status: "live" },
    ],
  },
  {
    category: "Orbit9",
    icon: Globe,
    endpoints: [
      { method: "GET", path: "/api/v1/orbit9/members", description: "List Orbit9 members", status: "live" },
      { method: "POST", path: "/api/v1/orbit9/members", description: "Create member profile", status: "live" },
      { method: "POST", path: "/api/v1/orbit9/match", description: "Run matching algorithm", status: "live" },
      { method: "GET", path: "/api/v1/orbit9/cellules", description: "List cellules", status: "live" },
      { method: "POST", path: "/api/v1/orbit9/scout/{id}", description: "Scout scan (MVP mock)", status: "en-cours" },
      { method: "GET", path: "/api/v1/orbit9/qualification/{id}", description: "Qualification pipeline", status: "a-faire" },
    ],
  },
  {
    category: "Decision Log",
    icon: Activity,
    endpoints: [
      { method: "GET", path: "/api/v1/decisions", description: "List decisions (D-001+)", status: "live" },
      { method: "POST", path: "/api/v1/decisions", description: "Create decision entry", status: "live" },
    ],
  },
  {
    category: "Diagnostics",
    icon: Eye,
    endpoints: [
      { method: "GET", path: "/api/v1/diagnostics/{bot}", description: "Get bot diagnostic results", status: "live" },
      { method: "POST", path: "/api/v1/diagnostics", description: "Create diagnostic entry", status: "live" },
    ],
  },
  {
    category: "Templates",
    icon: Layers,
    endpoints: [
      { method: "GET", path: "/api/v1/templates", description: "List all templates (141)", status: "live" },
      { method: "GET", path: "/api/v1/templates/{dept}", description: "Get department templates", status: "live" },
    ],
  },
  {
    category: "Health",
    icon: Activity,
    endpoints: [
      { method: "GET", path: "/api/v1/health", description: "System health (status + version + uptime)", status: "live" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Backend Modules
// ═══════════════════════════════════════════════════════════════

const BACKEND_MODULES = [
  { name: "bridge.py", description: "Entry point — Telegram polling, 5-tier routing, response formatting", category: "core", lines: "~2,500" },
  { name: "bridge_btml_connector.py", description: "GHML concepts to responses — jargon invisibility, CREDO phase transitions", category: "core", lines: "~1,800" },
  { name: "bridge_state_machine.py", description: "7 user states: Dashboard, Selection, Qualification, TRAVAIL_CREDO, Wrap-up, Onboarding, Interception", category: "core", lines: "~900" },
  { name: "context_builder.py", description: "SOUL templates loader, session history, system_blocks assembly", category: "core", lines: "~1,200" },
  { name: "api_clients.py", description: "ClientAnthropic (prompt caching) + ClientGoogle, BudgetTracker ($5/day), RateLimiter", category: "core", lines: "~800" },
  { name: "config_bridge.py", description: "Central config — API keys (.env), Tier enum, AgentRole, budget/rate-limit constants", category: "config", lines: "~400" },
  { name: "agents.py", description: "6 C-Level agents (BCO/BCT/BCF/BCM/BCS/BOO) + 8+1 reflection modes", category: "agents", lines: "~600" },
  { name: "session_credo.py", description: "CREDO cycle engine — 5 phases: Connect, Research, Expose, Demonstrate, Obtain", category: "framework", lines: "~700" },
  { name: "piliers_aiavt.py", description: "VITAA 5-pillar framework — Argent, Idee, Actif, Vente, Temps + Triangle du Feu", category: "framework", lines: "~500" },
  { name: "tableau_periodique.py", description: "220+ GHML proprietary elements — 4 groups (S/P/T/H), 7 periods", category: "framework", lines: "~1,500" },
  { name: "ghostx_wrapper.py", description: "GhostX cognitive emulation — 14 Ghosts, 3 MVP complete, Bezos/Jobs/Musk mental models", category: "framework", lines: "~315" },
  { name: "bridge_command.py", description: "COMMAND engine — CommandLive + CommandCompiler + CommandDetector", category: "engine", lines: "~600" },
  { name: "knowledge_extractor.py", description: "Post-message extraction — decisions/facts/insights via Gemini Flash (fire-and-forget)", category: "engine", lines: "~400" },
  { name: "bridge_database.py", description: "PostgreSQL wrapper — single point of access for all DB operations", category: "data", lines: "~500" },
  { name: "bridge_phone.py", description: "Telephony bridge — Twilio/Telnyx integration, SIP, NIP authentication", category: "comms", lines: "~400" },
  { name: "bridge_telnyx.py", description: "Telnyx migration — code ready, awaiting credentials from Carl", category: "comms", lines: "~350" },
  { name: "carlos_livekit_agent.py", description: "LiveKit voice agent — Deepgram STT + CarlOS API + ElevenLabs TTS, 12 bot voices", category: "comms", lines: "~800" },
  { name: "bridge_calendar.py", description: "Google Calendar integration — /agenda, /rdv, /libre, /briefing (OAuth broken)", category: "integrations", lines: "~300" },
  { name: "bridge_gdocs.py", description: "Google Docs wrap-up creation via service account", category: "integrations", lines: "~250" },
  { name: "transcribe_vocaux.py", description: "Whisper voice message transcription for Telegram vocaux", category: "comms", lines: "~200" },
  { name: "message_logger.py", description: "MESSAGE-LOG.md writer — tokens, cost, latency tracking", category: "monitoring", lines: "~200" },
  { name: "api_rest.py", description: "FastAPI REST API — all /api/v1/ endpoints, scoring engine, team proposal", category: "api", lines: "~2,000" },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Database Tables
// ═══════════════════════════════════════════════════════════════

const DB_TABLES = [
  {
    name: "command_missions",
    description: "COMMAND missions tracking",
    columns: ["id (SERIAL PK)", "user_id", "title", "status", "command_type", "payload (JSONB)", "result (JSONB)", "created_at", "updated_at"],
    status: "live" as const,
  },
  {
    name: "compiled_briefings",
    description: "Compiled COMMAND briefings",
    columns: ["id (SERIAL PK)", "mission_id (FK)", "content (TEXT)", "format", "compiled_at"],
    status: "live" as const,
  },
  {
    name: "decision_log",
    description: "Decision log — D-001 to D-109+",
    columns: ["id (SERIAL PK)", "decision_id (VARCHAR)", "title", "description (TEXT)", "status", "category", "session", "created_at"],
    status: "live" as const,
  },
  {
    name: "orbit9_members",
    description: "Orbit9 member profiles",
    columns: ["id (SERIAL PK)", "name", "company", "sector", "specialites (JSONB)", "region", "vitaa_score (INT)", "created_at"],
    status: "live" as const,
  },
  {
    name: "orbit9_cellules",
    description: "Orbit9 cellule groupings",
    columns: ["id (SERIAL PK)", "name", "theme", "member_ids (JSONB)", "status", "created_at"],
    status: "live" as const,
  },
  {
    name: "orbit9_matches",
    description: "Orbit9 match results + scores",
    columns: ["id (SERIAL PK)", "member_a_id (FK)", "member_b_id (FK)", "score (FLOAT)", "reasons (JSONB)", "status", "created_at"],
    status: "live" as const,
  },
  {
    name: "diagnostics",
    description: "Bot diagnostic results",
    columns: ["id (SERIAL PK)", "bot_code", "user_id", "diagnostic_type", "results (JSONB)", "vitaa_scores (JSONB)", "created_at"],
    status: "live" as const,
  },
  {
    name: "projets",
    description: "User projects (Mon Bureau)",
    columns: ["id (SERIAL PK)", "user_id", "name", "description (TEXT)", "status", "priority", "created_at", "updated_at"],
    status: "live" as const,
  },
  {
    name: "documents",
    description: "User documents",
    columns: ["id (SERIAL PK)", "user_id", "projet_id (FK)", "filename", "file_path", "mime_type", "size_bytes", "created_at"],
    status: "live" as const,
  },
  {
    name: "outils",
    description: "User tools",
    columns: ["id (SERIAL PK)", "user_id", "name", "type", "config (JSONB)", "status", "created_at"],
    status: "live" as const,
  },
  {
    name: "phone_auth",
    description: "Phone NIP authentication (D-089)",
    columns: ["id (SERIAL PK)", "phone_number", "pin_hash (VARCHAR)", "user_name", "is_active (BOOL)", "created_at"],
    status: "live" as const,
  },
  {
    name: "templates",
    description: "Strategic templates — 141 total, 403 sections, 12 departments",
    columns: ["id (SERIAL PK)", "dept_code", "title", "description (TEXT)", "sections (JSONB)", "category", "created_at"],
    status: "live" as const,
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Infrastructure
// ═══════════════════════════════════════════════════════════════

const INFRA_VPS = [
  {
    name: "VPS1 — usinebleue-dev",
    ip: "51.222.31.180",
    role: "DEV + staging",
    provider: "OVH",
    storage: "193GB + 492GB block (/mnt/brain-storage)",
    services: ["brain-bridge (Telegram bot)", "Claude Code dev", "LiveKit agent"],
    ssh: "ssh -p 2222 deploy@51.222.31.180",
    status: "live" as const,
  },
  {
    name: "VPS2 — usinebleue-live",
    ip: "51.222.25.203",
    role: "PRODUCTION",
    provider: "OVH",
    storage: "96GB (88GB free), 12GB RAM",
    services: ["PostgreSQL 16 Docker (carlosdb)", "uvicorn API :8000", "Nginx + SSL", "VPS2 Guardian (health/scan/backup)"],
    ssh: "ssh -p 2222 -i ~/.ssh/id_brain_nexus deploy@51.222.25.203",
    domain: "app.usinebleue.ai",
    ssl: "Let's Encrypt (expires 2026-06-02)",
    status: "live" as const,
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Integrations
// ═══════════════════════════════════════════════════════════════

const INTEGRATIONS = [
  {
    name: "LiveKit",
    icon: Mic,
    category: "Voice/Video",
    description: "Voice and video rooms, agent dispatch, SIP trunk integration",
    details: [
      "Details complets → Stack Communication (voice pipeline, pont vocal, canvas auto-nav)",
    ],
    status: "live" as const,
  },
  {
    name: "ElevenLabs",
    icon: MonitorSpeaker,
    category: "TTS",
    description: "Text-to-Speech — 12 voix distinctes, une par bot C-Level",
    details: [
      "Details complets → Stack Communication (12 voix, model, voice IDs)",
    ],
    status: "live" as const,
  },
  {
    name: "Deepgram",
    icon: Wifi,
    category: "STT",
    description: "Speech-to-Text — nova-3 fr pour transcription temps reel",
    details: [
      "Details complets → Stack Communication (voice pipeline)",
    ],
    status: "live" as const,
  },
  {
    name: "Telnyx",
    icon: Phone,
    category: "Telephony",
    description: "Migration Twilio vers Telnyx — bridge_telnyx.py pret, en attente credentials",
    details: [
      "Details complets → Stack Communication (telephonie, NIP N2, Telnyx credentials)",
    ],
    status: "en-cours" as const,
  },
  {
    name: "Tavus",
    icon: Video,
    category: "Video Avatar",
    description: "Video avatar lip-sync — Lucas Studio replica, $0.37/min",
    details: [
      "Details complets → Stack Communication (video avatar, activation, room convention)",
    ],
    status: "live" as const,
  },
  {
    name: "Google Gemini",
    icon: Brain,
    category: "LLM",
    description: "Flash (T1, free) + Pro (T2, free) — 80%+ des requetes",
    details: [
      "T1 Gemini Flash: 1500 req/day, gratuit, ~30% du trafic",
      "T2 Gemini Pro: 500 req/day, gratuit, ~20% du trafic",
      "Knowledge extraction: Gemini Flash fire-and-forget",
      "Orbit9 scoring: Gemini Flash pour match scoring",
    ],
    status: "live" as const,
  },
  {
    name: "Anthropic Claude",
    icon: Brain,
    category: "LLM",
    description: "Sonnet (T3) + Opus (T4) — requetes complexes, ~20% du trafic",
    details: [
      "T3 Claude Sonnet: ~$0.01-0.05/req, ~15% du trafic",
      "T4 Claude Opus: ~$0.15-0.60/req, ~5% du trafic",
      "Prompt caching on SOUL templates: ~90% input token savings",
      "Budget cible: $5/day max, 80%+ sur tiers gratuits",
    ],
    status: "live" as const,
  },
  {
    name: "Plane.so",
    icon: Layers,
    category: "Project Management",
    description: "Task management pour Mon Bureau — API REST integration",
    details: [
      "bridge_plane.py: BridgePlane class, REST API client",
      "Synchro taches avec Mon Bureau projets",
      "Integration bidirectionnelle projets/taches",
    ],
    status: "live" as const,
  },
  {
    name: "Google Drive",
    icon: Cloud,
    category: "Storage",
    description: "File backup + sync via service account (rclone)",
    details: [
      "GhostX-Master folder: 1IRU1xnc3Me_Ku5jAxs8ZZXIc055O8QCJ",
      "Service account: brain-drive-service-account.json",
      "Upload via rclone copy avec --drive-root-folder-id",
      "OAuth perso casse — service account fonctionne",
    ],
    status: "live" as const,
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Security
// ═══════════════════════════════════════════════════════════════

const SECURITY_ITEMS = [
  { category: "Firewall", item: "UFW", description: "deny incoming, allow 2222/80/443 uniquement", status: "live" as const },
  { category: "Firewall", item: "CORS", description: "allow_origins=[\"https://app.usinebleue.ai\"] — plus de wildcard", status: "live" as const },
  { category: "Auth", item: "API Key", description: "Rotee, pas de fallback hardcode, RuntimeError si absente", status: "live" as const },
  { category: "Auth", item: "Login", description: "Server-side /api/v1/auth/login SHA256 — credentials plus dans le JS bundle", status: "live" as const },
  { category: "Auth", item: "Phone NIP", description: "NIP N2 (D-089) — CLID + PIN dans phone_auth PostgreSQL", status: "live" as const },
  { category: "Rate Limiting", item: "Rate Limit", description: "30 req/min par API key (in-memory sliding window)", status: "live" as const },
  { category: "Rate Limiting", item: "Budget Tracker", description: "$5/day max — BudgetTracker dans api_clients.py", status: "live" as const },
  { category: "Input", item: "Validation", description: "Max 12,000 chars, slug regex ^[a-z0-9\\-]+$", status: "live" as const },
  { category: "Headers", item: "Nginx Headers", description: "HSTS, CSP, Permissions-Policy", status: "live" as const },
  { category: "Headers", item: "Swagger", description: "Desactive en production (_DEBUG env var)", status: "live" as const },
  { category: "Cleanup", item: "Voice Events TTL", description: "TTL 2h cleanup automatique des voice events", status: "live" as const },
  { category: "Files", item: "Permissions", description: "chmod 600 sur .env, credentials_*.json, token_*.json, data/.sentinel_key", status: "live" as const },
];

// ═══════════════════════════════════════════════════════════════
// TABS DEFINITION
// ═══════════════════════════════════════════════════════════════

const tabs = [
  { id: "bots-skills", label: "Bots & Skills" },
  { id: "api-endpoints", label: "API & Endpoints" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Base de Donnees" },
  { id: "infra", label: "Infrastructure" },
  { id: "integrations", label: "Integrations" },
  { id: "securite", label: "Securite" },
];

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: "live" | "en-cours" | "a-faire" }) {
  const config = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-emerald-100 text-emerald-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-violet-100 text-violet-700",
  };

  return (
    <span className={cn("text-[9px] font-bold font-mono px-1.5 py-0.5 rounded min-w-[42px] text-center inline-block", colors[method] || "bg-gray-100 text-gray-700")}>
      {method}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ═══════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════

function TabBotsSkills() {
  return (
    <>
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Equipe GhostX — 12 Agents C-Level</h3>
        <p className="text-xs text-gray-400 mb-3">
          Chaque bot possede une Trisociation (3 OS combines: Primaire + Calibrateur + Amplificateur), un fichier SOUL unique, et un ensemble de skills specialises.
          Le GHML (Ghost Modeling Language) modele l'intelligence d'affaires comme la chimie modele la matiere.
        </p>
      </div>

      {/* Bot Grid */}
      <div className="space-y-3">
        {BOTS_DATA.map((bot) => (
          <Card key={bot.code} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Bot Code Badge */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0",
                `bg-${bot.color}-500`
              )}>
                {bot.code}
              </div>

              {/* Bot Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-800">{bot.name}</span>
                  <Badge variant="outline" className="text-[9px] font-bold">{bot.role}</Badge>
                  <StatusBadge status="live" />
                </div>

                {/* Trisociation */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">Trisociation:</span>
                  <span className="text-xs text-gray-700 font-medium">{bot.trisociation}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {bot.skills.map((skill) => (
                    <span key={skill} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* SOUL file */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400">SOUL:</span>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">{bot.soul}</code>
                  <span className="text-[9px] text-gray-400">({bot.soulSize})</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* GHML Framework Summary */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Framework GHML</h3>
        <p className="text-xs text-gray-400 mb-3">Ghost Modeling Language — moteur proprietaire qui structure toute l'intelligence d'affaires de la plateforme</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">CREDO — Protocole Maitre</div>
            <div className="space-y-1">
              {["C — Connecter", "R — Rechercher", "E — Exposer", "D — Demontrer", "O — Obtenir"].map((phase) => (
                <div key={phase} className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs text-gray-600">{phase}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">VITAA — 5 Piliers de Scoring</div>
            <div className="space-y-1">
              {["V — Vente (0-100)", "I — Idee (0-100)", "T — Temps (0-100)", "A — Argent (0-100)", "A — Actif (0-100)"].map((pilier) => (
                <div key={pilier} className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-gray-600">{pilier}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">Tableau Periodique GHML</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>220+ elements proprietaires</div>
              <div>4 groupes: <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px] font-mono">S</code> Sectoriel, <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px] font-mono">P</code> Patterns, <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px] font-mono">T</code> Tech, <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px] font-mono">H</code> Humain</div>
              <div>7 periodes, structure chimique</div>
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">Triangle du Feu</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>BRULE — 3+ piliers actifs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>COUVE — 2 piliers actifs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>MEURT — 1 seul pilier actif</span>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">8+1 Modes de Reflexion</div>
            <div className="text-xs text-gray-600 space-y-0.5">
              {["Debat", "Brainstorm", "Crise", "Analyse", "Decision", "Strategie", "Innovation", "Deep Resonance", "CREDO (maitre)"].map((mode, i) => (
                <div key={mode} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 w-4 text-right">{i + 1}.</span>
                  <span>{mode}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">12 Ghosts Definitifs (V1.1)</div>
            <div className="text-xs text-gray-600 space-y-0.5">
              {[
                "G1 Bezos", "G2 Jobs", "G3 Musk", "G4 Sun Tzu", "G5 Munger", "G6 Marc Aurele",
                "G7 Churchill", "G8 Disney", "G9 Tesla (constant)", "G10 Buffett", "G11 Curie", "G12 Oprah"
              ].map((ghost) => (
                <div key={ghost} className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{ghost}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function TabApiEndpoints() {
  const totalEndpoints = API_ENDPOINTS.reduce((sum, g) => sum + g.endpoints.length, 0);
  const liveCount = API_ENDPOINTS.reduce((sum, g) => sum + g.endpoints.filter(e => e.status === "live").length, 0);

  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">API REST — FastAPI sur VPS2</h3>
        <p className="text-xs text-gray-400 mb-3">
          {totalEndpoints} endpoints | {liveCount} LIVE | Port 8000 (bind 127.0.0.1) | Nginx proxy <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/api/v1/</code>
        </p>
      </div>

      <div className="space-y-4">
        {API_ENDPOINTS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Card key={group.category} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <GroupIcon className="h-4 w-4 text-gray-500" />
                <span className="font-bold text-sm text-gray-800">{group.category}</span>
                <span className="text-[9px] text-gray-400">{group.endpoints.length} endpoints</span>
              </div>

              <div className="space-y-2">
                {group.endpoints.map((ep) => (
                  <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                    <MethodBadge method={ep.method} />
                    <code className="text-xs font-mono text-gray-700 flex-1">{ep.path}</code>
                    <span className="text-[9px] text-gray-400 hidden md:block">{ep.description}</span>
                    <StatusBadge status={ep.status} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <SectionDivider />

      {/* Auth Details */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Authentification</h3>
        <p className="text-xs text-gray-400 mb-3">Toutes les requetes API necessitent un header <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">X-API-Key</code></p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">API Key:</span> Variable <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">GHOSTX_API_KEY</code> dans .env — RuntimeError si absente
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">Login:</span> POST /api/v1/auth/login avec SHA256 hash — credentials ne sont plus dans le JS bundle
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">Rate Limit:</span> 30 req/min par API key — sliding window in-memory
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function TabBackend() {
  const categories = [...new Set(BACKEND_MODULES.map(m => m.category))];
  const categoryLabels: Record<string, string> = {
    core: "Core — Point d'entree et orchestration",
    config: "Configuration",
    agents: "Agents C-Level",
    framework: "Framework GHML",
    engine: "Engines (COMMAND, Knowledge)",
    data: "Data Layer",
    comms: "Communications (Voice, Phone)",
    integrations: "Integrations externes",
    monitoring: "Monitoring & Logs",
    api: "API REST (FastAPI)",
  };

  return (
    <>
      {/* Message Flow */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Message Flow — Pipeline de traitement</h3>
        <p className="text-xs text-gray-400 mb-3">Chaque message passe par un pipeline de classification, enrichissement et routage vers le tier optimal</p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Telegram/Web", color: "bg-blue-100 text-blue-700" },
              { label: "bridge.py", color: "bg-gray-100 text-gray-700" },
              { label: "Tier 0 Regex", color: "bg-green-100 text-green-700" },
              { label: "State Machine", color: "bg-violet-100 text-violet-700" },
              { label: "BTMLConnector", color: "bg-orange-100 text-orange-700" },
              { label: "Classificateur", color: "bg-pink-100 text-pink-700" },
              { label: "ContextBuilder", color: "bg-indigo-100 text-indigo-700" },
              { label: "API Call (T0-T4)", color: "bg-red-100 text-red-700" },
              { label: "Knowledge Extract", color: "bg-amber-100 text-amber-700" },
              { label: "Response", color: "bg-emerald-100 text-emerald-700" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold px-2 py-1 rounded", step.color)}>{step.label}</span>
                {i < 9 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Tier Routing */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Routage 5 Tiers — Optimisation cout vs capacite</h3>
        <p className="text-xs text-gray-400 mb-3">Distribution cible: 80%+ sur tiers gratuits, budget max $5/jour</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { tier: "T0", name: "Regex/Cache", cost: "Gratuit", pct: "30-40%", color: "bg-emerald-500" },
            { tier: "T1", name: "Gemini Flash", cost: "Gratuit", pct: "~30%", color: "bg-emerald-400" },
            { tier: "T2", name: "Gemini Pro", cost: "Gratuit", pct: "~20%", color: "bg-amber-400" },
            { tier: "T3", name: "Claude Sonnet", cost: "$0.01-0.05", pct: "~15%", color: "bg-orange-400" },
            { tier: "T4", name: "Claude Opus", cost: "$0.15-0.60", pct: "~5%", color: "bg-red-400" },
          ].map((t) => (
            <Card key={t.tier} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-white font-bold text-xs px-2 py-1 rounded mb-2 inline-block", t.color)}>
                {t.tier}
              </div>
              <div className="text-xs font-medium text-gray-700">{t.name}</div>
              <div className="text-[9px] text-gray-400 mt-1">{t.cost}/req</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{t.pct}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Modules by Category */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Modules Python — {BACKEND_MODULES.length} fichiers</h3>
        <p className="text-xs text-gray-400 mb-3">Architecture backend complete — chaque module a une responsabilite unique</p>

        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              {categoryLabels[cat] || cat}
            </div>
            <div className="space-y-1.5">
              {BACKEND_MODULES.filter(m => m.category === cat).map((mod) => (
                <div key={mod.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700 shrink-0 min-w-[200px]">
                    {mod.name}
                  </code>
                  <span className="text-xs text-gray-600 flex-1">{mod.description}</span>
                  <span className="text-[9px] text-gray-400 shrink-0">{mod.lines} lignes</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* State Machine */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">State Machine V2 — 7 etats utilisateur</h3>
        <p className="text-xs text-gray-400 mb-3">JarvisStateMachine dans bridge_state_machine.py — gere le contexte conversationnel</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { state: "DASHBOARD", desc: "Accueil / Navigation" },
            { state: "SELECTION", desc: "Choix de bot/mode" },
            { state: "QUALIFICATION", desc: "Questions diagnostiques" },
            { state: "TRAVAIL_CREDO", desc: "Session CREDO active" },
            { state: "WRAP_UP", desc: "Resume / Delivrable" },
            { state: "ONBOARDING", desc: "Premier contact" },
            { state: "INTERCEPTION", desc: "Commande speciale" },
          ].map((s) => (
            <Card key={s.state} className="p-2.5 bg-white border border-gray-100">
              <code className="text-[9px] font-mono font-bold text-violet-600">{s.state}</code>
              <div className="text-[9px] text-gray-500 mt-0.5">{s.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Session Management */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Session Management</h3>
        <p className="text-xs text-gray-400 mb-3">Auto-archive a: 8000 tokens OU 50 messages OU 24h idle</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Anthropic prompt caching sur SOUL templates — ~90% savings input tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Navigation universelle: lettres (A, N, P, Q, S, B, D, F, T, X, Z, M, R, ?) + chiffres contextuels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Menu GhostX: G (menu), G1-G12 (activer ghost), G0 (desactiver)</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function TabDatabase() {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">PostgreSQL 16 — Docker (carlosdb) sur VPS2</h3>
        <p className="text-xs text-gray-400 mb-3">
          {DB_TABLES.length} tables | Port 127.0.0.1:5432 | Acces unique via <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code>
        </p>
      </div>

      <div className="space-y-3">
        {DB_TABLES.map((table) => (
          <Card key={table.name} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-3.5 w-3.5 text-blue-500" />
              <code className="text-xs font-mono font-bold text-gray-800">{table.name}</code>
              <StatusBadge status={table.status} />
            </div>
            <p className="text-xs text-gray-500 mb-3">{table.description}</p>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Colonnes</div>
              <div className="flex flex-wrap gap-1.5">
                {table.columns.map((col) => {
                  const isPk = col.includes("PK");
                  const isFk = col.includes("FK");
                  const isJson = col.includes("JSONB");
                  return (
                    <span
                      key={col}
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-mono",
                        isPk ? "bg-blue-100 text-blue-700 font-bold" :
                        isFk ? "bg-violet-100 text-violet-700" :
                        isJson ? "bg-amber-100 text-amber-700" :
                        "bg-white text-gray-600 border border-gray-200"
                      )}
                    >
                      {col}
                    </span>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* DB Access Pattern */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Pattern d'acces</h3>
        <p className="text-xs text-gray-400 mb-3">bridge_database.py = seul point d'acces — JAMAIS de queries SQL directes ailleurs</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span><code className="bg-gray-100 px-1 py-0.5 rounded font-mono">api_rest.py</code> appelle <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code> pour toutes les operations CRUD</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Connection: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">psycopg2</code> avec pool de connexions</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Container Docker: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">carlosdb</code> (PostgreSQL 16 Alpine)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Pas d'ORM — SQL brut avec parametres pour eviter injections</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Legend */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Legende des types</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-100 text-blue-700 font-bold">PK</span>
            <span className="text-xs text-gray-500">Cle primaire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-violet-100 text-violet-700">FK</span>
            <span className="text-xs text-gray-500">Cle etrangere</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-100 text-amber-700">JSONB</span>
            <span className="text-xs text-gray-500">Donnees JSON binaires</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white text-gray-600 border border-gray-200">colonne</span>
            <span className="text-xs text-gray-500">Colonne standard</span>
          </div>
        </div>
      </div>
    </>
  );
}

function TabInfrastructure() {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Infrastructure — 2 VPS OVH</h3>
        <p className="text-xs text-gray-400 mb-3">Architecture separee DEV / PROD depuis Session 32 (Sprint Securite)</p>
      </div>

      {/* VPS Cards */}
      <div className="space-y-4">
        {INFRA_VPS.map((vps) => (
          <Card key={vps.name} className="p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-sm text-gray-800">{vps.name}</span>
              <StatusBadge status={vps.status} />
              <Badge variant="outline" className="text-[9px] font-bold">{vps.role}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">IP</div>
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.ip}</code>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Provider</div>
                <span className="text-xs text-gray-600">{vps.provider}</span>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Storage</div>
                <span className="text-xs text-gray-600">{vps.storage}</span>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">SSH</div>
                <code className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-mono break-all">{vps.ssh}</code>
              </div>
              {"domain" in vps && vps.domain && (
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Domain</div>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.domain}</code>
                </div>
              )}
              {"ssl" in vps && vps.ssl && (
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">SSL</div>
                  <span className="text-xs text-gray-600">{vps.ssl}</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {vps.services.map((svc) => (
                  <span key={svc} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* Deploy Pipeline */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Pipeline de Deploiement</h3>
        <p className="text-xs text-gray-400 mb-3">deploy.sh copie de VPS1 vers VPS2, restart uvicorn et exclut les fichiers sensibles</p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {[
              { step: "1", label: "Code dans ~/brain-dev (VPS1)", detail: "Developpement + tests avec Claude Code" },
              { step: "2", label: "Tests: python3 -m pytest test_*.py", detail: "Validation avant deploiement" },
              { step: "3", label: "bash deploy.sh", detail: "scp vers VPS2, exclut .env + credentials + tokens" },
              { step: "4", label: "Restart services sur VPS2", detail: "pkill uvicorn + relance api_rest.py sur :8000" },
              { step: "5", label: "Verification", detail: "CarlOS repond dans Telegram + app.usinebleue.ai accessible" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700">{s.label}</div>
                  <div className="text-[9px] text-gray-400">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Nginx */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Nginx Configuration</h3>
        <p className="text-xs text-gray-400 mb-3">
          Fichier: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/etc/nginx/sites-available/usinebleue-app</code>
        </p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Proxy: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/api/v1/</code> vers <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">127.0.0.1:8000</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Static: Vite build dans <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">dist/</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Headers: HSTS, CSP, Permissions-Policy (Sprint Securite S32)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>SSL: Let's Encrypt auto-renew (expires 2026-06-02)</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Systemd */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Services Systemd</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">brain-bridge (VPS1)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Telegram bot (bridge.py)</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">sudo systemctl restart brain-bridge</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">uvicorn API (VPS2)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>FastAPI REST sur :8000</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">pkill -f uvicorn; nohup python3 -m uvicorn api_rest:app ...</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">VPS2 Guardian</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Health check 5min, scan daily 7h, backup daily 3h</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">~/security-tools/vps1_guardian.py</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">LiveKit Agent (VPS1)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Voice/Video agent dispatch</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">python3 carlos_livekit_agent.py dev</code></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function TabIntegrations() {
  const { setActiveView } = useFrameMaster();
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Stack Integrations — {INTEGRATIONS.length} services</h3>
        <p className="text-xs text-gray-400 mb-3">
          LiveKit + ElevenLabs + Deepgram + Telnyx + Tavus + Gemini + Claude + Plane.so + Google Drive
        </p>
      </div>

      {/* Cross-reference: voice/video/telephony details → Stack Communication */}
      <Card className="p-3 bg-teal-50 border-teal-200 shadow-sm mb-4">
        <div className="flex items-start gap-2">
          <Radio className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs text-teal-700">Voice, video, telephonie: details complets dans </span>
            <button
              onClick={() => setActiveView("master-communication")}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
            >
              Stack Communication &rarr;
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => {
          const IntIcon = integration.icon;
          return (
            <Card key={integration.name} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <IntIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-800">{integration.name}</span>
                    <Badge variant="outline" className="text-[9px] font-medium">{integration.category}</Badge>
                    <StatusBadge status={integration.status} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{integration.description}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-1.5">
                  {integration.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

    </>
  );
}

function TabSecurite() {
  const groupedSecurity = SECURITY_ITEMS.reduce<Record<string, typeof SECURITY_ITEMS>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Securite — Sprint Securite (Session 32)</h3>
        <p className="text-xs text-gray-400 mb-3">
          {SECURITY_ITEMS.length} mesures deployees | UFW, CORS, API key, rate limit, auth server-side, input validation
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSecurity).map(([category, items]) => (
          <Card key={category} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="font-bold text-sm text-gray-800">{category}</span>
              <span className="text-[9px] text-gray-400">{items.length} mesures</span>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.item} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-1.5 min-w-[120px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{item.item}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-1">{item.description}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* Commandes de secours */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Commandes de Secours</h3>
        <p className="text-xs text-gray-400 mb-3">En cas d'urgence — ces commandes sont toujours disponibles</p>

        <div className="space-y-2">
          {[
            { label: "CarlOS est mort?", cmd: "sudo systemctl restart brain-bridge" },
            { label: "Logs en temps reel", cmd: "sudo journalctl -u brain-bridge -f" },
            { label: "Voir les changements", cmd: "git diff" },
            { label: "Annuler tout", cmd: "git checkout -- ." },
            { label: "Lister les backups", cmd: "ls ~/brain-dev-backup-*" },
            { label: "Status du service", cmd: "sudo systemctl status brain-bridge" },
            { label: "Derniers logs", cmd: "sudo journalctl -u brain-bridge --tail 50" },
          ].map((item) => (
            <div key={item.cmd} className="flex items-center gap-3 py-1.5">
              <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 min-w-[160px]">{item.label}</span>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">{item.cmd}</code>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Fichiers critiques */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Fichiers Critiques — NE JAMAIS modifier sans backup</h3>
        <p className="text-xs text-gray-400 mb-3">Ces fichiers peuvent casser le systeme entier si mal modifies</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5">
            {[
              "bridge_btml_connector.py — point d'entree, si ca casse TOUT tombe",
              "bridge.py — Telegram polling et routage",
              "config_bridge.py — configuration centrale",
              "context_builder.py — SOUL templates et contexte",
              ".env — API keys (ANTHROPIC, GOOGLE, TELEGRAM)",
              "systemd service file — gestion du service",
            ].map((file) => (
              <div key={file} className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <code className="text-xs text-gray-700">{file}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Backup Protocol */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Protocole de Backup</h3>
        <p className="text-xs text-gray-400 mb-3">TOUJOURS backup avant de coder — regle #1 absolue</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">1</span>
              <span>Avant tout changement: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">cp -r ~/brain-dev ~/brain-dev-backup-$(date +%Y%m%d_%H%M)</code></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">2</span>
              <span>Snapshot securite: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">snapshots/sprint62_fixes_20260217_1851/</code></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">3</span>
              <span>deploy.sh exclut: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">.env, credentials, tokens</code> du git add</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">4</span>
              <span>VPS2 Guardian: backup automatique daily a 3h</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function BibleTechniquePage() {
  const [tab, setTab] = useState("bots-skills");
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Server}
          iconColor="text-emerald-600"
          title="Bible Technique GHML"
          subtitle="Reference technique complete — Bots, API, Backend, DB, Infra, Integrations, Securite"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    tab === t.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </>
          }
        />
      }
    >
      {tab === "bots-skills" && <TabBotsSkills />}
      {tab === "api-endpoints" && <TabApiEndpoints />}
      {tab === "backend" && <TabBackend />}
      {tab === "database" && <TabDatabase />}
      {tab === "infra" && <TabInfrastructure />}
      {tab === "integrations" && <TabIntegrations />}
      {tab === "securite" && <TabSecurite />}
    </PageLayout>
  );
}
