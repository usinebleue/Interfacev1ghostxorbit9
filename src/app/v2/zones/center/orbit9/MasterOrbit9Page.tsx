/**
 * MasterOrbit9Page.tsx — Orbit9 & Reseau
 * Reference GHML: Matching, cellules, economie collaborative
 * Summary page — scannable, FINAL STATE, cards + grids + status badges
 */

import {
  Network, Database, Users, ShoppingBag, Scale, Coins,
  Handshake, CheckCircle2, ArrowRight, AlertTriangle,
  Clock, Zap, Shield, Globe, Brain, Layers,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// HELPER — Status Badge
// ================================================================

function StatusBadge({ status }: { status: "live" | "en-cours" | "a-faire" | "planifie" }) {
  const config = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
    "planifie": { label: "PLANIFIE", className: "bg-blue-100 text-blue-600 border-blue-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ================================================================
// DATA
// ================================================================

const ORBIT9_TABLES = [
  { name: "orbit9_members", description: "Profils des membres du reseau", columns: "id, name, company, sector, specialites (JSONB), region, vitaa_score, created_at" },
  { name: "orbit9_cellules", description: "Groupements de cellules collaboratives", columns: "id, name, theme, member_ids (JSONB), status, created_at" },
  { name: "orbit9_matches", description: "Resultats de matching + scores", columns: "id, member_a_id (FK), member_b_id (FK), score (FLOAT), reasons (JSONB), status, created_at" },
];

const ORBIT9_ENDPOINTS = [
  { method: "GET", path: "/orbit9/members", desc: "List members", status: "live" as const },
  { method: "POST", path: "/orbit9/members", desc: "Create member profile", status: "live" as const },
  { method: "POST", path: "/orbit9/match", desc: "Run matching algorithm", status: "live" as const },
  { method: "GET", path: "/orbit9/matches", desc: "Get match results", status: "live" as const },
  { method: "GET", path: "/orbit9/cellules", desc: "List cellules", status: "live" as const },
  { method: "POST", path: "/orbit9/cellules", desc: "Create cellule", status: "live" as const },
  { method: "POST", path: "/orbit9/scout/{id}", desc: "Scout scan (MVP mock)", status: "en-cours" as const },
  { method: "GET", path: "/orbit9/qualification/{id}", desc: "Qualification pipeline", status: "a-faire" as const },
  { method: "POST", path: "/orbit9/invite", desc: "Invite member to cellule", status: "live" as const },
  { method: "GET", path: "/orbit9/trisociation", desc: "Trisociation room data", status: "live" as const },
  { method: "POST", path: "/orbit9/jumelage", desc: "Launch jumelage session", status: "live" as const },
];

const DECISION_ENDPOINTS = [
  { method: "GET", path: "/decisions", desc: "List decisions (D-001+)", status: "live" as const },
  { method: "POST", path: "/decisions", desc: "Create decision entry", status: "live" as const },
  { method: "PUT", path: "/decisions/{id}", desc: "Update decision", status: "live" as const },
  { method: "POST", path: "/decisions/{id}/reverse", desc: "Reverse decision", status: "live" as const },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterOrbit9Page() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Network}
          iconColor="text-orange-600"
          title="Orbit9 & Reseau"
          subtitle="Matching, cellules, economie collaborative"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* 1. Orbit9 en Bref */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Orbit9 en Bref</h3>
        <p className="text-xs text-gray-400 mb-3">
          Moteur de developpement economique collaboratif — le coeur du reseau GhostX
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700 mb-1">Checklist 101 elements</div>
                <div className="text-xs text-gray-500">Futur "Waze decisionnel" — guide chaque entrepreneur a travers les etapes critiques de croissance</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700 mb-1">9 cercles concentriques</div>
                <div className="text-xs text-gray-500">Croissance fractale: 1 &rarr; 3 &rarr; 9 &rarr; 27 &rarr; 81 &rarr; 243 &rarr; 729...</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700 mb-1">Anti-cartel integre</div>
                <div className="text-xs text-gray-500">Aucun monopole sectoriel — max 2 membres du meme secteur par cellule</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700 mb-1">Scoring IA</div>
                <div className="text-xs text-gray-500">Gemini Flash evalue la complementarite entre membres — fallback keyword matching</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 2. Matching Engine (LIVE) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Matching Engine</h3>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          3 tables PostgreSQL + 15 endpoints REST + scoring Gemini Flash + trisociation LiveKit
        </p>

        {/* Tables */}
        <div className="space-y-2 mb-4">
          {ORBIT9_TABLES.map((table) => (
            <Card key={table.name} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Database className="h-3.5 w-3.5 text-blue-500" />
                <code className="text-xs font-mono font-bold text-gray-800">{table.name}</code>
                <StatusBadge status="live" />
              </div>
              <div className="text-xs text-gray-500 mb-1.5">{table.description}</div>
              <div className="text-[9px] text-gray-400 font-mono bg-gray-50 rounded px-2 py-1">{table.columns}</div>
            </Card>
          ))}
        </div>

        {/* Endpoints */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-sm text-gray-800">Endpoints Orbit9</span>
            <span className="text-[9px] text-gray-400">{ORBIT9_ENDPOINTS.length} endpoints</span>
          </div>
          <div className="space-y-1.5">
            {ORBIT9_ENDPOINTS.map((ep) => (
              <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                <span className={cn(
                  "text-[9px] font-bold font-mono px-1.5 py-0.5 rounded min-w-[38px] text-center inline-block",
                  ep.method === "GET" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {ep.method}
                </span>
                <code className="text-xs font-mono text-gray-700 flex-1">/api/v1{ep.path}</code>
                <span className="text-[9px] text-gray-400 hidden md:block">{ep.desc}</span>
                <StatusBadge status={ep.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 3. Cellules de Collaboration */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Cellules de Collaboration</h3>
        <p className="text-xs text-gray-400 mb-3">
          Unite de base du reseau Orbit9 — groupement de membres complementaires
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Taille", value: "3-9 membres par cellule", icon: Users, color: "blue" },
            { label: "Matching", value: "Par competences + secteur + complementarite", icon: Zap, color: "amber" },
            { label: "Anti-monopole", value: "Max 2 du meme secteur par cellule", icon: Shield, color: "red" },
            { label: "Scoring", value: "Gemini Flash + VITAA + specialites croisees", icon: Brain, color: "violet" },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <Card key={item.label} className="p-3 bg-white border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ItemIcon className={cn("h-3.5 w-3.5", `text-${item.color}-500`)} />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</span>
                </div>
                <div className="text-xs text-gray-700">{item.value}</div>
              </Card>
            );
          })}
        </div>

        <Card className="p-3 bg-orange-50 border-orange-200 mt-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-xs font-bold text-orange-700">Cellules CRUD frontend</span>
          </div>
          <div className="text-xs text-orange-600">Pas encore wire dans le frontend — seulement members + matches pour l'instant</div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 4. Marketplace */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Marketplace</h3>
        <p className="text-xs text-gray-400 mb-3">
          2 volets dans l'interface — Bots & Agents + Opportunites
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700">Bots & Agents</div>
                <div className="text-[9px] text-gray-400">Catalogue des bots specialises</div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <span>12 bots C-Level disponibles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <span>Bots futurs sous chaque C-Level</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <span>Expert Marketplace (Sprint D)</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700">Opportunites</div>
                <div className="text-[9px] text-gray-400">Cahiers d'appel d'offres</div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Appels d'offres publies par les membres</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Matching automatique avec competences</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Notifications push aux membres qualifies</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 5. Gouvernance (D-098) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Gouvernance</h3>
          <Badge variant="outline" className="text-[9px] font-bold">D-098</Badge>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Protocole de gouvernance CarlOS — decisions tracees, auditables, reversibles
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-violet-500" />
            <span className="font-bold text-sm text-gray-800">Decision Log</span>
            <span className="text-[9px] text-gray-400">4 endpoints</span>
          </div>
          <div className="space-y-1.5">
            {DECISION_ENDPOINTS.map((ep) => (
              <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                <span className={cn(
                  "text-[9px] font-bold font-mono px-1.5 py-0.5 rounded min-w-[38px] text-center inline-block",
                  ep.method === "GET" ? "bg-blue-100 text-blue-700" :
                  ep.method === "POST" ? "bg-emerald-100 text-emerald-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {ep.method}
                </span>
                <code className="text-xs font-mono text-gray-700 flex-1">/api/v1{ep.path}</code>
                <span className="text-[9px] text-gray-400">{ep.desc}</span>
                <StatusBadge status={ep.status} />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-xs text-gray-700">Phase 1 — DONE</span>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <div>Table decision_log PostgreSQL</div>
              <div>4 endpoints API REST</div>
              <div>Frontend hooks branches</div>
              <div>Decisions D-001 a D-109+</div>
            </div>
          </Card>

          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-bold text-xs text-blue-700">Board Room CA Robotique</span>
              <Badge variant="outline" className="text-[9px] font-bold">D-099</Badge>
            </div>
            <div className="space-y-1 text-xs text-blue-600">
              <div>Design valide, apres COMMAND frontend</div>
              <div>CA augmente par IA avec les 12 bots</div>
              <div>Sprint D planifie</div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 6. TimeTokens (V1) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">TimeTokens</h3>
          <Badge variant="outline" className="text-[9px] font-bold">V1</Badge>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Unite de valeur collaboration — tracking des echanges entre membres
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[
            { label: "Phase", value: "V1", detail: "Off-chain SQLite", color: "emerald" },
            { label: "Formule", value: "5D", detail: "TT-RG: A x D x I x Z x P", color: "blue" },
            { label: "Tracking", value: "Auto", detail: "Bots trackent, zero self-reporting", color: "violet" },
            { label: "Blockchain", value: "Futur", detail: "Ethereum/Polygon L2 prevu", color: "amber" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">{kpi.label}</div>
              <div className={cn("text-lg font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{kpi.detail}</div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">Evolution en 3 phases</div>
          <div className="flex gap-2">
            {[
              { phase: "Phase 1", label: "Off-Chain", desc: "SQLite local, tracking par bots", status: "live" as const },
              { phase: "Phase 2", label: "Hybrid", desc: "PostgreSQL centralise, audit trail", status: "planifie" as const },
              { phase: "Phase 3", label: "On-Chain", desc: "Smart contracts, distribution auto", status: "planifie" as const },
            ].map((p) => (
              <div key={p.phase} className="flex-1 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold text-gray-700">{p.phase}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-xs font-medium text-gray-700">{p.label}</div>
                <div className="text-[9px] text-gray-500 mt-0.5">{p.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 7. Jumelage Live */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Jumelage Live</h3>
        <p className="text-xs text-gray-400 mb-3">
          Interface de matching en temps reel avec trisociation LiveKit
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {[
              { label: "Selection criteres", color: "bg-blue-100 text-blue-700" },
              { label: "Matching IA", color: "bg-violet-100 text-violet-700" },
              { label: "Resultats scores", color: "bg-emerald-100 text-emerald-700" },
              { label: "Trisociation", color: "bg-orange-100 text-orange-700" },
              { label: "Room LiveKit", color: "bg-pink-100 text-pink-700" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold px-2 py-1 rounded", step.color)}>{step.label}</span>
                {i < 4 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Trisociation: 3 membres complementaires reunis dans une room LiveKit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>CarlOS auto-join dans la room comme facilitateur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Scoring en temps reel via Gemini Flash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Scout Bot: MVP retourne resultats mockes — connecter a un vrai scan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Qualification pipeline: 5 etapes progressives a implementer</span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
