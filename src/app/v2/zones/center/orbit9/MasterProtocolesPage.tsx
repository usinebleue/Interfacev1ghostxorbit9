/**
 * MasterProtocolesPage.tsx — Protocoles & Acronymes
 * Atlas complet de chaque protocole, acronyme, framework utilise dans GhostX/CarlOS
 * avec leurs interrelations. 85+ protocoles documentes, P-001 a P-650.
 * Single scrollable page (no tabs): hierarchy levels 1-7 + interrelations + terminologie.
 */

import {
  ScrollText, Zap, Brain, Target, Shield, Network, Layers, ArrowRight,
  CheckCircle2, AlertCircle, Clock, Code2, BookOpen, Compass, GitBranch,
  Eye, Radio, Users, DollarSign, Star, Atom, Sparkles, FileText,
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

function StatusBadge({ status }: { status: "actif" | "partiel" | "planifie" | "conceptuel" }) {
  const config = {
    actif: { label: "ACTIF", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    partiel: { label: "PARTIEL", className: "bg-blue-100 text-blue-600 border-blue-200" },
    planifie: { label: "PLANIFIE", className: "bg-amber-100 text-amber-700 border-amber-200" },
    conceptuel: { label: "CONCEPTUEL", className: "bg-gray-100 text-gray-500 border-gray-200" },
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
// DATA — 12 Ghosts
// ======================================================================

const GHOSTS = [
  { id: "G1", name: "Bezos", archetype: "Systemiste", color: "blue" },
  { id: "G2", name: "Jobs", archetype: "Designer", color: "violet" },
  { id: "G3", name: "Musk", archetype: "Executeur", color: "red" },
  { id: "G4", name: "Sun Tzu", archetype: "Stratege", color: "amber" },
  { id: "G5", name: "Munger", archetype: "Inverseur", color: "emerald" },
  { id: "G6", name: "Marc Aurele", archetype: "Stoique", color: "gray" },
  { id: "G7", name: "Churchill", archetype: "Mobilisateur", color: "indigo" },
  { id: "G8", name: "Disney", archetype: "Reveur", color: "pink" },
  { id: "G9", name: "Tesla", archetype: "Resonateur (3-6-9)", color: "yellow" },
  { id: "G10", name: "Buffett", archetype: "Compositeur", color: "green" },
  { id: "G11", name: "Curie", archetype: "Pionniere", color: "cyan" },
  { id: "G12", name: "Oprah", archetype: "Amplificatrice", color: "orange" },
];

// ======================================================================
// DATA — 8+1 Modes
// ======================================================================

const MODES = [
  { num: 1, name: "Debat", ref: "P-121", method: "Dialectique + 6 Chapeaux De Bono", icon: Users, color: "blue", status: "actif" as const },
  { num: 2, name: "Brainstorm", ref: "P-122", method: "Walt Disney + 18 outils creatifs", icon: Sparkles, color: "violet", status: "actif" as const },
  { num: 3, name: "Crise", ref: "P-123", method: "OODA Loop (Observe-Orient-Decide-Act)", icon: AlertCircle, color: "red", status: "actif" as const },
  { num: 4, name: "Analyse", ref: "P-124", method: "5 Pourquoi + Ishikawa", icon: Eye, color: "emerald", status: "actif" as const },
  { num: 5, name: "Decision", ref: "P-125", method: "6 Chapeaux + Regret Bezos", icon: Target, color: "amber", status: "actif" as const },
  { num: 6, name: "Strategie", ref: "P-126", method: "SWOT + 3 Horizons", icon: Compass, color: "indigo", status: "actif" as const },
  { num: 7, name: "Innovation", ref: "P-127", method: "Bisociation Koestler (Distance x Profondeur x Harmonie)", icon: Atom, color: "pink", status: "actif" as const },
  { num: 8, name: "Deep Resonance", ref: "P-128", method: "Spirale Socratique", icon: Brain, color: "cyan", status: "actif" as const },
  { num: 9, name: "Mode 9 GhostX", ref: "P-129", method: "Emulation cognitive complete, skin de personnalite", icon: Star, color: "orange", status: "actif" as const },
];

// ======================================================================
// DATA — Renamed terms
// ======================================================================

const RENAMED_TERMS = [
  { old: "BTML", newTerm: "GHML (Ghost Modeling Language)", reason: "Rebranding framework proprietaire" },
  { old: "Brain Team", newTerm: "GhostX Team", reason: "Alignement marque" },
  { old: "BPO (Philippe)", newTerm: "Supprime (intrus)", reason: "N'existe pas dans la plateforme" },
  { old: "BCC (Catherine)", newTerm: "Supprime (intrus)", reason: "N'existe pas dans la plateforme" },
  { old: "CIO Isabelle", newTerm: "CINO Ines (renomme S42)", reason: "Correction role + persona" },
  { old: "Twilio", newTerm: "Telnyx (migration D-097)", reason: "Migration telephonie" },
  { old: "8 Modes", newTerm: "8+1 Modes (ajout Mode 9 GhostX)", reason: "Ajout emulation cognitive" },
];

// ======================================================================
// DATA — Interrelation flows
// ======================================================================

const FLOWS = [
  {
    theme: "Cycle Conversationnel",
    color: "blue",
    icon: Compass,
    flows: [
      "CREDO (centre) \u2192 alimente \u2192 8+1 Modes, VITAA, Bilan Sante, PHASE_TONE",
    ],
  },
  {
    theme: "Fondation GHML",
    color: "violet",
    icon: Atom,
    flows: [
      "GHML (fondation) \u2192 structure \u2192 Tableau Periodique, Trisociation, 12 Ghosts",
    ],
  },
  {
    theme: "Diagnostic",
    color: "emerald",
    icon: Target,
    flows: [
      "VITAA \u2192 diagnostic \u2192 Triangle du Feu \u2192 Bilan de Sante \u2192 Orbit9 Matching",
    ],
  },
  {
    theme: "Orchestration",
    color: "amber",
    icon: Network,
    flows: [
      "COMMAND \u2192 orchestre \u2192 Chef d'Orchestre \u2192 12 Bots C-Level",
    ],
  },
  {
    theme: "Protection",
    color: "red",
    icon: Shield,
    flows: [
      "Sentinel + VERITE \u2192 protegent \u2192 tous les outputs",
    ],
  },
  {
    theme: "Gouvernance",
    color: "indigo",
    icon: Users,
    flows: [
      "Orbit9 \u2192 gouverne \u2192 TimeTokens, Decision Log, Permission Codes",
    ],
  },
  {
    theme: "Optimisation Couts",
    color: "green",
    icon: DollarSign,
    flows: [
      "5-Tier Routing \u2192 optimise \u2192 couts API (T0 \u2192 T4)",
    ],
  },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterProtocolesPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={ScrollText}
          iconColor="text-violet-600"
          title="Protocoles & Acronymes"
          subtitle="Atlas complet — protocoles, frameworks, interrelations GhostX/CarlOS"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 1 — Vue d'Ensemble */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Vue d'Ensemble</h3>

        <Card className="p-5 bg-gradient-to-br from-violet-50 to-white border border-violet-100 shadow-sm">
          <div className="text-center mb-5">
            <p className="text-sm font-bold text-gray-800">
              85+ protocoles documentes — 104 dans l'arbre (P-001 a P-650)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Framework GHML complet : de la conversation au scoring, du diagnostic a la gouvernance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Protocoles Level 1-2", value: "16", subtext: "Core engine", icon: Layers, color: "violet" },
              { label: "Modes de reflexion", value: "12", subtext: "8+1 + variantes", icon: Brain, color: "blue" },
              { label: "Ghosts cognitifs", value: "12", subtext: "Modeles mentaux", icon: Star, color: "amber" },
              { label: "Endpoints API", value: "128", subtext: "FastAPI REST", icon: Code2, color: "emerald" },
            ].map((stat) => {
              const SIcon = stat.icon;
              return (
                <div key={stat.label} className="p-3 bg-white rounded-lg border border-gray-100 text-center">
                  <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                  <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                  <div className="text-[9px] text-gray-400">{stat.subtext}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[
              { label: "Frameworks business", value: "8", subtext: "Razor, SMART, LEGACY...", icon: FileText, color: "pink" },
              { label: "SOUL templates", value: "14", subtext: "206,152 chars total", icon: BookOpen, color: "indigo" },
              { label: "Elements periodiques", value: "232", subtext: "4 groupes S/P/T/H", icon: Atom, color: "cyan" },
              { label: "Triades possibles", value: "6,545", subtext: "C(35,3) futurs", icon: Sparkles, color: "orange" },
            ].map((stat) => {
              const SIcon = stat.icon;
              return (
                <div key={stat.label} className="p-3 bg-white rounded-lg border border-gray-100 text-center">
                  <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                  <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                  <div className="text-[9px] text-gray-400">{stat.subtext}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — Protocoles Maitres (Level 1) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Protocoles Maitres (Level 1) — CORE</h3>
        <p className="text-xs text-gray-400 mb-4">
          Les 3 fondations sur lesquelles tout le systeme repose.
        </p>

        <div className="space-y-4">
          {/* CREDO */}
          <Card className="p-0 overflow-hidden bg-white border-l-4 border-l-blue-500 border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Compass className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">CREDO</span>
                    <Badge variant="outline" className="text-[9px]">Protocole maitre</Badge>
                    <StatusBadge status="actif" />
                  </div>
                  <p className="text-[9px] text-gray-500">Connecter &rarr; Rechercher &rarr; Exposer &rarr; Demontrer &rarr; Obtenir</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3">
                Framework 5 phases qui structure chaque conversation. Chaque phase a 3 lectures simultanees : Bouche (Vente), Cerveau (Ideation), Coeur (Coaching).
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {["Connecter", "Rechercher", "Exposer", "Demontrer", "Obtenir"].map((phase, i) => (
                  <div key={phase} className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">{phase}</span>
                    {i < 4 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Connecte a</div>
                  <p className="text-[9px] text-gray-600">P-117 Routeur Inverse, P-116 Calibration Herrmann, P-118 Arsenal Humour, P-380 PHASE_TONE</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Code source</div>
                  <code className="text-[9px] font-mono text-gray-600">session_credo.py (7,889 lignes)</code>
                </div>
              </div>
            </div>
          </Card>

          {/* GHML */}
          <Card className="p-0 overflow-hidden bg-white border-l-4 border-l-violet-500 border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Atom className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">GHML</span>
                    <Badge variant="outline" className="text-[9px]">Framework proprietaire</Badge>
                    <StatusBadge status="actif" />
                  </div>
                  <p className="text-[9px] text-gray-500">Ghost Modeling Language (anciennement BTML)</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3">
                Modelise l'intelligence d'affaires comme la chimie modelise la matiere. 232 elements periodiques, 5 piliers VITAA, 12 Ghosts, Trisociation.
              </p>

              <div className="flex items-center gap-2 mb-3 p-2 bg-violet-50 rounded-lg border border-violet-100">
                <Code2 className="h-4 w-4 text-violet-500 shrink-0" />
                <span className="text-xs font-bold text-violet-700">Formule : Gh(O&#x2081;&middot;O&#x2082;&middot;O&#x2083;)STX</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-gray-50 rounded">
                  <code className="text-[9px] font-mono text-gray-600">tableau_periodique.py</code>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <code className="text-[9px] font-mono text-gray-600">piliers_aiavt.py</code>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <code className="text-[9px] font-mono text-gray-600">ghostx_wrapper.py</code>
                </div>
              </div>
            </div>
          </Card>

          {/* VITAA / AIAVT */}
          <Card className="p-0 overflow-hidden bg-white border-l-4 border-l-emerald-500 border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">VITAA / AIAVT</span>
                    <Badge variant="outline" className="text-[9px]">Diagnostic + Scoring</Badge>
                    <StatusBadge status="actif" />
                  </div>
                  <p className="text-[9px] text-gray-500">Vente &middot; Idee &middot; Temps &middot; Argent &middot; Actif</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3">
                5 piliers scores de 0 a 100 chacun. Triangle du Feu : BRULE (3+ piliers actifs) / COUVE (2) / MEURT (1 ou 0).
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "Vente", color: "bg-emerald-100 text-emerald-700" },
                  { label: "Idee", color: "bg-blue-100 text-blue-700" },
                  { label: "Temps", color: "bg-amber-100 text-amber-700" },
                  { label: "Argent", color: "bg-red-100 text-red-700" },
                  { label: "Actif", color: "bg-violet-100 text-violet-700" },
                ].map((p) => (
                  <span key={p.label} className={cn("text-[9px] font-bold px-2 py-1 rounded", p.color)}>{p.label}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Connecte a</div>
                  <p className="text-[9px] text-gray-600">Bilan de Sante (P-320), Tableau Periodique, Orbit9 Matching</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Code source</div>
                  <code className="text-[9px] font-mono text-gray-600">piliers_aiavt.py</code>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Composition Agents (Level 2) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Composition Agents (Level 2)</h3>

        {/* Trisociation */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <GitBranch className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">Trisociation&#8482;</span>
                <StatusBadge status="actif" />
              </div>
              <p className="text-[9px] text-gray-500">3 OS combines par bot — Primaire + Calibrateur + Amplificateur</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">Exemple BCO (CEO)</div>
              <p className="text-xs text-gray-600">Bezos (Primaire) + Munger (Calibrateur) + Churchill (Amplificateur)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Code source</div>
              <code className="text-xs font-mono text-gray-600">ghostx_wrapper.py (315 lignes)</code>
            </div>
          </div>
        </Card>

        {/* 12 Ghosts Grid */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">12 Ghosts — Modeles cognitifs</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {GHOSTS.map((ghost) => (
              <div key={ghost.id} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-100">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", `bg-${ghost.color}-100 text-${ghost.color}-700`)}>{ghost.id}</span>
                <div>
                  <div className="text-xs font-bold text-gray-700">{ghost.name}</div>
                  <div className="text-[9px] text-gray-500">{ghost.archetype}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 p-2 bg-violet-50 rounded-lg border border-violet-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <span className="text-[9px] text-violet-700 font-medium">Vision : 36 OS futurs &rarr; C(35,3) = 6,545 triades possibles</span>
            </div>
          </div>
        </div>

        {/* SOUL Templates */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-bold text-gray-700">SOUL Templates</span>
            <StatusBadge status="actif" />
          </div>
          <p className="text-xs text-gray-600 mb-2">Identite de chaque bot — injectes via Anthropic prompt caching (90% economie tokens).</p>
          <div className="flex gap-3">
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Fichiers actifs</span>
              <div className="text-sm font-bold text-gray-800">14</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Total chars</span>
              <div className="text-sm font-bold text-gray-800">206,152</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Chemin</span>
              <code className="text-[9px] font-mono text-gray-600">~/.openclaw/workspace-*/SOUL.md</code>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Modes de Reflexion (8+1 Modes) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Modes de Reflexion (8+1 Modes)</h3>
        <p className="text-xs text-gray-400 mb-4">
          Outils cognitifs utilises DANS le cycle CREDO — pas l'inverse. Le mode est selectionne par le routeur selon le contenu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODES.map((mode) => {
            const ModeIcon = mode.icon;
            return (
              <Card key={mode.num} className="p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", `bg-${mode.color}-100`)}>
                    <ModeIcon className={cn("h-3.5 w-3.5", `text-${mode.color}-600`)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-800">{mode.num}. {mode.name}</span>
                      <StatusBadge status={mode.status} />
                    </div>
                    <Badge variant="outline" className="text-[9px] mt-0.5">{mode.ref}</Badge>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 leading-relaxed">{mode.method}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Routage & Classification (Level 3) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Routage & Classification (Level 3)</h3>

        {/* 5-Tier Routing */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold text-gray-700">5-Tier Routing (T0-T4)</span>
            <Badge variant="outline" className="text-[9px]">Optimisation cout</Badge>
            <StatusBadge status="actif" />
          </div>

          <div className="space-y-2 mb-3">
            {[
              { tier: "T0", name: "Regex/Cache", pct: "30-40%", cost: "Gratuit", color: "bg-emerald-500" },
              { tier: "T1", name: "Gemini Flash", pct: "~30%", cost: "Gratuit", color: "bg-emerald-400" },
              { tier: "T2", name: "Gemini Pro", pct: "~20%", cost: "Gratuit", color: "bg-amber-400" },
              { tier: "T3", name: "Claude Sonnet", pct: "~15%", cost: "$0.01-0.05/req", color: "bg-orange-400" },
              { tier: "T4", name: "Claude Opus", pct: "~5%", cost: "$0.15-0.60/req", color: "bg-red-400" },
            ].map((t) => (
              <div key={t.tier} className="flex items-center gap-3">
                <span className={cn("text-white font-bold text-[9px] px-2 py-0.5 rounded min-w-[28px] text-center", t.color)}>
                  {t.tier}
                </span>
                <span className="text-xs text-gray-700 min-w-[100px]">{t.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", t.color)}
                    style={{ width: t.pct.replace("~", "").replace("%", "") + "%" }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 min-w-[40px] text-right">{t.pct}</span>
                <span className="text-[9px] text-gray-400 min-w-[80px] text-right">{t.cost}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-emerald-50 rounded border border-emerald-100">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-[9px] text-emerald-700 font-medium">Budget cible : 0.50-2$/jour par client</span>
          </div>
        </Card>

        {/* COMMAND Protocol */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">COMMAND Protocol</span>
            <Badge variant="outline" className="text-[9px]">D-091</Badge>
            <StatusBadge status="actif" />
          </div>
          <p className="text-xs text-gray-600 mb-3">Orchestration de missions — 4 etages d'execution.</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {["CommandLive", "CommandCompiler", "CommandDetector", "Mission Execution"].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">{step}</span>
                {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="p-2 bg-gray-50 rounded">
              <code className="text-[9px] font-mono text-gray-600">command_missions</code>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <code className="text-[9px] font-mono text-gray-600">compiled_briefings</code>
            </div>
          </div>
        </Card>

        {/* VERITE Protocol */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-gray-700">VERITE Protocol</span>
            <Badge variant="outline" className="text-[9px]">Validation I/O</Badge>
            <StatusBadge status="actif" />
          </div>
          <p className="text-xs text-gray-600 mb-3">Double gate : validation des entrees ET des sorties.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">INPUT Gate</div>
              <p className="text-xs text-gray-600">prompt_scaffold.py (Ancrage / Intention / Contraintes)</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide mb-1">OUTPUT Gate</div>
              <p className="text-xs text-gray-600">sentinel_qc.py (verification structurelle + grounding Gemini)</p>
            </div>
          </div>
        </Card>

        {/* Sentinel Protocol */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-gray-700">Sentinel Protocol</span>
            <Badge variant="outline" className="text-[9px]">P-250</Badge>
            <StatusBadge status="actif" />
          </div>
          <p className="text-xs text-gray-600 mb-2">Anti-hallucination + detection de boucles et patterns destructeurs.</p>
          <div className="space-y-1">
            {[
              "Detecte : repetition, sur-challenge, threads longs, branching profond",
              "Auto-suggest cristallisation quand le thread depasse les limites",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 6 — Communication & Interaction (Level 4) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Communication & Interaction (Level 4)</h3>

        <div className="space-y-3">
          {/* Routeur Inverse */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-bold text-gray-700">Routeur Inverse&#8482;</span>
              <Badge variant="outline" className="text-[9px]">P-117</Badge>
              <StatusBadge status="partiel" />
            </div>
            <p className="text-xs text-gray-600 italic mb-2">"Qui pose les questions controle la conversation"</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "Carte Empathie", "4 Types Clients (R/J/B/V)", "11 Types Questions", "Strategie Bi-Axiale",
                "10 Pratiques Ecoute", "3 Capacites Empathiques", "Lecture Non-Verbale", "SAC+COINS",
              ].map((comp) => (
                <div key={comp} className="p-1.5 bg-violet-50 rounded text-center">
                  <span className="text-[9px] text-violet-700 font-medium">{comp}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Calibration Herrmann */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold text-gray-700">Calibration Herrmann</span>
              <Badge variant="outline" className="text-[9px]">P-116</Badge>
              <StatusBadge status="partiel" />
            </div>
            <p className="text-xs text-gray-600 mb-2">4 profils de communication — calibration en 3 sources.</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: "Emotionnel", color: "bg-red-100 text-red-700" },
                { label: "Analytique", color: "bg-blue-100 text-blue-700" },
                { label: "Creatif", color: "bg-yellow-100 text-yellow-700" },
                { label: "Organise", color: "bg-green-100 text-green-700" },
              ].map((p) => (
                <span key={p.label} className={cn("text-[9px] font-bold px-2 py-1 rounded", p.color)}>{p.label}</span>
              ))}
            </div>
            <p className="text-[9px] text-gray-500">3 sources : Explicite, Implicite, Comportementale</p>
          </Card>

          {/* Arsenal Humour */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-bold text-gray-700">Arsenal Humour</span>
              <Badge variant="outline" className="text-[9px]">P-118</Badge>
              <StatusBadge status="partiel" />
            </div>
            <p className="text-xs text-gray-600">6 procedures + 6 couleurs d'humour adaptes au profil Herrmann du client.</p>
          </Card>

          {/* PHASE_TONE */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ScrollText className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-gray-700">PHASE_TONE</span>
              <Badge variant="outline" className="text-[9px]">P-380</Badge>
              <StatusBadge status="planifie" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Adaptation automatique du ton par phase CREDO.</p>
            <div className="flex flex-wrap gap-2">
              {[
                { phase: "C", tone: "Chaleureux", color: "bg-blue-100 text-blue-700" },
                { phase: "R", tone: "Analytique", color: "bg-emerald-100 text-emerald-700" },
                { phase: "E", tone: "Energique", color: "bg-amber-100 text-amber-700" },
                { phase: "D", tone: "Confiant", color: "bg-violet-100 text-violet-700" },
                { phase: "O", tone: "Action", color: "bg-red-100 text-red-700" },
              ].map((t) => (
                <span key={t.phase} className={cn("text-[9px] font-bold px-2 py-1 rounded", t.color)}>
                  {t.phase} = {t.tone}
                </span>
              ))}
            </div>
          </Card>

          {/* CAB */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-gray-700">CAB</span>
              <Badge variant="outline" className="text-[9px]">Framework argumentaire</Badge>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600">Caracteristique &rarr; Avantage &rarr; Benefice — framework argumentaire commercial standard.</p>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Diagnostic & Analyse (Level 5) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Diagnostic & Analyse (Level 5)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Bilan de Sante */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Bilan de Sante</span>
              <Badge variant="outline" className="text-[9px]">P-320</Badge>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Diagnostic d'accueil en 4 phases.</p>
            <div className="space-y-1">
              {["Hook", "Exploration (DATA_GRID 25 points)", "Validation", "Prescription"].map((phase, i) => (
                <div key={phase} className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-blue-500 min-w-[12px]">{i + 1}.</span>
                  <span className="text-[9px] text-gray-600">{phase}</span>
                </div>
              ))}
            </div>
            <code className="text-[9px] font-mono text-gray-500 mt-2 block">bridge_questionnaire.py (1,909 lignes)</code>
          </Card>

          {/* Triangle du Feu */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-gray-700">Triangle du Feu</span>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Indicateur sante base sur les piliers VITAA.</p>
            <div className="space-y-1.5">
              {[
                { label: "BRULE", desc: "3+ piliers actifs", color: "bg-red-100 text-red-700" },
                { label: "COUVE", desc: "2 piliers actifs", color: "bg-amber-100 text-amber-700" },
                { label: "MEURT", desc: "1 ou 0 pilier actif", color: "bg-gray-100 text-gray-500" },
              ].map((state) => (
                <div key={state.label} className="flex items-center gap-2">
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded min-w-[55px] text-center", state.color)}>{state.label}</span>
                  <span className="text-[9px] text-gray-600">{state.desc}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tableau Periodique */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Atom className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-bold text-gray-700">Tableau Periodique</span>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">232 elements proprietaires GHML.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { group: "[S]", name: "Savoir", color: "bg-blue-100 text-blue-700" },
                { group: "[P]", name: "Pratique", color: "bg-emerald-100 text-emerald-700" },
                { group: "[T]", name: "Technologie", color: "bg-amber-100 text-amber-700" },
                { group: "[H]", name: "Humain", color: "bg-pink-100 text-pink-700" },
              ].map((g) => (
                <div key={g.group} className="flex items-center gap-1.5">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", g.color)}>{g.group}</span>
                  <span className="text-[9px] text-gray-600">{g.name}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-2">7 periodes + 3 etats (Gaz/Liquide/Solide)</p>
          </Card>

          {/* Chef d'Orchestre */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold text-gray-700">Chef d'Orchestre</span>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Proposition automatique d'equipe 3 bots + scoring engine.</p>
            <div className="flex flex-wrap gap-1.5">
              {["Nuancer", "Fil parallele", "Plan d'action", "Risques", "Et si?", "Deleguer", "Fusionner"].map((btn) => (
                <span key={btn} className="text-[9px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">{btn}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 8 — Economie & Gouvernance (Level 6) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Economie & Gouvernance (Level 6)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Orbit9 */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Orbit9</span>
              <Badge variant="outline" className="text-[9px]">Developpement economique</Badge>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Holacratic circles (max 9), 101 elements checklist, Matching engine, TimeTokens.</p>
            <div className="flex gap-2">
              <div className="p-1.5 bg-gray-50 rounded text-center">
                <div className="text-sm font-bold text-gray-800">3</div>
                <div className="text-[9px] text-gray-500">tables</div>
              </div>
              <div className="p-1.5 bg-gray-50 rounded text-center">
                <div className="text-sm font-bold text-gray-800">15</div>
                <div className="text-[9px] text-gray-500">endpoints</div>
              </div>
            </div>
          </Card>

          {/* TimeTokens */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-gray-700">TimeTokens (TT)</span>
              <Badge variant="outline" className="text-[9px]">Unite valeur</Badge>
              <StatusBadge status="conceptuel" />
            </div>
            <p className="text-xs text-gray-600">Modele Slicing Pie, formule TT-RG. Unite de valeur pour la collaboration dans l'ecosysteme Orbit9.</p>
          </Card>

          {/* Decision Log */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-700">Decision Log</span>
              <Badge variant="outline" className="text-[9px]">D-098</Badge>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Tracabilite de toutes les decisions projet.</p>
            <p className="text-[9px] text-gray-500">Table decision_log + 4 endpoints CRUD + /reverse</p>
          </Card>

          {/* Permission Codes */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-gray-700">Permission Codes</span>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Niveaux d'acces progressifs.</p>
            <div className="flex flex-wrap gap-2">
              {["READ_ONLY", "SUBMISSION", "FULL_MANDATE"].map((perm) => (
                <span key={perm} className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{perm}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 9 — Frameworks Business (Level 7) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Frameworks Business (Level 7)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Razor & Blade */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-700">Razor & Blade</span>
              <Badge variant="outline" className="text-[9px]">Pricing strategy</Badge>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Modele de prix a 2 niveaux.</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Razor</span>
                <span className="text-xs text-gray-600">CarlOS Solo 500$/mois</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Blades</span>
                <span className="text-xs text-gray-600">+195$/bot additionnel</span>
              </div>
            </div>
          </Card>

          {/* SMART / CPRJ */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">SMART / CPRJ</span>
              <Badge variant="outline" className="text-[9px]">Cahier de Projet</Badge>
              <StatusBadge status="actif" />
            </div>
            <p className="text-xs text-gray-600 mb-2">6 sections (S00-S05), pipeline complete de creation de projet.</p>
            <div className="flex flex-wrap gap-1.5">
              {["S00 Init", "S01 Diagnostic", "S02 Strategie", "S03 Plan", "S04 Execution", "S05 Bilan"].map((s) => (
                <span key={s} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">{s}</span>
              ))}
            </div>
          </Card>

          {/* LEGACY Module */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700">LEGACY Module</span>
              <Badge variant="outline" className="text-[9px]">Heritage cognitif</Badge>
              <StatusBadge status="conceptuel" />
            </div>
            <p className="text-xs text-gray-600 mb-2">Heritage cognitif du fondateur — 5 sous-composants.</p>
            <div className="space-y-1">
              {["Questionnaire", "Architecture 3 couches", "Mapping", "Chromosome X", "Multi-Gen"].map((comp) => (
                <div key={comp} className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-[9px] text-gray-600">{comp}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* GPI-50 */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700">GPI-50</span>
              <Badge variant="outline" className="text-[9px]">Index benchmark</Badge>
              <StatusBadge status="conceptuel" />
            </div>
            <p className="text-xs text-gray-600">50 entreprises publiques scorees avec les piliers VITAA. Benchmark de reference pour les PME.</p>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 10 — Carte des Interrelations */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Carte des Interrelations</h3>
        <p className="text-xs text-gray-400 mb-4">
          Comment les protocoles se connectent entre eux — groupes par theme.
        </p>

        <div className="space-y-3">
          {FLOWS.map((flow) => {
            const FlowIcon = flow.icon;
            return (
              <Card key={flow.theme} className="p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", `bg-${flow.color}-100`)}>
                    <FlowIcon className={cn("h-4 w-4", `text-${flow.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 mb-1">{flow.theme}</div>
                    {flow.flows.map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <GitBranch className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 11 — Termes Qui Ont Change */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Termes Qui Ont Change</h3>
        <p className="text-xs text-gray-400 mb-4">
          Historique des renommages et suppressions terminologiques.
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Ancien</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Nouveau</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Raison</span>
          </div>

          <div className="divide-y divide-gray-50">
            {RENAMED_TERMS.map((term) => (
              <div
                key={term.old}
                className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2.5 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span className="text-xs text-gray-500 line-through">{term.old}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-medium text-gray-700">{term.newTerm}</span>
                </div>
                <span className="text-[9px] text-gray-500">{term.reason}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Summary Stats */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Protocoles actifs", value: "45+", subtext: "En production", color: "emerald" },
            { label: "Protocoles partiels", value: "12", subtext: "En developpement", color: "blue" },
            { label: "Protocoles planifies", value: "15+", subtext: "Sprint C/D", color: "amber" },
            { label: "Conceptuels", value: "13+", subtext: "Vision long terme", color: "gray" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-lg font-bold", `text-${stat.color}-600`)}>{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
              <div className="text-[9px] text-gray-400">{stat.subtext}</div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
