/**
 * CerveauBTMLView.tsx — Section Cerveau BTML V3 (God Mode only)
 *
 * V3 NATIF — Appels API directs + design V3 (hero, DocForge sidebar, V3Card).
 * AUCUN import de tabs V2. Tout est rendu avec les patterns V3.
 *
 * 8 sections: Bots & Skills, API, Backend, Database, Infra, Intégrations, Sécurité, Cerveau BTML
 */

import { useState, useEffect, useCallback } from "react";
import {
  Brain, Users, Globe, Server, Database, HardDrive, Link2, Shield,
  ArrowRight, CheckCircle2, AlertTriangle, Terminal, Lock, Cpu,
  Cloud, FileCode, Atom, RefreshCw, Loader2, Clock, Zap, Activity,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import type { SectionProps } from "../core/types";
import { api } from "../../v2/api/client";
import { LivingHero } from "./shared/LivingHero";

// ═══ Types ═══

type BtmlSection = "bots-skills" | "api-endpoints" | "backend" | "database" | "infra" | "integrations" | "securite" | "cerveau-btml";

interface SidebarItem {
  id: BtmlSection;
  label: string;
  icon: React.ElementType;
}

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

// ═══ Sidebar items ═══

const BTML_SIDEBAR: SidebarItem[] = [
  { id: "bots-skills", label: "Bots & Skills", icon: Users },
  { id: "api-endpoints", label: "API & Endpoints", icon: Globe },
  { id: "backend", label: "Backend", icon: Server },
  { id: "database", label: "Base de Données", icon: Database },
  { id: "infra", label: "Infrastructure", icon: HardDrive },
  { id: "integrations", label: "Intégrations", icon: Link2 },
  { id: "securite", label: "Sécurité", icon: Shield },
  { id: "cerveau-btml", label: "Cerveau BTML", icon: Brain },
];

// ═══ Card wrapper — pattern V3 obligatoire ═══

function V3Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all", className)}>
      {children}
    </div>
  );
}

function V3CardHeader({ icon: Icon, title, badge, rightSlot }: { icon: React.ElementType; title: string; badge?: string | number; rightSlot?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
      <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
      <span className="text-sm font-bold text-gray-900">{title}</span>
      {badge !== undefined && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{badge}</span>}
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </div>
  );
}

// ═══ Helper components ═══

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    live: { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
    active: { label: "ACTIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    inactive: { label: "INACTIVE", className: "bg-red-100 text-red-700 border-red-200" },
    unknown: { label: "?", className: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = config[status] || config["unknown"];
  return <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", c.className)}>{c.label}</span>;
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

const BOT_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500", violet: "bg-violet-500", emerald: "bg-emerald-500",
  pink: "bg-pink-500", red: "bg-red-500", orange: "bg-orange-500",
  slate: "bg-slate-500", teal: "bg-teal-500", rose: "bg-rose-500",
  amber: "bg-amber-500", indigo: "bg-indigo-500", zinc: "bg-zinc-500",
};

// ═══ SECTION 1 — Bots & Skills ═══

function SectionBots({ data }: { data: any[] }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-800 mb-1">Équipe Brain Team — {data.length} Agents C-Level</div>
      <p className="text-[10px] text-gray-400 mb-2">
        Chaque bot possède une Trisociation (3 OS combinés), un fichier SOUL unique, et un ensemble de skills spécialisés.
      </p>
      {data.map((bot: any) => (
        <V3Card key={bot.code}>
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0", BOT_COLOR_MAP[bot.color] || "bg-gray-500")}>
                {bot.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900">{bot.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{bot.role}</span>
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
                  <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">{bot.soul_path}</code>
                  <span className="text-[9px] text-gray-400">({bot.soul_size_display})</span>
                </div>
              </div>
            </div>
          </div>
        </V3Card>
      ))}

      <V3Card className="border-violet-200">
        <div className="px-4 py-3 bg-violet-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Atom className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-violet-800">Framework BTML — Référence Complète</div>
              <p className="text-[10px] text-violet-600 mt-0.5">CREDO, VITAA, 12 Ghosts, 8+1 Modes, Tableau Périodique, Triangle du Feu — voir section Cerveau BTML.</p>
            </div>
          </div>
        </div>
      </V3Card>
    </div>
  );
}

// ═══ SECTION 2 — API & Endpoints ═══

function SectionAPI({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-800">API REST — FastAPI sur VPS2</div>
      <p className="text-[10px] text-gray-400 mb-2">
        {data.total} endpoints | {data.group_count} groupes | Port 8000 (bind 127.0.0.1) | Nginx proxy <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/api/v1/</code>
      </p>
      {Object.entries(data.groups || {}).map(([groupKey, endpoints]: [string, any]) => (
        <V3Card key={groupKey}>
          <V3CardHeader icon={Server} title={groupKey} badge={`${endpoints.length} endpoints`} />
          <div className="px-4 py-2 space-y-1.5">
            {endpoints.map((ep: any, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                <MethodBadge method={ep.method} />
                <code className="text-[10px] font-mono text-gray-700 flex-1">{ep.path}</code>
              </div>
            ))}
          </div>
        </V3Card>
      ))}

      <V3Card>
        <V3CardHeader icon={Lock} title="Authentification" />
        <div className="px-4 py-3 space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div><span className="font-medium text-gray-700">API Key:</span> Variable <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">GHOSTX_API_KEY</code> dans .env</div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div><span className="font-medium text-gray-700">Login:</span> POST /api/v1/auth/login avec SHA256 hash</div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div><span className="font-medium text-gray-700">Rate Limit:</span> 30 req/min par API key — sliding window</div>
          </div>
        </div>
      </V3Card>
    </div>
  );
}

// ═══ SECTION 3 — Backend ═══

function SectionBackend({ data }: { data: any }) {
  const categories = [...new Set((data.modules || []).map((m: any) => m.category))];

  return (
    <div className="space-y-3">
      {/* Message Flow Pipeline */}
      <V3Card>
        <V3CardHeader icon={ArrowRight} title="Message Flow — Pipeline de traitement" />
        <div className="px-4 py-3">
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
        </div>
      </V3Card>

      {/* Tier Routing */}
      <div className="text-xs font-bold text-gray-800 mt-4 mb-2">Routage 5 Tiers — Optimisation coût vs capacité</div>
      <div className="grid grid-cols-5 gap-2">
        {[
          { tier: "T0", name: "Regex/Cache", cost: "Gratuit", pct: "30-40%", color: "bg-emerald-500" },
          { tier: "T1", name: "Gemini Flash", cost: "Gratuit", pct: "~30%", color: "bg-emerald-400" },
          { tier: "T2", name: "Gemini Pro", cost: "Gratuit", pct: "~20%", color: "bg-amber-400" },
          { tier: "T3", name: "Claude Sonnet", cost: "$0.01-0.05", pct: "~15%", color: "bg-orange-400" },
          { tier: "T4", name: "Claude Opus", cost: "$0.15-0.60", pct: "~5%", color: "bg-red-400" },
        ].map((t) => (
          <V3Card key={t.tier}>
            <div className="p-3 text-center">
              <div className={cn("text-white font-bold text-xs px-2 py-1 rounded mb-2 inline-block", t.color)}>{t.tier}</div>
              <div className="text-xs font-medium text-gray-700">{t.name}</div>
              <div className="text-[9px] text-gray-400 mt-1">{t.cost}/req</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{t.pct}</div>
            </div>
          </V3Card>
        ))}
      </div>

      {/* Modules by Category */}
      <div className="text-xs font-bold text-gray-800 mt-4 mb-2">
        Modules Python — {data.total_files} fichiers ({data.total_lines?.toLocaleString()} lignes)
      </div>
      {categories.map((cat: string) => (
        <V3Card key={cat}>
          <V3CardHeader icon={FileCode} title={data.category_labels?.[cat] || cat} badge={`${(data.modules || []).filter((m: any) => m.category === cat).length}`} />
          <div className="px-4 py-2 space-y-1">
            {(data.modules || []).filter((m: any) => m.category === cat).map((mod: any) => (
              <div key={mod.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700 shrink-0 min-w-[180px]">{mod.name}</code>
                <span className="text-[10px] text-gray-600 flex-1">{mod.description}</span>
                <span className="text-[9px] text-gray-400 shrink-0">{mod.lines?.toLocaleString()} lignes</span>
              </div>
            ))}
          </div>
        </V3Card>
      ))}

      {/* State Machine */}
      <div className="text-xs font-bold text-gray-800 mt-4 mb-2">State Machine V2 — 7 états utilisateur</div>
      <div className="grid grid-cols-4 gap-2">
        {(Array.isArray(data.state_machine) ? data.state_machine : (data.state_machine?.states || [
          { name: "DASHBOARD", desc: "Accueil / Navigation" },
          { name: "SELECTION", desc: "Choix de bot/mode" },
          { name: "QUALIFICATION", desc: "Questions diagnostiques" },
          { name: "TRAVAIL_CREDO", desc: "Session CREDO active" },
          { name: "WRAP_UP", desc: "Résumé / Livrable" },
          { name: "ONBOARDING", desc: "Premier contact" },
          { name: "INTERCEPTION", desc: "Commande spéciale" },
        ])).map((s: any) => (
          <V3Card key={s.state || s.name}>
            <div className="p-2.5">
              <code className="text-[9px] font-mono font-bold text-violet-600">{s.state || s.name}</code>
              <div className="text-[9px] text-gray-500 mt-0.5">{s.desc}</div>
            </div>
          </V3Card>
        ))}
      </div>
    </div>
  );
}

// ═══ SECTION 4 — Database ═══

function SectionDatabase({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-800">PostgreSQL 16 — Docker (carlosdb) sur VPS2</div>
      <p className="text-[10px] text-gray-400 mb-2">
        {data.total_tables} tables | Port 127.0.0.1:5432 | Wrapper <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code>
      </p>
      {(data.tables || []).map((table: any) => (
        <V3Card key={table.name}>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-xs font-mono font-bold text-gray-800">{table.name}</code>
              <StatusBadge status="live" />
              <span className="text-[9px] text-gray-400">{table.column_count} colonnes</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {table.columns?.map((col: string) => {
                const isPk = col.includes("PK");
                const isFk = col.includes("FK") || col.includes("foreign");
                const isJson = col.includes("jsonb") || col.includes("ARRAY") || col.includes("JSONB");
                return (
                  <span key={col} className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono",
                    isPk ? "bg-blue-100 text-blue-700 font-bold" :
                    isFk ? "bg-violet-100 text-violet-700" :
                    isJson ? "bg-amber-100 text-amber-700" :
                    "bg-white text-gray-600 border border-gray-200"
                  )}>{col}</span>
                );
              })}
            </div>
          </div>
        </V3Card>
      ))}

      {/* Légende */}
      <div className="flex flex-wrap gap-3 mt-2">
        {[
          { cls: "bg-blue-100 text-blue-700 font-bold", label: "PK", desc: "Clé primaire" },
          { cls: "bg-violet-100 text-violet-700", label: "FK", desc: "Clé étrangère" },
          { cls: "bg-amber-100 text-amber-700", label: "JSONB", desc: "JSON / ARRAY" },
          { cls: "bg-white text-gray-600 border border-gray-200", label: "col", desc: "Standard" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono", l.cls)}>{l.label}</span>
            <span className="text-[10px] text-gray-500">{l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ SECTION 5 — Infrastructure ═══

function SectionInfra({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-800">Infrastructure — 2 VPS OVH</div>
      <p className="text-[10px] text-gray-400 mb-2">Architecture séparée DEV / PROD depuis Session 32</p>

      {/* Auto-scanned disk */}
      {data.auto?.disk && (
        <V3Card className="border-blue-200">
          <div className="px-4 py-3 bg-blue-50/50 flex items-center gap-4 text-xs">
            <HardDrive className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-blue-700">Disque VPS1:</span>
            <span className="text-blue-600">Total: {data.auto.disk.total} | Utilisé: {data.auto.disk.used} | Libre: {data.auto.disk.avail} ({data.auto.disk.pct})</span>
          </div>
        </V3Card>
      )}

      {/* Auto-scanned services */}
      {data.auto?.services && (
        <V3Card>
          <V3CardHeader icon={Server} title="Services (auto-scan)" />
          <div className="px-4 py-3 flex flex-wrap gap-3">
            {Object.entries(data.auto.services).map(([svc, status]: [string, any]) => (
              <div key={svc} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", status === "active" ? "bg-emerald-500" : "bg-red-500")} />
                <span className="text-xs text-gray-700">{svc}</span>
                <span className="text-[9px] text-gray-400">({status})</span>
              </div>
            ))}
          </div>
        </V3Card>
      )}

      {/* VPS Cards */}
      {(data.vps_list || []).map((vps: any) => (
        <V3Card key={vps.name}>
          <V3CardHeader icon={HardDrive} title={vps.name} badge={vps.role} />
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">IP</div>
                <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.ip}</code>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Provider</div>
                <span className="text-xs text-gray-600">{vps.provider}</span>
              </div>
              {vps.domain && (
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Domain</div>
                  <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.domain}</code>
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
          </div>
        </V3Card>
      ))}

      {/* Deploy Pipeline */}
      <V3Card>
        <V3CardHeader icon={ArrowRight} title="Pipeline de Déploiement" />
        <div className="px-4 py-3 space-y-2.5">
          {(data.deploy_pipeline || [
            { step: "1", label: "Code dans ~/brain-dev (VPS1)", detail: "Développement + tests avec Claude Code" },
            { step: "2", label: "Tests: python3 -m pytest test_*.py", detail: "Validation avant déploiement" },
            { step: "3", label: "Frontend: npx vite build", detail: "Build du bundle React (nginx sert dist/ directement)" },
            { step: "4", label: "bash deploy.sh", detail: "scp vers VPS2, exclut .env + credentials + tokens" },
            { step: "5", label: "Restart services sur VPS2", detail: "pkill uvicorn + relance api_rest.py sur :8000" },
          ]).map((s: any) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">{s.step}</div>
              <div>
                <div className="text-xs font-medium text-gray-700">{s.label}</div>
                <div className="text-[9px] text-gray-400">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </V3Card>
    </div>
  );
}

// ═══ SECTION 6 — Intégrations ═══

function SectionIntegrations({ data }: { data: any[] }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-800">Stack Intégrations — {data.length} services</div>
      <p className="text-[10px] text-gray-400 mb-2">
        LiveKit + ElevenLabs + Deepgram + Telnyx + Tavus + Gemini + Claude + Plane.so + Google Drive
      </p>
      {data.map((integration: any) => (
        <V3Card key={integration.name}>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Link2 className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">{integration.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{integration.category}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{integration.description}</div>
              </div>
            </div>
            {integration.details && integration.details.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                {integration.details.map((detail: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-gray-600">{detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </V3Card>
      ))}
    </div>
  );
}

// ═══ SECTION 7 — Sécurité ═══

function SectionSecurite({ data }: { data: any }) {
  const items = Array.isArray(data) ? data : (data?.items || []);
  const criticalFiles = data?.critical_files || [];

  const grouped = items.reduce<Record<string, any[]>>((acc, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-800">Sécurité — Sprint Sécurité (Session 32)</div>
      <p className="text-[10px] text-gray-400 mb-2">{items.length} mesures déployées | UFW, CORS, API key, rate limit, auth server-side</p>

      {Object.entries(grouped).map(([category, catItems]) => (
        <V3Card key={category}>
          <V3CardHeader icon={Shield} title={category} badge={`${catItems.length}`} />
          <div className="px-4 py-2 space-y-1.5">
            {catItems.map((item: any) => (
              <div key={item.item} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-gray-700 min-w-[100px]">{item.item}</span>
                <span className="text-[10px] text-gray-500 flex-1">{item.description}</span>
                {item.auto_status && <StatusBadge status={item.auto_status} />}
              </div>
            ))}
          </div>
        </V3Card>
      ))}

      {/* Commandes de secours */}
      <V3Card>
        <V3CardHeader icon={Terminal} title="Commandes de Secours" />
        <div className="px-4 py-3 space-y-1.5">
          {[
            { label: "CarlOS est mort?", cmd: "sudo systemctl restart brain-bridge" },
            { label: "Logs en temps réel", cmd: "sudo journalctl -u brain-bridge -f" },
            { label: "Voir les changements", cmd: "git diff" },
            { label: "Annuler tout", cmd: "git checkout -- ." },
            { label: "Status du service", cmd: "sudo systemctl status brain-bridge" },
          ].map((item) => (
            <div key={item.cmd} className="flex items-center gap-3 py-1">
              <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 min-w-[140px]">{item.label}</span>
              <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">{item.cmd}</code>
            </div>
          ))}
        </div>
      </V3Card>

      {/* Fichiers critiques */}
      <V3Card>
        <V3CardHeader icon={AlertTriangle} title="Fichiers Critiques — NE JAMAIS modifier sans backup" />
        <div className="px-4 py-3 space-y-1.5">
          {(criticalFiles.length > 0 ? criticalFiles : [
            { file: "bridge_btml_connector.py", risk: "point d'entrée, si ça casse TOUT tombe" },
            { file: "bridge.py", risk: "Telegram polling et routage" },
            { file: "config_bridge.py", risk: "configuration centrale" },
            { file: ".env", risk: "API keys (ANTHROPIC, GOOGLE, TELEGRAM)" },
          ]).map((f: any) => (
            <div key={f.file} className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <code className="text-[10px] text-gray-700">{f.file} — {f.risk}</code>
            </div>
          ))}
        </div>
      </V3Card>
    </div>
  );
}

// ═══ SECTION 8 — Cerveau BTML ═══

function SectionCerveauBTML({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {/* Explication */}
      <V3Card className="border-violet-200">
        <div className="px-4 py-4 bg-gradient-to-b from-violet-50 to-white space-y-3 text-xs text-gray-700 leading-relaxed">
          <p>
            <strong>Le Cerveau BTML</strong> est le moteur d'intelligence qui fait fonctionner les 12 bots C-Level de CarlOS.
            Au lieu d'un cerveau "générique", on <strong>entraîne notre propre cerveau</strong> spécialisé pour les PME manufacturières au Québec.
          </p>
          <p>
            Basé sur <strong>DeepSeek-R1</strong> (14 milliards de paramètres), personnalisé avec <strong>QLoRA</strong> —
            on ajuste seulement ~2% des paramètres les plus importants.
          </p>
        </div>
      </V3Card>

      {/* Stack Technique */}
      <div className="text-xs font-bold text-gray-800 mt-4 mb-2">Le Stack Technique — Les outils du labo</div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Brain, title: "Modèle de base", color: "from-violet-600 to-violet-500", items: ["DeepSeek-R1-Distill-Qwen-14B", "14 milliards de paramètres", "Spécialisé en raisonnement (chain-of-thought)"] },
          { icon: Cpu, title: "Fine-tuning (QLoRA)", color: "from-blue-600 to-blue-500", items: ["r=64, alpha=128, dropout 0.1", "4-bit NF4 + double quantization", "Ajuste ~2% des paramètres"] },
          { icon: Cloud, title: "GPU Cloud (RunPod)", color: "from-emerald-600 to-emerald-500", items: ["A6000 / A40 / L40 — 48GB VRAM", "~5h pour un entraînement complet", "~2-4$ par session (spot instances)"] },
          { icon: FileCode, title: "Framework", color: "from-amber-600 to-amber-500", items: ["HuggingFace Transformers + PEFT + TRL", "SFTTrainer (Supervised Fine-Tuning)", "BitsAndBytes pour quantization 4-bit"] },
        ].map((card) => (
          <V3Card key={card.title}>
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", card.color)}>
              <card.icon className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{card.title}</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              {card.items.map((item, i) => (
                <div key={i}>{i === 0 ? <strong>{item}</strong> : item}</div>
              ))}
            </div>
          </V3Card>
        ))}
      </div>

      {/* 6 Primitives */}
      <div className="text-xs font-bold text-gray-800 mt-4 mb-2">Les 6 Primitives BTML — L'alphabet du cerveau</div>
      <p className="text-[10px] text-gray-400 mb-2">Comme la chimie a ses atomes, BTML a 6 briques de base.</p>
      <div className="grid grid-cols-3 gap-3">
        {(data?.primitives || []).map((p: any) => (
          <V3Card key={p.name}>
            <div className="p-3 text-center">
              <div className="text-2xl mb-1">{p.emoji}</div>
              <div className="text-xs font-bold text-gray-800 mb-1">{p.name}</div>
              <div className="text-[9px] text-gray-500">{p.description}</div>
            </div>
          </V3Card>
        ))}
      </div>

      {/* Pattern Universel */}
      <V3Card>
        <div className="px-4 py-3 bg-gray-50 text-center">
          <div className="text-xs text-gray-600">
            <strong>Pattern Universel:</strong> ÉLÉMENT + CATALYSEUR + CHAMP → <span className="text-red-600 font-bold">RÉACTION</span> → COMPOSÉ
          </div>
          <div className="text-[9px] text-gray-400 mt-1">
            Constante PHI (φ) = 1.618033... — le nombre d'or qui calibre les intensités de réaction
          </div>
          <div className="text-[9px] text-gray-400">
            Fichier: <code className="bg-white px-1 py-0.5 rounded font-mono">btml_primitives.py</code> (297 lignes)
          </div>
        </div>
      </V3Card>

      {/* Data Factory */}
      <div className="text-xs font-bold text-gray-800 mt-4 mb-2">La Fabrique de Données — 38+ générateurs</div>
      <div className="space-y-2">
        {[
          { name: "Core BTML", count: "8 scripts", color: "border-l-violet-400", desc: "CREDO, Trisociation, 8+1 modes de réflexion, piliers VITAA" },
          { name: "Business Reality", count: "7 scripts", color: "border-l-blue-400", desc: "1000 entreprises simulées, 12 archétypes de CEO" },
          { name: "Contexte Québec", count: "6 scripts", color: "border-l-red-400", desc: "30,000 manufacturiers QC, expressions québécoises" },
          { name: "Appliqué", count: "8 scripts", color: "border-l-emerald-400", desc: "SWOT, plans d'affaires, analyse compétitive" },
          { name: "Avancé", count: "5 scripts", color: "border-l-amber-400", desc: "Diagnostics multi-départements, scénarios complexes" },
          { name: "Ghost Army", count: "4 scripts", color: "border-l-pink-400", desc: "Scraping RÉEL d'entreprises publiques (TSX + NYSE) via yfinance" },
        ].map((family) => (
          <V3Card key={family.name} className={cn("border-l-[3px]", family.color)}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-700">{family.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{family.count}</span>
              </div>
              <div className="text-[10px] text-gray-600">{family.desc}</div>
            </div>
          </V3Card>
        ))}
      </div>

      {/* Auto-scanned JSONL */}
      {data?.auto_jsonl && (
        <V3Card className="border-blue-200">
          <div className="px-4 py-3 bg-blue-50/50 flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-700">Auto-scan: {data.auto_jsonl.total_files} fichiers JSONL, {data.auto_jsonl.total_lines?.toLocaleString()} lignes</span>
          </div>
        </V3Card>
      )}

      {/* ── A.2.8.5 — Ghost Army & Ghost Racing ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.5</span>
        Ghost Army & Ghost Racing — Les simulateurs
      </div>
      <p className="text-[10px] text-gray-400 mb-2">Comme un simulateur de vol entraîne un pilote sans risque, nos simulateurs créent des scénarios d'affaires réalistes.</p>
      <div className="grid grid-cols-2 gap-3">
        <V3Card>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-pink-500">
            <Globe className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Ghost Army</span>
          </div>
          <div className="p-3 space-y-2 text-xs text-gray-600">
            <p><strong>Armée de fantômes</strong> qui espionne les entreprises publiques pour apprendre d'elles.</p>
            <div className="space-y-1">
              {(() => {
                const ga = data?.ghost_army_racing?.ghost_army;
                const items = Array.isArray(ga) ? ga : (ga && typeof ga === "object")
                  ? [ga.tickers, ga.source, ga.output].filter(Boolean)
                  : ["40 tickers TSX + 50 tickers NYSE", "Scraping via yfinance (cours, revenue, marges)", "Génère des scénarios d'affaires réels"];
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
        </V3Card>
        <V3Card>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
            <Activity className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Ghost Racing V2</span>
          </div>
          <div className="p-3 space-y-2 text-xs text-gray-600">
            <p><strong>Course de fantômes</strong> — 1000 entreprises fictives qui s'affrontent en simulation.</p>
            <div className="space-y-1">
              {(() => {
                const gr = data?.ghost_army_racing?.ghost_racing;
                const items = Array.isArray(gr) ? gr : (gr && typeof gr === "object")
                  ? [gr.tiers, gr.archetypes, gr.emotions].filter(Boolean)
                  : ["5 tiers de complexité (micro → corporation)", "12 archétypes de CEO (567 lignes de profils)", "7 états émotionnels (stress, euphorie, doute...)"];
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
        </V3Card>
      </div>

      {/* ── A.2.8.6 — L'Assemblage ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.6</span>
        L'Assemblage — Du vrac au repas complet
      </div>
      <p className="text-[10px] text-gray-400 mb-2">
        Tous les fichiers JSONL sont mélangés, nettoyés et organisés en un seul dataset d'entraînement.
      </p>
      <V3Card>
        <div className="px-4 py-3 space-y-3">
          {(data?.assembly_steps || [
            { step: "1", label: "Collecte", detail: "52 fichiers JSONL sont lus depuis le dossier data/" },
            { step: "2", label: "Nettoyage", detail: "Doublons éliminés, format normalisé, encodage vérifié" },
            { step: "3", label: "Mélange", detail: "Les données sont shufflées (mélangées aléatoirement)" },
            { step: "4", label: "Split", detail: "95% entraînement (80,991 paires) + 5% évaluation (4,263 paires)" },
            { step: "5", label: "Export", detail: "master_train.jsonl + master_eval.jsonl — prêts pour RunPod" },
          ]).map((s: any) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">{s.step}</div>
              <div>
                <div className="text-xs font-medium text-gray-700">{s.label}</div>
                <div className="text-[9px] text-gray-400">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </V3Card>
      <div className="flex items-center gap-2 mt-2">
        <code className="text-[9px] text-gray-400 font-mono">assemble_dataset_trinal.py</code>
        <span className="text-[9px] text-gray-400">(439L) +</span>
        <code className="text-[9px] text-gray-400 font-mono">assemble_dataset_v5.py</code>
        <span className="text-[9px] text-gray-400">(623L)</span>
      </div>

      {/* ── A.2.8.7 — L'Entraînement ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.7</span>
        L'Entraînement — La cuisson du cerveau
      </div>
      <p className="text-[10px] text-gray-400 mb-2">
        On loue un super-ordinateur avec GPU sur RunPod, on lui donne le dataset, et il ajuste les paramètres du modèle.
      </p>
      <V3Card>
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Hyperparamètres — La recette exacte</span>
        </div>
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
            {(data?.training_hyperparams || [
              ["Méthode", "QLoRA (Quantized Low-Rank Adaptation)"],
              ["Rank (r)", "64 — complexité de l'adaptation"],
              ["Alpha", "128 — force de l'apprentissage"],
              ["Dropout", "0.1 — prévient la mémorisation bête"],
              ["Quantization", "4-bit NF4 + double quant"],
              ["Epochs", "1 — un seul passage sur les données"],
              ["Batch size", "4 (avec gradient accumulation 4)"],
              ["Learning rate", "2e-4 avec cosine scheduler"],
              ["Max sequence", "2048 tokens"],
              ["GPU requis", "48GB VRAM minimum (A6000/A40/L40)"],
              ["Durée", "~5 heures pour 80K paires"],
              ["Coût", "~2-4$ par session (spot instances)"],
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
      </V3Card>
      <div className="flex items-center gap-2 mt-2">
        <code className="text-[9px] text-gray-400 font-mono">scripts/finetune_deepseek_trinal.py</code>
        <span className="text-[9px] text-gray-400">(403 lignes) — le script qui tourne sur RunPod</span>
      </div>

      {/* ── A.2.8.8 — Tim, le Robot Entraîneur ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.8</span>
        Tim (CTOB) — Le Robot Entraîneur
      </div>
      <p className="text-[10px] text-gray-400 mb-2">
        Tim est le CTO Bot. Son travail: gérer tout le cycle d'entraînement automatiquement, sans intervention humaine.
      </p>
      <V3Card>
        <V3CardHeader icon={Terminal} title="7 commandes de Tim" />
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            {(data?.tim_commands || [
              { cmd: "launch", desc: "Démarre un entraînement sur RunPod" },
              { cmd: "check", desc: "Vérifie l'état du pod (toutes les 15 min)" },
              { cmd: "harvest", desc: "Récupère le modèle terminé" },
              { cmd: "status", desc: "Rapport de situation complet" },
              { cmd: "scheduled", desc: "Vérification planifiée (2x/jour)" },
              { cmd: "sweep", desc: "Nettoie les pods zombies" },
              { cmd: "abort", desc: "Arrête un entraînement en urgence" },
            ]).map((c: any) => (
              <div key={c.cmd} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
                <code className="text-[9px] font-mono font-bold text-violet-600 min-w-[70px]">{c.cmd}</code>
                <span className="text-[9px] text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </V3Card>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <V3Card>
          <div className="px-4 py-3">
            <div className="text-xs font-bold text-gray-700 mb-1">Systemd Timers</div>
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Check: toutes les 15 minutes</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Scheduled: 2x par jour</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Sweep: nettoyage pods zombies</span></div>
            </div>
          </div>
        </V3Card>
        <V3Card>
          <div className="px-4 py-3">
            <div className="text-xs font-bold text-gray-700 mb-1">Lifecycle Modèle</div>
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>DEV → test sur VPS1</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>14 questions de validation</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>PROD → déployé sur VPS2 via SSH</span></div>
            </div>
          </div>
        </V3Card>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <code className="text-[9px] text-gray-400 font-mono">tim_training_ops.py</code>
        <span className="text-[9px] text-gray-400">(849L) +</span>
        <code className="text-[9px] text-gray-400 font-mono">brain_model_manager.py</code>
        <span className="text-[9px] text-gray-400">(467L)</span>
      </div>

      {/* ── A.2.8.9 — Trial-Brain ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.9</span>
        Trial-Brain — Les 3 Phases Cognitives
      </div>
      <p className="text-[10px] text-gray-400 mb-2">
        La version la plus avancée du cerveau BTML. Au lieu de juste répondre, il pense en 3 phases.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <V3Card className="border-2 border-amber-200">
          <div className="bg-gradient-to-b from-amber-50 to-white px-3 py-2 border-b text-center">
            <div className="text-lg font-bold">⚡</div>
            <div className="text-xs font-bold text-amber-700">[IMPULSION]</div>
            <div className="text-[9px] text-amber-500 mt-0.5">Phase 1 — L'intuition</div>
          </div>
          <div className="p-3 text-[9px] text-gray-600 space-y-1">
            <p>Le cerveau capte le problème et génère une <strong>première réaction instinctive</strong>.</p>
            <p>Comme un entrepreneur qui "sent" qu'il y a un problème avant de pouvoir l'expliquer.</p>
          </div>
        </V3Card>
        <V3Card className="border-2 border-red-200">
          <div className="bg-gradient-to-b from-red-50 to-white px-3 py-2 border-b text-center">
            <div className="text-lg font-bold">🔥</div>
            <div className="text-xs font-bold text-red-700">[RÉSISTANCE]</div>
            <div className="text-[9px] text-red-500 mt-0.5">Phase 2 — Le test</div>
          </div>
          <div className="p-3 text-[9px] text-gray-600 space-y-1">
            <p>Le cerveau <strong>challenge sa propre intuition</strong>. Il cherche les failles, les contre-arguments.</p>
            <p>Comme un avocat du diable interne — "est-ce que tu es sûr de ça?"</p>
          </div>
        </V3Card>
        <V3Card className="border-2 border-violet-200">
          <div className="bg-gradient-to-b from-violet-50 to-white px-3 py-2 border-b text-center">
            <div className="text-lg font-bold">🌊</div>
            <div className="text-xs font-bold text-violet-700">[RÉSONANCE]</div>
            <div className="text-[9px] text-violet-500 mt-0.5">Phase 3 — La synthèse</div>
          </div>
          <div className="p-3 text-[9px] text-gray-600 space-y-1">
            <p>Le cerveau <strong>fusionne intuition + critique</strong> en une réponse robuste et nuancée.</p>
            <p>Comme un CEO qui a écouté tous les avis et prend sa décision finale.</p>
          </div>
        </V3Card>
      </div>
      <V3Card className="mt-3">
        <div className="px-4 py-3 bg-gray-50 text-center">
          <div className="text-xs text-gray-600">
            <strong>Pattern 3-6-9 (Tesla G9):</strong> 3 phases × structure 3-6-9 = calibration naturelle des réponses
          </div>
          <div className="text-[9px] text-gray-400 mt-1">
            80,991 paires d'entraînement + 4,263 paires d'évaluation — la plus grosse version du cerveau
          </div>
        </div>
      </V3Card>

      {/* ── A.2.8.10 — Le Moteur Perpétuel ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.10</span>
        Le Moteur Perpétuel — Le cerveau qui s'améliore tout seul
      </div>
      <p className="text-[10px] text-gray-400 mb-2">
        Le Graal: un système autonome qui scrape, génère, assemble, entraîne, et recommence — 24h/24, sans intervention humaine.
      </p>
      <V3Card>
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {(data?.perpetual_engine || [
              "🌐 Scrape", "→", "📝 Génère", "→", "📦 Assemble", "→", "🧠 Entraîne", "→", "✅ Valide", "→", "🚀 Déploie", "→", "😴 Dort",
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
        </div>
      </V3Card>

      {/* ── A.2.8.11 — Historique des Versions ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.11</span>
        Historique des Versions du Cerveau
      </div>
      <div className="space-y-2">
        {(data?.versions || []).map((v: any) => (
          <V3Card key={v.version}>
            <div className="px-4 py-3 flex items-center gap-3">
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
          </V3Card>
        ))}
      </div>

      {/* ── A.2.8.12 — Fichiers Clés ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.12</span>
        Fichiers Clés du Cerveau BTML
      </div>
      <V3Card>
        <div className="px-4 py-3 space-y-1.5">
          {(data?.key_files || [
            { file: "btml_primitives.py", lines: "297", desc: "6 primitives + constante PHI + pattern universel" },
            { file: "tim_training_ops.py", lines: "849", desc: "Bot executor — 7 commandes (launch/check/harvest/...)" },
            { file: "brain_model_manager.py", lines: "467", desc: "Lifecycle DEV→PROD + 14 questions de validation" },
            { file: "ghost_army_pipeline.py", lines: "733", desc: "Pipeline 4 phases + deploy_model_to_dev()" },
            { file: "ghost_army.py", lines: "644", desc: "Scraper yfinance (40 TSX + 50 NYSE)" },
            { file: "ghost_racing_engine_v2.py", lines: "~600", desc: "1000 entreprises x 12 archétypes x 7 émotions" },
            { file: "ghml_perpetual_engine.py", lines: "~400", desc: "Daemon autonome — cycle perpétuel 24h" },
            { file: "assemble_dataset_trinal.py", lines: "439", desc: "Assembleur master (80,991 paires)" },
            { file: "scripts/finetune_deepseek_trinal.py", lines: "403", desc: "Script QLoRA pour RunPod" },
            { file: "data/ceo_archetypes.py", lines: "567", desc: "12 archétypes de CEO" },
            { file: "data/emotional_states.py", lines: "418", desc: "7 états cognitifs" },
            { file: "data/quebec_context.py", lines: "571", desc: "Contexte PME Québec (30K manufacturiers)" },
          ]).map((f: any) => {
            const autoSize = data?.auto_file_sizes?.[f.file];
            return (
              <div key={f.file} className="flex items-center gap-3 py-1 border-b border-gray-50 last:border-0">
                <code className="text-[9px] font-mono font-bold text-gray-700 min-w-[220px]">{f.file}</code>
                <span className="text-[9px] text-violet-600 font-bold min-w-[35px]">{autoSize ? `${autoSize}L` : `${f.lines}L`}</span>
                <span className="text-[9px] text-gray-500">{f.desc}</span>
              </div>
            );
          })}
        </div>
      </V3Card>

      {/* ── A.2.8.13 — Roadmap ── */}
      <div className="border-t border-gray-100 pt-4 mt-4" />
      <div className="text-xs font-bold text-gray-800 mb-2">
        <span className="text-[9px] text-gray-400 mr-1">A.2.8.13</span>
        Roadmap — Vers un Cerveau BTML Super Performant
      </div>
      <p className="text-[10px] text-gray-400 mb-2">Le plan pour passer d'un cerveau "bon" à un cerveau "exceptionnel".</p>
      {(data?.roadmap || []).map((phase: any) => (
        <V3Card key={phase.phase} className="mb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">{phase.phase}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-violet-800">{phase.timeline}</span>
          </div>
          <div className="px-4 py-3 space-y-2 text-xs text-gray-600">
            {(phase.goals || []).map((goal: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </V3Card>
      ))}

      {/* Stack Idéal Futur */}
      {data?.stack_ideal && data.stack_ideal.length > 0 && (
        <V3Card>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700">
            <Cpu className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Stack Idéal Futur</span>
          </div>
          <div className="px-4 py-3">
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
        </V3Card>
      )}
    </div>
  );
}

// ═══ Re-exports pour AdminView (Stack Technique) ═══
export { SectionBots, SectionAPI, SectionBackend, SectionDatabase, SectionInfra, SectionIntegrations, SectionSecurite, SectionCerveauBTML, BTML_SIDEBAR };
export type { BtmlSection, BibleData };

// ═══ COMPOSANT PRINCIPAL ═══

export function CerveauBTMLView({ showHeader }: SectionProps) {
  const [activeSection, setActiveSection] = useState<BtmlSection>("bots-skills");
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

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* Hero animé */}
      {showHeader && (
        <LivingHero blur1="bg-purple-100/70" blur2="bg-violet-100/60" title="Le cerveau business." description="12 bots, CREDO, VITAA — modélisé.">
          <div className="relative w-[380px] h-[150px]">
            {/* Brain outline + business network */}
            <svg className="absolute right-[10px] top-[0px]" viewBox="0 0 240 150" width="340" height="150">
              {/* Outer orbit ring */}
              <ellipse cx="120" cy="75" rx="95" ry="60" fill="none" stroke="#c4b5fd" strokeWidth="0.5" strokeDasharray="3 6" className="anim-btml-orbit" />
              {/* Synapses — brain center to 6 business nodes */}
              <line x1="120" y1="75" x2="38" y2="30" stroke="#a855f7" strokeWidth="1.5" className="anim-btml-syn-1" />
              <line x1="120" y1="75" x2="200" y2="25" stroke="#8b5cf6" strokeWidth="1.5" className="anim-btml-syn-2" />
              <line x1="120" y1="75" x2="30" y2="105" stroke="#7c3aed" strokeWidth="1.5" className="anim-btml-syn-3" />
              <line x1="120" y1="75" x2="210" y2="110" stroke="#a855f7" strokeWidth="1.5" className="anim-btml-syn-4" />
              <line x1="120" y1="75" x2="75" y2="140" stroke="#8b5cf6" strokeWidth="1.5" className="anim-btml-syn-5" />
              <line x1="120" y1="75" x2="170" y2="140" stroke="#7c3aed" strokeWidth="1.5" className="anim-btml-syn-6" />
              {/* Brain SVG — stylized cerebrum */}
              <g className="anim-btml-brain">
                <path d="M120 45 C105 45 92 50 88 60 C82 55 75 58 73 65 C68 65 65 72 68 78 C65 82 67 90 73 92 C72 98 78 105 86 105 C90 110 98 112 105 110 C110 115 118 116 120 112 C122 116 130 115 135 110 C142 112 150 110 154 105 C162 105 168 98 167 92 C173 90 175 82 172 78 C175 72 172 65 167 65 C165 58 158 55 152 60 C148 50 135 45 120 45Z" fill="none" stroke="#9333ea" strokeWidth="2" />
                <path d="M105 55 C108 65 115 70 120 68 C125 70 132 65 135 55" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
                <path d="M88 72 C95 68 105 72 110 78" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
                <path d="M130 78 C135 72 145 68 152 72" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
                <path d="M95 90 C105 85 115 88 120 95 C125 88 135 85 145 90" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
              </g>
              {/* 6 Business nodes — les 6 primitives */}
              <g className="anim-btml-node-1"><circle cx="38" cy="30" r="10" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" /><text x="38" y="34" textAnchor="middle" fill="#7c3aed" fontSize="11" fontWeight="bold">$</text></g>
              <g className="anim-btml-node-2"><circle cx="200" cy="25" r="10" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="1.5" /><text x="200" y="29" textAnchor="middle" fill="#7c3aed" fontSize="10">⚡</text></g>
              <g className="anim-btml-node-3"><circle cx="30" cy="105" r="10" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="1.5" /><text x="30" y="109" textAnchor="middle" fill="#7c3aed" fontSize="10">🎯</text></g>
              <g className="anim-btml-node-4"><circle cx="210" cy="110" r="10" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" /><text x="210" y="114" textAnchor="middle" fill="#7c3aed" fontSize="9">📊</text></g>
              <g className="anim-btml-node-5"><circle cx="75" cy="140" r="10" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="1.5" /><text x="75" y="144" textAnchor="middle" fill="#7c3aed" fontSize="9">👥</text></g>
              <g className="anim-btml-node-6"><circle cx="170" cy="140" r="10" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="1.5" /><text x="170" y="144" textAnchor="middle" fill="#7c3aed" fontSize="9">⚛</text></g>
            </svg>
            {/* Glass panel — Intelligence d'affaires */}
            <div className="glass-base absolute right-[55px] top-[20px] w-52 h-[100px] p-3 border-purple-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Cerveau BTML</h4>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /><span className="text-[8px] font-bold text-purple-500">ACTIF</span></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono text-slate-400">CREDO</span>
                  <div className="flex gap-1">{["C","R","E","D","O"].map((l) => <span key={l} className="text-[6px] font-bold px-1 py-0.5 rounded bg-purple-100 text-purple-600">{l}</span>)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono text-slate-400">VITAA</span>
                  <div className="flex gap-1">{["V","I","T","A","A"].map((l,i) => <span key={`${l}${i}`} className="text-[6px] font-bold px-1 py-0.5 rounded bg-violet-100 text-violet-600">{l}</span>)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono text-slate-400">BOTS</span>
                  <span className="text-[8px] font-bold text-purple-600">12 C-Level</span>
                </div>
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-xs text-gray-500">Scan du système en cours...</span>
        </div>
      )}

      {error && (
        <div className="py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-600">{error}</p>
          <button onClick={() => fetchData()} className="mt-2 text-xs text-blue-600 underline cursor-pointer">Réessayer</button>
        </div>
      )}

      {/* DocForge: Sidebar + Content */}
      {data && !loading && (
        <>
          {/* Scan info + Rescanner */}
          {data.scanned_at && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-[9px] text-gray-400">
                Scanné: {new Date(data.scanned_at).toLocaleString("fr-CA")} ({data.scan_duration_ms}ms)
              </span>
              <button
                onClick={() => fetchData(true)}
                disabled={rescanning}
                className="text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded-lg flex items-center gap-1 font-medium cursor-pointer disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", rescanning && "animate-spin")} />
                {rescanning ? "Scan..." : "Rescanner"}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {/* Sidebar w-[180px] */}
            <div className="w-[180px] shrink-0 space-y-0.5 pt-1">
              {BTML_SIDEBAR.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveSection(item.id)}
                    className={cn("w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                      isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent")}>
                    <div className="flex items-center gap-1.5">
                      <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                      <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {activeSection === "bots-skills" && <SectionBots data={data.bots || []} />}
              {activeSection === "api-endpoints" && <SectionAPI data={data.endpoints || {}} />}
              {activeSection === "backend" && <SectionBackend data={data.backend || {}} />}
              {activeSection === "database" && <SectionDatabase data={data.database || {}} />}
              {activeSection === "infra" && <SectionInfra data={data.infrastructure || {}} />}
              {activeSection === "integrations" && <SectionIntegrations data={data.integrations || []} />}
              {activeSection === "securite" && <SectionSecurite data={data.security || {}} />}
              {activeSection === "cerveau-btml" && <SectionCerveauBTML data={data.cerveau_btml || {}} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
