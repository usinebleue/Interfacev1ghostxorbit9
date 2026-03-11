/**
 * MasterTrainingPage.tsx — Entrainement Agents
 * Reference GHML: training data, SOUL files, documents, strategie d'acquisition de donnees.
 * Single scrollable page (no tabs): Vue d'ensemble, SOULs, Modules, Docs, Kits, Protocoles, Acquisition, Validation.
 */

import {
  GraduationCap, Brain, FileText, Users, Database, BookOpen,
  CheckCircle2, AlertCircle, Clock, ArrowRight, Server, Code2,
  Eye, Shield, Layers, Cpu, Target, BarChart3,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function StatusBadge({ status }: { status: "actif" | "brut" | "manquant" | "planifie" }) {
  const config = {
    actif: { label: "ACTIF", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    brut: { label: "BRUT", className: "bg-amber-100 text-amber-700 border-amber-200" },
    manquant: { label: "MANQUANT", className: "bg-red-100 text-red-700 border-red-200" },
    planifie: { label: "PLANIFIE", className: "bg-blue-100 text-blue-700 border-blue-200" },
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

// ======================================================================
// DATA — SOUL Files
// ======================================================================

interface SoulFile {
  code: string;
  role: string;
  name: string;
  chars: string;
  trisociation: string;
}

const SOUL_FILES: SoulFile[] = [
  { code: "CEOB", role: "CEO", name: "CarlOS", chars: "10,645", trisociation: "Bezos + Munger + Churchill" },
  { code: "CTOB", role: "CTO", name: "CTO", chars: "9,685", trisociation: "Musk + Curie + Vinci" },
  { code: "CFOB", role: "CFO", name: "CFO", chars: "9,426", trisociation: "Buffett + Munger + Franklin" },
  { code: "CMOB", role: "CMO", name: "CMO", chars: "9,408", trisociation: "Disney + Jobs/Blakely + Oprah" },
  { code: "CSOB", role: "CSO", name: "CSO", chars: "9,658", trisociation: "Sun Tzu + Thiel + Chanel" },
  { code: "COOB", role: "COO", name: "COO", chars: "9,712", trisociation: "Marc Aurele + Deming + Nightingale" },
  { code: "CPOB", role: "Factory", name: "Factory", chars: "40,327", trisociation: "Le plus gros SOUL file" },
  { code: "CHROB", role: "CHRO", name: "CHRO", chars: "15,060", trisociation: "" },
  { code: "CROB", role: "CRO", name: "CRO", chars: "14,405", trisociation: "" },
  { code: "CISOB", role: "CISO", name: "CISO", chars: "14,117", trisociation: "" },
  { code: "CLOB", role: "CLO", name: "CLO", chars: "15,003", trisociation: "" },
  { code: "CINOB", role: "CINO", name: "CINO", chars: "16,074", trisociation: "" },
];

// ======================================================================
// DATA — Operational Modules
// ======================================================================

interface OpModule {
  name: string;
  description: string;
}

const OP_MODULES: OpModule[] = [
  { name: "MOD-CEO.md", description: "Identite, delegation, 4 niveaux autonomie, 16 capacites" },
  { name: "MOD-CTO.md", description: "Architecture technique" },
  { name: "MOD-CFO.md", description: "Operations financieres" },
  { name: "MOD-CMO.md", description: "Strategie marche" },
  { name: "MOD-CSO.md", description: "Securite strategique" },
  { name: "MOD-COO.md", description: "Gestion operations" },
  { name: "NOYAU-GHML.md", description: "Framework GHML core" },
];

// ======================================================================
// DATA — Strategic Documents
// ======================================================================

interface StratDoc {
  title: string;
  description: string;
}

const STRAT_DOCS: StratDoc[] = [
  { title: "Bible Produit GhostX V2.1", description: "Source de verite produit" },
  { title: "Bible GHML V2 Officielle", description: "Framework proprietaire" },
  { title: "Architecture Globale", description: "Pipeline technique, 18 modules" },
  { title: "Fondations UX", description: "29 composants UI" },
  { title: "Roadmap V3.4", description: "D-001 a D-109 integrees" },
  { title: "Guide Nomenclature V1.0", description: "Conventions de nommage" },
  { title: "Capacites 6 Departements", description: "Specifications C-Level" },
  { title: "Journal Decisions", description: "D-001 a D-109" },
];

// ======================================================================
// DATA — Company Kits
// ======================================================================

interface CompanyKit {
  file: string;
  name: string;
  detail: string;
}

const COMPANY_KITS: CompanyKit[] = [
  { file: "usine-bleue.json", name: "Usine Bleue AI", detail: "Patient Zero, donnees completes" },
  { file: "alimentation-boreal.json", name: "Aliments Boreal", detail: "Demo primaire, 52-85 employes" },
  { file: "acier-plus.json", name: "Acier Plus Fabrication", detail: "180 employes, metal" },
];

// ======================================================================
// DATA — Protocols
// ======================================================================

interface Protocol {
  name: string;
  description: string;
}

const PROTOCOLS: Protocol[] = [
  { name: "dev-routine.md", description: "6 phases, 5 gates, 11 alertes rouges" },
  { name: "design-system.md", description: "189 lignes, standards UI exhaustifs" },
  { name: "protocol-carl.md", description: "3 protocoles (Sprint Start, Per Task, Deploy/End)" },
];

// ======================================================================
// DATA — Acquisition Strategy
// ======================================================================

interface DataAsset {
  label: string;
  detail: string;
}

const DATA_HAVE: DataAsset[] = [
  { label: "296 pages CREDO", detail: "Processus commercial complet" },
  { label: "58 fichiers mine-dor", detail: "Templates, CRM, prospection" },
  { label: "30+ company kits JSON", detail: "Donnees financieres + strategiques" },
  { label: "14.4 GB archives email", detail: "Non traite" },
  { label: "19 listes regionales", detail: "Prospection Quebec" },
];

const DATA_NEED: DataAsset[] = [
  { label: "Conversations reelles client-CarlOS", detail: "Pour fine-tuning" },
  { label: "Metriques d'usage", detail: "Sessions, duree, features" },
  { label: "Feedback structure clients Pioneer", detail: "NPS, CSAT" },
  { label: "Donnees operationnelles terrain", detail: "Manufacturier" },
  { label: "Benchmark concurrentiel SaaS B2B AI", detail: "" },
  { label: "Tests A/B sur outputs agents", detail: "" },
];

// ======================================================================
// DATA — Validation
// ======================================================================

interface ValidationCheck {
  label: string;
  detail: string;
}

const VALIDATION_CHECKS: ValidationCheck[] = [
  { label: "Test invariants", detail: "python3 test_invariants.py (14 SOULs? endpoints? tables?)" },
  { label: "Protocol tests", detail: "94/94 test_protocols.py passing" },
  { label: "Gemini sentinel", detail: "Pre/post flight checks (score >= 8/10)" },
  { label: "Cross-page audit", detail: "Coherence visuelle entre toutes les pages" },
  { label: "Carl approval", detail: "Gate manuelle sur chaque decision structurelle" },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterTrainingPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={GraduationCap}
          iconColor="text-teal-600"
          title="Entrainement Agents"
          subtitle="Training data, SOUL files, documents, strategie d'acquisition"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 1 — Vue d'Ensemble */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.1</span>Vue d'Ensemble</h3>

        <Card className="p-5 bg-gradient-to-br from-teal-50 to-white border border-teal-100 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-teal-800 mb-1">Corpus d'entrainement CarlOS / GhostX</div>
              <p className="text-xs text-gray-600">
                Tout ce qui nourrit l'intelligence des 12 agents : identites, modules, documents, donnees reelles, protocoles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: "14", label: "SOUL files actifs", sub: "206,152 chars total", icon: Brain, color: "teal" },
              { value: "7", label: "Modules operationnels", sub: "docs/operationnels/", icon: Cpu, color: "blue" },
              { value: "30+", label: "Company kits", sub: "clients/cahier/", icon: Database, color: "amber" },
              { value: "12+", label: "Docs strategiques", sub: "docs/", icon: FileText, color: "violet" },
              { value: "3", label: "Protocoles dev", sub: "memory/", icon: Shield, color: "emerald" },
            ].map((stat) => {
              const SIcon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-3 bg-white rounded-lg border border-teal-100">
                  <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                  <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                  <div className="text-[9px] font-medium text-gray-600">{stat.label}</div>
                  <div className="text-[9px] text-gray-400">{stat.sub}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — SOUL Files */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.2</span>SOUL Files — Identites Bot</h3>
          <StatusBadge status="actif" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          14 fichiers SOUL actifs (206,152 chars total) — chacun definit l'identite, le style et les regles de conduite d'un agent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOUL_FILES.map((soul) => (
            <Card key={soul.code} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-teal-700 font-mono">{soul.code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">{soul.role}</span>
                    {soul.name !== soul.role && (
                      <span className="text-[9px] text-gray-500">{soul.name}</span>
                    )}
                    <Badge variant="outline" className="text-[9px] font-medium ml-auto">
                      {soul.chars} chars
                    </Badge>
                  </div>
                  {soul.trisociation && (
                    <div className="text-[9px] text-gray-500 mt-0.5 truncate">{soul.trisociation}</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-gray-50 border-gray-200 mt-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-400" />
            <code className="text-[9px] font-mono text-gray-600">/home/deploy/.openclaw/workspace-*/SOUL.md</code>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Modules Operationnels */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.3</span>Modules Operationnels</h3>
          <StatusBadge status="actif" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          7 modules charges dynamiquement par context_builder.py — definissent les capacites operationnelles de chaque bot.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {OP_MODULES.map((mod) => (
              <div key={mod.name} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <Cpu className="h-4 w-4 text-blue-500 shrink-0" />
                <code className="text-xs font-mono font-bold text-gray-800 min-w-[140px]">{mod.name}</code>
                <span className="text-xs text-gray-500">{mod.description}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-gray-50 border-gray-200 mt-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-400" />
            <code className="text-[9px] font-mono text-gray-600">/home/deploy/brain-dev/docs/operationnels/</code>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Documents Strategiques */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.4</span>Documents Strategiques</h3>
          <StatusBadge status="actif" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          12+ documents de reference — source de verite pour le produit, l'architecture, l'UX et les decisions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STRAT_DOCS.map((doc) => (
            <Card key={doc.title} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-700">{doc.title}</div>
                  <p className="text-[9px] text-gray-500 mt-0.5">{doc.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Company Kits */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.5</span>Company Kits — Training Data Reel</h3>
          <StatusBadge status="actif" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          30+ company kits JSON — donnees financieres et strategiques d'entreprises reelles injectees dans le contexte LLM.
        </p>

        <div className="space-y-3">
          {/* Primary kits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {COMPANY_KITS.map((kit) => (
              <Card key={kit.file} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <Database className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <code className="text-xs font-mono font-bold text-gray-800">{kit.file}</code>
                    <div className="text-xs text-gray-700 mt-1">{kit.name}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{kit.detail}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Additional data */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="space-y-2">
              {[
                { label: "11 profils entreprises reelles Quebec", detail: "Saputo, Couche-Tard, Premier Tech, WSP, etc." },
                { label: "19 mega-prompts par entreprise", detail: "Generes pour chaque company kit" },
                { label: "8 deep research files", detail: "Analyses approfondies par entreprise" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                  <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                  <span className="text-[9px] text-gray-400 ml-auto">{item.detail}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-gray-400" />
              <code className="text-[9px] font-mono text-gray-600">/home/deploy/brain-dev/clients/cahier/</code>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 6 — Protocoles de Developpement */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.6</span>Protocoles de Developpement</h3>
          <StatusBadge status="actif" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          3 protocoles qui encadrent chaque session de travail — zero improvisation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROTOCOLS.map((proto) => (
            <Card key={proto.name} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <code className="text-xs font-mono font-bold text-gray-800">{proto.name}</code>
                  <p className="text-[9px] text-gray-500 mt-1">{proto.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-gray-50 border-gray-200 mt-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-400" />
            <code className="text-[9px] font-mono text-gray-600">/home/deploy/brain-dev/memory/</code>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Strategie d'Acquisition de Donnees */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.7</span>Strategie d'Acquisition de Donnees</h3>
        <p className="text-xs text-gray-400 mb-4">
          Ce qu'on a vs ce qu'il manque pour atteindre la qualite de reponse Pioneer-Ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HAVE */}
          <Card className="p-0 overflow-hidden bg-white border border-emerald-200 shadow-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Donnees Acquises</span>
                <StatusBadge status="actif" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {DATA_HAVE.map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                      {item.detail && (
                        <span className="text-[9px] text-gray-400 ml-1.5">({item.detail})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* NEED */}
          <Card className="p-0 overflow-hidden bg-white border border-red-200 shadow-sm">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Donnees Manquantes</span>
                <StatusBadge status="manquant" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {DATA_NEED.map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                      {item.detail && (
                        <span className="text-[9px] text-gray-400 ml-1.5">({item.detail})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 8 — Validation des Outputs */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">D.2.8</span>Validation des Outputs</h3>
        <p className="text-xs text-gray-400 mb-4">
          Comment tester et valider les reponses des agents CarlOS — 5 niveaux de verification.
        </p>

        <div className="space-y-2">
          {VALIDATION_CHECKS.map((check, i) => (
            <Card key={check.label} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                  i === 0 ? "bg-blue-100 text-blue-700" :
                  i === 1 ? "bg-emerald-100 text-emerald-700" :
                  i === 2 ? "bg-amber-100 text-amber-700" :
                  i === 3 ? "bg-violet-100 text-violet-700" :
                  "bg-teal-100 text-teal-700"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800">{check.label}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{check.detail}</div>
                </div>
                <StatusBadge status="actif" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-start gap-2">
            <Eye className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-blue-700 mb-1">Pipeline de validation</div>
              <div className="text-[9px] text-blue-600 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>Invariants automatiques (SOULs, endpoints, tables) avant chaque deploy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>Gemini sentinel pre/post flight sur chaque reponse (score &gt;= 8/10)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>Carl = gate finale — zero decision structurelle sans son GO</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Quick Stats */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "SOUL Files", value: "14", icon: Brain, color: "teal" },
            { label: "Chars Total", value: "206K", icon: Code2, color: "blue" },
            { label: "Company Kits", value: "30+", icon: Database, color: "amber" },
            { label: "Tests Passing", value: "94/94", icon: Target, color: "emerald" },
          ].map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
                <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
