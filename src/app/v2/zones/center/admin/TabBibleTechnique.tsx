/**
 * TabBibleTechnique.tsx — Bible Technique dans Admin God Mode
 * 8 sub-tabs avec donnees auto-scannees depuis le backend
 * Meme design visuel que BibleTechniquePage originale
 */

import { useState, useEffect, useCallback } from "react";
import {
  Server, Users, Globe, Database, Shield, Cpu, Link2, Atom,
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  Terminal, HardDrive, Lock, Wifi, Layers,
  Mic, Video, Phone, Brain, Cloud, FileCode,
  Zap, Activity, Eye, Key, MonitorSpeaker, Radio,
  RefreshCw, Loader2, BookOpen,
} from "lucide-react";
import { TabSectionHeader } from "../shared/SectionComponents";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { api } from "../../../api/client";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface BibleData {
  scanned_at: string;
  scan_duration_ms: number;
  bots: any[];
  endpoints: any;
  backend: any;
  database: any;
  infrastructure: any;
  integrations: any[];
  security: any;
  cerveau_btml: any;
}

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════

const SUB_TABS = [
  { id: "bots-skills", label: "Bots & Skills" },
  { id: "api-endpoints", label: "API & Endpoints" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Base de Donnees" },
  { id: "infra", label: "Infrastructure" },
  { id: "integrations", label: "Integrations" },
  { id: "securite", label: "Securite" },
  { id: "cerveau-btml", label: "Cerveau BTML" },
];

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS (same as BibleTechniquePage)
// ═══════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
    "active": { label: "ACTIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "inactive": { label: "INACTIVE", className: "bg-red-100 text-red-700 border-red-200" },
    "unknown": { label: "?", className: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = config[status] || config["unknown"];
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", c.className)}>
      {c.label}
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
// SECTION: BOTS & SKILLS
// ═══════════════════════════════════════════════════════════════

const BOT_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  pink: "bg-pink-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  slate: "bg-slate-500",
  teal: "bg-teal-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
  zinc: "bg-zinc-500",
};

function SectionBots({ data }: { data: any[] }) {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.1.1</span>
          Equipe GhostX — {data.length} Agents C-Level
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Chaque bot possede une Trisociation (3 OS combines: Primaire + Calibrateur + Amplificateur), un fichier SOUL unique, et un ensemble de skills specialises.
          Le BTML (Brain Team Modeling Language) modele l'intelligence d'affaires comme la chimie modele la matiere.
        </p>
      </div>
      <div className="space-y-3">
        {data.map((bot: any) => (
          <Card key={bot.code} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0", BOT_COLOR_MAP[bot.color] || "bg-gray-500")}>
                {bot.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-800">{bot.name}</span>
                  <Badge variant="outline" className="text-[9px] font-bold">{bot.role}</Badge>
                  <StatusBadge status="live" />
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">Trisociation:</span>
                  <span className="text-xs text-gray-700 font-medium">{bot.trisociation}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {bot.skills?.map((skill: string) => (
                    <span key={skill} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400">SOUL:</span>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">{bot.soul_path}</code>
                  <span className="text-[9px] text-gray-400">({bot.soul_size_display})</span>
                  {bot.soul_exists === false && <span className="text-[9px] text-amber-500">(fichier absent)</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* Cross-ref vers Bible BTML Complete */}
      <Card className="p-4 bg-violet-50 border border-violet-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Atom className="h-5 w-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-violet-800">Framework BTML — Reference Complete</div>
            <p className="text-xs text-violet-600 mt-0.5">CREDO, VITAA, 12 Ghosts, 8+1 Modes, Tableau Periodique, Triangle du Feu — tout est detaille dans la Bible BTML Complete (A.3).</p>
          </div>
        </div>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

function SectionAPI({ data }: { data: any }) {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.2.1</span>
          API REST — FastAPI sur VPS2
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {data.total} endpoints | {data.group_count} groupes | Port 8000 (bind 127.0.0.1) | Nginx proxy <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/api/v1/</code>
        </p>
      </div>
      <div className="space-y-4">
        {Object.entries(data.groups || {}).map(([groupKey, endpoints]: [string, any]) => (
          <Card key={groupKey} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-sm text-gray-800">{groupKey}</span>
              <span className="text-[9px] text-gray-400">{endpoints.length} endpoints</span>
            </div>
            <div className="space-y-2">
              {endpoints.map((ep: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                  <MethodBadge method={ep.method} />
                  <code className="text-xs font-mono text-gray-700 flex-1">{ep.path}</code>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* A.2.2.2 Auth Details */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.2.2</span>
          Authentification
        </h3>
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

// ═══════════════════════════════════════════════════════════════
// SECTION: BACKEND
// ═══════════════════════════════════════════════════════════════

function SectionBackend({ data }: { data: any }) {
  const categories = [...new Set((data.modules || []).map((m: any) => m.category))];

  return (
    <>
      {/* Message Flow */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.1</span>
          Message Flow — Pipeline de traitement
        </h3>
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
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.2</span>
          Routage 5 Tiers — Optimisation cout vs capacite
        </h3>
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
              <div className={cn("text-white font-bold text-xs px-2 py-1 rounded mb-2 inline-block", t.color)}>{t.tier}</div>
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
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.3</span>
          Modules Python — {data.total_files} fichiers ({data.total_lines?.toLocaleString()} lignes)
        </h3>
        <p className="text-xs text-gray-400 mb-3">Architecture backend complete — chaque module a une responsabilite unique</p>
        {categories.map((cat: string) => (
          <div key={cat} className="mb-4">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              {data.category_labels?.[cat] || cat}
            </div>
            <div className="space-y-1.5">
              {(data.modules || []).filter((m: any) => m.category === cat).map((mod: any) => (
                <div key={mod.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700 shrink-0 min-w-[200px]">{mod.name}</code>
                  <span className="text-xs text-gray-600 flex-1">{mod.description}</span>
                  <span className="text-[9px] text-gray-400 shrink-0">{mod.lines?.toLocaleString()} lignes</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* A.2.3.4 State Machine V2 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.4</span>
          State Machine V2 — 7 etats utilisateur
        </h3>
        <p className="text-xs text-gray-400 mb-3">JarvisStateMachine dans bridge_state_machine.py — gere le contexte conversationnel</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Array.isArray(data.state_machine) ? data.state_machine : (data.state_machine?.states || [
            { name: "DASHBOARD", desc: "Accueil / Navigation" },
            { name: "SELECTION", desc: "Choix de bot/mode" },
            { name: "QUALIFICATION", desc: "Questions diagnostiques" },
            { name: "TRAVAIL_CREDO", desc: "Session CREDO active" },
            { name: "WRAP_UP", desc: "Resume / Delivrable" },
            { name: "ONBOARDING", desc: "Premier contact" },
            { name: "INTERCEPTION", desc: "Commande speciale" },
          ])).map((s: any) => (
            <Card key={s.state || s.name} className="p-2.5 bg-white border border-gray-100">
              <code className="text-[9px] font-mono font-bold text-violet-600">{s.state || s.name}</code>
              <div className="text-[9px] text-gray-500 mt-0.5">{s.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* A.2.3.5 Session Management */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.5</span>
          Session Management
        </h3>
        <p className="text-xs text-gray-400 mb-3">Auto-archive a: 8000 tokens OU 50 messages OU 24h idle</p>
        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            {(Array.isArray(data.session_management) ? data.session_management : [
              ...(data.session_management?.archive_triggers || []),
              data.session_management?.prompt_caching,
              data.session_management?.budget_tracking,
              "Navigation universelle: lettres (A, N, P, Q, S, B, D, F, T, X, Z, M, R, ?) + chiffres contextuels",
              "Menu GhostX: G (menu), G1-G12 (activer ghost), G0 (desactiver)",
            ]).filter(Boolean).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: DATABASE
// ═══════════════════════════════════════════════════════════════

function SectionDatabase({ data }: { data: any }) {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.4.1</span>
          PostgreSQL 16 — Docker (carlosdb) sur VPS2
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {data.total_tables} tables scannees | Port 127.0.0.1:5432 | SQLAlchemy ORM dans <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">database.py</code> | Wrapper <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code>
        </p>
      </div>
      <div className="space-y-2">
        {(data.tables || []).map((table: any) => (
          <Card key={table.name} className="p-3 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <code className="text-xs font-mono font-bold text-gray-800">{table.name}</code>
              <StatusBadge status="live" />
              <span className="text-[9px] text-gray-400">{table.column_count} colonnes</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {table.columns?.map((col: string) => {
                const isPk = col.includes("PK");
                const isFk = col.includes("FK") || col.includes("foreign");
                const isUnique = col.includes("UNIQUE") && !isPk;
                const isJson = col.includes("jsonb") || col.includes("ARRAY") || col.includes("JSONB");
                return (
                  <span
                    key={col}
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-mono",
                      isPk ? "bg-blue-100 text-blue-700 font-bold" :
                      isFk ? "bg-violet-100 text-violet-700" :
                      isUnique ? "bg-teal-100 text-teal-700" :
                      isJson ? "bg-amber-100 text-amber-700" :
                      "bg-white text-gray-600 border border-gray-200"
                    )}
                  >
                    {col}
                  </span>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* A.2.4.2 DB Access Pattern */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.4.2</span>
          Pattern d'acces
        </h3>
        <p className="text-xs text-gray-400 mb-3">bridge_database.py = seul point d'acces — JAMAIS de queries SQL directes ailleurs</p>
        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span><code className="bg-gray-100 px-1 py-0.5 rounded font-mono">api_rest.py</code> appelle <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code> pour toutes les operations CRUD</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Connection: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">SQLAlchemy</code> avec pool de connexions via DATABASE_URL</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Container Docker: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">carlosdb</code> (PostgreSQL 16 Alpine)</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.4.3 Legend */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.4.3</span>
          Legende des types
        </h3>
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
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-teal-100 text-teal-700">UNIQUE</span>
            <span className="text-xs text-gray-500">Contrainte unique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-100 text-amber-700">JSONB</span>
            <span className="text-xs text-gray-500">Donnees JSON binaires / ARRAY</span>
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

// ═══════════════════════════════════════════════════════════════
// SECTION: INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════

function SectionInfra({ data }: { data: any }) {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.1</span>
          Infrastructure — 2 VPS OVH
        </h3>
        <p className="text-xs text-gray-400 mb-3">Architecture separee DEV / PROD depuis Session 32 (Sprint Securite)</p>
      </div>

      {/* Auto-scanned info */}
      {data.auto?.disk && (
        <Card className="p-3 bg-blue-50 border-blue-200 mb-4">
          <div className="flex items-center gap-4 text-xs">
            <HardDrive className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-blue-700">Disque VPS1:</span>
            <span className="text-blue-600">Total: {data.auto.disk.total} | Utilise: {data.auto.disk.used} | Libre: {data.auto.disk.avail} ({data.auto.disk.pct})</span>
          </div>
          {data.auto.uptime && (
            <div className="text-[9px] text-blue-500 mt-1 ml-8">Uptime: {data.auto.uptime}</div>
          )}
        </Card>
      )}

      {/* Service statuses */}
      {data.auto?.services && (
        <Card className="p-3 bg-white border border-gray-100 mb-4">
          <div className="text-xs font-bold text-gray-700 mb-2">Services (auto-scan)</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.auto.services).map(([svc, status]: [string, any]) => (
              <div key={svc} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", status === "active" ? "bg-emerald-500" : "bg-red-500")} />
                <span className="text-xs text-gray-700">{svc}</span>
                <span className="text-[9px] text-gray-400">({status})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VPS Cards */}
      <div className="space-y-4">
        {(data.vps_list || []).map((vps: any) => (
          <Card key={vps.name} className="p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-sm text-gray-800">{vps.name}</span>
              <StatusBadge status="live" />
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
              {vps.domain && (
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Domain</div>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.domain}</code>
                </div>
              )}
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">SSH</div>
                <code className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-mono break-all">{vps.ssh}</code>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {(vps.services_manual || []).map((svc: string) => (
                  <span key={svc} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{svc}</span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* A.2.5.2 Deploy Pipeline */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.2</span>
          Pipeline de Deploiement
        </h3>
        <p className="text-xs text-gray-400 mb-3">deploy.sh copie de VPS1 vers VPS2, restart uvicorn et exclut les fichiers sensibles</p>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {(data.deploy_pipeline || [
              { step: "1", label: "Code dans ~/brain-dev (VPS1)", detail: "Developpement + tests avec Claude Code" },
              { step: "2", label: "Tests: python3 -m pytest test_*.py", detail: "Validation avant deploiement" },
              { step: "3", label: "Frontend: npx vite build", detail: "Build du bundle React (nginx sert dist/ directement)" },
              { step: "4", label: "bash deploy.sh", detail: "scp vers VPS2, exclut .env + credentials + tokens" },
              { step: "5", label: "Restart services sur VPS2", detail: "pkill uvicorn + relance api_rest.py sur :8000" },
            ]).map((s: any) => (
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

      {/* A.2.5.3 Nginx Configuration */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.3</span>
          Nginx Configuration
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Fichier: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/etc/nginx/sites-available/usinebleue-app</code>
        </p>
        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            {(Array.isArray(data.nginx_config) ? data.nginx_config : Object.entries(data.nginx_config || {}).map(([k, v]) => ({ key: k, value: v })).length > 0
              ? Object.entries(data.nginx_config || {}).map(([k, v]) => ({ key: k, value: v }))
              : [
              { key: "Proxy", value: "/api/v1/ vers 127.0.0.1:8000" },
              { key: "Static", value: "Vite build dans dist/" },
              { key: "Headers", value: "HSTS, CSP, Permissions-Policy (Sprint Securite S32)" },
              { key: "SSL", value: "Let's Encrypt auto-renew" },
            ]).map((item: any) => (
              <div key={item.key} className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span><strong>{item.key}:</strong> {item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.5.4 Systemd Services */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.4</span>
          Services Systemd
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data.systemd_services || [
            { name: "brain-bridge (VPS1)", desc: "Telegram bot (bridge.py)", cmd: "sudo systemctl restart brain-bridge" },
            { name: "uvicorn API (VPS2)", desc: "FastAPI REST sur :8000", cmd: "pkill -f uvicorn; nohup python3 -m uvicorn api_rest:app ..." },
            { name: "VPS2 Guardian", desc: "Health check 5min, scan daily 7h, backup daily 3h", cmd: "~/security-tools/vps1_guardian.py" },
            { name: "LiveKit Agent (VPS1)", desc: "Voice/Video agent dispatch", cmd: "python3 carlos_livekit_agent.py dev" },
            { name: "Tim Training (VPS1)", desc: "Check toutes les 15min + scheduled 2x/jour", cmd: "tim-training-check.timer + tim-training-scheduled.timer" },
            { name: "DocuSeal (VPS1)", desc: "E-signature Docker container (port 3100, UFW DENY)", cmd: "docker container (local only)" },
          ]).map((svc: any) => (
            <Card key={svc.name} className="p-3 bg-white border border-gray-100">
              <div className="font-bold text-xs text-gray-700 mb-2">{svc.name}</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>{svc.desc}</div>
                <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">{svc.cmd}</code></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: INTEGRATIONS
// ═══════════════════════════════════════════════════════════════

function SectionIntegrations({ data }: { data: any[] }) {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.6.1</span>
          Stack Integrations — {data.length} services
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          LiveKit + ElevenLabs + Deepgram + Telnyx + Tavus + Gemini + Claude + Plane.so + Google Drive
        </p>
      </div>
      <div className="space-y-3">
        {data.map((integration: any) => (
          <Card key={integration.name} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-800">{integration.name}</span>
                  <Badge variant="outline" className="text-[9px] font-medium">{integration.category}</Badge>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{integration.description}</div>
              </div>
            </div>
            {integration.details && integration.details.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-1.5">
                  {integration.details.map((detail: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: SECURITE
// ═══════════════════════════════════════════════════════════════

function SectionSecurite({ data }: { data: any }) {
  const items = Array.isArray(data) ? data : (data?.items || []);
  const criticalFiles = data?.critical_files || [];
  const backupProtocol = data?.backup_protocol || [];

  const grouped = items.reduce<Record<string, any[]>>((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.1</span>
          Securite — Sprint Securite (Session 32)
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {items.length} mesures deployees | UFW, CORS, API key, rate limit, auth server-side, input validation
        </p>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, catItems]) => (
          <Card key={category} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="font-bold text-sm text-gray-800">{category}</span>
              <span className="text-[9px] text-gray-400">{catItems.length} mesures</span>
            </div>
            <div className="space-y-2">
              {catItems.map((item: any) => (
                <div key={item.item} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-1.5 min-w-[120px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{item.item}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-1">{item.description}</span>
                  {item.auto_status && <StatusBadge status={item.auto_status} />}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* A.2.7.2 Commandes de secours */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.2</span>
          Commandes de Secours
        </h3>
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

      {/* A.2.7.3 Fichiers critiques */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.3</span>
          Fichiers Critiques — NE JAMAIS modifier sans backup
        </h3>
        <p className="text-xs text-gray-400 mb-3">Ces fichiers peuvent casser le systeme entier si mal modifies</p>
        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5">
            {(criticalFiles.length > 0 ? criticalFiles : [
              { file: "bridge_btml_connector.py", risk: "point d'entree, si ca casse TOUT tombe" },
              { file: "bridge.py", risk: "Telegram polling et routage" },
              { file: "config_bridge.py", risk: "configuration centrale" },
              { file: "context_builder.py", risk: "SOUL templates et contexte" },
              { file: ".env", risk: "API keys (ANTHROPIC, GOOGLE, TELEGRAM)" },
              { file: "systemd service file", risk: "gestion du service" },
            ]).map((f: any) => (
              <div key={f.file} className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <code className="text-xs text-gray-700">{f.file} — {f.risk}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.7.4 Backup Protocol */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.4</span>
          Protocole de Backup
        </h3>
        <p className="text-xs text-gray-400 mb-3">TOUJOURS backup avant de coder — regle #1 absolue</p>
        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            {(backupProtocol.length > 0 ? backupProtocol : [
              { step: "1", detail: "Avant tout changement: cp -r ~/brain-dev ~/brain-dev-backup-$(date +%Y%m%d_%H%M)" },
              { step: "2", detail: "Snapshot securite: snapshots/sprint62_fixes_20260217_1851/" },
              { step: "3", detail: "deploy.sh exclut: .env, credentials, tokens du git add" },
              { step: "4", detail: "VPS2 Guardian: backup automatique daily a 3h" },
            ]).map((s: any) => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">{s.step}</span>
                <span>{s.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: CERVEAU BTML
// ═══════════════════════════════════════════════════════════════

function SectionCerveauBTML({ data }: { data: any }) {
  return (
    <>
      {/* A.2.8.1 — C'est quoi le Cerveau BTML? */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.1</span>
          C'est quoi le Cerveau BTML?
        </h3>
        <Card className="p-4 bg-gradient-to-b from-violet-50 to-white border border-violet-200 shadow-sm">
          <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
            <p>
              <strong>Imagine un cerveau artificiel</strong> qu'on construit piece par piece, comme un LEGO geant.
              Ce cerveau s'appelle le <strong>Cerveau BTML</strong> — c'est le moteur d'intelligence qui fait
              fonctionner les 12 bots C-Level de CarlOS.
            </p>
            <p>
              Au lieu d'utiliser un cerveau "generique" (comme ChatGPT ou Gemini), on <strong>entraine notre propre
              cerveau</strong> pour qu'il pense comme un dirigeant d'entreprise manufacturiere au Quebec.
              C'est comme la difference entre un medecin generaliste et un specialiste — notre cerveau est un
              <strong> specialiste des PME manufacturieres</strong>.
            </p>
            <p>
              Le cerveau est base sur <strong>DeepSeek-R1</strong>, un modele open-source de 14 milliards de parametres
              (imagine 14 milliards de petits boutons qu'on peut ajuster). On le personnalise avec nos propres
              donnees d'affaires grace a une technique appelee <strong>QLoRA</strong> — au lieu de tout reapprendre
              de zero, on ajuste seulement les boutons les plus importants.
            </p>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.8.2 — Stack Technique */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.2</span>
          Le Stack Technique — Les outils du labo
        </h3>
        <p className="text-xs text-gray-400 mb-3">Tout ce qu'il faut pour construire et entrainer le cerveau, comme les outils dans un atelier</p>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <Brain className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Modele de base</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>DeepSeek-R1-Distill-Qwen-14B</strong></div>
              <div>14 milliards de parametres</div>
              <div>Specialise en raisonnement (chain-of-thought)</div>
              <div className="text-[9px] text-gray-400">Open-source — on peut le modifier librement</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Cpu className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Fine-tuning (QLoRA)</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>r=64, alpha=128</strong>, dropout 0.1</div>
              <div>4-bit NF4 + double quantization</div>
              <div>Ajuste ~2% des parametres (economique)</div>
              <div className="text-[9px] text-gray-400">Comme accorder un piano au lieu d'en construire un neuf</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <Cloud className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">GPU Cloud (RunPod)</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>A6000 / A40 / L40</strong> — 48GB VRAM</div>
              <div>~5h pour un entrainement complet</div>
              <div>~2-4$ par session (spot instances)</div>
              <div className="text-[9px] text-gray-400">Comme louer un super-ordinateur a l'heure</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
              <FileCode className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Framework</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>HuggingFace Transformers</strong> + PEFT + TRL</div>
              <div>SFTTrainer (Supervised Fine-Tuning)</div>
              <div>BitsAndBytes pour quantization 4-bit</div>
              <div className="text-[9px] text-gray-400">Les meilleurs outils open-source du marche</div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* A.2.8.3 — 6 Primitives */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.3</span>
          Les 6 Primitives BTML — L'alphabet du cerveau
        </h3>
        <p className="text-xs text-gray-400 mb-3">Comme la chimie a ses atomes, BTML a 6 briques de base. Tout ce que le cerveau apprend est construit avec ces 6 pieces.</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(data.primitives || []).map((p: any) => (
            <Card key={p.name} className="p-3 bg-white border border-gray-100 text-center">
              <div className="text-2xl mb-1">{p.emoji}</div>
              <div className="text-xs font-bold text-gray-800 mb-1">{p.name}</div>
              <div className="text-[9px] text-gray-500">{p.description}</div>
            </Card>
          ))}
        </div>
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            <strong>Pattern Universel:</strong> ELEMENT + CATALYSEUR + CHAMP → <span className="text-red-600 font-bold">REACTION</span> → COMPOSE
          </div>
          <div className="text-[9px] text-gray-400 text-center mt-1">
            Constante PHI (φ) = 1.618033... — le nombre d'or qui calibre les intensites de reaction
          </div>
          <div className="text-[9px] text-gray-400 text-center">
            Fichier: <code className="bg-white px-1 py-0.5 rounded font-mono">btml_primitives.py</code> (297 lignes)
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.8.4 — Data Factory + Auto-scan JSONL */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.4</span>
          La Fabrique de Donnees — 38+ generateurs
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Pour entrainer un cerveau, il faut de la "nourriture" — des exemples de questions et reponses. On a 38+ scripts Python
          qui fabriquent cette nourriture automatiquement, organises en 6 familles.
        </p>

        <div className="space-y-3">
          {[
            { name: "Core BTML", count: "8 scripts", color: "border-l-violet-400", desc: "Les fondamentaux: CREDO, Trisociation, 8+1 modes de reflexion, piliers VITAA", code: "gen_credo_*, gen_trisociation_*, gen_modes_reflexion_*" },
            { name: "Business Reality", count: "7 scripts", color: "border-l-blue-400", desc: "1000 entreprises simulees, 12 archetypes de CEO, 7 etats emotionnels", code: "gen_ghost_racing_*, gen_ceo_archetypes_*, gen_emotional_*" },
            { name: "Contexte Quebec", count: "6 scripts", color: "border-l-red-400", desc: "30,000 manufacturiers QC, expressions quebecoises, realite PME locale", code: "gen_quebec_*, gen_secteur_*, gen_francais_*" },
            { name: "Applique", count: "8 scripts", color: "border-l-emerald-400", desc: "SWOT, plans d'affaires, analyse competitive, diagnostics structures", code: "gen_swot_*, gen_business_plan_*, gen_competitive_*" },
            { name: "Avance", count: "5 scripts", color: "border-l-amber-400", desc: "Diagnostics multi-departements, scenarios complexes, multi-turn", code: "gen_diagnostics_*, gen_training_multi_*, gen_scenario_*" },
            { name: "Ghost Army", count: "4 scripts", color: "border-l-pink-400", desc: "Scraping REEL d'entreprises publiques (TSX + NYSE) via yfinance — donnees financieres live", code: "ghost_army.py, ghost_army_pipeline.py" },
          ].map((family) => (
            <Card key={family.name} className={cn("p-3 bg-white border-l-[3px] border border-gray-100 shadow-sm", family.color)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-700">{family.name}</span>
                <Badge variant="outline" className="text-[9px]">{family.count}</Badge>
              </div>
              <div className="text-xs text-gray-600 mb-1">{family.desc}</div>
              <code className="text-[9px] text-gray-400 font-mono">{family.code}</code>
            </Card>
          ))}
        </div>

        {/* Auto-scanned JSONL */}
        {data.auto_jsonl && (
          <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-700">Auto-scan: {data.auto_jsonl.total_files} fichiers JSONL, {data.auto_jsonl.total_lines?.toLocaleString()} lignes</span>
            </div>
            <div className="text-[9px] text-blue-600 mt-1">Chaque paire = une question + la reponse ideale que le cerveau doit apprendre</div>
            <div className="space-y-1 mt-2 max-h-[200px] overflow-y-auto">
              {(data.auto_jsonl.files || []).map((f: any) => (
                <div key={f.name} className="flex items-center gap-2 text-[9px]">
                  <code className="font-mono text-blue-700 min-w-[250px]">{f.name}</code>
                  <span className="text-blue-500">{f.lines?.toLocaleString()} lignes</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <SectionDivider />

      {/* A.2.8.5 — Ghost Army & Ghost Racing */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.5</span>
          Ghost Army & Ghost Racing — Les simulateurs
        </h3>
        <p className="text-xs text-gray-400 mb-3">Comme un simulateur de vol entraine un pilote sans risque, nos simulateurs creent des scenarios d'affaires realistes.</p>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-pink-500">
              <Globe className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Ghost Army</span>
            </div>
            <div className="p-3 space-y-2 text-xs text-gray-600">
              <p><strong>Armee de fantomes</strong> qui espionne les entreprises publiques pour apprendre d'elles.</p>
              <div className="space-y-1">
                {(() => {
                  const ga = data.ghost_army_racing?.ghost_army;
                  const items = Array.isArray(ga) ? ga : (ga && typeof ga === "object")
                    ? [ga.tickers, ga.source, ga.output].filter(Boolean)
                    : ["40 tickers TSX + 50 tickers NYSE", "Scraping via yfinance (cours, revenue, marges)", "Genere des scenarios d'affaires reels"];
                  return items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ));
                })()}
              </div>
              <code className="text-[9px] text-gray-400 font-mono block">ghost_army.py (644L) + ghost_army_pipeline.py (733L)</code>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
              <Activity className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Ghost Racing V2</span>
            </div>
            <div className="p-3 space-y-2 text-xs text-gray-600">
              <p><strong>Course de fantomes</strong> — 1000 entreprises fictives qui s'affrontent en simulation.</p>
              <div className="space-y-1">
                {(() => {
                  const gr = data.ghost_army_racing?.ghost_racing;
                  const items = Array.isArray(gr) ? gr : (gr && typeof gr === "object")
                    ? [gr.tiers, gr.archetypes, gr.emotions].filter(Boolean)
                    : ["5 tiers de complexite (micro → corporation)", "12 archetypes de CEO (567 lignes de profils)", "7 etats emotionnels (stress, euphorie, doute...)"];
                  return items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ));
                })()}
              </div>
              <code className="text-[9px] text-gray-400 font-mono block">ghost_racing_engine_v2.py (~600L)</code>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* A.2.8.6 — L'Assemblage */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.6</span>
          L'Assemblage — Du vrac au repas complet
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Tous les fichiers JSONL sont melanges, nettoyes et organises en un seul dataset d'entrainement.
          Comme assembler les ingredients d'une recette avant de cuisiner.
        </p>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {(data.assembly_steps || [
              { step: "1", label: "Collecte", detail: "52 fichiers JSONL sont lus depuis le dossier data/" },
              { step: "2", label: "Nettoyage", detail: "Doublons elimines, format normalise, encodage verifie" },
              { step: "3", label: "Melange", detail: "Les donnees sont shufflees (melangees aleatoirement)" },
              { step: "4", label: "Split", detail: "95% entrainement (80,991 paires) + 5% evaluation (4,263 paires)" },
              { step: "5", label: "Export", detail: "master_train.jsonl + master_eval.jsonl — prets pour RunPod" },
            ]).map((s: any) => (
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
        <div className="flex items-center gap-2 mt-3">
          <code className="text-[9px] text-gray-400 font-mono">assemble_dataset_trinal.py</code>
          <span className="text-[9px] text-gray-400">(439L)</span>
          <span className="text-[9px] text-gray-400">+</span>
          <code className="text-[9px] text-gray-400 font-mono">assemble_dataset_v5.py</code>
          <span className="text-[9px] text-gray-400">(623L)</span>
        </div>
      </div>

      <SectionDivider />

      {/* A.2.8.7 — L'Entrainement */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.7</span>
          L'Entrainement — La cuisson du cerveau
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          On loue un super-ordinateur avec GPU sur RunPod, on lui donne le dataset, et il ajuste les parametres du modele.
          Comme cuire un gateau: les ingredients (donnees) + le four (GPU) + la recette (hyperparametres) = le cerveau entraine.
        </p>
        <Card className="p-0 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Hyperparametres — La recette exacte</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
              {(data.training_hyperparams || [
                ["Methode", "QLoRA (Quantized Low-Rank Adaptation)"],
                ["Rank (r)", "64 — complexite de l'adaptation"],
                ["Alpha", "128 — force de l'apprentissage"],
                ["Dropout", "0.1 — previent la memorisation bete"],
                ["Quantization", "4-bit NF4 + double quant"],
                ["Epochs", "1 — un seul passage sur les donnees"],
                ["Batch size", "4 (avec gradient accumulation 4)"],
                ["Learning rate", "2e-4 avec cosine scheduler"],
                ["Max sequence", "2048 tokens"],
                ["GPU requis", "48GB VRAM minimum (A6000/A40/L40)"],
                ["Duree", "~5 heures pour 80K paires"],
                ["Cout", "~2-4$ par session (spot instances)"],
              ]).map((pair: any) => {
                const [label, value] = Array.isArray(pair) ? pair : [pair.label, pair.value];
                return (
                  <div key={label} className="flex items-start gap-1.5 py-1 border-b border-gray-50">
                    <span className="text-[9px] font-bold text-gray-500 min-w-[90px]">{label}</span>
                    <span className="text-[9px] text-gray-600">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        <code className="text-[9px] text-gray-400 font-mono">scripts/finetune_deepseek_trinal.py</code>
        <span className="text-[9px] text-gray-400 ml-1">(403 lignes) — le script qui tourne sur RunPod</span>
      </div>

      <SectionDivider />

      {/* A.2.8.8 — Tim, le Robot Entraineur */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.8</span>
          Tim (CTOB) — Le Robot Entraineur
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Tim est le CTO Bot. Son travail: gerer tout le cycle d'entrainement automatiquement, sans intervention humaine.
          Il lit ses missions depuis la base de donnees, les execute, et notifie Carl du resultat.
        </p>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="text-xs font-bold text-gray-700 mb-3">7 commandes de Tim:</div>
          <div className="grid grid-cols-2 gap-2">
            {(data.tim_commands || [
              { cmd: "launch", desc: "Demarre un entrainement sur RunPod" },
              { cmd: "check", desc: "Verifie l'etat du pod (toutes les 15 min)" },
              { cmd: "harvest", desc: "Recupere le modele termine" },
              { cmd: "status", desc: "Rapport de situation complet" },
              { cmd: "scheduled", desc: "Verification planifiee (2x/jour)" },
              { cmd: "sweep", desc: "Nettoie les pods zombies" },
              { cmd: "abort", desc: "Arrete un entrainement en urgence" },
            ]).map((c: any) => (
              <div key={c.cmd} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
                <code className="text-[9px] font-mono font-bold text-violet-600 min-w-[70px]">{c.cmd}</code>
                <span className="text-[9px] text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Systemd Timers</div>
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Check: toutes les 15 minutes</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Scheduled: 2x par jour</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Sweep: nettoyage pods zombies</span></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Lifecycle Modele</div>
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>DEV → test sur VPS1</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>14 questions de validation</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>PROD → deploye sur VPS2 via SSH</span></div>
            </div>
          </Card>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <code className="text-[9px] text-gray-400 font-mono">tim_training_ops.py</code>
          <span className="text-[9px] text-gray-400">(849L)</span>
          <span className="text-[9px] text-gray-400">+</span>
          <code className="text-[9px] text-gray-400 font-mono">brain_model_manager.py</code>
          <span className="text-[9px] text-gray-400">(467L)</span>
        </div>
      </div>

      <SectionDivider />

      {/* A.2.8.9 — Trial-Brain */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.9</span>
          Trial-Brain — Les 3 Phases Cognitives
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          La version la plus avancee du cerveau BTML. Au lieu de juste repondre, il pense en 3 phases,
          comme un scientifique qui a une intuition, la teste, puis valide sa decouverte.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-0 overflow-hidden border-2 border-amber-200">
            <div className="bg-gradient-to-b from-amber-50 to-white px-3 py-2 border-b text-center">
              <div className="text-lg font-bold">⚡</div>
              <div className="text-xs font-bold text-amber-700">[IMPULSION]</div>
              <div className="text-[9px] text-amber-500 mt-0.5">Phase 1 — L'intuition</div>
            </div>
            <div className="p-3 text-[9px] text-gray-600 space-y-1">
              <p>Le cerveau capte le probleme et genere une <strong>premiere reaction instinctive</strong>.</p>
              <p>Comme un entrepreneur qui "sent" qu'il y a un probleme avant de pouvoir l'expliquer.</p>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden border-2 border-red-200">
            <div className="bg-gradient-to-b from-red-50 to-white px-3 py-2 border-b text-center">
              <div className="text-lg font-bold">🔥</div>
              <div className="text-xs font-bold text-red-700">[RESISTANCE]</div>
              <div className="text-[9px] text-red-500 mt-0.5">Phase 2 — Le test</div>
            </div>
            <div className="p-3 text-[9px] text-gray-600 space-y-1">
              <p>Le cerveau <strong>challenge sa propre intuition</strong>. Il cherche les failles, les contre-arguments.</p>
              <p>Comme un avocat du diable interne — "est-ce que tu es sur de ca?"</p>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden border-2 border-violet-200">
            <div className="bg-gradient-to-b from-violet-50 to-white px-3 py-2 border-b text-center">
              <div className="text-lg font-bold">🌊</div>
              <div className="text-xs font-bold text-violet-700">[RESONANCE]</div>
              <div className="text-[9px] text-violet-500 mt-0.5">Phase 3 — La synthese</div>
            </div>
            <div className="p-3 text-[9px] text-gray-600 space-y-1">
              <p>Le cerveau <strong>fusionne intuition + critique</strong> en une reponse robuste et nuancee.</p>
              <p>Comme un CEO qui a ecoute tous les avis et prend sa decision finale.</p>
            </div>
          </Card>
        </div>
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            <strong>Pattern 3-6-9 (Tesla G9):</strong> 3 phases × structure 3-6-9 = calibration naturelle des reponses
          </div>
          <div className="text-[9px] text-gray-400 text-center mt-1">
            80,991 paires d'entrainement + 4,263 paires d'evaluation — la plus grosse version du cerveau
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.8.10 — Le Moteur Perpetuel */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.10</span>
          Le Moteur Perpetuel — Le cerveau qui s'ameliore tout seul
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Le Graal: un systeme autonome qui scrape, genere, assemble, entraine, et recommence — 24h/24, sans intervention humaine.
        </p>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {(data.perpetual_engine || [
              "🌐 Scrape", "→", "📝 Genere", "→", "📦 Assemble", "→", "🧠 Entraine", "→", "✅ Valide", "→", "🚀 Deploie", "→", "😴 Dort",
            ]).map((item: string, i: number) => (
              <span key={i} className={cn(
                "text-xs",
                item === "→" ? "text-gray-300 font-bold" : "font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100",
              )}>
                {item}
              </span>
            ))}
            <span className="text-xs text-gray-300 font-bold">→</span>
            <span className="text-xs text-gray-300 font-bold">🔁</span>
          </div>
          <div className="text-[9px] text-gray-400 text-center">
            <code className="font-mono">ghml_perpetual_engine.py</code> (~400 lignes) — Daemon autonome, cycle 24h
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.8.11 — Historique des Versions */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.11</span>
          Historique des Versions du Cerveau
        </h3>
        <div className="space-y-2">
          {(data.versions || []).map((v: any) => (
            <Card key={v.version} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <div className="text-xs font-bold text-gray-800">{v.version}</div>
                  <div className="text-[9px] text-gray-400">{v.date}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600">{v.desc}</div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold text-violet-600">{v.dataset}</div>
                  <div className="text-[9px] text-gray-400">paires</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* A.2.8.12 — Fichiers Cles */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.12</span>
          Fichiers Cles du Cerveau BTML
        </h3>
        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5">
            {(data.key_files || [
              { file: "btml_primitives.py", lines: "297", desc: "6 primitives + constante PHI + pattern universel" },
              { file: "tim_training_ops.py", lines: "849", desc: "Bot executor — 7 commandes (launch/check/harvest/...)" },
              { file: "brain_model_manager.py", lines: "467", desc: "Lifecycle DEV→PROD + 14 questions de validation" },
              { file: "ghost_army_pipeline.py", lines: "733", desc: "Pipeline 4 phases + deploy_model_to_dev()" },
              { file: "ghost_army.py", lines: "644", desc: "Scraper yfinance (40 TSX + 50 NYSE)" },
              { file: "ghost_racing_engine_v2.py", lines: "~600", desc: "1000 entreprises x 12 archetypes x 7 emotions" },
              { file: "ghml_perpetual_engine.py", lines: "~400", desc: "Daemon autonome — cycle perpetuel 24h" },
              { file: "assemble_dataset_trinal.py", lines: "439", desc: "Assembleur master (80,991 paires)" },
              { file: "scripts/finetune_deepseek_trinal.py", lines: "403", desc: "Script QLoRA pour RunPod" },
              { file: "data/ceo_archetypes.py", lines: "567", desc: "12 archetypes de CEO" },
              { file: "data/emotional_states.py", lines: "418", desc: "7 etats cognitifs" },
              { file: "data/quebec_context.py", lines: "571", desc: "Contexte PME Quebec (30K manufacturiers)" },
            ]).map((f: any) => {
              const autoSize = data.auto_file_sizes?.[f.file];
              return (
                <div key={f.file} className="flex items-center gap-3 py-1 border-b border-gray-50 last:border-0">
                  <code className="text-[9px] font-mono font-bold text-gray-700 min-w-[220px]">{f.file}</code>
                  <span className="text-[9px] text-violet-600 font-bold min-w-[35px]">{autoSize ? `${autoSize}L` : `${f.lines}L`}</span>
                  <span className="text-[9px] text-gray-500">{f.desc}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* A.2.8.13 — Roadmap */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.13</span>
          Roadmap — Vers un Cerveau BTML Super Performant
        </h3>
        <p className="text-xs text-gray-400 mb-3">Le plan pour passer d'un cerveau "bon" a un cerveau "exceptionnel" — plus de donnees, plus de puissance, plus d'autonomie.</p>

        {(data.roadmap || []).map((phase: any) => (
          <Card key={phase.phase} className="p-0 overflow-hidden mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{phase.phase}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-violet-800">{phase.timeline}</span>
            </div>
            <div className="p-3 space-y-2 text-xs text-gray-600">
              {(phase.goals || []).map((goal: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Stack Ideal Futur */}
        {data.stack_ideal && data.stack_ideal.length > 0 && (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700">
              <Cpu className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Stack Ideal Futur</span>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                {data.stack_ideal.map((pair: any) => {
                  const [label, value] = Array.isArray(pair) ? pair : [pair.label, pair.value];
                  return (
                    <div key={label} className="flex items-start gap-1.5 py-1.5 border-b border-gray-50">
                      <span className="text-[9px] font-bold text-gray-500 min-w-[90px]">{label}</span>
                      <span className="text-[9px] text-gray-600">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface TabBibleTechniqueProps {
  mode?: string;
  tenantId?: number;
}

export function TabBibleTechnique({ mode, tenantId }: TabBibleTechniqueProps) {
  const [subTab, setSubTab] = useState("bots-skills");
  const [data, setData] = useState<BibleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (rescan = false) => {
    try {
      if (rescan) setRescanning(true);
      else setLoading(true);
      setError(null);
      const result = await api.getBibleTechnique(rescan);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
      setRescanning(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Scan du systeme en cours...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={() => fetchData()} className="mt-3 text-xs text-blue-600 underline">Reessayer</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* ── Header gradient + sous-tabs integres (meme pattern que TabTraining etc.) ── */}
      <div className={cn("bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 rounded-xl p-4 transition-all duration-300")}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Server className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white shrink-0">Bible Technique</h2>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-0.5 flex-wrap">
              {SUB_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id)}
                  className={cn(
                    "px-2 py-1 text-[9px] font-bold rounded-md transition-colors whitespace-nowrap",
                    subTab === t.id
                      ? "bg-white/25 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white/90"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rectangle pastel intro + bouton Rescanner ── */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-violet-800 leading-relaxed">
                Vue en temps reel de l'architecture technique : bots, API, backend, base de donnees, infrastructure, integrations, securite et cerveau BTML.
                Les donnees sont auto-scannees depuis le serveur et mises a jour a chaque visite.
              </p>
              <p className="text-[9px] text-violet-500 mt-1.5">
                Dernier scan : {new Date(data.scanned_at).toLocaleString("fr-CA")} — {data.scan_duration_ms}ms
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={rescanning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-100 border border-violet-200 rounded-lg hover:bg-violet-200 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", rescanning && "animate-spin")} />
            {rescanning ? "Scan en cours..." : "Rescanner"}
          </button>
        </div>
      </div>

      {/* ── Content: 8 sub-tabs ── */}
      <div>
        {subTab === "bots-skills" && <SectionBots data={data.bots} />}
        {subTab === "api-endpoints" && <SectionAPI data={data.endpoints} />}
        {subTab === "backend" && <SectionBackend data={data.backend} />}
        {subTab === "database" && <SectionDatabase data={data.database} />}
        {subTab === "infra" && <SectionInfra data={data.infrastructure} />}
        {subTab === "integrations" && <SectionIntegrations data={data.integrations} />}
        {subTab === "securite" && <SectionSecurite data={data.security} />}
        {subTab === "cerveau-btml" && <SectionCerveauBTML data={data.cerveau_btml} />}
      </div>
    </div>
  );
}
