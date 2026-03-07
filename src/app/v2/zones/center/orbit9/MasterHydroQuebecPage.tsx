/**
 * MasterHydroQuebecPage.tsx — Stratégie Hydro-Québec × Efficience Énergétique × IA
 * Source: Bible-GHML-V2 Section 9.6
 * Master GHML — Session 48
 */

import {
  Zap, Building2, Leaf, BarChart3, Users, Target,
  TrendingUp, Settings, ArrowRight, DollarSign,
  Lightbulb, Layers,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA
// ======================================================================

const EVOLUTION = [
  { dim: "Budget", v1: "0,8 M$", v2: "Par projet" },
  { dim: "Humain vs IA", v1: "100% humain", v2: "80-95% IA" },
  { dim: "Délai", v1: "16-24 semaines", v2: "6-10 semaines" },
  { dim: "Approche", v1: "Promoteur requis", v2: "Prouver la valeur d'abord" },
];

const EEA_ROLES = [
  { role: "Stratégie énergétique", desc: "Feuille de route décarbonation" },
  { role: "Conformité ESG", desc: "Rapports, empreinte carbone, KPIs" },
  { role: "Interface HQ", desc: "Programmes PPIA, tarifs, GDP, RED, outils DEA/RETScreen/EXPLORE/INTEGRATION" },
  { role: "Veille réglementaire", desc: "Tarifs, programmes d'aide, carbone" },
];

const MULTI_AGENT_PALIERS = [
  {
    palier: "1", name: "Multi-perspective synthèse", sprint: "Sprint 7", lines: "~200", cost: "~0.30$/jour",
    desc: "CEO Bot dispatche à 2-3 agents en parallèle via asyncio.gather(), collecte les réponses, synthétise en UNE réponse multi-perspective en ~6-8 sec.",
    example: "Carl: « Évaluer migration AWS » → CTO (faisabilité) + CFO (impact financier) + COO (impact ops) → CEO synthèse"
  },
  {
    palier: "2", name: "Délégation fichiers et docs", sprint: "Sprint 8-9", lines: "~400", cost: "~1$/jour",
    desc: "Les agents créent des livrables concrets : Google Docs (business case), code, brouillons. Nouvel état : DELEGATION — Carl peut faire autre chose.",
    example: "Agent CTO génère un document d'architecture pendant que Carl continue à travailler"
  },
  {
    palier: "3", name: "War Room autonome", sprint: "Sprint 10+", lines: "~800", cost: "Capé $5-20/War Room",
    desc: "Carl lance un projet complet. Les agents se coordonnent 30-60 min. CEO orchestre, détecte conflits, livre résultat final testé.",
    example: "« Lance War Room AeroQuote » → CTO prototype, CFO business case, CSO go-to-market, CMO one-pager → 45 min → 4 livrables"
  },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterHydroQuebecPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Stratégie Hydro-Québec × IA + Multi-Agent"
        subtitle="EEA sub-agent + Flywheel énergétique + Roadmap Multi-Agent 3 paliers"
        gradient="from-cyan-700 to-blue-500"
        icon={<Zap className="h-5 w-5" />}
      />

      {/* ── Contexte ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Contexte — Usine Bleue Efficiente</h2>
        <p className="text-sm text-gray-600 mb-4">
          Le projet « Usine Bleue Efficiente » (mai 2025) proposait d'intégrer l'efficience énergétique et la gestion de la demande en pointe (GDP) dans le programme Usine Bleue du REAI. Alignement sur 4/5 priorités du Plan d'action 2035 d'Hydro-Québec.
        </p>
      </div>

      <SectionDivider />

      {/* ── Évolution V1 → V2 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Stratégie V1 (2025) → V2 (2026) : IA-First</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EVOLUTION.map((e) => (
            <Card key={e.dim} className="p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">{e.dim}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400">V1</p>
                  <p className="text-sm text-gray-600">{e.v1}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-cyan-500">V2</p>
                  <p className="text-sm font-medium text-gray-800">{e.v2}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── EEA Agent ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Energy Efficiency Agent (EEA) — Sous-Agent CTO</h2>
        <p className="text-sm text-gray-500 mb-4">
          L'EEA ajoute une dimension énergétique (kWh/unité, GDP, GES, RETScreen) à chaque analyse de productivité manufacturière. Position GHML : Groupe T, interactions S + P + H.
        </p>
        <div className="space-y-2">
          {EEA_ROLES.map((r) => (
            <Card key={r.role} className="p-3 flex items-start gap-3">
              <Zap className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{r.role}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── CESO Potentiel ── */}
      <div className="mb-8">
        <Card className="p-4 bg-cyan-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-cyan-600" />
            <h3 className="text-sm font-semibold text-gray-800">7e Agent Potentiel : CESO</h3>
          </div>
          <p className="text-xs text-gray-600">
            Si la collaboration HQ prend de l'ampleur, l'EEA est promu en agent C-Level autonome — le CESO (Chief Energy & Sustainability Officer), 7e membre du Brain Team. Responsable de la feuille de route décarbonation, conformité ESG, interface Hydro-Québec.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Visite SMART Énergétique ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Visite SMART Énergétique</h2>
        <Card className="p-4">
          <p className="text-sm text-gray-700 mb-2">
            Extension de la Visite SMART existante : diagnostic terrain combiné productivité (AM) + énergie (PM).
          </p>
          <p className="text-sm text-gray-700">
            Rapport automatisé incluant bilan énergétique et plan de décarbonation en <strong>15 minutes via IA</strong>.
          </p>
        </Card>
      </div>

      {/* ── Revenus ── */}
      <div className="mb-8">
        <Card className="p-4 bg-green-50/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-800">Modèle de Revenus Intégré</h3>
          </div>
          <p className="text-sm text-gray-700">
            Scénario 20 clients PME (12 mois) : revenus récurrents estimés <strong>~420 000 $/an</strong> + commissions projets.
          </p>
        </Card>
      </div>

      {/* ── Flywheel ── */}
      <div className="mb-8">
        <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Flywheel Énergétique GHML</h3>
          <p className="text-xs text-gray-700">
            Après 20 clients, le système dispose de <strong>benchmarks énergétiques sectoriels québécois</strong> qu'aucun consultant ne peut égaler. Chaque interaction manufacturier + énergie génère de nouveaux éléments GHML dans les 4 groupes (S, T, P, H). C'est la Bibliothèque d'Intelligence appliquée à l'énergie — avantage compétitif cumulatif et insurmontable.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Roadmap Multi-Agent 3 Paliers ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Roadmap Multi-Agent V3 — 3 Paliers</h2>
        <p className="text-sm text-gray-500 mb-4">
          Du « seul cerveau qui change de chapeau » au War Room autonome. Paradigme multi-agent adapté au business decision-making avec coût maîtrisé.
        </p>
        <div className="space-y-4">
          {MULTI_AGENT_PALIERS.map((p) => (
            <Card key={p.palier} className="overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-500 px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Palier {p.palier} — {p.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white text-xs">{p.sprint}</Badge>
                  <Badge className="bg-white/20 text-white text-xs">{p.cost}</Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-2">{p.desc}</p>
                <Card className="p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 font-mono">{p.example}</p>
                </Card>
                <p className="text-xs text-gray-400 mt-2">{p.lines} lignes de code</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Garde-fous War Room ── */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Garde-fous War Room (Palier 3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Budget cap par War Room ($5 défaut, $20 max)",
            "Timeout global (60 min défaut, 2h max)",
            "Vérification cohérence inter-agents à chaque tour",
            "Carl peut interrompre à tout moment (/stop)",
            "Log complet pour auditabilité",
          ].map((g, i) => (
            <Card key={i} className="p-2 flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600">{g}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : Bible-GHML-V2 Section 9.6 · usine-bleue-ai-hydro-quebec-strategie.docx ·
          CONSOLIDATION-STRATEGIE-HQ-2DESTINY · BTML-V3-Roadmap-MultiAgent (Anthropic Agent Teams)
        </p>
      </div>
    </PageLayout>
  );
}
